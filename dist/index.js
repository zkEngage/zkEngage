// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
import { sql, relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  profileImage: text("profile_image"),
  // Authentication
  twitterId: text("twitter_id").unique(),
  twitterUsername: text("twitter_username"),
  walletAddress: text("wallet_address"),
  walletType: text("wallet_type"),
  // "talisman", "subwallet", "walletconnect", "metamask"
  // Gamification
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  totalProofs: integer("total_proofs").default(0),
  // Status
  isActive: boolean("is_active").default(true),
  isAdmin: boolean("is_admin").default(false),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  // "twitter", "engagement", "proof_generation"
  requirements: jsonb("requirements").notNull(),
  // Flexible requirements object
  reward: integer("reward").notNull(),
  // XP reward
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userTasks = pgTable("user_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  status: text("status").notNull().default("pending"),
  // "pending", "completed", "verified"
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  zkProofHash: text("zk_proof_hash"),
  // zkVerify proof hash
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  userTaskUnique: unique().on(table.userId, table.taskId)
}));
var achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  // CSS class or emoji
  category: text("category").notNull(),
  // "social", "proof", "engagement", "milestone"
  rarity: text("rarity").notNull().default("common"),
  // "common", "rare", "epic", "legendary"
  requirements: jsonb("requirements").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  achievementId: uuid("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow()
}, (table) => ({
  userAchievementUnique: unique().on(table.userId, table.achievementId)
}));
var zkProofs = pgTable("zk_proofs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  proofHash: text("proof_hash").notNull().unique(),
  proofType: text("proof_type").notNull(),
  // "authentication", "task_completion", "achievement"
  verificationStatus: text("verification_status").notNull().default("pending"),
  // "pending", "verified", "failed"
  zkVerifyResponse: jsonb("zk_verify_response"),
  // Full response from zkVerify
  metadata: jsonb("metadata"),
  // Additional proof metadata
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at")
});
var socialInteractions = pgTable("social_interactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  // "twitter", "discord", "telegram"
  interactionType: text("interaction_type").notNull(),
  // "tweet", "like", "retweet", "follow"
  externalId: text("external_id").notNull(),
  // Platform-specific ID
  content: text("content"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: text("metric").notNull(),
  // "daily_active_users", "proofs_generated", etc.
  value: integer("value").notNull(),
  metadata: jsonb("metadata"),
  date: timestamp("date").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  userTasks: many(userTasks),
  userAchievements: many(userAchievements),
  zkProofs: many(zkProofs),
  socialInteractions: many(socialInteractions)
}));
var tasksRelations = relations(tasks, ({ many }) => ({
  userTasks: many(userTasks)
}));
var userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id]
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id]
  })
}));
var achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));
var userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));
var zkProofsRelations = relations(zkProofs, ({ one }) => ({
  user: one(users, {
    fields: [zkProofs.userId],
    references: [users.id]
  })
}));
var socialInteractionsRelations = relations(socialInteractions, ({ one }) => ({
  user: one(users, {
    fields: [socialInteractions.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  createdAt: true
});
var insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true
});
var insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true
});
var insertZkProofSchema = createInsertSchema(zkProofs).omit({
  id: true,
  createdAt: true
});
var insertSocialInteractionSchema = createInsertSchema(socialInteractions).omit({
  id: true,
  createdAt: true
});
var insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true
});

// server/db.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
var app = initializeApp(firebaseConfig);
var db = getFirestore(app);

