import { 
  categories, difficulties, questions, options, users, quizSessions, answers, questionStats,
  type Category, type Difficulty, type Question, type Option, type User, type QuizSession, type Answer, type QuestionStats,
  type InsertCategory, type InsertDifficulty, type InsertQuestion, type InsertOption, type InsertUser, type InsertQuizSession, type InsertAnswer,
  type QuestionWithOptions, type QuizSessionWithAnswers
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Difficulties
  getDifficulties(): Promise<Difficulty[]>;
  getDifficultyByName(name: string): Promise<Difficulty | undefined>;
  
  // Questions
  getQuestions(categoryId?: string, difficultyId?: string): Promise<QuestionWithOptions[]>;
  getQuestionById(id: string): Promise<QuestionWithOptions | undefined>;
  getRandomQuestions(count: number, categoryId?: string): Promise<QuestionWithOptions[]>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnonymousUser(): Promise<User>;
  
  // Quiz Sessions
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  getQuizSession(id: string): Promise<QuizSessionWithAnswers | undefined>;
  getQuizSessionByToken(token: string): Promise<QuizSessionWithAnswers | undefined>;
  updateQuizSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession>;
  
  // Answers
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getSessionAnswers(sessionId: string): Promise<Answer[]>;
  
  // Stats
  updateQuestionStats(questionId: string, isCorrect: boolean, timeSpent?: number): Promise<void>;
  getQuestionStats(questionId: string): Promise<QuestionStats | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async getDifficulties(): Promise<Difficulty[]> {
    return await db.select().from(difficulties).orderBy(difficulties.order);
  }

  async getDifficultyByName(name: string): Promise<Difficulty | undefined> {
    const [difficulty] = await db.select().from(difficulties).where(eq(difficulties.name, name));
    return difficulty || undefined;
  }

  async getQuestions(categoryId?: string, difficultyId?: string): Promise<QuestionWithOptions[]> {
    const conditions = [eq(questions.isActive, true)];
    
    if (categoryId) {
      conditions.push(eq(questions.categoryId, categoryId));
    }
    
    if (difficultyId) {
      conditions.push(eq(questions.difficultyId, difficultyId));
    }

    return await db.query.questions.findMany({
      where: and(...conditions),
      with: {
        options: {
          orderBy: [options.order]
        },
        category: true,
        difficulty: true
      }
    });
  }

  async getQuestionById(id: string): Promise<QuestionWithOptions | undefined> {
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, id),
      with: {
        options: {
          orderBy: [options.order]
        },
        category: true,
        difficulty: true
      }
    });
    
    return question || undefined;
  }

  async getRandomQuestions(count: number, categoryId?: string): Promise<QuestionWithOptions[]> {
    const conditions = [eq(questions.isActive, true)];
    
    if (categoryId) {
      conditions.push(eq(questions.categoryId, categoryId));
    }

    const result = await db.query.questions.findMany({
      where: and(...conditions),
      with: {
        options: {
          orderBy: [options.order]
        },
        category: true,
        difficulty: true
      },
      orderBy: sql`RANDOM()`,
      limit: count
    });

    return result;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createAnonymousUser(): Promise<User> {
    const [user] = await db.insert(users).values({
      isAnonymous: true,
      displayName: `Anônimo_${Date.now()}`
    }).returning();
    return user;
  }

  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const [newSession] = await db.insert(quizSessions).values(session).returning();
    return newSession;
  }

  async getQuizSession(id: string): Promise<QuizSessionWithAnswers | undefined> {
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.id, id),
      with: {
        answers: {
          with: {
            question: true,
            option: true
          }
        }
      }
    });

    return session || undefined;
  }

  async getQuizSessionByToken(token: string): Promise<QuizSessionWithAnswers | undefined> {
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.sessionToken, token),
      with: {
        answers: {
          with: {
            question: true,
            option: true
          }
        }
      }
    });

    return session || undefined;
  }

  async updateQuizSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession> {
    const [updatedSession] = await db
      .update(quizSessions)
      .set(updates)
      .where(eq(quizSessions.id, id))
      .returning();
    return updatedSession;
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();
    return newAnswer;
  }

  async getSessionAnswers(sessionId: string): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.sessionId, sessionId));
  }

  async updateQuestionStats(questionId: string, isCorrect: boolean, timeSpent?: number): Promise<void> {
    const existingStats = await db.select().from(questionStats).where(eq(questionStats.questionId, questionId));
    
    if (existingStats.length === 0) {
      // Create new stats
      await db.insert(questionStats).values({
        questionId,
        totalAnswers: 1,
        correctAnswers: isCorrect ? 1 : 0,
        successRate: isCorrect ? 100 : 0,
        averageTime: timeSpent || null,
        lastUpdated: new Date()
      });
    } else {
      // Update existing stats
      const stats = existingStats[0];
      const newTotalAnswers = stats.totalAnswers + 1;
      const newCorrectAnswers = stats.correctAnswers + (isCorrect ? 1 : 0);
      const newSuccessRate = (newCorrectAnswers / newTotalAnswers) * 100;
      
      let newAverageTime = stats.averageTime;
      if (timeSpent && stats.averageTime) {
        newAverageTime = (stats.averageTime + timeSpent) / 2;
      } else if (timeSpent) {
        newAverageTime = timeSpent;
      }

      await db
        .update(questionStats)
        .set({
          totalAnswers: newTotalAnswers,
          correctAnswers: newCorrectAnswers,
          successRate: newSuccessRate,
          averageTime: newAverageTime,
          lastUpdated: new Date()
        })
        .where(eq(questionStats.questionId, questionId));
    }
  }

  async getQuestionStats(questionId: string): Promise<QuestionStats | undefined> {
    const [stats] = await db.select().from(questionStats).where(eq(questionStats.questionId, questionId));
    return stats || undefined;
  }
}

export const storage = new DatabaseStorage();
