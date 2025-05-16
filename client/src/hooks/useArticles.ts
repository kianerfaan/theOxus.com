/**
 * theOxus - Articles Data Hook
 * 
 * This hook fetches and manages news articles from the API,
 * with support for filtering by source and automatic refresh.
 * 
 * @license Apache-2.0
 */

import { useQuery } from "@tanstack/react-query";
import { RssItem } from "@shared/schema";
import { useState, useEffect } from "react";

/**
 * Custom hook for fetching and managing articles data
 * 
 * Features:
 * - Fetch articles with optional source filtering
 * - Automatic refresh every 5 minutes
 * - Manual refresh capability
 * - Last updated timestamp tracking
 * 
 * @param sourceId - Optional ID to filter articles by source
 * @returns Object containing articles, loading state, error state, refresh function, and last updated timestamp
 */
export function useArticles(sourceId?: number) {
  // Track when the data was last refreshed
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Create the API URL with an optional sourceId parameter
  const url = sourceId 
    ? `/api/news?sourceId=${sourceId}`
    : '/api/news';
  
  // Fetch articles data using React Query
  const { 
    data: articles, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<RssItem[]>({
    queryKey: [url],
    refetchOnWindowFocus: true,
    staleTime: 3 * 60 * 1000, // 3 minutes - shorter stale time for more frequent updates
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
  
  // Update lastUpdated timestamp when new data is received
  useEffect(() => {
    if (articles && articles.length > 0) {
      setLastUpdated(new Date());
    }
  }, [articles]);
  
  /**
   * Enhanced refetch function that updates the timestamp
   * This provides immediate feedback to the user when they click refresh
   */
  const refetchWithTimestamp = async () => {
    // Update timestamp immediately when refresh is clicked
    setLastUpdated(new Date());
    return await refetch();
  };
  
  // Set up periodic data refresh for redundancy
  // This complements React Query's built-in refetchInterval
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Performing scheduled news refresh");
      refetch();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    // Initial fetch when the component mounts
    refetch();
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  // Return all the data and functions needed by components
  return {
    articles,         // The fetched articles
    isLoading,        // Loading state
    isError,          // Error state
    error,            // Error details
    refetch: refetchWithTimestamp,  // Enhanced refetch function
    lastUpdated       // Timestamp of last update
  };
}
