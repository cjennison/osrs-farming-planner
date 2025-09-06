---
applyTo: "**/*.{tsx,css,scss}"
---

# Style Patterns

## Modern CSS & Mantine Design System Standards

### Mantine Component Framework

- **Prefer Mantine components exclusively** for all UI elements and styling
- **Check shared components directory** first for existing Mantine-based components
- **Extend Mantine components** rather than creating from scratch
- **Use Mantine's theming system exclusively** for all colors, spacing, and design tokens
- **Leverage Mantine's built-in accessibility** features and ARIA support

### Mantine Styling Best Practices

- Use Mantine's design system consistently across all components
- Implement design system with Mantine's CSS variables and theme tokens
- Use Mantine's color palette exclusively - never use external color systems
- Leverage Mantine's spacing scale consistently (based on theme.spacing)
- Use Mantine's responsive utilities and breakpoints for all responsive design

### Component Styling Patterns

- **Mantine-only styling**: Use Mantine components and theming system exclusively for all styling
- **Mantine props for layout**: Use Mantine's built-in props (p, m, w, h, etc.) for spacing and sizing
- Use Mantine's polymorphic components for flexible layouts
- Implement variants using Mantine's component props and theme extensions
- Create reusable component variants by extending Mantine base components
- Use Mantine's CSS-in-JS system for complex dynamic styling
- Avoid external CSS frameworks and utility classes

### Light/Dark Mode Handling

**CRITICAL: Use Mantine-only theming for all colors, backgrounds, spacing, and styling. Never use external utility frameworks.**

#### Background Colors
- **Section backgrounds**: Use `bg` prop on Mantine components or `style={{ backgroundColor: "var(--mantine-color-body)" }}` for automatic light/dark adaptation
- **Card backgrounds**: Use `bg="var(--mantine-color-body)"` prop on Mantine components
- **Custom backgrounds**: Use Mantine CSS variables like `var(--mantine-color-blue-0)` for light mode tints

#### Text Colors
- **Primary text**: Use `c="var(--mantine-color-text)"` for main headings and content
- **Secondary text**: Use `c="dimmed"` for muted text that adapts to theme
- **Colored text**: Use Mantine color props like `c="blue.6"` for branded colors
- **Specific color text**: Use `c="green.7"` format for semantic colors

#### Spacing and Layout
- **Padding**: Use Mantine's `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr` props
- **Margin**: Use Mantine's `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr` props
- **Width/Height**: Use Mantine's `w`, `h`, `maw`, `mah` props
- **Flexbox**: Use Mantine's `Group`, `Stack`, and `Flex` components
- **Grid**: Use Mantine's `Grid` and `SimpleGrid` components

#### Icons and Graphics
- **Icon colors**: Set color via CSS variables `style={{ color: "var(--mantine-color-blue-6)" }}`
- **Border colors**: Use `style={{ borderColor: "var(--mantine-color-body)" }}` for adaptive borders

#### Examples of Correct Patterns

```tsx
// ✅ CORRECT: Section with Mantine theming and layout
<Box
  py="xl"
  style={{ backgroundColor: "var(--mantine-color-body)" }}
>
  <Title c="var(--mantine-color-text)">Section Title</Title>
  <Text c="dimmed">Supporting text that adapts to theme</Text>
</Box>

// ✅ CORRECT: Card with Mantine background and spacing
<Card
  bg="var(--mantine-color-body)"
  p="md"
  shadow="sm"
  radius="md"
>
  <Title c="blue.6">Card Title</Title>
  <Text c="dimmed">Card content</Text>
</Card>

// ✅ CORRECT: Icon with CSS variable color
<IconCode
  size={24}
  style={{ color: "var(--mantine-color-blue-6)" }}
/>

// ✅ CORRECT: Layout using Mantine components
<Stack spacing="md" align="center">
  <Title order={2}>Centered Title</Title>
  <Text maw={600} ta="center">
    This text is properly constrained and centered using Mantine props
  </Text>
</Stack>

// ❌ INCORRECT: Never use external utility frameworks
<div className="bg-white dark:bg-black py-8"> {/* DON'T DO THIS */}
  <h1 className="text-gray-900 dark:text-white text-center"> {/* DON'T DO THIS */}
```
```

### Centered Content with Width Constraints

When creating centered content that needs width constraints, use **Mantine's built-in props and components** instead of external utility classes:

```tsx
// ❌ INCORRECT: Using external utility classes
<Text className="max-w-2xl mx-auto text-center">
  This approach uses external frameworks
</Text>

// ✅ CORRECT: Use Mantine props for width constraint and text alignment
<Text maw={600} ta="center" mx="auto">
  This text is properly constrained and centered using Mantine props
