import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Globe, Clock, ExternalLink, Activity, Banknote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import TradingViewWidget from "@/components/widgets/TradingViewWidget";
import CryptoHeatMapWidget from "@/components/widgets/CryptoHeatMapWidget";
import ForexCrossRatesWidget from "@/components/widgets/ForexCrossRatesWidget";

interface MarketNews {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  sourceName?: string;
}

export default function Market() {
  // Fetch market news
  const { data: news = [], isLoading: newsLoading } = useQuery<MarketNews[]>({
    queryKey: ['/api/market/news'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <h1 className="text-2xl sm:text-3xl font-bold">Market Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Real-time market heat map and financial news
            </p>
          </div>
        </div>



        {/* Main Content - Chart Focused Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Heat Map Section - Takes 2/3 of page width */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  S&P 500 Market Heat Map
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live market performance by sector and market cap
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <TradingViewWidget />
                </div>
              </CardContent>
            </Card>

            {/* Crypto Heat Map Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Cryptocurrency Heat Map
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live crypto performance by market cap and 24h change
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <CryptoHeatMapWidget />
                </div>
              </CardContent>
            </Card>

            {/* Forex Cross Rates Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Forex Cross Rates
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live foreign exchange rates for major currencies
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ForexCrossRatesWidget />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* News Section - Takes 1/3 of page width */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Market News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-y-auto space-y-3 pr-2">
                  {newsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading news...</div>
                  ) : (
                    news.slice(0, 12).map((article, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <a 
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group block"
                        >
                          <div className="text-sm font-medium mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span>
                                {new Date(article.pubDate).toLocaleDateString()}
                              </span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                            {article.sourceName && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                                {article.sourceName}
                              </span>
                            )}
                          </div>
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}