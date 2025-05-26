/**
 * theOxus - Main Application Component
 * 
 * This file defines the main application component and routing configuration.
 * It serves as the entry point for the client-side application.
 * 
 * @license Apache-2.0
 */

import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CalendarPage from "@/pages/Calendar";
import Forum from "@/pages/Forum";
import LibraryPage from "@/pages/Library";
import BlacklistPage from "@/pages/Blacklist";
import VersionHistory from "@/pages/VersionHistory";
import PrivacyPolicy from "@/pages/Privacy";
import TermsOfService from "@/pages/Terms";
import { useState, useEffect } from "react";

/**
 * Router component that defines the application's routes
 * Uses wouter for lightweight client-side routing
 * 
 * @returns JSX.Element - The router component with defined routes
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/forum" component={Forum} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/blacklist" component={BlacklistPage} />
      <Route path="/version-history" component={VersionHistory} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main App component that serves as the root of the application
 * Provides the global context providers for:
 * - React Query for data fetching
 * - Tooltip for UI tooltips
 * - Toast notifications
 * 
 * Also handles React hydration to prevent issues in SSR-like environments
 * 
 * @returns JSX.Element - The root App component
 */
function App() {
  const [mounted, setMounted] = useState(false);

  // Ensure hydration issues don't occur with SSR-like environments
  // Only render the app after the initial client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // During server rendering or first mount, render nothing
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
