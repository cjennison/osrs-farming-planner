"use client";

import { Box, Grid, Modal, Paper, Text, Tooltip } from "@mantine/core";
import type { ResourceBank } from "../../lib/calculators/optimization-calculator";
import { getCropById } from "../../lib/farming-data-simple";
import { OSRSImage } from "./OSRSImage";

interface BankViewerProps {
  opened: boolean;
  onClose: () => void;
  bank: ResourceBank;
  stepNumber: number;
}

export function BankViewer({
  opened,
  onClose,
  bank,
  stepNumber,
}: BankViewerProps) {
  const bankEntries = Object.entries(bank).filter(
    ([, quantity]) => quantity > 0,
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Bank After Step ${stepNumber}`}
      size="lg"
    >
      <Paper p="md" withBorder>
        <Text size="sm" c="dimmed" mb="md">
          Hover over items to see their names. This shows all leftover resources
          accumulated from previous farming steps.
        </Text>

        {bankEntries.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            Bank is empty - no leftover resources
          </Text>
        ) : (
          <Grid gutter="xs">
            {bankEntries.map(([cropId, quantity]) => {
              const crop = getCropById(cropId);
              const displayName = crop?.name || cropId;
              const roundedQuantity = Math.round(quantity);

              return (
                <Grid.Col span={2} key={cropId}>
                  <Tooltip
                    label={`${displayName} (${roundedQuantity})`}
                    position="top"
                  >
                    <Paper
                      p="sm"
                      withBorder
                      style={{
                        cursor: "help",
                        textAlign: "center",
                        backgroundColor: "var(--mantine-color-gray-0)",
                        border: "1px solid var(--mantine-color-gray-3)",
                        position: "relative",
                        minHeight: "60px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {/* OSRS Item Image */}
                      <OSRSImage
                        itemId={cropId}
                        imageType="crop"
                        size={32}
                        style={{ marginBottom: "4px" }}
                      />

                      {/* Quantity badge - positioned like OSRS */}
                      <Box
                        style={{
                          position: "absolute",
                          bottom: "2px",
                          right: "2px",
                          backgroundColor: "rgba(255, 255, 0, 0.9)",
                          color: "black",
                          fontSize: "10px",
                          fontWeight: "bold",
                          padding: "1px 3px",
                          borderRadius: "2px",
                          border: "1px solid #000",
                          minWidth: "16px",
                          textAlign: "center",
                        }}
                      >
                        {roundedQuantity}
                      </Box>
                    </Paper>
                  </Tooltip>
                </Grid.Col>
              );
            })}
          </Grid>
        )}

        <Text size="xs" c="dimmed" mt="md">
          💡 In OSRS, these resources would be stored in your bank and could be
          used to pay for future farming activities instead of growing them
          again.
        </Text>
      </Paper>
    </Modal>
  );
}
