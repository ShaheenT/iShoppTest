import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDealSchema, insertDealCommentSchema, insertShoppingListSchema, insertShoppingListItemSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Deal routes
  app.get("/api/deals", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const deals = await storage.getDeals(userId);
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/deals/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const deals = await storage.searchDeals(query, userId);
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const deal = await storage.getDeal(dealId, userId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/deals/:id/like", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const isLiked = await storage.toggleLike(userId, dealId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/deals/:id/comments", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const comments = await storage.getDealComments(dealId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/deals/:id/comments", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const commentData = insertDealCommentSchema.parse({
        ...req.body,
        dealId,
      });
      const comment = await storage.addComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Store and category routes
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Shopping list routes
  app.get("/api/shopping-lists", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const lists = await storage.getUserShoppingLists(userId);
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/shopping-lists", async (req, res) => {
    try {
      const listData = insertShoppingListSchema.parse(req.body);
      const list = await storage.createShoppingList(listData);
      res.status(201).json(list);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/shopping-lists/:id/items", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const itemData = insertShoppingListItemSchema.parse({
        ...req.body,
        listId,
      });
      const item = await storage.addItemToList(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/shopping-list-items/:id/toggle", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      await storage.toggleItemComplete(itemId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      // For demo purposes, return the first user as the current user
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
