import type { Express } from "express";
import { createServer, type Server } from "http";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { adminController } from "../controllers/admin.controller";
import { userController } from "../controllers/user.controller";
import { quizController } from "../controllers/quiz.controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quiz Routes 
  app.get("/api/questions", authMiddleware, quizController.getQuestions);
  app.get("/api/categories", authMiddleware, quizController.getCategories);
  app.get("/api/difficulties", authMiddleware, quizController.getDifficulties);

  app.post("/api/quiz/start", authMiddleware, quizController.startQuiz);

  app.post("/api/quiz/answer", authMiddleware, quizController.submitAnswer);

  app.post("/api/quiz/complete", authMiddleware, quizController.completeQuiz);

  app.get("/api/quiz/results/:sessionToken", authMiddleware, quizController.getResults);
  app.get("/api/quiz/dashboard", adminMiddleware, quizController.getDashboard);

  // User Routes 
  app.post("/api/login", userController.login);
  app.post("/api/cadastro", userController.register);
  
  // Admin Routes 
  app.get("/api/admin/questions", adminMiddleware, adminController.getQuestions);
  app.post("/api/admin/questions", adminMiddleware, adminController.createQuestion);
  app.put("/api/admin/questions/:id", adminMiddleware, adminController.updateQuestion);
  app.delete("/api/admin/questions/:id", adminMiddleware, adminController.deleteQuestion);

  app.get("/api/quiz/daily-limit", authMiddleware, quizController.checkDailyLimit);
  app.post("/api/quiz/start-with-limit", authMiddleware, quizController.startQuizWithLimit);

  const httpServer = createServer(app);
  return httpServer;
}
