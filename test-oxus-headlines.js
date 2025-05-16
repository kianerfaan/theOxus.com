// Simple script to test the theOxus headline analysis feature
import fetch from 'node-fetch';

async function testOxusHeadlines() {
  try {
    console.log('Fetching theOxus.com headlines...');
    
    const response = await fetch('http://localhost:5000/api/theoxus-headlines');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    
    console.log('\n===== TOP HEADLINE =====');
    if (data.topHeadline) {
      console.log(`Title: ${data.topHeadline.title}`);
      console.log(`Source: ${data.topHeadline.sourceName}`);
      console.log(`Publication Date: ${new Date(data.topHeadline.pubDate).toLocaleString()}`);
      console.log(`Link: ${data.topHeadline.link}`);
      console.log('\nSCORES:');
      console.log(`- Relevance: ${data.topHeadline.scores.relevance}/100 (40% of total)`);
      console.log(`- Impact: ${data.topHeadline.scores.impact}/100 (40% of total)`);
      console.log(`- Sentiment: ${data.topHeadline.scores.sentiment}/100 (20% of total)`);
      console.log(`- Composite Score: ${data.topHeadline.scores.composite}/100\n`);
    } else {
      console.log('No top headline found.');
    }
    
    console.log('\n===== ALL HEADLINES (RANKED) =====');
    if (data.headlines && data.headlines.length > 0) {
      data.headlines.forEach((headline, index) => {
        console.log(`\n${index + 1}. ${headline.title} (Source: ${headline.sourceName})`);
        console.log(`   Composite Score: ${headline.scores.composite}/100`);
      });
      
      console.log(`\nTotal headlines analyzed: ${data.headlines.length}`);
    } else {
      console.log('No headlines found.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOxusHeadlines();