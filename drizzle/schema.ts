import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Shared lists table - stores all collaborative lists
 * Each list has a unique slug for easy sharing
 */
export const lists = mysqlTable("lists", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(), // Memorable unique identifier like "happy-fox-42"
  title: varchar("title", { length: 255 }).notNull().default("My List"),
  description: text("description"),
  password: varchar("password", { length: 255 }), // Optional password hash for protection
  isPasswordProtected: int("isPasswordProtected").default(0).notNull(), // 0 = no password, 1 = password protected
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: datetime("expiresAt"), // Date when the list should be auto-deleted
});

export type List = typeof lists.$inferSelect;
export type InsertList = typeof lists.$inferInsert;

/**
 * List items table - stores individual items within each list
 * Supports color coding for visual organization
 */
export const listItems = mysqlTable("listItems", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(), // Foreign key to lists
  text: text("text").notNull(),
  completed: int("completed").default(0).notNull(), // 0 = not completed, 1 = completed
  color: varchar("color", { length: 32 }), // Color code like "primary", "secondary", "accent", "red", "blue", "pink"
  order: int("order").default(0).notNull(), // Sort order within the list
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = typeof listItems.$inferInsert;

/**
 * Sessions table - tracks active users on each list for real-time collaboration
 * Helps identify who is currently viewing/editing a list
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(), // Foreign key to lists
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(), // Unique session identifier
  userAgent: text("userAgent"),
  lastActivity: timestamp("lastActivity").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
