import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RankedNewsItem } from "@shared/schema";
import { useTopNews } from "@/hooks/useTopNews";
import { Newspaper, TrendingUp, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Helper functions to determine time frames
const isPastTwoHours = (dateStr: string): boolean => {
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  return new Date(dateStr) >= twoHoursAgo;
};

const isPastSixHours = (dateStr: string): boolean => {
  const sixHoursAgo = new Date();
  sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
  return new Date(dateStr) >= sixHoursAgo;
};

const isPastTwelveHours = (dateStr: string): boolean => {
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
  return new Date(dateStr) >= twelveHoursAgo;
};

interface TopNewsCardProps {
  isVisible: boolean;
}

// Define a type for the ref handle
export type TopNewsCardRefHandle = {
  refreshTopNews: () => void;
};

// Skeleton component for loading state
export function TopNewsCardSkeleton() {
  return (
    <Card className="mb-2 overflow-hidden bg-[#F2DC5D] border-2 border-[#E9CD3D] shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-end items-center mb-3">
          <Skeleton className="h-4 w-48 bg-gray-300" />
        </div>
        <div className="flex flex-col items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <span className="text-sm font-medium text-primary/80">Loading top news...</span>
        </div>
        <Skeleton className="h-7 w-full mt-4 bg-gray-300" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-24 bg-gray-300" />
          <Skeleton className="h-4 w-40 bg-gray-300" />
        </div>
      </CardContent>
    </Card>
  );
}

const TopNewsCard = forwardRef<TopNewsCardRefHandle, TopNewsCardProps>(
  function TopNewsCardComponent({ isVisible }, ref) {
    const { topNews, isLoading, isError, refetch } = useTopNews();
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Expose the refresh method to parent components via ref
    useImperativeHandle(ref, () => ({
      refreshTopNews: () => {
        console.log("Refreshing top news");
        setIsRefreshing(true);
        refetch().finally(() => {
          // Add a small delay to ensure animation is visible even for quick responses
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        });
      }
    }));
  
    if (!isVisible) {
      return null;
    }
  
    if (isLoading) {
      return <TopNewsCardSkeleton />;
    }
    
    if (isError || !topNews || topNews.length === 0) {
      return (
        <Card className={cn(
          "mb-2 overflow-hidden shadow-md bg-[#F2DC5D] border-2 border-[#E9CD3D]",
          isRefreshing && "perimeter-animation"
        )}>
          <CardContent className="p-4">
            <div className="flex justify-end items-center mb-3">
              <Badge variant="outline" className="bg-primary text-white text-xs px-2 py-1">
                <a 
                  href="https://mistral.ai/news/mistral-small-3-1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-white"
                >
                  Headline selected by Mistral Small 3.1
                </a>
              </Badge>
            </div>
            
            <div className="mt-3 text-sm text-center">
              <p className="text-muted-foreground">
                No headlines from the past 2 hours available. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Get the top article
    const topArticle = topNews[0];
    
    return (
      <Card className={cn(
        "mb-2 overflow-hidden shadow-md bg-[#F2DC5D] border-2 border-[#E9CD3D]",
        isRefreshing && "perimeter-animation"
      )}>
        <CardContent className="p-4">
          <div className="flex justify-end items-center mb-3">
            <Badge variant="outline" className="bg-primary text-white text-xs px-2 py-1">
              <a 
                href="https://mistral.ai/news/mistral-small-3-1" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                Headline selected by Mistral Small 3.1
              </a>
            </Badge>
          </div>
          
          <div className="mt-3">
            <a 
              href={topArticle.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold text-xl block text-center"
            >
              {topArticle.title.toUpperCase()}
            </a>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <Newspaper className="h-4 w-4 mr-1 text-primary/70" />
                <p className="text-sm font-medium text-primary/80">
                  {topArticle.sourceName}
                </p>
              </div>
              
              {topArticle.pubDate && (
                <p className="text-sm text-primary/70">
                  Story Published: {format(new Date(topArticle.pubDate), 'h:mm a')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Add the CSS for the perimeter animation
const style = document.createElement('style');
style.textContent = `
@keyframes border-flow {
  0% {
    background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
  }
  25% {
    background-position: 100% 0%, 100% 0%, 100% 100%, 0% 100%;
  }
  50% {
    background-position: 100% 0%, 100% 100%, 100% 100%, 0% 100%;
  }
  75% {
    background-position: 100% 0%, 100% 100%, 0% 100%, 0% 100%;
  }
  100% {
    background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
  }
}

.perimeter-animation {
  position: relative;
}

.perimeter-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background: 
    linear-gradient(to right, #F2DC5D, #E9B11C) 0% 0%,
    linear-gradient(to bottom, #E9B11C, #F2DC5D) 100% 0%,
    linear-gradient(to left, #F2DC5D, #E9B11C) 100% 100%,
    linear-gradient(to top, #E9B11C, #F2DC5D) 0% 100%;
  background-size: 50% 50%, 50% 50%, 50% 50%, 50% 50%;
  background-repeat: no-repeat;
  animation: border-flow 1.5s linear infinite;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}
`;
document.head.appendChild(style);

export default TopNewsCard;