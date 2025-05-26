import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VersionHistory() {
  const versions = [
    {
      version: "11",
      date: "May 26, 2025",
      isCurrent: true,
      description: "Enhanced database management with 30-day average load time tracking, global page visit analytics, and early build-out of community forum with Google authentication for premium users",
      hasGitHubRelease: false
    },
    {
      version: "10",
      date: "May 26, 2025",
      isCurrent: false,
      description: "Added visited counter to homepage sidebar header that tracks and displays total page visits using browser storage",
      hasGitHubRelease: false
    },
    {
      version: "9",
      date: "May 25, 2025",
      isCurrent: false,
      description: "Added Google authentication system with Firebase integration, user dashboard with subscription management, and enhanced user experience across all screen sizes",
      hasGitHubRelease: false
    },
    {
      version: "8",
      date: "May 25, 2025",
      isCurrent: false,
      description: "Added Sort by Country feature (now default) and expanded to 45 news feeds including new Sports category with ESPN, Sportskeeda, Football365, Goal.com, and ATP World Tour",
      hasGitHubRelease: false
    },
    {
      version: "7",
      date: "May 24, 2025",
      isCurrent: false,
      description: "Bug fixes and stability improvements with enhanced error handling",
      hasGitHubRelease: false
    },
    {
      version: "6",
      date: "May 24, 2025",
      isCurrent: false,
      description: "Enhanced dark mode with improved readability and cleaner Picture of the Day titles",
      hasGitHubRelease: false
    },
    {
      version: "5",
      date: "May 23, 2025",
      isCurrent: false,
      description: "Latest improvements and features",
      hasGitHubRelease: false
    },
    {
      version: "4", 
      date: "May 22, 2025",
      isCurrent: false,
      description: "Major updates and enhancements",
      hasGitHubRelease: false
    },
    {
      version: "3",
      date: null,
      isCurrent: false,
      description: "Core functionality improvements",
      hasGitHubRelease: false
    },
    {
      version: "2",
      date: "May 16, 2025",
      isCurrent: false,
      description: "Enhanced user experience",
      hasGitHubRelease: true
    },
    {
      version: "1",
      date: "May 2, 2025",
      isCurrent: false,
      description: "Initial release",
      hasGitHubRelease: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-accent bg-gradient-to-r from-primary/90 to-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="flex items-center gap-2 text-white hover:text-secondary/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </a>
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">Version History</h1>
          <p className="text-secondary/90 mt-2">Track the evolution of theOxus.com</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Release Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto px-2">
                <div className="space-y-6">
                  {versions.map((version, index) => (
                    <div key={version.version} className="flex items-start gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          version.isCurrent 
                            ? 'bg-primary border-primary' 
                            : 'bg-background border-accent'
                        }`} />
                        {index < versions.length - 1 && (
                          <div className="w-0.5 h-12 bg-accent mt-2" />
                        )}
                      </div>
                      
                      {/* Version info */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold">
                            Version {version.version}
                          </h3>
                          {version.isCurrent && (
                            <Badge variant="default">Current</Badge>
                          )}
                          {version.hasGitHubRelease && (
                            <Badge variant="outline">GitHub Release</Badge>
                          )}
                        </div>
                        
                        {version.date && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Released: {version.date}
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {version.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center pb-8">
        <p className="text-sm text-muted-foreground">
          For detailed changelog and technical information, visit our{" "}
          <a 
            href="https://github.com/kianerfaan/theOxus.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub repository
          </a>
        </p>
      </div>
    </div>
  );
}