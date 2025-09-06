import { AppHeader } from "@/components/layout/AppHeader";
import { Container, Title, Text, Stack, Card, Button, Group } from "@mantine/core";
import { IconPlant2, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function PlannerPage() {
  return (
    <AppHeader>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Page Header */}
          <Group gap="md">
            <Button
              component={Link}
              href="/"
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              c="sage.7"
            >
              Back
            </Button>
          </Group>

          <Stack gap="md" align="center" ta="center">
            <IconPlant2 size={48} style={{ color: 'var(--mantine-color-sage-6)' }} />
            <Title order={1} c="sage.7">
              Farming Planner
            </Title>
            <Text c="dimmed" maw={600}>
              Plan farming strategies with crop dependency calculation.
            </Text>
          </Stack>

          {/* Coming Soon Placeholder */}
          <Card p="xl" radius="lg" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
            <Stack gap="md" align="center" ta="center">
              <Title order={2} c="sage.6">
                Coming Soon
              </Title>
              <Text c="dimmed">
                The farming planner is in development.
              </Text>
              <Text size="sm" c="dimmed">
                Features in development:
              </Text>
              <Stack gap="xs" align="flex-start">
                <Text size="sm" c="dimmed">• Crop selector</Text>
                <Text size="sm" c="dimmed">• Dependency visualization</Text>
                <Text size="sm" c="dimmed">• Planting timeline</Text>
                <Text size="sm" c="dimmed">• Resource requirement summary</Text>
                <Text size="sm" c="dimmed">• Save and share farming plans</Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </AppHeader>
  );
}
