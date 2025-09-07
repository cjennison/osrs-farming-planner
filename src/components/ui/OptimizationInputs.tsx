"use client";

import { Checkbox, Group, Select, Stack, Text, Title } from "@mantine/core";
import type { KandarinDiaryLevel } from "@/lib/calculators/dependency-calculator";
import type { XpStrategy } from "@/lib/calculators/optimization-calculator";

interface OptimizationInputsProps {
  compostType: "none" | "compost" | "supercompost" | "ultracompost";
  onCompostTypeChange: (
    value: "none" | "compost" | "supercompost" | "ultracompost",
  ) => void;
  hasAltasSeed: boolean;
  onAltasSeedChange: (value: boolean) => void;
  hasSecateurs: boolean;
  onSecateursChange: (value: boolean) => void;
  kandarinDiary: KandarinDiaryLevel;
  onKandarinDiaryChange: (value: KandarinDiaryLevel) => void;
  xpStrategy: XpStrategy;
  onXpStrategyChange: (value: XpStrategy) => void;
  excludeFlowers: boolean;
  onExcludeFlowersChange: (value: boolean) => void;
  excludeHerbs: boolean;
  onExcludeHerbsChange: (value: boolean) => void;
  excludeBushes: boolean;
  onExcludeBushesChange: (value: boolean) => void;
  excludeFruitTrees: boolean;
  onExcludeFruitTreesChange: (value: boolean) => void;
}

const XP_STRATEGY_OPTIONS = [
  {
    value: "no-rollover",
    label: "No Rollover - Full XP per level",
  },
  {
    value: "rollover",
    label: "Rollover - Use XP overflow",
  },
];

const COMPOST_OPTIONS = [
  { value: "none", label: "No Compost" },
  { value: "compost", label: "Compost" },
  { value: "supercompost", label: "Supercompost" },
  { value: "ultracompost", label: "Ultracompost" },
];

const KANDARIN_DIARY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "elite", label: "Elite" },
];

export function OptimizationInputs({
  compostType,
  onCompostTypeChange,
  hasAltasSeed,
  onAltasSeedChange,
  hasSecateurs,
  onSecateursChange,
  kandarinDiary,
  onKandarinDiaryChange,
  xpStrategy,
  onXpStrategyChange,
  excludeFlowers,
  onExcludeFlowersChange,
  excludeHerbs,
  onExcludeHerbsChange,
  excludeBushes,
  onExcludeBushesChange,
  excludeFruitTrees,
  onExcludeFruitTreesChange,
}: OptimizationInputsProps) {
  return (
    <Stack gap="md">
      <Title order={4} c="sage.7">
        Yield Modifiers
      </Title>

      <Group grow>
        <Select
          label="Compost Type"
          description="Affects crop yield and disease protection"
          value={compostType}
          onChange={(value) => onCompostTypeChange(value as typeof compostType)}
          data={COMPOST_OPTIONS}
        />

        <Select
          label="Kandarin Diary"
          description="Herb patch bonuses (Catherby only)"
          value={kandarinDiary}
          onChange={(value) =>
            onKandarinDiaryChange(value as KandarinDiaryLevel)
          }
          data={KANDARIN_DIARY_OPTIONS}
        />
      </Group>

      <Group>
        <Checkbox
          label="Attas Seed"
          description="10% yield increase for all crops"
          checked={hasAltasSeed}
          onChange={(event) => onAltasSeedChange(event.currentTarget.checked)}
        />

        <Checkbox
          label="Magic Secateurs"
          description="Chance-to-Save bonus when harvesting"
          checked={hasSecateurs}
          onChange={(event) => onSecateursChange(event.currentTarget.checked)}
        />
      </Group>

      <Title order={4} c="sage.7" mt="md">
        Experience Strategy
      </Title>

      <Select
        label="XP Strategy"
        description={
          xpStrategy === "rollover"
            ? "Excess XP from previous levels reduces future requirements. More efficient but less predictable."
            : "Calculate XP needed for each level independently. Predictable but may use more crops than necessary."
        }
        value={xpStrategy}
        onChange={(value) => onXpStrategyChange(value as XpStrategy)}
        data={XP_STRATEGY_OPTIONS}
      />

      <Title order={4} c="sage.7" mt="md">
        Crop Type Exclusions
      </Title>

      <Group>
        <Checkbox
          label="Exclude Flowers"
          description="Skip all flower crops in optimization"
          checked={excludeFlowers}
          onChange={(event) =>
            onExcludeFlowersChange(event.currentTarget.checked)
          }
        />

        <Checkbox
          label="Exclude Herbs"
          description="Skip all herb crops in optimization"
          checked={excludeHerbs}
          onChange={(event) =>
            onExcludeHerbsChange(event.currentTarget.checked)
          }
        />

        <Checkbox
          label="Exclude Bushes"
          description="Skip all bush crops in optimization"
          checked={excludeBushes}
          onChange={(event) =>
            onExcludeBushesChange(event.currentTarget.checked)
          }
        />

        <Checkbox
          label="Exclude Fruit Trees"
          description="Skip all fruit tree crops in optimization"
          checked={excludeFruitTrees}
          onChange={(event) =>
            onExcludeFruitTreesChange(event.currentTarget.checked)
          }
        />
      </Group>

      <Text size="sm" c="dimmed">
        Note: These modifiers affect yield calculations and experience gained
        per patch. Level restrictions for certain items will be applied in
        future updates.
      </Text>
    </Stack>
  );
}
