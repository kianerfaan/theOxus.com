/**
 * theOxus - NewsFeed Component
 * 
 * This component displays the main news feed, including the ticker tape,
 * top news, and article cards. It manages the fetching and display of
 * articles, with optional filtering by source.
 * 
 * @license Apache-2.0
 */

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import ArticleCard from "./ArticleCard";
import Toolbar from "./Toolbar";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RssItem } from "@shared/schema";
import { format } from "date-fns";
import PictureOfTheDay from "./PictureOfTheDay";
import TickerTape from "./TickerTape";
import TopNewsCard, { TopNewsCardRefHandle } from "./TopNewsCard";

/**
 * Props for the NewsFeed component
 */
interface NewsFeedProps {
  /** Optional ID to filter articles by source */
  selectedSourceId?: number;
  /** Callback for error handling */
  onError: (message: string) => void;
  /** Whether the ticker tape is enabled */
  tickerEnabled: boolean;
  /** Callback for toggling the ticker tape */
  onTickerToggle: (enabled: boolean) => void;
  /** Whether the top news section is enabled */
  topNewsEnabled?: boolean;
  /** Callback for toggling the top news section */
  onTopNewsToggle?: (enabled: boolean) => void;
}

/**
 * Ref handle type for the NewsFeed component
 * Enables parent components to trigger feed refresh
 */
export type NewsFeedRefHandle = {
  /** Function to manually refresh the news feed */
  refreshFeed: () => void;
};

/**
 * NewsFeed component for displaying news articles
 * 
 * Features:
 * - Displays news articles with pagination
 * - Optional filtering by source
 * - Top news section for highlighted articles
 * - Ticker tape for scrolling headlines
 * - Picture of the day display
 * - Error handling and loading states
 * 
 * Uses React's forwardRef pattern to expose the refresh method to parent components
 */
const NewsFeed = forwardRef<NewsFeedRefHandle, NewsFeedProps>(
  function NewsFeedComponent(props, ref) {
    // Destructure props for easier access
    const { 
      selectedSourceId,      // Optional ID to filter articles by source
      onError,               // Callback for error handling
      tickerEnabled,         // Whether the ticker tape is enabled
      onTickerToggle,        // Callback for toggling the ticker tape
      topNewsEnabled = false, // Whether the top news section is enabled (default: false)
      onTopNewsToggle        // Callback for toggling the top news section
    } = props;
    
    // State for pagination and articles
    const [page, setPage] = useState(1);
    const [allArticles, setAllArticles] = useState<RssItem[]>([]);
    const pageSize = 10; // Number of articles per page
    
    // Reference to the TopNewsCard component for refreshing top news
    const topNewsRef = useRef<TopNewsCardRefHandle>(null);
    
    const {
      articles,
      isLoading,
      isError,
      refetch,
      lastUpdated
    } = useArticles(selectedSourceId);
    
    // Reset page and articles when source changes
    useEffect(() => {
      setPage(1);  // Reset to first page
      setAllArticles([]); // Clear articles
    }, [selectedSourceId]);
    
    // Update local articles state when data from API changes
    useEffect(() => {
      if (articles) {
        setAllArticles(articles);
      }
    }, [articles]);
    
    // Handle API errors
    useEffect(() => {
      if (isError) {
        onError("Failed to load news feeds. Please try again.");
      }
    }, [isError, onError]);
    
    /**
     * Filter articles for the main feed
     * 
     * - Removes Wikipedia articles (shown separately in dedicated components)
     * - Keeps all other articles for the main feed
     */
    const filteredArticles = allArticles.filter(article => {
      // Filter out Wikipedia articles that have their own dedicated display components
      return !article.sourceName?.includes("Wikipedia");
    });
    
    // Pagination: Slice the filtered articles based on current page
    const displayedArticles = filteredArticles.slice(0, page * pageSize);
    
    /**
     * Load more articles function
     * Increments the page number to show more articles
     */
    const loadMore = () => {
      setPage(page + 1);
    };
    
    // Determine if there are more articles to load
    const hasMore = displayedArticles.length < filteredArticles.length;
    
    /**
     * Comprehensive refresh function that updates all content
     * 
     * This function:
     * 1. Refreshes the main article feed via the useArticles hook
     * 2. Refreshes the top news section if it's enabled
     * 
     * Used both internally and exposed to parent components via ref
     */
    const refreshAll = () => {
      console.log("Refreshing feed and top news");
      
      // Refresh the main article feed
      refetch();
      
      // Also refresh the top news section if it's enabled and the ref is available
      if (topNewsRef.current && topNewsEnabled) {
        topNewsRef.current.refreshTopNews();
      }
    };
    
    /**
     * Expose methods to parent components via ref
     * 
     * This allows parent components to trigger a refresh of the news feed
     * Using React's useImperativeHandle hook to create a stable ref API
     */
    useImperativeHandle(ref, () => ({
      // Public method that can be called by parent components
      refreshFeed: () => {
        console.log("Refreshing feed from All Sources click");
        refreshAll();
      }
    }));
    
    return (
      <main className="flex-1 overflow-y-auto pt-0 md:pt-2 pb-2 px-0 md:px-2 mt-14 md:mt-0">
        {/* Ticker Tape - at the top */}
        <TickerTape 
          isEnabled={tickerEnabled} 
          onToggle={onTickerToggle} 
          showControls={false} 
        />
        
        {/* Top News (powered by Mistral AI) */}
        <div className="mt-0">
          <TopNewsCard 
            ref={topNewsRef}
            isVisible={topNewsEnabled} 
          />
        </div>
        
        {/* Picture of the Day - Always shown between headline and toolbar */}
        <div className="mt-2">
          <PictureOfTheDay />
        </div>
        
        {/* Toolbar - now below Picture of the Day and Top News */}
        <div className="mt-0">
          <Toolbar 
            lastUpdated={lastUpdated}
            isLoading={isLoading}
            onRefresh={() => refreshAll()}
            selectedSourceId={selectedSourceId}
            title={selectedSourceId === 2 ? "Picture of the Day Settings" : undefined}
          />
        </div>
        
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
);

export default NewsFeed;
