import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb, real, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const deviceTypeEnum = pgEnum('device_type', ['mobile', 'tablet', 'desktop']);

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  color: text("color"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Difficulties table
export const difficulties = pgTable("difficulties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  points: integer("points").default(1).notNull(),
  color: text("color"),
  order: integer("order").notNull().unique(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Questions table
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  question: text("question").notNull(),
  code: text("code"),
  explanation: text("explanation").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  categoryId: uuid("category_id").notNull(),
  difficultyId: uuid("difficulty_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Options table
export const options = pgTable("options", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
  order: integer("order").notNull(),
  questionId: uuid("question_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  username: text("username").unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  isAnonymous: boolean("is_anonymous").default(true).notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  totalScore: integer("total_score").default(0).notNull(),
  bestScore: real("best_score").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  lastActiveAt: timestamp("last_active_at").default(sql`now()`).notNull(),
});

// Quiz sessions table
export const quizSessions = pgTable("quiz_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull().unique(),
  startedAt: timestamp("started_at").default(sql`now()`).notNull(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  totalQuestions: integer("total_questions").default(10).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  score: real("score").default(0).notNull(),
  timeSpent: integer("time_spent"),
  userId: uuid("user_id"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  deviceType: deviceTypeEnum("device_type"),
});

// Answers table
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"),
  answeredAt: timestamp("answered_at").default(sql`now()`).notNull(),
  sessionId: uuid("session_id").notNull(),
  questionId: uuid("question_id").notNull(),
  optionId: uuid("option_id").notNull(),
  userId: uuid("user_id"),
});

// Question stats table
export const questionStats = pgTable("question_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  totalAnswers: integer("total_answers").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  successRate: real("success_rate").default(0).notNull(),
  averageTime: real("average_time"),
  lastUpdated: timestamp("last_updated").default(sql`now()`).notNull(),
  questionId: uuid("question_id").notNull().unique(),
});

// Relations
export const categoryRelations = relations(categories, ({ many }) => ({
  questions: many(questions),
}));

export const difficultyRelations = relations(difficulties, ({ many }) => ({
  questions: many(questions),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id],
  }),
  difficulty: one(difficulties, {
    fields: [questions.difficultyId],
    references: [difficulties.id],
  }),
  options: many(options),
  statistics: one(questionStats),
  answers: many(answers),
}));

export const optionRelations = relations(options, ({ one, many }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
  answers: many(answers),
}));

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(quizSessions),
  answers: many(answers),
}));

export const quizSessionRelations = relations(quizSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [quizSessions.userId],
    references: [users.id],
  }),
  answers: many(answers),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  session: one(quizSessions, {
    fields: [answers.sessionId],
    references: [quizSessions.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  option: one(options, {
    fields: [answers.optionId],
    references: [options.id],
  }),
  user: one(users, {
    fields: [answers.userId],
    references: [users.id],
  }),
}));

export const questionStatsRelations = relations(questionStats, ({ one }) => ({
  question: one(questions, {
    fields: [questionStats.questionId],
    references: [questions.id],
  }),
}));

// Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDifficultySchema = createInsertSchema(difficulties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOptionSchema = createInsertSchema(options).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  answeredAt: true,
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Difficulty = typeof difficulties.$inferSelect;
export type InsertDifficulty = z.infer<typeof insertDifficultySchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Option = typeof options.$inferSelect;
export type InsertOption = z.infer<typeof insertOptionSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type QuestionStats = typeof questionStats.$inferSelect;

// Extended types for API responses
export type QuestionWithOptions = Question & {
  options: Option[];
  category: Category;
  difficulty: Difficulty;
};

export type QuizSessionWithAnswers = QuizSession & {
  answers: (Answer & {
    question: Question;
    option: Option;
  })[];
};
