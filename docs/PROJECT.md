# Old School RuneScape Farming Planner

## Project Overview

A specialized web application designed to help Old School RuneScape (OSRS) Ironmen players efficiently plan their farming activities. The application calculates optimal planting sequences and resource dependencies to maximize farming efficiency over extended play sessions.

## Project Vision

Create an intelligent farming assistant that enables Ironmen players to plan self-sufficient farming strategies by automatically calculating crop dependencies, payment requirements, and optimal planting sequences based on real OSRS game data.

## Target Architecture

### Technology Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Mantine UI Components (exclusive styling framework)
- **State Management**: Zustand + TanStack Query for data fetching
- **Database**: Local JSON/TypeScript data store (Phase 1), Potential API integration (Phase 2)
- **Testing**: Vitest + React Testing Library + Playwright
- **Performance**: Core Web Vitals optimization
- **Accessibility**: WCAG 2.1 AA compliance

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage - farming planner interface
│   ├── planner/           # Main planning tool
│   │   └── page.tsx       # Interactive farming planner
│   ├── calculator/        # Crop dependency calculator
│   │   └── page.tsx       # Calculation tools
│   └── layout.tsx         # Root layout with OSRS theming
├── components/            # Shared Mantine components
│   ├── ui/               # Base UI components
│   │   ├── CropCard.tsx   # Individual crop display component
│   │   ├── PatchMap.tsx   # Geographic patch visualization
│   │   └── DependencyTree.tsx # Crop dependency visualization
│   ├── planner/          # Planner-specific components
│   │   ├── CropSelector.tsx    # Crop selection interface
│   │   ├── ResourceCalculator.tsx # Payment calculation
│   │   └── PlanningTimeline.tsx   # Time-based planning view
│   └── layout/           # Layout components
├── lib/                  # Core business logic
│   ├── farming-data-simple.ts # Direct JSON data access (consolidated)
│   ├── calculators/      # Business logic
│   │   ├── dependency-calculator.ts # Crop dependency logic
│   │   ├── yield-calculator.ts     # Crop yield calculations
│   │   └── optimization-engine.ts  # Planting optimization
│   └── utils/            # Shared utilities
├── hooks/                # Custom React hooks
│   ├── useFarmingData.ts # Data fetching hooks
│   ├── usePlanner.ts     # Planner state management
│   └── useCalculations.ts # Calculation hooks
├── types/                # TypeScript type definitions
│   ├── crops.ts          # Crop and farming types
│   ├── patches.ts        # Patch and location types
│   └── planner.ts        # Planner-specific types
└── styles/               # Global styles and OSRS theme
```

## Core Features & Functionality

### 1. Crop Data Model

**Comprehensive crop information system based on OSRS Wiki data**

#### Core Crop Properties

```typescript
interface Crop {
  id: string;
  name: string;
  type: 'allotment' | 'flower' | 'tree' | 'herb';

  // Growth properties
  growthTime: number; // minutes
  farmingLevel: number;

  // Payment requirements
  protection?: {
    type: 'crop' | 'item';
    itemId: string;
    quantity: number;
  };

  // Yield information
  baseYield: number;
  yieldRange: [number, number];

  // Dependencies
  seeds: {
    itemId: string;
    quantity: number;
  };

  // Experience
  plantingXP: number;
  harvestXP: number;

  // Wiki integration
  wikiUrl: string;
  lastUpdated: Date;
}
```

#### Patch System

```typescript
interface FarmingPatch {
  id: string;
  name: string;
  location: string;
  type: 'allotment' | 'flower';
  coordinates: [number, number];

  // Accessibility
  requirements?: {
    quest?: string;
    skill?: { name: string; level: number };
  };

