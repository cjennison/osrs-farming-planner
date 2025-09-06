'use client';

import { AppHeader } from "@/components/layout/AppHeader";
import { FarmingCalculator } from "@/components/ui/FarmingCalculator";

export default function CalculatorPage() {
  return (
    <AppHeader>
      <FarmingCalculator />
    </AppHeader>
  );
}
