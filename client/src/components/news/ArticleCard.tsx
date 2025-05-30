/**
 * theOxus - ArticleCard Component
 * 
 * This component displays a single news article in a card format.
 * It handles different content sources appropriately, with special
 * treatment for Wikipedia content which includes rich HTML.
 * 
 * @license Apache-2.0
 */

import { RssItem } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSourceFlag } from "@/lib/sourceFlags";

/**
 * Props for ArticleCard component
 */
interface ArticleCardProps {
  /** The article data to display */
  article: RssItem;
}

/**
 * ArticleCard component for displaying a single news article
 * 
 * Features:
 * - Displays article metadata (source, publication date)
 * - Provides content preview with different formatting for normal and Wikipedia sources
 * - Includes save and share functionality
 * - Renders article actions (read full article, save, share)
 * - Custom styling based on article source
 * 
 * @param props - Component props containing the article data
 * @returns JSX.Element - The rendered article card
 */
export default function ArticleCard({ article }: ArticleCardProps) {
  // State for article saved status
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  // Format the publication date for display
  const formattedDate = article.pubDate ? format(new Date(article.pubDate), 'MMMM d, yyyy • h:mm:ss a') : '';
  
  // Determine if this is Wikipedia content which needs special handling
  const isWikipedia = article.isWikipediaCurrentEvents === true;
  
  // Process article content for display
  let displayContent = '';
  
  if (isWikipedia) {
    // For Wikipedia, preserve HTML for rich content display
    displayContent = article.content || article.contentSnippet || '';
  } else {
    // For standard news sources, create a clean text snippet
    let cleanSnippet = article.contentSnippet || '';
    if (!cleanSnippet && article.content) {
      // Strip HTML tags if only full content is available
      cleanSnippet = article.content.replace(/<[^>]*>?/gm, '');
    }
    
    // Truncate lengthy content with ellipsis for readability
    if (cleanSnippet.length > 300) {
      cleanSnippet = cleanSnippet.substring(0, 300) + '...';
    }
    
    displayContent = cleanSnippet;
  }
  
  /**
   * Handles saving or unsaving an article
   * 
   * Toggles the saved state and displays an appropriate toast notification
   * to confirm the action to the user.
   * 
   * @param e - The mouse event from the button click
   */
  const handleSaveArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
    
    // Show appropriate toast message based on new saved state
    toast({
      title: isSaved ? "Removed from saved articles" : "Saved for later",
      description: isSaved ? 
        "The article has been removed from your saved list." :
        "The article has been added to your saved list.",
    });
  };
  
  /**
   * Handles sharing an article
   * 
   * Uses the Web Share API if available in the browser, with a fallback
   * to copying the article URL to the clipboard. Displays toast notifications
   * to indicate success or failure.
   * 
   * @param e - The mouse event from the button click
   */
  const handleShareArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Try using the Web Share API for native sharing on supported devices
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: article.link
      }).catch((error) => {
        // Show error toast if sharing fails
        toast({
          title: "Sharing failed",
          description: "Could not share this article.",
          variant: "destructive"
        });
      });
    } else {
      // Fallback for browsers without Web Share API support
      navigator.clipboard.writeText(article.link).then(() => {
        // Show success toast when link is copied
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard.",
        });
      }).catch(() => {
        // Show error toast if clipboard access fails
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive"
        });
      });
    }
  };
  
  /**
   * Renders the ArticleCard component
   * 
   * The card layout includes:
   * - Header with source name, flag, and publish date
   * - Article title
   * - Content preview (with special rendering for Wikipedia)
   * - Action buttons (read full article, save, share)
   */
  return (
    <Card className={cn(
      "article-card bg-white border border-accent rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 max-w-3xl mx-auto",
      // Apply special styling for Wikipedia content
      isWikipedia && "border-primary/50 bg-primary/5"
    )}>
      <CardContent className={cn(
        "p-3",
        // Add extra padding for Wikipedia content
        isWikipedia && "p-4"
      )}>
        {/* Source metadata section */}
        <div className="flex items-center mb-2">
          <Badge variant="default" className="mr-2 bg-primary text-white font-medium">
            {article.sourceName}
            {/* Display source flag if available */}
            {getSourceFlag(article.sourceName) && (
              <span className="ml-1">{getSourceFlag(article.sourceName)}</span>
            )}
          </Badge>
          {/* Publication date */}
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        
        {/* Article title */}
        <h3 className="text-lg font-bold mb-2 text-primary hover:text-secondary transition-colors duration-200">
          {article.title}
        </h3>
        
        {/* Content preview with special handling for Wikipedia */}
        {isWikipedia ? (
          // Wikipedia content - render with HTML preserved (sanitized)
          <div 
            className="wiki-content prose prose-blue max-w-none mb-4 text-text"
            dangerouslySetInnerHTML={{ __html: displayContent }}
            style={{
              lineHeight: '1.4',
              fontSize: '0.95rem',
              color: '#222',
            }}
          />
        ) : (
          // Standard content - render as plain text
          <div className="article-content text-text mb-3 text-sm">
            {displayContent}
          </div>
        )}
        
        {/* Action buttons section */}
        <div className="flex justify-between items-center">
          {/* Read full article link */}
          <a 
            href={article.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="py-1 px-3 bg-secondary text-primary font-medium rounded-full text-sm hover:bg-secondary/80 transition-colors shadow-sm"
          >
            Read full article
          </a>
          
          {/* Action buttons container */}
          <div className="flex space-x-2">
            {/* Save article button with dynamic styling based on saved state */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "text-gray-400 hover:text-primary transition-colors",
                isSaved && "text-secondary hover:text-secondary/80"
              )}
              onClick={handleSaveArticle}
              aria-label="Save article"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            
            {/* Share article button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-primary transition-colors"
              onClick={handleShareArticle}
              aria-label="Share article"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
