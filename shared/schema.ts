import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  email: text("email"),
  points: integer("points").default(0),
  lastClaim: timestamp("last_claim"),
  wallet: text("wallet"),
  referralCode: text("referral_code"),
  referredBy: text("referred_by"),
  totalReferrals: integer("total_referrals").default(0),
  refApplied: boolean("ref_applied").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // original, partnership, collaborator
  reward: integer("reward").notNull(),
  description: text("description"),
  link: text("link"),
  isActive: boolean("is_active").default(true),
});

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow(),
});

export const evolPools = pgTable("evol_pools", {
  id: serial("id").primaryKey(),
  evolLevel: integer("evol_level").notNull(),
  totalPool: integer("total_pool").notNull(),
  usedPool: integer("used_pool").default(0),
  resetAt: timestamp("reset_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  completedAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  claimedAt: true,
});

export const insertEvolPoolSchema = createInsertSchema(evolPools).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type EvolPool = typeof evolPools.$inferSelect;
export type InsertEvolPool = z.infer<typeof insertEvolPoolSchema>;

// Helper types for frontend
export type UserStats = {
  user: User;
  evolName: string;
  evolLevel: number;
  globalRank: number;
  nextEvolTarget: number;
  progressPercentage: number;
  canClaim: boolean;
  timeUntilNextClaim: number;
  dailyEarnings: number;
  totalClaims: number;
};

export type LeaderboardEntry = {
  user: User;
  evolName: string;
  rank: number;
};

export type TaskWithCompletion = Task & {
  completed: boolean;
  completedAt?: Date;
};
