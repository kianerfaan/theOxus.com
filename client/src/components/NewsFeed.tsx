import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";
import Toolbar from "./Toolbar";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RssItem } from "@shared/schema";
import { format } from "date-fns";

interface NewsFeedProps {
  selectedSourceId?: number;
  onError: (message: string) => void;
}

export default function NewsFeed({ selectedSourceId, onError }: NewsFeedProps) {
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState<RssItem[]>([]);
  const pageSize = 10;
  
  const {
    articles,
    isLoading,
    isError,
    refetch,
    lastUpdated
  } = useArticles(selectedSourceId);
  
  useEffect(() => {
    setPage(1);
    setAllArticles([]);
  }, [selectedSourceId]);
  
  useEffect(() => {
    if (articles) {
      setAllArticles(articles);
    }
  }, [articles]);
  
  useEffect(() => {
    if (isError) {
      onError("Failed to load news feeds. Please try again.");
    }
  }, [isError, onError]);
  
  const displayedArticles = allArticles.slice(0, page * pageSize);
  
  const loadMore = () => {
    setPage(page + 1);
  };
  
  const hasMore = displayedArticles.length < allArticles.length;
  
  return (
    <main className="flex-1 overflow-y-auto pt-0 md:pt-4 pb-4 px-4 md:px-6 mt-14 md:mt-0">
      <Toolbar 
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        selectedSourceId={selectedSourceId}
      />

      {/* News Feed */}
      <div className="space-y-6">
        {isLoading && articles?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Loading news articles...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p>Failed to load the news feed. Please try again.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adding more feed sources or check your filter settings.</p>
          </div>
        ) : (
          <>
            {displayedArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline"
                  className="px-6 py-3 bg-accent hover:bg-gray-300 text-primary font-medium rounded-md"
                  onClick={loadMore}
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
