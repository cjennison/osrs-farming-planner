// OSRS Farming Dependency Calculator
// Based on official OSRS Wiki protection payment requirements

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
  maxYield: number;
}

export interface CalculationResult {
  targetCrop: string;
  targetQuantity: number;
  requirements: {
    [cropId: string]: {
      patches: number;
      reason: string;
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

// Official OSRS crop protection data
export const CROP_DATA: { [key: string]: CropData } = {
  potato: {
    id: 'potato',
    name: 'Potato',
    type: 'allotment',
    farmingLevel: 1,
    baseYield: 3,
    maxYield: 6,
  },
  onion: {
    id: 'onion',
    name: 'Onion',
    type: 'allotment',
    farmingLevel: 5,
    protection: {
      crop: 'potato',
      quantity: 10,
      note: '1 sack of potatoes (10 potatoes)'
    },
    baseYield: 3,
    maxYield: 6,
  },
  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    type: 'allotment',
    farmingLevel: 7,
    protection: {
      crop: 'onion',
      quantity: 1,
      note: '1 onion'
    },
    baseYield: 3,
    maxYield: 6,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    type: 'allotment',
    farmingLevel: 12,
    protection: {
      crop: 'cabbage',
      quantity: 2,
      note: '2 cabbages'
    },
    baseYield: 3,
    maxYield: 6,
  },
  sweetcorn: {
    id: 'sweetcorn',
    name: 'Sweetcorn',
    type: 'allotment',
    farmingLevel: 20,
    baseYield: 3,
    maxYield: 6,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    type: 'allotment',
    farmingLevel: 31,
    baseYield: 3,
    maxYield: 6,
  },
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    type: 'allotment',
    farmingLevel: 47,
    baseYield: 3,
    maxYield: 6,
  },
  snape_grass: {
    id: 'snape_grass',
    name: 'Snape grass',
    type: 'allotment',
    farmingLevel: 61,
    baseYield: 3,
    maxYield: 6,
  },
};

/**
 * Calculate yield range based on farming level and compost type using OSRS harvest lives system
 * Based on: https://oldschool.runescape.wiki/w/Farming#Variable_crop_yield
 */
export function calculateYield(
  crop: string,
  farmingLevel: number,
  compostType: 'none' | 'compost' | 'supercompost' | 'ultracompost' = 'none'
): { min: number; max: number; average: number } {
  const cropData = CROP_DATA[crop];
  if (!cropData) throw new Error(`Unknown crop: ${crop}`);

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
  const cropData = CROP_DATA[targetCrop];
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
    const data = CROP_DATA[crop];
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
      calculateRequirement(
        data.protection.crop,
        paymentNeeded,
        level + 1,
        `Payment for ${data.name} (${data.protection.quantity} per patch)`
      );
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
  const estimatedTime = allPatches * 80; // ~80 minutes per crop cycle (growth time)

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
  return Object.values(CROP_DATA);
}

/**
 * Validate if a crop has protection dependencies
 */
export function hasProtection(cropId: string): boolean {
  const crop = CROP_DATA[cropId];
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
    const crop = CROP_DATA[current];
    current = crop?.protection?.crop || '';
  }

  return chain;
}
