"use client";

import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconInfoCircle, IconLeaf, IconSeedling } from "@tabler/icons-react";
import type { YieldStrategy } from "@/lib/calculators/dependency-calculator";
import { getCropSelectData } from "@/lib/crop-options";
import type { CropOption } from "@/lib/crop-options";

// Get crop options from data files instead of hardcoded array
const CROP_SELECT_DATA = getCropSelectData();

const COMPOST_OPTIONS = [
  { value: "none", label: "No Compost", bonus: 0 },
  { value: "compost", label: "Compost", bonus: 1 },
  { value: "supercompost", label: "Supercompost", bonus: 2 },
  { value: "ultracompost", label: "Ultracompost", bonus: 3 },
];

const YIELD_STRATEGY_OPTIONS = [
  {
    value: "min" as YieldStrategy,
    label: "Conservative (Min Yield)",
    description: "Plan for worst-case yields",
  },
  {
    value: "average" as YieldStrategy,
    label: "Realistic (Average Yield)",
    description: "Plan using expected yields",
  },
  {
    value: "max" as YieldStrategy,
    label: "Optimistic (Max Yield)",
    description: "Plan for best-case yields",
  },
];

interface CalculatorInputsProps {
  targetCrop: string;
  setTargetCrop: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  farmingLevel: number;
  setFarmingLevel: (value: number) => void;
  compostType: string;
  setCompostType: (value: string) => void;
  yieldStrategy: YieldStrategy;
  setYieldStrategy: (value: YieldStrategy) => void;
  startingResources: Record<string, number>;
  updateStartingResource: (crop: string, amount: number) => void;
  error: string;
  selectedCrop: CropOption | undefined;
  getDependencyChain: (crop: string) => string[];
}

export function CalculatorInputs({
  targetCrop,
  setTargetCrop,
  quantity,
  setQuantity,
  farmingLevel,
  setFarmingLevel,
  compostType,
  setCompostType,
  yieldStrategy,
  setYieldStrategy,
  startingResources,
  updateStartingResource,
  error,
  selectedCrop,
  getDependencyChain,
}: CalculatorInputsProps) {
  return (
    <Card
      p="lg"
      radius="lg"
      style={{ border: "1px solid var(--mantine-color-gray-2)" }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <IconSeedling
            size={20}
            style={{ color: "var(--mantine-color-sage-6)" }}
          />
          <Title order={3} c="sage.7">
            Calculation Inputs
          </Title>
        </Group>

        <Select
          label="Target Crop"
          placeholder="Choose your target crop"
          data={CROP_SELECT_DATA}
          value={targetCrop}
          onChange={(value) => setTargetCrop(value || "")}
          searchable
        />

        <NumberInput
          label="Quantity Needed"
          placeholder="How many do you need?"
          value={quantity}
          onChange={(value) => setQuantity(Number(value) || 1)}
          min={1}
          max={1000}
        />

        <NumberInput
          label="Farming Level"
          placeholder="Your current farming level"
          value={farmingLevel}
          onChange={(value) => setFarmingLevel(Number(value) || 1)}
          min={1}
          max={99}
        />

        <Select
          label="Compost Type"
          placeholder="Select compost type"
          data={COMPOST_OPTIONS.map((compost) => ({
            value: compost.value,
            label: `${compost.label} (+${compost.bonus} yield)`,
          }))}
          value={compostType}
          onChange={(value) => setCompostType(value || "none")}
        />

        <Select
          label="Yield Strategy"
          placeholder="Select planning strategy"
          description="Choose your planning approach based on risk tolerance"
          data={YIELD_STRATEGY_OPTIONS.map((strategy) => ({
            value: strategy.value,
            label: strategy.label,
          }))}
          value={yieldStrategy}
          onChange={(value) =>
            setYieldStrategy((value as YieldStrategy) || "average")
          }
        />

        {/* Starting Resources */}
        {targetCrop && (
          <Card p="md" bg="gray.0" radius="md">
            <Stack gap="xs">
              <Group gap="xs">
                <IconLeaf size={16} />
                <Text size="sm" fw={500}>
                  Starting Dependency Resources
                </Text>
                <Tooltip label="Individual dependency crop units you already have (not patches). These are crops needed to protect your target crop. E.g., if you have 50 potatoes, enter 50">
                  <ActionIcon variant="subtle" size="xs">
                    <IconInfoCircle size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {getDependencyChain(targetCrop).map((crop) => (
                <NumberInput
                  key={crop}
                  label={`${crop.charAt(0).toUpperCase() + crop.slice(1)} (units)`}
                  placeholder="0"
                  size="xs"
                  value={startingResources[crop] || 0}
                  onChange={(value) =>
                    updateStartingResource(crop, Number(value) || 0)
                  }
                  min={0}
                  max={10000}
                />
              ))}
            </Stack>
          </Card>
        )}

        {error && (
          <Alert color="red" title="Calculation Error">
            {error}
          </Alert>
        )}

        {selectedCrop && farmingLevel < selectedCrop.level && (
          <Alert color="orange" title="Level Requirement">
            <Stack gap="sm">
              <Text>
                You need level {selectedCrop.level} farming to grow{" "}
                {selectedCrop.label}.
              </Text>
              <Button
                size="sm"
                variant="outline"
                color="orange"
                onClick={() => setFarmingLevel(selectedCrop.level)}
              >
                Set farming level to {selectedCrop.level}
              </Button>
            </Stack>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
