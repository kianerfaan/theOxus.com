import { useQuery, useMutation } from "@tanstack/react-query";
import { FeedSource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Trash2, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onAddSource: () => void;
  onSelectSource: (id: number | undefined) => void;
  selectedSourceId?: number;
}

export default function Sidebar({ onAddSource, onSelectSource, selectedSourceId }: SidebarProps) {
  const { toast } = useToast();
  
  const { data: sources = [], isLoading, error } = useQuery<FeedSource[]>({
    queryKey: ['/api/sources'],
  });

  const toggleSourceMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      await apiRequest('PATCH', `/api/sources/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update feed source',
        variant: 'destructive',
      });
    }
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      
      if (selectedSourceId) {
        onSelectSource(undefined);
      }
      
      toast({
        title: 'Success',
        description: 'Feed source removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete feed source',
        variant: 'destructive',
      });
    }
  });

  const handleToggleSource = (id: number, currentValue: boolean) => {
    toggleSourceMutation.mutate({ id, isActive: !currentValue });
  };

  const handleDeleteSource = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to remove this feed source?')) {
      deleteSourceMutation.mutate(id);
    }
  };

  return (
    <aside className="sidebar w-64 border-r border-accent h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-accent bg-gradient-to-r from-primary/90 to-primary">
        <h1 className="text-2xl font-bold text-white">NewsFlow</h1>
        <p className="text-sm text-secondary/90">Your personalized news reader</p>
      </div>
      
      {/* Navigation Links */}
      <nav className="mt-4">
        <ul>
          <li 
            className={cn(
              "sidebar-item", 
              selectedSourceId === undefined && "active"
            )}
            onClick={() => onSelectSource(undefined)}
          >
            <button className="flex w-full items-center px-4 py-3 text-primary hover:bg-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              All Sources
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Feed Sources Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2 px-4">
          <h2 className="font-bold text-sm uppercase text-gray-500">Feed Sources</h2>
          <button 
            className="text-secondary hover:text-primary"
            onClick={onAddSource}
            aria-label="Add source"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading sources...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">Failed to load sources</div>
        ) : sources.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No sources added yet</div>
        ) : (
          <div>
            {/* Group sources by category */}
            {['Legacy/Institutional', 'Alternative', 'Money & Markets', 'Frontier Tech'].map(category => {
              // Get sources in this category and sort them alphabetically by name
              const categoryItems = sources
                .filter(source => source.category === category)
                .sort((a, b) => a.name.localeCompare(b.name));
              
              // Only display categories that have sources
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h3 className="text-xs font-semibold px-4 py-1 uppercase text-primary-foreground bg-primary/90">
                    {category}
                  </h3>
                  <div className="space-y-1 px-4 pt-2">
                    {categoryItems.map((source: FeedSource) => (
                      <div 
                        key={source.id}
                        className={cn(
                          "flex items-center py-2 px-1 rounded group hover:bg-accent/50 cursor-pointer",
                          selectedSourceId === source.id && "sidebar-item active"
                        )}
                        onClick={() => onSelectSource(source.id)}
                      >
                        <Switch 
                          checked={source.isActive} 
                          onCheckedChange={(checked) => {
                            handleToggleSource(source.id, source.isActive);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mr-2 h-4 w-7" 
                        />
                        <span className="text-sm flex-grow">{source.name}</span>
                        <button 
                          className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-primary"
                          onClick={(e) => handleDeleteSource(source.id, e)}
                          aria-label="Remove source"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Wikipedia Current Events is now featured on the homepage, so we don't need to display it in the sidebar */}
          </div>
        )}
      </div>
      
      {/* Footer with GitHub link and copyright info */}
      <div className="mt-auto p-4 border-t border-accent text-xs text-gray-500">
        <div className="flex items-center justify-center mb-2">
          <a 
            href="https://github.com/kianerfaan/NewsFlow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-primary transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
        <p className="text-center">
          Open Source under Apache-2.0
        </p>
        <p className="text-center mt-1">
          © 2025 <a 
            href="https://x.com/KianErfaan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-primary underline"
          >
            Kian Erfaan
          </a>
        </p>
      </div>
    </aside>
  );
}
