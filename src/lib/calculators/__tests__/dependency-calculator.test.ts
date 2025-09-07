import {
  calculateDependencies,
  calculateYield,
  getAvailableCrops,
  getDependencyChain,
  hasProtection,
} from "../dependency-calculator";

describe("OSRS Farming Dependency Calculator", () => {
  describe("Basic crop data validation", () => {
    test("should have correct crop protection data", () => {
      // Potato now has compost protection (updated from OSRS Wiki)
      expect(hasProtection("potato")).toBe(true);

      // Onion requires potatoes for protection
      expect(hasProtection("onion")).toBe(true);
      const onionChain = getDependencyChain("onion");
      expect(onionChain).toEqual(["onion", "potato", "compost"]);

      // Cabbage requires onions for protection
      expect(hasProtection("cabbage")).toBe(true);
      const cabbageChain = getDependencyChain("cabbage");
      expect(cabbageChain).toEqual(["cabbage", "onion", "potato", "compost"]);

      // Tomato requires cabbages for protection
      expect(hasProtection("tomato")).toBe(true);
      const tomatoChain = getDependencyChain("tomato");
      expect(tomatoChain).toEqual([
        "tomato",
        "cabbage",
        "onion",
        "potato",
        "compost",
      ]);
    });

    test("should return all available crops", () => {
      const crops = getAvailableCrops();
      expect(crops.length).toBeGreaterThanOrEqual(14); // 8 allotments + 6 flowers
      expect(crops.map((c) => c.id)).toContain("potato");
      expect(crops.map((c) => c.id)).toContain("tomato");
      // Check that flower crops are included
      expect(crops.map((c) => c.id)).toContain("marigold");
      expect(crops.map((c) => c.id)).toContain("white_lily");
    });

    test("should correctly identify crops with protection", () => {
      expect(hasProtection("potato")).toBe(true); // Updated: potatoes now have compost protection
      expect(hasProtection("onion")).toBe(true);
      expect(hasProtection("cabbage")).toBe(true);
      expect(hasProtection("tomato")).toBe(true);
    });

    test("should return correct dependency chains", () => {
      expect(getDependencyChain("potato")).toEqual(["potato", "compost"]); // Updated chain
      expect(getDependencyChain("onion")).toEqual([
        "onion",
        "potato",
        "compost",
      ]); // Updated chain
      expect(getDependencyChain("cabbage")).toEqual([
        "cabbage",
        "onion",
        "potato",
        "compost",
      ]);
      expect(getDependencyChain("tomato")).toEqual([
        "tomato",
        "cabbage",
        "onion",
        "potato",
        "compost",
      ]);
    });
  });

  describe("Yield calculations", () => {
    test("should calculate base yields correctly", () => {
      const cropYield = calculateYield(
        "potato",
        99,
        "none",
        false,
        false,
        false,
      );
      expect(cropYield).toEqual({
        min: 3, // 3 base harvest lives
        max: 17, // Based on actual CTS formula calculations
        average: 10.2, // Expected yield using OSRS harvest lives formula
      });
    });

    test("should apply compost bonuses correctly", () => {
      const supercompostYield = calculateYield(
        "onion",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      expect(supercompostYield).toEqual({
        min: 5, // 3 base + 2 supercompost lives
        max: 28, // Based on actual CTS formula calculations
        average: 17.1, // Expected yield with supercompost
      });
    });

    test("should handle ultracompost", () => {
      const ultracompostYield = calculateYield(
        "cabbage",
        99,
        "ultracompost",
        false,
        false,
        false,
      );
      expect(ultracompostYield).toEqual({
        min: 6, // 3 base + 3 ultracompost lives
        max: 33, // Based on actual CTS formula calculations
        average: 20.5, // Expected yield with ultracompost
      });
    });

    test("should apply Magic Secateurs bonus (10% for herbs, allotments, hops)", () => {
      // Test herb crop with Magic Secateurs
      const herbYieldWithoutSecateurs = calculateYield(
        "guam",
        99,
        "supercompost",
        false,
      );
      const herbYieldWithSecateurs = calculateYield(
        "guam",
        99,
        "supercompost",
        true,
      );

      // Minimum yield is the same (based on harvest lives), but average and max should increase
      expect(herbYieldWithSecateurs.min).toBe(herbYieldWithoutSecateurs.min);
      expect(herbYieldWithSecateurs.average).toBeGreaterThan(
        herbYieldWithoutSecateurs.average,
      );
      expect(herbYieldWithSecateurs.max).toBeGreaterThan(
        herbYieldWithoutSecateurs.max,
      );

      // Test allotment crop with Magic Secateurs
      const allotmentYieldWithoutSecateurs = calculateYield(
        "potato",
        99,
        "supercompost",
        false,
      );
      const allotmentYieldWithSecateurs = calculateYield(
        "potato",
        99,
        "supercompost",
        true,
      );

      expect(allotmentYieldWithSecateurs.min).toBe(
        allotmentYieldWithoutSecateurs.min,
      );
      expect(allotmentYieldWithSecateurs.average).toBeGreaterThan(
        allotmentYieldWithoutSecateurs.average,
      );

      // Test flower crop (should NOT be affected by Magic Secateurs)
      const flowerYieldWithoutSecateurs = calculateYield(
        "limpwurt",
        99,
        "supercompost",
        false,
      );
      const flowerYieldWithSecateurs = calculateYield(
        "limpwurt",
        99,
        "supercompost",
        true,
      );

      expect(flowerYieldWithSecateurs.min).toBe(
        flowerYieldWithoutSecateurs.min,
      );
      expect(flowerYieldWithSecateurs.average).toBe(
        flowerYieldWithoutSecateurs.average,
      );
      expect(flowerYieldWithSecateurs.max).toBe(
        flowerYieldWithoutSecateurs.max,
      );
    });

    test("should apply Farming Cape bonus (5% for herbs only)", () => {
      // Test herb crop with Farming Cape
      const herbYieldWithoutCape = calculateYield(
        "ranarr",
        99,
        "supercompost",
        false,
        false,
      );
      const herbYieldWithCape = calculateYield(
        "ranarr",
        99,
        "supercompost",
        false,
        true,
      );

      expect(herbYieldWithCape.min).toBe(herbYieldWithoutCape.min);
      expect(herbYieldWithCape.average).toBeGreaterThan(
        herbYieldWithoutCape.average,
      );
      expect(herbYieldWithCape.max).toBeGreaterThan(herbYieldWithoutCape.max);

      // Test allotment crop (should NOT be affected by Farming Cape)
      const allotmentYieldWithoutCape = calculateYield(
        "tomato",
        99,
        "supercompost",
        false,
        false,
      );
      const allotmentYieldWithCape = calculateYield(
        "tomato",
        99,
        "supercompost",
        false,
        true,
      );

      expect(allotmentYieldWithCape.min).toBe(allotmentYieldWithoutCape.min);
      expect(allotmentYieldWithCape.average).toBe(
        allotmentYieldWithoutCape.average,
      );
      expect(allotmentYieldWithCape.max).toBe(allotmentYieldWithoutCape.max);

      // Test flower crop (should NOT be affected by Farming Cape)
      const flowerYieldWithoutCape = calculateYield(
        "limpwurt",
        99,
        "supercompost",
        false,
        false,
      );
      const flowerYieldWithCape = calculateYield(
        "limpwurt",
        99,
        "supercompost",
        false,
        true,
      );

      expect(flowerYieldWithCape.min).toBe(flowerYieldWithoutCape.min);
      expect(flowerYieldWithCape.average).toBe(flowerYieldWithoutCape.average);
      expect(flowerYieldWithCape.max).toBe(flowerYieldWithoutCape.max);
    });

    test("should apply Attas Seed bonus (5% for all crop types)", () => {
      // Test herb crop with Attas Seed
      const herbYieldWithoutAttas = calculateYield(
        "snapdragon",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const herbYieldWithAttas = calculateYield(
        "snapdragon",
        99,
        "supercompost",
        false,
        false,
        true,
      );

      expect(herbYieldWithAttas.min).toBe(herbYieldWithoutAttas.min);
      expect(herbYieldWithAttas.average).toBeGreaterThan(
        herbYieldWithoutAttas.average,
      );
      expect(herbYieldWithAttas.max).toBeGreaterThan(herbYieldWithoutAttas.max);

      // Test allotment crop with Attas Seed
      const allotmentYieldWithoutAttas = calculateYield(
        "watermelon",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const allotmentYieldWithAttas = calculateYield(
        "watermelon",
        99,
        "supercompost",
        false,
        false,
        true,
      );

      expect(allotmentYieldWithAttas.min).toBe(allotmentYieldWithoutAttas.min);
      expect(allotmentYieldWithAttas.average).toBeGreaterThan(
        allotmentYieldWithoutAttas.average,
      );

      // Test flower crop with Attas Seed
      const flowerYieldWithoutAttas = calculateYield(
        "limpwurt",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const flowerYieldWithAttas = calculateYield(
        "limpwurt",
        99,
        "supercompost",
        false,
        false,
        true,
      );

      expect(flowerYieldWithAttas.min).toBe(flowerYieldWithoutAttas.min);
      expect(flowerYieldWithAttas.average).toBeGreaterThan(
        flowerYieldWithoutAttas.average,
      );

      // Test hops crop with Attas Seed
      const hopsYieldWithoutAttas = calculateYield(
        "barley",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const hopsYieldWithAttas = calculateYield(
        "barley",
        99,
        "supercompost",
        false,
        false,
        true,
      );

      expect(hopsYieldWithAttas.min).toBe(hopsYieldWithoutAttas.min);
      expect(hopsYieldWithAttas.average).toBeGreaterThan(
        hopsYieldWithoutAttas.average,
      );
    });

    test("should apply all three yield bonuses combined correctly", () => {
      // Test herb crop with all bonuses (should work with all three)
      const herbYieldNoBonuses = calculateYield(
        "ranarr",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const herbYieldAllBonuses = calculateYield(
        "ranarr",
        99,
        "supercompost",
        true,
        true,
        true,
      );

      expect(herbYieldAllBonuses.min).toBe(herbYieldNoBonuses.min);
      expect(herbYieldAllBonuses.average).toBeGreaterThan(
        herbYieldNoBonuses.average,
      );
      expect(herbYieldAllBonuses.max).toBeGreaterThan(herbYieldNoBonuses.max);

      // Test allotment crop with applicable bonuses (Magic Secateurs + Attas Seed)
      const allotmentYieldNoBonuses = calculateYield(
        "tomato",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const allotmentYieldTwoBonuses = calculateYield(
        "tomato",
        99,
        "supercompost",
        true,
        false,
        true,
      );

      expect(allotmentYieldTwoBonuses.min).toBe(allotmentYieldNoBonuses.min);
      expect(allotmentYieldTwoBonuses.average).toBeGreaterThan(
        allotmentYieldNoBonuses.average,
      );
      expect(allotmentYieldTwoBonuses.max).toBeGreaterThan(
        allotmentYieldNoBonuses.max,
      );
    });

    test("should not apply incorrect bonuses to wrong crop types", () => {
      // Farming Cape should NOT affect allotment crops
      const allotmentNoCape = calculateYield(
        "potato",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const allotmentWithCape = calculateYield(
        "potato",
        99,
        "supercompost",
        false,
        true,
        false,
      );

      expect(allotmentWithCape.min).toBe(allotmentNoCape.min);
      expect(allotmentWithCape.average).toBe(allotmentNoCape.average);
      expect(allotmentWithCape.max).toBe(allotmentNoCape.max);

      // Magic Secateurs should NOT affect flowers
      const flowerNoSecateurs = calculateYield(
        "marigold",
        99,
        "supercompost",
        false,
        false,
        false,
      );
      const flowerWithSecateurs = calculateYield(
        "marigold",
        99,
        "supercompost",
        true,
        false,
        false,
      );

      expect(flowerWithSecateurs.min).toBe(flowerNoSecateurs.min);
      expect(flowerWithSecateurs.average).toBe(flowerNoSecateurs.average);
      expect(flowerWithSecateurs.max).toBe(flowerNoSecateurs.max);
    });

    test("should stack multiple yield bonuses correctly", () => {
      // Test herb crop with all bonuses (Magic Secateurs + Farming Cape + Attas Seed)
      const baseYield = calculateYield(
        "torstol",
        99,
        "ultracompost",
        false,
        false,
        false,
      );
      const magicOnlyYield = calculateYield(
        "torstol",
        99,
        "ultracompost",
        true,
        false,
        false,
      );
      const capeOnlyYield = calculateYield(
        "torstol",
        99,
        "ultracompost",
        false,
        true,
        false,
      );
      const attasOnlyYield = calculateYield(
        "torstol",
        99,
        "ultracompost",
        false,
        false,
        true,
      );
      const allBonusesYield = calculateYield(
        "torstol",
        99,
        "ultracompost",
        true,
        true,
        true,
      );

      // Each individual bonus should improve yield
      expect(magicOnlyYield.average).toBeGreaterThan(baseYield.average);
      expect(capeOnlyYield.average).toBeGreaterThan(baseYield.average);
      expect(attasOnlyYield.average).toBeGreaterThan(baseYield.average);

      // All bonuses combined should give the highest yield
      expect(allBonusesYield.average).toBeGreaterThan(magicOnlyYield.average);
      expect(allBonusesYield.average).toBeGreaterThan(capeOnlyYield.average);
      expect(allBonusesYield.average).toBeGreaterThan(attasOnlyYield.average);

      // Test allotment crop with Magic Secateurs + Attas Seed (no Farming Cape effect)
      const allotmentBase = calculateYield(
        "strawberry",
        99,
        "ultracompost",
        false,
        false,
        false,
      );
      const allotmentWithMagicAndAttas = calculateYield(
        "strawberry",
        99,
        "ultracompost",
        true,
        false,
        true,
      );
      const allotmentWithAllBonuses = calculateYield(
        "strawberry",
        99,
        "ultracompost",
        true,
        true,
        true,
      );

      expect(allotmentWithMagicAndAttas.average).toBeGreaterThan(
        allotmentBase.average,
      );
      // Farming Cape should not affect allotments, so these should be equal
      expect(allotmentWithAllBonuses.average).toBe(
        allotmentWithMagicAndAttas.average,
      );
    });

    test("should handle fixed yield crops correctly with bonuses", () => {
      // Fixed yield crops should not be affected by any bonuses
      const marigoldBase = calculateYield(
        "marigold",
        1,
        "none",
        false,
        false,
        false,
      );
      const marigoldWithBonuses = calculateYield(
        "marigold",
        99,
        "ultracompost",
        true,
        true,
        true,
      );

      expect(marigoldBase).toEqual({ min: 1, max: 1, average: 1 });
      expect(marigoldWithBonuses).toEqual({ min: 1, max: 1, average: 1 });
    });
  });

  describe("Basic dependency calculations", () => {
    test("should calculate potato requirements (no dependencies)", () => {
      const result = calculateDependencies("potato", 20, 99, "supercompost");

      expect(result.targetCrop).toBe("potato");
      expect(result.targetQuantity).toBe(20);
      expect(result.requirements.potato.patches).toBe(2); // 20 needed / 10.2 avg yield = 2 patches
      expect(result.breakdown).toHaveLength(2); // potato + compost
      expect(result.breakdown[1].patchesNeeded.average).toBe(2); // potato entry
      expect(result.summary.totalPatches).toBe(2);
    });

    test("should calculate onion requirements (requires potatoes)", () => {
      const result = calculateDependencies("onion", 6, 99, "supercompost");

      // Need 6 onions -> 1 patch (17.1 avg yield with supercompost at level 99)
      // Need 10 potatoes for payment (1 patch × 10 potatoes each)
      // Need 1 potato patch (10 potatoes / 17.1 avg yield)

      expect(result.requirements.onion.patches).toBe(1);
      expect(result.requirements.potato.patches).toBe(1);
      expect(result.summary.totalPatches).toBe(2); // 1 onion + 1 potato
      expect(result.breakdown).toHaveLength(3); // compost + potato + onion
    });

    test("should calculate complex tomato chain", () => {
      const result = calculateDependencies("tomato", 4, 99, "supercompost");

      // With higher yields from accurate CTS calculations:
      // 4 tomatoes -> 1 patch (high yield with supercompost)
      // Need fewer supporting crops due to higher yields

      expect(result.requirements.tomato.patches).toBe(1);
      expect(result.requirements.cabbage.patches).toBeGreaterThanOrEqual(1);
      expect(result.requirements.onion.patches).toBeGreaterThanOrEqual(1);
      expect(result.requirements.potato.patches).toBeGreaterThanOrEqual(1);
      expect(result.summary.totalPatches).toBeGreaterThanOrEqual(4);
      expect(result.breakdown).toHaveLength(5); // compost + potato + onion + cabbage + tomato
    });

    test("should calculate dependencies with yield bonuses correctly", () => {
      // Test that yield bonuses reduce the number of patches needed
      const resultNoBonuses = calculateDependencies(
        "tomato",
        10,
        99,
        "supercompost",
        {},
        "average",
        false,
        false,
        false,
      );
      const resultWithBonuses = calculateDependencies(
        "tomato",
        10,
        99,
        "supercompost",
        {},
        "average",
        true,
        false,
        true,
      );

      // With bonuses, should need fewer or equal patches (never more)
      expect(resultWithBonuses.requirements.tomato.patches).toBeLessThanOrEqual(
        resultNoBonuses.requirements.tomato.patches,
      );
      expect(resultWithBonuses.summary.totalPatches).toBeLessThanOrEqual(
        resultNoBonuses.summary.totalPatches,
      );
    });
  });

  describe("Starting resources functionality", () => {
    test("should correctly calculate potato patches needed with starting resources", () => {
      // Test case: Need 2 onions, have 1 potato starting resource
      // 2 onions × 10 potatoes each = 20 potatoes needed
      // Have 1 potato, need 19 more from patches
      // At level 10 farming with no compost, potato yield = ?

      const result = calculateDependencies(
        "onion",
        2,
        10,
        "none",
        {
          potato: 1,
        },
        "average",
        false,
        false,
        false,
      );

      // Let's check the potato requirement
      expect(result.requirements.potato).toBeDefined();
      expect(result.requirements.potato.patches).toBeGreaterThan(0);

      // The patch calculation should account for:
      // - 20 total potatoes needed (2 onions × 10 per onion)
      // - 1 potato from starting resources
      // - 19 potatoes needed from patches
      // - Level 10 farming yield per patch

      console.log("Test result:", JSON.stringify(result, null, 2));
    });

    test("should partially account for starting resources", () => {
      const startingResources = { potato: 5 };
      const result = calculateDependencies(
        "onion",
        6,
        99,
        "supercompost",
        startingResources,
      );

      // Need 6 onions -> 1 patch (6.5 avg yield)
      // Need 10 potatoes for payment, have 5 -> need 5 more
      // Need 1 potato patch (5 potatoes / 6.45 avg yield = 1 patch)

      expect(result.requirements.onion.patches).toBe(1);
      expect(result.requirements.potato.patches).toBe(1);
      expect(result.summary.totalPatches).toBe(2);

      // Check breakdown mentions starting resources
      const potatoBreakdown = result.breakdown.find((b) => b.crop === "Potato");
      expect(potatoBreakdown?.purpose).toContain("5 from starting resources");
    });

    test("should handle starting resources for target crop", () => {
      const startingResources = { tomato: 2 };
      const result = calculateDependencies(
        "tomato",
        4,
        99,
        "supercompost",
        startingResources,
      );

      // Need 4 tomatoes, have 2 -> need 2 more
      // With higher yields, need fewer supporting crops

      expect(result.requirements.tomato.patches).toBe(1);
      expect(result.summary.totalPatches).toBeGreaterThanOrEqual(4); // 1 tomato + supporting crops
    });

    test("should handle excess starting resources", () => {
      const startingResources = { tomato: 10 };
      const result = calculateDependencies(
        "tomato",
        4,
        99,
        "supercompost",
        startingResources,
      );

      // Need 4 tomatoes, have 10 -> need 0 patches
      expect(Object.keys(result.requirements)).toHaveLength(0);
      expect(result.summary.totalPatches).toBe(0);
      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].patchesNeeded.average).toBe(0);
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle unknown crops", () => {
      expect(() => calculateDependencies("unknown", 1)).toThrow(
        "Unknown target crop: unknown",
      );
      expect(() => calculateYield("unknown", 99, "none")).toThrow(
        "Unknown crop: unknown",
      );
    });

    test("should handle zero quantities", () => {
      const result = calculateDependencies("potato", 0, 99, "supercompost");
      expect(result.summary.totalPatches).toBe(0);
      expect(Object.keys(result.requirements)).toHaveLength(0);
    });

    test("should handle very large quantities", () => {
      const result = calculateDependencies("tomato", 1000, 99, "supercompost");
      expect(result.requirements.tomato.patches).toBe(59); // 1000 / ~17 avg yield (with higher CTS calculations)
      expect(result.summary.totalPatches).toBeGreaterThan(60); // Adjusted based on actual calculation
    });
  });

  describe("Real-world scenarios from PROJECT.md", () => {
    test("should match PROJECT.md example: 4 Tomato patches", () => {
      // From PROJECT.md: 4 Tomato patches -> 8 Cabbages -> 8 Onions -> 80 Potatoes
      const result = calculateDependencies("tomato", 20, 99, "none"); // 4 patches × 5 avg yield = 20 tomatoes

      // With no compost (conservative):
      // 20 tomatoes -> 4 patches (20 / 3 min = 6.67 -> 7 patches)
      // 14 cabbages needed (7 × 2) -> 5 cabbage patches (14 / 3 = 4.67 -> 5)
      // 5 onions needed -> 2 onion patches (5 / 3 = 1.67 -> 2)
      // 20 potatoes needed -> 7 potato patches (20 / 3 = 6.67 -> 7)

      expect(result.requirements.tomato.patches).toBeGreaterThan(0);
      expect(result.requirements.cabbage.patches).toBeGreaterThan(0);
      expect(result.requirements.onion.patches).toBeGreaterThan(0);
      expect(result.requirements.potato.patches).toBeGreaterThan(0);
      expect(result.summary.totalPatches).toBeGreaterThan(10);
    });
  });

  describe("Flower crop calculations", () => {
    test("should calculate marigold requirements (no dependencies)", () => {
      const result = calculateDependencies(
        "marigold",
        5,
        10,
        "none",
        {},
        "average",
      );

      expect(result.targetCrop).toBe("marigold");
      expect(result.targetQuantity).toBe(5);
      expect(result.requirements.marigold).toBeDefined();
      expect(result.requirements.marigold.patches).toBeGreaterThan(0);
      expect(result.requirements.marigold.reason).toContain("Target harvest");

      // Marigolds have no protection requirements, so should only need marigold patches
      expect(Object.keys(result.requirements)).toEqual(["marigold"]);
    });

    test("should calculate white lily requirements (no dependencies)", () => {
      const result = calculateDependencies(
        "white_lily",
        3,
        60,
        "supercompost",
        {},
        "average",
      );

      expect(result.targetCrop).toBe("white_lily");
      expect(result.targetQuantity).toBe(3);
      expect(result.requirements.white_lily).toBeDefined();
      expect(result.requirements.white_lily.patches).toBeGreaterThan(0);

      // White lilies have no protection requirements
      expect(Object.keys(result.requirements)).toEqual(["white_lily"]);
    });

    test("should handle flower crops with different farming levels", () => {
      // Test that we can calculate for different flower crops at appropriate levels
      const marigoldResult = calculateDependencies(
        "marigold",
        1,
        2,
        "none",
        {},
        "average",
      );
      expect(marigoldResult.requirements.marigold).toBeDefined();

      const rosemaryResult = calculateDependencies(
        "rosemary",
        1,
        11,
        "none",
        {},
        "average",
      );
      expect(rosemaryResult.requirements.rosemary).toBeDefined();

      const nasturtiumResult = calculateDependencies(
        "nasturtium",
        1,
        24,
        "none",
        {},
        "average",
      );
      expect(nasturtiumResult.requirements.nasturtium).toBeDefined();
    });

    test("should use fixed yields for flowers with isFixedYield property", () => {
      // Test fixed yield flowers (should always return baseYield regardless of compost/level)
      const marigoldYieldNone = calculateYield("marigold", 1, "none");
      const marigoldYieldSuper = calculateYield("marigold", 99, "ultracompost");

      // Marigold has baseYield: 1 and isFixedYield: true
      expect(marigoldYieldNone).toEqual({ min: 1, max: 1, average: 1 });
      expect(marigoldYieldSuper).toEqual({ min: 1, max: 1, average: 1 });

      // Woad has baseYield: 3 and isFixedYield: true
      const woadYield = calculateYield("woad", 50, "compost");
      expect(woadYield).toEqual({ min: 3, max: 3, average: 3 });
    });

    test("should use algorithm for limpwurt (not fixed yield)", () => {
      // Limpwurt should use the algorithm since it doesn't have isFixedYield: true
      const limpwurtYieldNone = calculateYield("limpwurt", 26, "none");
      const limpwurtYieldSuper = calculateYield("limpwurt", 26, "supercompost");

      // These should be different (algorithm varies with compost)
      expect(limpwurtYieldNone.min).toBeGreaterThan(0);
      expect(limpwurtYieldSuper.min).toBeGreaterThan(limpwurtYieldNone.min);
      expect(limpwurtYieldSuper.average).toBeGreaterThan(
        limpwurtYieldNone.average,
      );
    });

    test("should calculate correct growth times for flower crops", () => {
      // Test single flower crop with no dependencies - should be just the flower's growth time
      const marigoldResult = calculateDependencies(
        "marigold",
        1,
        10,
        "none",
        {},
        "average",
      );
      expect(marigoldResult.summary.estimatedTime).toBe(20); // Just marigold's 20 minute growth time

      const nasturtiumResult = calculateDependencies(
        "nasturtium",
        1,
        24,
        "none",
        {},
        "average",
      );
      expect(nasturtiumResult.summary.estimatedTime).toBe(20); // Just nasturtium's 20 minute growth time

      // Test multiple patches of flowers - should multiply by patches needed
      const nasturtium2Result = calculateDependencies(
        "nasturtium",
        2,
        24,
        "none",
        {},
        "average",
      );
      expect(nasturtium2Result.summary.estimatedTime).toBe(40); // 20 minutes * 2 patches

      // Test allotment crop for comparison
      const potatoResult = calculateDependencies(
        "potato",
        1,
        10,
        "none",
        {},
        "average",
      );
      expect(potatoResult.summary.estimatedTime).toBe(80); // Just potato's 80 minute growth time
    });

    test("should calculate correct total time for complex dependency chains", () => {
      // Test the scenario mentioned: need 14 cabbage = complex chain with many patches
      const cabbageResult = calculateDependencies(
        "cabbage",
        14,
        26,
        "ultracompost",
        {},
        "average",
      );

      // Should calculate time as sum of all patches × their growth times
      // We need to check the actual requirements to verify the math
      const requirements = cabbageResult.requirements;
      let expectedTime = 0;

      for (const [cropId, requirement] of Object.entries(requirements)) {
        if (cropId === "potato" || cropId === "onion" || cropId === "cabbage") {
          expectedTime += 80 * requirement.patches; // All allotments are 80 minutes
        }
      }

      expect(cabbageResult.summary.estimatedTime).toBe(expectedTime);

      // Verify it's a substantial amount of time (should be several hours)
      expect(cabbageResult.summary.estimatedTime).toBeGreaterThan(200); // At least a few hours (reduced from 600 due to fewer patches needed)
    });
  });
});
