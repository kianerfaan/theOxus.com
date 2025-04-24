import { useQuery } from "@tanstack/react-query";
import { RssItem } from "@shared/schema";
import { useState, useEffect } from "react";

export function useArticles(sourceId?: number) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Create the URL with an optional sourceId parameter
  const url = sourceId 
    ? `/api/news?sourceId=${sourceId}`
    : '/api/news';
  
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
  
  // Update lastUpdated when data is refreshed
  useEffect(() => {
    if (articles && articles.length > 0) {
      setLastUpdated(new Date());
    }
  }, [articles]);
  
  // Periodically refresh data with more aggressive timing
  // This is in addition to the refetchInterval for redundancy
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Performing scheduled news refresh");
      refetch();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    // Initial fetch
    refetch();
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  return {
    articles,
    isLoading,
    isError,
    error,
    refetch,
    lastUpdated
  };
}
