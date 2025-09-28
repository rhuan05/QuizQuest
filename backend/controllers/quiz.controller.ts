import type { Request, Response } from 'express';
import { quizService } from '../services/quiz.service';

export class QuizController {
  
  async getQuestions(req: Request, res: Response) {
    try {
      const { categoryId, count = "10" } = req.query;
      
      console.log(`[QUIZ_CONTROLLER] Getting ${count} questions for category: ${categoryId}`);
      
      const questions = await quizService.getQuestions(
        parseInt(count as string),
        categoryId as string
      );
      
      res.json(questions);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      console.log(`[QUIZ_CONTROLLER] Getting categories`);
      
      const categories = await quizService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  }

  async getDifficulties(req: Request, res: Response) {
    try {
      console.log(`[QUIZ_CONTROLLER] Getting difficulties`);
      
      const difficulties = await quizService.getDifficulties();
      res.json(difficulties);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error fetching difficulties:", error);
      res.status(500).json({ message: "Failed to fetch difficulties" });
    }
  }

  async startQuiz(req: Request, res: Response) {
    try {
      console.log(`[QUIZ_CONTROLLER] Starting quiz request...`);
      console.log(`[QUIZ_CONTROLLER] Request body:`, req.body);

      const quizData = req.body;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || '';
      
      console.log(`[QUIZ_CONTROLLER] Starting quiz for category: ${quizData.category}`);

      const result = await quizService.startQuiz(quizData, userAgent, ipAddress);

      res.json(result);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error starting quiz:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: "Failed to start quiz",
          error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
      }
    }
  }

  async submitAnswer(req: Request, res: Response) {
    try {
      console.log(`[QUIZ_CONTROLLER] Submitting answer`);
      
      const answerData = req.body;
      const result = await quizService.submitAnswer(answerData);

      res.json(result);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error submitting answer:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to submit answer" });
      }
    }
  }

  async completeQuiz(req: Request, res: Response) {
    try {
      console.log(`[QUIZ_CONTROLLER] Completing quiz`);
      
      const completeData = req.body;
      const result = await quizService.completeQuiz(completeData);

      res.json(result);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error completing quiz:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to complete quiz" });
      }
    }
  }

  async getResults(req: Request, res: Response) {
    try {
      const { sessionToken } = req.params;
      
      console.log(`[QUIZ_CONTROLLER] Getting results for session: ${sessionToken}`);
      
      const analytics = await quizService.getResults(sessionToken);

      res.json(analytics);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error fetching results:", error);
      
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to fetch results" });
      }
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      console.log(`[QUIZ_CONTROLLER] Getting dashboard data`);
      
      const completedQuizzes = await quizService.getDashboard();

      res.json(completedQuizzes);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  }

  async checkDailyLimit(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      console.log(`[QUIZ_CONTROLLER] Checking daily limit for user: ${user.id}`);
      
      const limit = await quizService.checkDailyLimit(user.id);
      res.json(limit);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error checking daily limit:", error);
      res.status(500).json({ message: "Failed to check daily limit" });
    }
  }

  async startQuizWithLimit(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { categoryId } = req.body;
      
      console.log(`[QUIZ_CONTROLLER] Starting quiz with limit for user: ${user.id}`);

      const result = await quizService.startQuizWithLimit(user.id, categoryId);

      res.json(result);
    } catch (error) {
      console.error("❌ [QUIZ_CONTROLLER] Error starting quiz with limit:", error);
      
      if (error instanceof Error) {
        if (error.message === "Limite diário atingido") {
          res.status(429).json({ 
            message: error.message, 
            remaining: 0,
            needsPremium: true 
          });
        } else {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(500).json({ message: "Failed to start quiz" });
      }
    }
  }
}

export const quizController = new QuizController();