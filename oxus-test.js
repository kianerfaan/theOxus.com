// Test script for theOxus headline analysis feature using axios
import axios from 'axios';

async function testOxusEndpoint() {
  console.log('Testing theOxus.com headline analysis API...');
  
  try {
    console.log('Sending request to /api/theoxus-headlines...');
    const response = await axios.get('http://localhost:5000/api/theoxus-headlines', {
      timeout: 60000 // 60 second timeout to allow for API processing
    });
    
    if (response.status === 200) {
      const { headlines, topHeadline } = response.data;
      
      console.log('\n===== TOP HEADLINE =====');
      if (topHeadline) {
        console.log(`Title: ${topHeadline.title}`);
        console.log(`Source: ${topHeadline.sourceName}`);
        console.log(`Publication Date: ${new Date(topHeadline.pubDate).toLocaleString()}`);
        console.log(`Link: ${topHeadline.link}`);
        
        if (topHeadline.scores) {
          console.log('\nSCORES:');
          console.log(`- Relevance: ${topHeadline.scores.relevance}/100 (40% of total)`);
          console.log(`- Impact: ${topHeadline.scores.impact}/100 (40% of total)`);
          console.log(`- Sentiment: ${topHeadline.scores.sentiment}/100 (20% of total)`);
          console.log(`- Composite Score: ${topHeadline.scores.composite}/100\n`);
        }
      } else {
        console.log('No top headline found.');
      }
      
      console.log('\n===== ALL HEADLINES (TOP 5) =====');
      if (headlines && headlines.length > 0) {
        headlines.slice(0, 5).forEach((headline, index) => {
          console.log(`\n${index + 1}. ${headline.title} (${headline.sourceName})`);
          if (headline.scores) {
            console.log(`   Composite Score: ${headline.scores.composite}/100`);
            console.log(`   Relevance: ${headline.scores.relevance}, Impact: ${headline.scores.impact}, Sentiment: ${headline.scores.sentiment}`);
          }
        });
        
        console.log(`\nTotal headlines analyzed: ${headlines.length}`);
      } else {
        console.log('No headlines found.');
      }
    } else {
      console.error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

// Execute the test
testOxusEndpoint().catch(error => {
  console.error('Unexpected error:', error);
});