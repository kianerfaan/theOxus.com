/**
 * theOxus - Optimized Date Utilities Module
 * 
 * High-performance C implementation with TypeScript fallbacks
 * for RSS feed date processing. Uses compiled C functions for 
 * maximum performance while maintaining full compatibility.
 * 
 * @license Apache-2.0
 */

import path from 'path';
import { createRequire } from 'module';

// Try to load the compiled C module, fallback to TypeScript if unavailable
let nativeDateUtils: any = null;
try {
  const require = createRequire(import.meta.url);
  nativeDateUtils = require(path.join(process.cwd(), 'native/build/Release/dateutils.node'));
  console.log('✅ C date utilities module loaded successfully');
} catch (error) {
  console.warn('⚠️  C module not available, using TypeScript fallbacks:', (error as Error).message);
}

// Constants for fallback implementations
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

// Fallback implementation - TypeScript date parsing
function parseRSSDateFallback(pubDate?: string, isoDate?: string): Date | null {
  const dateString = pubDate || isoDate;
  
  if (!dateString) {
    return null;
  }
  
  try {
    const parsedDate = new Date(dateString);
    
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - WEEK_MS);
    const oneHourInFuture = new Date(now.getTime() + HOUR_MS);
    
    if (parsedDate < oneWeekAgo || parsedDate > oneHourInFuture) {
      return null;
    }
    
    return parsedDate;
  } catch (error) {
    return null;
  }
}

// Fallback implementation - TypeScript date formatting
function formatArticleDateFallback(date: Date): string {
  const now = Date.now();
  const timestamp = date.getTime();
  const diffMs = now - timestamp;
  
  if (diffMs < MINUTE_MS) {
    return "Just now";
  } else if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffMs < WEEK_MS) {
    const days = Math.floor(diffMs / DAY_MS);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Fallback implementation - TypeScript article filtering
function filterRecentArticlesFallback<T>(
  articles: T[], 
  getPubDate: (article: T) => string
): T[] {
  const now = new Date();
  const timeWindows = [2, 6, 12, 24]; // hours
  
  for (const hours of timeWindows) {
    const cutoff = new Date(now.getTime() - hours * HOUR_MS);
    
    const filtered = articles.filter(article => {
      const pubDateString = getPubDate(article);
      const pubDate = parseRSSDateFallback(pubDateString);
      
      return pubDate && pubDate >= cutoff;
    });
    
    console.log(`Found ${filtered.length} articles from the past ${hours} hours`);
    
    if (filtered.length >= 5) {
      return filtered;
    }
  }
  
  const validArticles = articles.filter(article => {
    const pubDateString = getPubDate(article);
    const pubDate = parseRSSDateFallback(pubDateString);
    return pubDate !== null;
  });
  
  console.log(`Using ${validArticles.length} articles with valid publication dates`);
  return validArticles;
}



/**
 * Optimized RSS date parsing using C implementation with fallback
 * 
 * @param pubDate - The publication date from RSS feed
 * @param isoDate - Alternative ISO date from RSS feed
 * @returns Normalized Date object or null if date is invalid/too old
 */
export function parseRSSDateOptimized(pubDate?: string, isoDate?: string): Date | null {
  // Try C implementation first
  if (nativeDateUtils) {
    try {
      return nativeDateUtils.parseRSSDate(pubDate, isoDate);
    } catch (error) {
      console.warn('C parseRSSDate failed, using fallback:', error);
    }
  }
  
  // Fallback to TypeScript implementation
  return parseRSSDateFallback(pubDate, isoDate);
}

/**
 * Optimized article filtering using C implementation with fallback
 * 
 * @param articles - Array of articles to filter
 * @param getPubDate - Function to extract publication date from article
 * @returns Filtered articles with valid recent publication dates
 */
export function filterRecentArticlesOptimized<T>(
  articles: T[], 
  getPubDate: (article: T) => string
): T[] {
  if (articles.length === 0) {
    return [];
  }
  
  // Try C implementation for performance-critical filtering
  if (nativeDateUtils) {
    try {
      // Use C filterByTimeWindow for efficient time-based filtering
      const timeWindows = [2, 6, 12, 24]; // hours
      const now = Date.now();
      
      // Convert articles to timestamps for C processing
      const timestamps = articles.map(article => {
        const pubDate = parseRSSDateOptimized(getPubDate(article));
        return pubDate ? pubDate.getTime() : 0;
      });
      
      for (const hours of timeWindows) {
        const validIndices = nativeDateUtils.filterByTimeWindow(timestamps, hours);
        const filtered = validIndices.map((index: number) => articles[index]);
        
        console.log(`Found ${filtered.length} articles from the past ${hours} hours`);
        
        if (filtered.length >= 5) {
          return filtered;
        }
      }
      
      // Return all articles with valid timestamps
      const validIndices = timestamps
        .map((timestamp, index) => timestamp > 0 ? index : -1)
        .filter(index => index >= 0);
      
      const validArticles = validIndices.map(index => articles[index]);
      console.log(`Using ${validArticles.length} articles with valid publication dates`);
      return validArticles;
      
    } catch (error) {
      console.warn('C filterByTimeWindow failed, using fallback:', error);
    }
  }
  
  // Fallback to TypeScript implementation
  return filterRecentArticlesFallback(articles, getPubDate);
}

/**
 * Optimized relative time formatting using C implementation with fallback
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatArticleDateOptimized(date: Date): string {
  // Try C implementation first
  if (nativeDateUtils) {
    try {
      return nativeDateUtils.formatArticleDate(date);
    } catch (error) {
      console.warn('C formatArticleDate failed, using fallback:', error);
    }
  }
  
  // Fallback to TypeScript implementation
  return formatArticleDateFallback(date);
}

/**
 * Performance testing function to compare C vs TypeScript implementations
 */
export function benchmarkDateOperations(iterations: number = 10000): {
  parseTime: number;
  formatTime: number;
  filterTime: number;
  usingCModule: boolean;
} {
  const testDates = [
    '2025-05-30T05:00:00Z',
    'Thu, 30 May 2025 05:00:00 GMT',
    '2025-05-30 05:00:00',
    '2025-05-30T05:00:00.123Z'
  ];
  
  const testArticles = Array.from({ length: 1000 }, (_, i) => ({
    id: i.toString(),
    pubDate: testDates[i % testDates.length]
  }));
  
  // Benchmark parsing
  const parseStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    parseRSSDateOptimized(testDates[i % testDates.length]);
  }
  const parseTime = performance.now() - parseStart;
  
  // Benchmark formatting
  const testDate = new Date();
  const formatStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    formatArticleDateOptimized(testDate);
  }
  const formatTime = performance.now() - formatStart;
  
  // Benchmark filtering
  const filterStart = performance.now();
  for (let i = 0; i < 100; i++) {
    filterRecentArticlesOptimized(testArticles, article => article.pubDate);
  }
  const filterTime = performance.now() - filterStart;
  
  return { 
    parseTime, 
    formatTime, 
    filterTime, 
    usingCModule: nativeDateUtils !== null 
  };
}