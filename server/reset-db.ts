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
        // In PostgreSQL, we can use DROP TABLE ... CASCADE to handle foreign keys
        // or just TRUNCATE if we want to keep schema. Here we drop.
        const tables = ['listItems', 'lists', 'sessions', 'users', 'listitems', '__drizzle_migrations'];

        for (const t of tables) {
            try {
                // PostgreSQL uses double quotes for case-sensitive table names and CASCADE for dependencies
                await db.execute(sql.raw(`DROP TABLE IF EXISTS "${t}" CASCADE`));
                console.log(`Dropped table: ${t}`);
            } catch (e) {
                // Ignore errors if table doesn't exist
            }
        }

        console.log("Database reset completed successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Reset failed:", e);
        process.exit(1);
    }
}

reset();
