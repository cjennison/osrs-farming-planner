// OSRS Farming Dependency Calculator
// Based on official OSRS Wiki protection payment requirements

import { getAllCrops, getCropById } from "../farming-data-simple";
import {
  getPurchasableItemByName,
  isPurchasableItem,
} from "../purchasable-items";

export interface CropPayment {
  crop: string;
  quantity: number;
  note?: string;
}

export interface CropData {
  id: string;
  name: string;
  type: "allotment" | "flower" | "hops" | "herb";
  farmingLevel: number;
  protection?: CropPayment;
  baseYield: number;
  seedsPerPatch: number;
  expPerHarvest: number;
  growthTime: number; // in minutes
  isFixedYield?: boolean; // If true, use baseYield instead of algorithm
}

export interface CalculationResult {
  targetCrop: string;
  targetQuantity: number;
  requirements: {
    [cropId: string]: {
      patches: number;
      reason: string;
      paymentInfo?: {
        containerDescription: string;
        containerQuantity: number;
        totalCropsNeeded: number;
      };
      totalYield: {
        min: number;
        max: number;
        average: number;
      };
      perPatchYield: {
        min: number;
        max: number;
        average: number;
      };
    };
  };
  breakdown: {
    level: number;
    crop: string;
    patchesNeeded: {
      min: number;
      average: number;
      max: number;
    };
    totalYield: {
      min: number;
      average: number;
      max: number;
    };
    purpose: string;
    purchaseQuantity?: number; // For purchasable items like compost
  }[];
  summary: {
    totalPatches: number;
    totalSeeds: number;
    estimatedTime: number; // in minutes
  };
}

export interface StartingResources {
  [cropId: string]: number;
}

export type YieldStrategy = "min" | "average" | "max";

export type KandarinDiaryLevel = "none" | "medium" | "hard" | "elite";

export type KourendDiaryLevel = "none" | "medium" | "hard" | "elite";

export type CalculationMode = "quantity" | "level";

export interface LevelTargetCalculationResult extends CalculationResult {
  calculationMode: "level";
  targetLevel: number;
  startingLevel: number;
  totalXpGained: number;
  xpBreakdown: {
    [cropId: string]: {
      plantingXp: number;
      harvestXp: number;
      totalXp: number;
      patches: number;
    };
  };
}

/**
 * OSRS Farming XP table - XP required for each level
 * Source: https://oldschool.runescape.wiki/w/Experience_table
 */
const FARMING_XP_TABLE = [
  0, 0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107,
  2411, 2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730,
  10824, 12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408,
  33648, 37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721,
  101333, 111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466,
  247886, 273742, 302288, 333804, 368599, 407015, 449428, 496254, 547953,
  605032, 668051, 737627, 814445, 899257, 992895, 1096278, 1210421, 1336443,
  1475581, 1629200, 1798808, 1986068, 2192818, 2421087, 2673114, 2951373,
  3258594, 3597792, 3972294, 4385776, 4842295, 5346332, 5902831, 6517253,
  7195629, 7944614, 8771558, 9684577, 10692629, 11805606, 13034431,
];

/**
 * Calculate total XP required to reach a level from level 1
 */
export function getXpForLevel(level: number): number {
  if (level < 1 || level > 99) return 0;
  return FARMING_XP_TABLE[level];
}

/**
 * Calculate XP needed to go from current level to target level
 */
export function getXpNeeded(currentLevel: number, targetLevel: number): number {
  return getXpForLevel(targetLevel) - getXpForLevel(currentLevel);
}

/**
 * Calculate current level from total XP
 */
export function getLevelFromXp(totalXp: number): number {
  for (let level = 99; level >= 1; level--) {
    if (totalXp >= FARMING_XP_TABLE[level]) {
      return level;
    }
  }
  return 1;
}

/**
 * Convert JSON crop data to CropData format for calculations
 */

