'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  SimpleGrid,
  ThemeIcon,
  Box,
  Flex,
} from '@mantine/core';
import {
  IconPlant2,
  IconCalculator,
  IconClock,
  IconTrendingUp,
  IconArrowRight,
} from '@tabler/icons-react';
import Link from 'next/link';

const features = [
  {
    icon: IconCalculator,
    title: 'Dependency Calculator',
    description: 'Calculate exact crop requirements for complex farming chains with multi-level dependencies.',
    color: 'sage',
  },
  {
    icon: IconClock,
    title: 'Optimal Timing',
    description: 'Plan perfect planting sequences to maximize efficiency and minimize downtime.',
    color: 'earth',
  },
  {
    icon: IconTrendingUp,
    title: 'Yield Optimization',
    description: 'Account for farming level bonuses and protection methods to maximize your harvests.',
    color: 'forest',
  },
];

export function HeroSection() {
  return (
    <Box py="xxl">
      <Container size="lg">
        <Stack gap="xxl" align="center">
          {/* Hero Content */}
          <Stack gap="xl" align="center" maw={800} ta="center">
            <ThemeIcon
              size={80}
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, var(--mantine-color-sage-4), var(--mantine-color-forest-4))',
              }}
            >
              <IconPlant2 size={48} color="white" />
            </ThemeIcon>

            <Stack gap="md" align="center">
              <Title
                order={1}
                size={48}
                style={{
                  background: 'linear-gradient(135deg, var(--mantine-color-sage-7), var(--mantine-color-forest-6))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                OSRS Farming Planner
              </Title>

              <Text
                size="xl"
                c="dimmed"
                maw={600}
                style={{ lineHeight: 1.6 }}
              >
                The ultimate farming assistant for OSRS Ironmen. Calculate complex crop dependencies,
                optimize planting sequences, and plan self-sufficient farming strategies.
              </Text>
            </Stack>

            <Group gap="md" mt="md">
              <Button
                component={Link}
                href="/planner"
                size="lg"
                rightSection={<IconArrowRight size={18} />}
                style={{
                  background: 'linear-gradient(135deg, var(--mantine-color-sage-5), var(--mantine-color-sage-7))',
                }}
              >
                Start Planning
              </Button>

              <Button
                component={Link}
                href="/calculator"
                size="lg"
                variant="outline"
                color="sage"
              >
                Try Calculator
              </Button>
            </Group>
          </Stack>

          {/* Features Grid */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            w="100%"
            mt="xxl"
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                p="xl"
                radius="lg"
                style={{
                  border: '1px solid var(--mantine-color-gray-2)',
                  transition: 'all 200ms ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 'var(--mantine-shadow-lg)',
                      borderColor: 'var(--mantine-color-sage-3)',
                    },
                  },
                }}
              >
                <Stack gap="md" align="center" ta="center">
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    color={feature.color}
                    variant="light"
                  >
                    <feature.icon size={32} />
                  </ThemeIcon>

                  <Title order={3} size="h4" c="sage.8">
                    {feature.title}
                  </Title>

                  <Text c="dimmed" size="sm" style={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>

          {/* Call to Action */}
          <Card
            p="xl"
            radius="lg"
            w="100%"
            mt="xxl"
            style={{
              background: 'linear-gradient(135deg, var(--mantine-color-sage-0), var(--mantine-color-forest-0))',
              border: '1px solid var(--mantine-color-sage-2)',
            }}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              gap="lg"
            >
              <Stack gap="sm" flex={1}>
                <Title order={2} c="sage.8">
                  Ready to Optimize Your Farming?
                </Title>
                <Text c="dimmed">
                  Join thousands of Ironmen who have revolutionized their farming efficiency with our planning tools.
                </Text>
              </Stack>

              <Button
                component={Link}
                href="/planner"
                size="lg"
                color="sage"
                rightSection={<IconArrowRight size={18} />}
              >
                Get Started Now
              </Button>
            </Flex>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
