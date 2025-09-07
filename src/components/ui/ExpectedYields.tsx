"use client";

import { Badge, Collapse, Group, Paper, Stack, Text } from "@mantine/core";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { SectionHeader } from "./SectionHeader";

interface ExpectedYieldsProps {
  result: CalculationResult;
  yieldStrategy: YieldStrategy;
  farmingLevel: number;
  compostType: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  formatCompostText: (compostType: string) => string;
}

export function ExpectedYields({
  result,
  yieldStrategy,
  farmingLevel,
  compostType,
  expandedSections,
  toggleSection,
  formatCompostText,
}: ExpectedYieldsProps) {
  return (
    <Stack gap="xs">
      <SectionHeader
        title="Expected Yields"
        expanded={expandedSections.yields}
        onToggle={() => toggleSection("yields")}
        gap="xs"
      />

      <Collapse in={expandedSections.yields}>
        <Stack gap="xs">
          {Object.entries(result.requirements).map(([crop, requirement]) => (
            <Paper key={crop} p="md" bg="gold.0" style={{ borderRadius: 6 }}>
              <Group justify="space-between" align="flex-start">
                <Text size="sm" tt="capitalize" fw={500}>
                  {crop}
                </Text>
                <Group gap="md" align="center">
                  <Stack gap={2} align="center">
                    <Text size="xs" c="dimmed" fw={500}>
                      Min
                    </Text>
                    <Badge
                      variant={yieldStrategy === "min" ? "filled" : "outline"}
                      color={yieldStrategy === "min" ? "red.8" : "red.8"}
                      size="sm"
                      c={yieldStrategy === "min" ? "white" : "red.8"}
                    >
                      {requirement.perPatchYield.min}
                    </Badge>
                  </Stack>
                  <Stack gap={2} align="center">
                    <Text size="xs" c="dimmed" fw={500}>
                      Avg
                    </Text>
                    <Badge
                      variant={
                        yieldStrategy === "average" ? "filled" : "outline"
                      }
                      color={
                        yieldStrategy === "average" ? "yellow.8" : "yellow.8"
                      }
                      size="sm"
                      c={yieldStrategy === "average" ? "white" : "yellow.8"}
                    >
                      {requirement.perPatchYield.average.toFixed(1)}
                    </Badge>
                  </Stack>
                  <Stack gap={2} align="center">
                    <Text size="xs" c="dimmed" fw={500}>
                      Max
                    </Text>
                    <Badge
                      variant={yieldStrategy === "max" ? "filled" : "outline"}
                      color={yieldStrategy === "max" ? "green.8" : "green.8"}
                      size="sm"
                      c={yieldStrategy === "max" ? "white" : "green.8"}
                    >
                      {requirement.perPatchYield.max}
                    </Badge>
                  </Stack>
                </Group>
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                Per patch yield at level {farmingLevel}{" "}
                {formatCompostText(compostType)}
              </Text>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </Stack>
  );
}
