/**
 * OSRS Farming Optimization Calculator
 * Implements the "LEAST PATCH" algorithm for optimal 1-99 farming progression
 *
 * Algorithm:
 * 1. For each level 1-99, check all available farming opportunities
 * 2. Find the highest EXP PER PATCH crop available at that level
 * 3. Calculate how many patches needed to reach the next level
 * 4. Repeat until level 99
 */

import { getAllCrops, getCropById } from "../farming-data-simple";
import { getXpNeeded } from "../farming-data-utils";
import {
  calculateDependencies,
  type KandarinDiaryLevel,
  type YieldStrategy,
} from "./dependency-calculator";

export interface CalculationOptions {
  compostType?: "none" | "compost" | "supercompost" | "ultracompost";
  hasAltasSeed?: boolean;
  hasSecateurs?: boolean;
  kandarinDiary?: KandarinDiaryLevel;
  yieldStrategy?: YieldStrategy;
  excludeFlowers?: boolean;
  excludeHerbs?: boolean;
}

export interface CropInfo {
  id: string;
  name: string;
  farmingLevel: number;
  expPerHarvest: number;
  seedsPerPatch: number;
  seedId?: number;
}

export interface OptimizationStep {
  fromLevel: number;
  toLevel: number;
  expRequired: number;
  optimalCrop: {
    id: string;
    name: string;
    expPerPatch: number;
    farmingLevel: number;
  };
  patchesNeeded: number;
  totalExpGained: number;
  dependencies?: {
    [cropId: string]: {
      patches: number;
      seeds: number;
      purpose: string;
    };
  };
  inputs: {
    seeds: { [seedId: string]: number };
    purchasables: { [itemId: string]: number };
  };
}

export interface OptimizationResult {
  steps: OptimizationStep[];
  totalPatchesUsed: number;
  totalExpGained: number;
  summary: {
    totalSeeds: { [seedId: string]: number };
    totalPurchasables: { [itemId: string]: number };
  };
}

/**
 * Calculate the optimal farming progression from level 1 to 99
 */
export function calculateOptimalProgression(
  options: CalculationOptions = {},
): OptimizationResult {
  const steps: OptimizationStep[] = [];
  let totalPatchesUsed = 0;
  let totalExpGained = 0;
  const totalSeeds: { [seedId: string]: number } = {};
  const totalPurchasables: { [itemId: string]: number } = {};

  // Process each level from 1 to 98 (can't go beyond 99)
  for (let currentLevel = 1; currentLevel < 99; currentLevel++) {
    const nextLevel = currentLevel + 1;
    const expRequired = getXpNeeded(currentLevel, nextLevel);

    // Find the best crop available at this level
    const optimalCrop = findOptimalCropForLevel(currentLevel, options);

    if (!optimalCrop) {
      continue; // Skip if no crop available (shouldn't happen)
    }

    // Calculate how many patches needed
    const patchesNeeded = Math.ceil(expRequired / optimalCrop.expPerPatch);
    const actualExpGained = patchesNeeded * optimalCrop.expPerPatch;

    // Calculate dependencies for this step
    const dependencies = calculateStepDependencies(
      optimalCrop.id,
      patchesNeeded,
      options,
    );

    const step: OptimizationStep = {
      fromLevel: currentLevel,
      toLevel: nextLevel,
      expRequired,
      optimalCrop,
      patchesNeeded,
      totalExpGained: actualExpGained,
      dependencies: dependencies.crops,
      inputs: dependencies.inputs,
    };

    steps.push(step);
    totalPatchesUsed += patchesNeeded;
    totalExpGained += actualExpGained;

    // Accumulate totals
    Object.entries(dependencies.inputs.seeds).forEach(([seedId, quantity]) => {
      totalSeeds[seedId] = (totalSeeds[seedId] || 0) + quantity;
    });
    Object.entries(dependencies.inputs.purchasables).forEach(
      ([itemId, quantity]) => {
        totalPurchasables[itemId] = (totalPurchasables[itemId] || 0) + quantity;
      },
    );
  }

  return {
    steps,
    totalPatchesUsed,
    totalExpGained,
    summary: {
      totalSeeds,
      totalPurchasables,
    },
  };
}

/**
 * Find the optimal crop for a given farming level
 * Returns the crop with highest EXP per patch that the player can grow
 */
function findOptimalCropForLevel(
  farmingLevel: number,
  options: CalculationOptions,
): OptimizationStep["optimalCrop"] | null {
  const allCrops = getAllCrops();
  let availableCrops = allCrops.filter(
    (crop) => crop.farmingLevel <= farmingLevel,
  );

  // Apply exclusion filters
  if (options.excludeFlowers) {
    availableCrops = availableCrops.filter((crop) => crop.type !== "flower");
  }

  if (options.excludeHerbs) {
    availableCrops = availableCrops.filter((crop) => crop.type !== "herb");
  }

  if (availableCrops.length === 0) {
    return null;
  }

  // Calculate EXP per patch for each available crop
  let bestCrop = null;
  let bestExpPerPatch = 0;

  for (const crop of availableCrops) {
    const expPerPatch = calculateExpPerPatch(crop, options);

    if (expPerPatch > bestExpPerPatch) {
      bestExpPerPatch = expPerPatch;
      bestCrop = {
        id: crop.id,
        name: crop.name,
        expPerPatch,
        farmingLevel: crop.farmingLevel,
      };
    }
  }

  return bestCrop;
}

