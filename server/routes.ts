import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { zkVerifyService } from "./services/zkverify";
import { authService } from "./services/auth";
import { z } from "zod";
import { insertUserSchema, insertTaskSchema, insertUserTaskSchema, insertZkProofSchema } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle WebSocket messages (subscriptions, etc.)
        console.log('WebSocket message:', data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Authentication routes
  app.post("/api/auth/twitter/login", async (req, res) => {
    try {
      const { code, codeVerifier } = req.body;
      
      if (!code || !codeVerifier) {
        return res.status(400).json({ message: "Missing code or codeVerifier" });
      }

      const result = await twitterOAuthService.exchangeCodeForToken(code, codeVerifier);
      const userInfo = await twitterOAuthService.getUserInfo(result.access_token);
      
      let user = await storage.getUserByTwitterId(userInfo.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: userInfo.username,
          twitterId: userInfo.id,
          twitterUsername: userInfo.username,
          profileImage: userInfo.profile_image_url,
        });

        // Generate zkProof for new user signup
        const proofData = {
          userId: user.id,
          action: "signup",
          twitterId: userInfo.id,
          timestamp: Date.now(),
        };

        const zkProofResult = await zkVerifyService.generateProof(proofData);
        
        await storage.createZkProof({
          userId: user.id,
          proofHash: zkProofResult.proofHash,
          proofType: "authentication",
          verificationStatus: zkProofResult.verified ? "verified" : "pending",
          zkVerifyResponse: zkProofResult,
          metadata: { action: "signup" },
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
          walletAddress: user.walletAddress,
        }
      });
    } catch (error) {
      console.error("Twitter auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/auth/wallet/connect", async (req, res) => {
    try {
      const { walletAddress, walletType, signature } = req.body;
      
      if (!walletAddress || !walletType) {
        return res.status(400).json({ message: "Missing wallet information" });
      }

      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({ message: "User not found. Please sign up first." });
      }

      // Update user with wallet info
      user = await storage.updateUserWallet(user.id, walletAddress, walletType);

      // Generate zkProof for wallet connection
      const proofData = {
        userId: user.id,
        action: "wallet_connect",
        walletAddress,
        walletType,
        timestamp: Date.now(),
      };

      const zkProofResult = await zkVerifyService.generateProof(proofData);
      
      await storage.createZkProof({
        userId: user.id,
        proofHash: zkProofResult.proofHash,
        proofType: "authentication",
        verificationStatus: zkProofResult.verified ? "verified" : "pending",
        zkVerifyResponse: zkProofResult,
        metadata: { action: "wallet_connect", walletType },
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          walletType: user.walletType,
        }
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      res.status(500).json({ message: "Wallet connection failed" });
    }
  });

  // User routes
  app.get("/api/users/me", authService.authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const achievements = await storage.getUserAchievements(userId);
      const activeTasks = await storage.getUserActiveTasks(userId);

      res.json({
        user,
        achievements,
        activeTasks
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { timeframe = "all", limit = 50 } = req.query;
      const leaderboard = await storage.getLeaderboard(timeframe as string, Number(limit));
      
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

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getActiveTasks();
      res.json({ tasks });
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  app.post("/api/tasks/:taskId/complete", authService.authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).userId;
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

      // Generate zkProof for task completion
      const proofData = {
        userId,
        taskId,
        action: "task_completion",
        proof,
        timestamp: Date.now(),
      };

      const zkProofResult = await zkVerifyService.generateProof(proofData);
      
      // Update user task
      const completedTask = await storage.completeUserTask(userId, taskId, zkProofResult.proofHash);
      
      // Create zkProof record
      await storage.createZkProof({
        userId,
        proofHash: zkProofResult.proofHash,
        proofType: "task_completion",
        verificationStatus: zkProofResult.verified ? "verified" : "pending",
        zkVerifyResponse: zkProofResult,
        metadata: { taskId, taskTitle: task.title },
      });

      // Award XP and update user level
      const updatedUser = await storage.awardXP(userId, task.reward);

      // Check for new achievements
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

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json({ achievements });
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // zkVerify routes
  app.post("/api/zkverify/verify", authService.authenticateToken, async (req, res) => {
    try {
      const { proofHash } = req.body;
      
      if (!proofHash) {
        return res.status(400).json({ message: "Missing proof hash" });
      }

      const result = await zkVerifyService.verifyProof(proofHash);
      
      // Update proof verification status
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

  app.get("/api/zkverify/status", async (req, res) => {
    try {
      const status = await zkVerifyService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("zkVerify status error:", error);
      res.status(500).json({ message: "Failed to get zkVerify status" });
    }
  });

  // Admin routes
  app.get("/api/admin/analytics", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json({ analytics });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  app.post("/api/admin/tasks", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
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

  app.put("/api/admin/tasks/:taskId", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
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

  app.get("/api/admin/system-health", authService.authenticateToken, authService.requireAdmin, async (req, res) => {
    try {
      const zkVerifyStatus = await zkVerifyService.getStatus();
      const dbStatus = await storage.getHealthStatus();

      res.json({
        zkVerify: zkVerifyStatus,
        database: dbStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("System health error:", error);
      res.status(500).json({ message: "Failed to get system health" });
    }
  });

  // User signup/login (Firebase) - after successful auth, generate zk proof
  app.post("/api/auth/firebase", async (req, res) => {
    try {
      const { uid, email, username, action } = req.body;
      if (!uid || !email || !action) {
        return res.status(400).json({ message: "Missing user info or action" });
      }
      // Find or create user in DB
      let user = await storage.getUser(uid);
      if (!user) {
        user = await storage.createUser({ username, email, isAdmin: false, isActive: true });
      }
      // Generate zk proof for login/signup
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

//this is the line i added for the for the login sign
// Email + Password Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    let existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password (if you are storing passwords)
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await storage.createUser({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    // Generate zk proof
    const zkProofResult = await zkVerifyService.generateAuthProof(newUser.id, "signup");

    // Generate JWT
    const token = authService.generateJWT(newUser);

    res.status(201).json({ token, user: newUser, zkProof: zkProofResult });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Email + Password Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate zk proof
    const zkProofResult = await zkVerifyService.generateAuthProof(user.id, "login");

    // Generate JWT
    const token = authService.generateJWT(user);

    res.json({ token, user, zkProof: zkProofResult });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//end solia
  
  return httpServer;
}
