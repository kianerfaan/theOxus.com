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
    refetchOnWindowFocus: true,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
  });
  
  // Update lastUpdated when data is refreshed
  useEffect(() => {
    if (topNews) {
      setLastUpdated(new Date());
    }
  }, [topNews]);
  
  return {
    topNews,
    isLoading,
    isError,
    error,
    refetch,
    lastUpdated
  };
}