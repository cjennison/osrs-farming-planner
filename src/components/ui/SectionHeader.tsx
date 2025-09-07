"use client";

import { Group, type GroupProps, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface SectionHeaderProps extends Omit<GroupProps, "children"> {
  /** Main header text */
  title: string;
  /** Whether the section is expanded */
  expanded: boolean;
  /** Callback when header is clicked to toggle expanded state */
  onToggle: () => void;
  /** Additional content to display in the header (badges, status indicators, etc.) */
  rightContent?: ReactNode;
  /** Whether to disable the expand/collapse functionality */
  disableToggle?: boolean;
}

/**
 * Standardized section header component with consistent green text styling,
 * clickable expand/collapse functionality, and support for additional content.
 *
 * Features:
 * - Consistent sage.7 green text color
 * - Left-aligned chevron icon
 * - Clickable entire header area
 * - Support for additional right-side content
 * - Proper keyboard accessibility
 */
export function SectionHeader({
  title,
  expanded,
  onToggle,
  rightContent,
  disableToggle = false,
  ...groupProps
}: SectionHeaderProps) {
  const ChevronIcon = expanded ? IconChevronDown : IconChevronRight;

  if (disableToggle) {
    // Static header without expand/collapse functionality
    return (
      <Group justify="space-between" {...groupProps}>
        <Group gap="xs">
          <Text fw={500} c="sage.7">
            {title}
          </Text>
        </Group>
        {rightContent && <Group gap="xs">{rightContent}</Group>}
      </Group>
    );
  }

  return (
    <UnstyledButton
      onClick={onToggle}
      style={{
        width: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${title} section`}
    >
      <Group justify="space-between" {...groupProps}>
        <Group gap="xs">
          <ChevronIcon
            size={16}
            style={{
              color: "var(--mantine-color-gray-6)",
              transition: "transform 0.2s ease",
            }}
          />
          <Text fw={500} c="sage.7">
            {title}
          </Text>
        </Group>
        {rightContent && <Group gap="xs">{rightContent}</Group>}
      </Group>
    </UnstyledButton>
  );
}
