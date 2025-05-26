/**
 * theOxus - Data Schema Definitions
 *
 * This file defines the database schema and types used throughout the application.
 * It uses Drizzle ORM for PostgreSQL schema definition and Zod for validation.
 *
 * @license Apache-2.0
 */

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table schema
 * Stores user authentication and profile information
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

/**
 * Feed sources table schema
 * Stores RSS feed source information including URL, name, and configuration
 */
export const feedSources = pgTable("feed_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
});

/**
 * Forum posts table schema
 * Stores community forum posts with auto-deletion after 7 days
 */
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deleteAt: timestamp("delete_at").notNull(),
});

/**
 * Zod schema for feed source creation/insertion
 * Used for validation when adding new feed sources
 */
export const insertFeedSourceSchema = createInsertSchema(feedSources).pick({
  name: true,
  url: true,
  category: true,
  isActive: true,
});

/**
 * Zod schema for user creation/insertion
 * Used for validation during user registration
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

/**
 * Zod schema for forum post creation/insertion
 * Used for validation when creating new forum posts
 */
export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  content: true,
});

// TypeScript type definitions derived from the Zod schemas and database tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFeedSource = z.infer<typeof insertFeedSourceSchema>;
export type FeedSource = typeof feedSources.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

/**
 * RSS item type definition
 * Represents a single article/item from an RSS feed
 * These are not stored in the database but are generated at runtime
 */
export type RssItem = {
  id: string;              // Unique identifier for the item
  title: string;           // Article title
  link: string;            // URL to the original article
  pubDate: string;         // Publication date
  content: string;         // Full article content (often HTML)
  contentSnippet: string;  // Text-only summary of the content
  source: string;          // URL of the RSS feed source
  sourceName: string;      // Display name of the source
  imageUrl?: string;       // Optional image URL
  videoUrl?: string;       // Optional video URL
  isVideo?: boolean;       // Flag indicating if this is a video item
  isWikipediaCurrentEvents?: boolean; // Flag for Wikipedia current events
  isWikipediaPictureOfTheDay?: boolean; // Flag for Wikipedia Picture of the Day
};

/**
 * Ranked news item type
 * Extends RssItem with AI-generated scores for relevance, impact, and sentiment
 * Used for the top news feature
 */
export type RankedNewsItem = RssItem & {
  scores?: {
    relevance: number;     // How relevant the article is (0-100)
    impact: number;        // The significance/impact of the article (0-100)
    sentiment: number;     // Emotional tone from negative to positive (0-100)
    composite: number;     // Weighted overall score
  };
};
