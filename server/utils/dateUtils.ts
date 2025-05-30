/**
 * theOxus - Date Utilities Module
 * 
 * This module provides utilities for handling RSS feed publication dates
 * with proper timezone handling and validation.
 * 
 * Now includes optimized C-style implementations with fallback support.
 * 
 * @license Apache-2.0
 */

import { 
  parseRSSDateOptimized, 
  filterRecentArticlesOptimized, 
  formatArticleDateOptimized 
} from './dateUtilsOptimized.js';
import { performanceMonitor } from './performanceMonitor.js';

/**
 * Original parseRSSDate implementation (kept as fallback)
 */
function parseRSSDateOriginal(pubDate?: string, isoDate?: string): Date | null {
  // Try to parse the provided dates
  const dateString = pubDate || isoDate;
  
  if (!dateString) {
    return null; // Don't use current time as fallback
  }
  
  try {
    const parsedDate = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    
    // Check if the date is reasonable (not too far in the future or past)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneHourInFuture = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Reject dates that are more than a week old or more than an hour in the future
    if (parsedDate < oneWeekAgo || parsedDate > oneHourInFuture) {
      return null;
    }
    
    return parsedDate;
  } catch (error) {
    console.warn(`Failed to parse date: ${dateString}`, error);
    return null;
  }
}

/**
 * Parses and normalizes RSS feed publication dates
 * Uses optimized C-style implementation with fallback to original
 * 
 * @param pubDate - The publication date from RSS feed
 * @param isoDate - Alternative ISO date from RSS feed
 * @returns Normalized Date object or null if date is invalid/too old
 */
export function parseRSSDate(pubDate?: string, isoDate?: string): Date | null {
  return performanceMonitor.measure('parseRSSDate', () => {
    try {
      // Use optimized implementation
      const result = parseRSSDateOptimized(pubDate, isoDate);
      return result;
    } catch (error) {
      console.warn('Optimized date parsing failed, falling back to original implementation:', error);
      // Record fallback usage
      return performanceMonitor.measure('parseRSSDate', () => parseRSSDateOriginal(pubDate, isoDate), undefined, false);
    }
  });
}

/**
 * Original filterRecentArticles implementation (kept as fallback)
 */
function filterRecentArticlesOriginal<T>(
  articles: T[], 
  getPubDate: (article: T) => string
): T[] {
  const now = new Date();
  
  // Try different time windows
  const timeWindows = [2, 6, 12, 24]; // hours
  
  for (const hours of timeWindows) {
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const filtered = articles.filter(article => {
      const pubDateString = getPubDate(article);
      const pubDate = parseRSSDateOriginal(pubDateString);
      
      // Only include articles with valid, recent publication dates
      return pubDate && pubDate >= cutoff;
    });
    
    console.log(`Found ${filtered.length} articles from the past ${hours} hours`);
    
    // If we have enough articles, use this time window
    if (filtered.length >= 5) {
      return filtered;
    }
  }
  
  // If we still don't have enough articles, return all articles with valid dates
  const validArticles = articles.filter(article => {
    const pubDateString = getPubDate(article);
    const pubDate = parseRSSDateOriginal(pubDateString);
    return pubDate !== null;
  });
  
  console.log(`Using ${validArticles.length} articles with valid publication dates`);
  return validArticles;
}

/**
 * Filters articles based on their publication time
 * Uses optimized C-style implementation with fallback to original
 * 
 * @param articles - Array of articles to filter
 * @param getPubDate - Function to extract publication date from article
 * @returns Filtered articles with valid recent publication dates
 */
export function filterRecentArticles<T>(
  articles: T[], 
  getPubDate: (article: T) => string
): T[] {
  return performanceMonitor.measure('filterRecentArticles', () => {
    try {
      // Use optimized implementation
      return filterRecentArticlesOptimized(articles, getPubDate);
    } catch (error) {
      console.warn('Optimized article filtering failed, falling back to original implementation:', error);
      // Record fallback usage
      return performanceMonitor.measure('filterRecentArticles', () => filterRecentArticlesOriginal(articles, getPubDate), articles.length, false);
    }
  }, articles.length);
}

/**
 * Original formatArticleDate implementation (kept as fallback)
 */
function formatArticleDateOriginal(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Formats a date for consistent display
 * Uses optimized C-style implementation with fallback to original
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatArticleDate(date: Date): string {
  return performanceMonitor.measure('formatArticleDate', () => {
    try {
      // Use optimized implementation
      return formatArticleDateOptimized(date);
    } catch (error) {
      console.warn('Optimized date formatting failed, falling back to original implementation:', error);
      // Record fallback usage
      return performanceMonitor.measure('formatArticleDate', () => formatArticleDateOriginal(date), undefined, false);
    }
  });
}