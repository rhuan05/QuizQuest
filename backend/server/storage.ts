import { UUID } from "crypto";
import { 
  categories, difficulties, questions, options, users, quizSessions, answers, questionStats,
  userPlans, dailyQuestionUsage,
  type Category, type Difficulty, type User, type QuizSession, type Answer, type QuestionStats,
  type UserPlan, type DailyQuestionUsage, type InsertUser, type InsertQuizSession, type InsertAnswer,
  type InsertUserPlan, type InsertDailyQuestionUsage, type Question, type Option, type InsertQuestion,
  type QuestionWithOptions, type QuizSessionWithAnswers
} from "../shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryById(categoryId: string): Promise<Category | undefined>;
  
  // Difficulties
  getDifficulties(): Promise<Difficulty[]>;
  getDifficultyByName(name: string): Promise<Difficulty | undefined>;
  getDifficultyById(difficultyId: string): Promise<Difficulty | undefined>;
  
  // Questions
  getQuestions(categoryId?: string, difficultyId?: string): Promise<QuestionWithOptions[]>;
  getQuestionById(id: string): Promise<QuestionWithOptions | undefined>;
  getRandomQuestions(count: number, categoryId?: string): Promise<QuestionWithOptions[]>;
  
  // Admin - Question Management
  getAllQuestionsAdmin(): Promise<QuestionWithOptions[]>;
  createQuestionWithOptions(questionData: any): Promise<Question>;
  updateQuestion(id: string, updates: Partial<Question>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  updateQuestionOptions(questionId: string, optionsData: any[]): Promise<void>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnonymousUser(): Promise<User>;
  updatedQuestionsAnswered(userId: string): Promise<void>;
  
  // User Plans
  getUserPlan(userId: string): Promise<UserPlan | undefined>;
  createUserPlan(userPlan: InsertUserPlan): Promise<UserPlan>;
  updateUserPlan(userId: string, updates: Partial<UserPlan>): Promise<UserPlan>;
  
  // Daily Usage
  getDailyUsage(userId: string, date: string): Promise<DailyQuestionUsage | undefined>;
  createDailyUsage(usage: InsertDailyQuestionUsage): Promise<DailyQuestionUsage>;
  updateDailyUsage(userId: string, date: string, questionsAnswered: number): Promise<DailyQuestionUsage>;
  checkDailyLimit(userId: string): Promise<{ canAnswer: boolean; remaining: number }>;
  
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

  async getCategoryById(categoryId: string): Promise<Category> {
    const [category] = await db.select().from(categories).where(eq(categories.id, categoryId));
    return category;
  }

  async getDifficulties(): Promise<Difficulty[]> {
    return await db.select().from(difficulties).orderBy(difficulties.order);
  }

  async getDifficultyByName(name: string): Promise<Difficulty | undefined> {
    const [difficulty] = await db.select().from(difficulties).where(eq(difficulties.name, name));
    return difficulty || undefined;
  }

  async getDifficultyById(difficultyId: string): Promise<Difficulty> {
    const [difficulty] = await db.select().from(difficulties).where(eq(difficulties.id, difficultyId));
    return difficulty;
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

  async getCategoryByName(categoryName: string): Promise<Category | undefined>{
    return await db.query.categories.findFirst({
      where: eq(categories.name, categoryName)
    });
  }

  async getRandomQuestions(count: number, categoryId: UUID): Promise<QuestionWithOptions[]> {
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async updatedQuestionsAnswered(userId: string) {
    if(userId){
      await db.update(users)
                .set({
                  totalSessions: sql`${users.totalSessions} + 1`,
                  updatedAt : new Date()
                })
                .where(eq(users.id, userId))
                .returning();
    }
  };

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

  async getCompletedQuizSession(): Promise<QuizSession[] | undefined> {
    return await db.select().from(quizSessions).where(eq(quizSessions.isCompleted, true));
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

  // Admin Question Management
  async getAllQuestionsAdmin(): Promise<QuestionWithOptions[]> {
    return await db.query.questions.findMany({
      with: {
        options: {
          orderBy: [options.order]
        },
        category: true,
        difficulty: true
      },
      orderBy: [questions.createdAt]
    });
  }

  async createQuestionWithOptions(questionData: any): Promise<Question> {
    const { categoryId, difficultyId, title, question, code, explanation, options: optionsData } = questionData;
    
    // Criar a pergunta
    const [newQuestion] = await db.insert(questions).values({
      categoryId,
      difficultyId,
      title: title || question.substring(0, 50),
      question,
      code: code || null,
      explanation: explanation || "",
      isActive: true
    }).returning();

    // Criar as opções
    for (const [index, optionData] of optionsData.entries()) {
      await db.insert(options).values({
        questionId: newQuestion.id,
        text: optionData.text,
        isCorrect: optionData.isCorrect,
        order: index + 1
      });
    }

    return newQuestion;
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async updateQuestionOptions(questionId: string, optionsData: any[]): Promise<void> {
    // Deletar opções existentes
    await db.delete(options).where(eq(options.questionId, questionId));
    
    // Inserir novas opções
    for (const [index, optionData] of optionsData.entries()) {
      await db.insert(options).values({
        questionId,
        text: optionData.text,
        isCorrect: optionData.isCorrect,
        order: index + 1
      });
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    // Deletar opções relacionadas primeiro (cascade delete)
    await db.delete(options).where(eq(options.questionId, id));
    // Deletar estatísticas da pergunta
    await db.delete(questionStats).where(eq(questionStats.questionId, id));
    // Deletar a pergunta
    await db.delete(questions).where(eq(questions.id, id));
  }

  // User Plans
  async getUserPlan(userId: string): Promise<UserPlan | undefined> {
    const [plan] = await db.select().from(userPlans).where(eq(userPlans.userId, userId));
    return plan || undefined;
  }

  async createUserPlan(userPlan: InsertUserPlan): Promise<UserPlan> {
    const [plan] = await db.insert(userPlans).values(userPlan).returning();
    return plan;
  }

  async updateUserPlan(userId: string, updates: Partial<UserPlan>): Promise<UserPlan> {
    const [plan] = await db
      .update(userPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPlans.userId, userId))
      .returning();
    return plan;
  }

  // Daily Usage
  async getDailyUsage(userId: string, date: string): Promise<DailyQuestionUsage | undefined> {
    const [usage] = await db
      .select()
      .from(dailyQuestionUsage)
      .where(and(
        eq(dailyQuestionUsage.userId, userId),
        eq(dailyQuestionUsage.date, date)
      ));
    return usage || undefined;
  }

  async createDailyUsage(usage: InsertDailyQuestionUsage): Promise<DailyQuestionUsage> {
    const [newUsage] = await db.insert(dailyQuestionUsage).values(usage).returning();
    return newUsage;
  }

  async updateDailyUsage(userId: string, date: string, questionsAnswered: number): Promise<DailyQuestionUsage> {
    const [usage] = await db
      .update(dailyQuestionUsage)
      .set({ 
        questionsAnswered,
        updatedAt: new Date()
      })
      .where(and(
        eq(dailyQuestionUsage.userId, userId),
        eq(dailyQuestionUsage.date, date)
      ))
      .returning();
    return usage;
  }

  async checkDailyLimit(userId: string): Promise<{ canAnswer: boolean; remaining: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar plano do usuário
    let userPlan = await this.getUserPlan(userId);
    if (!userPlan) {
      // Criar plano gratuito padrão
      userPlan = await this.createUserPlan({
        userId,
        planType: "free",
        questionsPerDay: 10,
        currentDayQuestions: 0
      });
    }

    // Buscar uso diário
    const dailyUsage = await this.getDailyUsage(userId, today);
    const questionsAnswered = dailyUsage?.questionsAnswered || 0;
    
    const remaining = Math.max(0, userPlan.questionsPerDay - questionsAnswered);
    const canAnswer = remaining > 0;

    return { canAnswer, remaining };
  }
}

export const storage = new DatabaseStorage();
