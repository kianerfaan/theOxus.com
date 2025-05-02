import { RssItem } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ArticleCardProps {
  article: RssItem;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = article.pubDate ? format(new Date(article.pubDate), 'MMMM d, yyyy') : '';
  
  // Handle content differently based on source
  const isWikipedia = article.isWikipediaCurrentEvents === true;
  
  let displayContent = '';
  
  if (isWikipedia) {
    // For Wikipedia, we'll keep the HTML but sanitize it later when rendering
    displayContent = article.content || article.contentSnippet || '';
  } else {
    // For other sources, create a clean text snippet
    let cleanSnippet = article.contentSnippet || '';
    if (!cleanSnippet && article.content) {
      // Strip HTML tags if we have to use content
      cleanSnippet = article.content.replace(/<[^>]*>?/gm, '');
    }
    
    // Limit snippet length for non-Wikipedia content
    if (cleanSnippet.length > 300) {
      cleanSnippet = cleanSnippet.substring(0, 300) + '...';
    }
    
    displayContent = cleanSnippet;
  }
  
  const handleSaveArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
    
    toast({
      title: isSaved ? "Removed from saved articles" : "Saved for later",
      description: isSaved ? 
        "The article has been removed from your saved list." :
        "The article has been added to your saved list.",
    });
  };
  
  const handleShareArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: article.link
      }).catch((error) => {
        toast({
          title: "Sharing failed",
          description: "Could not share this article.",
          variant: "destructive"
        });
      });
    } else {
      // Fallback to copying link to clipboard
      navigator.clipboard.writeText(article.link).then(() => {
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard.",
        });
      }).catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive"
        });
      });
    }
  };
  
  return (
    <Card className={cn(
      "article-card bg-white border border-accent rounded-lg overflow-hidden hover:shadow-md transition-all duration-200",
      isWikipedia && "border-primary/50 bg-primary/5"
    )}>
      <CardContent className={cn(
        "p-5",
        isWikipedia && "p-6"
      )}>
        <div className="flex items-center mb-3">
          <Badge variant="default" className="mr-3 bg-primary text-white font-medium">
            {article.sourceName}
          </Badge>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-primary hover:text-secondary transition-colors duration-200">{article.title}</h3>
        
        {isWikipedia ? (
          <div 
            className="wiki-content prose prose-blue max-w-none mb-6 text-text"
            dangerouslySetInnerHTML={{ __html: displayContent }}
            style={{
              lineHeight: '1.6',
              fontSize: '1rem',
              color: '#222',
            }}
          />
        ) : (
          <div className="article-content text-text mb-4">
            {displayContent}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <a 
            href={article.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="py-1 px-3 bg-secondary text-primary font-medium rounded-full text-sm hover:bg-secondary/80 transition-colors shadow-sm"
          >
            Read full article
          </a>
          
          <div className="flex space-x-2">
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
