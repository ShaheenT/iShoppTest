import { db } from "./db";
import { users, stores, categories, deals } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Seed stores
    const storeData = [
      { name: "Woolworths", location: "Cape Town", logo: "W" },
      { name: "Pick n Pay", location: "Sandton", logo: "P" },
      { name: "Checkers", location: "Durban", logo: "C" },
      { name: "SPAR", location: "Johannesburg", logo: "S" },
      { name: "Shoprite", location: "Port Elizabeth", logo: "SR" },
    ];

    const insertedStores = await db.insert(stores).values(storeData).returning();
    console.log(`Seeded ${insertedStores.length} stores`);

    // Seed categories
    const categoryData = [
      { name: "Fresh Produce", icon: "🥬", gradient: "from-primary to-success" },
      { name: "Bakery", icon: "🍞", gradient: "from-secondary to-accent" },
      { name: "Dairy", icon: "🥛", gradient: "from-primary to-secondary" },
      { name: "Meat", icon: "🥩", gradient: "from-accent to-warning" },
      { name: "Household", icon: "🧽", gradient: "from-success to-primary" },
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`Seeded ${insertedCategories.length} categories`);

    // Seed users with diverse, youth-oriented profiles
    const userData = [
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

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`Seeded ${insertedUsers.length} users`);

    // Add trending deals that appeal to younger users
    const trendingDeals = [
      {
        userId: insertedUsers[0].id,
        storeId: insertedStores[0].id,
        categoryId: insertedCategories[0].id,
        title: "Avocados for Toast 🥑",
        description: "Perfect for your morning avocado toast! Limited time offer",
        currentPrice: "12.99",
        originalPrice: "18.99",
        discountPercentage: Math.round(((18.99 - 12.99) / 18.99) * 100),
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "Woolworths V&A Waterfront",
        isVerified: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: insertedUsers[1].id,
        storeId: insertedStores[1].id,
        categoryId: insertedCategories[1].id,
        title: "Energy Drinks 2 for 1 ⚡",
        description: "Stock up for those late-night study sessions #StudentLife",
        currentPrice: "15.00",
        originalPrice: "30.00",
        discountPercentage: Math.round(((30.00 - 15.00) / 30.00) * 100),
        image: "https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "Pick n Pay Rosebank",
        isVerified: false,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: insertedUsers[2].id,
        storeId: insertedStores[2].id,
        categoryId: insertedCategories[2].id,
        title: "Plant-Based Milk Madness 🌱",
        description: "Oat milk, almond milk, you name it! Sustainable savings",
        currentPrice: "25.99",
        originalPrice: "39.99",
        discountPercentage: Math.round(((39.99 - 25.99) / 39.99) * 100),
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "Checkers Menlyn",
        isVerified: true,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: insertedUsers[0].id,
        storeId: insertedStores[3].id,
        categoryId: insertedCategories[4].id,
        title: "Eco-Friendly Cleaning Kit 🌍",
        description: "Clean your space, save the planet! #EcoWarrior",
        currentPrice: "89.99",
        originalPrice: "120.00",
        discountPercentage: Math.round(((120.00 - 89.99) / 120.00) * 100),
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        location: "SPAR Greenside",
        isVerified: false,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }
    ];

    const insertedDeals = await db.insert(deals).values(trendingDeals).returning();
    console.log(`Seeded ${insertedDeals.length} deals`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}