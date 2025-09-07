/**
 * Shared crop options utility for generating crop selector data from JSON
 */

import { getAllCrops, getCropsByType } from "./farming-data-simple";

export interface CropOption {
  value: string;
  label: string;
  level: number;
  growthTime: number;
}

/**
 * Generate crop options for selectors from the JSON data
 */
export function getCropOptions(): CropOption[] {
  const allCrops = getAllCrops();

  return allCrops
    .map((crop) => ({
      value: crop.id,
      label: crop.name,
      level: crop.farmingLevel,
      growthTime: crop.growthTime,
    }))
    .sort((a, b) => {
      // Sort by farming level, then by name
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.label.localeCompare(b.label);
    });
}

/**
 * Get crop options formatted for Mantine Select component
 */
export function getCropSelectData() {
  return getCropOptions().map((crop) => ({
    value: crop.value,
    label: `${crop.label} (Level ${crop.level})`,
  }));
}

/**
 * Get crop counts by type for filter badges
 */
export function getCropCounts() {
  return {
    all: getAllCrops().length,
    allotment: getCropsByType("allotment").length,
    flower: getCropsByType("flower").length,
    herb: getCropsByType("herb").length,
    hops: getCropsByType("hops").length,
    bush: getCropsByType("bush").length,
  };
}
