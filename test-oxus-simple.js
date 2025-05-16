// Simple test script without dependencies
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/theoxus-headlines',
  method: 'GET'
};

console.log('Fetching theOxus.com headlines...');

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      
      console.log('\n===== TOP HEADLINE =====');
      if (parsedData.topHeadline) {
        console.log(`Title: ${parsedData.topHeadline.title}`);
        console.log(`Source: ${parsedData.topHeadline.sourceName}`);
        console.log(`Publication Date: ${new Date(parsedData.topHeadline.pubDate).toLocaleString()}`);
        
        if (parsedData.topHeadline.scores) {
          console.log('\nSCORES:');
          console.log(`- Relevance: ${parsedData.topHeadline.scores.relevance}/100 (40% of total)`);
          console.log(`- Impact: ${parsedData.topHeadline.scores.impact}/100 (40% of total)`);
          console.log(`- Sentiment: ${parsedData.topHeadline.scores.sentiment}/100 (20% of total)`);
          console.log(`- Composite Score: ${parsedData.topHeadline.scores.composite}/100\n`);
        }
      } else {
        console.log('No top headline found.');
      }
      
      console.log('\n===== HEADLINES COUNT =====');
      const headlinesCount = parsedData.headlines ? parsedData.headlines.length : 0;
      console.log(`Total headlines analyzed: ${headlinesCount}`);
      
    } catch (error) {
      console.error('Error parsing response:', error.message);
      console.log('Raw response:', data.substring(0, 500) + '...');
    }
  });
});

req.on('error', error => {
  console.error('Error:', error.message);
});

req.end();