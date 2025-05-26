/**
 * theOxus - Blacklist Page Component
 * 
 * This component displays information about news sources that are blacklisted
 * by default in theOxus.com.
 * 
 * @license Apache-2.0
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

/**
 * Blacklist page component
 * 
 * Displays a list of news sources that are blacklisted by default
 * with an explanation of how users can still add them if needed.
 * 
 * @returns JSX.Element - The blacklist page component
 */
export default function BlacklistPage() {
  
  // These are the sources that are filtered/blacklisted by default
  // This is based on the implementation in server/routes.ts
  const blacklistedSources = [
    {
      name: "ESPN 🇺🇸",
      reason: "45 day suspension",
      dateExcluded: "May 26, 2025"
    },
    {
      name: "Sportskeeda.com 🇮🇳",
      reason: "45 day suspension",
      dateExcluded: "May 26, 2025"
    },
    {
      name: "Chicago Sun-Times 🇺🇸",
      reason: "90 day suspension",
      dateExcluded: "May 21, 2025"
    },
    {
      name: "Philadelphia Inquirer 🇺🇸",
      reason: "90 day suspension",
      dateExcluded: "May 21, 2025"
    },
    {
      name: "The New York Times 🇺🇸",
      reason: "Permanent ban",
      dateExcluded: "May 21, 2025"
    }
  ];
  
  return (
    <div className="container max-w-4xl py-8 px-4 mx-auto">
      <div className="flex flex-col min-h-[calc(100vh-32px)]">
        <div className="flex-1">
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Blacklisted News Sources</h1>
              <Button 
                asChild
                className="ml-4"
              >
                <Link href="/">Back to News Feeds</Link>
              </Button>
            </div>
            
            <p className="text-muted-foreground mb-4">
              The following sources are <strong>blacklisted by default</strong> from theOxus.com. However, you can still add them to your feed by clicking the <strong>'+'</strong> button next to <strong>'FEED SOURCES'</strong> in the sidebar and entering their RSS feed URLs.
            </p>
            
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Source Name</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Date Excluded</th>
                  </tr>
                </thead>
                <tbody>
                  {blacklistedSources.map((source, index) => (
                    <tr key={index} className={index !== blacklistedSources.length - 1 ? "border-b" : ""}>
                      <td className="p-3 font-medium">{source.name}</td>
                      <td className="p-3">{source.reason}</td>
                      <td className="p-3">{source.dateExcluded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Footer matching site style */}
        <footer className="mt-auto py-6 border-t border-accent">
          <div className="container text-center">
            <p className="text-sm mb-2">
              <a href="https://github.com/kianerfaan/theOxus.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Open Source under Apache-2.0
              </a>
            </p>
            <p className="text-sm text-gray-500 mb-3">
              © 2025 theOxus.com
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}