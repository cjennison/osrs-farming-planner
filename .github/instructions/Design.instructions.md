---
applyTo: "**/*.{tsx,css,scss,md}"
---

# Design System Guidelines

## Brand Identity & Visual Language

### Design Philosophy

- **Clean & Professional**: Minimalist approach with purposeful design elements
- **Modern & Accessible**: Contemporary UI patterns with universal usability
- **Content-First**: Design serves the content, not the other way around
- **Subtle Elegance**: Refined details that enhance without overwhelming

### Typography Hierarchy

#### Font Families

- **Primary (Display)**: `Inter` - Clean, modern sans-serif for headings and UI
- **Secondary (Body)**: `Inter` - Same family for consistency, different weights
- **Monospace**: `JetBrains Mono` - For code blocks and technical content

#### Font Scale

```css
/* Font sizes following 1.25 scale ratio */
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem; /* 36px */
--font-size-5xl: 3rem; /* 48px */
--font-size-6xl: 3.75rem; /* 60px */
```

#### Font Weights

- **Light**: 300 - Subtle text, secondary information
- **Normal**: 400 - Body text, default weight
- **Medium**: 500 - Emphasized text, navigation
- **Semibold**: 600 - Subheadings, buttons
- **Bold**: 700 - Main headings, strong emphasis

### Color System

#### Light Mode Palette

```css
/* Primary Colors - Professional Blue */
--color-primary-50: #eff6ff; /* Lightest blue tint */
--color-primary-100: #dbeafe; /* Very light blue */
--color-primary-200: #bfdbfe; /* Light blue */
--color-primary-300: #93c5fd; /* Medium light blue */
--color-primary-400: #60a5fa; /* Medium blue */
--color-primary-500: #3b82f6; /* Primary blue */
--color-primary-600: #2563eb; /* Dark blue */
--color-primary-700: #1d4ed8; /* Darker blue */
--color-primary-800: #1e40af; /* Very dark blue */
--color-primary-900: #1e3a8a; /* Darkest blue */

/* Neutral Colors - Clean Grays */
--color-neutral-50: #fafafa; /* Almost white */
--color-neutral-100: #f5f5f5; /* Very light gray */
--color-neutral-200: #e5e5e5; /* Light gray */
--color-neutral-300: #d4d4d4; /* Medium light gray */
--color-neutral-400: #a3a3a3; /* Medium gray */
--color-neutral-500: #737373; /* Gray */
--color-neutral-600: #525252; /* Dark gray */
--color-neutral-700: #404040; /* Darker gray */
--color-neutral-800: #262626; /* Very dark gray */
--color-neutral-900: #171717; /* Almost black */

/* Semantic Colors */
--color-success: #10b981; /* Green for success states */
--color-warning: #f59e0b; /* Amber for warnings */
--color-error: #ef4444; /* Red for errors */
--color-info: #3b82f6; /* Blue for information */
```

#### Dark Mode Palette

```css
/* Dark Mode - Inverted with warmer tones */
--color-primary-50: #1e3a8a; /* Darkest becomes lightest */
--color-primary-100: #1d4ed8;
--color-primary-200: #2563eb;
--color-primary-300: #3b82f6;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6; /* Keep primary consistent */
--color-primary-600: #93c5fd;
--color-primary-700: #bfdbfe;
--color-primary-800: #dbeafe;
--color-primary-900: #eff6ff;

/* Dark Neutral Colors - Warmer grays */
--color-neutral-50: #0a0a0a; /* True black */
--color-neutral-100: #1a1a1a; /* Very dark */
--color-neutral-200: #2a2a2a; /* Dark */
--color-neutral-300: #3a3a3a; /* Medium dark */
--color-neutral-400: #5a5a5a; /* Medium */
--color-neutral-500: #7a7a7a; /* Light medium */
--color-neutral-600: #9a9a9a; /* Light */
--color-neutral-700: #bababa; /* Very light */
--color-neutral-800: #dadada; /* Almost white */
--color-neutral-900: #fafafa; /* White */
```

#### Semantic Color System

```css
/* Light Mode Semantic Colors */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --surface: #fafafa;
  --surface-elevated: #ffffff;
  --border: #e5e5e5;
  --border-subtle: #f5f5f5;
  --text-primary: #171717;
  --text-secondary: #525252;
  --text-muted: #737373;
  --text-placeholder: #a3a3a3;
}

/* Dark Mode Semantic Colors */
[data-theme="dark"] {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --surface: #1a1a1a;
  --surface-elevated: #2a2a2a;
  --border: #3a3a3a;
  --border-subtle: #2a2a2a;
  --text-primary: #fafafa;
  --text-secondary: #bababa;
  --text-muted: #9a9a9a;
  --text-placeholder: #7a7a7a;
}
```

### Spacing System

#### Base Unit: 4px

```css
/* Spacing scale using 4px base unit */
--space-0: 0; /* 0px */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
--space-32: 8rem; /* 128px */
```

### Border Radius System

```css
/* Consistent border radius scale */
--radius-none: 0;
--radius-sm: 0.125rem; /* 2px */
--radius-base: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-full: 9999px; /* Fully rounded */
```

