"use client";

import { Badge, Collapse, Group, Paper, Stack, Text } from "@mantine/core";
import {
  IconExternalLink,
  IconSeeding,
  IconShoppingCart,
  IconTool,
} from "@tabler/icons-react";
import { useState } from "react";
import type {
  CalculationResult,
  YieldStrategy,
} from "@/lib/calculators/dependency-calculator";
import { getCropById } from "@/lib/farming-data-simple";
import { getPurchasableItemByName } from "@/lib/purchasable-items";
import { OSRSImage } from "./OSRSImage";
import { SectionHeader } from "./SectionHeader";

interface InputItem {
  type: "seed" | "purchase";
  name: string;
  quantity: number;
  itemId: string; // The crop ID or purchasable item ID for OSRSImage
  crop?: string;
  purpose?: string;
  link?: string;
  specialInstructions?: string; // Special processing instructions
}

interface InputsBreakdownProps {
  result: CalculationResult;
  yieldStrategy: YieldStrategy;
}

export function InputsBreakdown({ result }: InputsBreakdownProps) {
  const [opened, setOpened] = useState(true);

  // Calculate required inputs based on calculation result
  const requiredInputs: InputItem[] = [];

  // Add seeds for each crop
  Object.entries(result.requirements).forEach(([cropId, requirement]) => {
    if (requirement.patches > 0) {
      const cropData = getCropById(cropId);
      if (cropData) {
        const seedsNeeded = requirement.patches * (cropData.seedsPerPatch || 1);

        // Check if this crop produces something that needs special processing
        let specialInstructions: string | undefined;
        if (cropData.harvestName && cropData.specialInstructions) {
          specialInstructions = cropData.specialInstructions;
        }

        requiredInputs.push({
          type: "seed",
          name: cropData.seedName || `${cropData.name} seed`,
          quantity: seedsNeeded,
          itemId: cropId, // Use the crop ID for OSRSImage
          crop: cropData.name,
          link: cropData.wikiUrl,
          specialInstructions,
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
      const purchasableItem = getPurchasableItemByName(cleanCropName);

      const itemName =
        purchasableItem?.name ||
        cleanCropName.charAt(0).toUpperCase() + cleanCropName.slice(1);
      const itemLink = purchasableItem?.wikiUrl;

      requiredInputs.push({
        type: "purchase",
        name: itemName,
        quantity: step.purchaseQuantity,
        itemId: cleanCropName, // Use the clean item ID for OSRSImage
        purpose: step.purpose,
        link: itemLink,
      });
    }
  });

  // Create helper text as right content for the header
  const rightContent = (
    <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
      Click items with{" "}
      <IconExternalLink
        size={10}
        style={{ display: "inline", verticalAlign: "middle" }}
      />{" "}
      to view on OSRS Wiki
    </Text>
  );

  return (
    <Stack gap="xs">
      <SectionHeader
        title="Required Inputs"
        expanded={opened}
        onToggle={() => setOpened(!opened)}
        rightContent={rightContent}
        gap="xs"
      />

      <Collapse in={opened}>
        <Stack gap="xs">
          {requiredInputs.map((input, index) => {
            const isPurchasableWithLink =
              input.type === "purchase" && input.link;
            const isSeedWithLink = input.type === "seed" && input.link;
            const hasLink = isPurchasableWithLink || isSeedWithLink;

            const content = (
              <Group gap="md" align="center">
                <OSRSImage
                  itemId={input.itemId}
                  isPurchasable={input.type === "purchase"}
                  imageType={input.type === "seed" ? "seed" : "crop"}
                  size={32}
                />
                <Stack gap={2} flex={1}>
                  <Group gap="xs">
                    {input.type === "seed" ? (
                      <IconSeeding
                        size={16}
                        style={{ color: "var(--mantine-color-green-7)" }}
                      />
                    ) : (
                      <IconShoppingCart
                        size={16}
                        style={{ color: "var(--mantine-color-blue-7)" }}
                      />
                    )}
                    <Text fw={500} size="sm">
                      {input.name}
                    </Text>
                    {(isPurchasableWithLink || isSeedWithLink) && (
                      <IconExternalLink
                        size={12}
                        style={{
                          color:
                            input.type === "seed"
                              ? "var(--mantine-color-green-6)"
                              : "var(--mantine-color-blue-6)",
                        }}
                      />
                    )}
                    <Badge
                      variant="filled"
                      color={input.type === "seed" ? "green" : "blue"}
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
                  {input.specialInstructions && (
                    <Group gap="xs" align="flex-start">
                      <IconTool
                        size={12}
                        style={{
                          color: "var(--mantine-color-orange-6)",
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                      <Text size="xs" c="orange.6" fw={500}>
                        {input.specialInstructions}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Group>
            );

            return (
              <Paper
                key={`${input.name}-${index}`}
                p="md"
                bg={input.type === "seed" ? "green.0" : "blue.0"}
                style={{
                  borderRadius: 6,
                  cursor: hasLink ? "pointer" : "default",
                  transition: "transform 0.1s ease",
                }}
                onClick={
                  hasLink ? () => window.open(input.link, "_blank") : undefined
                }
                onMouseEnter={
                  hasLink
                    ? (e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    : undefined
                }
                onMouseLeave={
                  hasLink
                    ? (e) => {
                        e.currentTarget.style.transform = "translateY(0px)";
                      }
                    : undefined
                }
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
