import { useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TickerTapeProps {
  isEnabled: boolean;
  onToggle?: (enabled: boolean) => void;
  showControls?: boolean;
}

export default function TickerTape({ isEnabled, onToggle, showControls = true }: TickerTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isEnabled || !containerRef.current) return;
    
    // Clear any previous widget
    const container = containerRef.current;
    container.innerHTML = "";
    
    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    
    // Create widget div
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    
    // Create script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          description: "BTC",
          proName: "CRYPTO:BTCUSD"
        },
        {
          description: "RocketLab",
          proName: "NASDAQ:RKLB"
        },
        {
          description: "Nano Nuclear Energy",
          proName: "NASDAQ:NNE"
        },
        {
          description: "US Antimony",
          proName: "AMEX:UAMY"
        },
        {
          description: "Gold",
          proName: "TVC:GOLD"
        }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en"
    });
    
    // Append all elements
    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);
    
    return () => {
      // Clean up on unmount
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [isEnabled]);
  
  return (
    <div className="mb-4 overflow-hidden">
      {showControls && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Ticker Tape</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggle}
              id="ticker-switch"
              className="h-4 w-7"
            />
            <Label htmlFor="ticker-switch" className="text-xs">
              {isEnabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div>
      )}
      
      {isEnabled && (
        <div ref={containerRef} className="min-h-[46px]">
          {/* TradingView widget will be loaded here */}
        </div>
      )}
    </div>
  );
}