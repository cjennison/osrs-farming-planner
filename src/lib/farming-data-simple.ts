/**
 * Data loading utilities for OSRS Farming data
 *
 * This module provides functions to load and access the static farming data
 * from the JSON files directly.
 */

// Import the JSON data directly for synchronous access
import cropsData from '../data/crops.json';
import patchesData from '../data/patches.json';

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
 * Get all crops (allotments + flowers)
 */
export function getAllCrops(): any[] {
  return [...getAllotmentCrops(), ...getFlowerCrops()];
}

/**
 * Get crop by ID
 */
export function getCropById(id: string): any | undefined {
  return getAllCrops().find((crop) => crop.id === id);
}

/**
 * Get crops by type
 */
export function getCropsByType(type: "allotment" | "flower"): any[] {
  return type === "allotment" ? getAllotmentCrops() : getFlowerCrops();
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
