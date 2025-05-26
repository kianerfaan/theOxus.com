/**
 * theOxus - Data Storage Module
 * 
 * This module provides the data storage interface and implementation
 * for the application. It defines a storage interface that can be implemented
 * with different storage backends (in-memory, SQL database, etc.).
 * 
 * @license Apache-2.0
 */

import { feedSources, type FeedSource, type InsertFeedSource, users, type User, type InsertUser } from "@shared/schema";

/**
 * Storage interface defining all data operations
 * 
 * This interface abstracts the data storage implementation, allowing
 * for easy swapping between different storage backends (in-memory,
 * PostgreSQL, etc.) without changing the application logic.
 */
export interface IStorage {
  /**
   * Retrieves a user by ID
   * @param id The user ID
   * @returns Promise resolving to the user or undefined if not found
   */
  getUser(id: number): Promise<User | undefined>;
  
  /**
   * Retrieves a user by username
   * @param username The username
   * @returns Promise resolving to the user or undefined if not found
   */
  getUserByUsername(username: string): Promise<User | undefined>;
  
  /**
   * Creates a new user
   * @param user The user data to insert
   * @returns Promise resolving to the created user
   */
  createUser(user: InsertUser): Promise<User>;
  
  // Feed source operations
  
  /**
   * Retrieves all feed sources
   * @returns Promise resolving to an array of feed sources
   */
  getFeedSources(): Promise<FeedSource[]>;
  
  /**
   * Retrieves all active feed sources
   * @returns Promise resolving to an array of active feed sources
   */
  getActiveFeedSources(): Promise<FeedSource[]>;
  
  /**
   * Retrieves a feed source by ID
   * @param id The feed source ID
   * @returns Promise resolving to the feed source or undefined if not found
   */
  getFeedSource(id: number): Promise<FeedSource | undefined>;
  
  /**
   * Creates a new feed source
   * @param source The feed source data to insert
   * @returns Promise resolving to the created feed source
   */
  createFeedSource(source: InsertFeedSource): Promise<FeedSource>;
  
  /**
   * Updates an existing feed source
   * @param id The feed source ID
   * @param updates The partial feed source data to update
   * @returns Promise resolving to the updated feed source or undefined if not found
   */
  updateFeedSource(id: number, updates: Partial<InsertFeedSource>): Promise<FeedSource | undefined>;
  
  /**
   * Deletes a feed source
   * @param id The feed source ID
   * @returns Promise resolving to a boolean indicating success
   */
  deleteFeedSource(id: number): Promise<boolean>;
}

/**
 * In-memory implementation of the storage interface
 * 
 * This class provides a simple in-memory storage implementation
 * using JavaScript Maps. It initializes with default feed sources
 * and can be replaced with a database-backed implementation.
 */
export class MemStorage implements IStorage {
  /** Map of users, keyed by ID */
  private users: Map<number, User>;
  
  /** Map of feed sources, keyed by ID */
  private feedSources: Map<number, FeedSource>;
  
  /** Auto-incrementing counter for user IDs */
  private userCurrentId: number;
  
  /** Auto-incrementing counter for feed source IDs */
  private feedSourceCurrentId: number;

