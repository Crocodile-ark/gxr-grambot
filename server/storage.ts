import { 
  users, 
  tasks, 
  userTasks, 
  claims, 
  evolPools,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type UserTask,
  type InsertUserTask,
  type Claim,
  type InsertClaim,
  type EvolPool,
  type InsertEvolPool,
  type UserStats,
  type LeaderboardEntry,
  type TaskWithCompletion
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTasksByCategory(category: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  
  // User task operations
  getUserTasks(userId: number): Promise<TaskWithCompletion[]>;
  completeTask(userId: number, taskId: number): Promise<void>;
  
  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
  getUserClaims(userId: number): Promise<Claim[]>;
  
  // Evolution pool operations
  getEvolPools(): Promise<EvolPool[]>;
  updateEvolPool(evolLevel: number, usedAmount: number): Promise<void>;
  
  // Dashboard operations
  getUserStats(userId: number): Promise<UserStats>;
  getLeaderboard(evolLevel?: number, limit?: number): Promise<LeaderboardEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userTasks: Map<string, UserTask>;
  private claims: Map<number, Claim>;
  private evolPools: Map<number, EvolPool>;
  private currentUserId: number;
  private currentTaskId: number;
  private currentUserTaskId: number;
  private currentClaimId: number;
  private currentEvolPoolId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userTasks = new Map();
    this.claims = new Map();
    this.evolPools = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentUserTaskId = 1;
    this.currentClaimId = 1;
    this.currentEvolPoolId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize evolution pools
    const poolData = [
      { evolLevel: 1, totalPool: 2500000 },
      { evolLevel: 2, totalPool: 5000000 },
      { evolLevel: 3, totalPool: 7500000 },
      { evolLevel: 4, totalPool: 100000000 },
      { evolLevel: 5, totalPool: 125000000 },
      { evolLevel: 6, totalPool: 1500000000 },
      { evolLevel: 7, totalPool: 2000000000 },
    ];

    poolData.forEach(pool => {
      const evolPool: EvolPool = {
        id: this.currentEvolPoolId++,
        evolLevel: pool.evolLevel,
        totalPool: pool.totalPool,
        usedPool: 0,
        resetAt: null,
      };
      this.evolPools.set(pool.evolLevel, evolPool);
    });

    // Initialize default tasks
    const defaultTasks = [
      { name: "Follow Twitter @GXROfficial", category: "original", reward: 100, description: "Follow our official Twitter account", link: "https://twitter.com/GXROfficial" },
      { name: "Join Telegram Channel", category: "original", reward: 100, description: "Join our Telegram community", link: "https://t.me/GXROfficial" },
      { name: "Share Post on Twitter", category: "original", reward: 150, description: "Share our latest post", link: "https://twitter.com/GXROfficial" },
      { name: "Invite 5 Friends", category: "original", reward: 500, description: "Invite 5 friends to join", link: "" },
      { name: "Complete KYC Verification", category: "partnership", reward: 300, description: "Complete your KYC process", link: "" },
      { name: "Trade $100 on DEX", category: "partnership", reward: 800, description: "Make a trade worth $100", link: "" },
      { name: "Hold 1000 USDT", category: "partnership", reward: 600, description: "Hold 1000 USDT in your wallet", link: "" },
      { name: "Create Content Video", category: "collaborator", reward: 1000, description: "Create a video about GXR", link: "" },
      { name: "Write Article Review", category: "collaborator", reward: 750, description: "Write an article review", link: "" },
      { name: "Design Banner/Logo", category: "collaborator", reward: 500, description: "Design promotional material", link: "" },
    ];

    defaultTasks.forEach(taskData => {
      const task: Task = {
        id: this.currentTaskId++,
        name: taskData.name,
        category: taskData.category,
        reward: taskData.reward,
        description: taskData.description,
        link: taskData.link,
        isActive: true,
      };
      this.tasks.set(task.id, task);
    });
  }

  private getEvolInfo(points: number): { name: string, level: number, nextTarget: number } {
    if (points < 50) {
      return { name: "Evol 1 – Rookie", level: 1, nextTarget: 50 };
    } else if (points < 15000) {
      return { name: "Evol 2 – Charger", level: 2, nextTarget: 15000 };
    } else if (points < 30000) {
      return { name: "Evol 3 – Breaker", level: 3, nextTarget: 30000 };
    } else if (points < 50000) {
      return { name: "Evol 4 – Phantom", level: 4, nextTarget: 50000 };
    } else if (points < 80000) {
      return { name: "Evol 5 – Overdrive", level: 5, nextTarget: 80000 };
    } else if (points < 120000) {
      return { name: "Evol 6 – Genesis", level: 6, nextTarget: 120000 };
    } else {
      return { name: "Evol 7 – Final Form", level: 7, nextTarget: 120000 };
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      telegramId: insertUser.telegramId,
      username: insertUser.username ?? null,
      email: insertUser.email ?? null,
      points: insertUser.points ?? 0,
      lastClaim: insertUser.lastClaim ?? null,
      wallet: insertUser.wallet ?? null,
      referralCode: `REF${id}`,
      referredBy: insertUser.referredBy ?? null,
      totalReferrals: insertUser.totalReferrals ?? 0,
      refApplied: insertUser.refApplied ?? false,
      isAdmin: insertUser.isAdmin ?? false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.isActive);
  }

  async getTasksByCategory(category: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.category === category && task.isActive);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      id,
      name: insertTask.name,
      category: insertTask.category,
      reward: insertTask.reward,
      description: insertTask.description ?? null,
      link: insertTask.link ?? null,
      isActive: insertTask.isActive ?? true,
    };
    this.tasks.set(id, task);
    return task;
  }

  async getUserTasks(userId: number): Promise<TaskWithCompletion[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.map(task => {
      const userTask = this.userTasks.get(`${userId}-${task.id}`);
      return {
        ...task,
        completed: userTask?.completed || false,
        completedAt: userTask?.completedAt || undefined,
      };
    });
  }

  async completeTask(userId: number, taskId: number): Promise<void> {
    const task = this.tasks.get(taskId);
    const user = this.users.get(userId);
    
    if (!task || !user) throw new Error("Task or user not found");

    const userTaskKey = `${userId}-${taskId}`;
    const existingUserTask = this.userTasks.get(userTaskKey);
    
    if (existingUserTask?.completed) {
      throw new Error("Task already completed");
    }

    // Create or update user task
    const userTask: UserTask = {
      id: this.currentUserTaskId++,
      userId,
      taskId,
      completed: true,
      completedAt: new Date(),
    };
    this.userTasks.set(userTaskKey, userTask);

    // Update user points
    const updatedUser = { ...user, points: (user.points || 0) + task.reward };
    this.users.set(userId, updatedUser);
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.currentClaimId++;
    const claim: Claim = { 
      ...insertClaim, 
      id, 
      claimedAt: new Date() 
    };
    this.claims.set(id, claim);
    return claim;
  }

  async getUserClaims(userId: number): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(claim => claim.userId === userId);
  }

  async getEvolPools(): Promise<EvolPool[]> {
    return Array.from(this.evolPools.values());
  }

  async updateEvolPool(evolLevel: number, usedAmount: number): Promise<void> {
    const pool = this.evolPools.get(evolLevel);
    if (!pool) throw new Error("Evolution pool not found");
    
    const updatedPool = { ...pool, usedPool: (pool.usedPool || 0) + usedAmount };
    this.evolPools.set(evolLevel, updatedPool);
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    const allUsers = Array.from(this.users.values());
    allUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
    const globalRank = allUsers.findIndex(u => u.id === userId) + 1;

    const evolInfo = this.getEvolInfo(user.points || 0);
    const progressPercentage = evolInfo.level === 7 ? 100 : 
      Math.floor(((user.points || 0) / evolInfo.nextTarget) * 100);

    const userClaims = await this.getUserClaims(userId);
    const lastClaim = user.lastClaim;
    const now = new Date();
    const claimInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    
    let canClaim = false;
    let timeUntilNextClaim = 0;
    
    if (!lastClaim) {
      canClaim = true;
    } else {
      const timeSinceLastClaim = now.getTime() - lastClaim.getTime();
      if (timeSinceLastClaim >= claimInterval) {
        canClaim = true;
      } else {
        timeUntilNextClaim = claimInterval - timeSinceLastClaim;
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayClaims = userClaims.filter(claim => 
      claim.claimedAt && claim.claimedAt >= todayStart
    );
    const dailyEarnings = todayClaims.reduce((sum, claim) => sum + claim.amount, 0);

    return {
      user,
      evolName: evolInfo.name,
      evolLevel: evolInfo.level,
      globalRank,
      nextEvolTarget: evolInfo.nextTarget,
      progressPercentage,
      canClaim,
      timeUntilNextClaim,
      dailyEarnings,
      totalClaims: userClaims.length,
    };
  }

  async getLeaderboard(evolLevel?: number, limit: number = 100): Promise<LeaderboardEntry[]> {
    let filteredUsers = Array.from(this.users.values());
    
    if (evolLevel) {
      filteredUsers = filteredUsers.filter(user => {
        const userEvolInfo = this.getEvolInfo(user.points || 0);
        return userEvolInfo.level === evolLevel;
      });
    }

    filteredUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
    filteredUsers = filteredUsers.slice(0, limit);

    return filteredUsers.map((user, index) => {
      const evolInfo = this.getEvolInfo(user.points || 0);
      return {
        user,
        evolName: evolInfo.name,
        rank: index + 1,
      };
    });
  }
}

export const storage = new MemStorage();
