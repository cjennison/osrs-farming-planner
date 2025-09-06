'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Select,
  NumberInput,
  Button,
  Badge,
  Divider,
  Alert,
  Grid,
  Paper,
  ActionIcon,
  Tooltip,
  Collapse,
  ScrollArea
} from '@mantine/core';
import {
  IconCalculator,
  IconInfoCircle,
  IconTrendingUp,
  IconClock,
  IconSeedling,
  IconChevronDown,
  IconChevronRight,
  IconLeaf,
  IconShield
} from '@tabler/icons-react';
import { calculateDependencies, type CalculationResult, type YieldStrategy } from '@/lib/calculators/dependency-calculator';

type CropOption = {
  value: string;
  label: string;
  level: number;
  growthTime: number;
};

const CROP_OPTIONS: CropOption[] = [
  // Allotment crops
  { value: 'potato', label: 'Potato', level: 1, growthTime: 80 },
  { value: 'onion', label: 'Onion', level: 5, growthTime: 80 },
  { value: 'cabbage', label: 'Cabbage', level: 7, growthTime: 80 },
  { value: 'tomato', label: 'Tomato', level: 12, growthTime: 80 },
  { value: 'sweetcorn', label: 'Sweetcorn', level: 20, growthTime: 80 },
  { value: 'strawberry', label: 'Strawberry', level: 31, growthTime: 80 },
  { value: 'watermelon', label: 'Watermelon', level: 47, growthTime: 80 },
  { value: 'snape_grass', label: 'Snape Grass', level: 61, growthTime: 80 },
  // Flower crops
  { value: 'marigold', label: 'Marigold', level: 2, growthTime: 20 },
  { value: 'rosemary', label: 'Rosemary', level: 11, growthTime: 20 },
  { value: 'nasturtium', label: 'Nasturtium', level: 24, growthTime: 20 },
  { value: 'woad', label: 'Woad', level: 25, growthTime: 20 },
  { value: 'limpwurt', label: 'Limpwurt Root', level: 26, growthTime: 20 },
  { value: 'white_lily', label: 'White Lily', level: 58, growthTime: 20 }
];

const COMPOST_OPTIONS = [
  { value: 'none', label: 'No Compost', bonus: 0 },
  { value: 'compost', label: 'Compost', bonus: 1 },
  { value: 'supercompost', label: 'Supercompost', bonus: 2 },
  { value: 'ultracompost', label: 'Ultracompost', bonus: 3 }
];

const YIELD_STRATEGY_OPTIONS = [
  { value: 'min' as YieldStrategy, label: 'Conservative (Min Yield)', description: 'Plan for worst-case yields' },
  { value: 'average' as YieldStrategy, label: 'Realistic (Average Yield)', description: 'Plan using expected yields' },
  { value: 'max' as YieldStrategy, label: 'Optimistic (Max Yield)', description: 'Plan for best-case yields' }
];

const formatCompostText = (compostType: string): string => {
  switch (compostType) {
    case 'none':
      return 'with no compost';
    case 'compost':
      return 'with compost';
    case 'supercompost':
      return 'with supercompost';
    case 'ultracompost':
      return 'with ultracompost';
    default:
      return `with ${compostType}`;
  }
};

