/**
 * OSRS Hiscores API Types
 * Based on the official OSRS Hiscores API format
 */

export interface OSRSSkill {
  rank: number;
  level: number;
  experience: number;
}

export interface OSRSHiscores {
  // Skills (in order as returned by the API)
  overall: OSRSSkill;
  attack: OSRSSkill;
  defence: OSRSSkill;
  strength: OSRSSkill;
  hitpoints: OSRSSkill;
  ranged: OSRSSkill;
  prayer: OSRSSkill;
  magic: OSRSSkill;
  cooking: OSRSSkill;
  woodcutting: OSRSSkill;
  fletching: OSRSSkill;
  fishing: OSRSSkill;
  firemaking: OSRSSkill;
  crafting: OSRSSkill;
  smithing: OSRSSkill;
  mining: OSRSSkill;
  herblore: OSRSSkill;
  agility: OSRSSkill;
  thieving: OSRSSkill;
  slayer: OSRSSkill;
  farming: OSRSSkill;
  runecraft: OSRSSkill;
  hunter: OSRSSkill;
  construction: OSRSSkill;
}

export interface OSRSCharacter {
  username: string;
  skills: OSRSHiscores;
  lastUpdated: Date;
  // Add fields for potential future features
  combatLevel?: number;
  totalLevel?: number;
  totalExperience?: number;
}

export interface HiscoresError {
  type: "not_found" | "private" | "network_error" | "invalid_format";
  message: string;
}

export type HiscoresResult =
  | { success: true; character: OSRSCharacter }
  | { success: false; error: HiscoresError };
