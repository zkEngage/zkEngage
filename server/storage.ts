import { 
  users, 
  tasks, 
  userTasks, 
  achievements, 
  userAchievements, 
  zkProofs, 
  socialInteractions, 
  analytics,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type UserTask,
  type InsertUserTask,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type ZkProof,
  type InsertZkProof,
  type SocialInteraction,
  type InsertSocialInteraction,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum, avg } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: string, walletAddress: string, walletType: string): Promise<User>;
  awardXP(userId: string, xp: number): Promise<User>;
  
  // Task methods
  getTask(id: string): Promise<Task | undefined>;
  getActiveTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  
  // UserTask methods
  getUserTask(userId: string, taskId: string): Promise<UserTask | undefined>;
  getUserActiveTasks(userId: string): Promise<UserTask[]>;
  completeUserTask(userId: string, taskId: string, zkProofHash: string): Promise<UserTask>;
  
  // Achievement methods
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  checkAndAwardAchievements(userId: string): Promise<UserAchievement[]>;
  
  // zkProof methods
  createZkProof(proof: InsertZkProof): Promise<ZkProof>;
  updateZkProofVerification(proofHash: string, verified: boolean): Promise<void>;
  
  // Leaderboard methods
  getLeaderboard(timeframe: string, limit: number): Promise<User[]>;
  
  // Analytics methods
  getAnalytics(): Promise<Analytics[]>;
  
  // System health
  getHealthStatus(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserWallet(userId: string, walletAddress: string, walletType: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        walletAddress, 
        walletType,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async awardXP(userId: string, xp: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newXP = user.xp + xp;
    const newLevel = this.calculateLevel(newXP);

    const [updatedUser] = await db
      .update(users)
      .set({ 
        xp: newXP, 
        level: newLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  private calculateLevel(xp: number): number {
    const baseXP = 1000;
    let level = 1;
    let requiredXP = baseXP;

    while (xp >= requiredXP) {
      level++;
      requiredXP += Math.floor(baseXP * Math.pow(1.5, level - 2));
    }

    return level;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getActiveTasks(): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.isActive, true));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async getUserTask(userId: string, taskId: string): Promise<UserTask | undefined> {
    const [userTask] = await db
      .select()
      .from(userTasks)
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)));
    return userTask || undefined;
  }

  async getUserActiveTasks(userId: string): Promise<UserTask[]> {
    return db
      .select()
      .from(userTasks)
      .innerJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(and(
        eq(userTasks.userId, userId),
        eq(tasks.isActive, true),
        eq(userTasks.status, "pending")
      ));
  }

  async completeUserTask(userId: string, taskId: string, zkProofHash: string): Promise<UserTask> {
    const [userTask] = await db
      .update(userTasks)
      .set({
        status: "completed",
        zkProofHash,
        completedAt: new Date()
      })
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)))
      .returning();
    
    return userTask;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.isActive, true));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    // This would contain logic to check achievement requirements and award new ones
    // For now, return empty array - actual implementation would check user stats
    return [];
  }

  async createZkProof(insertProof: InsertZkProof): Promise<ZkProof> {
    const [proof] = await db
      .insert(zkProofs)
      .values(insertProof)
      .returning();
    return proof;
  }

  async updateZkProofVerification(proofHash: string, verified: boolean): Promise<void> {
    await db
      .update(zkProofs)
      .set({
        verificationStatus: verified ? "verified" : "failed",
        verifiedAt: verified ? new Date() : undefined
      })
      .where(eq(zkProofs.proofHash, proofHash));
  }

  async getLeaderboard(timeframe: string, limit: number): Promise<User[]> {
    let query = db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(desc(users.xp))
      .limit(limit);

    // Add timeframe filtering if needed
    // This would require additional date filtering logic

    return query;
  }

  async getAnalytics(): Promise<Analytics[]> {
    return db.select().from(analytics).orderBy(desc(analytics.date));
  }

  async getHealthStatus(): Promise<any> {
    try {
      // Check database connectivity and basic stats
      const userCount = await db.select({ count: count() }).from(users);
      const proofCount = await db.select({ count: count() }).from(zkProofs);
      
      return {
        connected: true,
        users: userCount[0]?.count || 0,
        proofs: proofCount[0]?.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

export const storage = new DatabaseStorage();