// biome-ignore lint/suspicious/noExplicitAny: this is coming from a json
function convertToCropData(crop: any): CropData {
  return {
    id: crop.id,
    name: crop.name,
    type: crop.type as "allotment" | "flower" | "hops" | "herb",
    farmingLevel: crop.farmingLevel || 1,
    baseYield: crop.baseYield || 3,
    seedsPerPatch: crop.seedsPerPatch || 3,
    expPerHarvest: crop.expPerHarvest || 0,
    growthTime: crop.growthTime || 80, // Default to 80 minutes if not specified
    isFixedYield: crop.isFixedYield || false,
    protection: crop.protection
      ? {
          crop: crop.protection.item, // Use the original item name, not mapped to crop ID
          quantity: crop.protection.quantity, // Now represents actual items needed
          note:
            crop.protection.type === "item" ? "Item payment" : "Crop payment",
        }
      : undefined,
  };
}

/**
 * Get crop data by ID from the loaded farming data
 * Also handles item-to-crop mappings for harvested products
 */
function getCropData(cropId: string): CropData | undefined {
  // First try direct crop lookup
  let crop = getCropById(cropId);

  // If not found, check if it's a purchasable item that maps to a crop container
  if (!crop) {
    const purchasableItem = getPurchasableItemByName(cropId);
    if (purchasableItem?.containerInfo?.isContainer) {
      // For container items, try to find the crop by the item ID
      crop = getCropById(purchasableItem.id);
    }
  }

  return crop ? convertToCropData(crop) : undefined;
}

/**
 * Get all available crop data
 */
function getAllCropData(): { [key: string]: CropData } {
  const allCrops = getAllCrops();
  const cropData: { [key: string]: CropData } = {};

  for (const crop of allCrops) {
    cropData[crop.id] = convertToCropData(crop);
  }

  return cropData;
}

/**
 * Calculate yield range based on farming level and compost type using OSRS harvest lives system
 * Based on: https://oldschool.runescape.wiki/w/Farming#Variable_crop_yield
 */
