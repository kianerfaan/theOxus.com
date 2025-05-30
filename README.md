# theOxus: RSS News Aggregator and Analysis Platform

theOxus is a sophisticated RSS news aggregator and digital library platform that collects, processes, and ranks news articles from various international sources using AI. It provides a responsive user interface, real-time updates, community features, and additional tools like a digital library and event calendar.

## Features

### News & Content
- **65+ International News Sources**: Comprehensive coverage including major outlets, technology, space, finance, and academic journals
- **AI-Powered News Ranking**: Advanced Mistral AI integration ranks articles by relevance, impact, and sentiment with composite scoring
- **Background Processing**: Automated 15-minute background jobs for instant top news loading with cached results
- **Performance Optimized**: C-style optimized date utilities with fallback support for improved RSS parsing speed
- **Circuit Breaker Pattern**: Resilient error handling for external RSS feeds and AI services
- **Real-time Updates**: Live news ticker and automatic feed refreshing
- **Wikipedia Integration**: Current events and Picture of the Day from Wikipedia
- **Country-Based Organization**: News sources organized by country with flag indicators
- **Advanced Filtering**: Time-based article filtering with recent content prioritization

### Authentication & Premium Features
- **Google OAuth Integration**: Secure authentication system using Google OpenID Connect
- **Premium Access Control**: Authenticated users gain access to community features and future paid premium services
- **Privacy-Focused Data Collection**: Only Google account identifier (email address), account creation date, and last login timestamp are stored
- **No Device Tracking**: IP addresses and client device information are not collected or stored in the database

### Community & Interaction
- **Anonymous Community Forum**: Authenticated users can engage in discussions with automatic post deletion after 7 days
- **Upvote/Downvote System**: Rate community posts with one vote per user restriction enforced by authentication
- **Real-time Post Feed**: Dynamic community posts with live sorting options
- **Post Sorting**: Sort by recent, most upvoted, most downvoted, or soon-to-delete

### Analytics & Monitoring
- **Page Visit Tracking**: Timestamped visit counter displayed in sidebar header
- **Performance Metrics**: Real-time load time tracking with historical averages
- **Anonymous Usage Statistics**: Aggregate data collection without personal identification

### Additional Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Digital Library**: Access classic literature and important documents
- **Calendar Integration**: Displays global events, holidays, and astronomical phenomena

## Technology Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, ShadCN UI, Wouter (routing)
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM and automatic migrations
- **Authentication**: Google OAuth 2.0 via OpenID Connect
- **Data Processing**: RSS Parser with resilient error handling and circuit breakers
- **AI Integration**: Mistral AI for advanced article ranking and sentiment analysis
- **State Management**: TanStack Query v5 with optimistic updates
- **Performance**: 
  - Background job processing for instant loading
  - C-style optimized date utilities
  - Performance monitoring and metrics
  - Circuit breaker pattern for external services
- **Development**: 
  - Vite for fast development and building
  - Hot module replacement
  - TypeScript strict mode
  - ESLint and Prettier integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

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

3. Set up your database and create a `.env` file in the root directory with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   MISTRAL_API_KEY=your_mistral_api_key  # Optional, for AI ranking features
   SESSION_SECRET=your_session_secret_key
   REPL_ID=your_oauth_client_id  # For Google authentication
   ISSUER_URL=https://replit.com/oidc  # OAuth issuer URL
   REPLIT_DOMAINS=your_domain.com  # Your deployment domain
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5000 in your browser.

## Usage

### News & Content
- **Add News Sources**: Use the "+" button in the sidebar to add RSS feeds by entering a name and URL
- **View News**: Filter articles by source, view AI-ranked top news, or read summaries
- **Top Headlines**: Access AI-powered analysis of the most important current news
- **Access Library**: Browse documents and literature in the Library section
- **Check Calendar**: View events, holidays, and more in the Calendar section

### Community Forum
- **Authentication Required**: Google OAuth login required to access community features
- **Anonymous Posting**: Create posts without revealing personal information to other users
- **Automatic Content Expiration**: All posts automatically delete after 7 days from creation
- **Voting System**: Upvote or downvote posts with one vote per authenticated user per post
- **Content Organization**: Sort posts by recent, popularity, or deletion timeline

## Project Structure

```
client/                     # Frontend React application
  src/
    components/
      auth/                 # Authentication components
      layout/               # Layout components (Sidebar, Toolbar, ThemeToggle)
      news/                 # News-related components (NewsFeed, ArticleCard, TopNewsCard, SearchBar)
      widgets/              # Widget components (TickerTape, TradingView widgets)
      ui/                   # Shared UI components (shadcn/ui)
      *.tsx                 # Remaining components (Wikipedia, PictureOfTheDay)
    pages/                  # Page components (Home, Market, Forum, Library, Calendar, etc.)
    hooks/                  # Custom React hooks
    lib/                    # Utility libraries and configurations
    contexts/               # React contexts
    types/                  # TypeScript type definitions
    App.tsx                 # Main application component
    main.tsx                # Application entry point

server/                     # Backend Express server
  api/                      # API route handlers
    routes.ts               # Main API routes and endpoints
  core/                     # Core database and storage modules
    db.ts                   # Database connection and configuration
    storage.ts              # Data access layer and storage interface
  services/                 # Business logic and external service integrations
    backgroundJobs.ts       # Background processing for top news analysis
    mistral.ts              # Mistral AI integration for article ranking
    oxus.ts                 # Advanced news aggregation and processing
  utils/                    # Utility functions and helpers
    dateUtils.ts            # Date parsing and formatting utilities
    dateUtilsOptimized.ts   # Performance-optimized date operations
    performanceMonitor.ts   # Performance tracking and monitoring
    resilience.ts           # Circuit breakers and error handling
  index.ts                  # Server entry point and Express configuration
  vite.ts                   # Vite development server integration

shared/                     # Shared types and database schemas
  schema.ts                 # Drizzle ORM schemas and TypeScript types

docs/                       # Documentation and assets
  assets/                   # Document assets
  legal/                    # Legal documents (privacy policy, terms of service)

native/                     # Native C++ optimizations (optional)
  src/                      # C++ source files for performance-critical operations
  binding.gyp               # Node.js native addon build configuration

package.json                # Node.js dependencies and scripts
drizzle.config.ts           # Database migration configuration
vite.config.ts              # Frontend build configuration
tailwind.config.ts          # Styling configuration
README.md                   # Project documentation
```

