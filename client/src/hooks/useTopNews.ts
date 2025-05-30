import { useQuery } from "@tanstack/react-query";
import { RankedNewsItem } from "@shared/schema";
import { useState, useEffect } from "react";

export function useTopNews() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { 
    data: topNews, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<RankedNewsItem[]>({
    queryKey: ['/api/top-news'],
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 15 * 60 * 1000, // 15 minutes to match background processing
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });
  
  // Update lastUpdated when data is refreshed
  useEffect(() => {
    if (topNews) {
      setLastUpdated(new Date());
    }
  }, [topNews]);
  
  // Manual refresh with background processing trigger
  const manualRefresh = async () => {
    // Trigger background processing
    fetch('/api/top-news?refresh=true');
    // Then refetch the cached data after a short delay
    setTimeout(() => {
      refetch();
    }, 1000);
  };
  
  return {
    topNews,
    isLoading,
    isError,
    error,
    refetch,
    manualRefresh,
    lastUpdated
  };
}