export function calculateYield(
  crop: string,
  farmingLevel: number,
  compostType: "none" | "compost" | "supercompost" | "ultracompost" = "none",
  magicSecateurs: boolean = false,
  farmingCape: boolean = false,
  attasSeed: boolean = false,
  kandarinDiary: KandarinDiaryLevel = "none",
  kourendDiary: KourendDiaryLevel = "none",
): { min: number; max: number; average: number } {
  const cropData = getCropData(crop);
  if (!cropData) throw new Error(`Unknown crop: ${crop}`);

  // Check if this crop has fixed yield (like most flowers)
  if (cropData.isFixedYield) {
    const fixedYield = cropData.baseYield;
    return {
      min: fixedYield,
      max: fixedYield,
      average: fixedYield,
    };
  }

  // Harvest lives system: 3 base lives
  const baseLives = 3;

  // Compost bonus lives
  const compostLives = {
    none: 0,
    compost: 1,
    supercompost: 2,
    ultracompost: 3,
  }[compostType];

  const totalLives = baseLives + compostLives;

  // Chance to save harvest life constants (CTS values from OSRS Wiki Talk page)
  // These are official values from Mod Easty via Twitter DMs
  const cropConstants: Record<string, { low: number; high: number }> = {
    // Allotments
    potato: { low: 101, high: 180 }, // Level 1 crop
    onion: { low: 105, high: 180 }, // Level 5 crop
    cabbage: { low: 107, high: 180 }, // Level 7 crop
    tomato: { low: 112, high: 180 }, // Level 12 crop
    sweetcorn: { low: 88, high: 180 }, // Level 20 crop
    strawberry: { low: 103, high: 180 }, // Level 31 crop
    watermelon: { low: 126, high: 180 }, // Level 47 crop
    snape_grass: { low: 148, high: 195 }, // Level 61 crop

    // Hops - Using similar CTS values as allotments (estimated based on average yields)
    barley: { low: 105, high: 180 }, // Level 3 crop
    hammerstone: { low: 104, high: 180 }, // Level 4 crop
    asgarnian: { low: 110, high: 180 }, // Level 8 crop
    jute: { low: 115, high: 180 }, // Level 13 crop
    yanillian: { low: 118, high: 180 }, // Level 16 crop
    krandorian: { low: 125, high: 180 }, // Level 21 crop
    wildblood: { low: 135, high: 180 }, // Level 28 crop

    // Herbs - Base yield of 3, similar CTS values to allotments
    guam: { low: 109, high: 180 }, // Level 9 crop
    marrentill: { low: 114, high: 180 }, // Level 14 crop
    tarromin: { low: 119, high: 180 }, // Level 19 crop
    harralander: { low: 126, high: 180 }, // Level 26 crop
    gout_tuber: { low: 129, high: 180 }, // Level 29 crop (goutweed)
    ranarr: { low: 132, high: 180 }, // Level 32 crop
    toadflax: { low: 138, high: 180 }, // Level 38 crop
    irit: { low: 144, high: 180 }, // Level 44 crop
    avantoe: { low: 150, high: 180 }, // Level 50 crop
    kwuarm: { low: 156, high: 180 }, // Level 56 crop
    snapdragon: { low: 162, high: 180 }, // Level 62 crop
    huasca: { low: 165, high: 180 }, // Level 65 crop
    cadantine: { low: 167, high: 180 }, // Level 67 crop
    lantadyme: { low: 173, high: 180 }, // Level 73 crop
    dwarf_weed: { low: 179, high: 180 }, // Level 79 crop
    torstol: { low: 185, high: 190 }, // Level 85 crop
  };

  const constants = cropConstants[crop] || { low: 100, high: 180 };

  // Apply Magic Secateurs bonus (10% increase to CTS constants)
  // According to OSRS Wiki: https://oldschool.runescape.wiki/w/Farming#Variable_crop_yield
  // Magic secateurs affect herbs, allotments, grape vines, and hops
  let adjustedConstants = constants;
  if (
    magicSecateurs &&
    (cropData.type === "herb" ||
      cropData.type === "allotment" ||
      cropData.type === "hops")
  ) {
    adjustedConstants = {
      low: Math.floor(constants.low * 1.1),
      high: Math.floor(constants.high * 1.1),
    };
  }

  // Apply Farming Cape bonus (5% increase to yield, herbs only)
  // According to OSRS Wiki: "The farming cape increases the yield of herb patches by 5%"
  // This affects the CTS constants only for herbs
  if (farmingCape && cropData.type === "herb") {
    adjustedConstants = {
      low: Math.floor(adjustedConstants.low * 1.05),
      high: Math.floor(adjustedConstants.high * 1.05),
    };
  }

  // Apply Attas Seed bonus (5% increase to yield, all crop types)
  // According to OSRS Wiki: "the attas plant will increase the yield of
  // player's farming patches worldwide, by increasing the chance to save a life by 5%"
  // This affects all crop types when an active Attas plant is growing
  if (attasSeed) {
    adjustedConstants = {
      low: Math.floor(adjustedConstants.low * 1.05),
      high: Math.floor(adjustedConstants.high * 1.05),
    };
  }

  // Apply Kandarin diary bonus (herbs only, Catherby patch only)
  // According to OSRS Wiki: "Kandarin diary increases the herb yield of the Catherby herb patch"
  // Medium: 5% increase, Hard: 10% increase, Elite: 15% increase
  // This affects the CTS constants only for herbs and only applies to Catherby patch
  if (kandarinDiary !== "none" && cropData.type === "herb") {
    const kandarinMultiplier = {
      none: 1.0,
      medium: 1.05, // 5% increase
      hard: 1.1, // 10% increase
      elite: 1.15, // 15% increase
    }[kandarinDiary];

    adjustedConstants = {
      low: Math.floor(adjustedConstants.low * kandarinMultiplier),
      high: Math.floor(adjustedConstants.high * kandarinMultiplier),
    };
  }

  // Apply Kourend diary bonus (herbs only, Hosidius patch only)
  // According to OSRS Wiki: "Kourend diary increases the herb yield of the Hosidius herb patch"
  // Medium: 5% increase, Hard: 10% increase, Elite: 15% increase
  // This affects the CTS constants only for herbs and only applies to Hosidius patch
  if (kourendDiary !== "none" && cropData.type === "herb") {
    const kourendMultiplier = {
      none: 1.0,
      medium: 1.05, // 5% increase
      hard: 1.1, // 10% increase
      elite: 1.15, // 15% increase
    }[kourendDiary];

    adjustedConstants = {
      low: Math.floor(adjustedConstants.low * kourendMultiplier),
      high: Math.floor(adjustedConstants.high * kourendMultiplier),
    };
  }

  // Calculate chance to save using OSRS formula
  // Chance = (1 + floor(CTSlow * (99-F)/98 + CTShigh * (F-1)/98 + 0.5)) / 256
  const farmingLevelClamped = Math.max(1, Math.min(99, farmingLevel));
  const chanceNumerator =
    1 +
    Math.floor(
      (adjustedConstants.low * (99 - farmingLevelClamped)) / 98 +
        (adjustedConstants.high * (farmingLevelClamped - 1)) / 98 +
        0.5,
    );

  const chanceToSave = chanceNumerator / 256;

  // Expected yield formula: Lives / (1 - chanceToSave)
  const expectedYield = totalLives / (1 - chanceToSave);

  // Minimum yield is the total number of harvest lives (base + compost bonus)
  const min = totalLives;

  // Maximum yield calculation:
  // Based on empirical observations (potatoes 8-12 at level 30 with compost)
  // Practical maximum is typically 1.5-1.6x the expected yield
  const practicalMax = Math.max(
    Math.ceil(expectedYield * 1.6), // 1.6x expected as realistic maximum
    totalLives + 3, // Ensure minimum reasonable range (reduced from +6)
  );

  return {
    min,
    max: practicalMax,
    average: Math.round(expectedYield * 10) / 10, // Round to 1 decimal place
  };
}

