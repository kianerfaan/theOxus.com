import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { useFeeds } from "@/hooks/useFeeds";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
  selectedSourceId?: number;
  title?: string;
}

export default function Toolbar({ lastUpdated, isLoading, onRefresh, selectedSourceId, title }: ToolbarProps) {
  const { data: sources = [] } = useFeeds();
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [cooldown, setCooldown] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  
  // Function to handle refresh with cooldown
  const handleRefresh = useCallback(() => {
    // Call the actual refresh function
    onRefresh();
    
    // Set the cooldown to 30 seconds
    setCooldown(30);
    setIsOnCooldown(true);
  }, [onRefresh]);
  
  // Handle the countdown timer with useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isOnCooldown && cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            setIsOnCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldown, isOnCooldown]);
  
  useEffect(() => {
    if (selectedSourceId !== undefined) {
      setSelectedSource(selectedSourceId.toString());
    } else {
      setSelectedSource("all");
    }
  }, [selectedSourceId]);
  
  const formattedTime = lastUpdated
    ? format(lastUpdated, "MMMM d, yyyy • h:mm:ss a")
    : "Not yet updated";
    
  const displayText = isLoading ? "Updating..." : formattedTime;
  
  return (
    <div className="toolbar sticky top-0 z-10 pt-1 pb-1 mb-2 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 px-2">
        <div className="flex justify-between items-center md:block">
          <h2 className="text-lg md:text-xl font-bold text-primary">
            {title 
              ? title
              : selectedSourceId 
                ? sources.find(s => s.id === selectedSourceId)?.name || "Feed"
                : displayText}
          </h2>
          
          {/* Mobile refresh button */}
          <Button
            variant="outline" 
            size="sm"
            className={cn(
              "md:hidden flex items-center border-none shadow-sm",
              isOnCooldown || isLoading 
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : "bg-primary text-white hover:bg-primary/80"
            )}
            onClick={handleRefresh}
            disabled={isLoading || isOnCooldown}
          >
            {isOnCooldown ? (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{cooldown}</span>
              </div>
            ) : (
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            )}
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          {isOnCooldown && (
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{cooldown}s</span>
            </div>
          )}
          <Button
            variant="outline" 
            size="sm"
            className={cn(
              "hidden md:flex items-center border-none shadow-sm",
              isOnCooldown || isLoading 
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : "bg-primary text-white hover:bg-primary/80"
            )}
            onClick={handleRefresh}
            disabled={isLoading || isOnCooldown}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
