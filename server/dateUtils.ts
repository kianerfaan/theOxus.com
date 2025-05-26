/**
 * theOxus - Date Utilities Module
 * 
 * This module provides utilities for handling RSS feed publication dates
 * with proper timezone handling and validation.
 * 
 * @license Apache-2.0
 */

/**
 * Parses and normalizes RSS feed publication dates
 * Handles various date formats and timezones commonly found in RSS feeds
 * 
 * @param pubDate - The publication date from RSS feed
 * @param isoDate - Alternative ISO date from RSS feed
 * @returns Normalized Date object or null if date is invalid/too old
 */
export function parseRSSDate(pubDate?: string, isoDate?: string): Date | null {
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
 * Filters articles based on their publication time
 * Uses multiple time windows as fallback if not enough recent articles are found
 * 
 * @param articles - Array of articles to filter
 * @param getPubDate - Function to extract publication date from article
 * @returns Filtered articles with valid recent publication dates
 */
export function filterRecentArticles<T>(
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
      const pubDate = parseRSSDate(pubDateString);
      
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
    const pubDate = parseRSSDate(pubDateString);
    return pubDate !== null;
  });
  
  console.log(`Using ${validArticles.length} articles with valid publication dates`);
  return validArticles;
}

/**
 * Formats a date for consistent display
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatArticleDate(date: Date): string {
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