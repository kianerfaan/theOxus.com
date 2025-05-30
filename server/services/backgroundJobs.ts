/**
 * theOxus - Background Job System
 * 
 * This module handles background processing for top news analysis
 * to provide instant loading while maintaining fresh AI-curated content.
 * 
 * @license Apache-2.0
 */

import { storage } from "../core/storage";
import { rankNewsArticles } from "./mistral";
import { parseRSSDate } from "../utils/dateUtils";
import Parser from "rss-parser";
import type { RankedNewsItem } from "@shared/schema";
import { rssHttpClient, RSS_CIRCUIT_BREAKER_CONFIG } from '../utils/resilience';

// Background cache for pre-processed top news
let backgroundTopNewsCache: { 
  data: RankedNewsItem[]; 
  timestamp: number; 
  isProcessing: boolean;
} | null = null;

const BACKGROUND_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let backgroundJobInterval: NodeJS.Timeout | null = null;

/**
 * RSS parser configuration for background processing
 */
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'contentSnippet']
    ]
  }
});

/**
 * Processes top news in the background using AI ranking
 * This runs every 15 minutes to ensure fresh content
 */
async function processTopNewsInBackground(): Promise<void> {
  if (backgroundTopNewsCache?.isProcessing) {
    console.log('Background job already in progress, skipping...');
    return;
  }

  console.log('Starting background top news processing...');
  
  // Mark as processing
  if (backgroundTopNewsCache) {
    backgroundTopNewsCache.isProcessing = true;
  } else {
    backgroundTopNewsCache = {
      data: [],
      timestamp: 0,
      isProcessing: true
    };
  }

  try {
    const startTime = Date.now();
    
    // Get all active news sources
    const activeSources = await storage.getActiveFeedSources();
    
    if (activeSources.length === 0) {
      console.log('No active sources found for background processing');
      return;
    }

    // Filter to only active sources and exclude blacklisted ones
    const filteredSources = activeSources.filter(source => 
      source.isActive && // Only include sources that are toggled ON
      !source.name.includes('Sportskeeda') &&
      !source.name.includes('ESPN') &&
      !source.name.includes('theOxus') &&
      source.name !== "Wikipedia Current Events" &&
      source.name !== "Wikipedia Picture of the Day"
    );

    console.log(`Aggregating articles from ${filteredSources.length} sources for background processing`);

    // Fetch articles from all sources in parallel
    const fetchPromises = filteredSources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        const articles = feed.items.map(item => {
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
        
        console.log(`Added ${articles.length} articles from "${source.name}"`);
        return articles;
      } catch (error) {
        console.error(`Error fetching feed from ${source.url}:`, error);
        return [];
      }
    });

    // Wait for all feeds to be fetched and flatten the results
    const articleArrays = await Promise.all(fetchPromises);
    const allArticles = articleArrays.flat();

    console.log(`Collected ${allArticles.length} total articles from all sources (after filtering)`);

    if (allArticles.length === 0) {
      console.log('No articles found for background processing');
      return;
    }

    // Rank articles using Mistral AI
    const rankedArticles = await rankNewsArticles(allArticles);
    
    console.log(`Background processing: Ranked ${rankedArticles.length} articles`);

    // Update the background cache
    backgroundTopNewsCache = {
      data: rankedArticles,
      timestamp: Date.now(),
      isProcessing: false
    };

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log(`Background top news processing completed in ${processingTime}ms`);

  } catch (error) {
    console.error('Error in background top news processing:', error);
    
    // Reset processing flag on error
    if (backgroundTopNewsCache) {
      backgroundTopNewsCache.isProcessing = false;
    }
  }
}

/**
 * Starts the background job system
 * Processes top news immediately and then every 15 minutes
 */
export function startBackgroundJobs(): void {
  console.log('Starting background job system...');
  
  // Process immediately on startup
  processTopNewsInBackground();
  
  // Set up recurring job every 15 minutes
  backgroundJobInterval = setInterval(processTopNewsInBackground, BACKGROUND_CACHE_DURATION);
  
  console.log('Background jobs started - top news will be processed every 15 minutes');
}

/**
 * Stops the background job system
 */
export function stopBackgroundJobs(): void {
  if (backgroundJobInterval) {
    clearInterval(backgroundJobInterval);
    backgroundJobInterval = null;
    console.log('Background jobs stopped');
  }
}

/**
 * Gets cached top news data if available
 * Returns null if cache is empty or expired
 */
export function getCachedTopNews(): RankedNewsItem[] | null {
  if (!backgroundTopNewsCache) {
    return null;
  }

  // Check if cache is still valid (within 15 minutes)
  const isValid = (Date.now() - backgroundTopNewsCache.timestamp) < BACKGROUND_CACHE_DURATION;
  
  if (!isValid) {
    return null;
  }

  return backgroundTopNewsCache.data;
}

/**
 * Gets cache status for debugging and user feedback
 */
export function getCacheStatus(): {
  hasCache: boolean;
  lastUpdated: number | null;
  isProcessing: boolean;
  minutesOld: number | null;
} {
  if (!backgroundTopNewsCache) {
    return {
      hasCache: false,
      lastUpdated: null,
      isProcessing: false,
      minutesOld: null
    };
  }

  const minutesOld = Math.floor((Date.now() - backgroundTopNewsCache.timestamp) / (1000 * 60));

  return {
    hasCache: true,
    lastUpdated: backgroundTopNewsCache.timestamp,
    isProcessing: backgroundTopNewsCache.isProcessing,
    minutesOld
  };
}

/**
 * Triggers immediate background processing
 * Used for manual refresh functionality
 */
export async function triggerImmediateProcessing(): Promise<void> {
  console.log('Manual trigger for background processing');
  await processTopNewsInBackground();
}