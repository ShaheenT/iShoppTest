import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  tokenBalance: integer("token_balance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  logo: text("logo"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  gradient: text("gradient"),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discountPercentage: integer("discount_percentage"),
  image: text("image").notNull(),
  location: text("location"),
  isVerified: boolean("is_verified").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealLikes = pgTable("deal_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dealId: integer("deal_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealComments = pgTable("deal_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dealId: integer("deal_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  dealId: integer("deal_id"),
  title: text("title").notNull(),
  quantity: integer("quantity").default(1),
  isCompleted: boolean("is_completed").default(false),
  addedBy: integer("added_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  tokenBalance: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdAt: true,
});

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({
  id: true,
  createdAt: true,
});

export const insertDealCommentSchema = createInsertSchema(dealComments).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type DealLike = typeof dealLikes.$inferSelect;
export type DealComment = typeof dealComments.$inferSelect;
export type InsertDealComment = z.infer<typeof insertDealCommentSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;

// Extended types for API responses
export type DealWithDetails = Deal & {
  user: User;
  store: Store;
  category: Category;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
};

export type ShoppingListWithItems = ShoppingList & {
  items: (ShoppingListItem & { deal?: Deal })[];
  totalEstimated: number;
};
