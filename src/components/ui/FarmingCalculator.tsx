"use client";

import { Container, Grid, Stack, Text, Title } from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import {
  type CalculationResult,
  calculateDependencies,
  type YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { CalculatorInputs } from "./CalculatorInputs";
import { CalculatorResults } from "./CalculatorResults";

type CropOption = {
  value: string;
  label: string;
  level: number;
  growthTime: number;
};

const CROP_OPTIONS: CropOption[] = [
  // Allotment crops
  { value: "potato", label: "Potato", level: 1, growthTime: 80 },
  { value: "onion", label: "Onion", level: 5, growthTime: 80 },
  { value: "cabbage", label: "Cabbage", level: 7, growthTime: 80 },
  { value: "tomato", label: "Tomato", level: 12, growthTime: 80 },
  { value: "sweetcorn", label: "Sweetcorn", level: 20, growthTime: 80 },
  { value: "strawberry", label: "Strawberry", level: 31, growthTime: 80 },
  { value: "watermelon", label: "Watermelon", level: 47, growthTime: 80 },
  { value: "snape_grass", label: "Snape Grass", level: 61, growthTime: 80 },
  // Flower crops
  { value: "marigold", label: "Marigold", level: 2, growthTime: 20 },
  { value: "rosemary", label: "Rosemary", level: 11, growthTime: 20 },
  { value: "nasturtium", label: "Nasturtium", level: 24, growthTime: 20 },
  { value: "woad", label: "Woad", level: 25, growthTime: 20 },
  { value: "limpwurt", label: "Limpwurt Root", level: 26, growthTime: 20 },
  { value: "white_lily", label: "White Lily", level: 58, growthTime: 20 },
  // Hops crops
  { value: "barley", label: "Barley", level: 3, growthTime: 40 },
  { value: "hammerstone", label: "Hammerstone", level: 4, growthTime: 40 },
  { value: "asgarnian", label: "Asgarnian", level: 8, growthTime: 50 },
  { value: "jute", label: "Jute", level: 13, growthTime: 50 },
  { value: "yanillian", label: "Yanillian", level: 16, growthTime: 60 },
  { value: "krandorian", label: "Krandorian", level: 21, growthTime: 70 },
  { value: "wildblood", label: "Wildblood", level: 28, growthTime: 80 },
];

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
  const [startingResources, setStartingResources] = useState<
    Record<string, number>
  >({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    breakdown: true,  // CropRequirements section
    growth: true,     // GrowthBreakdown section
    yields: false,    // ExpectedYields section - keep collapsed by default as requested
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

  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;

    try {
      const calculationResult = calculateDependencies(
        targetCrop,
        quantity,
        farmingLevel,
        compostType as "none" | "compost" | "supercompost" | "ultracompost",
        startingResources,
        yieldStrategy,
      );
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
    let current = crop;

    // Build the dependency chain (excluding the target crop itself)
    while (current) {
      const cropData = {
        tomato: "cabbage",
        cabbage: "onion",
        onion: "potato",
      }[current];

      if (cropData) {
        chain.unshift(cropData);
        current = cropData;
      } else {
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
