import { RssItem, RankedNewsItem } from '../shared/schema';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import { storage } from './storage';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

if (!MISTRAL_API_KEY) {
  console.warn('MISTRAL_API_KEY not set. Sentiment analysis will not be available.');
}

// Simple in-memory cache for article analysis results to avoid redundant API calls
const analysisCache = new Map<string, {
  timestamp: number;
  scores: {
    relevance: number;
    impact: number;
    sentiment: number;
    composite: number;
  }
}>();

// Cache expiration time: 1 hour (in milliseconds)
const CACHE_EXPIRATION = 60 * 60 * 1000;

/**
 * Fetches headlines from all sources and performs sentiment analysis
 * @returns Ranked list of news items
 */
export async function getOxusHeadlines(): Promise<RankedNewsItem[]> {
  // Get all active sources
  const activeSources = await storage.getActiveFeedSources();
  
  if (activeSources.length === 0) {
    console.log('No active sources found');
    return [];
  }
  
  // Use all sources regardless of category to ensure diverse international sources
  const sourcesToUse = activeSources;
  
  console.log(`Fetching articles from ${sourcesToUse.length} sources for Oxus analysis`);
  
  // Create a parser for RSS feeds
  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['description', 'contentSnippet']
      ]
    }
  });
  
  try {
    // Fetch articles from all selected sources
    const allArticles: RssItem[] = [];
    
    // Create fetch promises for all sources
    const fetchPromises = sourcesToUse.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        
        if (feed.items && feed.items.length > 0) {
          // Convert feed items to RssItems and add to the collection
          const sourceArticles: RssItem[] = feed.items.map(item => ({
            id: item.guid || item.link || `${source.id}-${item.title}`,
            title: item.title || "No Title",
            link: item.link || "",
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            content: item.content || item.contentSnippet || "",
            contentSnippet: item.contentSnippet || "",
            source: source.url,
            sourceName: source.name,
            isWikipediaCurrentEvents: false
          }));
          
          allArticles.push(...sourceArticles);
          console.log(`Added ${sourceArticles.length} articles from "${source.name}"`);
        }
      } catch (error) {
        console.error(`Error fetching articles from "${source.name}":`, error);
        // Continue with other sources even if one fails
      }
    });
    
    // Wait for all fetches to complete
    await Promise.all(fetchPromises);
    
    if (allArticles.length === 0) {
      console.log(`No articles found from any sources`);
      return [];
    }
    
    console.log(`Collected ${allArticles.length} total articles from all sources`);
    
    // Filter articles published in the last 2 hours
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    let recentArticles = allArticles.filter(article => {
      const pubDate = new Date(article.pubDate);
      return pubDate >= twoHoursAgo;
    });
    
    console.log(`Filtered to ${recentArticles.length} articles from the past 2 hours`);
    
    // If we have less than 5 articles, extend to 6 hours as a fallback
    if (recentArticles.length < 5) {
      console.log('Not enough recent articles. Extending to 6 hours...');
      
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
      
      recentArticles = allArticles.filter(article => {
        const pubDate = new Date(article.pubDate);
        return pubDate >= sixHoursAgo;
      });
      
      console.log(`Found ${recentArticles.length} articles from the past 6 hours`);
    }
    
    // Use only up to 5 articles for analysis to prevent rate limiting issues
    const articlesToAnalyze = recentArticles.slice(0, 5);
    
    console.log(`Selected ${articlesToAnalyze.length} articles for detailed analysis`);
    
    // Process each article with Mistral, but add delay between requests
    const rankedArticles: RankedNewsItem[] = [];
    
    for (const article of articlesToAnalyze) {
      try {
        // Add a delay between API calls to avoid rate limiting
        if (rankedArticles.length > 0) {
          console.log('Waiting before making next API call...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`Analyzing article: "${article.title.substring(0, 50)}..."`);
        const scores = await analyzeArticleWithMistral(article);
        
        if (scores) {
          rankedArticles.push({
            ...article,
            scores
          });
        }
      } catch (error) {
        console.error(`Error analyzing article: ${article.title}`, error);
      }
    }
    
    // Sort by composite score (highest first)
    const sortedArticles = rankedArticles.sort((a, b) => {
      return (b.scores?.composite || 0) - (a.scores?.composite || 0);
    });
    
    return sortedArticles;
  } catch (error) {
    console.error('Error in getOxusHeadlines:', error);
    return [];
  }
}

