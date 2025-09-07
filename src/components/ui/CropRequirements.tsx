"use client";

import { Badge, Collapse, Group, Stack, Text } from "@mantine/core";
import type { CalculationResult } from "@/lib/calculators/dependency-calculator";
import { SectionHeader } from "./SectionHeader";

interface CropRequirementsProps {
  result: CalculationResult;
  startingResources: Record<string, number>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

export function CropRequirements({
  result,
  startingResources,
  expandedSections,
  toggleSection,
}: CropRequirementsProps) {
  return (
    <Stack gap="xs">
      <SectionHeader
        title="Crop Requirements"
        expanded={expandedSections.breakdown}
        onToggle={() => toggleSection("breakdown")}
        gap="xs"
      />

      <Collapse in={expandedSections.breakdown}>
        <Stack gap="xs">
          {Object.entries(result.requirements).map(([crop, requirement]) => {
            const starting = startingResources[crop] || 0;
            const patchesNeeded = requirement.patches;

            return (
              <Group
                key={crop}
                justify="space-between"
                p="xs"
                bg="gray.0"
                style={{ borderRadius: 4 }}
              >
                <Group gap="xs">
                  <Text size="sm" tt="capitalize">
                    {crop}
                  </Text>
                  {requirement.paymentInfo && (
                    <Badge size="xs" variant="light" color="orange">
                      {requirement.paymentInfo.containerDescription} ×{" "}
                      {requirement.paymentInfo.containerQuantity}
                    </Badge>
                  )}
                  <Badge size="xs" variant="light" c="dimmed">
                    {requirement.reason}
                  </Badge>
                </Group>
                <Group gap="xs">
                  {starting > 0 && (
                    <Text size="xs" c="dimmed">
                      {starting} units
                    </Text>
                  )}
                  <Badge
                    variant={patchesNeeded > 0 ? "filled" : "light"}
                    color={patchesNeeded > 0 ? "sage" : "gray"}
                  >
                    {patchesNeeded > 0 ? `${patchesNeeded} patches` : "Covered"}
                  </Badge>
                </Group>
              </Group>
            );
          })}
        </Stack>
      </Collapse>
    </Stack>
  );
}
