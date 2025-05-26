import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Newspaper } from "lucide-react";
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
    const { topNews, isLoading, isError, refetch } = useTopNews();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
    const [loadTime, setLoadTime] = useState<number | null>(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [avgLoadTime, setAvgLoadTime] = useState<number | null>(null);
    
    // Start timer when loading begins
    useEffect(() => {
      if (isLoading && !isTimerActive) {
        setLoadStartTime(Date.now());
        setLoadTime(null);
        setElapsedTime(0);
        setShowSpinner(false);
        setIsTimerActive(true);
      } else if (!isLoading) {
        setIsTimerActive(false);
      }
    }, [isLoading, isTimerActive]);
    
    // Handle elapsed time counter
    useEffect(() => {
      let timer: NodeJS.Timeout;
      
      if (isTimerActive) {
        timer = setInterval(() => {
          setElapsedTime(prev => {
            const newTime = prev + 0.1;
            if (newTime >= 7) {
              setShowSpinner(true);
            }
            return newTime;
          });
        }, 100); // Update every 100ms for smooth decimal counting
      }
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [isTimerActive]);
    
    // Calculate load time when loading completes
    useEffect(() => {
      if (!isLoading && loadStartTime) {
        const endTime = Date.now();
        const timeTaken = (endTime - loadStartTime) / 1000;
        setLoadTime(timeTaken);
        setLoadStartTime(null);
        setShowSpinner(false);
      }
    }, [isLoading, loadStartTime]);

    // Fetch 30-day average load time
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
      
      // Update average load time every 5 minutes
      const interval = setInterval(fetchAvgLoadTime, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }, []);
    
    // Expose the refresh method to parent components via ref
    useImperativeHandle(ref, () => ({
      refreshTopNews: () => {
        console.log("Refreshing top news");
        setIsRefreshing(true);
        setLoadStartTime(null);
        setLoadTime(null);
        setElapsedTime(0);
        setShowSpinner(false);
        setIsTimerActive(false);
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
            <div className="relative py-4">
              <div className="flex flex-col items-center">
                {showSpinner ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-3"></div>
                    <span className="text-lg font-bold text-primary">Loading top news...</span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-primary">Loading top news...</span>
                )}
              </div>
              
              {/* Timer in bottom right corner */}
              <div className="absolute bottom-2 right-2">
                <span className="text-2xl font-bold text-primary">{elapsedTime.toFixed(1)}s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
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
                <div className="text-right">
                  <p className="text-sm text-primary/70">
                    Story Published: {format(new Date(topArticle.pubDate), 'h:mm a')}
                  </p>
                  {loadTime !== null && (
                    <p className="text-sm text-primary/70">
                      Load Time: {loadTime.toFixed(2)}s{avgLoadTime !== null ? ` (Avg. ${avgLoadTime.toFixed(2)}s)` : ''}
                    </p>
                  )}
                </div>
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