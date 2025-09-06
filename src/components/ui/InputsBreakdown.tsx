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
  IconExternalLink,
  IconSeeding,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useState } from "react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { getCropById } from "@/lib/farming-data-simple";
import { getPurchasableItemById, getPurchasableItemByName } from "@/lib/purchasable-items";

interface InputItem {
  type: 'seed' | 'purchase';
  name: string;
  quantity: number;
  image: string;
  crop?: string;
  purpose?: string;
  link?: string;
}

interface InputsBreakdownProps {
  result: CalculationResult;
  yieldStrategy: YieldStrategy;
}

export function InputsBreakdown({
  result,
  yieldStrategy,
}: InputsBreakdownProps) {
  const [opened, setOpened] = useState(true);
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
          link: cropData.wikiUrl,
        });
      }
    }
  });

  // Add purchasable items from breakdown
  result.breakdown.forEach((step) => {
    if (step.purchaseQuantity !== undefined) {
      // Clean the crop name by removing " (purchasable)" suffix
      const cleanCropName = step.crop.replace(" (purchasable)", "").trim();

            // Try to find the purchasable item by name or alias
      let purchasableItem = getPurchasableItemByName(cleanCropName);

      const itemName = purchasableItem?.name || (cleanCropName.charAt(0).toUpperCase() + cleanCropName.slice(1));
      const itemImage = purchasableItem?.images?.item || "https://oldschool.runescape.wiki/images/0/0a/Placeholder_item.png";
      const itemLink = purchasableItem?.wikiUrl;

      requiredInputs.push({
        type: 'purchase',
        name: itemName,
        quantity: step.purchaseQuantity,
        image: itemImage,
        purpose: step.purpose,
        link: itemLink,
      });
    }
  });

  return (
    <Stack gap="xs">
      <Group gap="xs" justify="space-between">
        <Stack gap={2}>
          <Text fw={500} c="sage.7">
            Required Inputs
          </Text>
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
            Click items with <IconExternalLink size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> to view on OSRS Wiki
          </Text>
        </Stack>
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
          {requiredInputs.map((input, index) => {
            const isPurchasableWithLink = input.type === 'purchase' && input.link;
            const isSeedWithLink = input.type === 'seed' && input.link;
            const hasLink = isPurchasableWithLink || isSeedWithLink;

            const content = (
              <Group gap="md" align="center">
                <Image
                  src={input.image}
                  alt={input.name}
                  w={32}
                  h={32}
                  fit="contain"
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
                    {(isPurchasableWithLink || isSeedWithLink) && (
                      <IconExternalLink size={12} style={{ color: input.type === 'seed' ? "var(--mantine-color-green-6)" : "var(--mantine-color-blue-6)" }} />
                    )}
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
            );

            return (
              <Paper
                key={`${input.name}-${index}`}
                p="md"
                bg={input.type === 'seed' ? 'green.0' : 'blue.0'}
                style={{
                  borderRadius: 6,
                  cursor: hasLink ? 'pointer' : 'default',
                  transition: 'transform 0.1s ease',
                }}
                onClick={hasLink ? () => window.open(input.link, '_blank') : undefined}
                onMouseEnter={hasLink ? (e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                } : undefined}
                onMouseLeave={hasLink ? (e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                } : undefined}
              >
                {content}
              </Paper>
            );
          })}

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
