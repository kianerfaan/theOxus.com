import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RssItem } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function WikipediaPictureOfTheDay() {
  const [picture, setPicture] = useState<RssItem | null>(null);

  // Direct fetching from the specified feed URL
  const { data: pictures, isLoading, error } = useQuery<RssItem[]>({
    queryKey: ['/api/news?sourceId=2'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
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
  const formattedDate = picture?.pubDate 
    ? format(new Date(picture.pubDate), 'MMMM d, yyyy • h:mm:ss a') 
    : '';

  // Create a clean title for display
  const parseTitle = (title: string): string => {
    if (!title) return 'Picture of the Day';
    // Remove "Wikipedia:Picture of the day/" prefix if it exists
    const titleWithoutPrefix = title.replace(/Wikipedia:Picture of the day\//, '');
    // Remove "Wikimedia Commons picture of the day for" prefix if it exists
    const titleWithoutWikimediaPrefix = titleWithoutPrefix.replace(/Wikimedia Commons picture of the day for /, '');
    // Remove any date in parentheses
    return titleWithoutWikimediaPrefix.replace(/\s*\(.*?\)\s*/, '');
  };

  const displayTitle = picture?.title 
    ? parseTitle(picture.title)
    : 'Picture of the Day';

  // Truncate description to 300 characters at the end of a word and add ellipsis
  const truncateDescription = (content: string): string => {
    if (!content) return '';

    if (content.length <= 300) return content;

    // Find the last space within the first 300 characters
    const lastSpaceIndex = content.substring(0, 300).lastIndexOf(' ');

    if (lastSpaceIndex === -1) {
      // If no space found, just cut at 300
      return content.substring(0, 300) + '...';
    }

    // Cut at the last space and add ellipsis
    return content.substring(0, lastSpaceIndex) + '...';
  };

  if (isLoading) {
    return (
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-[220px] w-full md:w-[330px] bg-gray-200 animate-pulse rounded" />
            <div className="flex-1">
              <div className="h-6 w-3/4 mb-2 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-full mb-2 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-full mb-2 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Always show a placeholder if there's an error or no image
  if (error || !picture || !imageUrl) {
    return (
      <Card className="mb-2 overflow-hidden shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-[330px] flex-shrink-0 flex items-center justify-center bg-gray-100 h-[220px]">
              <p className="text-gray-500 text-sm">Picture of the Day unavailable</p>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Picture of the Day</h3>
              <p className="text-gray-500 text-sm">
                Image could not be loaded. Please check your connection or try again later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Truncate the content and add ellipsis
  const truncatedContent = picture.contentSnippet ? truncateDescription(picture.contentSnippet) : '';
  const isContentTruncated = picture.contentSnippet && picture.contentSnippet.length > 300;

  return (
    <Card className="mb-2 overflow-hidden shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left side: Image */}
          <div className="relative md:w-[330px] flex-shrink-0">
            <a 
              href="https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              title="Picture of the Day"
            >
              <img 
                src={imageUrl} 
                alt="Picture of the Day" 
                className="w-auto mx-auto h-auto max-h-[250px]" 
              />
            </a>
          </div>

          {/* Right side: Text description */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
            <p className="text-sm text-muted-foreground mb-2">{formattedDate}</p>
            <div className="text-sm">
              {truncatedContent && (
                <div dangerouslySetInnerHTML={{ __html: truncatedContent }} />
              )}
              </div>
            <a 
              href="https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-sm text-primary hover:underline"
            >
              Visit Wikipedia
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}