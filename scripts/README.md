# OSRS Farming Data Scripts

This directory contains Node.js scripts for fetching and processing farming data from the OSRS Wiki APIs.

## Setup

1. Install dependencies:
```bash
cd scripts
npm install
```

2. Run the data fetch script:
```bash
npm run fetch-data
```

This will:
- Fetch crop information from OSRS Wiki APIs
- Generate static JSON data files in `src/data/`
- Create type-safe data structures for the application

## Generated Files

The script generates the following files in `src/data/`:

- `crops.json` - Complete crop database with growth times, requirements, etc.
- `dependencies.json` - Crop payment relationships for protection
- `patches.json` - Farming patch locations and accessibility info
- `yield-tables.json` - Yield calculations based on farming level
- `wiki-cache.json` - Cached API responses for performance

## API Sources

Data is fetched from:
- OSRS Wiki Prices API (real-time seed prices)
- OSRS Wiki Mapping API (item IDs and names)  
- OSRS Wiki MediaWiki API (farming mechanics data)

## Usage in Application

After running the fetch script, the data can be imported in your Next.js app:

```typescript
import { getAllotmentCrops, getCropById, getAllPatches } from '../lib/farming-data';

// Get all supported allotment crops
const crops = getAllotmentCrops();

// Get specific crop details
const potato = getCropById('potato');

// Get all farming patches
const patches = getAllPatches();
```

## Data Freshness

The script respects API rate limits and caches responses. Re-run periodically to keep data synchronized with game updates.
