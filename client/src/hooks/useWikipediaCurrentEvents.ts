import { useQuery } from "@tanstack/react-query";
import { RssItem } from "@shared/schema";
import { useState, useEffect } from "react";

export function useWikipediaCurrentEvents() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { 
    data: wikipediaEvents, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<RssItem[]>({
    queryKey: ['/api/wikipedia-current-events'],
    refetchOnWindowFocus: true,
    staleTime: 3 * 60 * 1000, // 3 minutes - shorter stale time for more frequent updates
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
  
  // Update lastUpdated when data is refreshed
  useEffect(() => {
    if (wikipediaEvents && wikipediaEvents.length > 0) {
      setLastUpdated(new Date());
    }
  }, [wikipediaEvents]);
  
  // Periodically refresh data
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Performing scheduled Wikipedia refresh");
      refetch();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    // Initial fetch
    refetch();
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  return {
    wikipediaEvents,
    isLoading,
    isError,
    error,
    refetch,
    lastUpdated
  };
}