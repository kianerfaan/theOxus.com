import { useWikipediaCurrentEvents } from "@/hooks/useWikipediaCurrentEvents";
import { format } from "date-fns";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "./ArticleCard";

interface WikipediaCurrentEventsProps {
  onError: (message: string) => void;
}

export default function WikipediaCurrentEvents({ onError }: WikipediaCurrentEventsProps) {
  const {
    wikipediaEvents,
    isLoading,
    isError,
    refetch,
    lastUpdated
  } = useWikipediaCurrentEvents();
  
  const formattedDate = lastUpdated 
    ? format(lastUpdated, "MMMM d, yyyy • h:mm a")
    : null;
  
  // Handle errors
  if (isError) {
    onError("Failed to load Wikipedia Current Events. Please try again.");
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Wikipedia Current Events</h2>
        
        <div className="flex items-center gap-2">
          {formattedDate && (
            <span className="text-xs text-gray-500">
              Last updated: {formattedDate}
            </span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={isLoading}
            onClick={() => refetch()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
      
      {isLoading && !wikipediaEvents ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading Wikipedia Current Events...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Failed to load Wikipedia Current Events. Please try again.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      ) : wikipediaEvents && wikipediaEvents.length > 0 ? (
        <div className="space-y-6">
          {wikipediaEvents.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No updates available</h3>
          <p className="text-gray-500">There are no Wikipedia Current Events updates at this time.</p>
        </div>
      )}
    </div>
  );
}