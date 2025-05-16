# theOxus: Intelligent RSS News Aggregator and Analysis Platform

![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

theOxus is an RSS news aggregator and digital library platform that combines content curation with a streamlined user experience. It leverages AI to rank articles by relevance, impact, and sentiment while providing an interface for consuming news from international sources.

## Features

- **AI-Powered News Ranking**: Uses Mistral AI to analyze and rank news articles by relevance, impact, and sentiment
- **Customizable News Sources**: Add, remove, or toggle RSS feeds from a wide range of international sources
- **Live Updates**: Automatic feed refreshing with real-time news ticker
- **Responsive Design**: Fully responsive UI that works seamlessly on desktop and mobile devices
- **Digital Library**: Access to classic literature and important documents
- **Calendar Integration**: Track global events, holidays, and astronomical phenomena
- **Wikipedia Integration**: Current events and Picture of the Day from Wikipedia
- **Top News Analysis**: Curated selection of the most important global headlines
- **Internationalization**: Support for news sources from around the world with country flags

## Technology Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Express.js with Node.js
- **Data Processing**: RSS Parser with custom filtering and processing
- **AI Integration**: Mistral AI for content ranking and analysis
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter for lightweight client-side routing
- **Database**: In-memory storage with PostgreSQL schema definitions for easy migration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/theoxus.git
   cd theoxus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   MISTRAL_API_KEY=your_mistral_api_key  # Optional, for AI ranking features
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to: `http://localhost:5000`

## Usage Guide

### Adding Custom News Sources

theOxus comes with numerous international news sources pre-configured. You can add your own RSS feeds:

1. Click the "+" button in the sidebar under "Feed Sources"
2. Enter the source name and RSS feed URL
3. Select a category (optional)
4. Click "Add Source"

### News Reading Experience

- **Main Feed**: View all articles or filter by source
- **Ticker Tape**: Toggle the scrolling headline ticker at the top of the page
- **Top News**: AI-ranked important headlines appear at the top
- **Article Preview**: Click on any article to read a summary or visit the original source

### Digital Library

Access a curated collection of important documents and classic literature in the Library section.

### Event Calendar

View upcoming events including:
- International holidays
- Astronomical events
- Sports fixtures
- Space missions
- Elections

## Project Structure

```
theOxus/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ui/            # ShadCN UI components 
│   │   │   └── ...            # Custom application components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configurations
│   │   ├── pages/             # Page components
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Application entry point
│   └── index.html             # HTML template
├── server/                    # Backend Express server
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Data storage implementation
│   ├── mistral.ts             # AI integration for article analysis
│   ├── oxus.ts                # Advanced news processing logic
│   └── vite.ts                # Vite configuration
├── shared/                    # Shared types and schemas
│   └── schema.ts              # Database schemas and types
└── README.md                  # This documentation
```

## API Endpoints

The application provides the following API endpoints:

- **News Sources**
  - `GET /api/sources` - Get all news sources
  - `POST /api/sources` - Add a new news source
  - `PATCH /api/sources/:id` - Update a news source
  - `DELETE /api/sources/:id` - Remove a news source

- **News Content**
  - `GET /api/news` - Get all news items (optionally filtered by source ID)
  - `GET /api/top-news` - Get AI-ranked top news items
  - `GET /api/theoxus-headlines` - Get curated headlines

- **Wikipedia Integration**
  - `GET /api/wikipedia-current-events` - Get current events from Wikipedia
  - `GET /api/wikipedia-picture-of-the-day` - Get the Wikipedia picture of the day

## Extending the Platform

### Adding New Features

1. **Advanced Search**: Implement full-text search across articles
2. **User Accounts**: Add authentication for personalized experiences
3. **Offline Reading**: Implement service workers for offline article access
4. **Notifications**: Add notification support for breaking news

### AI Integration

The platform uses Mistral AI for content analysis. To enable this feature:

1. Obtain a Mistral AI API key from [https://mistral.ai/](https://mistral.ai/)
2. Set the `MISTRAL_API_KEY` environment variable

## Deployment

theOxus can be deployed to any hosting service that supports Node.js:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Database Migration

The application is designed to easily migrate from in-memory storage to a persistent database:

1. Set up a PostgreSQL database
2. Update the database connection in `server/index.ts` 
3. Run the schema migration using Drizzle:
   ```bash
   npm run db:push
   ```

## Contributing

We welcome contributions to theOxus! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- All the news organizations providing RSS feeds
- The open-source community for the excellent tools and libraries
- Mistral AI for providing the AI analysis capabilities
- Wikipedia for current events and Picture of the Day content

---

© 2025 theOxus Team
