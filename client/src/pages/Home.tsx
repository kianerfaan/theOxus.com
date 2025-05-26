import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import NewsFeed from "@/components/NewsFeed";
import WikipediaCurrentEvents from "@/components/WikipediaCurrentEvents";
import AddSourceModal from "@/components/AddSourceModal";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedSource } from "@shared/schema";

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("news");
  const [tickerEnabled, setTickerEnabled] = useState(false);
  const [topNewsEnabled, setTopNewsEnabled] = useState(true); // Enabled by default
  const [searchEnabled, setSearchEnabled] = useLocalStorage<boolean>("searchEnabled", true); // Enabled by default, persisted in localStorage
  const [pictureOfTheDayEnabled, setPictureOfTheDayEnabled] = useState(true); // Default to on
  const { isMobile } = useMobile();
  const { toast } = useToast();

  // Close sidebar on medium+ screens
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const showAddSourceModal = () => {
    setIsModalOpen(true);
  };

  const closeAddSourceModal = () => {
    setIsModalOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Reference to the NewsFeed component for manual refreshing
  const newsFeedRef = useRef<{
    refreshFeed: () => void;
  } | null>(null);
  
  const handleSourceSelect = (id: number | undefined) => {
    setSelectedSourceId(id);
    // Switch to news feed tab when a source is selected
    setActiveTab("news");
    
    // If selecting "All Sources" (id is undefined), trigger a refresh
    if (id === undefined) {
      // Small delay to ensure the state change propagates
      setTimeout(() => {
        // If we have a ref to the NewsFeed component, call its refresh method
        newsFeedRef.current?.refreshFeed();
      }, 100);
    }
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };
  
  const handleTickerToggle = (enabled: boolean) => {
    setTickerEnabled(enabled);
  };
  
  const handleTopNewsToggle = (enabled: boolean) => {
    setTopNewsEnabled(enabled);
  };
  
  const handleSearchToggle = (enabled: boolean) => {
    setSearchEnabled(enabled);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-accent md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="text-primary p-1"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-primary">theOxus.com</h1>
          <div className="flex items-center gap-2">
            <AuthStatus />
            <button
              className="text-primary p-1"
              onClick={() => {
                setSelectedSourceId(undefined);
                setTimeout(() => {
                  newsFeedRef.current?.refreshFeed();
                }, 100);
              }}
              aria-label="Refresh feeds"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - conditionally shown on mobile */}
      <div
        className={`${
          isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        } fixed inset-y-0 left-0 transform transition duration-200 ease-in-out z-20 md:relative md:z-0 md:translate-x-0`}
      >
        <Sidebar 
          onAddSource={showAddSourceModal} 
          onSelectSource={handleSourceSelect} 
          selectedSourceId={selectedSourceId}
          tickerEnabled={tickerEnabled}
          onTickerToggle={handleTickerToggle}
          topNewsEnabled={topNewsEnabled}
          onTopNewsToggle={handleTopNewsToggle}
          searchEnabled={searchEnabled}
          onSearchToggle={handleSearchToggle}
          pictureOfTheDayEnabled={pictureOfTheDayEnabled}
          onPictureOfTheDayToggle={setPictureOfTheDayEnabled}
        />
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-y-auto pt-0 md:pt-2 pb-2 px-4 md:px-6 mt-14 md:mt-0">
        <Tabs 
          defaultValue="news" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="news">News Feeds</TabsTrigger>
            <TabsTrigger value="wikipedia">Current Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="mt-0">
            <NewsFeed 
              ref={newsFeedRef}
              selectedSourceId={selectedSourceId} 
              onError={handleError}
              tickerEnabled={tickerEnabled}
              onTickerToggle={handleTickerToggle}
              topNewsEnabled={topNewsEnabled}
              onTopNewsToggle={handleTopNewsToggle}
              searchEnabled={searchEnabled}
              onSearchToggle={handleSearchToggle}
              pictureOfTheDayEnabled={pictureOfTheDayEnabled}
            />
          </TabsContent>
          
          <TabsContent value="wikipedia" className="mt-0">
            <WikipediaCurrentEvents onError={handleError} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Source Modal */}
      <AddSourceModal 
        isOpen={isModalOpen} 
        onClose={closeAddSourceModal} 
      />

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Home;
