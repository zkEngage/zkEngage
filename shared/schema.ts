import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with multi-auth support
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  profileImage: text("profile_image"),
  
  // Authentication
  twitterId: text("twitter_id").unique(),
  twitterUsername: text("twitter_username"),
  walletAddress: text("wallet_address"),
  walletType: text("wallet_type"), // "talisman", "subwallet", "walletconnect", "metamask"
  
  // Gamification
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  totalProofs: integer("total_proofs").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isAdmin: boolean("is_admin").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks/Challenges table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "twitter", "engagement", "proof_generation"
  requirements: jsonb("requirements").notNull(), // Flexible requirements object
  reward: integer("reward").notNull(), // XP reward
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User task completions
export const userTasks = pgTable("user_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "completed", "verified"
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  zkProofHash: text("zk_proof_hash"), // zkVerify proof hash
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userTaskUnique: unique().on(table.userId, table.taskId),
}));

// Achievements/Badges table
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // CSS class or emoji
  category: text("category").notNull(), // "social", "proof", "engagement", "milestone"
  rarity: text("rarity").notNull().default("common"), // "common", "rare", "epic", "legendary"
  requirements: jsonb("requirements").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  achievementId: uuid("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
}, (table) => ({
  userAchievementUnique: unique().on(table.userId, table.achievementId),
}));

// zkVerify proofs table
export const zkProofs = pgTable("zk_proofs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  proofHash: text("proof_hash").notNull().unique(),
  proofType: text("proof_type").notNull(), // "authentication", "task_completion", "achievement"
  verificationStatus: text("verification_status").notNull().default("pending"), // "pending", "verified", "failed"
  zkVerifyResponse: jsonb("zk_verify_response"), // Full response from zkVerify
  metadata: jsonb("metadata"), // Additional proof metadata
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

// Social interactions table
export const socialInteractions = pgTable("social_interactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(), // "twitter", "discord", "telegram"
  interactionType: text("interaction_type").notNull(), // "tweet", "like", "retweet", "follow"
  externalId: text("external_id").notNull(), // Platform-specific ID
  content: text("content"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin analytics table
export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: text("metric").notNull(), // "daily_active_users", "proofs_generated", etc.
  value: integer("value").notNull(),
  metadata: jsonb("metadata"),
  date: timestamp("date").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userTasks: many(userTasks),
  userAchievements: many(userAchievements),
  zkProofs: many(zkProofs),
  socialInteractions: many(socialInteractions),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  userTasks: many(userTasks),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const zkProofsRelations = relations(zkProofs, ({ one }) => ({
  user: one(users, {
    fields: [zkProofs.userId],
    references: [users.id],
  }),
}));

export const socialInteractionsRelations = relations(socialInteractions, ({ one }) => ({
  user: one(users, {
    fields: [socialInteractions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
});

export const insertZkProofSchema = createInsertSchema(zkProofs).omit({
  id: true,
  createdAt: true,
});

export const insertSocialInteractionSchema = createInsertSchema(socialInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type ZkProof = typeof zkProofs.$inferSelect;
export type InsertZkProof = z.infer<typeof insertZkProofSchema>;
export type SocialInteraction = typeof socialInteractions.$inferSelect;
export type InsertSocialInteraction = z.infer<typeof insertSocialInteractionSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
