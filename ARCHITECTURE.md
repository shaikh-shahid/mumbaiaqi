# Architecture Overview

## JSON-First Static Architecture

This project uses a **fully static, JSON-based architecture** with no database dependencies at runtime.

### Core Principles

1. **JSON is the source of truth** - All data lives in `data/` directory
2. **No runtime database** - SQLite removed from production dependencies
3. **GitHub Actions for automation** - Daily AQI updates via scheduled workflows
4. **Community-driven** - Zones and recommendations edited via GitHub PRs
5. **Zero server costs** - Deploy to static hosting (GitHub Pages, Netlify, Vercel)

## File Structure

### Data Files (`data/`)

- **`zones.json`**: Static zone metadata
  - Location (lat/lon)
  - Geographic context (proximity to sea, green space, etc.)
  - Baseline AQI
  - **Community-editable** via PRs

- **`aqi-data.json`**: Current AQI snapshot
  - Updated daily by GitHub Actions
  - Contains current AQI, pollutants (PM2.5, PM10, etc.)
  - Auto-committed to repository

- **`recommendations.json`**: Pollution reduction recommendations
  - Organized by `zone_id`
  - Mix of AI-generated and community-contributed
  - **Community-editable** via PRs

### Client Files (`client/public/data/`)

Mirror of `data/` directory, automatically synced:
- Used by Vite dev server
- Copied during build process
- Same structure as `data/`

## Automation

### Daily AQI Updates

**Workflow**: `.github/workflows/update-aqi.yml`

1. Runs daily at 6:00 AM IST (00:30 UTC)
2. Executes `scripts/update-aqi.js`
3. Fetches AQI from:
   - API Ninjas (if `AQI_API_KEY` secret is set)
   - OpenAQ (fallback, no key required)
4. Updates `data/aqi-data.json` and `client/public/data/aqi-data.json`
5. Commits and pushes changes automatically

**Setup**:
- Add `AQI_API_KEY` to GitHub Secrets (optional, improves rate limits)
- Workflow has `contents: write` permission for auto-commits

### AI Recommendation Generation

**Script**: `scripts/generate-initial-recommendations.js`

- Reads from `data/zones.json` and `data/aqi-data.json`
- Uses OpenAI API to generate recommendations
- Only generates for zones without existing recommendations
- Writes to both `data/` and `client/public/data/`

**Usage**:
```bash
export OPENAI_API_KEY="sk-..."
npm run generate-recs
```

## Community Contributions

### Adding Zones

1. Edit `data/zones.json`
2. Add new zone entry with next available `id`
3. Create PR
4. Maintainers review and merge

### Adding/Editing Recommendations

1. Edit `data/recommendations.json`
2. Add/edit recommendations for any `zone_id`
3. Follow format in CONTRIBUTING.md
4. Create PR
5. Maintainers review and merge

## Development Workflow

### Local Development

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Frontend reads from**:
   - `client/public/data/*.json` (served by Vite)

3. **To update data locally**:
   - Edit files in `data/` directory
   - Copy to `client/public/data/` (or use scripts which do this automatically)

### Generating Recommendations

```bash
# Set OpenAI API key
export OPENAI_API_KEY="sk-..."

# Generate recommendations
npm run generate-recs
```

### Updating AQI Data

```bash
# Set API key (optional)
export AQI_API_KEY="your-key"

# Run update script
node scripts/update-aqi.js
```

## Deployment

### Static Hosting

The app is fully static - no server required:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy** `client/dist/` to:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static hosting service

### Data Sync

- `data/` files are the source of truth
- `client/public/data/` is synced automatically by scripts
- Build process includes `client/public/data/` in final bundle

## Benefits of This Architecture

1. **Zero Runtime Costs**: No database, no server
2. **Simple Deployment**: Just static files
3. **Version Control**: All data changes tracked in Git
4. **Community-Friendly**: Easy to contribute via PRs
5. **Fast Performance**: localStorage caching + static files
6. **Automated Updates**: GitHub Actions handle daily AQI refresh
7. **No Vendor Lock-in**: Pure JSON, easy to migrate

## Migration from SQLite

If you have existing SQLite data:

1. The `migrate-to-json.js` script is still available (requires `better-sqlite3`)
2. Run it once to export data to JSON
3. After migration, SQLite is no longer needed

**Note**: `better-sqlite3` has been removed from production dependencies. It's only needed if you want to run the one-time migration script.

## Future Enhancements

Potential additions while staying JSON-first:

- Historical AQI trends (store in `data/aqi-history.json`)
- Recommendation voting (store votes in JSON)
- Zone metadata versioning (Git history provides this)
- Automated recommendation quality checks (GitHub Actions)
