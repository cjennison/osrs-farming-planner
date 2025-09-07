// OSRS Data Utilities - Load XP table and crop constants from JSON files

import cropConstantsData from "../data/crop-constants.json";
import xpTableData from "../data/xp-table.json";

/**
 * OSRS Farming XP table - XP required for each level
 * Source: https://oldschool.runescape.wiki/w/Experience_table
 */
export const FARMING_XP_TABLE: number[] = xpTableData.xpTable;

/**
 * Crop constants for Chance-to-Save (CTS) calculations
 * These are official values from Mod Easty via Twitter DMs
 */
export interface CropConstants {
  low: number;
  high: number;
  level?: number;
}

export interface CropConstantsData {
  allotments: Record<string, CropConstants>;
  hops: Record<string, CropConstants>;
  herbs: Record<string, CropConstants>;
}

export const CROP_CONSTANTS: CropConstantsData = cropConstantsData.constants;

export const DEFAULT_CROP_CONSTANTS: CropConstants = cropConstantsData.defaults;

/**
 * Get crop constants for a specific crop, with fallback to defaults
 */
export function getCropConstants(cropId: string): CropConstants {
  // Check all crop types
  for (const cropType of Object.values(CROP_CONSTANTS)) {
    if (cropType[cropId]) {
      return cropType[cropId];
    }
  }

  // Return defaults if not found
  return DEFAULT_CROP_CONSTANTS;
}

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
