import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lists, listItems, sessions, List, ListItem, Session } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Generate a memorable unique slug like "happy-fox-42"
 * Uses adjectives, animals, and random numbers
 */
const NATO_PHONETIC = [
  "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel",
  "India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
  "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey",
  "Xray", "Yankee", "Zulu"
];

export function generateSlug(title?: string): string {
  // NATO Style: Alpha-Bravo-123
  const w1 = NATO_PHONETIC[Math.floor(Math.random() * NATO_PHONETIC.length)];
  const w2 = NATO_PHONETIC[Math.floor(Math.random() * NATO_PHONETIC.length)];
  const num = Math.floor(Math.random() * 900) + 100; // 100-999

  return `${w1}-${w2}-${num}`;
}

/**
 * Create a new list
 */
export async function createList(
  title: string,
  description?: string,
  password?: string,
  expiresAt?: Date | null
): Promise<List | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create list: database not available");
    return null;
  }

  try {
    const slug = generateSlug();
    const result = await db.insert(lists).values({
      slug,
      title: title || "My List",
      description: description || null,
      password: password || null,
      isPasswordProtected: password ? 1 : 0,
      expiresAt: expiresAt || null,
    });

    // Fetch and return the created list
    const created = await db.select().from(lists).where(eq(lists.slug, slug)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create list:", error);
    throw error;
  }
}

/**
 * Get a list by slug
 */
export async function getListBySlug(slug: string): Promise<List | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get list: database not available");
    return null;
  }

  try {
    const result = await db.select().from(lists).where(eq(lists.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get list:", error);
    throw error;
  }
}

/**
 * Update list title and description
 */
export async function updateList(listId: number, title?: string, description?: string): Promise<List | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update list: database not available");
    return null;
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      // No updates, just fetch and return
      const result = await db.select().from(lists).where(eq(lists.id, listId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }

    await db.update(lists).set(updateData).where(eq(lists.id, listId));

    const result = await db.select().from(lists).where(eq(lists.id, listId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update list:", error);
    throw error;
  }
}

/**
 * Get all items in a list, ordered by order field
 */
export async function getListItems(listId: number): Promise<ListItem[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get list items: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(listItems)
      .where(eq(listItems.listId, listId))
      .orderBy(listItems.order);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get list items:", error);
    throw error;
  }
}

/**
 * Create a new list item
 */
export async function createListItem(
  listId: number,
  text: string,
  color?: string
): Promise<ListItem | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create list item: database not available");
    return null;
  }

  try {
    // Get the min order for this list to add to top
    const minOrderResult = await db
      .select()
      .from(listItems)
      .where(eq(listItems.listId, listId))
      .orderBy(listItems.order) // Default is ASC
      .limit(1);

    const minOrder = minOrderResult.length > 0 ? (minOrderResult[0]?.order || 0) : 0;

    const result = await db.insert(listItems).values({
      listId,
      text,
      color: color || "primary",
      // If list is empty (minOrder is 0), start at 0.
      // If has items (e.g. min is 1), new item is 0.
      // If min is -5, new item is -6.
      // We subtract 1 from the minimum found (or 0 if empty/no items yet) 
      // But wait if empty, minOrder=0. We want first item to be say 0.
      // If we used minOrder - 1 on empty, first item is -1. That's fine.
      order: minOrderResult.length > 0 ? minOrder - 1 : 0,
    });

    // Fetch and return the created item
    const created = await db
      .select()
      .from(listItems)
      .where(eq(listItems.listId, listId))
      .orderBy(desc(listItems.id))
      .limit(1);

    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create list item:", error);
    throw error;
  }
}

/**
 * Update a list item
 */
export async function updateListItem(
  itemId: number,
  updates: Partial<{ text: string; completed: boolean; category: string; color: string; order: number }>
): Promise<ListItem | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update list item: database not available");
    return null;
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.order !== undefined) updateData.order = updates.order;

    if (Object.keys(updateData).length === 0) {
      const result = await db.select().from(listItems).where(eq(listItems.id, itemId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }

    await db.update(listItems).set(updateData).where(eq(listItems.id, itemId));

    const result = await db.select().from(listItems).where(eq(listItems.id, itemId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update list item:", error);
    throw error;
  }
}

/**
 * Delete a list item
 */
export async function deleteListItem(itemId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete list item: database not available");
    return false;
  }

  try {
    await db.delete(listItems).where(eq(listItems.id, itemId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete list item:", error);
    throw error;
  }
}

/**
 * Reorder list items - update order field for multiple items
 */
export async function reorderListItems(updates: Array<{ id: number; order: number }>): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reorder list items: database not available");
    return false;
  }

  try {
    for (const update of updates) {
      await db.update(listItems).set({ order: update.order }).where(eq(listItems.id, update.id));
    }
    return true;
  } catch (error) {
    console.error("[Database] Failed to reorder list items:", error);
    throw error;
  }
}

/**
 * Create or update a session
 */
export async function upsertSession(listId: number, sessionId: string, userAgent?: string): Promise<Session | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert session: database not available");
    return null;
  }

  try {
    const existing = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing session
      await db.update(sessions).set({ lastActivity: new Date() }).where(eq(sessions.sessionId, sessionId));
      const updated = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
      return updated.length > 0 ? updated[0] : null;
    } else {
      // Create new session
      await db.insert(sessions).values({
        listId,
        sessionId,
        userAgent: userAgent || null,
      });
      const created = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
      return created.length > 0 ? created[0] : null;
    }
  } catch (error) {
    console.error("[Database] Failed to upsert session:", error);
    throw error;
  }
}

/**
 * Get active sessions for a list
 */
export async function getActiveSessions(listId: number, minutesThreshold: number = 5): Promise<Session[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active sessions: database not available");
    return [];
  }

  try {
    const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.listId, listId));

    // Filter to only active sessions
    return result.filter(s => s.lastActivity > thresholdTime);
  } catch (error) {
    console.error("[Database] Failed to get active sessions:", error);
    throw error;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete session: database not available");
    return false;
  }

  try {
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete session:", error);
    throw error;
  }
}
