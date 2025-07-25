import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuizSessionSchema, insertAnswerSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get quiz questions
  app.get("/api/questions", async (req, res) => {
    try {
      const { categoryId, difficultyId, count = "10" } = req.query;
      
      const questions = await storage.getRandomQuestions(
        parseInt(count as string),
        categoryId as string
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

  // Start a new quiz session
  app.post("/api/quiz/start", async (req, res) => {
    try {
      const sessionToken = randomUUID();
      
      // Create anonymous user
      const user = await storage.createAnonymousUser();
      
      // Create quiz session
      const session = await storage.createQuizSession({
        sessionToken,
        userId: user.id,
        totalQuestions: 10,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || '',
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      });

      res.json({ sessionToken, sessionId: session.id });
    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz" });
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
      }

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
        const category = answer.question.category?.name || 'Unknown';
        const difficulty = answer.question.difficulty?.name || 'Unknown';
        
        // Category stats
        if (!categoryStats.has(category)) {
          categoryStats.set(category, { total: 0, correct: 0 });
        }
        const catStat = categoryStats.get(category);
        catStat.total += 1;
        if (answer.isCorrect) catStat.correct += 1;
        
        // Difficulty stats
        if (!difficultyStats.has(difficulty)) {
          difficultyStats.set(difficulty, { total: 0, correct: 0 });
        }
        const diffStat = difficultyStats.get(difficulty);
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

  const httpServer = createServer(app);
  return httpServer;
}
