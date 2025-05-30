import { useQuery, useMutation } from "@tanstack/react-query";
import { FeedSource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Github, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSourceFlag } from "@/lib/sourceFlags";
import { ThemeToggle } from "./ThemeToggle";
import { AuthStatus } from "@/components/auth/AuthStatus";
// Logo component based on your design
const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" className="w-8 h-8">
    <circle cx="50" cy="50" r="45" fill="#4F6CB0" stroke="none"/>
    <circle cx="50" cy="50" r="35" fill="white" stroke="none"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#E8B54A" strokeWidth="6" strokeDasharray="12 8"/>
  </svg>
);

interface SidebarProps {
  onSelectSource: (id: number | undefined) => void;
  selectedSourceId?: number;
  tickerEnabled: boolean;
  onTickerToggle: (enabled: boolean) => void;
  topNewsEnabled?: boolean;
  onTopNewsToggle?: (enabled: boolean) => void;
  searchEnabled?: boolean;
  onSearchToggle?: (enabled: boolean) => void;
  pictureOfTheDayLocation?: 'off' | 'news-feed' | 'current-events';
  onPictureOfTheDayLocationChange?: (location: 'off' | 'news-feed' | 'current-events') => void;
  onSourcesChanged?: () => void;
}

export default function Sidebar({ 
  onSelectSource, 
  selectedSourceId, 
  tickerEnabled, 
  onTickerToggle,
  topNewsEnabled = false,
  onTopNewsToggle,
  searchEnabled = false,
  onSearchToggle,
  pictureOfTheDayLocation = 'current-events',
  onPictureOfTheDayLocationChange,
  onSourcesChanged
}: SidebarProps) {
  const { toast } = useToast();
  const [sortByCountry, setSortByCountry] = useState(false);

  // Helper function to extract country flags from source names
  const extractCountryFlags = (sourceName: string): string => {
    // Look for specific flag emojis in the source name first
    if (sourceName.includes('🇺🇸')) return '🇺🇸';
    if (sourceName.includes('🇬🇧')) return '🇬🇧';
    if (sourceName.includes('🇮🇳')) return '🇮🇳';
    if (sourceName.includes('🇭🇰')) return '🇭🇰';
    if (sourceName.includes('🇮🇱')) return '🇮🇱';
    if (sourceName.includes('🇨🇭')) return '🇨🇭';
    if (sourceName.includes('🇲🇨')) return '🇲🇨';
    if (sourceName.includes('🇦🇺')) return '🇦🇺';
    
    // Map international sources without flags to their countries
    const sourceToCountry: { [key: string]: string } = {
      'BBC News': '🇬🇧',
      'Reuters': '🇬🇧', 
      'Al Jazeera': '🇶🇦',
      'France 24': '🇫🇷',
      'Deutsche Welle': '🇩🇪',
      'UN News': '🌍',
      'Times of India': '🇮🇳',
      'The Japan Times': '🇯🇵',
      'Tehran Times': '🇮🇷',
      'The Epoch Times': '🇺🇸',
      'AP News': '🇺🇸',
      'Bloomberg': '🇺🇸',
      'Financial Times': '🇬🇧',
      'South China Post': '🇭🇰',
      'Current Events': '🌍',
      'Wikipedia Picture of the Day': '🌍',
      'RT': '🇷🇺',
      'Haaretz': '🇮🇱',
      'The Jerusalem Post': '🇮🇱',
      'ZeroHedge': '🇺🇸',
      'The Intercept': '🇺🇸',
      'SCOTUSblog': '🇺🇸',
      'The Hill': '🇺🇸',
      'Fox News': '🇺🇸',
      'NPR': '🇺🇸'
    };
    
    // Check if source name matches any in our mapping
    for (const [source, flag] of Object.entries(sourceToCountry)) {
      if (sourceName.includes(source)) {
        return flag;
      }
    }
    
    return '🌍'; // Default to world emoji if no mapping found
  };

  // Helper function to get country name from flags for grouping
  const getCountryGroupName = (flags: string): string => {
    const countryMap: { [key: string]: string } = {
      '🇺🇸': 'United States',
      '🇬🇧': 'United Kingdom', 
      '🇮🇳': 'India',
      '🇭🇰': 'Hong Kong',
      '🇮🇱': 'Israel',
      '🇨🇭': 'Switzerland',
      '🇲🇨': 'Monaco',
      '🇦🇺': 'Australia',
      '🇶🇦': 'Qatar',
      '🇫🇷': 'France',
      '🇩🇪': 'Germany',
      '🇯🇵': 'Japan',
      '🇮🇷': 'Iran',
      '🇷🇺': 'Russia',
      '🌍': 'International'
    };
    
    // Handle multiple flags by taking the first one for grouping
    const firstFlag = flags.slice(0, 2);
    return countryMap[firstFlag] || countryMap[flags] || 'International';
  };
  
  // State for collapsible categories - collapsed by default
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(['Legacy', 'Technology', 'Finance', 'Alternative', 'Entertainment', 'Sports', 'Space', 'Academic', 'upcoming-features'])
  );
  const [customizationCollapsed, setCustomizationCollapsed] = useState(true);

  // Toggle category collapse state
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const { data: sources = [], isLoading, error } = useQuery<FeedSource[]>({
    queryKey: ['/api/sources'],
  });

  const toggleSourceMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      await apiRequest('PATCH', `/api/sources/${id}`, { isActive });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/top-news'] });
      
      // Trigger immediate background processing for top news analysis
      try {
        await apiRequest('POST', '/api/refresh-top-news');
        console.log('Background processing triggered after source toggle');
      } catch (error) {
        console.error('Failed to trigger background processing:', error);
      }
      
      // Notify parent component about source changes
      onSourcesChanged?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update feed source',
        variant: 'destructive',
      });
    }
  });



  const handleToggleSource = (id: number, currentValue: boolean) => {
    toggleSourceMutation.mutate({ id, isActive: !currentValue });
  };



  return (
    <aside className="sidebar w-64 border-r border-accent h-full overflow-y-auto flex flex-col">
      <div className="p-3 border-b border-accent bg-gradient-to-r from-primary/90 to-primary">
        <div className="flex items-center justify-center mb-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="hover:scale-105 transition-transform cursor-pointer"
              aria-label="Refresh page"
            >
              <LogoIcon />
            </button>
            <h1 className="text-xl font-bold text-white">theOxus.com</h1>
          </div>
        </div>
        <p className="text-xs text-secondary/90">Built by <a 
          href="https://x.com/kianerfaan" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-secondary/80 underline"
        >
          Kian Erfaan
        </a></p>
          <p className="text-xs text-secondary/70">
            <a href="/version-history" className="hover:underline">version 17, last updated: May 30, 2025</a>
          </p>
      </div>

      {/* Navigation Links */}
      <nav className="mt-1">
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
            <button className="flex w-full items-center px-3 py-1.5 text-primary hover:bg-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              River of News
            </button>
          </li>

          {/* Upcoming Features Section */}
          <li className="sidebar-item mt-2">
            <div className="mb-1">
              <div className="flex justify-between items-center text-xs font-semibold px-3 py-1.5 uppercase text-black bg-yellow-400">
                <div className="flex items-center truncate mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCollapsed = new Set(collapsedCategories);
                      if (collapsedCategories.has('upcoming-features')) {
                        newCollapsed.delete('upcoming-features');
                      } else {
                        newCollapsed.add('upcoming-features');
                      }
                      setCollapsedCategories(newCollapsed);
                    }}
                    className="mr-1.5 hover:bg-secondary/30 rounded p-0.5 transition-colors"
                    aria-label="Toggle Upcoming Features category"
                  >
                    {collapsedCategories.has('upcoming-features') ? (
                      <ChevronRight className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  <span className="mr-1.5">🔨🔧</span>
                  <h3 className="truncate">Upcoming Features</h3>
                </div>
              </div>
              
              {!collapsedCategories.has('upcoming-features') && (
                <div className="space-y-1 px-4 pt-2">
                  {/* Calendar */}
                  <div className="py-2 px-1 rounded hover:bg-accent/50">
                    <a href="/calendar" className="flex w-full items-center text-primary hover:text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Calendar</span>
                    </a>
                  </div>

                  {/* Forum */}
                  <div className="py-2 px-1 rounded hover:bg-accent/50">
                    <a href="/forum" className="flex w-full items-center text-primary hover:text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                      </svg>
                      <span className="text-sm">Forum</span>
                    </a>
                  </div>

                  {/* Library */}
                  <div className="py-2 px-1 rounded hover:bg-accent/50">
                    <a href="/library" className="flex w-full items-center text-primary hover:text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-sm">Library</span>
                    </a>
                  </div>

                  {/* Market */}
                  <div className="py-2 px-1 rounded hover:bg-accent/50">
                    <a href="/market" className="flex w-full items-center text-primary hover:text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-sm">Market</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </li>

          {/* Customization Section */}
          <li className="sidebar-item mt-2">
            <div className="mb-1">
              <div className="flex justify-between items-center text-xs font-semibold px-3 py-1.5 uppercase text-black bg-yellow-400">
                <div className="flex items-center truncate mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomizationCollapsed(!customizationCollapsed);
                    }}
                    className="mr-1.5 hover:bg-secondary/30 rounded p-0.5 transition-colors"
                    aria-label="Toggle Customization category"
                  >
                    {customizationCollapsed ? (
                      <ChevronRight className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  <h3 className="truncate">Customization</h3>
                </div>
              </div>
              
              {!customizationCollapsed && (
                <div className="space-y-0.5 px-3 pt-1">
                  {/* Ticker Tape Toggle */}
                  <div 
                    className={cn(
                      "flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50 cursor-pointer",
                      selectedSourceId === undefined && "bg-accent/30"
                    )}
                    onClick={() => onSelectSource(undefined)}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="text-sm mr-2">Ticker Tape</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <div className="flex-shrink-0">
                        <Switch
                          checked={tickerEnabled}
                          onCheckedChange={onTickerToggle}
                          onClick={(e) => e.stopPropagation()}
                          id="ticker-sidebar-switch"
                          className="h-4 w-7"
                        />
                      </div>
                      <span className="text-xs flex-shrink-0 min-w-8 text-right">
                        {tickerEnabled ? "On" : "Off"}
                      </span>
                    </div>
                  </div>

                  {/* Top News Toggle */}
                  <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm mr-2">Top News</span>
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

                  {/* Search Headlines Toggle */}
                  <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm mr-2">Search</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <div className="flex-shrink-0">
                        <Switch
                          checked={searchEnabled}
                          onCheckedChange={onSearchToggle}
                          id="search-sidebar-switch"
                          className="h-4 w-7"
                        />
                      </div>
                      <span className="text-xs flex-shrink-0 min-w-8 text-right">
                        {searchEnabled ? "On" : "Off"}
                      </span>
                    </div>
                  </div>

                  {/* Picture of the Day Toggle */}
                  <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm mr-2">Picture of the Day</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => {
                          const states: ('off' | 'news-feed' | 'current-events')[] = ['off', 'news-feed', 'current-events'];
                          const currentIndex = states.indexOf(pictureOfTheDayLocation);
                          const nextIndex = (currentIndex + 1) % states.length;
                          onPictureOfTheDayLocationChange?.(states[nextIndex]);
                        }}
                        className="text-xs font-medium text-primary hover:bg-accent/50 px-2 py-1 rounded border border-border"
                      >
                        {pictureOfTheDayLocation === 'off' && 'Off'}
                        {pictureOfTheDayLocation === 'news-feed' && 'News Feed'}
                        {pictureOfTheDayLocation === 'current-events' && 'Current Events'}
                      </button>
                    </div>
                  </div>

                  {/* Dark/Light Mode Toggle */}
                  <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm mr-2">Theme</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Sort by Country Toggle */}
                  <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                      </svg>
                      <span className="text-sm mr-2">Sort by Country</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <div className="flex-shrink-0">
                        <Switch
                          checked={sortByCountry}
                          onCheckedChange={setSortByCountry}
                          id="sort-by-country-switch"
                          className="h-4 w-7"
                        />
                      </div>
                      <span className="text-xs flex-shrink-0 min-w-8 text-right">
                        {sortByCountry ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>

        </ul>
      </nav>

      {/* Google Sign-In Section */}
      <div className="mt-3 px-3 flex justify-center">
        <AuthStatus />
      </div>

      {/* Feed Sources Section */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3 px-4">
          <h2 className="font-bold text-sm uppercase text-gray-500">Feed Sources</h2>

        </div>

        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading sources...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">Failed to load sources</div>
        ) : sources.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No sources added yet</div>
        ) : (
          <div>
            {sortByCountry ? (
              // Group sources by country
              (() => {
                // Group sources by country flags
                const countryGroups: { [key: string]: FeedSource[] } = {};
                sources.forEach(source => {
                  const flag = extractCountryFlags(source.name);
                  const countryName = getCountryGroupName(flag);
                  if (!countryGroups[countryName]) {
                    countryGroups[countryName] = [];
                  }
                  countryGroups[countryName].push(source);
                });

                // Sort countries alphabetically and render
                return Object.keys(countryGroups).sort().map(countryName => {
                  const countryItems = countryGroups[countryName].sort((a, b) => a.name.localeCompare(b.name));
                  const countryFlag = extractCountryFlags(countryItems[0].name);
                  const groupLabel = `${countryFlag} ${countryName} (${countryItems.length})`;
                  const isCollapsed = collapsedCategories.has(countryName);

                  return (
                    <div key={countryName} className="mb-4">
                      <div className="flex justify-between items-center text-xs font-semibold px-5 py-2 uppercase text-primary-foreground bg-primary/90">
                        <div className="flex items-center truncate mr-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newCollapsed = new Set(collapsedCategories);
                              if (isCollapsed) {
                                newCollapsed.delete(countryName);
                              } else {
                                newCollapsed.add(countryName);
                              }
                              setCollapsedCategories(newCollapsed);
                            }}
                            className="mr-2 hover:bg-secondary/30 rounded p-0.5 transition-colors"
                            aria-label={`Toggle ${countryName} country group`}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          <h3 className="truncate">{groupLabel}</h3>
                        </div>
                      </div>
                      
                      {!isCollapsed && (
                        <div className="space-y-1 px-4 pt-2">
                          {countryItems.map((source: FeedSource) => (
                            <div
                              key={source.id}
                              className={cn(
                                "flex items-center justify-between py-2 px-1 rounded hover:bg-accent/50 cursor-pointer",
                                selectedSourceId === source.id && "bg-accent/30"
                              )}
                              onClick={() => onSelectSource(source.id)}
                            >
                              <span className="text-sm truncate mr-2">{source.name}</span>
                              <div className="flex items-center space-x-2 ml-2">
                                <div className="flex-shrink-0">
                                  <Switch
                                    checked={source.isActive}
                                    onCheckedChange={(checked) => handleToggleSource(source.id, source.isActive)}
                                    onClick={(e) => e.stopPropagation()}
                                    id={`source-${source.id}-switch`}
                                    className="h-4 w-7"
                                  />
                                </div>
                                <span className="text-xs flex-shrink-0 min-w-8 text-right">
                                  {source.isActive ? "On" : "Off"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            ) : (
              // Group sources by category (original logic)
              ['Legacy', 'Technology', 'Finance', 'Alternative', 'Entertainment', 'Sports', 'Space', 'Academic'].map(category => {
                // Get sources in this category and sort them alphabetically by name
                const categoryItems = sources
                  .filter(source => source.category === category)
                  .sort((a, b) => a.name.localeCompare(b.name));

                // Only display categories that have sources
                if (categoryItems.length === 0) return null;

                let categoryLabel = category;
                categoryLabel = `${category} (${categoryItems.length})`;

                // Check if this category should be collapsible
                const isCollapsible = ['Legacy', 'Technology', 'Finance', 'Alternative', 'Entertainment', 'Sports', 'Space', 'Academic'].includes(category);
                const isCollapsed = collapsedCategories.has(category);

                return (
                <div key={category} className="mb-2">
                  <div className="flex justify-between items-center text-xs font-semibold px-3 py-1.5 uppercase text-primary-foreground bg-primary/90">
                    <div className="flex items-center truncate mr-3">
                      {isCollapsible && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryCollapse(category);
                          }}
                          className="mr-2 hover:bg-secondary/30 rounded p-0.5 transition-colors"
                          aria-label={`Toggle ${category} category`}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      )}
                      <h3 className="truncate">{categoryLabel}</h3>
                    </div>
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

                          // Refresh top news data to reflect source changes
                          queryClient.invalidateQueries({ queryKey: ['/api/top-news'] });

                          // Trigger immediate background processing for top news analysis
                          try {
                            await apiRequest('POST', '/api/refresh-top-news');
                            console.log('Background processing triggered after category toggle');
                          } catch (error) {
                            console.error('Failed to trigger background processing:', error);
                          }

                          // Notify parent component about source changes
                          onSourcesChanged?.();

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
                  {(!isCollapsible || !isCollapsed) && (
                    <div className="space-y-1 px-4 pt-2">
                      {categoryItems.map((source: FeedSource) => {
                      let sourceName = source.name;
                      if (['The Verge', 'TechCrunch', 'Wired'].includes(source.name)) {
                        sourceName = `${source.name} (New!)`;
                      }
                      return (
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
                          <span className="text-xs flex-grow truncate pr-1">
                            {sourceName} 
                            {getSourceFlag(source.name) && (
                              <span className="ml-1">{getSourceFlag(source.name)}</span>
                            )}
                          </span>

                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        )}
      </div>

      {/* Footer with copyright info */}
      <div className="mt-auto p-4 border-t border-accent text-xs text-gray-500">

        
        <p className="text-center">
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