# theOxus: RSS News Aggregator and Analysis Platform

theOxus is a sophisticated RSS news aggregator and digital library platform that collects, processes, and ranks news articles from various international sources using AI. It provides a responsive user interface, real-time updates, community features, and additional tools like a digital library and event calendar.

## Features

### News & Content
- **Sort by Country**: Default country-based organization of news sources with flag indicators
- **45+ International News Sources**: Comprehensive coverage including Sports, Technology, Space, and Legacy news
- **AI-Powered News Ranking**: Ranks articles based on relevance, impact, and sentiment using Mistral AI
- **Customizable News Sources**: Add, remove, or manage RSS feeds from international sources
- **Live Updates**: Automatically refreshes feeds with a real-time news ticker
- **Wikipedia Integration**: Includes current events and Picture of the Day from Wikipedia
- **Top News Analysis**: Highlights AI-ranked global headlines
- **Sports Coverage**: ESPN, Sportskeeda, Football365, Goal.com, ATP World Tour

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

- **Frontend**: React 18, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Google OAuth via OpenID Connect
- **Data Processing**: RSS Parser with custom filtering
- **AI Integration**: Mistral AI for article ranking and analysis
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Storage**: Persistent database storage with automatic cleanup

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
client/: Frontend React application
  src/components/: UI components
  src/pages/: Page components
  src/App.tsx: Main application component

server/: Backend Express server
  index.ts: Server entry point
  routes.ts: API routes
  mistral.ts: AI integration

shared/: Shared types and schemas
README.md: Project documentation
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

## Version History

### Version 11 (Current - May 26, 2025)
- **Anonymous Community Forum**: Added persistent forum with 7-day auto-deletion
- **Voting System**: Implemented upvote/downvote functionality with user restrictions
- **Google Authentication**: Integrated secure OAuth for community participation and premium access
- **Database Migration**: Moved from in-memory to PostgreSQL with Drizzle ORM
- **Performance Analytics**: Real-time load time and visit tracking
- **Enhanced UI**: Improved responsive design and user experience

### Previous Versions
- Enhanced AI ranking algorithms
- Multi-source RSS aggregation
- Wikipedia integration
- Digital library features
- Calendar and event displays

## Contributing
Refer to CONTRIBUTING.md for guidelines.

## License
Apache License 2.0. See LICENSE for details.

## Learn More
For implementation details, review the source code in the client/ and server/ directories.