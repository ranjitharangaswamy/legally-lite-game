import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  /** User's customizable display name (overrides OAuth name if set) */
  displayName: text("displayName"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's selected US state for personalized legal content */
  selectedState: varchar("selectedState", { length: 2 }),
  /** Tracks if user has completed onboarding (state selection) */
  hasCompletedOnboarding: int("hasCompletedOnboarding").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User progress tracking for challenges and quizzes
 */
export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: varchar("challengeId", { length: 64 }).notNull(),
  completed: int("completed").default(0).notNull(),
  score: int("score"),
  xpEarned: int("xpEarned").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * User stats and achievements
 */
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalXp: int("totalXp").default(0).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  challengesCompleted: int("challengesCompleted").default(0).notNull(),
  badges: text("badges"), // JSON array of badge IDs
  lastActivityDate: timestamp("lastActivityDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * Chat messages for AI legal assistant
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  topic: varchar("topic", { length: 64 }), // e.g., "housing", "employment"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Topic performance tracking for adaptive difficulty
 */
export const topicPerformance = mysqlTable("topic_performance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 64 }).notNull(), // e.g., "housing", "employment", "consumer"
  totalAttempts: int("totalAttempts").default(0).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  lastAttemptDate: timestamp("lastAttemptDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TopicPerformance = typeof topicPerformance.$inferSelect;
export type InsertTopicPerformance = typeof topicPerformance.$inferInsert;

/**
 * Saved items (bookmarks) for reference library
 */
export const savedItems = mysqlTable("saved_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["ai_response", "quiz_question", "scenario"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON string with additional data like topic, state, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = typeof savedItems.$inferInsert;
/**
 * Cached AI-generated quiz questions to reduce LLM API calls
 */
export const cachedQuizzes = mysqlTable("cached_quizzes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  questions: text("questions").notNull(), // JSON array of questions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Cache expires after 7 days
});

export type CachedQuiz = typeof cachedQuizzes.$inferSelect;
export type InsertCachedQuiz = typeof cachedQuizzes.$inferInsert;

/**
 * Daily API usage limits per user
 */
export const apiUsageLimits = mysqlTable("api_usage_limits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  aiQuizzesToday: int("aiQuizzesToday").default(0).notNull(),
  aiAssistantMessagesToday: int("aiAssistantMessagesToday").default(0).notNull(),
  practiceScenariesToday: int("practiceScenariesToday").default(0).notNull(),
  lastResetDate: timestamp("lastResetDate").notNull(),
});

export type ApiUsageLimit = typeof apiUsageLimits.$inferSelect;
export type InsertApiUsageLimit = typeof apiUsageLimits.$inferInsert;

/**
 * Cached government legal information to reduce web search API calls
 */
export const cachedLegalInfo = mysqlTable("cached_legal_info", {
  id: int("id").autoincrement().primaryKey(),
  state: varchar("state", { length: 2 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  content: text("content").notNull(),
  sources: text("sources").notNull(), // JSON array of source URLs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Cache expires after 30 days
});

export type CachedLegalInfo = typeof cachedLegalInfo.$inferSelect;
export type InsertCachedLegalInfo = typeof cachedLegalInfo.$inferInsert;
