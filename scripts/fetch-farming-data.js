#!/usr/bin/env node
/**
 * OSRS Farming Data Fetcher
 *
 * This script fetches farming data from the OSRS Wiki APIs and generates
 * static data files for use in the farming planner application.
 *
 * Usage: node scripts/fetch-farming-data.js
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  userAgent:
    "OSRS-Farming-Planner/1.0 (https://github.com/user/osrs-farming-planner)",
  dataDir: path.join(__dirname, "../src/data"),
  apiEndpoints: {
    prices: "https://prices.runescape.wiki/api/v1/osrs/latest",
    mapping: "https://prices.runescape.wiki/api/v1/osrs/mapping",
    wiki: "https://oldschool.runescape.wiki/api.php",
  },
};

// Supported crops for Phase 1 (Allotments + Flowers only)
const SUPPORTED_CROPS = {
  allotments: [
    { id: "potato", name: "Potato", seedName: "Potato seed", seedId: 5318 },
    { id: "onion", name: "Onion", seedName: "Onion seed", seedId: 5319 },
    { id: "cabbage", name: "Cabbage", seedName: "Cabbage seed", seedId: 5324 },
    { id: "tomato", name: "Tomato", seedName: "Tomato seed", seedId: 5322 },
    {
      id: "sweetcorn",
      name: "Sweetcorn",
      seedName: "Sweetcorn seed",
      seedId: 5320,
    },
    {
      id: "strawberry",
      name: "Strawberry",
      seedName: "Strawberry seed",
      seedId: 5323,
    },
    {
      id: "watermelon",
      name: "Watermelon",
      seedName: "Watermelon seed",
      seedId: 5321,
    },
    {
      id: "snape_grass",
      name: "Snape grass",
      seedName: "Snape grass seed",
      seedId: 22879,
    },
  ],
  flowers: [
    {
      id: "marigold",
      name: "Marigold",
      seedName: "Marigold seed",
      seedId: 5096,
    },
    {
      id: "rosemary",
      name: "Rosemary",
      seedName: "Rosemary seed",
      seedId: 5097,
    },
    {
      id: "nasturtium",
      name: "Nasturtium",
      seedName: "Nasturtium seed",
      seedId: 5098,
    },
    { id: "woad", name: "Woad", seedName: "Woad seed", seedId: 5099 },
    {
      id: "limpwurt",
      name: "Limpwurt root",
      seedName: "Limpwurt seed",
      seedId: 5100,
    },
    {
      id: "white_lily",
      name: "White lily",
      seedName: "White lily seed",
      seedId: 14589,
    },
  ],
};

// Farming patch locations (Phase 1)
const FARMING_PATCHES = [
  {
    id: "falador_allotment_north",
    name: "Falador Allotment (North)",
    location: "Falador",
    type: "allotment",
    coordinates: [3058, 3311],
    nearbyTeleports: ["Falador teleport"],
    walkingTime: 30,
  },
  {
    id: "falador_allotment_south",
    name: "Falador Allotment (South)",
    location: "Falador",
    type: "allotment",
    coordinates: [3058, 3308],
    nearbyTeleports: ["Falador teleport"],
    walkingTime: 30,
  },
  {
    id: "falador_flower",
    name: "Falador Flower Patch",
    location: "Falador",
    type: "flower",
    coordinates: [3054, 3307],
    nearbyTeleports: ["Falador teleport"],
    walkingTime: 35,
  },
  {
    id: "catherby_allotment_north",
    name: "Catherby Allotment (North)",
    location: "Catherby",
    type: "allotment",
    coordinates: [2805, 3465],
    nearbyTeleports: ["Catherby teleport"],
    walkingTime: 15,
  },
  {
    id: "catherby_allotment_south",
    name: "Catherby Allotment (South)",
    location: "Catherby",
    type: "allotment",
    coordinates: [2805, 3462],
    nearbyTeleports: ["Catherby teleport"],
    walkingTime: 15,
  },
  {
    id: "catherby_flower",
    name: "Catherby Flower Patch",
    location: "Catherby",
    type: "flower",
    coordinates: [2809, 3463],
    nearbyTeleports: ["Catherby teleport"],
    walkingTime: 20,
  },
  {
    id: "ardougne_allotment_north",
    name: "Ardougne Allotment (North)",
    location: "Ardougne",
    type: "allotment",
    coordinates: [2670, 3374],
    nearbyTeleports: ["Ardougne teleport"],
    walkingTime: 45,
  },
  {
    id: "ardougne_allotment_south",
    name: "Ardougne Allotment (South)",
    location: "Ardougne",
    type: "allotment",
    coordinates: [2670, 3371],
    nearbyTeleports: ["Ardougne teleport"],
    walkingTime: 45,
  },
  {
    id: "ardougne_flower",
    name: "Ardougne Flower Patch",
    location: "Ardougne",
    type: "flower",
    coordinates: [2666, 3372],
    nearbyTeleports: ["Ardougne teleport"],
    walkingTime: 50,
  },
  {
    id: "hosidius_allotment_north",
    name: "Hosidius Allotment (North)",
    location: "Hosidius",
    type: "allotment",
    coordinates: [1739, 3550],
    nearbyTeleports: ["Xeric's glade", "Skills necklace"],
    walkingTime: 60,
  },
  {
    id: "hosidius_allotment_south",
    name: "Hosidius Allotment (South)",
    location: "Hosidius",
    type: "allotment",
    coordinates: [1739, 3547],
    nearbyTeleports: ["Xeric's glade", "Skills necklace"],
    walkingTime: 60,
  },
  {
    id: "hosidius_flower",
    name: "Hosidius Flower Patch",
    location: "Hosidius",
    type: "flower",
    coordinates: [1735, 3548],
    nearbyTeleports: ["Xeric's glade", "Skills necklace"],
    walkingTime: 65,
  },
];

/**
 * Fetch data from OSRS Wiki API with proper headers
 */
