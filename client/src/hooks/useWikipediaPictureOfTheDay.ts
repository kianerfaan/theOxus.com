import { useQuery } from "@tanstack/react-query";
import { RssItem } from "@shared/schema";
import { useState, useEffect } from "react";

// NOTE: This hook is deprecated and no longer used.
// The functionality has been moved directly into the WikipediaPictureOfTheDay component
// to ensure we use the same data source as the News Feed card.

// Extend RssItem to include the imageUrl field
interface PictureOfTheDayItem extends RssItem {
  imageUrl?: string;
}

export function useWikipediaPictureOfTheDay() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [wikipediaPicture, setWikipediaPicture] = useState<RssItem | null>(null);
  
  // Deprecated: Code moved directly to WikipediaPictureOfTheDay component
  // Use the '/api/news?sourceId=2' endpoint directly in the component
  const { 
    data: pictures, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<RssItem[]>({
    queryKey: ['/api/news?sourceId=2'],
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Don't refetch automatically since this hook is deprecated
    enabled: false, // Disable the query since this hook is deprecated
  });
  
  // Get the image URL from the content
  const getImageUrl = (): string | null => null;
  
  return {
    wikipediaPicture: null,
    imageUrl: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve(),
    lastUpdated: null
  };
}