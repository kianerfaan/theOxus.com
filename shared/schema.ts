import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const feedSources = pgTable("feed_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertFeedSourceSchema = createInsertSchema(feedSources).pick({
  name: true,
  url: true,
  category: true,
  isActive: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFeedSource = z.infer<typeof insertFeedSourceSchema>;
export type FeedSource = typeof feedSources.$inferSelect;

// Types for RSS feed data (not stored in database)
export type RssItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  source: string;
  sourceName: string;
};
