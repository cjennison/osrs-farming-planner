/**
 * OSRS Hiscores API Service
 *
 * Fetches player data from the official OSRS Hiscores API via our Next.js proxy
 * This avoids CORS issues by making requests through our API route
 */

import type {
  HiscoresResult,
  OSRSCharacter,
  OSRSHiscores,
} from "@/types/hiscores";

// Interface for the API response skill data
interface APISkillData {
  id: number;
  name: string;
  rank: number;
  level: number;
  xp: number;
}

// Our Next.js API proxy endpoints
const HISCORES_PROXY = {
  api: "/api/hiscores",
} as const;

// Skill names in the order they appear in the API response
const SKILL_ORDER = [
  "overall",
  "attack",
  "defence",
  "strength",
  "hitpoints",
  "ranged",
  "prayer",
  "magic",
  "cooking",
  "woodcutting",
  "fletching",
  "fishing",
  "firemaking",
  "crafting",
  "smithing",
  "mining",
  "herblore",
  "agility",
  "thieving",
  "slayer",
  "farming",
  "runecraft",
  "hunter",
  "construction",
] as const;

/**
 * Parse CSV hiscores data into structured format
 */
function parseHiscoresCSV(csvData: string): OSRSHiscores {
  const lines = csvData.trim().split("\n");

  // Each line format: rank,level,experience
  // Lines 0-23 are skills, rest are minigames/activities
  const skillLines = lines.slice(0, 24);

  const skills: Partial<OSRSHiscores> = {};

  skillLines.forEach((line, index) => {
    const [rankStr, levelStr, experienceStr] = line.split(",");
    const skillName = SKILL_ORDER[index];

    if (skillName) {
      skills[skillName] = {
        rank: parseInt(rankStr, 10) || -1,
        level: parseInt(levelStr, 10) || 1,
        experience: parseInt(experienceStr, 10) || 0,
      };
    }
  });

  return skills as OSRSHiscores;
}

/**
 * Calculate combat level from combat skills
 */
function calculateCombatLevel(skills: OSRSHiscores): number {
  const { attack, strength, defence, hitpoints, prayer, ranged, magic } =
    skills;

  const combatLevel = Math.floor(
    (defence.level + hitpoints.level + Math.floor(prayer.level / 2)) * 0.25 +
      Math.max(
        attack.level + strength.level,
        Math.floor(ranged.level * 1.5),
        Math.floor(magic.level * 1.5),
      ) *
        0.325,
  );

  return combatLevel;
}

/**
 * Calculate total level from all skills
 */
function calculateTotalLevel(skills: OSRSHiscores): number {
  return Object.values(skills)
    .slice(1) // Skip overall
    .reduce((total, skill) => total + skill.level, 0);
}

/**
 * Calculate total experience from all skills
 */
function calculateTotalExperience(skills: OSRSHiscores): number {
  return Object.values(skills)
    .slice(1) // Skip overall
    .reduce((total, skill) => total + skill.experience, 0);
}

/**
 * Fetch player hiscores data
 */
export async function fetchPlayerHiscores(
  username: string,
): Promise<HiscoresResult> {
  if (!username || username.trim().length === 0) {
    return {
      success: false,
      error: {
        type: "invalid_format",
        message: "Username cannot be empty",
      },
    };
  }

  // Clean username (remove spaces, special characters)
  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_\- ]/g, "");

  if (cleanUsername.length === 0) {
    return {
      success: false,
      error: {
        type: "invalid_format",
        message: "Invalid username format",
      },
    };
  }

  try {
    // Use our Next.js API proxy to avoid CORS issues
    const response = await fetch(
      `${HISCORES_PROXY.api}?player=${encodeURIComponent(cleanUsername)}&format=json`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404 || errorData.type === "not_found") {
        return {
          success: false,
          error: {
            type: "not_found",
            message:
              errorData.message ||
              "Player not found on hiscores. The player either doesn't exist or has skills too low to appear on hiscores.",
          },
        };
      }

      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const apiResponse = await response.json();
    let skills: OSRSHiscores;

    // Handle both JSON and CSV data from our proxy
    if (apiResponse.format === "csv") {
      skills = parseHiscoresCSV(apiResponse.data);
    } else {
      // Convert JSON format to our expected format
      // The response.data.skills is an array where each skill has id, name, rank, level, xp
      skills = {} as OSRSHiscores;
      const jsonData = apiResponse.data;

      if (jsonData.skills && Array.isArray(jsonData.skills)) {
        jsonData.skills.forEach((skillData: APISkillData) => {
          // Map skill ID to skill name using SKILL_ORDER
          const skillName = SKILL_ORDER[skillData.id];
          if (skillName) {
            skills[skillName] = {
              rank: skillData.rank || -1,
              level: skillData.level || 1,
              experience: skillData.xp || 0,
            };
          }
        });
      } else {
        throw new Error("Invalid JSON response format - missing skills array");
      }
    }

    // Validate that we got valid data
    if (!skills.farming) {
      throw new Error("Invalid hiscores data format");
    }

    const character: OSRSCharacter = {
      username: cleanUsername,
      skills,
      lastUpdated: new Date(),
      combatLevel: calculateCombatLevel(skills),
      totalLevel: calculateTotalLevel(skills),
      totalExperience: calculateTotalExperience(skills),
    };

    return {
      success: true,
      character,
    };
  } catch (error) {
    console.error("Hiscores fetch error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: {
          type: "network_error",
          message:
            "Network error. Please check your internet connection and try again.",
        },
      };
    }

    return {
      success: false,
      error: {
        type: "network_error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };
  }
}

/**
 * Cache management for player data
 */
const CACHE_KEY_PREFIX = "osrs_character_";
const CACHE_DURATION = 5 * 60 * 1000;

export function cacheCharacter(character: OSRSCharacter): void {
  try {
    const cacheData = {
      character,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${character.username.toLowerCase()}`,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.warn("Failed to cache character data:", error);
  }
}

export function getCachedCharacter(username: string): OSRSCharacter | null {
  try {
    const cached = localStorage.getItem(
      `${CACHE_KEY_PREFIX}${username.toLowerCase()}`,
    );
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;

    if (age > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${username.toLowerCase()}`);
      return null;
    }

    // Convert date string back to Date object
    const character = cacheData.character;
    character.lastUpdated = new Date(character.lastUpdated);

    return character;
  } catch (error) {
    console.warn("Failed to get cached character data:", error);
    return null;
  }
}

export function clearCharacterCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(CACHE_KEY_PREFIX),
    );
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn("Failed to clear character cache:", error);
  }
}
