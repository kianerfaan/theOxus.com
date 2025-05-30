# theOxus.com Headline Analysis Implementation

This document describes the implementation of headline analysis for theOxus.com according to specific requirements.

## Functionality Overview

The system retrieves headlines from aggregated RSS feeds from various international sources, including legacy and alternative sources from different regions (Chinese, Russian, Indian, Iranian, Israeli, and other non-Western outlets). It then performs sentiment analysis on these headlines using the Mistral AI LLM, treating all sources neutrally and judging solely on content rather than source origin.

## Scoring Algorithm

Headlines are ranked based on three key metrics:

1. **Relevance (40% weight)**: Score from 0-100 based on topical importance, global significance, and urgency. This considers keyword/context analysis.

2. **Impact (40% weight)**: Score from 0-100 for societal/economic influence via entity recognition and event significance.

3. **Sentiment (20% weight)**: Score from 0-100 for emotional tone, where 0 is extremely negative, 50 is neutral, and 100 is extremely positive.

A composite score is calculated using the formula:
```
(0.4 × Relevance) + (0.4 × Impact) + (0.2 × Sentiment)
```

Headlines are then sorted by composite score, with the highest score appearing first.

## Technical Implementation

The implementation consists of two main components:

### 1. Server Backend (`server/oxus.ts`)

- **Feed Retrieval**: The system gathers headlines from all active feed sources in the database.
- **Recent Filtering**: Only headlines published in the last 2 hours are considered (with fallbacks to 6 and 12 hours if insufficient recent content is found).
- **Content Analysis**: Each headline is analyzed using the Mistral AI API to generate relevance, impact, and sentiment scores.
- **Caching**: Analysis results are cached to prevent redundant API calls and work within rate limits.
- **Sorting**: Headlines are sorted by composite score to deliver the most relevant content first.

### 2. API Endpoint (`server/routes.ts`)

- The API endpoint `/api/theoxus-headlines` returns both the full list of ranked headlines and the top headline.
- This allows for flexible display options in the frontend.

## Example Output

```json
{
  "headlines": [
    {
      "id": "...",
      "title": "How backchannels and US mediators pulled India and Pakistan back from the brink",
      "sourceName": "Washington Post",
      "pubDate": "2025-05-11T07:18:16.000Z",
      "content": "...",
      "contentSnippet": "...",
      "link": "https://example.com/article",
      "source": "washingtonpost.com",
      "scores": {
        "relevance": 95,
        "impact": 90,
        "sentiment": 85,
        "composite": 91
      }
    },
    ...
  ],
  "topHeadline": {
    // Same structure as above, representing the highest-ranked headline
  }
}
```

## Usage Instructions

To access the ranked headlines:

```
GET /api/theoxus-headlines
```

This will return the full list of ranked headlines along with the top headline separately for easy access.

## Error Handling

- The system implements retry logic for API rate limiting.
- If no headlines are found within the desired timeframe, the system incrementally extends the time window.
- Caching helps minimize API calls and ensures consistent results.

## Optimization Features

- **Rate Limit Management**: Implements delays between API calls and retries on 429 errors.
- **Result Caching**: Stores analysis results to reduce API usage and improve performance.
- **Selective Analysis**: Only analyzes a subset of recent articles to balance quality and performance.