/**
 * Character Selector Component
 *
 * Allows users to search and select their OSRS character
 * Displays current character information when set
 */

"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconRefresh,
  IconSearch,
  IconTrendingUp,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useCharacter } from "@/hooks/useCharacter";

interface CharacterSelectorProps {
  compact?: boolean;
}

export function CharacterSelector({ compact = false }: CharacterSelectorProps) {
  const {
    currentCharacter,
    isLoading,
    isInitializing,
    setCharacter,
    clearCharacter,
    refreshCharacter,
  } = useCharacter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    const success = await setCharacter(searchValue.trim());
    if (success) {
      setSearchValue("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = async () => {
    await refreshCharacter();
  };

  const handleChangeCharacter = () => {
    clearCharacter();
    setSearchValue("");
  };

  // Show loading state while initializing from localStorage
  if (isInitializing) {
    return (
      <Group gap="xs">
        <ActionIcon loading variant="subtle" size={compact ? "sm" : "md"}>
          <IconUser size={compact ? 14 : 16} />
        </ActionIcon>
        <Text size={compact ? "sm" : "md"} c="dimmed">
          Loading...
        </Text>
      </Group>
    );
  }

  // Compact view with character loaded
  if (compact && currentCharacter) {
    return (
      <Group gap="xs">
        <Group gap="xs">
          <IconUser
            size={16}
            style={{ color: "var(--mantine-color-sage-6)" }}
          />
          <Text size="sm" fw={500} c="sage.7">
            {currentCharacter.username}
          </Text>
          <Badge size="xs" variant="light" color="green">
            Lvl {currentCharacter.skills.farming.level}
          </Badge>
        </Group>
        <Tooltip label="Refresh character stats">
          <ActionIcon
            variant="subtle"
            onClick={handleRefresh}
            loading={isLoading}
            c="sage.6"
            size="sm"
          >
            <IconRefresh size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Change character">
          <ActionIcon
            variant="subtle"
            onClick={handleChangeCharacter}
            c="gray.6"
            size="sm"
          >
            <IconX size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  // Compact view - always show input field
  if (compact) {
    return (
      <Group gap="xs">
        <TextInput
          placeholder="OSRS username"
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          onKeyDown={handleKeyPress}
          size="sm"
          style={{ minWidth: 150 }}
          leftSection={<IconUser size={14} />}
        />
        <ActionIcon
          variant="filled"
          color="sage"
          onClick={handleSearch}
          loading={isLoading}
          disabled={!searchValue.trim()}
          size="sm"
        >
          <IconSearch size={14} />
        </ActionIcon>
      </Group>
    );
  }

  // Full desktop view with character loaded
  if (currentCharacter) {
    return (
      <Group gap="md">
        <Group gap="xs">
          <IconUser
            size={20}
            style={{ color: "var(--mantine-color-sage-6)" }}
          />
          <Stack gap={0}>
            <Group gap="xs">
              <Text size="sm" fw={500} c="sage.7">
                {currentCharacter.username}
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={handleChangeCharacter}
                c="gray.6"
              >
                Change
              </Button>
            </Group>
            <Group gap="xs">
              <Badge size="xs" variant="light" color="green">
                <IconTrendingUp size={10} />
                <Text component="span" ml={2}>
                  Farming {currentCharacter.skills.farming.level}
                </Text>
              </Badge>
              <Badge size="xs" variant="outline" c="dimmed">
                CB {currentCharacter.combatLevel}
              </Badge>
            </Group>
          </Stack>
        </Group>

        <Tooltip label="Refresh character stats">
          <ActionIcon
            variant="subtle"
            onClick={handleRefresh}
            loading={isLoading}
            c="sage.6"
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  // Full desktop view - no character, show input field
  return (
    <Group gap="xs">
      <TextInput
        placeholder="Enter OSRS username"
        value={searchValue}
        onChange={(event) => setSearchValue(event.currentTarget.value)}
        onKeyDown={handleKeyPress}
        size="sm"
        style={{ minWidth: 200 }}
        leftSection={<IconUser size={16} />}
        description="Search for your OSRS character"
      />
      <ActionIcon
        variant="filled"
        color="sage"
        onClick={handleSearch}
        loading={isLoading}
        disabled={!searchValue.trim()}
      >
        <IconSearch size={16} />
      </ActionIcon>
    </Group>
  );
}