## API Endpoints

### News Sources
- `GET /api/sources`: List all sources
- `POST /api/sources`: Add a source
- `PATCH /api/sources/:id`: Update a source
- `DELETE /api/sources/:id`: Remove a source

### News Content
- `GET /api/news`: List news items
- `GET /api/top-news`: List AI-ranked news
- `GET /api/theoxus-headlines`: Get curated top headlines

### Community Forum
- `GET /api/forum-posts`: List active community posts
- `POST /api/forum-posts`: Create a new post
- `PATCH /api/forum-posts/:id/vote`: Vote on a post

### Analytics & Metrics
- `GET /api/visit-count`: Get total page visits
- `GET /api/average-load-time`: Get performance metrics

### Wikipedia Integration
- `GET /api/wikipedia-current-events`: Current events
- `GET /api/wikipedia-picture-of-the-day`: Picture of the Day

## Deployment

1. Set up your production database and environment variables
2. Build the application:
   ```bash
   npm run build
   ```
3. Push database schema to production:
   ```bash
   npm run db:push
   ```
4. Start the production server:
   ```bash
   npm start
   ```

## Authentication System

### Google OAuth Integration
theOxus implements Google OAuth 2.0 via OpenID Connect for user authentication. This system enables access to premium features while maintaining user privacy.

### Data Collection and Storage
**User Authentication Data:**
- Google account identifier (typically email address)
- Account creation timestamp from Google
- Last login timestamp from Google

**Data Not Collected:**
- IP addresses are not stored in the database
- Client device information is not tracked or stored
- User location data is not collected

### Premium Feature Access
Authentication is required to access:
- Community forum participation
- Post creation and voting capabilities
- Future paid premium services and features

### Privacy Implementation
- Forum posts are anonymous to other users
- User identity is not revealed in community interactions
- Posts automatically expire after 7 days
- Vote tracking prevents duplicate voting per user per post

## Architecture & How It Works

### Background Processing System
The application features a sophisticated background job system that runs every 15 minutes:
1. **RSS Aggregation**: Collects articles from 65+ international news sources
2. **AI Analysis**: Processes articles through Mistral AI for relevance, impact, and sentiment scoring
3. **Caching**: Stores ranked results for instant loading
4. **Fallback**: Real-time processing when cache is unavailable

### Performance Optimizations
- **C-style Date Utilities**: Optimized date parsing functions with significant performance improvements
- **Circuit Breaker Pattern**: Prevents cascade failures from external RSS feeds and AI services
- **Performance Monitoring**: Real-time tracking of operation speeds and system health
- **Resilient Error Handling**: Graceful degradation when external services are unavailable

### Component Architecture
- **Modular Design**: Components organized by functionality (news, layout, widgets, auth)
- **Type Safety**: Full TypeScript implementation with strict mode
- **State Management**: TanStack Query for server state with optimistic updates
- **Responsive UI**: Mobile-first design with TailwindCSS and ShadCN components

### Database Design
- **Drizzle ORM**: Type-safe database operations with automatic migrations
- **PostgreSQL**: Robust relational database with performance optimizations
- **Data Integrity**: Foreign key constraints and proper indexing
- **Automatic Cleanup**: Scheduled deletion of expired forum posts and old analytics data

## Version History

### Version 16 (Current - May 30, 2025)
- **Codebase Reorganization**: Complete restructuring of server and client folders for better maintainability
- **Performance Improvements**: Optimized date utilities and background processing
- **Bug Fixes**: Resolved React key warnings and import path issues
- **Documentation**: Updated README with current architecture and organization

### Version 15 (May 30, 2025)
- **Interface Optimization**: Streamlined layout and removed custom source management
- **UI Improvements**: Enhanced styling and user flow optimization

### Version 14 (May 30, 2025)
- **Service Stability**: Enhanced traffic handling and error management
- **Background Processing**: Implemented AI-powered background news analysis

### Previous Versions (11-13)
- Anonymous community forum with voting system
- Google OAuth authentication integration
- Database migration to PostgreSQL
- Performance analytics and monitoring
- Multi-source RSS aggregation with Wikipedia integration

## Contributing
Refer to CONTRIBUTING.md for guidelines.

## License
Apache License 2.0. See LICENSE for details.

## Learn More
For implementation details, review the source code in the client/ and server/ directories.