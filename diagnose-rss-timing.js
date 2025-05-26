import Parser from 'rss-parser';

async function diagnoseRSSFeeds() {
  const parser = new Parser();
  
  // Test a few different RSS feeds to check their timing accuracy
  const testFeeds = [
    { name: "NPR", url: "https://www.npr.org/rss/rss.php?id=1001" },
    { name: "BBC News", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "The Hill", url: "https://thehill.com/feed" },
    { name: "Reuters", url: "https://rss.app/feeds/3dqJlnRD4NkfwQuf.xml" }
  ];
  
  console.log("=== RSS Feed Timing Diagnosis ===");
  console.log(`Current time: ${new Date().toISOString()}\n`);
  
  for (const feedInfo of testFeeds) {
    try {
      console.log(`\n--- ${feedInfo.name} ---`);
      const feed = await parser.parseURL(feedInfo.url);
      
      if (feed.items && feed.items.length > 0) {
        const latestItem = feed.items[0];
        console.log(`Latest article: "${latestItem.title}"`);
        console.log(`Publication date: ${latestItem.pubDate || latestItem.isoDate || 'No date'}`);
        
        if (latestItem.pubDate || latestItem.isoDate) {
          const pubDate = new Date(latestItem.pubDate || latestItem.isoDate);
          const now = new Date();
          const diffHours = (now - pubDate) / (1000 * 60 * 60);
          console.log(`Time difference: ${diffHours.toFixed(1)} hours ago`);
        }
        
        // Show first 3 articles timing
        console.log("First 3 articles timing:");
        for (let i = 0; i < Math.min(3, feed.items.length); i++) {
          const item = feed.items[i];
          const pubDateStr = item.pubDate || item.isoDate || 'No date';
          if (pubDateStr !== 'No date') {
            const pubDate = new Date(pubDateStr);
            const diffHours = (now - pubDate) / (1000 * 60 * 60);
            console.log(`  ${i + 1}. ${diffHours.toFixed(1)}h ago - ${item.title.substring(0, 60)}...`);
          }
        }
      }
    } catch (error) {
      console.log(`Error fetching ${feedInfo.name}: ${error.message}`);
    }
  }
}

diagnoseRSSFeeds();