  // Geographic data for optimization
  region: string;
  nearbyTeleports: string[];
  walkingTime: number; // seconds from nearest teleport
}
```

### 2. Dependency Calculation Engine

**Advanced calculation system for crop payment chains**

#### Dependency Calculator

- **Payment Chain Analysis**: Calculate how many supporting crops needed for target crops
- **Multi-level Dependencies**: Handle crops that require crops that require other crops
- **Yield Variance**: Account for farming level-based yield improvements
- **Efficiency Optimization**: Find most efficient payment paths

#### Example Calculation Flow

```typescript
// User wants: 4 Tomato patches
// System calculates:
// - Tomatoes require 2 Cabbages each = 8 Cabbages needed
// - Cabbages require 1 Onion each = 8 Onions needed
// - Onions require 10 Potatoes each = 80 Potatoes needed
// - Result: Plant 80 Potatoes → 8 Onions → 8 Cabbages → 4 Tomatoes
```

### 3. Interactive Planning Interface

**User-friendly Mantine-based interface for farming strategy creation**

#### Planner Dashboard

- **Target Crop Selection**: Choose desired crops and quantities
- **Dependency Visualization**: Interactive tree showing all required supporting crops
- **Resource Summary**: Total seeds, payments, and time requirements
- **Planting Timeline**: Optimal order and timing for all crops

#### Geographic Optimization (Future Phase)

- **Patch Map**: Visual representation of all available farming patches
- **Route Optimization**: Efficient travel paths between patches
- **Time Management**: Coordinate planting times across multiple patches

### 4. OSRS Wiki Integration & Data Strategy

**Automated data fetching to maintain accuracy with game updates**

#### Available Data Sources

**Primary Source: OSRS Wiki APIs**
- **Real-time Prices API**: `https://prices.runescape.wiki/api/v1/osrs/latest` - Current seed prices
- **Item Mapping API**: `https://prices.runescape.wiki/api/v1/osrs/mapping` - Item IDs, names, examine text
- **MediaWiki API**: `https://oldschool.runescape.wiki/api.php` - Structured page content and farming data

**Benefits of Wiki APIs:**
- ✅ **Official community-maintained** data with real-time updates
- ✅ **Comprehensive coverage** of all farming crops and mechanics
- ✅ **No rate limits** for reasonable use with proper attribution
- ✅ **Free to use** under CC BY-NC-SA 3.0 license

#### Data Strategy Implementation

**Phase 1: Static Data Foundation (Weeks 1-2)**
```typescript
// Initial crop data structure for proof of concept
const FARMING_DATA = {
  crops: {
    potato: {
      id: "potato",
      name: "Potato",
      seedId: 5318, // OSRS item ID
      growthTime: 20, // minutes
      farmingLevel: 1,
      protection: null,
      supports: ["onion"] // What this crop can pay for
    },
    onion: {
      id: "onion",
      name: "Onion",
      seedId: 5319,
      growthTime: 40,
      farmingLevel: 5,
      protection: {
        type: "crop",
        itemId: "potato",
        quantity: 10 // 1 sack = 10 potatoes
      },
      supports: ["cabbage"]
    }
    // Continue for all allotment + flower crops
  }
};
```

**Phase 2: API Integration (Weeks 7-8)**
```typescript
class OSRSWikiService {
  // Fetch current seed prices
  async getSeedPrices(): Promise<PriceMap> {
    const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest');
    return response.json();
  }

  // Fetch item mappings
  async getItemMappings(): Promise<ItemMapping[]> {
    const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping');
    return response.json();
  }

  // Validate static data against wiki
  async validateCropData(cropName: string): Promise<CropValidation> {
    const wikiData = await this.fetchWikiPage(`${cropName}_seed`);
    return this.parseFarmingInfo(wikiData);
  }
}
```

**Phase 3: Automated Data Sync (Future)**
```typescript
// Daily data synchronization script
async function syncFarmingData() {
  const wikiService = new OSRSWikiService();

  const [prices, mappings, wikiData] = await Promise.all([
    wikiService.getSeedPrices(),
    wikiService.getItemMappings(),
    wikiService.fetchAllFarmingPages()
  ]);

  const updatedData = mergeFarmingData(prices, mappings, wikiData);
  await writeDataFiles(updatedData);

  console.log('✅ Farming data updated successfully');
}
```

#### API Integration Points

```typescript
interface WikiAPIService {
  // Real-time data fetching
  getSeedPrices(): Promise<{ [itemId: string]: { high: number; low: number } }>;
  getItemMappings(): Promise<ItemMapping[]>;

  // Farming-specific data
  getCropData(cropName: string): Promise<Crop>;
  getPatchLocations(): Promise<FarmingPatch[]>;
  getYieldCalculations(farmingLevel: number): Promise<YieldData>;

  // Data validation and freshness
  validateDataFreshness(): Promise<boolean>;
  syncCropDatabase(): Promise<CropDatabase>;
}
```

