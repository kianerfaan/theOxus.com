import { useQuery, useMutation } from "@tanstack/react-query";
import { FeedSource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSourceFlag } from "@/lib/sourceFlags";

interface SidebarProps {
  onAddSource: () => void;
  onSelectSource: (id: number | undefined) => void;
  selectedSourceId?: number;
  tickerEnabled: boolean;
  onTickerToggle: (enabled: boolean) => void;
  topNewsEnabled?: boolean;
  onTopNewsToggle?: (enabled: boolean) => void;
}

export default function Sidebar({ 
  onAddSource, 
  onSelectSource, 
  selectedSourceId, 
  tickerEnabled, 
  onTickerToggle,
  topNewsEnabled = false,
  onTopNewsToggle
}: SidebarProps) {
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

  // Mutation removed as delete button is no longer shown
  // const deleteSourceMutation = useMutation({
  //   mutationFn: async (id: number) => {
  //     await apiRequest('DELETE', `/api/sources/${id}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
  //     queryClient.invalidateQueries({ queryKey: ['/api/news'] });
  //     
  //     if (selectedSourceId) {
  //       onSelectSource(undefined);
  //     }
  //     
  //     toast({
  //       title: 'Success',
  //       description: 'Feed source removed successfully',
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to delete feed source',
  //       variant: 'destructive',
  //     });
  //   }
  // });

  const handleToggleSource = (id: number, currentValue: boolean) => {
    toggleSourceMutation.mutate({ id, isActive: !currentValue });
  };

  // Function removed as delete button is no longer shown
  // const handleDeleteSource = (id: number, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   
  //   if (confirm('Are you sure you want to remove this feed source?')) {
  //     deleteSourceMutation.mutate(id);
  //   }
  // };

  return (
    <aside className="sidebar w-64 border-r border-accent h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-accent bg-gradient-to-r from-primary/90 to-primary">
        <h1 className="text-2xl font-bold text-white">theOxus.com</h1>
        <p className="text-sm text-secondary/90">Built by <a 
          href="https://x.com/kianerfaan" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-secondary/80 underline"
        >
          Kian Erfaan
        </a></p>
      </div>
      
      {/* Navigation Links */}
      <nav className="mt-4">
        <ul>
          {/* Home button (renamed from All Sources) */}
          <li 
            className={cn(
              "sidebar-item", 
              selectedSourceId === undefined && "active bg-accent/50"
            )}
            onClick={() => {
              onSelectSource(undefined);
              // Force refresh of the news feed when Home is clicked
              queryClient.invalidateQueries({ queryKey: ['/api/news'] });
              console.log("Refreshing feed from Home click");
            }}
          >
            <button className="flex w-full items-center px-4 py-3 text-primary hover:bg-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </li>
          
          {/* Calendars Section */}
          <li className="sidebar-item mt-3">
            <a href="/calendar" className="flex w-full items-center px-4 py-2 text-primary hover:bg-accent rounded-md font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar (New!)
            </a>
          </li>
          
          {/* Library Section */}
          <li className="sidebar-item mt-2">
            <a href="/library" className="flex w-full items-center px-4 py-2 text-primary hover:bg-accent rounded-md font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Library
            </a>
          </li>
          
          {/* Ticker Tape Toggle */}
          <li 
            className={cn(
              "sidebar-item mt-2", 
              selectedSourceId === undefined && "active"
            )}
            onClick={() => onSelectSource(undefined)}
          >
            <div className="flex w-full items-center justify-between px-4 py-3 text-primary hover:bg-accent">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <span className="mr-2">Ticker Tape</span>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <div className="flex-shrink-0">
                  <Switch
                    checked={tickerEnabled}
                    onCheckedChange={onTickerToggle}
                    id="ticker-sidebar-switch"
                    className="h-4 w-7"
                  />
                </div>
                <span className="text-xs flex-shrink-0 min-w-8 text-right">
                  {tickerEnabled ? "On" : "Off"}
                </span>
              </div>
            </div>
          </li>
          
          {/* Top News Toggle */}
          <li className="sidebar-item mt-2">
            <div className="flex w-full items-center justify-between px-4 py-3 text-primary hover:bg-accent">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="mr-2">Top News (Mistral AI)</span>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <div className="flex-shrink-0">
                  <Switch
                    checked={topNewsEnabled}
                    onCheckedChange={onTopNewsToggle}
                    id="top-news-sidebar-switch"
                    className="h-4 w-7"
                  />
                </div>
                <span className="text-xs flex-shrink-0 min-w-8 text-right">
                  {topNewsEnabled ? "On" : "Off"}
                </span>
              </div>
            </div>
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
            {['Legacy', 'Alternative', 'Money & Markets', 'Frontier Tech'].map(category => {
              // Get sources in this category and sort them alphabetically by name
              const categoryItems = sources
                .filter(source => source.category === category)
                .sort((a, b) => a.name.localeCompare(b.name));
              
              // Only display categories that have sources
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold px-5 py-2 uppercase text-primary-foreground bg-primary/90">
                    <h3 className="truncate mr-3">{category}</h3>
                    <button 
                      className="text-primary-foreground text-xs font-normal hover:bg-secondary/30 hover:text-white flex items-center ml-3 px-2 py-0.5 rounded bg-secondary/20 whitespace-nowrap flex-shrink-0"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const isCategoryActive = categoryItems.some(source => source.isActive);
                        // Toggle all sources in this category to opposite state
                        const promises = categoryItems.map(source => 
                          apiRequest('PATCH', `/api/sources/${source.id}`, { isActive: !isCategoryActive })
                        );
                        
                        try {
                          // Wait for all toggle operations to complete
                          await Promise.all(promises);
                          
                          // Refresh the feed sources data
                          queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
                          
                          // Refresh the news feed data
                          queryClient.invalidateQueries({ queryKey: ['/api/news'] });
                          
                          toast({
                            title: "Success",
                            description: `All ${category} sources turned ${isCategoryActive ? 'off' : 'on'}`,
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update feed sources",
                            variant: "destructive",
                          });
                        }
                      }}
                      aria-label={`Toggle all ${category} sources`}
                    >
                      {categoryItems.some(source => source.isActive) ? 'All off' : 'All on'}
                    </button>
                  </div>
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
                        <div className="flex-shrink-0 min-w-16 w-16 flex items-center justify-center">
                          <Switch 
                            checked={source.isActive} 
                            onCheckedChange={(checked) => {
                              handleToggleSource(source.id, source.isActive);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-7" 
                          />
                        </div>
                        <span className="text-sm flex-grow truncate pr-1">
                          {source.name} 
                          {getSourceFlag(source.name) && (
                            <span className="ml-1">{getSourceFlag(source.name)}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Current Events is now featured on the homepage, so we don't need to display it in the sidebar */}
          </div>
        )}
      </div>
      
      {/* Footer with copyright info */}
      <div className="mt-auto p-4 border-t border-accent text-xs text-gray-500">
        <p className="text-center">
          <a href="https://github.com/kianerfaan/theOxus.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Open Source under Apache-2.0</a>
        </p>
        <p className="text-center mt-1">
          © 2025 theOxus.com
        </p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
        </div>
      </div>
    </aside>
  );
}
