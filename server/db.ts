import { eq, and, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userStats, InsertUserStats, chatMessages, InsertChatMessage, topicPerformance, InsertTopicPerformance, savedItems, InsertSavedItem } from "../drizzle/schema";
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

export async function saveChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save chat message: database not available");
    return;
  }

  await db.insert(chatMessages).values(message);
}

export async function getChatHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get chat history: database not available");
    return [];
  }

  const result = await db.select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  return result.reverse(); // Return in chronological order
}

export async function updateTopicPerformance(userId: number, topic: string, isCorrect: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update topic performance: database not available");
    return;
  }

  // Check if record exists
  const existing = await db.select()
    .from(topicPerformance)
    .where(and(
      eq(topicPerformance.userId, userId),
      eq(topicPerformance.topic, topic)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing record
    await db.update(topicPerformance)
      .set({
        totalAttempts: sql`${topicPerformance.totalAttempts} + 1`,
        correctAnswers: isCorrect ? sql`${topicPerformance.correctAnswers} + 1` : sql`${topicPerformance.correctAnswers}`,
        lastAttemptDate: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(topicPerformance.userId, userId),
        eq(topicPerformance.topic, topic)
      ));
  } else {
    // Insert new record
    await db.insert(topicPerformance).values({
      userId,
      topic,
      totalAttempts: 1,
      correctAnswers: isCorrect ? 1 : 0,
      lastAttemptDate: new Date(),
    });
  }
}

export async function getTopicPerformance(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get topic performance: database not available");
    return [];
  }

  return await db.select()
    .from(topicPerformance)
    .where(eq(topicPerformance.userId, userId));
}

export async function getWeakTopics(userId: number, threshold: number = 0.6) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get weak topics: database not available");
    return [];
  }

  const performance = await db.select()
    .from(topicPerformance)
    .where(eq(topicPerformance.userId, userId));

  // Filter topics where accuracy is below threshold
  return performance.filter(p => {
    const accuracy = p.totalAttempts > 0 ? p.correctAnswers / p.totalAttempts : 0;
    return accuracy < threshold && p.totalAttempts >= 3; // At least 3 attempts
  });
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

// Saved items (bookmarks) functions
export async function saveItem(data: {
  userId: number;
  type: "ai_response" | "quiz_question" | "scenario";
  title: string;
  content: string;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save item: database not available");
    return;
  }

  const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null;
  
  const [result] = await db.insert(savedItems).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    content: data.content,
    metadata: metadataStr,
  });
  
  return result;
}

export async function getSavedItems(userId: number, type?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get saved items: database not available");
    return [];
  }

  const conditions = [eq(savedItems.userId, userId)];
  if (type) {
    conditions.push(eq(savedItems.type, type as any));
  }
  
  const items = await db
    .select()
    .from(savedItems)
    .where(and(...conditions))
    .orderBy(desc(savedItems.createdAt));
  
  // Parse metadata JSON strings
  return items.map(item => ({
    ...item,
    metadata: item.metadata ? JSON.parse(item.metadata) : null,
  }));
}

export async function deleteSavedItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete saved item: database not available");
    return;
  }

  return await db
    .delete(savedItems)
    .where(and(eq(savedItems.id, id), eq(savedItems.userId, userId)));
}