## Data Model Design

### Data Storage Strategy

#### Local Data Structure (Phase 1)
```
src/data/
├── crops.json          # Core crop definitions with dependencies
├── dependencies.json   # Payment relationship mappings
├── patches.json        # Farming patch locations and requirements
├── yield-tables.json   # Level-based yield calculations
└── wiki-cache.json     # Cached API responses with timestamps
```

#### API Integration (Phase 2+)
```
src/lib/data/
├── wiki-api.ts         # OSRS Wiki API client with rate limiting
├── data-sync.ts        # Data synchronization and caching
├── validation.ts       # Data integrity and freshness checks
└── fallback.ts         # Offline functionality with static data
```

### Core Entities

#### 1. Crops Database

```typescript
interface CropDatabase {
  // Allotment crops (Phase 1 focus)
  allotments: {
    potato: Crop;
    onion: Crop;
    cabbage: Crop;
    tomato: Crop;
    sweetcorn: Crop;
    strawberry: Crop;
    watermelon: Crop;
    snape_grass: Crop;
  };

  // Flower crops (Phase 1 focus)
  flowers: {
    marigold: Crop;
    rosemary: Crop;
    nasturtium: Crop;
    woad: Crop;
    limpwurt: Crop;
    white_lily: Crop;
  };
}
```

#### 2. Dependency Relationships

```typescript
interface DependencyMap {
  [cropId: string]: {
    directDependencies: string[]; // Crops this crop requires for payment
    supports: string[]; // Crops this crop can be used to pay for
    alternativePayments?: string[]; // Alternative payment options
  };
}
```

#### 3. Farming Patches

```typescript
interface PatchSystem {
  allotmentPatches: FarmingPatch[];
  flowerPatches: FarmingPatch[];

  // Patch relationships (flowers protect allotments)
  protectionMappings: {
    [allotmentPatchId: string]: string; // corresponding flower patch
  };
}
```

### Calculation Algorithms

#### 1. Dependency Resolution

```typescript
interface DependencyCalculator {
  calculateRequirements(
    targetCrop: string,
    quantity: number,
    farmingLevel: number
  ): {
    totalCrops: { [cropId: string]: number };
    plantingOrder: string[];
    totalTime: number;
    totalSeeds: { [seedId: string]: number };
  };
}
```

#### 2. Yield Optimization

```typescript
interface YieldCalculator {
  calculateExpectedYield(
    crop: string,
    farmingLevel: number,
    useCompost: boolean,
    useSupercompost: boolean
  ): {
    minimum: number;
    maximum: number;
    average: number;
    confidence: number; // statistical confidence in yield
  };
}
```

## Implementation Phases

### Phase 1: Foundation & Core Functionality (Weeks 1-3)

#### Week 1: Project Setup & Data Model
- **Project initialization** with Next.js 15 and Mantine setup
- **Core data structures** for crops and patches
- **Initial crop database** with allotment and flower data
- **Basic TypeScript types** and interfaces

#### Week 2: Dependency Calculator
- **Dependency calculation engine** implementation
- **Basic crop requirement algorithms**
- **Simple yield calculations** based on farming level
- **Unit tests** for calculation logic

#### Week 3: UI Foundation
- **Mantine theme** with OSRS-inspired design
- **Basic planner interface** with crop selection
- **Dependency visualization** component
- **Resource summary** display

### Phase 2: Advanced Planning Features (Weeks 4-6)

#### Week 4: Enhanced Calculations
- **Multi-level dependency** resolution
- **Alternative payment path** analysis
- **Time-based optimization** algorithms
- **Yield variance** modeling

#### Week 5: Interactive Interface
- **Advanced crop selector** with filtering and search
- **Interactive dependency tree** with expand/collapse
- **Planting timeline** visualization
- **Resource requirement** breakdown

#### Week 6: User Experience
- **Responsive design** optimization
- **Loading states** and error handling
- **Data persistence** (local storage)
- **Performance optimization**

### Phase 3: OSRS Wiki Integration (Weeks 7-8)

#### Week 7: API Integration
- **OSRS Wiki API** research and implementation
- **Data synchronization** system
- **Fallback mechanisms** for offline use
- **Data validation** and integrity checks

