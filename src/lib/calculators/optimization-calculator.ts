/**
 * OSRS Farming Optimization Calculator - LEAST PATCH Algorithm
 *
 * Algorithm from MOST-OPTIMAL.md:
 * 1. For each level 1-99, check all available farming opportunities
 * 2. Find the highest EXP PER PATCH crop available at that level
 * 3. Start with quantity = 1, use dependency calculator to get total XP
 * 4. Increment quantity until XP target for next level is met
 * 5. Use ALL data from dependency calculator result for display
 * 6. Repeat for every level step until 99
 */

import { getAllCrops, getCropById } from "../farming-data-simple";
import { getXpNeeded } from "../farming-data-utils";
import {
  type CalculationResult,
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
  excludeBushes?: boolean;
  excludeFruitTrees?: boolean;
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
  // ALL data comes from dependency calculator result
  targetQuantity: number;
  calculationResult: CalculationResult;
}

export interface OptimizationResult {
  steps: OptimizationStep[];
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

    // Find the quantity needed to reach the XP target
    const { targetQuantity, calculationResult } = findQuantityForXPTarget(
      optimalCrop.id,
      expRequired,
      currentLevel,
      options,
    );

    const step: OptimizationStep = {
      fromLevel: currentLevel,
      toLevel: nextLevel,
      expRequired,
      optimalCrop,
      targetQuantity,
      calculationResult,
    };

    steps.push(step);

    // Accumulate totals from the calculation result
    calculationResult.breakdown.forEach((breakdownStep) => {
      // Handle purchasable items
      if (
        breakdownStep.crop.includes("(purchasable)") &&
        breakdownStep.purchaseQuantity
      ) {
        const itemId = breakdownStep.crop
          .replace(/\s*\(purchasable\)\s*$/i, "")
          .trim();
        totalPurchasables[itemId] =
          (totalPurchasables[itemId] || 0) + breakdownStep.purchaseQuantity;
        return;
      }

      // Handle crop seeds
      const crop =
        getCropById(breakdownStep.crop) ||
        getCropById(breakdownStep.crop.toLowerCase());
      if (crop && breakdownStep.patchesNeeded) {
        const seedId = crop.seedId?.toString() || crop.id;
        const patchesForThisStep =
          breakdownStep.patchesNeeded.average ||
          breakdownStep.patchesNeeded.min ||
          1;
        const seedsNeeded = patchesForThisStep * (crop.seedsPerPatch || 1);
        totalSeeds[seedId] = (totalSeeds[seedId] || 0) + seedsNeeded;
      }
    });

    // Add seeds for requirements not in breakdown
    Object.entries(calculationResult.requirements).forEach(([cropId, req]) => {
      const crop = getCropById(cropId);
      if (crop) {
        const seedId = crop.seedId?.toString() || crop.id;
        const seedsNeeded = req.patches * (crop.seedsPerPatch || 1);

        // Only add if not already counted in breakdown
        if (!totalSeeds[seedId]) {
          totalSeeds[seedId] = seedsNeeded;
        }
      }
    });
  }

  return {
    steps,
    summary: {
      totalSeeds,
      totalPurchasables,
    },
  };
}

/**
 * Find the quantity of target crop needed to reach XP target
 * This is the core algorithm: increment quantity until XP target is met
 */
function findQuantityForXPTarget(
  cropId: string,
  targetXP: number,
  farmingLevel: number,
  options: CalculationOptions,
): {
  targetQuantity: number;
  calculationResult: CalculationResult;
} {
  let quantity = 1;
  let result: CalculationResult;

  // Keep incrementing quantity until we meet or exceed the XP target
  while (true) {
    result = calculateDependencies(
      cropId,
      quantity,
      farmingLevel,
      options.compostType || "none",
      {}, // startingResources
      options.yieldStrategy || "average",
      options.hasSecateurs || false,
      false, // farmingCape
      options.hasAltasSeed || false,
      options.kandarinDiary || "none",
      "none", // kourendDiary
    );

    // Calculate total XP from all crops in the result
    let totalXP = 0;

    // Add XP from target crop
    const targetCrop = getCropById(cropId);
    if (targetCrop) {
      const targetPatches = Math.ceil(quantity / (targetCrop.baseYield || 3));
      totalXP += targetPatches * (targetCrop.expPerHarvest || 0);
    }

    // Add XP from dependency crops
    Object.entries(result.requirements).forEach(([depCropId, req]) => {
      const depCrop = getCropById(depCropId);
      if (depCrop) {
        totalXP += req.patches * (depCrop.expPerHarvest || 0);
      }
    });

    if (totalXP >= targetXP) {
      return {
        targetQuantity: quantity,
        calculationResult: result,
      };
    }

    quantity++;

    // Safety check to prevent infinite loops
    if (quantity > 100000) {
      throw new Error(
        `Unable to reach target XP ${targetXP} for crop ${cropId} at level ${farmingLevel}`,
      );
    }
  }
}

/**
 * Find the optimal crop for a given farming level
 * Returns the crop with highest EXP per patch that the player can grow
 */
function findOptimalCropForLevel(
  farmingLevel: number,
  options: CalculationOptions,
): {
  id: string;
  name: string;
  expPerPatch: number;
  farmingLevel: number;
} | null {
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

  if (options.excludeBushes) {
    availableCrops = availableCrops.filter((crop) => crop.type !== "bush");
  }

  if (options.excludeFruitTrees) {
    availableCrops = availableCrops.filter(
      (crop) => crop.type !== "fruit_tree",
    );
  }

  if (availableCrops.length === 0) {
    return null;
  }

  // Find crop with highest EXP per patch
  let bestCrop = null;
  let bestExpPerPatch = 0;

  for (const crop of availableCrops) {
    const expPerPatch = crop.expPerHarvest || 0;

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
