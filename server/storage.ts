import {
  users,
  stores,
  categories,
  deals,
  dealLikes,
  dealComments,
  shoppingLists,
  shoppingListItems,
  type User,
  type InsertUser,
  type Store,
  type Category,
  type Deal,
  type InsertDeal,
  type DealLike,
  type DealComment,
  type InsertDealComment,
  type ShoppingList,
  type InsertShoppingList,
  type ShoppingListItem,
  type InsertShoppingListItem,
  type DealWithDetails,
  type ShoppingListWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(userId: number, amount: number): Promise<void>;

  // Store methods
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;

  // Category methods
  getCategories(): Promise<Category[]>;

  // Deal methods
  getDeals(userId?: number): Promise<DealWithDetails[]>;
  getDeal(id: number, userId?: number): Promise<DealWithDetails | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  searchDeals(query: string, userId?: number): Promise<DealWithDetails[]>;

  // Deal interaction methods
  toggleLike(userId: number, dealId: number): Promise<boolean>;
  addComment(comment: InsertDealComment): Promise<DealComment>;
  getDealComments(dealId: number): Promise<(DealComment & { user: User })[]>;

  // Shopping list methods
  getUserShoppingLists(userId: number): Promise<ShoppingListWithItems[]>;
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  addItemToList(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  toggleItemComplete(itemId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private stores: Map<number, Store> = new Map();
  private categories: Map<number, Category> = new Map();
  private deals: Map<number, Deal> = new Map();
  private dealLikes: Map<number, DealLike> = new Map();
  private dealComments: Map<number, DealComment> = new Map();
  private shoppingLists: Map<number, ShoppingList> = new Map();
  private shoppingListItems: Map<number, ShoppingListItem> = new Map();
  
  private currentUserId = 1;
  private currentStoreId = 1;
  private currentCategoryId = 1;
  private currentDealId = 1;
  private currentLikeId = 1;
  private currentCommentId = 1;
  private currentListId = 1;
  private currentItemId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed stores
    const storeData = [
      { name: "Woolworths", location: "Cape Town", logo: "W" },
      { name: "Pick n Pay", location: "Sandton", logo: "P" },
      { name: "Checkers", location: "Durban", logo: "C" },
      { name: "SPAR", location: "Johannesburg", logo: "S" },
      { name: "Shoprite", location: "Port Elizabeth", logo: "SR" },
    ];

    storeData.forEach((store) => {
      const id = this.currentStoreId++;
      this.stores.set(id, { id, ...store });
    });

    // Seed categories
    const categoryData = [
      { name: "Fresh Produce", icon: "🥬", gradient: "from-primary to-success" },
      { name: "Bakery", icon: "🍞", gradient: "from-secondary to-accent" },
      { name: "Dairy", icon: "🥛", gradient: "from-primary to-secondary" },
      { name: "Meat", icon: "🥩", gradient: "from-accent to-warning" },
      { name: "Household", icon: "🧽", gradient: "from-success to-primary" },
    ];

    categoryData.forEach((category) => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { id, ...category });
    });

    // Seed users with diverse, youth-oriented profiles
    const users = [
      {
        username: "deal_hunter_za",
        email: "demo@ishopp.com",
        password: "hashed_password",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        tokenBalance: 1250,
      },
      {
        username: "budget_babe",
        email: "budget@ishopp.com", 
        password: "hashed_password",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=40&h=40&fit=crop&crop=face",
        tokenBalance: 890,
      },
      {
        username: "savings_squad",
        email: "squad@ishopp.com",
        password: "hashed_password", 
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        tokenBalance: 2100,
      }
    ];

    users.forEach((userData) => {
      const user: User = {
        id: this.currentUserId++,
        ...userData,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });

    // Add some trending deals that appeal to younger users
    const trendingDeals = [
      {
        userId: 1,
        storeId: 1,
        categoryId: 1,
        title: "Avocados for Toast 🥑",
        description: "Perfect for your morning avocado toast! Limited time offer",
        currentPrice: "12.99",
        originalPrice: "18.99",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "Woolworths V&A Waterfront",
      },
      {
        userId: 2,
        storeId: 2,
        categoryId: 2,
        title: "Energy Drinks 2 for 1 ⚡",
        description: "Stock up for those late-night study sessions #StudentLife",
        currentPrice: "15.00",
        originalPrice: "30.00", 
        image: "https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "Pick n Pay Rosebank",
      },
      {
        userId: 3,
        storeId: 3,
        categoryId: 3,
        title: "Plant-Based Milk Madness 🌱",
        description: "Oat milk, almond milk, you name it! Sustainable savings",
        currentPrice: "25.99",
        originalPrice: "39.99",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "Checkers Menlyn",
      },
      {
        userId: 1,
        storeId: 4,
        categoryId: 5,
        title: "Eco-Friendly Cleaning Kit 🌍",
        description: "Clean your space, save the planet! #EcoWarrior",
        currentPrice: "89.99",
        originalPrice: "120.00",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "SPAR Greenside",
      }
    ];

    trendingDeals.forEach((dealData) => {
      const deal: Deal = {
        id: this.currentDealId++,
        ...dealData,
        discountPercentage: Math.round(((parseFloat(dealData.originalPrice) - parseFloat(dealData.currentPrice)) / parseFloat(dealData.originalPrice)) * 100),
        isVerified: Math.random() > 0.5,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Random within last 3 days
      };
      this.deals.set(deal.id, deal);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      avatar: insertUser.avatar || null,
      tokenBalance: insertUser.tokenBalance || 1000, // Starting bonus
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(userId: number, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.tokenBalance = (user.tokenBalance || 0) + amount;
      this.users.set(userId, user);
    }
  }

  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getDeals(userId?: number): Promise<DealWithDetails[]> {
    const dealsArray = Array.from(this.deals.values());
    return Promise.all(
      dealsArray.map(async (deal) => this.enrichDealWithDetails(deal, userId))
    );
  }

  async getDeal(id: number, userId?: number): Promise<DealWithDetails | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    return this.enrichDealWithDetails(deal, userId);
  }

  private async enrichDealWithDetails(deal: Deal, userId?: number): Promise<DealWithDetails> {
    const user = this.users.get(deal.userId)!;
    const store = this.stores.get(deal.storeId)!;
    const category = this.categories.get(deal.categoryId)!;
    
    const likesCount = Array.from(this.dealLikes.values()).filter(
      like => like.dealId === deal.id
    ).length;
    
    const commentsCount = Array.from(this.dealComments.values()).filter(
      comment => comment.dealId === deal.id
    ).length;
    
    const isLikedByUser = userId ? Array.from(this.dealLikes.values()).some(
      like => like.dealId === deal.id && like.userId === userId
    ) : false;

    return {
      ...deal,
      user,
      store,
      category,
      likesCount,
      commentsCount,
      isLikedByUser,
    };
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const deal: Deal = {
      ...insertDeal,
      id,
      isVerified: false,
      createdAt: new Date(),
    };
    this.deals.set(id, deal);
    return deal;
  }

  async searchDeals(query: string, userId?: number): Promise<DealWithDetails[]> {
    const deals = await this.getDeals(userId);
    return deals.filter(deal =>
      deal.title.toLowerCase().includes(query.toLowerCase()) ||
      deal.description?.toLowerCase().includes(query.toLowerCase()) ||
      deal.store.name.toLowerCase().includes(query.toLowerCase()) ||
      deal.category.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async toggleLike(userId: number, dealId: number): Promise<boolean> {
    const existingLike = Array.from(this.dealLikes.values()).find(
      like => like.userId === userId && like.dealId === dealId
    );

    if (existingLike) {
      this.dealLikes.delete(existingLike.id);
      return false; // unliked
    } else {
      const id = this.currentLikeId++;
      const like: DealLike = {
        id,
        userId,
        dealId,
        createdAt: new Date(),
      };
      this.dealLikes.set(id, like);
      return true; // liked
    }
  }

  async addComment(insertComment: InsertDealComment): Promise<DealComment> {
    const id = this.currentCommentId++;
    const comment: DealComment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.dealComments.set(id, comment);
    return comment;
  }

  async getDealComments(dealId: number): Promise<(DealComment & { user: User })[]> {
    const comments = Array.from(this.dealComments.values()).filter(
      comment => comment.dealId === dealId
    );
    
    return comments.map(comment => ({
      ...comment,
      user: this.users.get(comment.userId)!,
    }));
  }

  async getUserShoppingLists(userId: number): Promise<ShoppingListWithItems[]> {
    const userLists = Array.from(this.shoppingLists.values()).filter(
      list => list.userId === userId
    );

    return userLists.map(list => {
      const items = Array.from(this.shoppingListItems.values())
        .filter(item => item.listId === list.id)
        .map(item => ({
          ...item,
          deal: item.dealId ? this.deals.get(item.dealId) : undefined,
        }));

      const totalEstimated = items.reduce((sum, item) => {
        if (item.deal) {
          return sum + (parseFloat(item.deal.currentPrice) * item.quantity);
        }
        return sum;
      }, 0);

      return {
        ...list,
        items,
        totalEstimated,
      };
    });
  }

  async createShoppingList(insertList: InsertShoppingList): Promise<ShoppingList> {
    const id = this.currentListId++;
    const list: ShoppingList = {
      ...insertList,
      id,
      createdAt: new Date(),
    };
    this.shoppingLists.set(id, list);
    return list;
  }

  async addItemToList(insertItem: InsertShoppingListItem): Promise<ShoppingListItem> {
    const id = this.currentItemId++;
    const item: ShoppingListItem = {
      ...insertItem,
      id,
      createdAt: new Date(),
    };
    this.shoppingListItems.set(id, item);
    return item;
  }

  async toggleItemComplete(itemId: number): Promise<void> {
    const item = this.shoppingListItems.get(itemId);
    if (item) {
      item.isCompleted = !item.isCompleted;
      this.shoppingListItems.set(itemId, item);
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        avatar: insertUser.avatar || null,
        tokenBalance: 1000, // Starting bonus
      })
      .returning();
    return user;
  }

  async updateUserTokens(userId: number, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        tokenBalance: sql`${users.tokenBalance} + ${amount}` 
      })
      .where(eq(users.id, userId));
  }

  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getDeals(userId?: number): Promise<DealWithDetails[]> {
    const dealsData = await db
      .select({
        deal: deals,
        user: users,
        store: stores,
        category: categories,
        likesCount: sql<number>`count(distinct ${dealLikes.id})`.as('likesCount'),
        commentsCount: sql<number>`count(distinct ${dealComments.id})`.as('commentsCount'),
        isLikedByUser: userId ? 
          sql<boolean>`exists(select 1 from ${dealLikes} where ${dealLikes.dealId} = ${deals.id} and ${dealLikes.userId} = ${userId})`.as('isLikedByUser') : 
          sql<boolean>`false`.as('isLikedByUser'),
      })
      .from(deals)
      .leftJoin(users, eq(deals.userId, users.id))
      .leftJoin(stores, eq(deals.storeId, stores.id))
      .leftJoin(categories, eq(deals.categoryId, categories.id))
      .leftJoin(dealLikes, eq(deals.id, dealLikes.dealId))
      .leftJoin(dealComments, eq(deals.id, dealComments.dealId))
      .groupBy(deals.id, users.id, stores.id, categories.id)
      .orderBy(desc(deals.createdAt));

    return dealsData.map(row => ({
      ...row.deal,
      user: row.user!,
      store: row.store!,
      category: row.category!,
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      isLikedByUser: row.isLikedByUser,
    }));
  }

  async getDeal(id: number, userId?: number): Promise<DealWithDetails | undefined> {
    const [dealData] = await db
      .select({
        deal: deals,
        user: users,
        store: stores,
        category: categories,
        likesCount: sql<number>`count(distinct ${dealLikes.id})`.as('likesCount'),
        commentsCount: sql<number>`count(distinct ${dealComments.id})`.as('commentsCount'),
        isLikedByUser: userId ? 
          sql<boolean>`exists(select 1 from ${dealLikes} where ${dealLikes.dealId} = ${deals.id} and ${dealLikes.userId} = ${userId})`.as('isLikedByUser') : 
          sql<boolean>`false`.as('isLikedByUser'),
      })
      .from(deals)
      .leftJoin(users, eq(deals.userId, users.id))
      .leftJoin(stores, eq(deals.storeId, stores.id))
      .leftJoin(categories, eq(deals.categoryId, categories.id))
      .leftJoin(dealLikes, eq(deals.id, dealLikes.dealId))
      .leftJoin(dealComments, eq(deals.id, dealComments.dealId))
      .where(eq(deals.id, id))
      .groupBy(deals.id, users.id, stores.id, categories.id);

    if (!dealData) return undefined;

    return {
      ...dealData.deal,
      user: dealData.user!,
      store: dealData.store!,
      category: dealData.category!,
      likesCount: dealData.likesCount,
      commentsCount: dealData.commentsCount,
      isLikedByUser: dealData.isLikedByUser,
    };
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db
      .insert(deals)
      .values({
        ...insertDeal,
        description: insertDeal.description || null,
        originalPrice: insertDeal.originalPrice || null,
        discountPercentage: insertDeal.discountPercentage || null,
        location: insertDeal.location || null,
        expiresAt: insertDeal.expiresAt || null,
      })
      .returning();
    return deal;
  }

  async searchDeals(query: string, userId?: number): Promise<DealWithDetails[]> {
    const dealsData = await db
      .select({
        deal: deals,
        user: users,
        store: stores,
        category: categories,
        likesCount: sql<number>`count(distinct ${dealLikes.id})`.as('likesCount'),
        commentsCount: sql<number>`count(distinct ${dealComments.id})`.as('commentsCount'),
        isLikedByUser: userId ? 
          sql<boolean>`exists(select 1 from ${dealLikes} where ${dealLikes.dealId} = ${deals.id} and ${dealLikes.userId} = ${userId})`.as('isLikedByUser') : 
          sql<boolean>`false`.as('isLikedByUser'),
      })
      .from(deals)
      .leftJoin(users, eq(deals.userId, users.id))
      .leftJoin(stores, eq(deals.storeId, stores.id))
      .leftJoin(categories, eq(deals.categoryId, categories.id))
      .leftJoin(dealLikes, eq(deals.id, dealLikes.dealId))
      .leftJoin(dealComments, eq(deals.id, dealComments.dealId))
      .where(sql`
        ${deals.title} ILIKE ${`%${query}%`} OR 
        ${deals.description} ILIKE ${`%${query}%`} OR
        ${stores.name} ILIKE ${`%${query}%`} OR
        ${categories.name} ILIKE ${`%${query}%`}
      `)
      .groupBy(deals.id, users.id, stores.id, categories.id)
      .orderBy(desc(deals.createdAt));

    return dealsData.map(row => ({
      ...row.deal,
      user: row.user!,
      store: row.store!,
      category: row.category!,
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      isLikedByUser: row.isLikedByUser,
    }));
  }

  async toggleLike(userId: number, dealId: number): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(dealLikes)
      .where(and(eq(dealLikes.userId, userId), eq(dealLikes.dealId, dealId)));

    if (existingLike) {
      await db
        .delete(dealLikes)
        .where(and(eq(dealLikes.userId, userId), eq(dealLikes.dealId, dealId)));
      return false; // unliked
    } else {
      await db
        .insert(dealLikes)
        .values({ userId, dealId });
      return true; // liked
    }
  }

  async addComment(insertComment: InsertDealComment): Promise<DealComment> {
    const [comment] = await db
      .insert(dealComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getDealComments(dealId: number): Promise<(DealComment & { user: User })[]> {
    const commentsData = await db
      .select({
        comment: dealComments,
        user: users,
      })
      .from(dealComments)
      .leftJoin(users, eq(dealComments.userId, users.id))
      .where(eq(dealComments.dealId, dealId))
      .orderBy(desc(dealComments.createdAt));

    return commentsData.map(row => ({
      ...row.comment,
      user: row.user!,
    }));
  }

  async getUserShoppingLists(userId: number): Promise<ShoppingListWithItems[]> {
    const listsData = await db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.userId, userId))
      .orderBy(desc(shoppingLists.createdAt));

    const result: ShoppingListWithItems[] = [];

    for (const list of listsData) {
      const itemsData = await db
        .select({
          item: shoppingListItems,
          deal: deals,
        })
        .from(shoppingListItems)
        .leftJoin(deals, eq(shoppingListItems.dealId, deals.id))
        .where(eq(shoppingListItems.listId, list.id));

      const items = itemsData.map(row => ({
        ...row.item,
        deal: row.deal || undefined,
      }));

      const totalEstimated = items.reduce((sum, item) => {
        if (item.deal && item.quantity) {
          return sum + (parseFloat(item.deal.currentPrice) * item.quantity);
        }
        return sum;
      }, 0);

      result.push({
        ...list,
        items,
        totalEstimated,
      });
    }

    return result;
  }

  async createShoppingList(insertList: InsertShoppingList): Promise<ShoppingList> {
    const [list] = await db
      .insert(shoppingLists)
      .values({
        ...insertList,
        isShared: insertList.isShared || false,
      })
      .returning();
    return list;
  }

  async addItemToList(insertItem: InsertShoppingListItem): Promise<ShoppingListItem> {
    const [item] = await db
      .insert(shoppingListItems)
      .values({
        ...insertItem,
        dealId: insertItem.dealId || null,
        quantity: insertItem.quantity || 1,
        isCompleted: insertItem.isCompleted || false,
      })
      .returning();
    return item;
  }

  async toggleItemComplete(itemId: number): Promise<void> {
    await db
      .update(shoppingListItems)
      .set({ 
        isCompleted: sql`NOT ${shoppingListItems.isCompleted}` 
      })
      .where(eq(shoppingListItems.id, itemId));
  }
}

export const storage = new DatabaseStorage();
