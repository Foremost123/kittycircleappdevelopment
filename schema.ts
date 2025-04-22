import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
});

export const circles = pgTable("circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bidDeadline: timestamp("bid_deadline").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  circleId: integer("circle_id").references(() => circles.id).notNull(),
  hasPaid: boolean("has_paid").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  circleId: integer("circle_id").references(() => circles.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  circleId: integer("circle_id").references(() => circles.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  purpose: text("purpose"),
  requestCommunityVote: boolean("request_community_vote").default(false).notNull(),
  bidDate: timestamp("bid_date").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeType: text("badge_type").notNull(),
  dateEarned: timestamp("date_earned").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCircleSchema = createInsertSchema(circles).pick({
  name: true,
  amount: true,
  bidDeadline: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).pick({
  userId: true,
  circleId: true,
  isAdmin: true,
});

export const insertContributionSchema = createInsertSchema(contributions).pick({
  userId: true,
  circleId: true,
  amount: true,
  paymentMethod: true,
});

export const insertBidSchema = createInsertSchema(bids).pick({
  userId: true,
  circleId: true,
  amount: true,
  interestRate: true,
  purpose: true,
  requestCommunityVote: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  badgeType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCircle = z.infer<typeof insertCircleSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type User = typeof users.$inferSelect;
export type Circle = typeof circles.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
