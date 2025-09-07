"use client";

import { Box, Grid, Modal, Paper, Text, Tooltip } from "@mantine/core";
import type { ResourceBank } from "../../lib/calculators/optimization-calculator";
import { getCropById } from "../../lib/farming-data-simple";

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

              return (
                <Grid.Col span={2} key={cropId}>
                  <Tooltip
                    label={`${displayName} (${quantity})`}
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
                      {/* Item icon placeholder - in OSRS this would be the item sprite */}
                      <Box
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "var(--mantine-color-green-2)",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <Text size="xs" fw={600} c="green.8">
                          {displayName.charAt(0).toUpperCase()}
                        </Text>
                      </Box>

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
                        {quantity}
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
