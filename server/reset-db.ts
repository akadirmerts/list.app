import 'dotenv/config';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

async function reset() {
    console.log("Starting database reset...");
    const db = await getDb();
    if (!db) {
        console.error("Database connection failed");
        return;
    }

    try {
        // Disable foreign key checks
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

        // Drop tables (handle both cases for Windows/MySQL sensitivity)
        const tables = ['listItems', 'lists', 'sessions', 'users', 'listitems', '__drizzle_migrations'];

        for (const t of tables) {
            try {
                await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${t}\``));
                console.log(`Dropped table: ${t}`);
            } catch (e) {
                // Ignore errors if table doesn't exist
            }
        }

        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
        console.log("Database reset completed successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Reset failed:", e);
        process.exit(1);
    }
}

reset();
