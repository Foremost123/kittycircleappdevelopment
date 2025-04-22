import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCircleSchema,
  insertMembershipSchema,
  insertContributionSchema,
  insertBidSchema,
  insertAchievementSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json(user);
  });

  // Circle routes
  app.get("/api/circles", async (req, res) => {
    const circles = await storage.getAllCircles();
    return res.json(circles);
  });

  app.get("/api/circles/:id", async (req, res) => {
    const circleId = parseInt(req.params.id);
    if (isNaN(circleId)) {
      return res.status(400).json({ message: "Invalid circle ID" });
    }
    
    const circle = await storage.getCircleById(circleId);
    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }
    
    return res.json(circle);
  });

  app.post("/api/circles", async (req, res) => {
    try {
      const circleData = insertCircleSchema.parse(req.body);
      const circle = await storage.createCircle(circleData);
      return res.status(201).json(circle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid circle data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create circle" });
    }
  });

  // Membership routes
  app.get("/api/users/:userId/circles", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const circles = await storage.getUserCircles(userId);
    return res.json(circles);
  });

  app.post("/api/memberships", async (req, res) => {
    try {
      const membershipData = insertMembershipSchema.parse(req.body);
      const membership = await storage.createMembership(membershipData);
      return res.status(201).json(membership);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid membership data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create membership" });
    }
  });

  // Contribution routes
  app.post("/api/contributions", async (req, res) => {
    try {
      const contributionData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution({
        ...contributionData,
        paymentDate: new Date(),
      });
      
      // Update membership to mark as paid
      await storage.updateMembershipPaymentStatus(contributionData.userId, contributionData.circleId, true);
      
      return res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contribution data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create contribution" });
    }
  });

  // Bid routes
  app.get("/api/circles/:circleId/bids", async (req, res) => {
    const circleId = parseInt(req.params.circleId);
    if (isNaN(circleId)) {
      return res.status(400).json({ message: "Invalid circle ID" });
    }
    
    const bids = await storage.getCircleBids(circleId);
    return res.json(bids);
  });

  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      const bid = await storage.createBid(bidData);
      return res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create bid" });
    }
  });

  // Achievement routes
  app.get("/api/users/:userId/achievements", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const achievements = await storage.getUserAchievements(userId);
    return res.json(achievements);
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      return res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid achievement data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