#### Week 8: Real-time Data
- **Automatic data updates** from wiki
- **Data freshness monitoring**
- **Error handling** for API failures
- **Performance caching** strategies

### Phase 4: Geographic Optimization (Future)

#### Advanced Features (Future Phases)
- **Patch map** visualization
- **Geographic optimization** algorithms
- **Multi-patch planning** coordination
- **Route optimization** for efficient farming runs

## Data Strategy Benefits

### Development Advantages

- **🚀 Fast Development**: Start with static data, add APIs incrementally
- **🔄 Always Current**: Wiki APIs automatically sync with game updates
- **🛡️ Resilient**: Fallback to static data if APIs are unavailable
- **📊 Rich Data**: Access to prices, descriptions, and community insights
- **⚡ Performance**: Cache API responses, serve static data efficiently

### Technical Implementation

#### Phase 1: Static Data Foundation
```bash
src/data/
├── crops.json          # Core crop definitions
├── dependencies.json   # Payment relationships
├── patches.json        # Farming patch locations
└── yield-tables.json   # Level-based yield data
```

#### Phase 2: API Integration
```bash
src/lib/
├── wiki-api.ts         # OSRS Wiki API client
├── data-sync.ts        # Data synchronization
└── validation.ts       # Data integrity checks
```

#### Phase 3: Automated Updates
```bash
scripts/
├── sync-data.ts        # Daily data sync script
├── validate-data.ts    # Data validation runner
└── deploy-data.ts      # Update deployment
```

#### Week 8: Real-time Data
- **Automatic data updates** from wiki
- **Data freshness monitoring**
- **Error handling** for API failures
- **Performance caching** strategies

### Phase 4: Geographic Optimization (Future)

#### Advanced Features (Future Phases)
- **Patch map** visualization
- **Geographic optimization** algorithms
- **Multi-patch planning** coordination
- **Route optimization** for efficient farming runs

## Technical Requirements

### Performance Standards

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Green scores for LCP (<2.5s), FID (<100ms), CLS (<0.1)
- **Calculation Speed**: Sub-100ms for dependency calculations
- **Data Loading**: Cached responses for repeated calculations

### Accessibility Requirements

- **WCAG 2.1 AA**: Full compliance across all interfaces
- **Keyboard Navigation**: Complete functionality without mouse
- **Screen Reader Support**: Proper ARIA labels for all farming data
- **Color Accessibility**: High contrast for all data visualizations

### Development Standards

- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: 85%+ test coverage for calculation logic
- **Documentation**: Comprehensive API documentation
- **Version Control**: Conventional commit messages

## Success Metrics

### User Experience Objectives

- **Planning Efficiency**: Reduce farming planning time by 80%
- **Resource Optimization**: Maximize crop yield through dependency optimization
- **Self-Sufficiency**: Enable completely autonomous Ironman farming strategies
- **Accuracy**: 95%+ accuracy in resource calculations

### Technical Objectives

- **Performance**: Sub-2 second page loads
- **Reliability**: 99.9% calculation accuracy
- **Accessibility**: 100% keyboard navigation support
- **Maintainability**: Clean, well-documented codebase

## Content Strategy

### OSRS Community Focus

- **Ironman-Specific**: Designed specifically for self-sufficient gameplay
- **Game Accuracy**: Maintain 1:1 accuracy with current OSRS mechanics through Wiki APIs
- **Community Integration**: Support for sharing farming plans and strategies
- **Educational**: Help players understand farming mechanics and dependency optimization

### Data Accuracy & Reliability

- **Wiki Integration**: Automatic updates from official OSRS Wiki APIs
- **Community Validation**: Leverage community-maintained data accuracy
- **Version Control**: Track changes in game mechanics over time
- **Transparency**: Clear indication of data sources and last update times
- **Fallback Systems**: Offline functionality with cached data when APIs unavailable

### API Usage Guidelines

**OSRS Wiki API Compliance:**
- Set descriptive User-Agent: "OSRS-Farming-Planner - [contact]"
- Respect rate limiting and caching recommendations
- Join Discord #api-discussion channel for updates
- Follow CC BY-NC-SA 3.0 license requirements
- Cache responses appropriately to minimize API load

This project creates a specialized tool that fills a unique need in the OSRS community, providing Ironmen players with the strategic planning capabilities needed for efficient, self-sufficient farming operations.
