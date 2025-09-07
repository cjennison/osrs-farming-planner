"use client";

import {
  Alert,
  Anchor,
  Badge,
  Box,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";
import { getCropById } from "@/lib/farming-data-simple";
import { getCropConstants } from "@/lib/farming-data-utils";
import { SectionHeader } from "./SectionHeader";

interface VariableCropYieldFormulaProps {
  farmingLevel: number;
  targetCrop: string;
  magicSecateurs: boolean;
  farmingCape: boolean;
  attasSeed: boolean;
  kandarinDiary: "none" | "medium" | "hard" | "elite";
  kourendDiary: "none" | "medium" | "hard" | "elite";
  compostType: string;
}

export function VariableCropYieldFormula({
  farmingLevel,
  targetCrop,
  magicSecateurs,
  farmingCape,
  attasSeed,
  kandarinDiary,
  kourendDiary,
  compostType,
}: VariableCropYieldFormulaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get crop constants for the target crop
  const cropConstants = getCropConstants(targetCrop);
  const baseCtsLow = cropConstants.low;
  const baseCtsHigh = cropConstants.high;

  // Get display name for the crop
  const cropData = getCropById(targetCrop);
  const displayName = cropData?.name || targetCrop;

  // Calculate boost multipliers step by step
  const itemBonus = (magicSecateurs ? 0.1 : 0) + (farmingCape ? 0.05 : 0);

  // Diary bonus (only for herbs and specific patches)
  let diaryBonus = 0;
  if (targetCrop.includes("herb")) {
    if (kandarinDiary === "medium") diaryBonus = 10;
    else if (kandarinDiary === "hard") diaryBonus = 17;
    else if (kandarinDiary === "elite") diaryBonus = 25;

    // Kourend diary bonus
    if (kourendDiary === "hard") diaryBonus = Math.max(diaryBonus, 10);
  }

  const attasBonus = attasSeed ? 0.05 : 0;

  // Apply boosts step by step to show the progression
  const itemBoostedCtsLow = Math.floor(baseCtsLow * (1 + itemBonus));
  const itemBoostedCtsHigh = Math.floor(baseCtsHigh * (1 + itemBonus));

  const diaryBoostedCtsLow = itemBoostedCtsLow + diaryBonus;
  const diaryBoostedCtsHigh = itemBoostedCtsHigh + diaryBonus;

  const finalCtsLow = Math.floor(diaryBoostedCtsLow * (1 + attasBonus));
  const finalCtsHigh = Math.floor(diaryBoostedCtsHigh * (1 + attasBonus));

  // Calculate the final chance to save using the USER'S farming level
  const numerator =
    1 +
    Math.floor(
      (finalCtsLow * (99 - farmingLevel)) / 98 +
        (finalCtsHigh * (farmingLevel - 1)) / 98 +
        0.5,
    );
  const chanceToSave = numerator / 256;
  const chanceToSavePercent = (chanceToSave * 100).toFixed(1);

  // Calculate harvest lives based on compost type
  const getHarvestLives = (compost: string): number => {
    const baseLives = 3;
    const compostBonusMap: Record<string, number> = {
      none: 0,
      compost: 1,
      supercompost: 2,
      ultracompost: 3,
    };
    const compostBonus = compostBonusMap[compost] || 0;
    return baseLives + compostBonus;
  };

  const harvestLives = getHarvestLives(compostType);
  const expectedHarvest = harvestLives / (1 - chanceToSave);

  // Create header content with tooltip and badge
  const rightContent = (
    <>
      <Tooltip label="Click to explore the OSRS farming mechanics">
        <IconInfoCircle
          size={16}
          style={{ color: "var(--mantine-color-gray-6)" }}
        />
      </Tooltip>
      <Badge variant="light" color="blue">
        {chanceToSavePercent}% CHANCE TO SAVE
      </Badge>
    </>
  );

  return (
    <Stack gap="xs">
      <SectionHeader
        title="Variable Crop Yield Formula"
        expanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        rightContent={rightContent}
        gap="xs"
      />

      <Collapse in={isExpanded}>
        <Stack gap="md" mt="md">
          <Alert color="blue" title="Interactive OSRS Formula">
            <Text size="sm">
              This formula calculates your chance to save a "harvest life" when
              farming variable yield crops. Hover over any variable to learn
              what it represents!
            </Text>
          </Alert>

          {/* Formula Display */}
          <Box
            p="md"
            style={{
              backgroundColor: "var(--mantine-color-gray-0)",
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            <Text fw={600} mb="sm">
              Chance to Save Formula:
            </Text>

            <Box
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              <Text>Chance to Save = (1 + ⌊</Text>

              <Tooltip
                label={`CTSlow: Base chance constant for ${displayName} at level 1 farming`}
              >
                <Badge variant="light" color="blue" style={{ cursor: "help" }}>
                  {finalCtsLow}
                </Badge>
              </Tooltip>

              <Text>×</Text>

              <Tooltip label="(99 - F): Higher levels get less benefit from CTSlow">
                <Badge variant="light" color="green" style={{ cursor: "help" }}>
                  ({99 - farmingLevel})
                </Badge>
              </Tooltip>

              <Text>/98 +</Text>

              <Tooltip
                label={`CTShigh: Base chance constant for ${displayName} at level 99 farming`}
              >
                <Badge variant="light" color="blue" style={{ cursor: "help" }}>
                  {finalCtsHigh}
                </Badge>
              </Tooltip>

              <Text>×</Text>

              <Tooltip label="(F - 1): Higher levels get more benefit from CTShigh">
                <Badge variant="light" color="green" style={{ cursor: "help" }}>
                  ({farmingLevel - 1})
                </Badge>
              </Tooltip>

              <Text>/98 + 0.5⌋) / 256</Text>
            </Box>

            {/* Modifier Breakdown */}
            {(magicSecateurs || farmingCape || attasSeed || diaryBonus > 0) && (
              <Box
                mt="md"
                p="sm"
                style={{
                  backgroundColor: "var(--mantine-color-green-0)",
                  borderRadius: "4px",
                }}
              >
                <Text size="sm" fw={600} mb="xs">
                  Modifier Effects on CTS Values:
                </Text>
                <Stack gap="xs">
                  <Text size="xs">
                    Base CTS: {baseCtsLow} (low) / {baseCtsHigh} (high)
                  </Text>
                  {(magicSecateurs || farmingCape) && (
                    <Text size="xs">
                      After item bonuses (+{Math.round(itemBonus * 100)}%):{" "}
                      {itemBoostedCtsLow} / {itemBoostedCtsHigh}
                    </Text>
                  )}
                  {diaryBonus > 0 && (
                    <Text size="xs">
                      After diary bonus (+{diaryBonus}): {diaryBoostedCtsLow} /{" "}
                      {diaryBoostedCtsHigh}
                    </Text>
                  )}
                  {attasSeed && (
                    <Text size="xs">
                      Final CTS (+{Math.round(attasBonus * 100)}%):{" "}
                      {finalCtsLow} / {finalCtsHigh}
                    </Text>
                  )}
                  <Text size="xs" fw={600} color="green">
                    Total CTS increase: +{finalCtsLow - baseCtsLow} / +
                    {finalCtsHigh - baseCtsHigh}
                  </Text>
                </Stack>
              </Box>
            )}

            <Box
              mt="md"
              p="sm"
              style={{
                backgroundColor: "var(--mantine-color-blue-0)",
                borderRadius: "4px",
              }}
            >
              <Text size="sm" fw={600}>
                Calculation:
              </Text>
              <Text size="sm">
                = (1 + ⌊{finalCtsLow} × {99 - farmingLevel}/98 + {finalCtsHigh}{" "}
                × {farmingLevel - 1}/98 + 0.5⌋) / 256
              </Text>
              <Text size="sm">
                = (1 + ⌊{((finalCtsLow * (99 - farmingLevel)) / 98).toFixed(2)}{" "}
                + {((finalCtsHigh * (farmingLevel - 1)) / 98).toFixed(2)} +
                0.5⌋) / 256
              </Text>
              <Text size="sm">
                = (1 +{" "}
                {Math.floor(
                  (finalCtsLow * (99 - farmingLevel)) / 98 +
                    (finalCtsHigh * (farmingLevel - 1)) / 98 +
                    0.5,
                )}
                ) / 256
              </Text>
              <Text size="sm" fw={600} color="blue">
                = {numerator}/256 = {chanceToSavePercent}%
              </Text>
            </Box>
          </Box>

          {/* Boost Breakdown */}
          {(magicSecateurs || farmingCape || attasSeed || diaryBonus > 0) && (
            <Card
              p="sm"
              style={{ backgroundColor: "var(--mantine-color-green-0)" }}
            >
              <Text size="sm" fw={600} mb="xs">
                Active Boosts:
              </Text>
              <Stack gap="xs">
                {magicSecateurs && (
                  <Text size="xs">🔧 Magic Secateurs: +10% to CTS values</Text>
                )}
                {farmingCape && (
                  <Text size="xs">
                    🎯 Farming Cape: +5% to CTS values (herbs only)
                  </Text>
                )}
                {attasSeed && (
                  <Text size="xs">🌱 Attas Seed: +5% to CTS values</Text>
                )}
                {diaryBonus > 0 && (
                  <Text size="xs">
                    📜 Diary Bonus: +{diaryBonus} to CTS values
                  </Text>
                )}
              </Stack>
            </Card>
          )}

          {/* Expected Yield */}
          <Card
            p="sm"
            style={{ backgroundColor: "var(--mantine-color-orange-0)" }}
          >
            <Text size="sm" fw={600}>
              Expected Harvest:
            </Text>
            <Text size="sm">
              With {harvestLives} harvest lives ({compostType || "none"}), you
              can expect approximately{" "}
              <Text component="span" fw={600} color="orange">
                {expectedHarvest.toFixed(1)} items
              </Text>{" "}
              per patch on average.
            </Text>
          </Card>

          {/* Citation */}
          <Alert color="gray" variant="light">
            <Group gap="xs">
              <IconInfoCircle size={16} />
              <Text size="xs">
                Formula and mechanics sourced from the{" "}
                <Anchor
                  href="https://oldschool.runescape.wiki/w/Farming#Variable_crop_yield"
                  target="_blank"
                  size="xs"
                >
                  Official OSRS Wiki - Variable Crop Yield
                </Anchor>
              </Text>
            </Group>
          </Alert>
        </Stack>
      </Collapse>
    </Stack>
  );
}
