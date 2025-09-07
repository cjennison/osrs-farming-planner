"use client";

import { Container, Grid, Stack, Text, Title } from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import {
  type CalculationMode,
  type CalculationResult,
  calculateDependencies,
  calculateLevelDependencies,
  type KandarinDiaryLevel,
  type KourendDiaryLevel,
  type YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { getCropOptions } from "@/lib/crop-options";
import { getCropById } from "@/lib/farming-data-simple";
import { CalculatorInputs } from "./CalculatorInputs";
import { CalculatorResults } from "./CalculatorResults";

// Get crop options from data files instead of hardcoded array
const CROP_OPTIONS = getCropOptions();

const formatCompostText = (compostType: string): string => {
  switch (compostType) {
    case "none":
      return "with no compost";
    case "compost":
      return "with compost";
    case "supercompost":
      return "with supercompost";
    case "ultracompost":
      return "with ultracompost";
    default:
      return `with ${compostType}`;
  }
};

export function FarmingCalculator() {
  const [targetCrop, setTargetCrop] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [farmingLevel, setFarmingLevel] = useState<number>(1);
  const [compostType, setCompostType] = useState<string>("none");
  const [yieldStrategy, setYieldStrategy] = useState<YieldStrategy>("average");
  const [magicSecateurs, setMagicSecateurs] = useState<boolean>(false);
  const [farmingCape, setFarmingCape] = useState<boolean>(false);
  const [attasSeed, setAttasSeed] = useState<boolean>(false);
  const [kandarinDiary, setKandarinDiary] =
    useState<KandarinDiaryLevel>("none");
  const [kourendDiary, setKourendDiary] = useState<KourendDiaryLevel>("none");

  // New state for level-based calculation
  const [calculationMode, setCalculationMode] =
    useState<CalculationMode>("quantity");
  const [targetLevel, setTargetLevel] = useState<number>(30);
  const [startingLevel, setStartingLevel] = useState<number>(1);

  const [startingResources, setStartingResources] = useState<
    Record<string, number>
  >({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    breakdown: true, // CropRequirements section
    growth: true, // GrowthBreakdown section
    yields: false, // ExpectedYields section - keep collapsed by default as requested
  });

  const selectedCrop = CROP_OPTIONS.find((crop) => crop.value === targetCrop);
  const canCalculate =
    targetCrop && quantity > 0 && farmingLevel >= (selectedCrop?.level || 1);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handlers for mutually exclusive diary bonuses
  const handleKandarinDiaryChange = (value: KandarinDiaryLevel) => {
    setKandarinDiary(value);
    // If setting Kandarin diary to something other than "none",
    // reset Kourend diary to "none"
    if (value !== "none") {
      setKourendDiary("none");
    }
  };

  const handleKourendDiaryChange = (value: KourendDiaryLevel) => {
    setKourendDiary(value);
    // If setting Kourend diary to something other than "none",
    // reset Kandarin diary to "none"
    if (value !== "none") {
      setKandarinDiary("none");
    }
  };

  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;

    try {
      let calculationResult: CalculationResult;

      if (calculationMode === "level") {
        // Use level-based calculation
        calculationResult = calculateLevelDependencies(
          targetCrop,
          targetLevel,
          startingLevel,
          compostType as "none" | "compost" | "supercompost" | "ultracompost",
          startingResources,
          yieldStrategy,
          magicSecateurs,
          farmingCape,
          attasSeed,
          kandarinDiary,
          kourendDiary,
        );
      } else {
        // Use quantity-based calculation (existing)
        calculationResult = calculateDependencies(
          targetCrop,
          quantity,
          farmingLevel,
          compostType as "none" | "compost" | "supercompost" | "ultracompost",
          startingResources,
          yieldStrategy,
          magicSecateurs,
          farmingCape,
          attasSeed,
          kandarinDiary,
          kourendDiary,
        );
      }

      setResult(calculationResult);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
      setResult(null);
    }
  }, [
    targetCrop,
    quantity,
    farmingLevel,
    compostType,
    startingResources,
    yieldStrategy,
    magicSecateurs,
    farmingCape,
    attasSeed,
    kandarinDiary,
    kourendDiary,
    calculationMode,
    startingLevel,
    targetLevel,
    canCalculate,
  ]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (canCalculate) {
      handleCalculate();
    } else {
      setResult(null);
      setError("");
    }
  }, [canCalculate, handleCalculate]);

  const updateStartingResource = (crop: string, amount: number) => {
    setStartingResources((prev) => ({
      ...prev,
      [crop]: amount || 0,
    }));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDependencyChain = (crop: string): string[] => {
    const chain: string[] = [];
    const visited = new Set<string>();
    let current = crop;

    // Build the dependency chain using actual crop data
    while (current && !visited.has(current)) {
      visited.add(current);

      try {
        const cropData = getCropById(current);
        if (cropData?.protection?.type === "crop") {
          const dependencyCrop = cropData.protection.item;
          if (dependencyCrop && !visited.has(dependencyCrop)) {
            chain.unshift(dependencyCrop);
            current = dependencyCrop;
          } else {
            break;
          }
        } else {
          // No crop dependency (might be item dependency or no protection)
          break;
        }
      } catch (_error) {
        // If we can't get crop data, break the chain
        break;
      }
    }

    return chain;
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="md" align="center" ta="center">
          <IconCalculator
            size={48}
            style={{ color: "var(--mantine-color-sage-6)" }}
          />
          <Title order={1} c="sage.7">
            Dependency Calculator
          </Title>
          <Text c="dimmed" maw={600}>
            Calculate exact crop requirements for OSRS farming chains. Account
            for protection, yield bonuses, and existing resources.
          </Text>
        </Stack>

        <Grid>
          {/* Input Panel */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <CalculatorInputs
              targetCrop={targetCrop}
              setTargetCrop={setTargetCrop}
              quantity={quantity}
              setQuantity={setQuantity}
              farmingLevel={farmingLevel}
              setFarmingLevel={setFarmingLevel}
              compostType={compostType}
              setCompostType={setCompostType}
              yieldStrategy={yieldStrategy}
              setYieldStrategy={setYieldStrategy}
              startingResources={startingResources}
              updateStartingResource={updateStartingResource}
              error={error}
              selectedCrop={selectedCrop}
              getDependencyChain={getDependencyChain}
              magicSecateurs={magicSecateurs}
              setMagicSecateurs={setMagicSecateurs}
              farmingCape={farmingCape}
              setFarmingCape={setFarmingCape}
              attasSeed={attasSeed}
              setAttasSeed={setAttasSeed}
              kandarinDiary={kandarinDiary}
              setKandarinDiary={handleKandarinDiaryChange}
              kourendDiary={kourendDiary}
              setKourendDiary={handleKourendDiaryChange}
              calculationMode={calculationMode}
              setCalculationMode={setCalculationMode}
              targetLevel={targetLevel}
              setTargetLevel={setTargetLevel}
              startingLevel={startingLevel}
              setStartingLevel={setStartingLevel}
            />
          </Grid.Col>

          {/* Results Panel */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <CalculatorResults
              result={result}
              startingResources={startingResources}
              yieldStrategy={yieldStrategy}
              farmingLevel={farmingLevel}
              compostType={compostType}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              formatTime={formatTime}
              formatCompostText={formatCompostText}
              selectedCrop={selectedCrop}
              targetCrop={targetCrop}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
