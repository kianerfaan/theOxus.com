import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RssItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function PictureOfTheDay() {
  const [picture, setPicture] = useState<RssItem | null>(null);
  
  // Get Wikipedia Picture of the Day (source ID should be 2 based on our setup)
  const { data: pictures, isLoading, error } = useQuery<RssItem[]>({
    queryKey: ['/api/news?sourceId=2'],
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  useEffect(() => {
    if (pictures && pictures.length > 0) {
      // Get the latest picture
      setPicture(pictures[0]);
    }
  }, [pictures]);
  
  // Extract image URL from content if available
  const extractImageUrl = (content: string): string | null => {
    const imgTagRegex = /<img[^>]+src="([^">]+)"/i;
    const match = content.match(imgTagRegex);
    return match ? match[1] : null;
  };
  
  const imageUrl = picture?.content ? extractImageUrl(picture.content) : null;
  const formattedDate = picture?.pubDate ? format(new Date(picture.pubDate), 'MMMM d, yyyy') : '';
  
  if (isLoading) {
    return (
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-0">
          <Skeleton className="h-64 w-full" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !picture || !imageUrl) {
    return null; // Don't show anything if there's an error or no image
  }
  
  return (
    <Card className="mb-6 overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Wikipedia Picture of the Day" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <Badge className="mb-2 bg-secondary">Picture of the Day</Badge>
            <h3 className="text-xl font-bold text-white">{picture.title}</h3>
            <p className="text-sm text-white/80">{formattedDate}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="article-content text-sm" dangerouslySetInnerHTML={{ 
            __html: picture.contentSnippet || ''
          }} />
          <div className="mt-3">
            <a 
              href={picture.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-secondary hover:underline text-sm font-medium"
            >
              View on Wikipedia
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}