/**
 * Calculate experience per patch for a crop with given options
 */
function calculateExpPerPatch(
  crop: CropInfo,
  _options: CalculationOptions,
): number {
  // Base experience from planting and harvesting
  const expPerPatch = crop.expPerHarvest || 0;

  // For now, we'll use the base experience
  // TODO: Add modifiers based on compost, tools, etc.
  // This would include:
  // - Compost bonuses affecting yield and thus harvest exp
  // - Magic secateurs CTS bonuses
  // - Attas seed yield bonuses
  // - Other modifiers from options

  return expPerPatch;
}

/**
 * Calculate dependencies for a specific crop and patch count
 */
function calculateStepDependencies(
  cropId: string,
  patchesNeeded: number,
  options: CalculationOptions,
): {
  crops: {
    [cropId: string]: { patches: number; seeds: number; purpose: string };
  };
  inputs: {
    seeds: { [seedId: string]: number };
    purchasables: { [itemId: string]: number };
  };
} {
  // Use the existing dependency calculator
  const result = calculateDependencies(
    cropId,
    patchesNeeded,
    99, // Use max level for calculations
    options.compostType || "none",
    {}, // startingResources
    options.yieldStrategy || "average",
    options.hasSecateurs || false,
    false, // farmingCape
    options.hasAltasSeed || false,
    options.kandarinDiary || "none",
    "none", // kourendDiary
  );

  // Convert to our format
  const crops: {
    [cropId: string]: { patches: number; seeds: number; purpose: string };
  } = {};
  const inputs: {
    seeds: { [seedId: string]: number };
    purchasables: { [itemId: string]: number };
  } = { seeds: {}, purchasables: {} };

  // Process requirements
  Object.entries(result.requirements).forEach(([crop, req]) => {
    crops[crop] = {
      patches: req.patches,
      seeds: req.patches * (getCropById(crop)?.seedsPerPatch || 1),
      purpose: req.reason,
    };
  });

  // Extract inputs from breakdown - for each step, calculate seeds needed
  result.breakdown.forEach((step) => {
    const crop = getCropById(step.crop);
    if (crop && step.patchesNeeded) {
      // Use crop's seedId if available, otherwise use crop id
      const seedId = crop.seedId?.toString() || crop.id;
      const patchesForThisStep =
        step.patchesNeeded.average || step.patchesNeeded.min || 1;
      const seedsNeeded = patchesForThisStep * crop.seedsPerPatch;

      inputs.seeds[seedId] = (inputs.seeds[seedId] || 0) + seedsNeeded;
    }

    // Add purchasable items (compost, etc.)
    if (step.purchaseQuantity && step.purchaseQuantity > 0) {
      // The step.crop for purchasables might have " (purchasable)" suffix
      const itemId = step.crop.replace(/\s*\(purchasable\)\s*$/i, "").trim();
      inputs.purchasables[itemId] =
        (inputs.purchasables[itemId] || 0) + step.purchaseQuantity;
    }
  });

  // For the main crop itself, make sure we include its seeds
  const mainCrop = getCropById(cropId);
  if (mainCrop) {
    const mainSeedId = mainCrop.seedId?.toString() || mainCrop.id;
    const mainSeedsNeeded = patchesNeeded * mainCrop.seedsPerPatch;
    inputs.seeds[mainSeedId] =
      (inputs.seeds[mainSeedId] || 0) + mainSeedsNeeded;
  }

  return { crops, inputs };
}

/**
 * Get a summary of level ranges and their optimal crops
 */
export function getOptimalCropSummary(): {
  [levelRange: string]: {
    crop: string;
    name: string;
    expPerPatch: number;
    levelRequirement: number;
  };
} {
  const summary: {
    [levelRange: string]: {
      crop: string;
      name: string;
      expPerPatch: number;
      levelRequirement: number;
    };
  } = {};
  const allCrops = getAllCrops();

  // Group crops by level requirement
  const cropsByLevel = allCrops.reduce(
    (acc, crop) => {
      const level = crop.farmingLevel;
      if (!acc[level]) acc[level] = [];
      acc[level].push(crop);
      return acc;
    },
    {} as { [level: number]: CropInfo[] },
  );

  // For each level, find the best crop
  Object.entries(cropsByLevel).forEach(([level, crops]) => {
    const levelNum = parseInt(level);
    let bestCrop: CropInfo | null = null;
    let bestExp = 0;

    (crops as CropInfo[]).forEach((crop: CropInfo) => {
      const exp = crop.expPerHarvest || 0;
      if (exp > bestExp) {
        bestExp = exp;
        bestCrop = crop;
      }
    });

    if (bestCrop) {
      const crop = bestCrop as CropInfo;
      summary[`${levelNum}+`] = {
        crop: crop.id,
        name: crop.name,
        expPerPatch: bestExp,
        levelRequirement: levelNum,
      };
    }
  });

  return summary;
}
