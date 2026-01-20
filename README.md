# Mumbai AQI Map & Resolution System

A static web application that visualizes Mumbai's air quality with an interactive map and provides community-driven pollution reduction recommendations. The goal is to reduce city-wide AQI to 30.

## Features

- Interactive map of Mumbai with 30+ zones covering the entire city
- Color-coded AQI visualization (Green/Yellow/Orange/Red/Purple)
- **Live AQI Data**: Automatically updated every 24 hours via GitHub Actions
- **AI-Generated Recommendations**: Initial recommendations generated using OpenAI
- **Community-Driven**: Anyone can contribute recommendations via GitHub PRs
- Real-time progress tracking
- **Fast Performance**: localStorage caching for instant loads
- **Zero Server Costs**: Deploy to GitHub Pages, Netlify, or Vercel for free

## Architecture

This is a **fully static site** with:
- **JSON Data Files**: All data stored in `data/` directory (zones, AQI, recommendations)
- **GitHub Actions**: Automated AQI updates every 24 hours
- **localStorage Caching**: Fast client-side caching with 24-hour refresh
- **Community Contributions**: Recommendations updated via GitHub PRs

## Tech Stack

### Frontend
- React with TypeScript
- Leaflet.js for interactive maps
- Tailwind CSS for styling
- Vite for building

### Data & Automation
- JSON files for data storage (no database required)
- GitHub Actions for automated AQI updates
- OpenAI API (for generating initial recommendations)

## Prerequisites

1. **Node.js** (v18 or higher)
2. **OpenAI API Key** (optional, only needed for generating initial recommendations via AI)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mumbaiaqi
```

2. Install dependencies:
```bash
npm run install-all
```

## Development

1. **Start the development server**:
```bash
npm run dev
```

2. **Open your browser**:
Navigate to `http://localhost:3000`

The app will load data from `data/` directory. Make sure you have:
- `data/zones.json` - Zone location data
- `data/aqi-data.json` - Current AQI values
- `data/recommendations.json` - Recommendations

## Generating Initial Recommendations

To generate initial recommendations using OpenAI:

1. **Set your OpenAI API key**:
   - Option 1: Set environment variable: `export OPENAI_API_KEY="sk-..."`
   - Option 2: Edit `scripts/generate-initial-recommendations.js` and add your key directly

2. **Generate recommendations**:
```bash
npm run generate-recs
```

This will:
- Read zones from `data/zones.json` and AQI data from `data/aqi-data.json`
- Generate 7-10 comprehensive recommendations for each zone using OpenAI
- Save all recommendations to `data/recommendations.json`
- Also update `client/public/data/recommendations.json` for immediate use

**Note**: This script only generates recommendations for zones that don't already have any. To regenerate all recommendations, you can manually edit `recommendations.json` to remove entries for specific zones.

## Building for Production

```bash
npm run build
```

This creates a `dist/` directory with all static files ready for deployment.

## Deployment

### GitHub Pages

1. Build the project:
```bash
npm run build
```

2. Configure GitHub Pages to serve from `client/dist` directory

3. Set up GitHub Actions workflow (already configured in `.github/workflows/update-aqi.yml`)

### Netlify

1. Connect your repository to Netlify
2. Set build command: `cd client && npm install && npm run build`
3. Set publish directory: `client/dist`

### Vercel

1. Connect your repository to Vercel
2. Set root directory to `client`
3. Vercel will auto-detect Vite configuration

## Automated AQI Updates

AQI data is automatically updated every 24 hours via GitHub Actions:

1. The workflow runs at 6:00 AM IST daily
2. Fetches AQI data from external APIs (API Ninjas or OpenAQ)
3. Updates `data/aqi-data.json`
4. Commits and pushes changes automatically

**Setup**:
1. Add `AQI_API_KEY` to GitHub Secrets (optional, for API Ninjas - improves rate limits)
2. The workflow will run automatically on schedule (daily at 6:00 AM IST)
3. Updates are automatically committed to the repository

## Contributing Recommendations

We welcome community contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

**Quick Guide**:
1. Fork the repository
2. Edit `data/recommendations.json` (or `data/zones.json` to add new zones)
3. Add your recommendations/zones following the format (see CONTRIBUTING.md)
4. Create a Pull Request
5. Maintainers will review and merge

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Adding new zones
- Adding/editing recommendations
- Format requirements
- Best practices

## Project Structure

```
mumbaiaqi/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # Data loading services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/
│   │   └── data/           # JSON data files (copied during build)
│   └── package.json
├── data/                   # JSON data files
│   ├── zones.json          # Zone location data
│   ├── aqi-data.json      # Current AQI (auto-updated)
│   └── recommendations.json # Community recommendations
├── scripts/                # Utility scripts
│   ├── generate-initial-recommendations.js # Generate AI recommendations (OpenAI)
│   └── update-aqi.js       # GitHub Actions AQI updater
├── .github/
│   └── workflows/
│       └── update-aqi.yml  # Automated AQI updates
└── package.json
```

## Data Structure

### zones.json
Static zone information (location, geographic context, baseline AQI)

### aqi-data.json
Current AQI values for each zone (updated daily by GitHub Actions)

### recommendations.json
Community-driven recommendations (updated via PRs)

## Local Development with Data

During development, the app loads JSON files from `/data/`. Make sure:
- Files exist in `data/` directory
- Vite serves them from `public/data/` (automatically copied)

## Troubleshooting

### Data Not Loading
- Ensure JSON files exist in `data/` directory
- Check browser console for errors
- Verify file paths in `dataLoader.ts`

### GitHub Actions Not Running
- Check workflow file syntax
- Verify cron schedule
- Check GitHub Actions logs

### Recommendations Not Showing
- Verify `recommendations.json` format
- Check zone IDs match between files
- Ensure JSON is valid

## Key Features Explained

### Static Site Architecture
- **No server or database required** - fully static JSON files
- All data in JSON files (zones, AQI, recommendations)
- Fast loading with localStorage caching
- Automatic AQI updates via GitHub Actions (daily)
- Zero hosting costs - deploy to GitHub Pages, Netlify, or Vercel

### Community Contributions
- Anyone can add/edit zones and recommendations via GitHub PRs
- Simple JSON format - no database knowledge required
- Maintainer review process ensures quality
- See CONTRIBUTING.md for detailed guidelines

### Automated Updates
- GitHub Actions runs daily at 6:00 AM IST
- Fetches fresh AQI data from multiple sources (API Ninjas, OpenAQ)
- Updates `data/aqi-data.json` automatically
- Commits changes back to repository
- No manual intervention needed

## Future Enhancements

- Historical trends visualization
- More data sources for AQI
- Recommendation voting system
- Multi-language support
- Offline mode support

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing recommendations.
