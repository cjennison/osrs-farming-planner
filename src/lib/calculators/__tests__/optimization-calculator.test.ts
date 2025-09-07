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

  it("should exclude flowers when excludeFlowers is true", () => {
    const result = calculateOptimalProgression({
      excludeFlowers: true,
    });

    for (const step of result.steps) {
      // Check that no flower crops are selected
      expect(step.optimalCrop.id).not.toMatch(
        /^(marigold|rosemary|nasturtium|woad|limpwurt|white_lily)$/,
      );
    }
  });

  it("should exclude herbs when excludeHerbs is true", () => {
    const result = calculateOptimalProgression({
      excludeHerbs: true,
    });

    for (const step of result.steps) {
      // Check that no herb crops are selected
      expect(step.optimalCrop.id).not.toMatch(
        /^(guam|marrentill|tarromin|harralander|ranarr|toadflax|irit|avantoe|kwuarm|snapdragon|cadantine|lantadyme|dwarf_weed|torstol)$/,
      );
    }
  });

  it("should exclude bushes when excludeBushes is true", () => {
    const result = calculateOptimalProgression({
      excludeBushes: true,
    });

    for (const step of result.steps) {
      // Check that no bush crops are selected
      expect(step.optimalCrop.id).not.toMatch(
        /^(redberry|cadavaberry|dwellberry|jangerberry|whiteberry|poison_ivy)$/,
      );
    }
  });
});
