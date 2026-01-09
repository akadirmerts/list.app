import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  generateSlug,
  createList,
  getListBySlug,
  updateList,
  createListItem,
  updateListItem,
  deleteListItem,
  getListItems,
} from "./db";

describe("Database Functions", () => {
  let testListId: number | null = null;
  let testSlug: string = "";

  describe("generateSlug", () => {
    it("should generate a valid slug format", () => {
      const slug = generateSlug();
      expect(slug).toMatch(/^[a-z]+-[a-z]+-\d+$/);
    });

    it("should generate different slugs on each call", () => {
      const slug1 = generateSlug();
      const slug2 = generateSlug();
      expect(slug1).not.toBe(slug2);
    });

    it("should generate slug with three parts separated by hyphens", () => {
      const slug = generateSlug();
      const parts = slug.split("-");
      expect(parts).toHaveLength(3);
    });
  });

  describe("List Operations", () => {
    it("should create a list with title", async () => {
      const list = await createList("Test Liste");
      expect(list).toBeDefined();
      expect(list?.title).toBe("Test Liste");
      expect(list?.slug).toBeDefined();
      expect(list?.id).toBeDefined();
      
      testListId = list?.id || null;
      testSlug = list?.slug || "";
    });

    it("should retrieve list by slug", async () => {
      if (!testSlug) {
        const newList = await createList("Retrieve Test");
        testSlug = newList?.slug || "";
        testListId = newList?.id || null;
      }

      const list = await getListBySlug(testSlug);
      expect(list).toBeDefined();
      expect(list?.slug).toBe(testSlug);
    });

    it("should update list title", async () => {
      if (!testListId) {
        const newList = await createList("Update Test");
        testListId = newList?.id || null;
      }

      const updated = await updateList(testListId!, "Updated Title");
      expect(updated).toBeDefined();
      expect(updated?.title).toBe("Updated Title");
    });

    it("should return null for non-existent list", async () => {
      const list = await getListBySlug("non-existent-slug-123");
      expect(list).toBeNull();
    });
  });

  describe("List Item Operations", () => {
    let itemId: number | null = null;

    beforeAll(async () => {
      if (!testListId) {
        const list = await createList("Item Test List");
        testListId = list?.id || null;
      }
    });

    it("should create a list item", async () => {
      if (!testListId) return;

      const item = await createListItem(testListId, "Test Item");
      expect(item).toBeDefined();
      expect(item?.text).toBe("Test Item");
      expect(Boolean(item?.completed)).toBe(false);
      expect(item?.order).toBeDefined();

      itemId = item?.id || null;
    });

    it("should get all items in a list", async () => {
      if (!testListId) return;

      const items = await getListItems(testListId);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("should update item completion status", async () => {
      if (!itemId) return;

      const updated = await updateListItem(itemId, { completed: true });
      expect(updated).toBeDefined();
      expect(Boolean(updated?.completed)).toBe(true);
    });

    it("should update item text", async () => {
      if (!itemId) return;

      const updated = await updateListItem(itemId, { text: "Updated Text" });
      expect(updated).toBeDefined();
      expect(updated?.text).toBe("Updated Text");
    });

    it("should delete a list item", async () => {
      if (!itemId) return;

      const success = await deleteListItem(itemId);
      expect(success).toBe(true);

      // Verify deletion
      if (testListId) {
        const items = await getListItems(testListId);
        const deleted = items.find((i) => i.id === itemId);
        expect(deleted).toBeUndefined();
      }
    });

    it("should create items with color", async () => {
      if (!testListId) return;

      const item = await createListItem(
        testListId,
        "Colored Item",
        "primary"
      );
      expect(item).toBeDefined();
      expect(item?.color).toBe("primary");
    });
  });
});
