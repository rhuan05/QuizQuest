import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID, UUID } from "crypto";
import bcrypt from "bcryptjs";
import { generateToken } from "../auth/service/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get quiz questions
  app.get("/api/questions", authMiddleware, async (req, res) => {
    try {
      const { categoryId, count = "10" } = req.query;
      
      const questions = await storage.getRandomQuestions(
        parseInt(count as string),
        categoryId as UUID
      );
      
      // Remove correct answers from response for security
      const sanitizedQuestions = questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          ...option,
          isCorrect: undefined // Hide correct answer
        }))
      }));
      
      res.json(sanitizedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get difficulties
  app.get("/api/difficulties", async (req, res) => {
    try {
      const difficulties = await storage.getDifficulties();
      res.json(difficulties);
    } catch (error) {
      console.error("Error fetching difficulties:", error);
      res.status(500).json({ message: "Failed to fetch difficulties" });
    }
  });

  // Start a new quiz session with authentication
  app.post("/api/quiz/start", authMiddleware, async (req, res) => {
    console.log("🚀 [DEBUG] Starting quiz request...");
    console.log("Request body:", req.body);

    try {
      const { category } = req.body;

      console.log("🎫 [DEBUG] Generating session token...");
      const sessionToken = randomUUID();

      // Create quiz session
      console.log("📝 [DEBUG] Creating quiz session...");
      const session = await storage.createQuizSession({
        sessionToken,
        totalQuestions: 10,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || '',
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      });

      // 🚀 BUSCAR AS PERGUNTAS DO QUIZ
      const categoryDB = await storage.getCategoryByName(category as string);

      const difficultyDB = await storage.getDifficultyByName("Iniciante");

      const questions = await storage.getRandomQuestions(10, categoryDB?.id as UUID);

      if (questions.length === 0) {
        console.log("❌ [DEBUG] No questions found for category:", category);
        return res.status(404).json({ message: "Nenhuma pergunta encontrada para esta categoria" });
      }

      // Remove correct answers from response for security
      console.log("🔒 [DEBUG] Sanitizing questions...");
      const sanitizedQuestions = questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          ...option,
          isCorrect: undefined // Hide correct answer
        }))
      }));

      res.json({ 
        sessionToken, 
        sessionId: session.id,
        questions: sanitizedQuestions
      });
    } catch (error) {
      console.error("❌ [ERROR] Failed to start quiz:");
      console.error("Error type:", typeof error);
      console.error("Error message:", error instanceof Error ? error.message : error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("Full error object:", error);

      res.status(500).json({ 
        message: "Failed to start quiz",
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  });

  // Submit an answer
  app.post("/api/quiz/answer", async (req, res) => {
    try {
      const { sessionToken, questionId, optionId, timeSpent } = req.body;

      if (!sessionToken || !questionId || !optionId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get session
      const session = await storage.getQuizSessionByToken(sessionToken);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Get question with options to validate answer
      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Find the selected option and check if it's correct
      const selectedOption = question.options.find(opt => opt.id === optionId);
      if (!selectedOption) {
        return res.status(400).json({ message: "Invalid option" });
      }

      const isCorrect = selectedOption.isCorrect;

      // Create answer record
      const answer = await storage.createAnswer({
        sessionId: session.id,
        questionId,
        optionId,
        userId: session.userId,
        isCorrect,
        timeSpent: timeSpent || null
      });

      // Update question statistics
      await storage.updateQuestionStats(questionId, isCorrect, timeSpent);

      // Update session score if correct
      if (isCorrect) {
        const updatedCorrectAnswers = session.correctAnswers + 1;
        const updatedScore = (updatedCorrectAnswers / session.totalQuestions) * 100;
        
        await storage.updateQuizSession(session.id, {
          correctAnswers: updatedCorrectAnswers,
          score: updatedScore
        });
      };

      await storage.updatedQuestionsAnswered(session.userId as string);

      res.json({
        isCorrect,
        correctOption: question.options.find(opt => opt.isCorrect),
        explanation: question.explanation,
        currentScore: isCorrect ? session.score + (100 / session.totalQuestions) : session.score
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Complete quiz session
  app.post("/api/quiz/complete", async (req, res) => {
    try {
      const { sessionToken, timeSpent } = req.body;

      if (!sessionToken) {
        return res.status(400).json({ message: "Session token required" });
      }

      const session = await storage.getQuizSessionByToken(sessionToken);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Update session as completed
      const completedSession = await storage.updateQuizSession(session.id, {
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: timeSpent || null
      });

      // Get detailed session with answers
      const detailedSession = await storage.getQuizSession(session.id);

      res.json(detailedSession);
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Get quiz results
  app.get("/api/quiz/results/:sessionToken", async (req, res) => {
    try {
      const { sessionToken } = req.params;
      
      const session = await storage.getQuizSessionByToken(sessionToken);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Calculate detailed analytics
      const categoryStats = new Map();
      const difficultyStats = new Map();
      
      for (const answer of session.answers) {
        const category = await storage.getCategoryById(answer.question.categoryId) || null;
        const difficulty = await storage.getDifficultyById(answer.question.difficultyId) || null;

        const categoryKey = category?.name ?? "unknown-category";
        const difficultyKey = difficulty?.name ?? "unknown-difficulty";
        
        // Category stats
        if (!categoryStats.has(categoryKey)) {
          categoryStats.set(categoryKey, { total: 0, correct: 0, name: category?.name ?? "Desconhecido" });
        }
        const catStat = categoryStats.get(categoryKey);
        catStat.total += 1;
        if (answer.isCorrect) catStat.correct += 1;
        
        // Difficulty stats
        if (!difficultyStats.has(difficultyKey)) {
          difficultyStats.set(difficultyKey, { total: 0, correct: 0, name: difficulty?.name ?? "Desconhecido" });
        }
        const diffStat = difficultyStats.get(difficultyKey);
        diffStat.total += 1;
        if (answer.isCorrect) diffStat.correct += 1;
      }

      // Calculate performance level
      let performanceLevel = 'Iniciante';
      if (session.score >= 80) performanceLevel = 'Avançado';
      else if (session.score >= 60) performanceLevel = 'Intermediário';

      // Calculate average time per question
      const totalTime = session.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
      const averageTime = session.answers.length > 0 ? totalTime / session.answers.length : 0;

      const analytics = {
        session,
        performanceLevel,
        averageTime,
        categoryBreakdown: Object.fromEntries(
          Array.from(categoryStats.entries()).map(([cat, stats]) => [
            cat,
            {
              correct: stats.correct,
              total: stats.total,
              percentage: (stats.correct / stats.total) * 100
            }
          ])
        ),
        difficultyBreakdown: Object.fromEntries(
          Array.from(difficultyStats.entries()).map(([diff, stats]) => [
            diff,
            {
              correct: stats.correct,
              total: stats.total,
              percentage: (stats.correct / stats.total) * 100
            }
          ])
        )
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/quiz/dashboard", async (req, res) => {
    try {
      const completedQuizzes = await storage.getCompletedQuizSession();

      res.json(completedQuizzes);
    } catch (error) {
      console.error("Error fetching completed quiz:", error);
      res.status(500).json({ message: "Failed to fetch completed quiz" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "Usuário não Encontrado." });

    const valid = await bcrypt.compare(password, user.passwordHash || "");
    if (!valid) return res.status(401).json({ message: "Senha Inválida."})

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    return res.json({ token });
  });

  app.post("/api/cadastro", async (req, res) => {

    try {
      const { email, username, password } = req.body;

      console.log("[DEBUG] Dados: " + email, username, password);
      
      if (!email || !username || !password) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      };

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email já está em uso." });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username já está em uso." });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await storage.createUser({
        passwordHash,
        email,
        username,
        isAnonymous: false,
        role: "user",
        totalScore: 0,
        totalSessions: 0,
      });

      // Criar plano gratuito para o novo usuário
      await storage.createUserPlan({
        userId: newUser.id,
        planType: "free",
        questionsPerDay: 10,
        currentDayQuestions: 0
      });

      return res.status(201).json({
        message: "Usuário criado com sucesso.",
        user: {
          email: newUser.email,
          username: newUser.username
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar usuário.", error: error });
    }
  });

  // ADMIN ROUTES - Protegidas com adminMiddleware
  
  // Listar todas as questões (admin)
  app.get("/api/admin/questions", adminMiddleware, async (req, res) => {
    try {
      const allQuestions = await storage.getAllQuestionsAdmin();
      res.json(allQuestions);
    } catch (error) {
      console.error("Error fetching admin questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Criar nova questão
  app.post("/api/admin/questions", adminMiddleware, async (req, res) => {
    try {
      const questionData = req.body;
      
      // Validações
      if (!questionData.categoryId || !questionData.difficultyId || !questionData.question) {
        return res.status(400).json({ message: "Campos obrigatórios: categoryId, difficultyId, question" });
      }

      if (!questionData.options || questionData.options.length !== 4) {
        return res.status(400).json({ message: "Deve haver exatamente 4 opções" });
      }

      const correctOptions = questionData.options.filter((opt: any) => opt.isCorrect);
      if (correctOptions.length !== 1) {
        return res.status(400).json({ message: "Deve haver exatamente uma opção correta" });
      }

      const question = await storage.createQuestionWithOptions(questionData);
      res.status(201).json({ message: "Pergunta criada com sucesso", questionId: question.id });
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Atualizar questão
  app.put("/api/admin/questions/:id", adminMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedQuestion = await storage.updateQuestion(id, updates);
      
      // Se há opções para atualizar
      if (updates.options) {
        await storage.updateQuestionOptions(id, updates.options);
      }

      res.json({ message: "Pergunta atualizada com sucesso", question: updatedQuestion });
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  // Deletar questão
  app.delete("/api/admin/questions/:id", adminMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteQuestion(id);
      res.json({ message: "Pergunta deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // LIMITE DIÁRIO ROUTES

  // Verificar limite diário do usuário
  app.get("/api/quiz/daily-limit", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const limit = await storage.checkDailyLimit(user.id);
      res.json(limit);
    } catch (error) {
      console.error("Error checking daily limit:", error);
      res.status(500).json({ message: "Failed to check daily limit" });
    }
  });

  // Iniciar quiz com verificação de limite
  app.post("/api/quiz/start-with-limit", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const { canAnswer, remaining } = await storage.checkDailyLimit(user.id);
      
      if (!canAnswer) {
        return res.status(429).json({ 
          message: "Limite diário atingido", 
          remaining: 0,
          needsPremium: true 
        });
      }

      const { categoryId } = req.body;
      const questions = await storage.getRandomQuestions(1, categoryId);
      
      if (questions.length === 0) {
        return res.status(404).json({ message: "Nenhuma pergunta encontrada" });
      }

      // Sanitizar pergunta (remover resposta correta)
      const sanitizedQuestion = {
        ...questions[0],
        options: questions[0].options.map(option => ({
          ...option,
          isCorrect: undefined
        }))
      };

      // Atualizar uso diário
      const today = new Date().toISOString().split('T')[0];
      const dailyUsage = await storage.getDailyUsage(user.id, today);
      
      if (dailyUsage) {
        await storage.updateDailyUsage(user.id, today, dailyUsage.questionsAnswered + 1);
      } else {
        await storage.createDailyUsage({
          userId: user.id,
          date: today,
          questionsAnswered: 1
        });
      }

      res.json({ 
        question: sanitizedQuestion,
        remaining: remaining - 1
      });
    } catch (error) {
      console.error("Error starting quiz with limit:", error);
      res.status(500).json({ message: "Failed to start quiz" });
    }
  });

  app.post("/api/daily-limit", authMiddleware,(req, res) => {

  });

  const httpServer = createServer(app);
  return httpServer;
}
