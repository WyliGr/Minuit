# Strasbourg Cinema Movie Parser 🎬

A modern web application that displays current movie showtimes across multiple cinemas in Strasbourg, France.

## Features

- **Real-time showtimes**: Fetches and displays current movie sessions from 5 Strasbourg cinemas
- **Interactive filtering**: Filter by cinema, VOST only, or hide past showtimes
- **Search functionality**: Quickly find movies by title
- **Responsive design**: Works on mobile and desktop devices
- **Live clock** ⏰: Shows current time and automatically updates showtime status

## Cinemas Covered

- UGC Ciné Cité
- Le Cosmos
- Vox
- Star
- Star St-Exupéry

## Technology Stack

### Frontend
- **Framework**: Astro (static site generator)
- **UI**: Vue.js components
- **Styling**: Tailwind CSS
- **Deployment**: Docker with Nginx

### Backend
- **Data Source**: Allociné (via n8n workflow)
- **API**: Custom n8n workflow that scrapes and structures cinema data
- **Format**: JSON API endpoint

## Installation & Running

### Prerequisites
- Docker
- Docker Compose

### Quick Start

```bash
# Clone the repository
git clone https://github.com/WyliGr/Minuit.git
cd Minuit

# Build and start the application
docker-compose up -d --build

# Access the application
open http://localhost:3000
```

### Development Mode

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

## Docker Setup

The application uses a multi-stage Docker build:

1. **Build stage**: Uses Node.js to compile the Astro application
2. **Production stage**: Uses Nginx to serve static files efficiently

### Docker Commands

```bash
# Build and start
docker-compose up -d --build

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose down && docker-compose up -d --build
```

## Backend Configuration

The application relies on a separate n8n workflow that:
1. Fetches daily showtime data from Allociné
2. Processes and structures the data
3. Provides a JSON API endpoint

The n8n workflow configuration is available in `n8n-backend.json`.

## API Endpoint

The frontend expects the backend API to be available at:
```
http://n8n.wyligr.fr/webhook/api/theater
```

To use your own backend, update the API URL in:
```
frontend/src/services/api.ts
```

## Data Structure

The API returns an array of movies with the following structure:

```typescript
interface Movie {
  titre: string;           // Movie title
  duree: string | number; // Duration (minutes or formatted string)
  seances: Record<string, Array<{
    time: string;          // Showtime (HH:MM)
    isVost: boolean;       // Whether the show is in original version
    isPreview: boolean;    // Whether it's a preview screening
  }>>;                    // Keyed by cinema name
}
```

## Environment Variables

No environment variables are required for the frontend application.

## Deployment

### Coolify

This project is configured for deployment with Coolify. The application will automatically rebuild and redeploy when changes are pushed to the main branch.

### Manual Deployment

For manual deployment to any Docker-compatible host:

```bash
# Copy files to server
scp -r . user@server:/path/to/app

# SSH into server
ssh user@server

# Navigate to app directory
cd /path/to/app

# Start the application
docker-compose up -d --build
```

## Project Structure

```
/
├── frontend/              # Astro frontend application
│   ├── src/               # Source files
│   │   ├── components/    # Vue components
│   │   ├── pages/         # Astro pages
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── n8n-backend.json       # n8n workflow configuration
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

## Troubleshooting

### Build Issues

If you encounter build errors:

```bash
# Clean and rebuild
rm -rf frontend/node_modules frontend/dist
cd frontend
npm install
cd ..
docker-compose up -d --build
```

### API Connection Issues

If the application shows API errors:
1. Verify the backend API is running
2. Check CORS headers on the API endpoint
3. Verify network connectivity to the API URL

## License

This project is licensed under the "Good luck with that" license. Use at your own risk.

---

**Strasbourg Cinema Movie Parser** - Your guide to Strasbourg's cinema scene! 🍿