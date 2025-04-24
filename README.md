# NewsFlow: Open-Source RSS News Aggregator

![License](https://img.shields.io/badge/license-Apache%202.0-blue)

NewsFlow is a clean, content-focused RSS news aggregator that provides a streamlined news reading experience with customizable sources. Built with modern web technologies, it offers a distraction-free interface for consuming news from multiple international sources.

<p align="center">
  <img src="generated-icon.png" alt="NewsFlow Logo" width="150">
</p>

## Features

- **Clean, Content-Focused Design**: Simple interface with Philadelphia flag-inspired blue and yellow color scheme
- **Customizable News Sources**: Add, remove, or toggle RSS feed sources
- **Live Updates**: Automatic feed refreshing every 5 minutes
- **Responsive Design**: Works on desktop and mobile devices
- **International News**: Pre-configured with diverse news sources from around the world

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Express.js
- **Data Handling**: In-memory storage (easily upgradable to PostgreSQL)
- **RSS Processing**: rss-parser
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kianerfaan/NewsFlow.git
   cd NewsFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to: `http://localhost:5000`

## Configuration

### Adding Custom News Sources

NewsFlow comes with several international news sources pre-configured. You can add your own RSS feeds:

1. Click the "+" button in the sidebar under "Feed Sources"
2. Enter the source name and RSS feed URL
3. Click "Add Source"

### Modifying Default Sources

Default news sources are configured in `server/storage.ts`. You can modify this file to change the default sources that appear when the application first loads.

## Project Structure

```
NewsFlow/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   └── index.html         # HTML template
├── server/                # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage (in-memory)
│   └── vite.ts            # Vite configuration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schemas and types
└── README.md              # This file
```

## API Endpoints

- `GET /api/sources` - Get all news sources
- `POST /api/sources` - Add a new news source
- `PATCH /api/sources/:id` - Update a news source (toggle active state)
- `DELETE /api/sources/:id` - Remove a news source
- `GET /api/news` - Get all news items (optionally filtered by source ID)

## Extension and Customization

### Adding New Features

1. **Bookmarking**: Implement the bookmark feature that's already UI-prepared
2. **Categorization**: Add category filtering for news articles
3. **Search**: Implement full-text search across articles
4. **User Accounts**: Add user authentication for personalized experiences

### Styling Customization

The app uses TailwindCSS for styling. Main color schemes are defined in `client/src/index.css`.

## Deployment

NewsFlow can be deployed to any hosting service that supports Node.js:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Database Migration

Currently, NewsFlow uses in-memory storage. To migrate to a persistent database:

1. Implement the `IStorage` interface in `server/storage.ts` with your database of choice
2. Update the database connection configuration
3. Make sure database tables match the schemas defined in `shared/schema.ts`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- All the news sources that provide RSS feeds
- The open-source community for the excellent tools and libraries

---

© 2025 [Kian Erfaan](https://x.com/KianErfaan)