"use client";

import {
  Badge,
  Card,
  Collapse,
  Grid,
  Group,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { IconSeeding, IconStar } from "@tabler/icons-react";
import { useState } from "react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { getCropById } from "@/lib/farming-data-simple";
import { SectionHeader } from "./SectionHeader";

interface ExpBreakdownProps {
  result: CalculationResult;
  yieldStrategy: YieldStrategy;
}

interface CropExpData {
  cropId: string;
  name: string;
  quantity: number;
  plantingExp: number;
  checkHealthExp: number;
  harvestExp: number;
  totalHarvests: number;
  totalPlantingExp: number;
  totalCheckHealthExp: number;
  totalHarvestExp: number;
  totalExp: number;
}

export function ExpBreakdown({ result, yieldStrategy }: ExpBreakdownProps) {
  const [opened, setOpened] = useState(true);

  // Calculate experience for each crop
  const cropExpData: CropExpData[] = [];
  let totalPlantingExp = 0;
  let totalCheckHealthExp = 0;
  let totalHarvestingExp = 0;

  for (const [cropId, requirement] of Object.entries(result.requirements)) {
    const cropData = getCropById(cropId);
    if (!cropData || requirement.patches === 0) continue;

    const quantity = requirement.patches;

    // Use the actual calculated total yield from the requirement, based on yield strategy
    const totalHarvests = requirement.totalYield[yieldStrategy];

    const plantingExp = cropData.expBreakdown?.planting || 0;
    const checkHealthExp = cropData.expBreakdown?.checkHealth || 0;
    const harvestExp = cropData.expBreakdown?.harvest || 0;

    const totalPlantingExpForCrop = plantingExp * quantity;
    const totalCheckHealthExpForCrop = checkHealthExp * quantity;
    const totalHarvestExpForCrop = harvestExp * totalHarvests;
    const totalExp =
      totalPlantingExpForCrop +
      totalCheckHealthExpForCrop +
      totalHarvestExpForCrop;

    cropExpData.push({
      cropId,
      name: cropData.name,
      quantity,
      plantingExp,
      checkHealthExp,
      harvestExp,
      totalHarvests: Math.round(totalHarvests),
      totalPlantingExp: totalPlantingExpForCrop,
      totalCheckHealthExp: totalCheckHealthExpForCrop,
      totalHarvestExp: totalHarvestExpForCrop,
      totalExp,
    });

    totalPlantingExp += totalPlantingExpForCrop;
    totalCheckHealthExp += totalCheckHealthExpForCrop;
    totalHarvestingExp += totalHarvestExpForCrop;
  }

  // Calculate the totals (keep raw values for accuracy)
  const grandTotal =
    totalPlantingExp + totalCheckHealthExp + totalHarvestingExp;

  // Sort by total exp descending
  cropExpData.sort((a, b) => b.totalExp - a.totalExp);

  // Create the badge content for the header
  const rightContent = (
    <Badge color="green" variant="light">
      <NumberFormatter value={Math.floor(grandTotal)} thousandSeparator="," />{" "}
      XP
    </Badge>
  );

  return (
    <Stack gap="xs">
      <SectionHeader
        title="Experience Breakdown"
        expanded={opened}
        onToggle={() => setOpened(!opened)}
        rightContent={rightContent}
        gap="sm"
      />

      <Collapse in={opened}>
        <Stack gap="md" mt="md">
          {/* Summary Cards */}
          <Grid>
            <Grid.Col span={4}>
              <Card bg="var(--mantine-color-blue-0)" p="sm" radius="sm">
                <Group gap="xs">
                  <IconSeeding
                    size={16}
                    style={{ color: "var(--mantine-color-blue-6)" }}
                  />
                  <Text size="sm" fw={500} c="blue.6">
                    Planting
                  </Text>
                </Group>
                <Text size="lg" fw={600} c="blue.7">
                  <NumberFormatter
                    value={Math.floor(totalPlantingExp)}
                    thousandSeparator=","
                  />
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={4}>
              <Card bg="var(--mantine-color-green-0)" p="sm" radius="sm">
                <Group gap="xs">
                  <IconStar
                    size={16}
                    style={{ color: "var(--mantine-color-green-6)" }}
                  />
                  <Text size="sm" fw={500} c="green.6">
                    Harvesting
                  </Text>
                </Group>
                <Text size="lg" fw={600} c="green.7">
                  <NumberFormatter
                    value={Math.floor(totalHarvestingExp)}
                    thousandSeparator=","
                  />
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={4}>
              <Card bg="var(--mantine-color-yellow-0)" p="sm" radius="sm">
                <Group gap="xs">
                  <IconStar
                    size={16}
                    style={{ color: "var(--mantine-color-yellow-6)" }}
                  />
                  <Text size="sm" fw={500} c="yellow.6">
                    Total XP
                  </Text>
                </Group>
                <Text size="lg" fw={600} c="yellow.7">
                  <NumberFormatter
                    value={Math.floor(grandTotal)}
                    thousandSeparator=","
                  />
                </Text>
              </Card>
            </Grid.Col>
          </Grid>

          <Text size="sm" c="dimmed" mb="md">
            Experience calculations based on {yieldStrategy} yield expectations.
            Total XP includes planting, checking health, and harvesting
            experience.
          </Text>

          {/* Per-Crop Breakdown */}
          <Stack gap="xs">
            {cropExpData.map((crop) => (
              <Card
                key={crop.cropId}
                bg="var(--mantine-color-gray-0)"
                p="sm"
                radius="sm"
              >
                <Group justify="space-between" mb="xs">
                  <Group gap="sm">
                    <Text fw={500} c="var(--mantine-color-text)">
                      {crop.name}
                    </Text>
                    <Badge size="sm" color="gray" variant="light">
                      {crop.quantity} patches
                    </Badge>
                  </Group>
                  <Badge color="yellow" variant="light">
                    <NumberFormatter
                      value={Math.floor(crop.totalExp)}
                      thousandSeparator=","
                    />{" "}
                    XP
                  </Badge>
                </Group>

                <Grid>
                  <Grid.Col span={3}>
                    <Text size="xs" c="dimmed">
                      Planting
                    </Text>
                    <Text size="sm" fw={500} c="blue.6">
                      {crop.plantingExp} × {crop.quantity} ={" "}
                      <NumberFormatter
                        value={Math.floor(crop.totalPlantingExp)}
                        thousandSeparator=","
                      />
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Text size="xs" c="dimmed">
                      Checking Health
                    </Text>
                    {crop.checkHealthExp > 0 ? (
                      <Text size="sm" fw={500} c="orange.6">
                        {crop.checkHealthExp} × {crop.quantity} ={" "}
                        <NumberFormatter
                          value={Math.floor(crop.totalCheckHealthExp)}
                          thousandSeparator=","
                        />
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        —
                      </Text>
                    )}
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Text size="xs" c="dimmed">
                      Harvesting
                    </Text>
                    <Text size="sm" fw={500} c="green.6">
                      {crop.harvestExp} × {crop.totalHarvests} ={" "}
                      <NumberFormatter
                        value={Math.floor(crop.totalHarvestExp)}
                        thousandSeparator=","
                      />
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Text size="xs" c="dimmed">
                      Expected Harvests
                    </Text>
                    <Text size="sm" fw={500} c="var(--mantine-color-text)">
                      {crop.totalHarvests} total
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>
            ))}
          </Stack>

          {cropExpData.length === 0 && (
            <Text c="dimmed" ta="center" py="md">
              No experience data available for selected crops
            </Text>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
}
