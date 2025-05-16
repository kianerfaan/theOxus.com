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
import { storage } from "./storage";
import Parser from "rss-parser";
import { z } from "zod";
import { insertFeedSourceSchema, type RssItem, type RankedNewsItem } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { rankNewsArticles } from "./mistral";
import { getOxusHeadlines } from "./oxus";

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
        const feed = await parser.parseURL(wikipediaSource.url);
        
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
        
        return res.json(null);
      } catch (error) {
        console.error("Error fetching Wikipedia Picture of the Day:", error);
        
        // Fallback to direct fetch if parser fails
        try {
          const response = await fetch(potdSource.url);
          const data = await response.text();
          
          // Extract image URL from media:content tag or as a fallback from img tag
          let imageUrl = null;
          
          // Try to extract media:content tag
          const mediaRegex = /<media:content[^>]+url="([^"]+)"[^>]*\/>/i;
          const mediaMatch = data.match(mediaRegex);
          if (mediaMatch && mediaMatch[1]) {
            imageUrl = mediaMatch[1];
            // Add https: if the URL starts with //
            if (imageUrl && imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            }
          }
          
          // Fallback to img tag
          if (!imageUrl) {
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/i;
            const imgMatch = data.match(imgRegex);
            imageUrl = imgMatch ? imgMatch[1] : null;
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
      res.json(sources);
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

  // Create a new feed source
  app.post("/api/sources", async (req: Request, res: Response) => {
    try {
      const sourceData = insertFeedSourceSchema.parse(req.body);
      
      // Validate that the URL is a valid RSS feed by trying to fetch it
      try {
        await parser.parseURL(sourceData.url);
      } catch (error) {
        return res.status(400).json({ message: "Invalid RSS feed URL. Unable to parse the feed." });
      }
      
      const source = await storage.createFeedSource(sourceData);
      res.status(201).json(source);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid data format",
          errors: fromZodError(error).message
        });
      }
      console.error("Error creating feed source:", error);
      res.status(500).json({ message: "Failed to create feed source" });
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
          await parser.parseURL(updateData.url);
        } catch (error) {
          return res.status(400).json({ message: "Invalid RSS feed URL. Unable to parse the feed." });
        }
      }

      const updatedSource = await storage.updateFeedSource(id, updateData);
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

  // Delete a feed source
  app.delete("/api/sources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid source ID" });
      }

      const source = await storage.getFeedSource(id);
      if (!source) {
        return res.status(404).json({ message: "Feed source not found" });
      }

      await storage.deleteFeedSource(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting feed source:", error);
      res.status(500).json({ message: "Failed to delete feed source" });
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
          const feed = await parser.parseURL(source.url);
          
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
            
          return feed.items.map(item => ({
            id: item.guid || item.link || `${source.id}-${item.title}`,
            title: item.title || "No Title",
            link: item.link || "",
            pubDate: item.pubDate || new Date().toISOString(),
            content: item.content || item.contentSnippet || "",
            contentSnippet: item.contentSnippet || "",
            source: source.url,
            sourceName: source.name,
            isWikipediaCurrentEvents: false
          }));
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

  /**
   * Top News API endpoint with AI-powered ranking
   * 
   * Fetches news from all active sources, analyzes them using Mistral AI,
   * and returns a ranked list of the most important current news articles.
   * 
   * Features:
   * - Aggregates articles from multiple sources
   * - Filters to recent articles (prioritizing last 2 hours)
   * - Uses AI analysis for ranking importance and relevance
   * - Ensures content safety by filtering out self-references
   * 
   * Route: GET /api/top-news
   * 
   * @returns JSON array of ranked news articles with scores
   * @throws 500 error if fetching or ranking fails
   */
  app.get("/api/top-news", async (req: Request, res: Response) => {
    try {
      // Get all active news sources from storage
      const activeSources = await storage.getActiveFeedSources();
      
      // Return empty array if no sources are configured or active
      if (activeSources.length === 0) {
        console.log('No active sources found for top news');
        return res.json([]);
      }
      
      // Filter out non-news sources and self-references to theOxus.com for content integrity
      const newsSources = activeSources.filter(source => 
        (source.category === "News" || 
        source.url.includes('news') ||
        source.name.toLowerCase().includes('news') ||
        source.isActive === true) && 
        !source.name.includes('theOxus') &&
        !source.url.includes('theoxus.com')
      );
      
      // Use all sources if we couldn't identify specific news sources
      const sourcesToUse = newsSources.length > 0 ? newsSources : activeSources;
      
      console.log(`Aggregating articles from ${sourcesToUse.length} sources for top news analysis`);
      
      try {
        // Fetch articles from ALL selected news sources
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
          return res.json([]);
        }
        
        // Filter out any articles from theOxus.com (extra safety)
        const filteredArticles = allArticles.filter(article => 
          !article.source.includes('theoxus.com') && 
          !article.sourceName.includes('theOxus')
        );
        
        console.log(`Collected ${filteredArticles.length} total articles from all sources (after filtering)`);
        
        // Replace allArticles with the filtered version
        allArticles.length = 0;
        allArticles.push(...filteredArticles);
        
        // Rank articles using Mistral AI
        const rankedArticles = await rankNewsArticles(allArticles);
        
        console.log(`Ranked ${rankedArticles.length} articles from all sources`);
        
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

  const httpServer = createServer(app);
  return httpServer;
}