</Text>

// ✅ CORRECT: For sections with multiple elements
<Stack spacing="md" align="center">
  <Title order={2}>Section Title</Title>
  <Text maw={800} ta="center">
    Longer description text that needs width constraint but should stay centered
  </Text>
</Stack>

// ✅ CORRECT: Using Container component for page-level constraints
<Container size="md">
  <Stack spacing="xl" align="center">
    <Title order={1} ta="center">Page Title</Title>
    <Text ta="center">Content automatically constrained by container</Text>
  </Stack>
</Container>
```

**Key Principles:**
- **Mantine props**: Use `maw` (max-width), `mx="auto"` (margin auto), `ta="center"` (text-align center)
- **Stack component**: Use for vertical spacing and alignment of multiple elements
- **Container component**: Use for page-level width constraints
- **Responsive widths**: Use Mantine's responsive prop syntax: `maw={{ base: 400, sm: 600, md: 800 }}`
- **Semantic structure**: Maintain proper heading hierarchy and text flow within centered containers

### CSS Architecture

- Use Mantine's CSS-in-JS system for component styling
- Implement CSS Custom Properties for advanced theming needs
- Use Mantine's responsive utilities for all responsive design
- Use CSS Grid and Flexbox through Mantine's Grid and Flex components
- Leverage CSS Logical Properties for internationalization
- Implement proper CSS cascade through Mantine's style system

### Design System Integration

- Use Mantine's built-in design tokens exclusively
- Implement consistent spacing using Mantine's theme.spacing
- Use Mantine's color system for all semantic colors
- Leverage Mantine's built-in border radius and shadow systems
- Create reusable animations using Mantine's style props
- Use Mantine's icon system for consistent iconography

### Performance Optimization

- Leverage Mantine's built-in CSS optimization
- Use Mantine's lazy loading for components when available
- Optimize font loading with Mantine's typography system
- Minimize bundle size by importing only needed Mantine components
- Use Mantine's CSS variables for dynamic theming performance

### Responsive Design

- Use Mantine's responsive prop syntax for all breakpoints
- Implement mobile-first approach using Mantine's breakpoint system
- Use Mantine's responsive utilities consistently
- Implement proper touch targets using Mantine's size props
- Use Mantine's responsive typography scale
- Test across multiple device sizes using Mantine's preview tools

### Accessibility & Semantics

- Ensure sufficient color contrast ratios using Mantine's accessible color system
- Use Mantine's built-in focus management for keyboard navigation
- Implement proper motion reduction using Mantine's reduced motion support
- Use Mantine's semantic color system and high contrast modes
- Test with screen readers using Mantine's ARIA implementations

### Animation & Interactions

- Use Mantine's built-in transition system for performant animations
- Implement Mantine's hover and focus states
- Respect reduced motion preferences through Mantine's system
- Use Mantine's animation utilities for state transitions
- Leverage Mantine's interaction hooks for complex interactions

### Examples

```tsx
// Extending Mantine components for shared use
import { Button, ButtonProps } from "@mantine/core";
import { forwardRef } from "react";

interface SharedButtonProps extends ButtonProps {
  variant?: "primary" | "secondary" | "danger";
}

export const SharedButton = forwardRef<HTMLButtonElement, SharedButtonProps>(
  ({ variant = "primary", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        color={variant === "primary" ? "blue" : variant === "secondary" ? "gray" : "red"}
        {...props}
      />
    );
  }
);

// Mantine form with proper theming and layout
import { TextInput, Button, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";

function ContactForm() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      <Stack spacing="md">
        <TextInput
          label="Name"
          placeholder="Your name"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps("email")}
        />
        <Button type="submit" mt="md">Submit</Button>
      </Stack>
    </form>
  );
}

// Using Mantine's polymorphic components for flexible layouts
import { Box, Card, Title, Text } from '@mantine/core';

const CustomCard = ({ children, ...props }) => {
  return (
    <Card
      bg="var(--mantine-color-body)"
      p="md"
      radius="md"
      shadow="sm"
      {...props}
    >
      {children}
    </Card>
  );
};
// Mantine theming with CSS custom properties
const theme = createTheme({
  colors: {
    primary: [
      '#eff6ff',
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a'
    ],
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
});

// Responsive grid system using Mantine
<SimpleGrid
  cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
  spacing="md"
>
  {items.map(item => (
    <Card key={item.id} p="md" radius="md">
      {item.content}
    </Card>
  ))}
</SimpleGrid>

// Animation utilities using Mantine's style system
<Box
  style={{
    transition: 'all 300ms ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    }
  }}
>
  Animated content
</Box>
```
