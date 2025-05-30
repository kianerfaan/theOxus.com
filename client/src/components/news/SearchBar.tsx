import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SearchBarProps {
  isVisible: boolean;
  onSearch: (term: string) => void;
}

/**
 * SearchBar component for filtering news headlines
 * 
 * This component renders a search input field that allows users to
 * filter headlines by searching for text in the title.
 */
export default function SearchBar({ isVisible, onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [greeting, setGreeting] = useState('');
  const [dateString, setDateString] = useState('');
  
  // When search term changes, notify parent component
  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);
  
  // Update greeting based on time of day and date information
  useEffect(() => {
    const updateGreetingAndDate = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Set time-based greeting with updated time ranges
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting('Good Afternoon');
      } else if (currentHour >= 18 && currentHour < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
      
      // Format the date string with day of week and full date
      const formattedDate = format(now, "EEEE MMMM do, yyyy");
      setDateString(`Today is ${formattedDate}`);
    };
    
    // Set greeting and date immediately
    updateGreetingAndDate();
    
    // Update greeting and date every minute to ensure it stays current
    const intervalId = setInterval(updateGreetingAndDate, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="relative mb-4">
      {/* Time-based greeting message */}
      <div className="text-center mb-3">
        <h2 className="text-2xl font-serif text-primary font-medium tracking-wide">{greeting}.</h2>
        <p className="text-base text-primary/80 mt-1 font-medium">{dateString}</p>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
          <SearchIcon className="h-5 w-5 text-primary/70" />
        </div>
        <Input
          type="text"
          placeholder="Search headlines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 py-3 border-2 border-primary/30 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg w-full text-base font-medium shadow-lg bg-white/50 backdrop-blur-sm transition-all duration-200"
        />
      </div>
    </div>
  );
}