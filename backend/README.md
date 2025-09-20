# Meko Moja Backend

Backend API for the Meko Moja (One Stove) community awareness campaign and tracker.

## Features

- RESTful API for stories, threads, and community stats
- SQLite database with seeded demo data
- File upload support for story images
- Rate limiting and security headers
- Production-ready with Docker support

## Quick Start

### Development

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Initialize database:
\`\`\`bash
npm run init-db
\`\`\`

3. Start development server:
\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:3001`

### Production with Docker

1. Build the image:
\`\`\`bash
docker build -t meko-moja-backend .
\`\`\`

2. Run the container:
\`\`\`bash
docker run -p 3001:3001 meko-moja-backend
\`\`\`

## API Endpoints

### Stories
- `GET /api/stories` - Get all stories (with pagination)
- `POST /api/stories` - Create new story (with image upload)
- `POST /api/stories/:id/like` - Like a story

### Forum
- `GET /api/threads` - Get all discussion threads
- `POST /api/threads` - Create new thread
- `GET /api/threads/:id/comments` - Get comments for a thread
- `POST /api/threads/:id/comments` - Add comment to thread

### Statistics
- `GET /api/stats` - Get community statistics and clean fuel adoption rates

### Health
- `GET /api/health` - Health check endpoint

## Database Schema

The database includes tables for:
- `stories` - User-shared cooking stories with images
- `threads` - Community forum discussions
- `comments` - Thread replies
- `story_likes` - Like tracking to prevent duplicates

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Security Features

- Helmet.js security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- File upload validation (images only, 5MB limit)
- SQL injection protection with parameterized queries
