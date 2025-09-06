"use client";

import {
  Card,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCalculator, IconTrendingUp } from "@tabler/icons-react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { CropRequirements } from "./CropRequirements";
import { ExpectedYields } from "./ExpectedYields";
import { GrowthBreakdown } from "./GrowthBreakdown";
import { InputsBreakdown } from "./InputsBreakdown";
import { ExpBreakdown } from "./ExpBreakdown";

interface CalculatorResultsProps {
  result: CalculationResult | null;
  startingResources: Record<string, number>;
  yieldStrategy: YieldStrategy;
  farmingLevel: number;
  compostType: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  formatTime: (minutes: number) => string;
  formatCompostText: (compostType: string) => string;
  selectedCrop:
    | { value: string; label: string; level: number; growthTime: number }
    | undefined;
  targetCrop: string;
}

export function CalculatorResults({
  result,
  startingResources,
  yieldStrategy,
  farmingLevel,
  compostType,
  expandedSections,
  toggleSection,
  formatTime,
  formatCompostText,
  selectedCrop,
  targetCrop,
}: CalculatorResultsProps) {
  if (!result) {
    return (
      <Card
        p="xl"
        radius="lg"
        style={{ border: "1px dashed var(--mantine-color-gray-3)" }}
      >
        <Stack gap="md" align="center" ta="center">
          <IconCalculator
            size={48}
            style={{ color: "var(--mantine-color-gray-4)" }}
          />
          <Title order={3} c="gray.6">
            Ready to Calculate
          </Title>
          <Text c="dimmed">
            {!targetCrop
              ? "Select a target crop to begin"
              : selectedCrop && farmingLevel < selectedCrop.level
                ? `Requires level ${selectedCrop.level} farming`
                : "Configure your inputs to see results"}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Summary Card */}
      <Card
        p="lg"
        radius="lg"
        style={{ border: "1px solid var(--mantine-color-sage-2)" }}
      >
        <Stack gap="md">
          <Group gap="xs">
            <IconTrendingUp
              size={20}
              style={{ color: "var(--mantine-color-sage-6)" }}
            />
            <Title order={3} c="sage.7">
              Calculation Results
            </Title>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <Paper p="md" bg="sage.0" radius="md">
                <Stack gap="xs" align="center">
                  <Text size="sm" c="dimmed">
                    Total Patches
                  </Text>
                  <Text size="xl" fw={700} c="sage.7">
                    {result.summary.totalPatches}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper p="md" bg="forest.0" radius="md">
                <Stack gap="xs" align="center">
                  <Text size="sm" c="dimmed">
                    Est. Time
                  </Text>
                  <Text size="xl" fw={700} c="forest.7">
                    {formatTime(result.summary.estimatedTime)}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Requirements Breakdown */}
          <Divider />

          <CropRequirements
            result={result}
            startingResources={startingResources}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Growth Breakdown */}
          <Divider />

          <GrowthBreakdown
            result={result}
            startingResources={startingResources}
            yieldStrategy={yieldStrategy}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Yield Information */}
          <Divider />

          <ExpectedYields
            result={result}
            yieldStrategy={yieldStrategy}
            farmingLevel={farmingLevel}
            compostType={compostType}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            formatCompostText={formatCompostText}
          />

          {/* Inputs Breakdown */}
          <Divider />

          <InputsBreakdown
            result={result}
            yieldStrategy={yieldStrategy}
          />

          {/* Experience Breakdown */}
          <Divider />

          <ExpBreakdown
            result={result}
            yieldStrategy={yieldStrategy}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
