// biome-ignore lint/suspicious/noExplicitAny: Legacy data access patterns
/**
 * Data loading utilities for OSRS Farming data
 *
 * This module provides functions to load and access the static farming data
 * from the JSON files directly.
 */

// Import the JSON data directly for synchronous access
import cropsData from "../data/crops.json";
import patchesData from "../data/patches.json";

/**
 * Get all supported allotment crops
 */
export function getAllotmentCrops(): any[] {
  return cropsData.allotments;
}

/**
 * Get all supported flower crops
 */
export function getFlowerCrops(): any[] {
  return cropsData.flowers;
}

/**
 * Get all supported hops crops
 */
export function getHopsCrops(): any[] {
  return cropsData.hops;
}

/**
 * Get all supported herb crops
 */
export function getHerbCrops(): any[] {
  return cropsData.herbs;
}

/**
 * Get all supported bush crops
 */
export function getBushCrops(): any[] {
  return cropsData.bushes;
}

/**
 * Get all supported fruit tree crops
 */
export function getFruitTreeCrops(): any[] {
  return cropsData.fruit_trees;
}

/**
 * Get all crops (allotments + flowers + hops + herbs + bushes + fruit_trees)
 */
export function getAllCrops(): any[] {
  return [
    ...getAllotmentCrops(),
    ...getFlowerCrops(),
    ...getHopsCrops(),
    ...getHerbCrops(),
    ...getBushCrops(),
    ...getFruitTreeCrops(),
  ];
}

/**
 * Get crop by ID
 */
export function getCropById(id: string): any | undefined {
  return getAllCrops().find(
    (crop) => crop.id === id || crop.harvestName === id,
  );
}

/**
 * Get crops by type
 */
export function getCropsByType(
  type: "allotment" | "flower" | "hops" | "herb" | "bush" | "fruit_tree",
): any[] {
  if (type === "allotment") return getAllotmentCrops();
  if (type === "flower") return getFlowerCrops();
  if (type === "hops") return getHopsCrops();
  if (type === "herb") return getHerbCrops();
  if (type === "bush") return getBushCrops();
  if (type === "fruit_tree") return getFruitTreeCrops();
  return [];
}

/**
 * Get all farming patches (simplified version)
 */
export function getAllPatches(): any[] {
  return patchesData.locations;
}

/**
 * Get patches by type
 */
export function getPatchesByType(type: "allotment" | "flower"): any[] {
  return getAllPatches().filter((patch: any) => patch.type === type);
}
