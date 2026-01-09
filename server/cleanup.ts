import { getDb } from './db';
import { lists, listItems, sessions } from '../drizzle/schema';
import { lt, eq } from 'drizzle-orm';

/**
 * Checks for expired lists and deletes them along with their items and sessions.
 */
export async function cleanupExpiredLists() {
    const db = await getDb();
    if (!db) {
        console.warn("[Cleanup] Database not available, skipping cleanup.");
        return;
    }

    try {
        const now = new Date();
        // 1. Get expired list IDs
        // Lists where expiresAt is NOT NULL and expiresAt < NOW
        const expiredLists = await db
            .select({ id: lists.id })
            .from(lists)
            .where(lt(lists.expiresAt, now));

        if (expiredLists.length === 0) return;

        const listIds = expiredLists.map(l => l.id);
        console.log(`[Cleanup] Found ${listIds.length} expired lists. Deleting...`);

        for (const listId of listIds) {
            // 2. Delete related items (Manual cascade)
            await db.delete(listItems).where(eq(listItems.listId, listId));

            // 3. Delete related sessions
            await db.delete(sessions).where(eq(sessions.listId, listId));

            // 4. Delete the list
            await db.delete(lists).where(eq(lists.id, listId));
        }

        console.log(`[Cleanup] Successfully deleted ${listIds.length} expired lists.`);
    } catch (error) {
        console.error("[Cleanup] Failed to cleanup expired lists:", error);
    }
}

/**
 * Starts the cleanup scheduler.
 * @param intervalMs default 1 hour
 */
export function startCleanupSchedule(intervalMs = 60 * 60 * 1000) {
    console.log("[Cleanup] Scheduler started.");

    // Initial run after 10 seconds to allow DB to connect
    setTimeout(() => {
        cleanupExpiredLists().catch(err => console.error("[Cleanup] Initial run failed:", err));
    }, 10000);

    // Periodic run
    setInterval(() => {
        cleanupExpiredLists().catch(err => console.error("[Cleanup] Run failed:", err));
    }, intervalMs);
}