/**
 * Analyzes a single article using Mistral AI
 * @param article The article to analyze
 * @returns Scores for relevance, impact, sentiment, and composite score
 */
async function analyzeArticleWithMistral(article: RssItem, retryCount = 0): Promise<{
  relevance: number;
  impact: number;
  sentiment: number;
  composite: number;
} | null> {
  if (!MISTRAL_API_KEY) {
    console.error('Mistral API key not set');
    return null;
  }
  
  // Generate a cache key for this article
  const cacheKey = `${article.title}-${article.sourceName}`;
  
  // Check if we have a valid cached result
  const cachedResult = analysisCache.get(cacheKey);
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_EXPIRATION) {
    console.log(`Using cached analysis for "${article.title.substring(0, 30)}..."`);
    return cachedResult.scores;
  }
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 3000; // 3 seconds
  
  try {
    const prompt = createAnalysisPrompt(article);
    
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: `You are a neutral news analyst evaluating headlines and content from global sources.
            Judge content solely on its merits, without bias related to source origin.
            Score each article based ONLY on content, not publication source.
            Provide objective numeric scores as specified in the format requested.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API error:', response.status, errorData);
      
      // If we're being rate limited and haven't exceeded max retries
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        console.log(`Rate limited. Retry attempt ${retryCount + 1} of ${MAX_RETRIES} in ${RETRY_DELAY/1000} seconds...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        // Increase the delay for subsequent retries
        return analyzeArticleWithMistral(article, retryCount + 1);
      }
      
      return null;
    }
    
    const data = await response.json() as any;
    
    // Parse the response to extract scores
    const content = data.choices[0]?.message?.content;
    
    if (content) {
      try {
        const parsedScores = JSON.parse(content);
        
        // Extract the scores (ensure they're in the range 0-100)
        const relevance = Math.min(100, Math.max(0, Math.round(parsedScores.relevance)));
        const impact = Math.min(100, Math.max(0, Math.round(parsedScores.impact)));
        const sentiment = Math.min(100, Math.max(0, Math.round(parsedScores.sentiment)));
        
        // Calculate composite score with the specified weights
        // (0.4 × Relevance) + (0.4 × Impact) + (0.2 × Sentiment)
        const composite = Math.round(
          (0.4 * relevance) + (0.4 * impact) + (0.2 * sentiment)
        );
        
        console.log(`Analyzed "${article.title}": REL=${relevance}, IMP=${impact}, SENT=${sentiment}, COMP=${composite}`);
        
        // Store the result in the cache
        const scores = { relevance, impact, sentiment, composite };
        analysisCache.set(cacheKey, {
          timestamp: Date.now(),
          scores
        });
        
        return scores;
      } catch (parseError) {
        console.error('Error parsing Mistral response:', parseError);
        console.log('Raw content:', content);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing article with Mistral:', error);
    return null;
  }
}

/**
 * Creates the prompt for Mistral analysis
 * @param article The article to analyze
 * @returns Prompt string
 */
function createAnalysisPrompt(article: RssItem): string {
  return `
Analyze the following news headline and content neutrally, regardless of source. Assign scores from 0-100 for Relevance, Impact, and Sentiment.

Title: ${article.title}
Publication Date: ${article.pubDate}
Source: ${article.sourceName}
Content: ${article.contentSnippet}

Provide scores according to these definitions:
- Relevance (40%): Score based on topical importance, global significance, and urgency. Consider keyword/context analysis.
- Impact (40%): Score for societal/economic influence via entity recognition and event significance.
- Sentiment (20%): Score for emotional tone, where 0 is extremely negative, 50 is neutral, and 100 is extremely positive.

Provide your response in JSON format with these three numeric fields only:
{
  "relevance": 0-100,
  "impact": 0-100,
  "sentiment": 0-100
}
`;
}