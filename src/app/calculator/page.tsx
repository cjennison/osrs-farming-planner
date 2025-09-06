import { AppHeader } from "@/components/layout/AppHeader";
import { Container, Title, Text, Stack, Card, Button, Group } from "@mantine/core";
import { IconCalculator, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function CalculatorPage() {
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
            <IconCalculator size={48} style={{ color: 'var(--mantine-color-sage-6)' }} />
            <Title order={1} c="sage.7">
              Dependency Calculator
            </Title>
            <Text c="dimmed" maw={600}>
              Calculate crop requirements for farming chains.
            </Text>
          </Stack>

          {/* Coming Soon Placeholder */}
          <Card p="xl" radius="lg" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
            <Stack gap="md" align="center" ta="center">
              <Title order={2} c="sage.6">
                Coming Soon
              </Title>
              <Text c="dimmed">
                The dependency calculator is in development.
              </Text>
              <Text size="sm" c="dimmed">
                Features in development:
              </Text>
              <Stack gap="xs" align="flex-start">
                <Text size="sm" c="dimmed">• Dependency calculation</Text>
                <Text size="sm" c="dimmed">• Farming level bonuses</Text>
                <Text size="sm" c="dimmed">• Alternative payments</Text>
                <Text size="sm" c="dimmed">• Compost and protection effects</Text>
                <Text size="sm" c="dimmed">• Exact seed requirements</Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </AppHeader>
  );
}
