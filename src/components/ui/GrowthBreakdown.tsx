"use client";

import { ActionIcon, Badge, Collapse, Group, Stack, Text } from "@mantine/core";
import {
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconShield,
} from "@tabler/icons-react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";

interface GrowthBreakdownProps {
  result: CalculationResult;
  startingResources: Record<string, number>;
  yieldStrategy: YieldStrategy;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

export function GrowthBreakdown({
  result,
  startingResources,
  yieldStrategy,
  expandedSections,
  toggleSection,
}: GrowthBreakdownProps) {
  return (
    <Stack gap="xs">
      <Group gap="xs" justify="space-between">
        <Text fw={500} c="sage.7">
          Growth Breakdown
        </Text>
        <ActionIcon variant="subtle" onClick={() => toggleSection("growth")}>
          {expandedSections.growth ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </ActionIcon>
      </Group>

      <Collapse in={expandedSections.growth}>
        <Stack gap="xs">
          {result.breakdown
            .slice()
            .reverse()
            .map((step, index) => {
              const starting = startingResources[step.crop] || 0;
              const patchesNeeded = step.patchesNeeded[yieldStrategy];
              const totalYield = step.totalYield[yieldStrategy];
              const isPurchasable = step.purchaseQuantity !== undefined;
              const reversedBreakdown = result.breakdown.slice().reverse();
              const isLastStep = index === reversedBreakdown.length - 1;

              // Show purchasable items even if patches needed is 0
              if (patchesNeeded === 0 && !isPurchasable) return null;

              return (
                <Stack key={`${step.crop}-${index}`} gap="xs" align="center">
                  <Group
                    gap="md"
                    p="md"
                    bg="white"
                    style={{
                      borderRadius: 8,
                      border: "1px solid var(--mantine-color-gray-2)",
                      width: "100%",
                    }}
                  >
                    <Badge variant="filled" color="sage" size="lg">
                      {result.breakdown.length - step.level}
                    </Badge>
                    <Stack gap="xs" flex={1}>
                      <Group gap="xs">
                        <Text fw={500} tt="capitalize">
                          {step.crop}
                        </Text>
                        {isPurchasable ? (
                          <Badge size="xs" variant="light" color="blue">
                            {step.purchaseQuantity} needed
                          </Badge>
                        ) : (
                          <>
                            <Badge size="xs" variant="light">
                              {patchesNeeded} patches
                            </Badge>
                            <Badge size="xs" variant="outline" c="dimmed">
                              {totalYield.toFixed(1)} total expected yield
                            </Badge>
                          </>
                        )}
                        {starting > 0 && (
                          <Badge size="xs" variant="outline" c="blue">
                            +{starting} units
                          </Badge>
                        )}
                      </Group>
                      <Group gap="xs">
                        <IconShield
                          size={14}
                          style={{ color: "var(--mantine-color-blue-6)" }}
                        />
                        <Text size="xs" c="dimmed">
                          {step.purpose}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>
                  {!isLastStep && (
                    <IconArrowUp
                      size={20}
                      style={{
                        color: "var(--mantine-color-sage-6)",
                        opacity: 0.7,
                      }}
                    />
                  )}
                </Stack>
              );
            })}
        </Stack>
      </Collapse>
    </Stack>
  );
}