/**
 * Calculate farming dependencies with starting resources consideration
 */
export function calculateDependencies(
  targetCrop: string,
  targetQuantity: number,
  farmingLevel: number = 99,
  compostType:
    | "none"
    | "compost"
    | "supercompost"
    | "ultracompost" = "supercompost",
  startingResources: StartingResources = {},
  yieldStrategy: YieldStrategy = "average",
  magicSecateurs: boolean = false,
  farmingCape: boolean = false,
  attasSeed: boolean = false,
  kandarinDiary: KandarinDiaryLevel = "none",
  kourendDiary: KourendDiaryLevel = "none",
): CalculationResult {
  const cropData = getCropData(targetCrop);
  if (!cropData) {
    throw new Error(`Unknown target crop: ${targetCrop}`);
  }

  const requirements: CalculationResult["requirements"] = {};
  const breakdown: CalculationResult["breakdown"] = [];

  // Build dependency chain
  function calculateRequirement(
    crop: string,
    neededQuantity: number,
    level: number,
    purpose: string,
  ): number {
    const data = getCropData(crop);
    if (!data) throw new Error(`Unknown crop: ${crop}`);

    // Check if we have starting resources
    const available = startingResources[crop] || 0;
    const stillNeeded = Math.max(0, neededQuantity - available);

    if (stillNeeded === 0) {
      // We have enough starting resources
      if (available > 0) {
        breakdown.push({
          level,
          crop: data.name,
          patchesNeeded: {
            min: 0,
            average: 0,
            max: 0,
          },
          totalYield: {
            min: available,
            average: available,
            max: available,
          },
          purpose: `${purpose} (using ${Math.min(available, neededQuantity)} from starting resources)`,
        });
      }
      return 0;
    }

    // Calculate yield for this crop
    const cropYield = calculateYield(
      crop,
      farmingLevel,
      compostType,
      magicSecateurs,
      farmingCape,
      attasSeed,
      kandarinDiary,
      kourendDiary,
    );

    // Calculate patches needed based on yield strategy
    const patchesNeededMin = Math.ceil(stillNeeded / cropYield.min);
    const patchesNeededAverage = Math.ceil(stillNeeded / cropYield.average);
    const patchesNeededMax = Math.ceil(stillNeeded / cropYield.max);

    // Use the selected strategy for actual planning
    const patchesNeeded =
      yieldStrategy === "min"
        ? patchesNeededMin
        : yieldStrategy === "max"
          ? patchesNeededMax
          : patchesNeededAverage;

    // Store requirement
    requirements[crop] = {
      patches: patchesNeeded,
      reason: purpose,
      totalYield: {
        min: patchesNeeded * cropYield.min,
        max: patchesNeeded * cropYield.max,
        average: patchesNeeded * cropYield.average,
      },
      perPatchYield: {
        min: cropYield.min,
        max: cropYield.max,
        average: cropYield.average,
      },
    };

    breakdown.push({
      level,
      crop: data.name,
      patchesNeeded: {
        min: patchesNeededMin,
        average: patchesNeededAverage,
        max: patchesNeededMax,
      },
      totalYield: {
        min: patchesNeededMin * cropYield.min,
        average: patchesNeededAverage * cropYield.average,
        max: patchesNeededMax * cropYield.max,
      },
      purpose:
        available > 0
          ? `${purpose} (${stillNeeded} needed, ${available} from starting resources)`
          : purpose,
    });

    // Recursively calculate dependencies
    if (data.protection) {
      const paymentNeeded = patchesNeeded * data.protection.quantity;

      // Check if the protection item is a purchasable item (not a crop)
      if (!isPurchasableItem(data.protection.crop)) {
        // Only recurse if it's actually a crop, not a purchasable item
        calculateRequirement(
          data.protection.crop,
          paymentNeeded,
          level + 1,
          `Payment for ${data.name} (${data.protection.quantity} per patch)`,
        );
      } else {
        // For purchasable items, just add a note about the payment needed
        breakdown.push({
          level: level + 1,
          crop: `${data.protection.crop} (purchasable)`,
          patchesNeeded: {
            min: 0,
            average: 0,
            max: 0,
          },
          totalYield: {
            min: 0,
            average: 0,
            max: 0,
          },
          purpose: `Purchase ${paymentNeeded} ${data.protection.crop} for ${data.name} protection`,
          purchaseQuantity: paymentNeeded,
        });
      }

      // Add payment information to the payment crop's requirement (only for actual crops)
      if (
        !isPurchasableItem(data.protection.crop) &&
        requirements[data.protection.crop]
      ) {
        const originalCrop = getCropById(crop);
        if (originalCrop?.protection?.itemDescription) {
          const totalItemsNeeded = patchesNeeded * data.protection.quantity;

          if (
            originalCrop.protection.isContainer &&
            originalCrop.protection.containerSize
          ) {
            // Calculate containers needed
            const containersNeeded = Math.ceil(
              totalItemsNeeded / originalCrop.protection.containerSize,
            );
            requirements[data.protection.crop].paymentInfo = {
              containerDescription: originalCrop.protection.itemDescription,
              containerQuantity: containersNeeded,
              totalCropsNeeded: totalItemsNeeded,
            };
          } else {
            // Individual items (no containers)
            requirements[data.protection.crop].paymentInfo = {
              containerDescription: originalCrop.protection.itemDescription,
              containerQuantity: totalItemsNeeded,
              totalCropsNeeded: totalItemsNeeded,
            };
          }
        }
      }
    }

    return patchesNeeded;
  }

  // Start calculation
  calculateRequirement(
    targetCrop,
    targetQuantity,
    0,
    `Target harvest: ${targetQuantity} ${cropData.name}${targetQuantity === 1 ? "" : "s"}`,
  );

  // Calculate summary
  const allPatches = Object.values(requirements).reduce(
    (sum, req) => sum + req.patches,
    0,
  );

  // Calculate estimated time - sum of all crop growing times (no concurrency)
  // Each patch takes the full growth time, so total time = sum of (patches * growth_time) for each crop
  let estimatedTime = 0;

  for (const [cropId, requirement] of Object.entries(requirements)) {
    const cropData = getCropData(cropId);
    if (cropData) {
      estimatedTime += cropData.growthTime * requirement.patches;
    }
  }

  return {
    targetCrop,
    targetQuantity,
    requirements,
    breakdown: breakdown.reverse(), // Show from foundation up
    summary: {
      totalPatches: allPatches,
      totalSeeds: allPatches, // 1 seed per patch
      estimatedTime,
    },
  };
}

