"use client";

import {
  Badge,
  Box,
  Button,
  Collapse,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { OptimizationInputs } from "@/components/ui/OptimizationInputs";
import { OSRSImage } from "@/components/ui/OSRSImage";
import {
  type CalculationOptions,
  calculateOptimalProgression,
} from "@/lib/calculators/optimization-calculator";
import { getAllCrops, getCropById } from "@/lib/farming-data-simple";
import { getPurchasableItemById } from "@/lib/purchasable-items";

export default function OptimizedLevelingPage() {
  const [options, setOptions] = useState<CalculationOptions>({
    compostType: "none",
    hasAltasSeed: false,
    hasSecateurs: false,
    kandarinDiary: "none",
    yieldStrategy: "average",
    excludeFlowers: true, // Default to true as requested
    excludeHerbs: false, // Default to false as requested
    excludeBushes: false, // Default to false for bushes
  });

  const [showInputs, setShowInputs] = useState(true);

  // Calculate the optimal progression
  const progression = calculateOptimalProgression(options);

  const handleOptionsChange = (newOptions: Partial<CalculationOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  };

  return (
    <AppHeader>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Stack gap="md" align="center">
            <Title order={1} ta="center" c="sage.7">
              Optimized Leveling Path
            </Title>
            <Text ta="center" c="dimmed" maw={600}>
              The most efficient 1-99 farming progression using the "Least
              Patch" algorithm. Each step shows the optimal crop to maximize
              experience per patch at every level.
            </Text>
          </Stack>

          {/* Calculator Inputs */}
          <Paper p="md" radius="md" bg="var(--mantine-color-body)">
            <Group justify="space-between" mb="md">
              <Title order={3} c="sage.7">
                Modifiers & Settings
              </Title>
              <Button
                variant="subtle"
                rightSection={
                  showInputs ? (
                    <IconChevronUp size={16} />
                  ) : (
                    <IconChevronDown size={16} />
                  )
                }
                onClick={() => setShowInputs(!showInputs)}
              >
                {showInputs ? "Hide" : "Show"} Options
              </Button>
            </Group>

            <Collapse in={showInputs}>
              <OptimizationInputs
                compostType={options.compostType || "none"}
                onCompostTypeChange={(value) =>
                  handleOptionsChange({ compostType: value })
                }
                hasAltasSeed={options.hasAltasSeed || false}
                onAltasSeedChange={(value) =>
                  handleOptionsChange({ hasAltasSeed: value })
                }
                hasSecateurs={options.hasSecateurs || false}
                onSecateursChange={(value) =>
                  handleOptionsChange({ hasSecateurs: value })
                }
                kandarinDiary={options.kandarinDiary || "none"}
                onKandarinDiaryChange={(value) =>
                  handleOptionsChange({ kandarinDiary: value })
                }
                excludeFlowers={options.excludeFlowers || true}
                onExcludeFlowersChange={(value) =>
                  handleOptionsChange({ excludeFlowers: value })
                }
                excludeHerbs={options.excludeHerbs || false}
                onExcludeHerbsChange={(value) =>
                  handleOptionsChange({ excludeHerbs: value })
                }
                excludeBushes={options.excludeBushes || false}
                onExcludeBushesChange={(value) =>
                  handleOptionsChange({ excludeBushes: value })
                }
              />
            </Collapse>
          </Paper>

          {/* Progression Summary */}
          <Paper p="md" radius="md" bg="var(--mantine-color-body)">
            <Title order={3} mb="md" c="sage.7">
              Progression Summary
            </Title>
            <Group gap="xl">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Total Steps
                </Text>
                <Text fw={600} size="lg">
                  {progression.steps.length}
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Total Patches
                </Text>
                <Text fw={600} size="lg">
                  {progression.totalPatchesUsed}
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Total Experience
                </Text>
                <Text fw={600} size="lg">
                  {progression.totalExpGained.toLocaleString()}
                </Text>
              </Stack>
            </Group>
          </Paper>

          {/* Progression Table */}
          <Paper p="md" radius="md" bg="var(--mantine-color-body)">
            <Title order={3} mb="md" c="sage.7">
              Level Progression
            </Title>

            <Box style={{ overflowX: "auto" }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Level</Table.Th>
                    <Table.Th>EXP Required</Table.Th>
                    <Table.Th>Optimal Crop</Table.Th>
                    <Table.Th>Patches</Table.Th>
                    <Table.Th>Inputs Required</Table.Th>
                    <Table.Th>EXP Gained</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {progression.steps.map((step) => (
                    <Table.Tr key={`${step.fromLevel}-${step.toLevel}`}>
                      <Table.Td>
                        <Text fw={600}>
                          {step.fromLevel} → {step.toLevel}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {step.expRequired.toLocaleString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <OSRSImage
                            itemId={step.optimalCrop.id}
                            imageType="crop"
                            size={24}
                          />
                          <Tooltip label={step.optimalCrop.name}>
                            <Text size="sm" fw={500}>
                              {step.optimalCrop.name}
                            </Text>
                          </Tooltip>
                          <Badge size="xs" variant="light" color="blue">
                            {step.optimalCrop.expPerPatch} XP
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="filled" color="sage">
                          {step.patchesNeeded}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          {/* Seeds - sorted by dependency order */}
                          {(() => {
                            // Helper function to get dependency order
                            const getDependencyOrder = (seedId: string): number => {
                              // First find the crop that has this seedId
                              let crop = getCropById(seedId);
                              if (!crop) {
                                // If seedId is numeric, find the crop that has this seedId
                                const numericSeedId = parseInt(seedId);
                                if (!Number.isNaN(numericSeedId)) {
                                  const allCrops = getAllCrops();
                                  crop = allCrops.find(
                                    (c) => (c as { seedId?: number }).seedId === numericSeedId,
                                  );
                                }
                              }

                              // Special case for target crop - it should come first
                              if (crop?.id === step.optimalCrop.id) return 0;
                              
                              // For dependency crops, order by farming level requirement (higher = earlier)
                              return crop?.farmingLevel ? 100 - crop.farmingLevel : 999;
                            };

                            // Sort seeds by dependency order
                            const sortedSeeds = Object.entries(step.inputs.seeds).sort(
                              ([seedIdA], [seedIdB]) => 
                                getDependencyOrder(seedIdA) - getDependencyOrder(seedIdB)
                            );

                            return sortedSeeds.map(([seedId, quantity]) => {
                              // Find the crop that has this seedId
                              const crop = (() => {
                                // First try to find by crop ID (for cases where seedId is the crop name)
                                const cropByName = getCropById(seedId);
                                if (cropByName) return cropByName;

                                // If seedId is numeric, find the crop that has this seedId
                                const numericSeedId = parseInt(seedId);
                                if (!Number.isNaN(numericSeedId)) {
                                  const allCrops = getAllCrops();
                                  return allCrops.find(
                                    (c) =>
                                      (c as { seedId?: number }).seedId ===
                                      numericSeedId,
                                  );
                                }

                                return null;
                              })();

                              const seedName =
                                crop?.seedName ||
                                (crop?.name
                                  ? `${crop.name} seed`
                                  : `Seed ${seedId}`);

                              return (
                                <Tooltip
                                  key={seedId}
                                  label={`${seedName}: ${quantity}`}
                                >
                                  <Group gap={2}>
                                    <OSRSImage
                                      itemId={crop?.id || seedId}
                                      imageType="seed"
                                      size={20}
                                    />
                                    <Text size="xs">{quantity}</Text>
                                  </Group>
                                </Tooltip>
                              );
                            });
                          })()}

                          {/* Purchasables */}
                          {Object.entries(step.inputs.purchasables).map(
                            ([itemId, quantity]) => {
                              const item = getPurchasableItemById(itemId);
                              return (
                                <Tooltip
                                  key={itemId}
                                  label={`${item?.name || itemId}: ${quantity}`}
                                >
                                  <Group gap={2}>
                                    <OSRSImage
                                      itemId={itemId}
                                      isPurchasable={true}
                                      size={20}
                                    />
                                    <Text size="xs">{quantity}</Text>
                                  </Group>
                                </Tooltip>
                              );
                            },
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500} c="green">
                          +{step.totalExpGained.toLocaleString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </AppHeader>
  );
}
