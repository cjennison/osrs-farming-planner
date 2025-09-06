// OSRS Farming Dependency Calculator
// Based on official OSRS Wiki protection payment requirements

import { getAllCrops, getCropById } from "../farming-data-simple";
import {
  isPurchasableItem,
  getPurchasableItemByName,
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

  // Calculate chance to save using OSRS formula (without magic secateurs for base calculation)
  // Chance = (1 + floor(CTSlow * (99-F)/98 + CTShigh * (F-1)/98 + 0.5)) / 256
  const farmingLevelClamped = Math.max(1, Math.min(99, farmingLevel));
  const chanceNumerator =
    1 +
    Math.floor(
      (constants.low * (99 - farmingLevelClamped)) / 98 +
        (constants.high * (farmingLevelClamped - 1)) / 98 +
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
    const cropYield = calculateYield(crop, farmingLevel, compostType);

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
