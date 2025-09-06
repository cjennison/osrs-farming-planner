import { AppHeader } from "@/components/layout/AppHeader";
import { Container, Title, Text, Stack, Card, Button, Group } from "@mantine/core";
import { IconMap, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function PatchesPage() {
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
            <IconMap size={48} style={{ color: 'var(--mantine-color-sage-6)' }} />
            <Title order={1} c="sage.7">
              Patch Map
            </Title>
            <Text c="dimmed" maw={600}>
              Map of farming patches with locations and requirements.
            </Text>
          </Stack>

          {/* Coming Soon Placeholder */}
          <Card p="xl" radius="lg" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
            <Stack gap="md" align="center" ta="center">
              <Title order={2} c="sage.6">
                Coming Soon
              </Title>
              <Text c="dimmed">
                The patch map is in development.
              </Text>
              <Text size="sm" c="dimmed">
                Features in development:
              </Text>
              <Stack gap="xs" align="flex-start">
                <Text size="sm" c="dimmed">• World map with patches</Text>
                <Text size="sm" c="dimmed">• Patch requirements</Text>
                <Text size="sm" c="dimmed">• Teleport locations</Text>
                <Text size="sm" c="dimmed">• Optimal farming route planning</Text>
                <Text size="sm" c="dimmed">• Protection flower assignments</Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </AppHeader>
  );
}