// server/storage.ts
import { eq, desc, and, count } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const userDoc = await db.collection("users").doc(id).get();
    const user = userDoc.exists ? userDoc.data() : void 0;
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByWalletAddress(walletAddress) {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserWallet(userId, walletAddress, walletType) {
    const [user] = await db.update(users).set({
      walletAddress,
      walletType,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async awardXP(userId, xp) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const newXP = user.xp + xp;
    const newLevel = this.calculateLevel(newXP);
    const [updatedUser] = await db.update(users).set({
      xp: newXP,
      level: newLevel,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  calculateLevel(xp) {
    const baseXP = 1e3;
    let level = 1;
    let requiredXP = baseXP;
    while (xp >= requiredXP) {
      level++;
      requiredXP += Math.floor(baseXP * Math.pow(1.5, level - 2));
    }
    return level;
  }
  async getTask(id) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || void 0;
  }
  async getActiveTasks() {
    return db.select().from(tasks).where(eq(tasks.isActive, true));
  }
  async createTask(insertTask) {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  async updateTask(id, updates) {
    const [task] = await db.update(tasks).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tasks.id, id)).returning();
    return task;
  }
  async getUserTask(userId, taskId) {
    const [userTask] = await db.select().from(userTasks).where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)));
    return userTask || void 0;
  }
  async getUserActiveTasks(userId) {
    return db.select().from(userTasks).innerJoin(tasks, eq(userTasks.taskId, tasks.id)).where(and(
      eq(userTasks.userId, userId),
      eq(tasks.isActive, true),
      eq(userTasks.status, "pending")
    ));
  }
  async completeUserTask(userId, taskId, zkProofHash) {
    const [userTask] = await db.update(userTasks).set({
      status: "completed",
      zkProofHash,
      completedAt: /* @__PURE__ */ new Date()
    }).where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId))).returning();
    return userTask;
  }
  async getAllAchievements() {
    return db.select().from(achievements).where(eq(achievements.isActive, true));
  }
  async getUserAchievements(userId) {
    return db.select().from(userAchievements).innerJoin(achievements, eq(userAchievements.achievementId, achievements.id)).where(eq(userAchievements.userId, userId)).orderBy(desc(userAchievements.unlockedAt));
  }
  async checkAndAwardAchievements(userId) {
    return [];
  }
  async createZkProof(insertProof) {
    const [proof] = await db.insert(zkProofs).values(insertProof).returning();
    return proof;
  }
  async updateZkProofVerification(proofHash, verified) {
    await db.update(zkProofs).set({
      verificationStatus: verified ? "verified" : "failed",
      verifiedAt: verified ? /* @__PURE__ */ new Date() : void 0
    }).where(eq(zkProofs.proofHash, proofHash));
  }
  async getLeaderboard(timeframe, limit) {
    let query = db.select().from(users).where(eq(users.isActive, true)).orderBy(desc(users.xp)).limit(limit);
    return query;
  }
  async getAnalytics() {
    return db.select().from(analytics).orderBy(desc(analytics.date));
  }
  async getHealthStatus() {
    try {
      const userCount = await db.select({ count: count() }).from(users);
      const proofCount = await db.select({ count: count() }).from(zkProofs);
      return {
        connected: true,
        users: userCount[0]?.count || 0,
        proofs: proofCount[0]?.count || 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
};
var storage = new DatabaseStorage();

// server/services/zkverify.ts
import crypto from "crypto";
var ZkVerifyService = class {
  constructor() {
    this.baseUrl = "https://api.zkverify.io";
    this.apiKey = process.env.ZKVERIFY_API_KEY || "";
    this.relayerKey = process.env.ZKVERIFY_RELAYER_KEY || "";
  }
  async generateProof(data) {
    try {
      const startTime = Date.now();
      const proofHash = this.createProofHash(data);
      const proofPayload = {
        proof_data: {
          user_id: data.userId,
          hash: proofHash,
          ...data
          // Only spread once to avoid duplicate keys
        },
        proof_type: "STARK",
        // Using STARK proofs as they're natively supported
        metadata: {
          app: "zkEngage",
          version: "1.0.0",
          proof_generation_time: startTime
        }
      };
      const response = await fetch(`${this.baseUrl}/v1/proof/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Relayer-Key": this.relayerKey
        },
        body: JSON.stringify(proofPayload)
      });
      const responseTime = Date.now() - startTime;
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`zkVerify API error: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      return {
        success: true,
        proofHash,
        verified: result.verified || false,
        verificationId: result.verification_id,
        metadata: {
          ...result,
          responseTime,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("zkVerify proof generation error:", error);
      const proofHash = this.createProofHash(data);
      return {
        success: false,
        proofHash,
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          fallback: true,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    }
  }
  async verifyProof(proofHash) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/v1/proof/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Relayer-Key": this.relayerKey
        },
        body: JSON.stringify({
          proof_hash: proofHash
        })
      });
      const responseTime = Date.now() - startTime;
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`zkVerify verification error: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      return {
        success: true,
        proofHash,
        verified: result.verified,
        metadata: {
          ...result,
          responseTime,
          verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("zkVerify verification error:", error);
      return {
        success: false,
        proofHash,
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  async getStatus() {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/v1/status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Relayer-Key": this.relayerKey
        }
      });
      const responseTime = Date.now() - startTime;
      if (response.ok) {
        const status = await response.json();
        return {
          connected: true,
          apiKey: `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`,
          responseTime,
          lastVerification: status.last_verification,
          totalProofs: status.total_proofs,
          successRate: status.success_rate
        };
      } else {
        return {
          connected: false,
          apiKey: `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`,
          responseTime
        };
      }
    } catch (error) {
      console.error("zkVerify status error:", error);
      return {
        connected: false,
        apiKey: `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`
      };
    }
  }
  createProofHash(data) {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }
  // Generate proof for authentication events
  async generateAuthProof(userId, action, metadata = {}) {
    return this.generateProof({
      userId,
      action,
      timestamp: Date.now(),
      ...metadata
    });
  }
  // Generate proof for task completion
  async generateTaskProof(userId, taskId, proofData) {
    return this.generateProof({
      userId,
      action: "task_completion",
      taskId,
      timestamp: Date.now(),
      proofData
    });
  }
  // Generate proof for achievement unlock
  async generateAchievementProof(userId, achievementId) {
    return this.generateProof({
      userId,
      action: "achievement_unlock",
      achievementId,
      timestamp: Date.now()
    });
  }
};
var zkVerifyService = new ZkVerifyService();

// server/services/auth.ts
import jwt from "jsonwebtoken";
var AuthService = class {
  constructor() {
    this.authenticateToken = (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Access token required" });
      const payload = this.verifyJWT(token);
      if (!payload) return res.status(403).json({ message: "Invalid or expired token" });
      req.userId = payload.userId;
      req.username = payload.username;
      req.isAdmin = payload.isAdmin;
      next();
    };
    this.requireAdmin = (req, res, next) => {
      const isAdmin = req.isAdmin;
      if (!isAdmin) return res.status(403).json({ message: "Admin access required" });
      next();
    };
    this.jwtSecret = process.env.JWT_SECRET || "super-secret-key-change-in-production";
  }
  generateJWT(user) {
    const payload = {
      userId: user.id,
      username: user.username || "",
      // optional
      isAdmin: user.isAdmin || false
    };
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "7d",
      issuer: "zkEngage",
      audience: "zkEngage-users"
    });
  }
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: "zkEngage",
        audience: "zkEngage-users"
      });
    } catch (err) {
      console.error("JWT verification error:", err);
      return null;
    }
  }
};
var authService = new AuthService();

// server/routes.ts
async function registerRoutes(app3) {
  const httpServer = createServer(app3);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("WebSocket message:", data);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  function broadcast(data) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  app3.post("/api/auth/twitter/login", async (req, res) => {
    try {
      const { code, codeVerifier } = req.body;
      if (!code || !codeVerifier) {
        return res.status(400).json({ message: "Missing code or codeVerifier" });
      }
      const result = await twitterOAuthService.exchangeCodeForToken(code, codeVerifier);
      const userInfo = await twitterOAuthService.getUserInfo(result.access_token);
      let user = await storage.getUserByTwitterId(userInfo.id);
      if (!user) {
        user = await storage.createUser({
          username: userInfo.username,
          twitterId: userInfo.id,
          twitterUsername: userInfo.username,
          profileImage: userInfo.profile_image_url
        });
        const proofData = {
          userId: user.id,
          action: "signup",
          twitterId: userInfo.id,
          timestamp: Date.now()
        };
        const zkProofResult = await zkVerifyService.generateProof(proofData);
        await storage.createZkProof({
          userId: user.id,
          proofHash: zkProofResult.proofHash,
          proofType: "authentication",
          verificationStatus: zkProofResult.verified ? "verified" : "pending",
          zkVerifyResponse: zkProofResult,
          metadata: { action: "signup" }
        });
        broadcast({
          type: "newUser",
          user: { id: user.id, username: user.username, level: user.level, xp: user.xp }
        });
      }
      const token = authService.generateJWT(user);
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          twitterUsername: user.twitterUsername,
          profileImage: user.profileImage,
          level: user.level,
          xp: user.xp,
          walletAddress: user.walletAddress
        }
      });
    } catch (error) {
      console.error("Twitter auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  app3.post("/api/auth/wallet/connect", async (req, res) => {
    try {
      const { walletAddress, walletType, signature } = req.body;
      if (!walletAddress || !walletType) {
        return res.status(400).json({ message: "Missing wallet information" });
      }
      let user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found. Please sign up first." });
      }
      user = await storage.updateUserWallet(user.id, walletAddress, walletType);
      const proofData = {
        userId: user.id,
        action: "wallet_connect",
        walletAddress,
        walletType,
        timestamp: Date.now()
      };
      const zkProofResult = await zkVerifyService.generateProof(proofData);
      await storage.createZkProof({
        userId: user.id,
        proofHash: zkProofResult.proofHash,
        proofType: "authentication",
        verificationStatus: zkProofResult.verified ? "verified" : "pending",
        zkVerifyResponse: zkProofResult,
        metadata: { action: "wallet_connect", walletType }
      });
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          walletType: user.walletType
        }
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      res.status(500).json({ message: "Wallet connection failed" });
    }
  });
  app3.get("/api/users/me", authService.authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const achievements2 = await storage.getUserAchievements(userId);
      const activeTasks = await storage.getUserActiveTasks(userId);
      res.json({
        user,
        achievements: achievements2,
        activeTasks
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app3.get("/api/leaderboard", async (req, res) => {
    try {
      const { timeframe = "all", limit = 50 } = req.query;
      const leaderboard = await storage.getLeaderboard(timeframe, Number(limit));
      res.json({
        leaderboard,
        timeframe,
        totalUsers: leaderboard.length
      });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });
  app3.get("/api/tasks", async (req, res) => {
    try {
      const tasks2 = await storage.getActiveTasks();
      res.json({ tasks: tasks2 });
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });
  app3.post("/api/tasks/:taskId/complete", authService.authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const taskId = req.params.taskId;
      const { proof } = req.body;
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const userTask = await storage.getUserTask(userId, taskId);
      if (!userTask) {
        return res.status(404).json({ message: "User task not found" });
      }
      if (userTask.status === "completed") {
        return res.status(400).json({ message: "Task already completed" });
      }
      const proofData = {
        userId,
        taskId,
        action: "task_completion",
        proof,
        timestamp: Date.now()
      };
      const zkProofResult = await zkVerifyService.generateProof(proofData);
      const completedTask = await storage.completeUserTask(userId, taskId, zkProofResult.proofHash);
      await storage.createZkProof({
        userId,
        proofHash: zkProofResult.proofHash,
        proofType: "task_completion",
        verificationStatus: zkProofResult.verified ? "verified" : "pending",
        zkVerifyResponse: zkProofResult,
        metadata: { taskId, taskTitle: task.title }
      });
      const updatedUser = await storage.awardXP(userId, task.reward);
      const newAchievements = await storage.checkAndAwardAchievements(userId);
      broadcast({
        type: "taskCompleted",
        userId,
        taskId,
        xpAwarded: task.reward,
        newLevel: updatedUser.level,
        newAchievements
      });
      res.json({
        success: true,
        userTask: completedTask,
        xpAwarded: task.reward,
        newLevel: updatedUser.level,
        newAchievements,
        zkProofHash: zkProofResult.proofHash
      });
    } catch (error) {
      console.error("Complete task error:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });
  app3.get("/api/achievements", async (req, res) => {
    try {
      const achievements2 = await storage.getAllAchievements();
      res.json({ achievements: achievements2 });
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });
  app3.post("/api/zkverify/verify", authService.authenticateToken, async (req, res) => {
    try {
      const { proofHash } = req.body;
      if (!proofHash) {
        return res.status(400).json({ message: "Missing proof hash" });
      }
      const result = await zkVerifyService.verifyProof(proofHash);
      await storage.updateZkProofVerification(proofHash, result.verified);
      res.json({
        success: true,
        verified: result.verified,
        result
      });
    } catch (error) {
      console.error("zkVerify verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });
  app3.get("/api/zkverify/status", async (req, res) => {
    try {
      const status = await zkVerifyService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("zkVerify status error:", error);
      res.status(500).json({ message: "Failed to get zkVerify status" });
    }
  });
  app3.get("/api/admin/analytics", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
    try {
      const analytics2 = await storage.getAnalytics();
      res.json({ analytics: analytics2 });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });
  app3.post("/api/admin/tasks", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      broadcast({
        type: "newTask",
        task
      });
      res.json({ success: true, task });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app3.put("/api/admin/tasks/:taskId", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const updates = req.body;
      const task = await storage.updateTask(taskId, updates);
      broadcast({
        type: "taskUpdated",
        task
      });
      res.json({ success: true, task });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  app3.get("/api/admin/system-health", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
    try {
      const zkVerifyStatus = await zkVerifyService.getStatus();
      const dbStatus = await storage.getHealthStatus();
      res.json({
        zkVerify: zkVerifyStatus,
        database: dbStatus,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("System health error:", error);
      res.status(500).json({ message: "Failed to get system health" });
    }
  });
  app3.post("/api/auth/firebase", async (req, res) => {
    try {
      const { uid, email, username, action } = req.body;
      if (!uid || !email || !action) {
        return res.status(400).json({ message: "Missing user info or action" });
      }
      let user = await storage.getUser(uid);
      if (!user) {
        user = await storage.createUser({ username, email, isAdmin: false, isActive: true });
      }
      const zkProofResult = await zkVerifyService.generateAuthProof(uid, action, { email, username });
      await storage.createZkProof({
        userId: uid,
        proofHash: zkProofResult.proofHash,
        proofType: "authentication",
        verificationStatus: zkProofResult.verified ? "verified" : "pending",
        zkVerifyResponse: zkProofResult,
        metadata: { action }
      });
      res.json({ success: true, user, zkProof: zkProofResult });
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate and verify user" });
    }
  });
  app3.post("/api/auth/signup", async (req, res) => {
    try {
      const { firstName, lastName, username, email, password } = req.body;
      if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword
      });
      const zkProofResult = await zkVerifyService.generateAuthProof(newUser.id, "signup");
      const token = authService.generateJWT(newUser);
      res.status(201).json({ token, user: newUser, zkProof: zkProofResult });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app3.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const bcrypt = await import("bcryptjs");
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const zkProofResult = await zkVerifyService.generateAuthProof(user.id, "login");
      const token = authService.generateJWT(user);
      res.json({ token, user, zkProof: zkProofResult });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src")
    }
  },
  css: {
    postcss: {
      plugins: [
        (await import("tailwindcss")).default({
          config: path.resolve(__dirname, "tailwind.config.ts")
        }),
        (await import("autoprefixer")).default
      ]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// server/index.ts
import dotenv from "dotenv";

// server/routes/authRoutes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
var router = Router();
var prisma = new PrismaClient();
router.post("/wallet-auth", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "Wallet required" });
    let user = await prisma.user.findUnique({ where: { wallet: walletAddress } });
    if (!user) {
      user = await prisma.user.create({ data: { wallet: walletAddress } });
    }
    const token = authService.generateJWT(user);
    return res.json({ token, user });
  } catch (err) {
    console.error("Wallet auth error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    const payload = authService.verifyJWT(token);
    if (!payload?.id) return res.status(403).json({ error: "Invalid token" });
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
var authRoutes_default = router;

// server/index.ts
import cors from "cors";
dotenv.config();
var app2 = express2();
app2.use(cors());
app2.options("*", cors());
app2.use(express2.json());
app2.use(express2.urlencoded({ extended: false }));
app2.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "\u2026";
      log(logLine);
    }
  });
  next();
});
app2.use("/api/auth", authRoutes_default);
(async () => {
  await registerRoutes(app2);
  app2.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const startPort = parseInt(process.env.PORT || "5050", 10);
  function startServer(port) {
    const server = app2.listen({ port, host: "0.0.0.0" }, () => {
      log(`\u2705 Server running on port ${port}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        log(`\u26A0\uFE0F Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        throw err;
      }
    });
  }
  startServer(startPort);
})();
