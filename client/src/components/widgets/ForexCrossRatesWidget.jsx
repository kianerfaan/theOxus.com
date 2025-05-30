// ForexCrossRatesWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function ForexCrossRatesWidget() {
  const container = useRef();

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "width": "100%",
          "height": "400",
          "currencies": [
            "EUR",
            "USD",
            "GBP",
            "AUD",
            "CAD",
            "SGD"
          ],
          "isTransparent": false,
          "colorTheme": "light",
          "locale": "en",
          "backgroundColor": "#ffffff"
        }`;
      container.current.appendChild(script);
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
    </div>
  );
}

export default memo(ForexCrossRatesWidget);