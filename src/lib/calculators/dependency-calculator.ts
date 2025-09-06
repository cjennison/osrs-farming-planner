// OSRS Farming Dependency Calculator
// Based on official OSRS Wiki protection payment requirements

import { getAllCrops, getCropById } from '../farming-data-simple';

export interface CropPayment {
  crop: string;
  quantity: number;
  note?: string;
}

export interface CropData {
  id: string;
  name: string;
  type: 'allotment' | 'flower';
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

export type YieldStrategy = 'min' | 'average' | 'max';

/**
 * Convert JSON crop data to CropData format for calculations
 */
function convertToCropData(crop: any): CropData {
  return {
    id: crop.id,
    name: crop.name,
    type: crop.type as 'allotment' | 'flower',
    farmingLevel: crop.farmingLevel || 1,
    baseYield: crop.baseYield || 3,
    seedsPerPatch: crop.seedsPerPatch || 3,
    expPerHarvest: crop.expPerHarvest || 0,
    growthTime: crop.growthTime || 80, // Default to 80 minutes if not specified
    isFixedYield: crop.isFixedYield || false,
    protection: crop.protection ? {
      crop: crop.protection.item, // Use the crop ID directly
      quantity: crop.protection.quantity, // Now represents actual items needed
      note: crop.protection.type === 'item' ? 'Compost payment' : 'Crop payment'
    } : undefined,
  };
}

/**
 * Get crop data by ID from the loaded farming data
 */
function getCropData(cropId: string): CropData | undefined {
  const crop = getCropById(cropId);
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
  compostType: 'none' | 'compost' | 'supercompost' | 'ultracompost' = 'none'
): { min: number; max: number; average: number } {
  const cropData = getCropData(crop);
  if (!cropData) throw new Error(`Unknown crop: ${crop}`);

  // Check if this crop has fixed yield (like most flowers)
  if (cropData.isFixedYield) {
    const fixedYield = cropData.baseYield;
    return {
      min: fixedYield,
      max: fixedYield,
      average: fixedYield
    };
  }

  // Harvest lives system: 3 base + compost bonus
  const compostLives = {
    none: 0,
    compost: 1,
    supercompost: 2,
    ultracompost: 3,
  }[compostType];

  const harvestLives = 3 + compostLives;

  // Chance to save harvest life constants (from OSRS Wiki)
  // These are approximations based on known values
  const cropConstants: Record<string, { low: number; high: number }> = {
    potato: { low: 40, high: 80 },    // Level 1 crop
    onion: { low: 42, high: 80 },     // Level 5 crop
    cabbage: { low: 44, high: 80 },   // Level 7 crop
    tomato: { low: 48, high: 80 },    // Level 12 crop
    sweetcorn: { low: 52, high: 80 }, // Level 20 crop
    strawberry: { low: 58, high: 80 }, // Level 31 crop
    watermelon: { low: 65, high: 80 }, // Level 47 crop
    snape_grass: { low: 70, high: 80 }, // Level 61 crop
  };

  const constants = cropConstants[crop] || { low: 50, high: 80 };

  // Calculate unboosted chance to save using OSRS formula
  // Chance = (1 + floor(CTSlow * (99-F)/98 + CTShigh * (F-1)/98 + 0.5)) / 256
  const farmingLevelClamped = Math.max(1, Math.min(99, farmingLevel));
  const chanceNumerator = 1 + Math.floor(
    constants.low * (99 - farmingLevelClamped) / 98 +
    constants.high * (farmingLevelClamped - 1) / 98 +
    0.5
  );

  const unboostedChanceToSave = chanceNumerator / 256;

  // Apply boosts (assuming magic secateurs for conservative estimate)
  // ItemBoost = floor(CTS * 1.1) for magic secateurs
  const boostedLow = Math.floor(constants.low * 1.1);
  const boostedHigh = Math.floor(constants.high * 1.1);

  const boostedChanceNumerator = 1 + Math.floor(
    boostedLow * (99 - farmingLevelClamped) / 98 +
    boostedHigh * (farmingLevelClamped - 1) / 98 +
    0.5
  );

  const boostedChanceToSave = boostedChanceNumerator / 256;

  // Use boosted chance for calculations (conservative assumption)
  const chanceToSave = boostedChanceToSave;

  // Expected yield formula: Lives / (1 - chanceToSave)
  const expectedYield = harvestLives / (1 - chanceToSave);

  // Minimum is always the number of lives you start with
  const min = harvestLives;

  // Maximum is theoretically infinite, but practically calculate 99th percentile
  // Using negative binomial distribution properties
  const max = Math.ceil(expectedYield * 2); // Conservative upper bound

  return {
    min,
    max,
    average: Math.round(expectedYield * 10) / 10 // Round to 1 decimal place
  };
}

/**
 * Calculate farming dependencies with starting resources consideration
 */
export function calculateDependencies(
  targetCrop: string,
  targetQuantity: number,
  farmingLevel: number = 99,
  compostType: 'none' | 'compost' | 'supercompost' | 'ultracompost' = 'supercompost',
  startingResources: StartingResources = {},
  yieldStrategy: YieldStrategy = 'average'
): CalculationResult {
  const cropData = getCropData(targetCrop);
  if (!cropData) {
    throw new Error(`Unknown target crop: ${targetCrop}`);
  }

  const requirements: CalculationResult['requirements'] = {};
  const breakdown: CalculationResult['breakdown'] = [];

  // Build dependency chain
  function calculateRequirement(
    crop: string,
    neededQuantity: number,
    level: number,
    purpose: string
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
            max: 0
          },
          totalYield: {
            min: available,
            average: available,
            max: available
          },
          purpose: `${purpose} (using ${Math.min(available, neededQuantity)} from starting resources)`
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
    const patchesNeeded = yieldStrategy === 'min' ? patchesNeededMin
                        : yieldStrategy === 'max' ? patchesNeededMax
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
        max: patchesNeededMax
      },
      totalYield: {
        min: patchesNeededMin * cropYield.min,
        average: patchesNeededAverage * cropYield.average,
        max: patchesNeededMax * cropYield.max
      },
      purpose: available > 0
        ? `${purpose} (${stillNeeded} needed, ${available} from starting resources)`
        : purpose
    });

    // Recursively calculate dependencies
    if (data.protection) {
      const paymentNeeded = patchesNeeded * data.protection.quantity;
      const paymentCropPatches = calculateRequirement(
        data.protection.crop,
        paymentNeeded,
        level + 1,
        `Payment for ${data.name} (${data.protection.quantity} per patch)`
      );

      // Add payment information to the payment crop's requirement
      if (requirements[data.protection.crop]) {
        const originalCrop = getCropById(crop);
        if (originalCrop?.protection?.itemDescription) {
          const totalItemsNeeded = patchesNeeded * data.protection.quantity;

          if (originalCrop.protection.isContainer && originalCrop.protection.containerSize) {
            // Calculate containers needed
            const containersNeeded = Math.ceil(totalItemsNeeded / originalCrop.protection.containerSize);
            requirements[data.protection.crop].paymentInfo = {
              containerDescription: originalCrop.protection.itemDescription,
              containerQuantity: containersNeeded,
              totalCropsNeeded: totalItemsNeeded
            };
          } else {
            // Individual items (no containers)
            requirements[data.protection.crop].paymentInfo = {
              containerDescription: originalCrop.protection.itemDescription,
              containerQuantity: totalItemsNeeded,
              totalCropsNeeded: totalItemsNeeded
            };
          }
        }
      }
    }

    return patchesNeeded;
  }

  // Start calculation
  const totalPatches = calculateRequirement(
    targetCrop,
    targetQuantity,
    0,
    `Target harvest: ${targetQuantity} ${cropData.name}${targetQuantity === 1 ? '' : 's'}`
  );

  // Calculate summary
  const allPatches = Object.values(requirements).reduce((sum, req) => sum + req.patches, 0);

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
    current = crop?.protection?.crop || '';
  }

  return chain;
}
