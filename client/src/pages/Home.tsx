import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import NewsFeed from "@/components/NewsFeed";
import WikipediaCurrentEvents from "@/components/WikipediaCurrentEvents";
import AddSourceModal from "@/components/AddSourceModal";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedSource } from "@shared/schema";

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("wikipedia");
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

  const handleSourceSelect = (id: number | undefined) => {
    setSelectedSourceId(id);
    // Switch to news feed tab when a source is selected
    setActiveTab("news");
    
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
          <h1 className="text-xl font-bold text-primary">NewsFlow</h1>
          <button
            className="text-primary p-1"
            onClick={() => setSelectedSourceId(undefined)}
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
        />
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-y-auto pt-0 md:pt-4 pb-4 px-4 md:px-6 mt-14 md:mt-0">
        <Tabs 
          defaultValue="wikipedia" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="news">News Feeds</TabsTrigger>
            <TabsTrigger value="wikipedia">Wikipedia Current Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wikipedia" className="mt-0">
            <WikipediaCurrentEvents onError={handleError} />
          </TabsContent>
          
          <TabsContent value="news" className="mt-0">
            <NewsFeed 
              selectedSourceId={selectedSourceId} 
              onError={handleError} 
            />
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
