import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertClaimSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketWithUserId extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocketWithUserId) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          ws.userId = data.userId;
          ws.send(JSON.stringify({ type: 'auth_success' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast to all connected clients
  function broadcast(message: any, excludeUserId?: number) {
    wss.clients.forEach((client: WebSocketWithUserId) => {
      if (client.readyState === WebSocket.OPEN && client.userId !== excludeUserId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // User routes
  app.get("/api/users/me/:telegramId", async (req, res) => {
    try {
      const { telegramId } = req.params;
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        // Create new user if doesn't exist
        user = await storage.createUser({
          telegramId,
          username: `User${telegramId.slice(-6)}`,
          points: 0,
          totalReferrals: 0,
          refApplied: false,
          isAdmin: false,
        });
      }

      const userStats = await storage.getUserStats(user.id);
      res.json(userStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/users/:id/claim", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userStats = await storage.getUserStats(userId);
      if (!userStats.canClaim) {
        return res.status(400).json({ 
          message: "Cannot claim yet", 
          timeUntilNextClaim: userStats.timeUntilNextClaim 
        });
      }

      const claimAmount = 250;
      
      // Create claim record
      await storage.createClaim({
        userId,
        amount: claimAmount,
      });

      // Update user points and last claim time
      await storage.updateUser(userId, {
        points: (user.points || 0) + claimAmount,
        lastClaim: new Date(),
      });

      // Update evolution pool
      const evolInfo = userStats.evolLevel;
      await storage.updateEvolPool(evolInfo, claimAmount);

      const updatedStats = await storage.getUserStats(userId);
      
      // Broadcast claim update to all clients
      broadcast({
        type: 'user_claimed',
        userId,
        amount: claimAmount,
        newPoints: updatedStats.user.points,
      }, userId);

      res.json(updatedStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim reward", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { category } = req.query;
      let tasks;
      
      if (category && typeof category === 'string') {
        tasks = await storage.getTasksByCategory(category);
      } else {
        tasks = await storage.getAllTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tasks", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/users/:id/tasks", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user tasks", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/users/:userId/tasks/:taskId/complete", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const taskId = parseInt(req.params.taskId);
      
      await storage.completeTask(userId, taskId);
      const updatedTasks = await storage.getUserTasks(userId);
      const userStats = await storage.getUserStats(userId);
      
      // Broadcast task completion to all clients
      broadcast({
        type: 'task_completed',
        userId,
        taskId,
        newPoints: userStats.user.points,
      }, userId);

      res.json({ tasks: updatedTasks, userStats });
    } catch (error) {
      res.status(400).json({ message: "Failed to complete task", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { evolLevel, limit } = req.query;
      const leaderboard = await storage.getLeaderboard(
        evolLevel ? parseInt(evolLevel as string) : undefined,
        limit ? parseInt(limit as string) : 100
      );
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Referral routes
  app.post("/api/users/:userId/referral", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return res.status(400).json({ message: "Referral code is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.refApplied) {
        return res.status(400).json({ message: "Referral already applied" });
      }

      // Find referrer by code
      const referrerId = referralCode.replace('REF', '');
      const referrer = await storage.getUser(parseInt(referrerId));
      
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      if (referrer.id === userId) {
        return res.status(400).json({ message: "Cannot refer yourself" });
      }

      const referralReward = 50;

      // Update both users
      await storage.updateUser(userId, {
        points: (user.points || 0) + referralReward,
        referredBy: referrer.telegramId,
        refApplied: true,
      });

      await storage.updateUser(referrer.id, {
        points: (referrer.points || 0) + referralReward,
        totalReferrals: (referrer.totalReferrals || 0) + 1,
      });

      res.json({ message: "Referral applied successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to apply referral", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const evolPools = await storage.getEvolPools();
      
      const totalUsers = users.length;
      const totalDistributed = users.reduce((sum, user) => sum + (user.points || 0), 0);
      const totalPoolCapacity = evolPools.reduce((sum, pool) => sum + pool.totalPool, 0);
      const totalPoolUsed = evolPools.reduce((sum, pool) => sum + (pool.usedPool || 0), 0);
      const poolUsagePercentage = Math.round((totalPoolUsed / totalPoolCapacity) * 100);

      res.json({
        totalUsers,
        totalDistributed,
        poolUsagePercentage,
        evolPools,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/admin/export", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Generate CSV content
      const csvHeader = "User ID,Telegram ID,Username,Points,Wallet,Referrals,Created At\n";
      const csvContent = users.map(user => 
        `${user.id},${user.telegramId},${user.username || ''},${user.points || 0},${user.wallet || ''},${user.totalReferrals || 0},${user.createdAt?.toISOString() || ''}`
      ).join('\n');
      
      const csv = csvHeader + csvContent;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="gxr_users.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return httpServer;
}
