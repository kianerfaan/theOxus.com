import { feedSources, type FeedSource, type InsertFeedSource, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Feed source operations
  getFeedSources(): Promise<FeedSource[]>;
  getActiveFeedSources(): Promise<FeedSource[]>;
  getFeedSource(id: number): Promise<FeedSource | undefined>;
  createFeedSource(source: InsertFeedSource): Promise<FeedSource>;
  updateFeedSource(id: number, updates: Partial<InsertFeedSource>): Promise<FeedSource | undefined>;
  deleteFeedSource(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private feedSources: Map<number, FeedSource>;
  private userCurrentId: number;
  private feedSourceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.feedSources = new Map();
    this.userCurrentId = 1;
    this.feedSourceCurrentId = 1;
    
    // Add news sources with reliable RSS feeds
    this.createFeedSource({
      name: "Wikipedia Current Events",
      url: "https://www.to-rss.xyz/wikipedia/current_events/",
      category: "News",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      category: "News",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "RT",
      url: "https://www.rt.com/rss/news",
      category: "News",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "The Hill",
      url: "https://thehill.com/feed",
      category: "Politics",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "Deutsche Welle",
      url: "https://rss.dw.com/xml/rss_en_world",
      category: "News",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "France 24",
      url: "https://www.france24.com/en/rss",
      category: "News",
      isActive: true,
    });
    
    this.createFeedSource({
      name: "BBC News",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      category: "News",
      isActive: true,
    });
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

  async getFeedSources(): Promise<FeedSource[]> {
    return Array.from(this.feedSources.values());
  }

  async getActiveFeedSources(): Promise<FeedSource[]> {
    return Array.from(this.feedSources.values()).filter(source => source.isActive);
  }

  async getFeedSource(id: number): Promise<FeedSource | undefined> {
    return this.feedSources.get(id);
  }

  async createFeedSource(source: InsertFeedSource): Promise<FeedSource> {
    const id = this.feedSourceCurrentId++;
    
    // Ensure required properties are properly set
    const feedSource: FeedSource = { 
      ...source, 
      id,
      category: source.category || null,
      isActive: source.isActive !== undefined ? source.isActive : true
    };
    
    this.feedSources.set(id, feedSource);
    return feedSource;
  }

  async updateFeedSource(id: number, updates: Partial<InsertFeedSource>): Promise<FeedSource | undefined> {
    const source = this.feedSources.get(id);
    if (!source) return undefined;
    
    // Ensure we maintain the correct types for FeedSource
    const updatedSource: FeedSource = { 
      ...source, 
      ...updates,
      category: updates.category ?? source.category,
      isActive: updates.isActive ?? source.isActive
    };
    
    this.feedSources.set(id, updatedSource);
    return updatedSource;
  }

  async deleteFeedSource(id: number): Promise<boolean> {
    return this.feedSources.delete(id);
  }
}

export const storage = new MemStorage();
