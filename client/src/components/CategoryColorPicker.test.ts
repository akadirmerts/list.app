import { describe, it, expect } from "vitest";
import { CATEGORIES, COLORS } from "./CategoryColorPicker";

describe("CategoryColorPicker Constants", () => {
  describe("CATEGORIES", () => {
    it("should have valid category data", () => {
      expect(CATEGORIES).toBeDefined();
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });

    it("should have required properties for each category", () => {
      CATEGORIES.forEach((cat) => {
        expect(cat).toHaveProperty("id");
        expect(cat).toHaveProperty("label");
        expect(cat).toHaveProperty("icon");
        expect(typeof cat.id).toBe("string");
        expect(typeof cat.label).toBe("string");
        expect(typeof cat.icon).toBe("string");
      });
    });

    it("should have unique category IDs", () => {
      const ids = CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include common categories", () => {
      const ids = CATEGORIES.map((c) => c.id);
      expect(ids).toContain("work");
      expect(ids).toContain("personal");
      expect(ids).toContain("shopping");
    });
  });

  describe("COLORS", () => {
    it("should have valid color data", () => {
      expect(COLORS).toBeDefined();
      expect(COLORS.length).toBeGreaterThan(0);
    });

    it("should have required properties for each color", () => {
      COLORS.forEach((color) => {
        expect(color).toHaveProperty("id");
        expect(color).toHaveProperty("label");
        expect(color).toHaveProperty("hex");
        expect(typeof color.id).toBe("string");
        expect(typeof color.label).toBe("string");
        expect(typeof color.hex).toBe("string");
      });
    });

    it("should have unique color IDs", () => {
      const ids = COLORS.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid hex color values", () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      COLORS.forEach((color) => {
        expect(color.hex).toMatch(hexRegex);
      });
    });

    it("should include primary colors", () => {
      const ids = COLORS.map((c) => c.id);
      expect(ids).toContain("primary");
      expect(ids).toContain("secondary");
      expect(ids).toContain("accent");
    });
  });
});
