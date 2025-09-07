import { calculateOptimalProgression } from "../optimization-calculator";

describe("Optimization Calculator", () => {
  it("should calculate optimal progression with basic options", () => {
    const result = calculateOptimalProgression({
      compostType: "none",
      hasAltasSeed: false,
      hasSecateurs: false,
      kandarinDiary: "none",
      yieldStrategy: "average",
    });

    expect(result.steps).toBeDefined();
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.totalPatchesUsed).toBeGreaterThan(0);
    expect(result.totalExpGained).toBeGreaterThan(0);
  });

  it("should have consistent level progression", () => {
    const result = calculateOptimalProgression();

    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      expect(step.fromLevel).toBe(i + 1);
      expect(step.toLevel).toBe(i + 2);
      expect(step.expRequired).toBeGreaterThan(0);
      expect(step.patchesNeeded).toBeGreaterThan(0);
    }
  });

  it("should select crops that are available at the current level", () => {
    const result = calculateOptimalProgression();

    for (const step of result.steps) {
      expect(step.optimalCrop.farmingLevel).toBeLessThanOrEqual(step.fromLevel);
    }
  });
});
