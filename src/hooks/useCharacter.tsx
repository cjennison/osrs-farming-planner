/**
 * OSRS Character Context
 *
 * Manages the current OSRS character state across the application
 * Handles fetching, caching, and persisting character data
 */

"use client";

import { notifications } from "@mantine/notifications";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  cacheCharacter,
  fetchPlayerHiscores,
  getCachedCharacter,
} from "@/lib/osrs-hiscores";
import type { HiscoresResult, OSRSCharacter } from "@/types/hiscores";

interface CharacterContextType {
  currentCharacter: OSRSCharacter | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  setCharacter: (username: string) => Promise<boolean>;
  clearCharacter: () => void;
  refreshCharacter: () => Promise<boolean>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "osrs_current_character";

interface CharacterProviderProps {
  children: ReactNode;
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [currentCharacter, setCurrentCharacter] =
    useState<OSRSCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load character from localStorage on mount
  useEffect(() => {
    const initializeCharacter = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const character = JSON.parse(saved) as OSRSCharacter;
          // Convert date string back to Date object
          character.lastUpdated = new Date(character.lastUpdated);

          // Check if the cached character data is expired
          const cacheKey = `osrs_character_${character.username.toLowerCase()}`;
          const cacheData = localStorage.getItem(cacheKey);

          if (cacheData) {
            try {
              const parsed = JSON.parse(cacheData);
              const age = Date.now() - parsed.timestamp;
              const cacheLimit = 5 * 60 * 1000; // 5 minutes

              if (age > cacheLimit) {
                // Cache is expired, refetch automatically
                setIsLoading(true);
                const result = await fetchPlayerHiscores(character.username);

                if (result.success) {
                  setCurrentCharacter(result.character);
                  cacheCharacter(result.character);
                  notifications.show({
                    title: "Character Refreshed",
                    message: `Updated ${result.character.username} stats automatically`,
                    color: "green",
                  });
                } else {
                  // If refetch fails, use the cached character anyway
                  setCurrentCharacter(character);
                }
                setIsLoading(false);
              } else {
                // Cache is still valid, use cached character
                setCurrentCharacter(character);
              }
            } catch (_) {
              // If cache parsing fails, use the character from localStorage
              setCurrentCharacter(character);
            }
          } else {
            // No cache data found, use the character from localStorage
            setCurrentCharacter(character);
          }
        }
      } catch (err) {
        console.warn("Failed to load saved character:", err);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCharacter();
  }, []);

  // Save character to localStorage when it changes
  useEffect(() => {
    if (currentCharacter) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCharacter));
      } catch (err) {
        console.warn("Failed to save character:", err);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentCharacter]);

  const setCharacter = useCallback(
    async (username: string): Promise<boolean> => {
      if (!username.trim()) {
        setError("Username cannot be empty");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = getCachedCharacter(username);
        if (cached) {
          setCurrentCharacter(cached);
          setIsLoading(false);

          // Calculate remaining wait time for refresh
          const cacheKey = `osrs_character_${username.toLowerCase()}`;
          const cacheData = localStorage.getItem(cacheKey);
          let remainingMinutes = 0;

          if (cacheData) {
            try {
              const parsed = JSON.parse(cacheData);
              const age = Date.now() - parsed.timestamp;
              const cacheLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
              const remaining = cacheLimit - age;
              remainingMinutes = Math.ceil(remaining / (60 * 1000));
            } catch (_) {
              // If parsing fails, default to 0
              remainingMinutes = 0;
            }
          }

          const waitMessage =
            remainingMinutes > 0
              ? ` Wait ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""} until refreshing.`
              : "";

          notifications.show({
            title: "Character Loaded",
            message: `Loaded ${cached.username} from cache.${waitMessage}`,
            color: "green",
          });
          return true;
        }

        // Fetch from API
        const result: HiscoresResult = await fetchPlayerHiscores(username);

        if (result.success) {
          setCurrentCharacter(result.character);
          cacheCharacter(result.character);

          notifications.show({
            title: "Character Found",
            message: `Successfully loaded ${result.character.username} (Farming Level: ${result.character.skills.farming.level})`,
            color: "green",
          });

          setIsLoading(false);
          return true;
        } else {
          setError(result.error.message);

          let notificationMessage = result.error.message;
          if (result.error.type === "not_found") {
            notificationMessage = `Player "${username}" not found on hiscores. Check the spelling or ensure the player has stats high enough to appear on hiscores.`;
          }

          notifications.show({
            title: "Character Not Found",
            message: notificationMessage,
            color: "red",
          });

          setIsLoading(false);
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);

        notifications.show({
          title: "Error",
          message: errorMessage,
          color: "red",
        });

        setIsLoading(false);
        return false;
      }
    },
    [],
  );

  const clearCharacter = useCallback(() => {
    setCurrentCharacter(null);
    setError(null);
    notifications.show({
      title: "Character Cleared",
      message: "Current character has been removed",
      color: "blue",
    });
  }, []);

  const refreshCharacter = useCallback(async (): Promise<boolean> => {
    if (!currentCharacter) {
      setError("No character to refresh");
      return false;
    }

    return setCharacter(currentCharacter.username);
  }, [currentCharacter, setCharacter]);

  const value: CharacterContextType = {
    currentCharacter,
    isLoading,
    isInitializing,
    error,
    setCharacter,
    clearCharacter,
    refreshCharacter,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
}