### Shadow System

```css
/* Elevation shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Dark mode shadows (softer) */
[data-theme="dark"] {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 /
          0.4);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.6);
}
```

### Component Design Patterns

#### Navigation

- **Clean horizontal layout** with subtle hover states
- **Active states** with accent color indicators
- **Smooth transitions** between states (200ms ease-out)
- **Responsive collapse** to hamburger menu on mobile

#### Cards & Content Containers

- **Subtle borders** with rounded corners (8px radius)
- **Layered shadows** for depth without heaviness
- **Hover states** with gentle elevation increase
- **Content padding** of 24px for comfortable reading

#### Buttons

- **Primary**: Solid background with primary color
- **Secondary**: Outline style with hover fill
- **Ghost**: Text-only with subtle hover background
- **Sizes**: Small (32px), Medium (40px), Large (48px) heights

#### Forms & Inputs

- **Clean borders** with focus states using primary color
- **Floating labels** for modern interaction
- **Error states** with red accent and descriptive text
- **Success states** with green accent for completion

### Layout Principles

#### Grid System

- **12-column grid** with consistent gutters
- **Responsive breakpoints**: Mobile (0px), Tablet (768px), Desktop (1024px), Wide (1280px)
- **Maximum content width**: 1200px with auto margins

#### Spacing Patterns

- **Section spacing**: 80px vertical between major sections
- **Component spacing**: 24px between related components
- **Text spacing**: 16px between paragraphs
- **List spacing**: 8px between list items

#### Visual Hierarchy

- **Page titles**: 48px, bold weight, primary color
- **Section headings**: 30px, semibold weight
- **Subsection headings**: 24px, medium weight
- **Body text**: 16px, normal weight, high contrast

### Animation & Transitions

#### Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Timing

- **Micro-interactions**: 150ms (hover, focus)
- **Component transitions**: 250ms (modal open/close)
- **Page transitions**: 400ms (route changes)

#### Motion Principles

- **Subtle entrance animations** from bottom with fade
- **Staggered animations** for list items (50ms delay)
- **Respect reduced motion** preference
- **Smooth scroll behavior** for navigation

### Accessibility Standards

#### Color Contrast

- **Text on background**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **Interactive elements**: Minimum 3:1 ratio for borders

#### Focus States

- **Visible focus rings** with 2px outline
- **High contrast colors** for focus indicators
- **Logical tab order** throughout interface

#### Typography Accessibility

- **Minimum font size**: 16px for body text
- **Maximum line length**: 70 characters
- **Line height**: 1.6 for body text, 1.2 for headings

### Implementation Guidelines

#### CSS Custom Properties Structure

```css
/* Mantine integrates with CSS custom properties automatically */
/* These are handled through Mantine's theme system */

:root {
  /* Mantine CSS variables are auto-generated */
  --mantine-color-primary-0: #eff6ff;
  --mantine-color-primary-5: #3b82f6;
  --mantine-color-primary-6: #2563eb;

  /* Custom properties for advanced theming */
  --font-family-sans: "Inter", system-ui, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", monospace;
}

/* Example Mantine theme configuration */
import { createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    primary: [
      '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
      '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
});
```

#### Component Theming Pattern

```tsx
// Example button component with Mantine theme support
import { Button, createTheme } from '@mantine/core';

const theme = createTheme({
  components: {
    Button: Button.extend({
      styles: (theme) => ({
        root: {
          fontWeight: 500,
          transition: 'all 200ms ease',
          '&:focus-visible': {
            outline: `2px solid ${theme.colors.blue[5]}`,
            outlineOffset: '2px',
          },
          '&:disabled': {
            opacity: 0.5,
            pointerEvents: 'none',
          },
        },
      }),
      variants: {
        primary: (theme) => ({
          root: {
            backgroundColor: theme.colors.blue[5],
            color: theme.white,
            '&:hover': {
              backgroundColor: theme.colors.blue[6],
            },
          },
        }),
        secondary: (theme) => ({
          root: {
            border: `2px solid ${theme.colors.gray[3]}`,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: theme.colors.gray[0],
            },
          },
        }),
        ghost: (theme) => ({
          root: {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: theme.colors.gray[0],
            },
          },
        }),
      },
    }),
  },
});

// Usage with Mantine components
<Button variant="primary" size="md">Primary Button</Button>
<Button variant="secondary" size="lg">Secondary Button</Button>
```

### Brand Application

#### Logo & Identity

- **Minimalist approach** with clean typography
- **Monochrome variations** for different contexts
- **Proper spacing** around logo (minimum clear space = logo height)

#### Iconography

- **Consistent style**: Outline icons with 2px stroke width
- **24px default size** with 16px and 32px variations
- **Semantic usage** with proper ARIA labels

#### Content Photography

- **High quality images** with consistent processing
- **Proper aspect ratios**: 16:9 for hero, 4:3 for content, 1:1 for profiles
- **Alt text requirements** for all images

This design system creates a professional, modern portfolio interface that feels familiar and trustworthy while maintaining unique character through careful color choices and typography.
