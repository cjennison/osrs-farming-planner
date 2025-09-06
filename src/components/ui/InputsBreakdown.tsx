"use client";

import {
  ActionIcon,
  Badge,
  Card,
  Collapse,
  Group,
  Image,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconSeeding,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useState } from "react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { getCropById } from "@/lib/farming-data-simple";

interface InputItem {
  type: 'seed' | 'purchase';
  name: string;
  quantity: number;
  image: string;
  crop?: string;
  purpose?: string;
}

interface InputsBreakdownProps {
  result: CalculationResult;
  yieldStrategy: YieldStrategy;
}

export function InputsBreakdown({
  result,
  yieldStrategy,
}: InputsBreakdownProps) {
  const [opened, setOpened] = useState(false);
    // Calculate required inputs based on calculation result
  const requiredInputs: InputItem[] = [];

  // Add seeds for each crop
  Object.entries(result.requirements).forEach(([cropId, requirement]) => {
    if (requirement.patches > 0) {
      const cropData = getCropById(cropId);
      if (cropData) {
        const seedsNeeded = requirement.patches * (cropData.seedsPerPatch || 1);
        requiredInputs.push({
          type: 'seed',
          name: cropData.seedName || `${cropData.name} seed`,
          quantity: seedsNeeded,
          image: cropData.images?.seed || "https://oldschool.runescape.wiki/images/0/0a/Seed_placeholder.png",
          crop: cropData.name,
        });
      }
    }
  });

  // Add purchasable items from breakdown
  result.breakdown.forEach((step) => {
    if (step.purchaseQuantity !== undefined) {
      // This is a purchasable item
      requiredInputs.push({
        type: 'purchase',
        name: step.crop.charAt(0).toUpperCase() + step.crop.slice(1),
        quantity: step.purchaseQuantity,
        image: getItemImage(step.crop),
        purpose: step.purpose,
      });
    }
  });

  return (
    <Stack gap="xs">
      <Group gap="xs" justify="space-between">
        <Text fw={500} c="sage.7">
          Required Inputs
        </Text>
        <ActionIcon variant="subtle" onClick={() => setOpened(!opened)}>
          {opened ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </ActionIcon>
      </Group>

      <Collapse in={opened}>
        <Stack gap="xs">
          {requiredInputs.map((input, index) => (
            <Paper
              key={`${input.name}-${index}`}
              p="md"
              bg={input.type === 'seed' ? 'green.0' : 'blue.0'}
              style={{ borderRadius: 6 }}
            >
              <Group gap="md" align="center">
                <Image
                  src={input.image}
                  alt={input.name}
                  w={32}
                  h={32}
                  fallbackSrc="https://oldschool.runescape.wiki/images/0/0a/Placeholder_item.png"
                />
                <Stack gap={2} flex={1}>
                  <Group gap="xs">
                    {input.type === 'seed' ? (
                      <IconSeeding size={16} style={{ color: "var(--mantine-color-green-7)" }} />
                    ) : (
                      <IconShoppingCart size={16} style={{ color: "var(--mantine-color-blue-7)" }} />
                    )}
                    <Text fw={500} size="sm">
                      {input.name}
                    </Text>
                    <Badge
                      variant="filled"
                      color={input.type === 'seed' ? 'green' : 'blue'}
                      size="sm"
                    >
                      {input.quantity}
                    </Badge>
                  </Group>
                  {input.crop && (
                    <Text size="xs" c="dimmed">
                      For {input.crop} patches
                    </Text>
                  )}
                  {input.purpose && (
                    <Text size="xs" c="dimmed">
                      {input.purpose}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Paper>
          ))}

          {requiredInputs.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No additional inputs required
            </Text>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
}

// Helper function to get item images - we'll fill these in later
function getItemImage(itemName: string): string {
  const imageMap: Record<string, string> = {
    compost: "https://oldschool.runescape.wiki/images/8/8c/Compost.png",
    supercompost: "https://oldschool.runescape.wiki/images/f/fc/Supercompost.png",
    ultracompost: "https://oldschool.runescape.wiki/images/6/69/Ultracompost.png",
    // Add more as needed
  };

  return imageMap[itemName.toLowerCase()] || "https://oldschool.runescape.wiki/images/0/0a/Placeholder_item.png";
}
