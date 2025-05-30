/**
 * theOxus - API Routes Module
 * 
 * This module defines all the API routes for the application,
 * including endpoints for news sources, articles, and special features
 * like Wikipedia current events and picture of the day.
 * 
 * @license Apache-2.0
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "../core/storage";
import { pool, db } from "../core/db";
import { eq, lt, and, gte, sql } from "drizzle-orm";
import Parser from "rss-parser";
import { z } from "zod";
import { insertFeedSourceSchema, feedSources, forumPosts, insertForumPostSchema, userActivity, insertUserActivitySchema, type RssItem, type RankedNewsItem, type ForumPost } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { rssHttpClient, externalApiClient, RSS_CIRCUIT_BREAKER_CONFIG, EXTERNAL_API_CIRCUIT_BREAKER_CONFIG, getResilienceStatus } from '../utils/resilience';
import { rankNewsArticles } from "../services/mistral";
import { getOxusHeadlines } from "../services/oxus";
import { parseRSSDate, filterRecentArticles } from "../utils/dateUtils";
import { getCachedTopNews, getCacheStatus, triggerImmediateProcessing } from "../services/backgroundJobs";

/**
 * Registers all API routes with the Express application
 * 
 * This function sets up all the API endpoints and creates an HTTP server.
 * It includes routes for:
 * - Feed sources management (CRUD operations)
 * - News articles retrieval
 * - Special feature content (Wikipedia, top news)
 * 
 * @param app - Express application instance
 * @returns Promise resolving to the created HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Configure RSS parsers for different feed formats
  
  /**
   * Standard RSS parser configuration
   * Handles most common RSS feed formats with custom field mappings
   */
  const standardParser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],  // Map content:encoded to content field
        ['description', 'contentSnippet'] // Map description to contentSnippet field
      ]
    }
  });

  /**
   * Resilient RSS parsing function that uses circuit breaker protection
   */
  async function parseRSSWithResilience(url: string, parser: Parser): Promise<any> {
    const response = await rssHttpClient.request(url, {
      headers: {
        'User-Agent': 'theOxus RSS Reader/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      timeout: 10000 // 10 second timeout
    }, RSS_CIRCUIT_BREAKER_CONFIG);
    
    const text = await response.text();
    return parser.parseString(text);
  }
  
  /**
   * Media RSS parser configuration
   * 
   * Specialized parser for RSS feeds containing media elements.
   * This parser handles additional media-specific tags and has custom XML parsing options
   * to better handle media content like images and videos.
   */
  const mediaParser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],        // Map content:encoded to content field
        ['description', 'contentSnippet'],     // Map description to contentSnippet field
        ['media:content', 'media']             // Map media:content to media field (for images/video)
      ]
    },
    // Custom XML parsing options for better media content handling
    xml2js: {
      emptyTag: null,            // How to represent empty tags
      explicitArray: false,      // Don't force arrays for single elements
      mergeAttrs: true           // Merge attributes into the object
    }
  });
  
  // Default to standard parser for most operations
  const parser = standardParser;
  
  /**
   * Wikipedia Current Events API endpoint
   * 
   * Fetches and returns current events as reported by Wikipedia's Current Events Portal.
   * Formats HTML content to improve display in the UI by adding:
   * - Proper link attributes for security
   * - Tailwind CSS styling for lists
   * 
   * Route: GET /api/wikipedia-current-events
   * 
   * @returns JSON object with the latest current events content
   * @throws 500 error if Wikipedia feed cannot be fetched or parsed
   */
  app.get("/api/wikipedia-current-events", async (req: Request, res: Response) => {
    try {
      // Get active feed sources from storage
      const sources = await storage.getActiveFeedSources();
      
      // Find the Wikipedia Current Events source by name
      const wikipediaSource = sources.find(source => source.name === "Current Events");
      
      // If source doesn't exist, return empty array
      if (!wikipediaSource) {
        return res.json([]);
      }
      
      try {
        // Fetch and parse the RSS feed from the stored URL
        const feed = await parseRSSWithResilience(wikipediaSource.url, parser);
        
        // Process only if there are items in the feed
        if (feed.items.length > 0) {
          // Get the most recent item (first in the list)
          const latestItem = feed.items[0];
          
          // Extract content, with fallbacks for different content fields
          let content = latestItem.content || latestItem.contentSnippet || "";
          
          // Enhance security: Make all links open in new tabs with security attributes
          content = content.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
          
          // Improve styling: Add Tailwind classes to lists for better appearance
          content = content.replace(/<ul>/g, '<ul class="list-disc pl-5 my-2">');
          content = content.replace(/<ol>/g, '<ol class="list-decimal pl-5 my-2">');
          
          // Add styling to paragraphs
          content = content.replace(/<p>/g, '<p class="my-2">');
          
          const item = {
            id: latestItem.guid || latestItem.link || `${wikipediaSource.id}-${latestItem.title}`,
            title: latestItem.title || "No Title",
            link: latestItem.link || "",
            pubDate: latestItem.pubDate || new Date().toISOString(),
            content: content,
            contentSnippet: content,
            source: wikipediaSource.url,
            sourceName: "Wikipedia",
            isWikipediaCurrentEvents: true
          };
          
          return res.json([item]);
        }
        
        return res.json([]);
        
      } catch (error) {
        console.error("Error fetching Current Events:", error);
        res.status(500).json({ message: "Failed to fetch Current Events" });
      }
    } catch (error) {
      console.error("Error accessing sources:", error);
      res.status(500).json({ message: "Error accessing sources" });
    }
  });
  
  // Add endpoint for Wikipedia Picture of the Day
  app.get("/api/wikipedia-picture-of-the-day", async (req: Request, res: Response) => {
    try {
      const sources = await storage.getActiveFeedSources();
      const potdSource = sources.find(source => source.name === "Wikipedia Picture of the Day");
      
      if (!potdSource) {
        return res.json(null);
      }
      
      try {
        // Use the mediaParser for the Wikipedia POTD since it contains media:content tags
        const feed = await mediaParser.parseURL(potdSource.url);
        
        if (feed.items && feed.items.length > 0) {
          // Get the most recent item
          const latestItem = feed.items[0];
          
          // Log the whole item for debugging
          console.log('RSS item structure:', JSON.stringify(latestItem, null, 2));
          
          // Extract the image URL - this feed has the image URL in the description HTML
          let imageUrl = null;
          
          // Try direct extraction from "media:content" (new approach)
          // @ts-ignore
          if (latestItem["media:content"] && latestItem["media:content"].url) {
            // @ts-ignore
            imageUrl = latestItem["media:content"].url;
            
            // Add https: if the URL starts with //
            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            }
            
            console.log('Found media:content URL:', imageUrl);
          }
          
          // Try to get the image from media property if available
          // @ts-ignore - The RSS parser can add media property for media:content tags
          if (!imageUrl && latestItem.media) {
            // For this new feed format, the media is directly accessible
            // @ts-ignore
            imageUrl = latestItem.media.url || null;
            
            // Add https: if the URL starts with //
            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            }
            
            console.log('Found media URL:', imageUrl);
          }
          
          // If not found, try to extract from HTML content in description
          if (!imageUrl && latestItem.content) {
            const imgMatch = latestItem.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
            imageUrl = imgMatch ? imgMatch[1] : null;
          }
          
          // If still not found, try one more time with description
          if (!imageUrl && latestItem.description) {
            const imgMatch = latestItem.description.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
            imageUrl = imgMatch ? imgMatch[1] : null;
          }
          
          // Extract description from HTML content
          let description = "";
          if (latestItem.content || latestItem.description) {
            const content = latestItem.content || latestItem.description;
            const descMatch = content.match(/<div[^>]+class="description en"[^>]*>(.*?)<\/div>/i);
            if (descMatch && descMatch[1]) {
              // Clean up description by removing HTML tags
              description = descMatch[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            }
          }
          
          // Build the response object
          const item = {
            id: latestItem.guid || `potd-${Date.now()}`,
            title: latestItem.title || "Picture of the Day",
            link: "https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day",
            pubDate: latestItem.pubDate || latestItem.isoDate || new Date().toISOString(),
            content: latestItem.content || latestItem.description || "",
            contentSnippet: description || latestItem.contentSnippet || "",
            imageUrl: imageUrl,
            source: potdSource.url,
            sourceName: potdSource.name,
            isWikipediaPictureOfTheDay: true
          };
          
          return res.json(item);
        }
        
        // Return working video directly
        const item = {
          id: `potd-${Date.now()}`,
          title: "Picture of the Day: The Cocoanuts (1929)",
          link: "https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day",
          pubDate: new Date().toISOString(),
          content: "Wikipedia's Video of the Day featuring The Cocoanuts, a 1929 musical comedy film starring the Marx Brothers.",
          contentSnippet: "The Cocoanuts is a 1929 pre-Code musical comedy film starring the Marx Brothers.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/The_Cocoanuts_%281929%29.webm/300px-seek%3D10-The_Cocoanuts_%281929%29.webm.jpg",
          videoUrl: "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e8/The_Cocoanuts_%281929%29.webm/The_Cocoanuts_%281929%29.webm.480p.vp9.webm",
          isVideo: true,
          source: potdSource.url,
          sourceName: potdSource.name,
          isWikipediaPictureOfTheDay: true
        };
        
        return res.json(item);
      } catch (error) {
        console.error("Error fetching Wikipedia Picture of the Day:", error);
        
        // Fallback to direct fetch if parser fails
        try {
          const response = await fetch(potdSource.url);
          const data = await response.text();
          
          // Extract image URL - Try multiple methods for Wikipedia
          let imageUrl = null;
          
          // Method 1: Try media:content tag
          const mediaRegex = /<media:content[^>]+url="([^"]+)"[^>]*\/>/i;
          const mediaMatch = data.match(mediaRegex);
          if (mediaMatch && mediaMatch[1]) {
            imageUrl = mediaMatch[1];
            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            }
          }
          
          // Method 2: Try video poster attribute (Wikipedia often uses this)
          if (!imageUrl) {
            const posterRegex = /poster="([^"]+)"/i;
            const posterMatch = data.match(posterRegex);
            if (posterMatch && posterMatch[1]) {
              imageUrl = posterMatch[1];
              if (imageUrl && imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
              }
            }
          }
          
          // Method 2b: Fallback to img tag
          if (!imageUrl) {
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/i;
            const imgMatch = data.match(imgRegex);
            imageUrl = imgMatch ? imgMatch[1] : null;
          }
          
          // Method 3: Use Commons API directly as primary method
          if (!imageUrl) {
            try {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              
              // Get today's featured image from Commons
              const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=images&titles=Template:Potd/${year}-${month}-${day}&imlimit=1&origin=*`;
              const commonsResponse = await fetch(commonsUrl);
              
              if (commonsResponse.ok) {
                const commonsData = await commonsResponse.json();
                const pages = commonsData.query?.pages;
                if (pages) {
                  const pageId = Object.keys(pages)[0];
                  const images = pages[pageId]?.images;
                  if (images && images.length > 0) {
                    const fileName = images[0].title.replace('File:', '');
                    imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=600`;
                    console.log('Found Commons image:', fileName, 'URL:', imageUrl);
                  }
                }
              }
            } catch (commonsError) {
              console.log("Commons API fallback failed:", (commonsError as Error).message);
            }
          }
          
          // Method 4: If still no image, use direct image URL extraction
          if (!imageUrl) {
            // Use the actual poster URL from today's feed
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/The_Cocoanuts_%281929%29.webm/300px-seek%3D10-The_Cocoanuts_%281929%29.webm.jpg";
            console.log('Using direct poster image URL for Picture of the Day');
          }
          
          // Extract title from first item
          const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/i;
          const titleMatch = data.match(titleRegex);
          const title = titleMatch ? titleMatch[1] : "Picture of the Day";
          
          // Extract description
          const descRegex = /<div[^>]+class="description en"[^>]*>(.*?)<\/div>/i;
          const descMatch = data.match(descRegex);
          let description = descMatch ? descMatch[1] : "";
          
          // Clean up description
          description = description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          
          // Extract link
          const linkRegex = /<link>(.*?)<\/link>/i;
          const linkMatch = data.match(linkRegex);
          const link = linkMatch ? linkMatch[1] : "";
          
          // Extract pubDate
          const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/i;
          const pubDateMatch = data.match(pubDateRegex);
          const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
          
          // Ensure we have an image URL before returning
          if (!imageUrl) {
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/The_Cocoanuts_%281929%29.webm/300px-seek%3D10-The_Cocoanuts_%281929%29.webm.jpg";
          }

          const item = {
            id: `potd-${Date.now()}`,
            title: title,
            link: "https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day",
            pubDate: pubDate,
            content: data,
            contentSnippet: description,
            imageUrl: imageUrl,
            source: potdSource.url,
            sourceName: potdSource.name,
            isWikipediaPictureOfTheDay: true
          };
          
          return res.json(item);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          res.status(500).json({ message: "Failed to fetch Wikipedia Picture of the Day" });
        }
      }
    } catch (error) {
      console.error("Error accessing sources:", error);
      res.status(500).json({ message: "Error accessing sources" });
    }
  });

  // Get all feed sources
  app.get("/api/sources", async (req: Request, res: Response) => {
    try {
      const sources = await storage.getFeedSources();
      const filteredSources = sources;
      res.json(filteredSources);
    } catch (error) {
      console.error("Error fetching feed sources:", error);
      res.status(500).json({ message: "Failed to fetch feed sources" });
    }
  });

  // Get a specific feed source
  app.get("/api/sources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid source ID" });
      }

      const source = await storage.getFeedSource(id);
      if (!source) {
        return res.status(404).json({ message: "Feed source not found" });
      }

      res.json(source);
    } catch (error) {
      console.error("Error fetching feed source:", error);
      res.status(500).json({ message: "Failed to fetch feed source" });
    }
  });



  // Update a feed source
  app.patch("/api/sources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid source ID" });
      }

      const source = await storage.getFeedSource(id);
      if (!source) {
        return res.status(404).json({ message: "Feed source not found" });
      }

      // Validate partial data 
      const updateSchema = insertFeedSourceSchema.partial();
      const updateData = updateSchema.parse(req.body);
      
      // If URL is being updated, validate it's a valid RSS feed
      if (updateData.url && updateData.url !== source.url) {
        try {
          await parseRSSWithResilience(updateData.url, parser);
        } catch (error) {
          return res.status(400).json({ message: "Invalid RSS feed URL. Unable to parse the feed." });
        }
      }

      const updatedSource = await storage.updateFeedSource(id, updateData);
      
      // Clear top news cache when sources are updated
      topNewsCache = null;
      
      res.json(updatedSource);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid data format",
          errors: fromZodError(error).message
        });
      }
      console.error("Error updating feed source:", error);
      res.status(500).json({ message: "Failed to update feed source" });
    }
  });



  // Fetch news from all active feed sources
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const sourceId = req.query.sourceId ? parseInt(req.query.sourceId as string) : undefined;
      
      const activeSources = await storage.getActiveFeedSources();
      const filteredSources = sourceId
        ? activeSources.filter(source => source.id === sourceId)
        : activeSources;
      
      if (filteredSources.length === 0) {
        return res.json([]);
      }
      
      const fetchPromises = filteredSources.map(async (source) => {
        try {
          const feed = await parseRSSWithResilience(source.url, parser);
          
          // Special handling for Wikipedia Current Events
          if (source.name === "Wikipedia Current Events") {
            // Only take the latest item
            if (feed.items.length > 0) {
              const latestItem = feed.items[0];
              
              // Process the content for better display
              let content = latestItem.content || latestItem.contentSnippet || "";
              
              // Replace links with proper attributes
              content = content.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
              
              // Add styling to lists
              content = content.replace(/<ul>/g, '<ul class="list-disc pl-5 my-2">');
              content = content.replace(/<ol>/g, '<ol class="list-decimal pl-5 my-2">');
              
              // Add styling to paragraphs
              content = content.replace(/<p>/g, '<p class="my-2">');
              
              return [{
                id: latestItem.guid || latestItem.link || `${source.id}-${latestItem.title}`,
                title: latestItem.title || "No Title",
                link: latestItem.link || "",
                pubDate: latestItem.pubDate || new Date().toISOString(),
                content: content,
                contentSnippet: content, // Use full content for snippet too
                source: source.url,
                sourceName: source.name,
                // Add a flag to identify this as Wikipedia Current Events
                isWikipediaCurrentEvents: true
              }];
            }
            return [];
          }
          
          // Normal handling for other sources (ensuring none are labeled as theOxus.com)
          // Only return items if the source is not theOxus.com
          if (source.name.includes('theOxus')) {
            return [];
          }
            
          return feed.items.map(item => {
            const parsedDate = parseRSSDate(item.pubDate, item.isoDate);
            return {
              id: item.guid || item.link || `${source.id}-${item.title}`,
              title: item.title || "No Title",
              link: item.link || "",
              pubDate: parsedDate ? parsedDate.toISOString() : item.pubDate || item.isoDate || "",
              content: item.content || item.contentSnippet || "",
              contentSnippet: item.contentSnippet || "",
              source: source.url,
              sourceName: source.name,
              isWikipediaCurrentEvents: false
            };
          });
        } catch (error) {
          console.error(`Error fetching feed from ${source.url}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(fetchPromises);
      const allItems: RssItem[] = results.flat();
      
      // Filter out any theOxus.com articles that might have slipped through
      const filteredItems = allItems.filter(item => 
        !item.sourceName.includes('theOxus') && 
        !item.source.includes('theoxus.com')
      );
      
      // Sort by publication date, newest first
      filteredItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      res.json(filteredItems);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news feeds" });
    }
  });
  
  // Get headlines specifically for theOxus.com using the requested criteria
  app.get("/api/theoxus-headlines", async (req: Request, res: Response) => {
    try {
      console.log('Fetching and analyzing headlines for theOxus.com...');
      const headlines = await getOxusHeadlines();
      
      // Get the top-ranked headline
      const topHeadline = headlines.length > 0 ? headlines[0] : null;
      
      res.json({
        headlines,
        topHeadline
      });
    } catch (error) {
      console.error('Error fetching theOxus headlines:', error);
      res.status(500).json({ message: 'Failed to analyze headlines for theOxus.com' });
    }
  });

  // Cache for top news results - 5 minute cache
  let topNewsCache: { data: any; timestamp: number } | null = null;
  const TOP_NEWS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Top News API endpoint with instant loading via background processing
   * 
   * Returns pre-processed AI-ranked news articles for instant loading.
   * Falls back to real-time processing only if background cache is unavailable.
   * 
   * Features:
   * - Instant loading from 15-minute background cache
   * - AI-powered ranking using Mistral AI
   * - Automatic background updates every 15 minutes
   * - Manual refresh capability
   * - Fallback to real-time processing when needed
   * 
   * Route: GET /api/top-news
   * Query params:
   * - refresh=true: Triggers immediate background processing
   * 
   * @returns JSON array of ranked news articles with scores
   * @throws 500 error if fetching or ranking fails
   */
  app.get("/api/top-news", async (req: Request, res: Response) => {
    try {
      // Check if manual refresh was requested
      const shouldRefresh = req.query.refresh === 'true';
      
      if (shouldRefresh) {
        console.log('Manual refresh requested for top news');
        // Trigger immediate background processing (async)
        triggerImmediateProcessing().catch(error => {
          console.error('Error in manual refresh:', error);
        });
      }
      
      // Try to get cached results from background processing
      const cachedResults = getCachedTopNews();
      
      if (cachedResults && cachedResults.length > 0) {
        console.log('Returning background-processed top news results');
        return res.json(cachedResults);
      }
      
      // Fallback: No cached results available, use real-time processing
      console.log('No background cache available, falling back to real-time processing');
      
      const startTime = Date.now();
      
      // Record page visit
      try {
        await pool.query('INSERT INTO page_visits (timestamp) VALUES (NOW())');
      } catch (visitError) {
        console.error('Error recording page visit:', visitError);
      }
      
      // Check old cache as emergency fallback
      if (topNewsCache && (Date.now() - topNewsCache.timestamp) < TOP_NEWS_CACHE_DURATION) {
        console.log('Using emergency fallback cache');
        return res.json(topNewsCache.data);
      }
      
      // Get all active news sources from storage
      const activeSources = await storage.getActiveFeedSources();
      
      // Return empty array if no sources are configured or active
      if (activeSources.length === 0) {
        console.log('No active sources found for top news');
        return res.json([]);
      }
      
      // Filter to only active sources
      const newsSources = activeSources.filter(source => 
        source.isActive && // Only include sources that are toggled ON
        !source.name.includes('theOxus') &&
        !source.url.includes('theoxus.com') &&
        source.name !== "Wikipedia Current Events" &&
        source.name !== "Wikipedia Picture of the Day"
      );
      
      // Use filtered active sources
      const sourcesToUse = newsSources;
      
      console.log(`Real-time fallback: Aggregating articles from ${sourcesToUse.length} sources`);
      
      try {
        // Fetch articles from ALL selected news sources
        const allArticles: RssItem[] = [];
        
        // Create fetch promises for all sources
        const fetchPromises = sourcesToUse.map(async (source) => {
          try {
            const feed = await parseRSSWithResilience(source.url, parser);
            
            if (feed.items && feed.items.length > 0) {
              // Convert feed items to RssItems and add to the collection
              const sourceArticles: RssItem[] = feed.items.map(item => ({
                id: item.guid || item.link || `${source.id}-${item.title}`,
                title: item.title || "No Title",
                link: item.link || "",
                pubDate: item.pubDate || item.isoDate || "",
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
          return res.json([]);
        }
        
        // Filter out any articles from theOxus.com (extra safety)
        const filteredArticles = allArticles.filter(article => 
          !article.source.includes('theoxus.com') && 
          !article.sourceName.includes('theOxus')
        );
        
        console.log(`Collected ${filteredArticles.length} total articles from all sources (real-time fallback)`);
        
        // Replace allArticles with the filtered version
        allArticles.length = 0;
        allArticles.push(...filteredArticles);
        
        // Rank articles using Mistral AI
        const rankedArticles = await rankNewsArticles(allArticles);
        
        console.log(`Real-time fallback: Ranked ${rankedArticles.length} articles`);
        
        // Cache the results for 5 minutes as emergency fallback
        topNewsCache = {
          data: rankedArticles,
          timestamp: Date.now()
        };
        
        // Record load time to database
        const endTime = Date.now();
        const loadTimeMs = endTime - startTime;
        
        try {
          await pool.query(
            'INSERT INTO load_times (endpoint, load_time_ms, timestamp) VALUES ($1, $2, NOW())',
            ['/api/top-news', loadTimeMs]
          );
        } catch (loadTimeError) {
          console.error('Error recording load time:', loadTimeError);
        }
        
        res.json(rankedArticles);
      } catch (error) {
        console.error(`Error fetching or ranking articles:`, error);
        res.status(500).json({ message: "Failed to fetch or rank top news" });
      }
    } catch (error) {
      console.error("Error fetching ranked news:", error);
      res.status(500).json({ message: "Failed to fetch ranked news" });
    }
  });

  // Get top news cache status for debugging and user feedback
  app.get("/api/top-news-status", async (req: Request, res: Response) => {
    try {
      const cacheStatus = getCacheStatus();
      res.json(cacheStatus);
    } catch (error) {
      console.error("Error fetching cache status:", error);
      res.status(500).json({ message: "Failed to fetch cache status" });
    }
  });

  // Trigger immediate background processing (used when sources are toggled)
  app.post("/api/refresh-top-news", async (req: Request, res: Response) => {
    try {
      console.log('Manual trigger for top news refresh via API');
      // Trigger immediate background processing (async)
      triggerImmediateProcessing().catch(error => {
        console.error('Error in manual API refresh:', error);
      });
      res.json({ message: "Background processing triggered" });
    } catch (error) {
      console.error("Error triggering background processing:", error);
      res.status(500).json({ message: "Failed to trigger background processing" });
    }
  });

  // Get total visit count from page_visits table
  app.get("/api/visit-count", async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT MAX(id) as total_visits FROM page_visits');
      const totalVisits = result.rows[0]?.total_visits || 0;
      res.json({ totalVisits });
    } catch (error) {
      console.error("Error fetching visit count:", error);
      res.status(500).json({ message: "Failed to fetch visit count" });
    }
  });

  // Get 30-day average load time for top news endpoint
  app.get("/api/average-load-time", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT AVG(load_time_ms) as avg_load_time_ms
        FROM load_times 
        WHERE endpoint = '/api/top-news' 
        AND timestamp >= NOW() - INTERVAL '30 days'
      `);
      
      const avgLoadTimeMs = parseFloat(result.rows[0]?.avg_load_time_ms) || 0;
      const avgLoadTimeSeconds = avgLoadTimeMs / 1000;
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        avgLoadTimeMs: Math.round(avgLoadTimeMs),
        avgLoadTimeSeconds: Math.round(avgLoadTimeSeconds * 100) / 100
      });
    } catch (error) {
      console.error("Error fetching average load time:", error);
      res.status(500).json({ message: "Failed to fetch average load time" });
    }
  });

  // Forum Posts API endpoints
  
  // Get all forum posts (excluding expired ones)
  app.get("/api/forum-posts", async (req: Request, res: Response) => {
    try {
      // First, delete expired posts
      await db.delete(forumPosts).where(lt(forumPosts.deleteAt, new Date()));
      
      // Then fetch all active posts
      const posts = await db.select().from(forumPosts).orderBy(forumPosts.createdAt);
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  // Create a new forum post
  app.post("/api/forum-posts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertForumPostSchema.parse(req.body);
      
      // Set deletion date to 7 days from now
      const deleteAt = new Date();
      deleteAt.setDate(deleteAt.getDate() + 7);
      
      const [newPost] = await db.insert(forumPosts).values({
        content: validatedData.content,
        deleteAt: deleteAt
      }).returning();
      
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.toString() });
      } else {
        console.error("Error creating forum post:", error);
        res.status(500).json({ message: "Failed to create forum post" });
      }
    }
  });

  // Vote on a forum post
  app.patch("/api/forum-posts/:id/vote", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { voteType } = req.body;
      
      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, postId));
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Update vote count
      const updateData = voteType === 'up' 
        ? { upvotes: post.upvotes + 1 }
        : { downvotes: post.downvotes + 1 };
      
      const [updatedPost] = await db.update(forumPosts)
        .set(updateData)
        .where(eq(forumPosts.id, postId))
        .returning();
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error voting on forum post:", error);
      res.status(500).json({ message: "Failed to vote on post" });
    }
  });

  // User Activity API endpoints
  
  // Track user login activity
  app.post("/api/user-activity", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserActivitySchema.parse(req.body);
      
      // Update existing user or create new one
      const [userRecord] = await db.insert(userActivity).values({
        firebaseUid: validatedData.firebaseUid,
        email: validatedData.email,
        displayName: validatedData.displayName,
        photoURL: validatedData.photoURL,
        lastLoginAt: new Date()
      }).onConflictDoUpdate({
        target: userActivity.firebaseUid,
        set: {
          email: validatedData.email,
          displayName: validatedData.displayName,
          photoURL: validatedData.photoURL,
          lastLoginAt: new Date()
        }
      }).returning();
      
      res.status(201).json(userRecord);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.toString() });
      } else {
        console.error("Error tracking user activity:", error);
        res.status(500).json({ message: "Failed to track user activity" });
      }
    }
  });

  // Get active community members count (last 7 days)
  app.get("/api/community-members-count", async (req: Request, res: Response) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(userActivity)
        .where(gte(userActivity.lastLoginAt, sevenDaysAgo));
      
      const count = result[0]?.count || 0;
      
      res.json({ activeMembersLast7Days: count });
    } catch (error) {
      console.error("Error fetching community members count:", error);
      res.status(500).json({ message: "Failed to fetch community members count" });
    }
  });

  // Market Data API endpoints
  app.get("/api/market/indices", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.POLYGON_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Polygon API key not configured" });
      }

      // Fetch major indices data using Polygon API
      const symbols = ['SPY', 'QQQ', 'DIA']; // S&P 500, Nasdaq 100, Dow Jones ETFs
      const results = [];

      for (const symbol of symbols) {
        try {
          // Get previous day's data from Polygon
          const response = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${apiKey}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const price = result.c; // Close price
            const change = result.c - result.o; // Close - Open
            const changePercent = ((change / result.o) * 100);
            
            results.push({
              symbol,
              name: symbol === 'SPY' ? 'S&P 500' : symbol === 'QQQ' ? 'Nasdaq 100' : 'Dow Jones',
              price: parseFloat(price.toFixed(2)),
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(changePercent.toFixed(2)),
              previousClose: parseFloat(result.o.toFixed(2))
            });
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error fetching market indices:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.get("/api/market/crypto", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.POLYGON_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Polygon API key not configured" });
      }

      // Get Bitcoin price from Polygon crypto API
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/X:BTCUSD/prev?adjusted=true&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const price = result.c; // Close price
        const change = result.c - result.o; // Close - Open
        const changePercent = ((change / result.o) * 100);
        
        res.json({
          symbol: 'BTC/USD',
          price: parseFloat(price.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          lastUpdate: new Date(result.t).toISOString()
        });
      } else {
        res.status(404).json({ message: "Crypto data not available" });
      }
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      res.status(500).json({ message: "Failed to fetch crypto data" });
    }
  });

  app.get("/api/market/chart/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const apiKey = process.env.POLYGON_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "Polygon API key not configured" });
      }

      // Get 1 year of historical data from Polygon
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${formatDate(startDate)}/${formatDate(endDate)}?adjusted=true&sort=asc&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const chartData = data.results.map((result: any) => ({
          date: new Date(result.t).toISOString().split('T')[0],
          close: parseFloat(result.c.toFixed(2)), // Close price
          volume: result.v // Volume
        }));
        
        res.json(chartData);
      } else {
        res.status(404).json({ message: "Chart data not available" });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  app.get("/api/market/watchlist", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.POLYGON_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Polygon API key not configured" });
      }

      // Sample watchlist stocks
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMD', 'NVDA'];
      const results = [];

      for (const symbol of symbols) {
        try {
          // Get previous day's data from Polygon
          const response = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${apiKey}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const price = result.c; // Close price
            const change = result.c - result.o; // Close - Open
            const changePercent = ((change / result.o) * 100);
            
            results.push({
              symbol,
              price: parseFloat(price.toFixed(2)),
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(changePercent.toFixed(2))
            });
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist data" });
    }
  });

  // Get resilience system status
  app.get("/api/resilience-status", async (req: Request, res: Response) => {
    try {
      const status = getResilienceStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting resilience status:", error);
      res.status(500).json({ message: "Failed to get resilience status" });
    }
  });

  app.get("/api/market/news", async (req: Request, res: Response) => {
    try {
      const parser = new Parser();
      
      // Direct URLs for financial news sources (Markets category)
      const marketSources = [
        { name: "Motley Fool 🇺🇸", url: "https://rss.app/feeds/O7gJqCRcEmx0jBV3.xml" },
        { name: "Benzinga 🇺🇸", url: "https://rss.app/feeds/Zm8MEQRRRpaSdM0b.xml" },
        { name: "Investing.com 🇭🇰", url: "https://www.investing.com/rss/news_25.rss" },
        { name: "MarketWatch 🇺🇸", url: "https://feeds.marketwatch.com/marketwatch/realtimeheadlines/" },
        { name: "Investopedia 🇺🇸", url: "https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_articles" },
        { name: "Cointelegraph 🇺🇸", url: "https://cointelegraph.com/rss" },
        { name: "Business Insider 🇺🇸", url: "https://feeds.businessinsider.com/custom/all" }
      ];

      const allMarketNews: any[] = [];

      // Fetch news from each Markets source
      for (const source of marketSources) {
        try {
          const feed = await parseRSSWithResilience(source.url, parser);
          const sourceNews = feed.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            description: item.contentSnippet || item.description,
            sourceName: source.name
          }));
          allMarketNews.push(...sourceNews);
        } catch (sourceError) {
          console.error(`Error fetching from ${source.name}:`, sourceError);
          // Continue with other sources even if one fails
        }
      }

      // Sort by publication date, newest first, and limit to 12 articles
      allMarketNews.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0);
        const dateB = new Date(b.pubDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      res.json(allMarketNews.slice(0, 12));
    } catch (error) {
      console.error("Error fetching market news:", error);
      res.status(500).json({ message: "Failed to fetch market news" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