async function fetchWikiAPI(endpoint, params = {}) {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": CONFIG.userAgent,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch item mappings from OSRS Wiki
 */
async function fetchItemMappings() {
  console.log("📊 Fetching item mappings...");
  const data = await fetchWikiAPI(CONFIG.apiEndpoints.mapping);

  // Create lookup map for our supported crops
  const itemMap = new Map();
  data.forEach((item) => {
    itemMap.set(item.id, item);
  });

  return itemMap;
}

/**
 * Fetch current seed prices
 */
async function fetchSeedPrices() {
  console.log("💰 Fetching seed prices...");
  const data = await fetchWikiAPI(CONFIG.apiEndpoints.prices);
  return data;
}

/**
 * Parse farming info from a wiki page
 */
function parseFarmingInfo(wikitext, cropInfo) {
  // Log a sample of the wikitext for debugging
  if (cropInfo.name === "Potato") {
    console.log(`\n--- DEBUGGING WIKITEXT FOR ${cropInfo.name} ---`);
    console.log("First 500 characters of wikitext:");
    console.log(wikitext.substring(0, 500));
    console.log("--- SEARCHING FOR PATTERNS ---");
  }

  // Extract farming table information using regex patterns
  const farmingPatterns = {
    growthTime: /(\d+)\s*minutes?\s*\((\d+x\d+)\s*minutes?\)/i,
    farmingLevel: /Farming\s+(\d+)/i,
    protection: /protection.*?(\d+)\s*(.*?)(?:sack|bag|basket)/i,
    baseYield: /(\d+)\+\s*\(varies\)/i,
    seedsPerPatch: /(?:Seeds\s+per\s+patch|plant.*?seeds?)\s*(?:\|\s*)?(\d+)/i,
    plantingExp:
      /(?:Plant.*?experience|Planting.*?exp|Plant.*?exp)\s*(?:\|\s*)?([0-9.]+)/i,
    harvestExp:
      /(?:Harvest.*?experience|Harvesting.*?exp|Harvest.*?exp)\s*(?:\|\s*)?([0-9.]+)/i,
    checkHealthExp:
      /(?:Check.*?health.*?experience|Check.*?health.*?exp)\s*(?:\|\s*)?([0-9.]+)/i,
  };

  const result = {
    id: cropInfo.id,
    name: cropInfo.name,
    type: cropInfo.type || "allotment",
    seedId: cropInfo.seedId,
    seedName: cropInfo.seedName,
    wikiUrl: `https://oldschool.runescape.wiki/w/${cropInfo.seedName.replace(/ /g, "_")}`,
    lastUpdated: new Date().toISOString(),
    seedsPerPatch: 3, // Default for allotments
    expPerHarvest: 0, // Will be calculated from planting + harvest exp
  };

  // Parse growth time
  const growthMatch = wikitext.match(farmingPatterns.growthTime);
  if (growthMatch) {
    result.growthTime = parseInt(growthMatch[1], 10);
    if (cropInfo.name === "Potato")
      console.log(`Found growth time: ${result.growthTime}`);
  } else if (cropInfo.name === "Potato") {
    console.log("Growth time pattern not found");
  }

  // Parse farming level requirement
  const levelMatch = wikitext.match(farmingPatterns.farmingLevel);
  if (levelMatch) {
    result.farmingLevel = parseInt(levelMatch[1], 10);
    if (cropInfo.name === "Potato")
      console.log(`Found farming level: ${result.farmingLevel}`);
  } else if (cropInfo.name === "Potato") {
    console.log("Farming level pattern not found");
  }

  // Parse seeds per patch
  const seedsMatch = wikitext.match(farmingPatterns.seedsPerPatch);
  if (seedsMatch) {
    result.seedsPerPatch = parseInt(seedsMatch[1], 10);
    if (cropInfo.name === "Potato")
      console.log(`Found seeds per patch: ${result.seedsPerPatch}`);
  } else if (cropInfo.name === "Potato") {
    console.log("Seeds per patch pattern not found");
  }

  // Parse experience values
  let plantingExp = 0;
  let harvestExp = 0;
  let checkHealthExp = 0;

  const plantingExpMatch = wikitext.match(farmingPatterns.plantingExp);
  if (plantingExpMatch) {
    plantingExp = parseFloat(plantingExpMatch[1]);
    if (cropInfo.name === "Potato")
      console.log(`Found planting exp: ${plantingExp}`);
  } else if (cropInfo.name === "Potato") {
    console.log("Planting exp pattern not found");
  }

  const harvestExpMatch = wikitext.match(farmingPatterns.harvestExp);
  if (harvestExpMatch) {
    harvestExp = parseFloat(harvestExpMatch[1]);
    if (cropInfo.name === "Potato")
      console.log(`Found harvest exp: ${harvestExp}`);
  } else if (cropInfo.name === "Potato") {
    console.log("Harvest exp pattern not found");
  }

  const checkHealthExpMatch = wikitext.match(farmingPatterns.checkHealthExp);
  if (checkHealthExpMatch) {
    checkHealthExp = parseFloat(checkHealthExpMatch[1]);
    if (cropInfo.name === "Potato")
      console.log(`Found check health exp: ${checkHealthExp}`);
  } else if (cropInfo.name === "Potato") {
    console.log("Check health exp pattern not found");
  }

  // Calculate total experience per harvest cycle (planting + check health + harvest)
  result.expPerHarvest = plantingExp + checkHealthExp + harvestExp;

  // Store individual exp components for debugging
  result.expBreakdown = {
    planting: plantingExp,
    checkHealth: checkHealthExp,
    harvest: harvestExp,
  };

  // Parse protection requirements
  const protectionMatch = wikitext.match(farmingPatterns.protection);
  if (protectionMatch) {
    result.protection = {
      type: "crop",
      quantity: parseInt(protectionMatch[1], 10),
      item: protectionMatch[2].trim(),
    };
    if (cropInfo.name === "Potato")
      console.log(
        `Found protection: ${result.protection.quantity} ${result.protection.item}`,
      );
  } else if (cropInfo.name === "Potato") {
    console.log("Protection pattern not found");
  }

  if (cropInfo.name === "Potato") {
    console.log("--- END DEBUG ---\n");
  }

  return result;
}

/**
 * Fetch detailed crop information from wiki pages
 */
async function fetchCropDetails(crops) {
  console.log("🌱 Fetching detailed crop information...");
  const cropData = [];

  for (const crop of crops) {
    try {
      console.log(`  - Fetching ${crop.name}...`);

      const pageData = await fetchWikiAPI(CONFIG.apiEndpoints.wiki, {
        action: "query",
        titles: crop.seedName,
        prop: "wikitext",
        format: "json",
      });

      console.log(
        `    API Response for ${crop.name}:`,
        JSON.stringify(pageData, null, 2),
      );

      const pages = pageData.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const wikitext = pages[pageId]?.wikitext?.["*"] || "";

      console.log(
        `    Page ID: ${pageId}, Wikitext length: ${wikitext.length}`,
      );

      const cropInfo = parseFarmingInfo(wikitext, crop);
      console.log(`    ✅ Parsed data for ${cropInfo.name}:`);
      console.log(
        `       - Farming level: ${cropInfo.farmingLevel || "Unknown"}`,
      );
      console.log(
        `       - Growth time: ${cropInfo.growthTime || "Unknown"} minutes`,
      );
      console.log(`       - Seeds per patch: ${cropInfo.seedsPerPatch}`);
      console.log(`       - Experience per harvest: ${cropInfo.expPerHarvest}`);
      if (cropInfo.expBreakdown) {
        console.log(
          `       - EXP breakdown: Plant(${cropInfo.expBreakdown.planting}), Check(${cropInfo.expBreakdown.checkHealth}), Harvest(${cropInfo.expBreakdown.harvest})`,
        );
      }
      console.log(
        `       - Protection: ${cropInfo.protection ? `${cropInfo.protection.quantity} ${cropInfo.protection.item}` : "None"}`,
      );

      cropData.push(cropInfo);

      // Add delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Failed to fetch ${crop.name}:`, error.message);
      // Add basic fallback data
      cropData.push({
        id: crop.id,
        name: crop.name,
        type: crop.type || "allotment",
        seedId: crop.seedId,
        seedName: crop.seedName,
        error: error.message,
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  return cropData;
}

/**
 * Generate dependency relationships based on crop data
 */
function generateDependencies() {
  console.log("🔗 Generating dependency relationships...");

  const dependencies = {
    // Potato supports onions
    potato: {
      directDependencies: [],
      supports: ["onion"],
      alternativePayments: [],
    },
    // Onions support cabbages and asgarnian hops
    onion: {
      directDependencies: ["potato"],
      supports: ["cabbage"],
      alternativePayments: [],
    },
    // Cabbages support tomatoes
    cabbage: {
      directDependencies: ["onion"],
      supports: ["tomato"],
      alternativePayments: [],
    },
    // Other crops without dependencies yet
    tomato: {
      directDependencies: ["cabbage"],
      supports: [],
      alternativePayments: [],
    },
    sweetcorn: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    strawberry: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    watermelon: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    snape_grass: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    // Flowers provide protection
    marigold: {
      directDependencies: [],
      supports: ["allotment_protection"],
      alternativePayments: [],
    },
    rosemary: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    nasturtium: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    woad: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    limpwurt: {
      directDependencies: [],
      supports: [],
      alternativePayments: [],
    },
    white_lily: {
      directDependencies: [],
      supports: ["allotment_protection"],
      alternativePayments: [],
    },
  };

  return dependencies;
}

/**
 * Generate yield tables based on farming levels
 */
function generateYieldTables() {
  console.log("📈 Generating yield tables...");

  return {
    metadata: {
      description: "Farming yield calculations based on level and compost",
      lastUpdated: new Date().toISOString(),
    },
    calculations: {
      baseFormula: "Base yield + level bonus + compost bonus",
      compostBonuses: {
        none: 0,
        compost: 1,
        supercompost: 2,
        ultracompost: 3,
      },
      levelBonuses: {
        description:
          "Chance to not consume harvest life scales from 41.4% at level 1 to 70.7% at level 99",
      },
    },
    crops: {
      // These will be filled with actual data from wiki parsing
      potato: { baseYield: 3 },
      onion: { baseYield: 3 },
      cabbage: { baseYield: 3 },
      tomato: { baseYield: 3 },
      sweetcorn: { baseYield: 3 },
      strawberry: { baseYield: 3 },
      watermelon: { baseYield: 3 },
      snape_grass: { baseYield: 3 },
    },
  };
}

/**
 * Save data to JSON files
 */
async function saveDataFiles(data) {
  console.log("💾 Saving data files...");

  // Ensure data directory exists
  await fs.mkdir(CONFIG.dataDir, { recursive: true });

  const files = [
    { name: "crops.json", data: data.crops },
    { name: "dependencies.json", data: data.dependencies },
    { name: "patches.json", data: data.patches },
    { name: "yield-tables.json", data: data.yieldTables },
    { name: "wiki-cache.json", data: data.cache },
  ];

  for (const file of files) {
    const filePath = path.join(CONFIG.dataDir, file.name);
    await fs.writeFile(filePath, JSON.stringify(file.data, null, 2));
    console.log(`  ✅ Saved ${file.name}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log("🚀 Starting OSRS Farming Data Fetch...\n");
  console.log("📂 Data directory:", CONFIG.dataDir);

  try {
    // Combine all supported crops
    const allCrops = [
      ...SUPPORTED_CROPS.allotments.map((crop) => ({
        ...crop,
        type: "allotment",
      })),
      ...SUPPORTED_CROPS.flowers.map((crop) => ({ ...crop, type: "flower" })),
    ];

    // Fetch data from APIs
    const [itemMappings, seedPrices] = await Promise.all([
      fetchItemMappings(),
      fetchSeedPrices(),
    ]);

    // Fetch detailed crop information
    const cropDetails = await fetchCropDetails(allCrops);

    // Generate additional data
    const dependencies = generateDependencies();
    const yieldTables = generateYieldTables();

    // Compile all data
    const compiledData = {
      crops: {
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0",
          source: "OSRS Wiki API",
        },
        allotments: cropDetails.filter((crop) => crop.type === "allotment"),
        flowers: cropDetails.filter((crop) => crop.type === "flower"),
      },
      dependencies: {
        metadata: {
          lastUpdated: new Date().toISOString(),
          description: "Crop payment relationships for farming protection",
        },
        relationships: dependencies,
      },
      patches: {
        metadata: {
          lastUpdated: new Date().toISOString(),
          description: "Farming patch locations and accessibility",
        },
        locations: FARMING_PATCHES,
      },
      yieldTables,
      cache: {
        itemMappings: Array.from(itemMappings.entries()).slice(0, 100), // Store sample for reference
        seedPrices: Object.fromEntries(
          Object.entries(seedPrices).filter(([itemId]) =>
            allCrops.some((crop) => crop.seedId.toString() === itemId),
          ),
        ),
        lastFetch: new Date().toISOString(),
      },
    };

    // Save all data files
    await saveDataFiles(compiledData);

    console.log("\n✅ Data fetch completed successfully!");
    console.log(`📁 Data saved to: ${CONFIG.dataDir}`);
    console.log(`🌱 Processed ${cropDetails.length} crops`);
    console.log(`🗺️ Saved ${FARMING_PATCHES.length} patch locations`);
  } catch (error) {
    console.error("❌ Data fetch failed:", error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (
  import.meta.url.startsWith("file:") &&
  process.argv[1] &&
  import.meta.url.includes(process.argv[1].replace(/\\/g, "/"))
) {
  main().catch(console.error);
}

export { main as fetchFarmingData };
