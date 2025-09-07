"use client";

import {
  Badge,
  Box,
  Card,
  Collapse,
  Grid,
  Group,
  NumberFormatter,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconSeeding, IconStar } from "@tabler/icons-react";
import { useState } from "react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { getCropById } from "@/lib/farming-data-simple";

interface ExpBreakdownProps {
  result: CalculationResult;
  yieldStrategy: YieldStrategy;
}

interface CropExpData {
  cropId: string;
  name: string;
  quantity: number;
  plantingExp: number;
  harvestExp: number;
  totalHarvests: number;
  totalPlantingExp: number;
  totalHarvestExp: number;
  totalExp: number;
}

export function ExpBreakdown({ result, yieldStrategy }: ExpBreakdownProps) {
  const [opened, setOpened] = useState(true);

  // Calculate experience for each crop
  const cropExpData: CropExpData[] = [];
  let totalPlantingExp = 0;
  let totalHarvestingExp = 0;

  for (const [cropId, requirement] of Object.entries(result.requirements)) {
    const cropData = getCropById(cropId);
    if (!cropData || requirement.patches === 0) continue;

    const quantity = requirement.patches;

    // Use the actual calculated total yield from the requirement, based on yield strategy
    const totalHarvests = requirement.totalYield[yieldStrategy];

    const plantingExp = cropData.expBreakdown?.planting || 0;
    const harvestExp = cropData.expBreakdown?.harvest || 0;

    const totalPlantingExpForCrop = plantingExp * quantity;
    const totalHarvestExpForCrop = harvestExp * totalHarvests;
    const totalExp = totalPlantingExpForCrop + totalHarvestExpForCrop;

    cropExpData.push({
      cropId,
      name: cropData.name,
      quantity,
      plantingExp,
      harvestExp,
      totalHarvests: Math.round(totalHarvests),
      totalPlantingExp: totalPlantingExpForCrop,
      totalHarvestExp: totalHarvestExpForCrop,
      totalExp,
    });

    totalPlantingExp += totalPlantingExpForCrop;
    totalHarvestingExp += totalHarvestExpForCrop;
  }

  const grandTotal = totalPlantingExp + totalHarvestingExp;

  // Sort by total exp descending
  cropExpData.sort((a, b) => b.totalExp - a.totalExp);

  return (
    <Card bg="var(--mantine-color-body)" p="md" radius="md" shadow="sm">
      <Group
        justify="space-between"
        style={{ cursor: "pointer" }}
        onClick={() => setOpened(!opened)}
      >
        <Group gap="sm">
          <IconStar
            size={20}
            style={{ color: "var(--mantine-color-yellow-6)" }}
          />
          <Title order={4} c="var(--mantine-color-text)">
            Experience Breakdown
          </Title>
          <Badge color="green" variant="light">
            <NumberFormatter value={grandTotal} thousandSeparator="," /> XP
          </Badge>
        </Group>
        <IconChevronDown
          size={20}
          style={{
            transform: opened ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            color: "var(--mantine-color-text)",
          }}
        />
      </Group>

      <Collapse in={opened}>
        <Box mt="md">
          {/* Summary Cards */}
          <Grid mb="md">
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
                    value={totalPlantingExp}
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
                    value={totalHarvestingExp}
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
                  <NumberFormatter value={grandTotal} thousandSeparator="," />
                </Text>
              </Card>
            </Grid.Col>
          </Grid>

          <Text size="sm" c="dimmed" mb="md">
            Experience calculations based on {yieldStrategy} yield expectations.
            Harvesting XP includes all expected harvests per patch.
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
                      value={crop.totalExp}
                      thousandSeparator=","
                    />{" "}
                    XP
                  </Badge>
                </Group>

                <Grid>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">
                      Planting
                    </Text>
                    <Text size="sm" fw={500} c="blue.6">
                      {crop.plantingExp} × {crop.quantity} ={" "}
                      <NumberFormatter
                        value={crop.totalPlantingExp}
                        thousandSeparator=","
                      />
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">
                      Harvesting
                    </Text>
                    <Text size="sm" fw={500} c="green.6">
                      {crop.harvestExp} × {crop.totalHarvests} ={" "}
                      <NumberFormatter
                        value={crop.totalHarvestExp}
                        thousandSeparator=","
                      />
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={4}>
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
        </Box>
      </Collapse>
    </Card>
  );
}
