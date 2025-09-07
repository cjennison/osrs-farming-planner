"use client";

import {
  Box,
  Button,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCalculator, IconMap, IconPlant } from "@tabler/icons-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <Box py="xl">
      <Container size="md">
        <Stack gap="xl" align="center">
          {/* Main Header */}
          <Stack gap="md" align="center" ta="center">
            <Title order={1} size="h1" c="sage.7">
              OSRS Farming Planner
            </Title>

            <Text size="lg" c="dimmed" maw={500}>
              Calculate crop dependencies and plan farming routes for OSRS.
            </Text>
          </Stack>

          {/* Tool Navigation */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" w="100%" maw={600}>
            <Button
              component={Link}
              href="/planner"
              size="lg"
              variant="filled"
              color="sage"
              leftSection={<IconPlant size={20} />}
              h={60}
            >
              Planner
            </Button>

            <Button
              component={Link}
              href="/calculator"
              size="lg"
              variant="outline"
              color="sage"
              leftSection={<IconCalculator size={20} />}
              h={60}
            >
              Calculator
            </Button>

            <Button
              component={Link}
              href="/patches"
              size="lg"
              variant="outline"
              color="sage"
              leftSection={<IconMap size={20} />}
              h={60}
            >
              Patch Map
            </Button>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
