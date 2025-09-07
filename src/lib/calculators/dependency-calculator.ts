// OSRS Farming Dependency Calculator
// Based on official OSRS Wiki protection payment requirements

import { getAllCrops, getCropById } from "../farming-data-simple";
import { getCropConstants, getXpNeeded } from "../farming-data-utils";
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
  type: "allotment" | "flower" | "hops" | "herb" | "bush";
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
 * Convert JSON crop data to CropData format for calculations
 */

// biome-ignore lint/suspicious/noExplicitAny: this is coming from a json
function convertToCropData(crop: any): CropData {
  return {
    id: crop.id,
    name: crop.name,
    type: crop.type as "allotment" | "flower" | "hops" | "herb" | "bush",
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

  // If not found, check if it's a crop product that maps to a source crop
  if (!crop) {
    // Map crop products to their source crops
    const productToCropMap: Record<string, string> = {
      jute_fibre: "jute", // Jute fibre comes from Jute hops
      // Add more mappings as needed
    };

    const sourceCropId = productToCropMap[cropId];
    if (sourceCropId) {
      crop = getCropById(sourceCropId);
    }
  }

  // If still not found, check if it's a purchasable item that maps to a crop container
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
  const constants = getCropConstants(crop);

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
 * Calculate total XP gained from a dependency calculation result
 * XP per patch = Planting XP + (Harvest XP per item × Expected yield)
 */
function calculateTotalExperienceFromResult(
  result: CalculationResult,
  farmingLevel: number,
  compostType: "none" | "compost" | "supercompost" | "ultracompost",
  magicSecateurs: boolean,
  farmingCape: boolean,
  attasSeed: boolean,
  kandarinDiary: KandarinDiaryLevel,
  kourendDiary: KourendDiaryLevel,
): number {
  let totalXp = 0;

  for (const [cropId, requirement] of Object.entries(result.requirements)) {
    const cropData = getCropById(cropId);
    if (!cropData?.expBreakdown) continue;

    const plantingXpPerPatch = cropData.expBreakdown.planting;
    const harvestXpPerItem = cropData.expBreakdown.harvest;

    // Calculate yield for this crop
    const cropYield = calculateYield(
      cropId,
      farmingLevel,
      compostType,
      magicSecateurs,
      farmingCape,
      attasSeed,
      kandarinDiary,
      kourendDiary,
    );

    const expectedYield = cropYield.average;
    const harvestXpPerPatch = harvestXpPerItem * expectedYield;
    const totalXpPerPatch = plantingXpPerPatch + harvestXpPerPatch;
    const cropTotalXp = requirement.patches * totalXpPerPatch;

    totalXp += cropTotalXp;
  }

  return totalXp;
}

/**
 * Calculate farming dependencies to reach a target level using a specific crop
 * Algorithm: Start with 1 target crop, calculate total XP including dependencies,
 * increment quantity until XP goal is met
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
  // Calculate XP needed to reach target level
  const xpNeeded = getXpNeeded(startingLevel, targetLevel);

  // Start with 1 target crop and increment until we meet the XP goal
  let quantity = 1;
  let result: CalculationResult;
  let totalXp = 0;

  while (true) {
    // Use existing calculateDependencies method
    result = calculateDependencies(
      targetCrop,
      quantity,
      startingLevel, // Use starting level for yield calculations
      compostType,
      startingResources,
      yieldStrategy,
      magicSecateurs,
      farmingCape,
      attasSeed,
      kandarinDiary,
      kourendDiary,
    );

    // Calculate total XP from this result
    totalXp = calculateTotalExperienceFromResult(
      result,
      startingLevel,
      compostType,
      magicSecateurs,
      farmingCape,
      attasSeed,
      kandarinDiary,
      kourendDiary,
    );

    // If we've met or exceeded the XP goal, we're done
    if (totalXp >= xpNeeded) {
      break;
    }

    // Otherwise, increment quantity and try again
    quantity++;

    // Safety check to prevent infinite loops
    if (quantity > 100000) {
      throw new Error(
        `Unable to reach level ${targetLevel} with ${targetCrop} - quantity exceeded safety limit`,
      );
    }
  }

  // Build XP breakdown for each crop
  const xpBreakdown: {
    [cropId: string]: {
      plantingXp: number;
      harvestXp: number;
      totalXp: number;
      patches: number;
    };
  } = {};

  for (const [cropId, requirement] of Object.entries(result.requirements)) {
    const cropData = getCropById(cropId);
    if (!cropData?.expBreakdown) continue;

    const plantingXpPerPatch = cropData.expBreakdown.planting;
    const harvestXpPerItem = cropData.expBreakdown.harvest;

    // Calculate yield for this crop
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

    const expectedYield = cropYield.average;
    const totalPlantingXp = requirement.patches * plantingXpPerPatch;
    const totalHarvestXp =
      requirement.patches * harvestXpPerItem * expectedYield;

    xpBreakdown[cropId] = {
      plantingXp: totalPlantingXp,
      harvestXp: totalHarvestXp,
      totalXp: totalPlantingXp + totalHarvestXp,
      patches: requirement.patches,
    };
  }

  // Return the enhanced result with level calculation info
  return {
    ...result,
    calculationMode: "level" as const,
    targetLevel,
    startingLevel,
    totalXpGained: totalXp, // Keep raw calculation value
    xpBreakdown,
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
