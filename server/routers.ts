import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createList,
  getListBySlug,
  updateList,
  getListItems,
  createListItem,
  updateListItem,
  deleteListItem,
  reorderListItems,
  upsertSession,
  getActiveSessions,
  deleteSession,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // List operations
  lists: router({
    /**
     * Create a new list with optional title and description
     */
    create: publicProcedure
      .input(
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          password: z.string().optional(),
          expiresIn: z.enum(["1d", "1w", "1m", "inf"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        let expiresAt: Date | null = null;
        if (input.expiresIn && input.expiresIn !== "inf") {
          const now = new Date();
          if (input.expiresIn === "1d") expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          else if (input.expiresIn === "1w") expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          else if (input.expiresIn === "1m") expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        const list = await createList(input.title || "My List", input.description, input.password, expiresAt);
        if (!list) {
          throw new Error("Failed to create list");
        }
        return list;
      }),

    /**
     * Get a list by slug along with all its items
     */
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string(), password: z.string().optional() }))
      .query(async ({ input }) => {
        const list = await getListBySlug(input.slug);
        if (!list) {
          return null;
        }

        if (list.isPasswordProtected && list.password) {
          if (!input.password || input.password !== list.password) {
            throw new Error("Invalid password");
          }
        }

        const items = await getListItems(list.id);
        return {
          ...list,
          items,
          isPasswordProtected: Boolean(list.isPasswordProtected),
        };
      }),

    /**
     * Update list title and description
     */
    update: publicProcedure
      .input(
        z.object({
          listId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const list = await updateList(input.listId, input.title, input.description);
        if (!list) {
          throw new Error("Failed to update list");
        }
        return list;
      }),
  }),

  // List items operations
  items: router({
    /**
     * Add a new item to a list
     */
    add: publicProcedure
      .input(
        z.object({
          listId: z.number(),
          text: z.string(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const item = await createListItem(
          input.listId,
          input.text,
          input.color
        );
        if (!item) {
          throw new Error("Failed to create item");
        }
        return item;
      }),

    /**
     * Update an item
     */
    update: publicProcedure
      .input(
        z.object({
          itemId: z.number(),
          text: z.string().optional(),
          completed: z.boolean().optional(),
          color: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const item = await updateListItem(input.itemId, {
          text: input.text,
          completed: input.completed,
          color: input.color,
          order: input.order,
        });
        if (!item) {
          throw new Error("Failed to update item");
        }
        return item;
      }),

    /**
     * Delete an item
     */
    delete: publicProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteListItem(input.itemId);
        if (!success) {
          throw new Error("Failed to delete item");
        }
        return { success: true };
      }),

    /**
     * Reorder items
     */
    reorder: publicProcedure
      .input(
        z.object({
          updates: z.array(
            z.object({
              id: z.number(),
              order: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const success = await reorderListItems(input.updates);
        if (!success) {
          throw new Error("Failed to reorder items");
        }
        return { success: true };
      }),
  }),

  // Session management for real-time features
  sessions: router({
    /**
     * Register or update a session
     */
    register: publicProcedure
      .input(
        z.object({
          listId: z.number(),
          sessionId: z.string(),
          userAgent: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const session = await upsertSession(
          input.listId,
          input.sessionId,
          input.userAgent
        );
        if (!session) {
          throw new Error("Failed to register session");
        }
        return session;
      }),

    /**
     * Get active sessions for a list
     */
    getActive: publicProcedure
      .input(z.object({ listId: z.number() }))
      .query(async ({ input }) => {
        const sessions = await getActiveSessions(input.listId);
        return sessions;
      }),

    /**
     * Unregister a session
     */
    unregister: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const success = await deleteSession(input.sessionId);
        if (!success) {
          throw new Error("Failed to unregister session");
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
