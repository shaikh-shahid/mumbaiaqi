# Data Folder Structure

## Overview

This project uses **three data folders** with specific purposes:

```
mumbaiaqi/
├── data/                          # 📝 SOURCE OF TRUTH (Edit here)
│   ├── zones.json
│   ├── aqi-data.json
│   └── recommendations.json
│
├── client/
│   ├── public/
│   │   └── data/                  # Development/Dev Server
│   │       ├── zones.json         # (Auto-synced by scripts)
│   │       ├── aqi-data.json
│   │       └── recommendations.json
│   │
│   └── dist/
│       └── data/                  # Production Build Output
│           ├── zones.json         # (Auto-copied by Vite during build)
│           ├── aqi-data.json
│           └── recommendations.json
```

## Folder Purposes

### 1. `data/` - Source of Truth 

**Location**: Root `data/` directory

**Purpose**: 
- **This is where you edit files**
- All manual edits and script outputs go here
- Version controlled in Git
- Community contributions edit files here

**When to edit**:
- Adding new zones → Edit `data/zones.json`
- Adding recommendations → Edit `data/recommendations.json`
- Manual AQI updates → Edit `data/aqi-data.json` (though usually automated)

**Scripts that write here**:
- `scripts/update-aqi.js` → Writes to `data/aqi-data.json`
- `scripts/generate-initial-recommendations.js` → Writes to `data/recommendations.json`
- GitHub Actions → Updates `data/aqi-data.json`

### 2. `client/public/data/` - Development Server

**Location**: `client/public/data/`

**Purpose**:
- Used by Vite dev server (`npm run dev`)
- Frontend reads from here during development
- **Auto-synced by scripts** (no manual editing needed)

**When files are synced**:
- `update-aqi.js` automatically copies to `client/public/data/` after updating `data/`
- `generate-initial-recommendations.js` automatically copies to `client/public/data/`
- Vite's build plugin also copies from `data/` to `client/public/data/` during build

**Manual sync** (if needed):
```bash
# Copy all JSON files from data/ to client/public/data/
cp data/*.json client/public/data/
```

### 3. `client/dist/data/` - Production Build

**Location**: `client/dist/data/`

**Purpose**:
- Generated during `npm run build`
- Contains final static files for deployment
- **Never edit directly** - it's build output

**How it's created**:
- Vite build process copies `client/public/data/` → `client/dist/data/`
- This happens automatically during `npm run build`
- Deploy `client/dist/` to static hosting (GitHub Pages, Netlify, Vercel)

## Workflow Summary

### Adding New Zones (Community Contribution)

1. **Edit**: `data/zones.json` (add new zone entry)
2. **Copy**: `cp data/zones.json client/public/data/zones.json` (for dev testing)
3. **Commit**: Git commit includes `data/zones.json`
4. **Build**: Vite automatically includes it in `client/dist/data/` during build

### Updating AQI Data (Automated)

1. **GitHub Actions** runs `scripts/update-aqi.js`
2. **Script writes** to `data/aqi-data.json`
3. **Script also copies** to `client/public/data/aqi-data.json`
4. **Git commit** includes both files
5. **Next build** includes updated data in `client/dist/data/`

### Generating Recommendations

1. **Run**: `npm run generate-recs`
2. **Script reads** from `data/zones.json` and `data/aqi-data.json`
3. **Script writes** to `data/recommendations.json`
4. **Script also copies** to `client/public/data/recommendations.json`
5. **Manual commit** needed to save changes

## Best Practices

✅ **DO**:
- Edit files in `data/` directory
- Let scripts handle syncing to `client/public/data/`
- Commit changes to `data/` directory
- Let Vite handle copying to `client/dist/data/` during build

❌ **DON'T**:
- Edit files directly in `client/public/data/` (they get overwritten)
- Edit files in `client/dist/data/` (build output, gets regenerated)
- Manually copy files unless scripts don't do it automatically

## Troubleshooting

### "Data not showing in dev server"

**Solution**: Make sure `client/public/data/` has the latest files:
```bash
cp data/*.json client/public/data/
```

### "Changes not appearing after build"

**Solution**: 
1. Ensure files are in `data/` directory
2. Ensure files are in `client/public/data/` directory
3. Rebuild: `cd client && npm run build`
4. Check `client/dist/data/` has the files

### "Scripts not syncing to client/public/data/"

**Solution**: Check that scripts include the copy step. Both `update-aqi.js` and `generate-initial-recommendations.js` should copy files after writing to `data/`.

## Quick Reference

| Action | Edit Here | Auto-Synced To |
|--------|-----------|----------------|
| Add Zone | `data/zones.json` | `client/public/data/` (manual copy) |
| Add Recommendation | `data/recommendations.json` | `client/public/data/` (by script) |
| Update AQI | `data/aqi-data.json` | `client/public/data/` (by script) |
| Build for Production | N/A | `client/dist/data/` (by Vite) |
