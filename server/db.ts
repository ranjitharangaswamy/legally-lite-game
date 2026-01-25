import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userStats, InsertUserStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserState(userId: number, state: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user state: database not available");
    return;
  }

  await db.update(users)
    .set({ 
      selectedState: state,
      hasCompletedOnboarding: 1 
    })
    .where(eq(users.id, userId));
}

export async function updateDisplayName(userId: number, displayName: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update display name: database not available");
    return;
  }

  await db.update(users)
    .set({ displayName })
    .where(eq(users.id, userId));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user stats: database not available");
    return undefined;
  }

  const result = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function initializeUserStats(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot initialize user stats: database not available");
    return;
  }

  const values: InsertUserStats = {
    userId,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    challengesCompleted: 0,
    badges: null,
    lastActivityDate: null,
  };

  await db.insert(userStats).values(values).onDuplicateKeyUpdate({
    set: { userId },
  });
}

export async function awardXp(userId: number, xpAmount: number, challengeType: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot award XP: database not available");
    return;
  }

  // Get current stats
  let stats = await getUserStats(userId);
  
  // Initialize if doesn't exist
  if (!stats) {
    await initializeUserStats(userId);
    stats = await getUserStats(userId);
  }

  if (!stats) {
    console.error("[Database] Failed to get or create user stats");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;
  let newStreak = stats.currentStreak || 0;
  
  // Update streak logic
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, keep streak
      newStreak = stats.currentStreak || 0;
    } else if (daysDiff === 1) {
      // Next day, increment streak
      newStreak = (stats.currentStreak || 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
  } else {
    // First activity
    newStreak = 1;
  }

  const newTotalXp = (stats.totalXp || 0) + xpAmount;
  const newChallengesCompleted = (stats.challengesCompleted || 0) + 1;
  const newLongestStreak = Math.max(newStreak, stats.longestStreak || 0);

  await db.update(userStats)
    .set({
      totalXp: newTotalXp,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      challengesCompleted: newChallengesCompleted,
      lastActivityDate: new Date(),
    })
    .where(eq(userStats.userId, userId));
}
