import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ColorSchemeScript } from '@mantine/core';
import { ThemeProvider } from "@/styles/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OSRS Farming Planner - Ironman Resource Calculator",
  description: "The ultimate farming assistant for Old School RuneScape Ironmen. Calculate crop dependencies, optimize planting sequences, and plan self-sufficient farming strategies.",
  keywords: ["OSRS", "Old School RuneScape", "farming", "calculator", "ironman", "planner"],
  authors: [{ name: "OSRS Farming Planner" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "OSRS Farming Planner - Ironman Resource Calculator",
    description: "Calculate complex crop dependencies and optimize your farming strategy for OSRS Ironman mode.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OSRS Farming Planner",
    description: "Calculate complex crop dependencies and optimize your farming strategy for OSRS Ironman mode.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