/**
 * Calculate farming dependencies to reach a target level using a specific crop
 * This solves the dependency system mathematically to avoid exponential explosion
 */
export function calculateLevelDependencies(
  targetCrop: string,
  targetLevel: number,
  startingLevel: number = 1,
  compostType:
    | "none"
    | "compost"
    | "supercompost"
    | "ultracompost" = "supercompost",
  startingResources: StartingResources = {},
  yieldStrategy: YieldStrategy = "average",
  magicSecateurs: boolean = false,
  farmingCape: boolean = false,
  attasSeed: boolean = false,
  kandarinDiary: KandarinDiaryLevel = "none",
  kourendDiary: KourendDiaryLevel = "none",
): LevelTargetCalculationResult {
  // Note: startingResources parameter reserved for future enhancement
  console.log(
    "Calculating level dependencies with startingResources:",
    Object.keys(startingResources).length,
  );

  const cropData = getCropData(targetCrop);
  if (!cropData) {
    throw new Error(`Unknown crop: ${targetCrop}`);
  }

  if (startingLevel >= targetLevel) {
    throw new Error("Starting level must be less than target level");
  }

  if (startingLevel < cropData.farmingLevel) {
    throw new Error(
      `Starting level (${startingLevel}) is too low to grow ${cropData.name} (requires level ${cropData.farmingLevel})`,
    );
  }

  const targetXp = getXpNeeded(startingLevel, targetLevel);

  // Build the dependency chain data
  const dependencyChain = getDependencyChain(targetCrop);
  const cropMap = new Map<
    string,
    { crop: CropData; yield: number; xpPerPatch: number }
  >();

  for (const cropId of dependencyChain) {
    const crop = getCropData(cropId);
    if (!crop) continue;

    const yield_ = calculateYield(
      cropId,
      startingLevel,
      compostType,
      magicSecateurs,
      farmingCape,
      attasSeed,
      kandarinDiary,
      kourendDiary,
    );

    cropMap.set(cropId, {
      crop,
      yield: yield_[yieldStrategy],
      xpPerPatch: crop.expPerHarvest,
    });
  }

  // Create system of equations approach
  // Let T = tomato patches, C = cabbage patches, O = onion patches, P = potato patches
  // Constraints:
  // T * 20 <= C * 3 (tomatoes need 20 cabbages per patch, cabbages yield 3 per patch)
  // C * 10 <= O * 3 (cabbages need 10 onions per patch, onions yield 3 per patch)
  // O * 10 <= P * 3 (onions need 10 potatoes per patch, potatoes yield 3 per patch)
  // Total XP: T * xp_T + C * xp_C + O * xp_O + P * xp_P = targetXp

  // Solve for minimum patches by working backwards from the dependency chain
  const patchCounts = new Map<string, number>();
  const xpBreakdown: LevelTargetCalculationResult["xpBreakdown"] = {};

  // Start with a minimal initial guess and solve the system
  let scaleFactor = 1;
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations) {
    iterations++;

    // Calculate patch requirements working forward through the chain
    let cumulativeXp = 0;
    patchCounts.clear();

    for (let i = dependencyChain.length - 1; i >= 0; i--) {
      const cropId = dependencyChain[i];
      const cropInfo = cropMap.get(cropId);
      if (!cropInfo) continue;

      let patchesNeeded: number;

      if (i === 0) {
        // This is the target crop - start with a base amount scaled by our factor
        patchesNeeded = Math.ceil(scaleFactor);
      } else {
        // This is a dependency crop - calculate how many patches needed to support the next crop
        const nextCropId = dependencyChain[i - 1];
        const nextCropInfo = cropMap.get(nextCropId);
        const nextCropPatches = patchCounts.get(nextCropId) || 0;

        if (nextCropInfo?.crop.protection?.crop === cropId) {
          const itemsNeeded =
            nextCropPatches * nextCropInfo.crop.protection.quantity;
          patchesNeeded = Math.ceil(itemsNeeded / cropInfo.yield);
        } else {
          patchesNeeded = 0;
        }
      }

      patchCounts.set(cropId, patchesNeeded);

      // Calculate XP contribution
      const xpContribution = patchesNeeded * cropInfo.xpPerPatch;
      cumulativeXp += xpContribution;

      xpBreakdown[cropId] = {
        plantingXp: 0, // We focus on harvest XP for simplicity
        harvestXp: xpContribution,
        totalXp: xpContribution,
        patches: patchesNeeded,
      };
    }

    // Check if we're close to target XP
    const xpRatio = targetXp / Math.max(cumulativeXp, 1);

    if (Math.abs(cumulativeXp - targetXp) < targetXp * 0.02) {
      // Within 2% of target - good enough
      break;
    }

    if (cumulativeXp < targetXp) {
      // Need more XP - increase scale factor
      scaleFactor *= xpRatio * 1.1; // Slight overshoot to converge faster
    } else {
      // Too much XP - decrease scale factor
      scaleFactor *= xpRatio * 0.9; // Slight undershoot to avoid oscillation
    }
  }

  // Build the final result using the calculated patch counts
  const requirements: CalculationResult["requirements"] = {};
  const breakdown: CalculationResult["breakdown"] = [];
  let totalPatches = 0;

  for (const [cropId, patches] of patchCounts) {
    if (patches === 0) continue;

    const cropInfo = cropMap.get(cropId);
    if (!cropInfo) continue;

    const cropYield = calculateYield(
      cropId,
      startingLevel,
      compostType,
      magicSecateurs,
      farmingCape,
      attasSeed,
      kandarinDiary,
      kourendDiary,
    );

    requirements[cropId] = {
      patches,
      reason:
        cropId === targetCrop
          ? `Target harvest: ${Math.ceil(patches * cropYield.average)} ${cropInfo.crop.name}s`
          : `Payment for ${dependencyChain[dependencyChain.indexOf(cropId) - 1] || "crops"}`,
      totalYield: {
        min: patches * cropYield.min,
        max: patches * cropYield.max,
        average: patches * cropYield.average,
      },
      perPatchYield: cropYield,
    };

    breakdown.push({
      level: dependencyChain.indexOf(cropId),
      crop: cropInfo.crop.name,
      patchesNeeded: {
        min: patches,
        average: patches,
        max: patches,
      },
      totalYield: {
        min: patches * cropYield.min,
        average: patches * cropYield.average,
        max: patches * cropYield.max,
      },
      purpose: requirements[cropId].reason,
    });

    totalPatches += patches;
  }

  // Calculate total XP gained
  const totalXpGained = Object.values(xpBreakdown).reduce(
    (sum, breakdown) => sum + breakdown.totalXp,
    0,
  );

  return {
    calculationMode: "level",
    targetCrop,
    targetQuantity: Math.ceil(
      (patchCounts.get(targetCrop) || 0) *
        (cropMap.get(targetCrop)?.yield || 1),
    ),
    targetLevel,
    startingLevel,
    totalXpGained,
    xpBreakdown,
    requirements,
    breakdown: breakdown.reverse(),
    summary: {
      totalPatches,
      totalSeeds: totalPatches,
      estimatedTime: Array.from(patchCounts.entries()).reduce(
        (total, [cropId, patches]) => {
          const cropInfo = cropMap.get(cropId);
          return total + (cropInfo ? patches * cropInfo.crop.growthTime : 0);
        },
        0,
      ),
    },
  };
}

/**
 * Get all available crops for the calculator
 */
export function getAvailableCrops(): CropData[] {
  return Object.values(getAllCropData());
}

/**
 * Validate if a crop has protection dependencies
 */
export function hasProtection(cropId: string): boolean {
  const crop = getCropData(cropId);
  return !!crop?.protection;
}

/**
 * Get the dependency chain for a crop
 */
export function getDependencyChain(cropId: string): string[] {
  const chain: string[] = [];
  let current = cropId;

  while (current) {
    chain.push(current);
    const crop = getCropData(current);
    current = crop?.protection?.crop || "";
  }

  return chain;
}
