import { createTheme, type MantineTheme } from "@mantine/core";

// OSRS-inspired earthy color palette with modern UX considerations
// Light mode: Fresh greens and earthy browns for farming theme
// Dark mode: Deeper forest and earth tones while maintaining accessibility
export const theme = createTheme({
  primaryColor: "sage",
  primaryShade: { light: 6, dark: 4 },

  colors: {
    // Primary sage green - OSRS farming theme
    sage: [
      "#f0f7f0", // Very light sage
      "#e1f0e1", // Light sage
      "#c8e6c8", // Soft sage
      "#a8d5a8", // Medium light sage
      "#7fb97f", // Medium sage
      "#5a9d5a", // Primary sage (light mode)
      "#4a8a4a", // Darker sage
      "#3a7a3a", // Deep sage (dark mode primary)
      "#2a5a2a", // Very deep sage
      "#1a4a1a", // Darkest sage
    ],

    // Secondary earth brown - complementary to sage
    earth: [
      "#f7f4f0", // Very light earth
      "#ede5d8", // Light earth
      "#ddd0bc", // Soft earth
      "#c7b299", // Medium light earth
      "#b39b7d", // Medium earth
      "#9b8463", // Primary earth
      "#8a7356", // Darker earth
      "#6d5a44", // Deep earth
      "#5a4a37", // Very deep earth
      "#3d3225", // Darkest earth
    ],

    // Nature gold - accent color for highlights
    gold: [
      "#fef9e7", // Very light gold
      "#fdf2c7", // Light gold
      "#fce588", // Soft gold
      "#facc15", // Medium light gold
      "#eab308", // Medium gold
      "#ca8a04", // Primary gold
      "#a16207", // Darker gold
      "#854d0e", // Deep gold
      "#713f12", // Very deep gold
      "#422006", // Darkest gold
    ],

    // Forest green - for secondary actions and nature elements
    forest: [
      "#ecfdf5", // Very light forest
      "#d1fae5", // Light forest
      "#a7f3d0", // Soft forest
      "#6ee7b7", // Medium light forest
      "#34d399", // Medium forest
      "#10b981", // Primary forest
      "#059669", // Darker forest
      "#047857", // Deep forest
      "#065f46", // Very deep forest
      "#064e3b", // Darkest forest
    ],
  },

  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    'JetBrains Mono, "Fira Code", Monaco, Consolas, "Courier New", monospace',

  headings: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "2.5rem", lineHeight: "1.2" },
      h2: { fontSize: "2rem", lineHeight: "1.3" },
      h3: { fontSize: "1.75rem", lineHeight: "1.3" },
      h4: { fontSize: "1.5rem", lineHeight: "1.4" },
      h5: { fontSize: "1.25rem", lineHeight: "1.5" },
      h6: { fontSize: "1rem", lineHeight: "1.5" },
    },
  },

  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    xxl: "3rem", // 48px
  },

  radius: {
    xs: "0.25rem", // 4px
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
  },

  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  breakpoints: {
    xs: "30em", // 480px
    sm: "48em", // 768px
    md: "64em", // 1024px
    lg: "74em", // 1184px
    xl: "90em", // 1440px
  },

  components: {
    Button: {
      styles: (theme: MantineTheme) => ({
        root: {
          fontWeight: 500,
          transition: "all 200ms ease",
          "&:focusVisible": {
            outline: `2px solid ${theme.colors.sage[5]}`,
            outlineOffset: "2px",
          },
        },
      }),
    },

    Card: {
      styles: (theme: MantineTheme) => ({
        root: {
          transition: "all 200ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows.md,
          },
        },
      }),
    },

    Text: {
      styles: {
        root: {
          lineHeight: 1.6,
        },
      },
    },

    Title: {
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },

    AppShell: {
      styles: (theme: MantineTheme) => ({
        main: {
          backgroundColor: "var(--mantine-color-body)",
          minHeight: "100vh",
        },
      }),
    },

    Header: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
        },
      }),
    },

    Navbar: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: "var(--mantine-color-body)",
          borderRight: `1px solid ${theme.colors.gray[3]}`,
        },
      }),
    },
  },

  other: {
    // Custom OSRS-themed transitions
    transitions: {
      fast: "150ms ease",
      normal: "250ms ease",
      slow: "400ms ease",
    },

    // Semantic color mappings for farming context
    semanticColors: {
      growth: "forest.5", // For growth indicators
      harvest: "gold.5", // For harvest ready states
      protection: "sage.5", // For protection status
      danger: "red.6", // For disease/death states
      warning: "yellow.5", // For attention needed
      success: "forest.6", // For successful operations
    },
  },
});
