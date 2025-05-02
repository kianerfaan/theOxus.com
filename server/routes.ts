import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Parser from "rss-parser";
import { z } from "zod";
import { insertFeedSourceSchema, type RssItem } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['description', 'contentSnippet']
      ]
    }
  });
  
  // Add new endpoint for Wikipedia Current Events
  app.get("/api/wikipedia-current-events", async (req: Request, res: Response) => {
    try {
      const sources = await storage.getActiveFeedSources();
      const wikipediaSource = sources.find(source => source.name === "Wikipedia Current Events");
      
      if (!wikipediaSource) {
        return res.json([]);
      }
      
      try {
        const feed = await parser.parseURL(wikipediaSource.url);
        
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
          
          const item = {
            id: latestItem.guid || latestItem.link || `${wikipediaSource.id}-${latestItem.title}`,
            title: latestItem.title || "No Title",
            link: latestItem.link || "",
            pubDate: latestItem.pubDate || new Date().toISOString(),
            content: content,
            contentSnippet: content,
            source: wikipediaSource.url,
            sourceName: wikipediaSource.name,
            isWikipediaCurrentEvents: true
          };
          
          return res.json([item]);
        }
        
        return res.json([]);
        
      } catch (error) {
        console.error("Error fetching Wikipedia Current Events:", error);
        res.status(500).json({ message: "Failed to fetch Wikipedia Current Events" });
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
          
          // Normal handling for other sources
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
      
      // Sort by publication date, newest first
      allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      res.json(allItems);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news feeds" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