  /**
   * Initializes the in-memory storage with default feed sources
   * Creates initial news sources from various categories and regions
   */
  constructor() {
    // Initialize storage containers
    this.users = new Map();
    this.feedSources = new Map();
    
    // Initialize ID counters for auto-incrementing primary keys
    this.userCurrentId = 1;
    this.feedSourceCurrentId = 1;
    
    // Add featured sources that appear in special UI sections
    
    // Current Events from Wikipedia - special featured item for the homepage
    this.createFeedSource({
      name: "Current Events",
      url: "https://www.to-rss.xyz/wikipedia/current_events/",
      category: null, // No category since this will be featured on the homepage
      isActive: true,
    });
    
    // Wikipedia Picture of the Day - featured on the Current Events page
    this.createFeedSource({
      name: "Wikipedia Picture of the Day",
      url: "https://rss.app/feeds/Ao40w7EFnD3vkL1T.xml",
      category: null, // No category since this will be displayed on the Current Events page
      isActive: true,
    });
    
    // Add international news sources by category
    
    // Middle East news source
    this.createFeedSource({
      name: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "RT",
      url: "https://www.rt.com/rss/news",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Hill",
      url: "https://thehill.com/feed",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Deutsche Welle",
      url: "https://rss.dw.com/xml/rss_en_world",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "France 24",
      url: "https://www.france24.com/en/rss",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "BBC News",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Financial Times",
      url: "https://rss.app/feeds/DD5t6t02PenZsNJY.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "NPR",
      url: "https://www.npr.org/rss/rss.php?id=1001",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Fox News",
      url: "https://moxie.foxnews.com/google-publisher/latest.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "UN News",
      url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Tehran Times",
      url: "https://rss.app/feeds/thhYcrDiGjHGCMZm.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Jerusalem Post",
      url: "https://rss.jpost.com/rss/rssfeedsfrontpage.aspx",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "South China Post",
      url: "https://www.scmp.com/rss/91/feed",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Times of India",
      url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Japan Times",
      url: "https://rss.app/feeds/77mMXrkIOqfDd7YZ.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Reuters",
      url: "https://rss.app/feeds/3dqJlnRD4NkfwQuf.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "AP News",
      url: "https://rss.app/feeds/UVhYySfiPPex3v8H.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Epoch Times",
      url: "https://rss.app/feeds/5vK1xWGqr7ppUTes.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Bloomberg",
      url: "https://rss.app/feeds/3FWek10iGcT2x60N.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Haaretz",
      url: "https://rss.app/feeds/CyWwqOYjvyUWBYAR.xml",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Forbes 🇭🇰🇺🇸",
      url: "https://www.forbes.com/business/feed/",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "CNBC 🇺🇸",
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
      category: "Legacy",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Yahoo Finance 🇺🇸",
      url: "https://finance.yahoo.com/news/rssindex",
      category: "Legacy",
      isActive: true,
    });
    
    // Alternative category
    this.createFeedSource({
      name: "ZeroHedge",
      url: "https://cms.zerohedge.com/fullrss2.xml",
      category: "Alternative",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Intercept",
      url: "https://theintercept.com/feed/?rss",
      category: "Alternative",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "SCOTUSblog",
      url: "https://follow.it/scotusblog/rss",
      category: "Alternative",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "SeekingAlpha 🇮🇱",
      url: "https://seekingalpha.com/market_currents.xml",
      category: "Alternative",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Blog of Tim Ferriss 🇺🇸",
      url: "https://tim.blog/feed/",
      category: "Alternative",
      isActive: true,
    });
    
    // Technology category
    this.createFeedSource({
      name: "TechCrunch 🇺🇸",
      url: "https://techcrunch.com/feed/",
      category: "Technology",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Verge 🇺🇸",
      url: "https://www.theverge.com/rss/index.xml",
      category: "Technology",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Hacker News 🇺🇸",
      url: "https://news.ycombinator.com/rss",
      category: "Technology",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Ars Technica 🇺🇸",
      url: "http://feeds.arstechnica.com/arstechnica/index",
      category: "Technology",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "CNET 🇺🇸",
      url: "https://www.cnet.com/rss/news/",
      category: "Technology",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Gizmodo 🇨🇭",
      url: "https://gizmodo.com/rss",
      category: "Technology",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Mashable 🇺🇸",
      url: "http://feeds.mashable.com/Mashable",
      category: "Technology",
      isActive: true,
    });
    
    // Space category
    this.createFeedSource({
      name: "The Guardian, Space 🇬🇧",
      url: "https://www.theguardian.com/science/space/rss",
      category: "Space",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Sky and Telescope 🇺🇸",
      url: "https://www.skyandtelescope.com/feed/",
      category: "Space",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "NASA News 🇺🇸",
      url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      category: "Space",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Space.com 🇬🇧",
      url: "https://www.space.com/feeds/all",
      category: "Space",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "New Scientist 🇬🇧",
      url: "https://www.newscientist.com/subject/space/feed/",
      category: "Space",
      isActive: true,
    });
    
    // Sports category
    
    this.createFeedSource({
      name: "Football365 🇬🇧",
      url: "https://www.football365.com/feed",
      category: "Sports",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Goal.com 🇺🇸🇬🇧",
      url: "https://www.goal.com/feeds/en/news",
      category: "Sports",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "ATP World Tour 🇬🇧🇲🇨🇺🇸🇦🇺",
      url: "https://www.atptour.com/en/media/rss-feed/xml-feed",
      category: "Sports",
      isActive: true,
    });
    
    // Note: Ticker Tape widget is implemented directly in the UI,
    // and doesn't need a source entry in the database
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  /**
   * Retrieves all feed sources
   * 
   * @returns Array of all feed sources, both active and inactive
   */
  async getFeedSources(): Promise<FeedSource[]> {
    return Array.from(this.feedSources.values());
  }

  /**
   * Retrieves only active feed sources
   * 
   * This is typically used for content fetching operations
   * where only enabled news sources should be queried.
   * 
   * @returns Array of feed sources with isActive flag set to true
   */
  async getActiveFeedSources(): Promise<FeedSource[]> {
    return Array.from(this.feedSources.values()).filter(source => source.isActive);
  }

  /**
   * Retrieves a single feed source by ID
   * 
   * @param id - The unique identifier of the feed source
   * @returns The feed source or undefined if not found
   */
  async getFeedSource(id: number): Promise<FeedSource | undefined> {
    return this.feedSources.get(id);
  }

  /**
   * Creates a new feed source
   * 
   * This method:
   * - Assigns a unique ID to the new source
   * - Sets default values for optional properties
   * - Stores the feed source in the in-memory map
   * 
   * @param source - Data for the feed source to create
   * @returns The created feed source with assigned ID
   */
  async createFeedSource(source: InsertFeedSource): Promise<FeedSource> {
    // Generate a new unique ID
    const id = this.feedSourceCurrentId++;
    
    // Create a complete feed source object with defaults for optional fields
    const feedSource: FeedSource = { 
      ...source, 
      id,
      category: source.category || null,  // Default to null if category not provided
      isActive: source.isActive !== undefined ? source.isActive : true  // Default to active
    };
    
    // Store in the map
    this.feedSources.set(id, feedSource);
    return feedSource;
  }

  /**
   * Updates an existing feed source with new data
   * 
   * This method applies partial updates to a feed source, maintaining
   * the original values for properties not included in the updates.
   * Special handling for nullable fields like category ensures type safety.
   * 
   * @param id - The ID of the feed source to update
   * @param updates - Partial object with the properties to update
   * @returns The updated feed source or undefined if not found
   */
  async updateFeedSource(id: number, updates: Partial<InsertFeedSource>): Promise<FeedSource | undefined> {
    // Find the existing source
    const source = this.feedSources.get(id);
    if (!source) return undefined;
    
    // Create an updated source object, carefully handling nullable fields
    const updatedSource: FeedSource = { 
      ...source,           // Start with all existing properties
      ...updates,          // Override with updated properties
      // Explicitly handle nullable fields to ensure proper type safety
      category: updates.category ?? source.category,
      isActive: updates.isActive ?? source.isActive
    };
    
    // Save the updated source
    this.feedSources.set(id, updatedSource);
    return updatedSource;
  }

  /**
   * Deletes a feed source by ID
   * 
   * @param id - The ID of the feed source to delete
   * @returns True if the source was found and deleted, false otherwise
   */
  async deleteFeedSource(id: number): Promise<boolean> {
    return this.feedSources.delete(id);
  }
}

/**
 * Singleton instance of the storage implementation
 * This provides a single point of access to the storage throughout the application
 */
export const storage = new MemStorage();
