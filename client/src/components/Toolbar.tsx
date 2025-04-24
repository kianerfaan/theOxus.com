import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useFeeds } from "@/hooks/useFeeds";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface ToolbarProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
  selectedSourceId?: number;
}

export default function Toolbar({ lastUpdated, isLoading, onRefresh, selectedSourceId }: ToolbarProps) {
  const { data: sources = [] } = useFeeds();
  const [selectedSource, setSelectedSource] = useState<string>("all");
  
  useEffect(() => {
    if (selectedSourceId !== undefined) {
      setSelectedSource(selectedSourceId.toString());
    } else {
      setSelectedSource("all");
    }
  }, [selectedSourceId]);
  
  const formattedTime = lastUpdated
    ? format(lastUpdated, "MMMM d, yyyy • h:mm a")
    : "Not yet updated";
  
  return (
    <div className="toolbar sticky top-0 z-10 pt-3 pb-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-primary">
            {selectedSourceId 
              ? sources.find(s => s.id === selectedSourceId)?.name || "Feed"
              : "Today's Feed"}
          </h2>
          <p className="text-sm text-secondary/80">Last updated: {formattedTime}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline" 
            size="sm"
            className="hidden md:flex items-center bg-primary text-white hover:bg-primary/80 border-none shadow-sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