export function FarmingCalculator() {
  const [targetCrop, setTargetCrop] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [farmingLevel, setFarmingLevel] = useState<number>(1);
  const [compostType, setCompostType] = useState<string>('none');
  const [yieldStrategy, setYieldStrategy] = useState<YieldStrategy>('average');
  const [startingResources, setStartingResources] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const selectedCrop = CROP_OPTIONS.find(crop => crop.value === targetCrop);
  const canCalculate = targetCrop && quantity > 0 && farmingLevel >= (selectedCrop?.level || 1);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCalculate = () => {
    if (!canCalculate) return;

    try {
      const calculationResult = calculateDependencies(
        targetCrop,
        quantity,
        farmingLevel,
        compostType as 'none' | 'compost' | 'supercompost' | 'ultracompost',
        startingResources,
        yieldStrategy
      );
      setResult(calculationResult);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setResult(null);
    }
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (canCalculate) {
      handleCalculate();
    } else {
      setResult(null);
      setError('');
    }
  }, [targetCrop, quantity, farmingLevel, compostType, startingResources, yieldStrategy]);

  const updateStartingResource = (crop: string, amount: number) => {
    setStartingResources(prev => ({
      ...prev,
      [crop]: amount || 0
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
        tomato: 'cabbage',
        cabbage: 'onion',
        onion: 'potato'
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
          <IconCalculator size={48} style={{ color: 'var(--mantine-color-sage-6)' }} />
          <Title order={1} c="sage.7">
            Dependency Calculator
          </Title>
          <Text c="dimmed" maw={600}>
            Calculate exact crop requirements for OSRS farming chains.
            Account for protection, yield bonuses, and existing resources.
          </Text>
        </Stack>

        <Grid>
          {/* Input Panel */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card p="lg" radius="lg" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
              <Stack gap="md">
                <Group gap="xs">
                  <IconSeedling size={20} style={{ color: 'var(--mantine-color-sage-6)' }} />
                  <Title order={3} c="sage.7">Calculation Inputs</Title>
                </Group>

                <Select
                  label="Target Crop"
                  placeholder="Choose your target crop"
                  data={CROP_OPTIONS.map(crop => ({
                    value: crop.value,
                    label: `${crop.label} (Level ${crop.level})`
                  }))}
                  value={targetCrop}
                  onChange={(value) => setTargetCrop(value || '')}
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
                  data={COMPOST_OPTIONS.map(compost => ({
                    value: compost.value,
                    label: `${compost.label} (+${compost.bonus} yield)`
                  }))}
                  value={compostType}
                  onChange={(value) => setCompostType(value || 'none')}
                />

                <Select
                  label="Yield Strategy"
                  placeholder="Select planning strategy"
                  description="Choose your planning approach based on risk tolerance"
                  data={YIELD_STRATEGY_OPTIONS.map(strategy => ({
                    value: strategy.value,
                    label: strategy.label
                  }))}
                  value={yieldStrategy}
                  onChange={(value) => setYieldStrategy((value as YieldStrategy) || 'average')}
                />

                {/* Starting Resources */}
                {targetCrop && (
                  <Card p="md" bg="gray.0" radius="md">
                    <Stack gap="xs">
                      <Group gap="xs">
                        <IconLeaf size={16} />
                        <Text size="sm" fw={500}>Starting Dependency Resources</Text>
                        <Tooltip label="Individual dependency crop units you already have (not patches). These are crops needed to protect your target crop. E.g., if you have 50 potatoes, enter 50">
                          <ActionIcon variant="subtle" size="xs">
                            <IconInfoCircle size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>

                      {getDependencyChain(targetCrop).map(crop => (
                        <NumberInput
                          key={crop}
                          label={`${crop.charAt(0).toUpperCase() + crop.slice(1)} (units)`}
                          placeholder="0"
                          size="xs"
                          value={startingResources[crop] || 0}
                          onChange={(value) => updateStartingResource(crop, Number(value) || 0)}
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
              </Stack>
            </Card>
          </Grid.Col>

          {/* Results Panel */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            {result ? (
              <Stack gap="md">
                {/* Summary Card */}
                <Card p="lg" radius="lg" style={{ border: '1px solid var(--mantine-color-sage-2)' }}>
                  <Stack gap="md">
                    <Group gap="xs">
                      <IconTrendingUp size={20} style={{ color: 'var(--mantine-color-sage-6)' }} />
                      <Title order={3} c="sage.7">Calculation Results</Title>
                    </Group>

                    <Grid>
                      <Grid.Col span={6}>
                        <Paper p="md" bg="sage.0" radius="md">
                          <Stack gap="xs" align="center">
                            <Text size="sm" c="dimmed">Total Patches</Text>
                            <Text size="xl" fw={700} c="sage.7">
                              {result.summary.totalPatches}
                            </Text>
                          </Stack>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Paper p="md" bg="forest.0" radius="md">
                          <Stack gap="xs" align="center">
                            <Text size="sm" c="dimmed">Est. Time</Text>
                            <Text size="xl" fw={700} c="forest.7">
                              {formatTime(result.summary.estimatedTime)}
                            </Text>
                          </Stack>
                        </Paper>
                      </Grid.Col>
                    </Grid>

                    {/* Requirements Breakdown */}
                    <Divider />

                    <Stack gap="xs">
                      <Group gap="xs" justify="space-between">
                        <Text fw={500} c="sage.7">Crop Requirements</Text>
                        <ActionIcon
                          variant="subtle"
                          onClick={() => toggleSection('breakdown')}
                        >
                          {expandedSections.breakdown ?
                            <IconChevronDown size={16} /> :
                            <IconChevronRight size={16} />
                          }
                        </ActionIcon>
                      </Group>

                      <Collapse in={expandedSections.breakdown}>
                        <Stack gap="xs">
                          {Object.entries(result.requirements).map(([crop, requirement]) => {
                            const starting = startingResources[crop] || 0;
                            const patchesNeeded = requirement.patches;

                            return (
                              <Group key={crop} justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                                <Group gap="xs">
                                  <Text size="sm" tt="capitalize">{crop}</Text>
                                  {requirement.paymentInfo && (
                                    <Badge size="xs" variant="light" color="orange">
                                      {requirement.paymentInfo.containerDescription} × {requirement.paymentInfo.containerQuantity}
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
                                    {patchesNeeded > 0 ? `${patchesNeeded} patches` : 'Covered'}
                                  </Badge>
                                </Group>
                              </Group>
                            );
                          })}
                        </Stack>
                      </Collapse>
                    </Stack>

                    {/* Growth Breakdown */}
                    <Divider />

                    <Stack gap="xs">
                      <Group gap="xs" justify="space-between">
                        <Text fw={500} c="sage.7">Growth Breakdown</Text>
                        <ActionIcon
                          variant="subtle"
                          onClick={() => toggleSection('growth')}
                        >
                          {expandedSections.growth ?
                            <IconChevronDown size={16} /> :
                            <IconChevronRight size={16} />
                          }
                        </ActionIcon>
                      </Group>

                      <Collapse in={expandedSections.growth}>
                        <Stack gap="xs">
                          {result.breakdown.map((step, index) => {
                            const starting = startingResources[step.crop] || 0;
                            const patchesNeeded = step.patchesNeeded[yieldStrategy];
                            const totalYield = step.totalYield[yieldStrategy];

                            if (patchesNeeded === 0) return null;

                            return (
                              <Group key={`${step.crop}-${index}`} gap="md" p="md" bg="white" style={{ borderRadius: 8, border: '1px solid var(--mantine-color-gray-2)' }}>
                                <Badge variant="filled" color="sage" size="lg">
                                  {step.level}
                                </Badge>
                                <Stack gap="xs" flex={1}>
                                  <Group gap="xs">
                                    <Text fw={500} tt="capitalize">{step.crop}</Text>
                                    <Badge size="xs" variant="light">
                                      {patchesNeeded} patches
                                    </Badge>
                                    <Badge size="xs" variant="outline" c="dimmed">
                                      {totalYield.toFixed(1)} total expected yield
                                    </Badge>
                                    {starting > 0 && (
                                      <Badge size="xs" variant="outline" c="blue">
                                        +{starting} units
                                      </Badge>
                                    )}
                                  </Group>
                                  <Group gap="xs">
                                    <IconShield size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                                    <Text size="xs" c="dimmed">
                                      {step.purpose}
                                    </Text>
                                  </Group>
                                </Stack>
                              </Group>
                            );
                          })}
                        </Stack>
                      </Collapse>
                    </Stack>

                    {/* Yield Information */}
                    <Divider />

                    <Stack gap="xs">
                      <Group gap="xs" justify="space-between">
                        <Text fw={500} c="sage.7">Expected Yields</Text>
                        <ActionIcon
                          variant="subtle"
                          onClick={() => toggleSection('yields')}
                        >
                          {expandedSections.yields ?
                            <IconChevronDown size={16} /> :
                            <IconChevronRight size={16} />
                          }
                        </ActionIcon>
                      </Group>

                      <Collapse in={expandedSections.yields}>
                        <Stack gap="xs">
                          {Object.entries(result.requirements).map(([crop, requirement]) => (
                            <Paper key={crop} p="md" bg="gold.0" style={{ borderRadius: 6 }}>
                              <Group justify="space-between" align="flex-start">
                                <Text size="sm" tt="capitalize" fw={500}>{crop}</Text>
                                <Group gap="md" align="center">
                                  <Stack gap={2} align="center">
                                    <Text size="xs" c="dimmed" fw={500}>Min</Text>
                                    <Badge
                                      variant={yieldStrategy === 'min' ? 'filled' : 'outline'}
                                      color={yieldStrategy === 'min' ? 'red.8' : 'red.8'}
                                      size="sm"
                                      c={yieldStrategy === 'min' ? 'white' : 'red.8'}
                                    >
                                      {requirement.perPatchYield.min}
                                    </Badge>
                                  </Stack>
                                  <Stack gap={2} align="center">
                                    <Text size="xs" c="dimmed" fw={500}>Avg</Text>
                                    <Badge
                                      variant={yieldStrategy === 'average' ? 'filled' : 'outline'}
                                      color={yieldStrategy === 'average' ? 'yellow.8' : 'yellow.8'}
                                      size="sm"
                                      c={yieldStrategy === 'average' ? 'white' : 'yellow.8'}
                                    >
                                      {requirement.perPatchYield.average.toFixed(1)}
                                    </Badge>
                                  </Stack>
                                  <Stack gap={2} align="center">
                                    <Text size="xs" c="dimmed" fw={500}>Max</Text>
                                    <Badge
                                      variant={yieldStrategy === 'max' ? 'filled' : 'outline'}
                                      color={yieldStrategy === 'max' ? 'green.8' : 'green.8'}
                                      size="sm"
                                      c={yieldStrategy === 'max' ? 'white' : 'green.8'}
                                    >
                                      {requirement.perPatchYield.max}
                                    </Badge>
                                  </Stack>
                                </Group>
                              </Group>
                              <Text size="xs" c="dimmed" mt="xs">
                                Per patch yield at level {farmingLevel} {formatCompostText(compostType)}
                              </Text>
                            </Paper>
                          ))}
                        </Stack>
                      </Collapse>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            ) : (
              <Card p="xl" radius="lg" style={{ border: '1px dashed var(--mantine-color-gray-3)' }}>
                <Stack gap="md" align="center" ta="center">
                  <IconCalculator size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
                  <Title order={3} c="gray.6">
                    Ready to Calculate
                  </Title>
                  <Text c="dimmed">
                    {!targetCrop
                      ? "Select a target crop to begin"
                      : selectedCrop && farmingLevel < selectedCrop.level
                      ? `Requires level ${selectedCrop.level} farming`
                      : "Configure your inputs to see results"
                    }
                  </Text>
                  {selectedCrop && farmingLevel < selectedCrop.level && (
                    <Alert color="orange" title="Level Requirement">
                      <Stack gap="sm">
                        <Text>
                          You need level {selectedCrop.level} farming to grow {selectedCrop.label}.
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
            )}
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
