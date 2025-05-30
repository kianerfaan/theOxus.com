import { useWikipediaCurrentEvents } from "@/hooks/useWikipediaCurrentEvents";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "./news/ArticleCard";
import Toolbar from "./layout/Toolbar";
import { useEffect } from "react";

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
  
  // Handle errors
  useEffect(() => {
    if (isError) {
      onError("Failed to load Current Events. Please try again.");
    }
  }, [isError, onError]);
  
  return (
    <div className="space-y-4">
      <Toolbar
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={() => refetch()}
      />
      
      {isLoading && !wikipediaEvents ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading Current Events...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Failed to load Current Events. Please try again.</p>
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
          <p className="text-gray-500">There are no Current Events updates at this time.</p>
        </div>
      )}
    </div>
  );
}