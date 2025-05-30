/**
 * theOxus - Mistral AI Integration Module
 * 
 * This module provides AI-powered news article analysis and ranking
 * using the Mistral AI API. It evaluates articles based on relevance,
 * impact, and sentiment to create composite scores.
 * 
 * @license Apache-2.0
 */

import { RssItem, RankedNewsItem } from '../shared/schema';
import fetch from 'node-fetch';
import { stringify } from 'querystring';

// Environment variables and configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Analyzes and ranks a list of news articles using Mistral AI
 * 
 * This function filters recent articles (preferring those from the last 2 hours),
 * sends them to Mistral AI for analysis, and returns them ranked by composite score.
 * 
 * The function uses an adaptive time window that expands from 2 hours to 6 hours
 * to 12 hours if not enough recent articles are found.
 *
 * @param articles List of RSS items to analyze
 * @returns Promise resolving to a ranked list of news items with scores
 */
export async function rankNewsArticles(articles: RssItem[]): Promise<RankedNewsItem[]> {
  // Step 1: Filter for recent articles (last 2 hours by default)
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  
  let recentArticles = articles.filter(article => {
    const pubDate = new Date(article.pubDate);
    return pubDate >= twoHoursAgo;
  });
  
  // Log filtered count for debugging and monitoring
  console.log(`Filtering from ${articles.length} total articles to ${recentArticles.length} from the past 2 hours`);
  
  // Step 2: Apply adaptive time window based on available article count
  if (recentArticles.length >= 3) {
    // We have enough recent articles
    console.log(`Found ${recentArticles.length} articles from the past 2 hours - using these for analysis`);
  } 
  else if (recentArticles.length > 0) {
    // We have some recent articles, but fewer than ideal
    console.log(`Found only ${recentArticles.length} articles from the past 2 hours - still using these for analysis`);
  }
  else {
    // No recent articles found - extend time window to 6 hours
    console.log('No articles from the past 2 hours found. Extending to 6 hours...');
    
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    
    recentArticles = articles.filter(article => {
      const pubDate = new Date(article.pubDate);
      return pubDate >= sixHoursAgo;
    });
    
    console.log(`Found ${recentArticles.length} articles from the past 6 hours`);
    
    // If still no articles, use a 12 hour window as final fallback
    if (recentArticles.length === 0) {
      console.log('No articles from the past 6 hours found. Extending to 12 hours...');
      
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
      
      recentArticles = articles.filter(article => {
        const pubDate = new Date(article.pubDate);
        return pubDate >= twelveHoursAgo;
      });
      
      console.log(`Found ${recentArticles.length} articles from the past 12 hours`);
    }
  }
  
  // Step 3: Limit articles to analyze (for API efficiency and cost control)
  // Maximum of 10 articles to avoid excessive API calls
  const articlesToAnalyze = recentArticles.slice(0, 10);
  
  try {
    // Step 4: Analyze each article with Mistral AI
    const rankedArticles: RankedNewsItem[] = [];
    
    for (const article of articlesToAnalyze) {
      const scores = await analyzeArticle(article);
      if (scores) {
        rankedArticles.push({
          ...article,
          scores
        });
      }
    }
    
    // Step 5: Sort articles by composite score (highest first)
    return rankedArticles.sort((a, b) => {
      return (b.scores?.composite || 0) - (a.scores?.composite || 0);
    });
  } catch (error) {
    console.error('Error ranking news articles:', error);
    return [];
  }
}

/**
 * Analyzes a single news article using Mistral AI
 * 
 * This function sends the article to the Mistral AI API and receives scores for
 * relevance, impact, and sentiment. It handles error cases gracefully and processes
 * the AI response into a standardized score format.
 *
 * @param article The RSS article to analyze
 * @returns Promise resolving to a score object or null if analysis fails
 */
async function analyzeArticle(article: RssItem): Promise<{
  relevance: number;  // How relevant the article is (0-100)
  impact: number;     // The significance/impact of the article (0-100)
  sentiment: number;  // Emotional tone from negative to positive (0-100)
  composite: number;  // Weighted overall score
} | null> {
  // Verify API key is available
  if (!MISTRAL_API_KEY) {
    console.error('Mistral API key not set');
    return null;
  }
  
  try {
    // Create the analysis prompt for the article
    const prompt = createAnalysisPrompt(article);
    
    // Make API call to Mistral AI
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
            content: 'You are a news analyst evaluating the relevance, impact, and sentiment of news headlines and content. Provide only numeric scores as specified.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        // Request response in JSON format for easier parsing
        response_format: { type: "json_object" }
      })
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API error:', response.status, errorData);
      return null;
    }
    
    // Process successful response
    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content;
    
    if (content) {
      try {
        // Parse the JSON response
        const parsedScores = JSON.parse(content);
        
        // Normalize and validate scores to ensure they're in the range 0-100
        const relevance = Math.min(100, Math.max(0, Math.round(parsedScores.relevance)));
        const impact = Math.min(100, Math.max(0, Math.round(parsedScores.impact)));
        const sentiment = Math.min(100, Math.max(0, Math.round(parsedScores.sentiment)));
        
        // Calculate weighted composite score (giving more weight to relevance and impact)
        const composite = Math.round(
          (0.4 * relevance) + (0.4 * impact) + (0.2 * sentiment)
        );
        
        return { relevance, impact, sentiment, composite };
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
 * Creates the prompt for the Mistral AI analysis
 * 
 * This function formats the article data into a structured prompt that instructs
 * the AI model on how to analyze the article and what format to return the results in.
 *
 * @param article The article to analyze
 * @returns Formatted prompt string for the Mistral AI API
 */
function createAnalysisPrompt(article: RssItem): string {
  return `
Analyze the following news headline and content, assigning scores from 0-100 for Relevance, Impact, and Sentiment.

Title: ${article.title}
Publication Date: ${article.pubDate}
Content: ${article.contentSnippet}

Define each score as follows:
- Relevance (0-100): The topical importance based on keyword/context analysis.
- Impact (0-100): The societal/economic influence via entity recognition and event significance.
- Sentiment (0-100): The emotional tone ranging from negative (0) to positive (100).

Provide your response in a JSON format with only the following three fields - relevance, impact, and sentiment:
{
  "relevance": 0-100,
  "impact": 0-100,
  "sentiment": 0-100
}
`;
}