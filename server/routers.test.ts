import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tRPC Routers", () => {
  describe("lists.create", () => {
    it("should create a list with title", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lists.create({
        title: "Test Liste",
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("Test Liste");
      expect(result.slug).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it("should create a list with optional description", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lists.create({
        title: "Liste with Description",
        description: "Test description",
      });

      expect(result).toBeDefined();
      expect(result.description).toBe("Test description");
    });
  });

  describe("lists.getBySlug", () => {
    it("should return null for non-existent slug", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lists.getBySlug({
        slug: "non-existent-slug-xyz",
      });

      expect(result).toBeNull();
    });

    it("should return list with items", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Create a list first
      const created = await caller.lists.create({
        title: "Liste for Retrieval",
      });

      // Retrieve it
      const result = await caller.lists.getBySlug({
        slug: created.slug,
      });

      expect(result).toBeDefined();
      expect(result?.slug).toBe(created.slug);
      expect(result?.title).toBe("Liste for Retrieval");
      expect(Array.isArray(result?.items)).toBe(true);
    });
  });

  describe("items.add", () => {
    it("should add item to a list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Create a list
      const list = await caller.lists.create({ title: "Item Test List" });

      // Add item
      const result = await caller.items.add({
        listId: list.id,
        text: "Test Item",
      });

      expect(result).toBeDefined();
      expect(result.text).toBe("Test Item");
      expect(Boolean(result.completed)).toBe(false);
      expect(result.listId).toBeGreaterThan(0);
    });

    it("should add item with category and color", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const list = await caller.lists.create({ title: "Colored Items List" });

      const result = await caller.items.add({
        listId: list.id,
        text: "Colored Item",
        color: "primary",
      });

      expect(result.color).toBe("primary");
    });
  });

  describe("items.update", () => {
    it("should update item text", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Setup
      const list = await caller.lists.create({ title: "Update Test" });
      const item = await caller.items.add({
        listId: list.id,
        text: "Original Text",
      });

      // Update
      const result = await caller.items.update({
        itemId: item.id,
        text: "Updated Text",
      });

      expect(result.text).toBe("Updated Text");
    });

    it("should update item completion status", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const list = await caller.lists.create({ title: "Complete Test" });
      const item = await caller.items.add({
        listId: list.id,
        text: "Item to Complete",
      });

      const result = await caller.items.update({
        itemId: item.id,
        completed: true,
      });

      expect(Boolean(result.completed)).toBe(true);
    });
  });

  describe("items.delete", () => {
    it("should delete an item", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const list = await caller.lists.create({ title: "Delete Test" });
      const item = await caller.items.add({
        listId: list.id,
        text: "Item to Delete",
      });

      const result = await caller.items.delete({
        itemId: item.id,
      });

      expect(result).toBeDefined();
    });
  });

  describe("sessions.register", () => {
    it("should register a session", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const list = await caller.lists.create({ title: "Session Test" });

      const result = await caller.sessions.register({
        listId: list.id,
        sessionId: "test-session-123",
        userAgent: "Test Browser",
      });

      expect(result).toBeDefined();
      expect(result.sessionId).toBe("test-session-123");
      expect(result.listId).toBeGreaterThan(0);
    });
  });

  describe("sessions.getActive", () => {
    it("should get active sessions for a list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const list = await caller.lists.create({ title: "Active Sessions Test" });

      // Register a session
      await caller.sessions.register({
        listId: list.id,
        sessionId: "active-session-1",
      });

      // Get active sessions
      const result = await caller.sessions.getActive({
        listId: list.id,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeDefined();
    });
  });
});
