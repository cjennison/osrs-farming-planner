"use client";

import {
  ActionIcon,
  AppShell,
  Button,
  Container,
  Group,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconCalculator,
  IconMap,
  IconMoon,
  IconPlant,
  IconSun,
} from "@tabler/icons-react";
import Link from "next/link";
import { CharacterSelector } from "@/components/ui/CharacterSelector";

interface AppHeaderProps {
  children: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%">
            {/* Logo and Brand */}
            <Button
              component={Link}
              href="/"
              variant="subtle"
              p={0}
              style={{ height: "auto" }}
            >
              <Group gap="sm">
                <IconPlant
                  size={24}
                  style={{ color: "var(--mantine-color-sage-6)" }}
                />
                <Title
                  order={3}
                  c="sage.7"
                  style={{ fontSize: "1.25rem", lineHeight: 1.2 }}
                >
                  OSRS Farming Planner
                </Title>
              </Group>
            </Button>

            {/* Navigation and Character */}
            <Group gap="md">
              {/* Navigation */}
              <Group gap="xs" visibleFrom="sm">
                <Button
                  component={Link}
                  href="/planner"
                  variant="subtle"
                  leftSection={<IconPlant size={16} />}
                  c="sage.7"
                >
                  Planner
                </Button>
                <Button
                  component={Link}
                  href="/calculator"
                  variant="subtle"
                  leftSection={<IconCalculator size={16} />}
                  c="sage.7"
                >
                  Calculator
                </Button>
                <Button
                  component={Link}
                  href="/patches"
                  variant="subtle"
                  leftSection={<IconMap size={16} />}
                  c="sage.7"
                >
                  Patch Map
                </Button>
              </Group>

              {/* Character Selector */}
              <CharacterSelector compact />
            </Group>

            {/* Theme Toggle */}
            <ActionIcon
              onClick={toggleColorScheme}
              variant="subtle"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
