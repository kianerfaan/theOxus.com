import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Newspaper, RefreshCw, Clock } from "lucide-react";
import { useTopNews } from "@/hooks/useTopNews";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface TopNewsCardRefHandle {
  refreshTopNews: () => void;
}

interface TopNewsCardProps {
  isVisible: boolean;
}

const TopNewsCardSkeleton = () => {
  return (
    <Card className="mb-2 overflow-hidden bg-[#F2DC5D] border-2 border-[#E9CD3D] shadow-md">
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
        
        <div className="space-y-3">
          <div className="h-6 bg-primary/20 rounded animate-pulse"></div>
          <div className="h-6 bg-primary/20 rounded animate-pulse"></div>
          <div className="h-4 bg-primary/20 rounded animate-pulse w-3/4"></div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-primary/20 rounded mr-2 animate-pulse"></div>
              <div className="h-4 bg-primary/20 rounded animate-pulse w-20"></div>
            </div>
            
            <div className="h-4 bg-primary/20 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const TopNewsCard = forwardRef<TopNewsCardRefHandle, TopNewsCardProps>(
  function TopNewsCardComponent({ isVisible }, ref) {
    const { topNews, isLoading, isError, manualRefresh, lastUpdated } = useTopNews();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadTime, setLoadTime] = useState<number | null>(null);
    const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
    const [avgLoadTime, setAvgLoadTime] = useState<number | null>(null);
    
    // Track load time for display
    useEffect(() => {
      if (isLoading && !loadStartTime) {
        setLoadStartTime(Date.now());
        setLoadTime(null);
      } else if (!isLoading && loadStartTime) {
        const endTime = Date.now();
        const timeTaken = (endTime - loadStartTime) / 1000;
        setLoadTime(timeTaken);
        setLoadStartTime(null);
      }
    }, [isLoading, loadStartTime]);

    // Fetch average load time
    useEffect(() => {
      const fetchAvgLoadTime = async () => {
        try {
          const response = await fetch('/api/average-load-time');
          if (response.ok) {
            const data = await response.json();
            setAvgLoadTime(data.avgLoadTimeSeconds);
          }
        } catch (error) {
          console.error('Error fetching average load time:', error);
          setAvgLoadTime(null);
        }
      };

      fetchAvgLoadTime();
    }, []);
    
    // Expose the refresh method to parent components via ref
    useImperativeHandle(ref, () => ({
      refreshTopNews: () => {
        console.log("Refreshing top news");
        setIsRefreshing(true);
        manualRefresh().finally(() => {
          setTimeout(() => {
            setIsRefreshing(false);
          }, 1000);
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
            
            <div className="flex flex-col items-center py-8">
              <TrendingUp className="h-12 w-12 text-primary/60 mb-4" />
              <p className="text-primary/80 text-center font-medium">
                Failed to load top news. Please try again later.
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
              className="group block hover:bg-primary/5 -m-2 p-2 rounded-lg transition-colors"
            >
              <h3 className="text-2xl font-bold text-primary text-center mb-8 group-hover:text-primary/80 transition-colors leading-tight uppercase">
                {topArticle.title}
              </h3>
              
              <div className="flex justify-between items-end text-sm text-primary">
                <div className="flex items-center">
                  <Newspaper className="h-4 w-4 mr-2" />
                  <span className="font-bold">{topArticle.sourceName}</span>
                </div>
                
                <div className="text-right">
                  <div className="mb-1 font-medium">
                    Story Published: {format(new Date(topArticle.pubDate), "h:mm a")}
                  </div>
                  <div className="font-medium">
                    {loadTime ? (
                      <>Load Time: {loadTime.toFixed(2)}s{avgLoadTime && ` (Avg. ${avgLoadTime.toFixed(2)}s)`}</>
                    ) : (
                      <>Load Time: Instant{avgLoadTime && ` (Avg. ${avgLoadTime.toFixed(2)}s)`}</>
                    )}
                  </div>
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Add the perimeter animation styles
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