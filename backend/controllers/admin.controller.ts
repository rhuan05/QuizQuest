import type { Request, Response } from 'express';
import { questionsService } from '../services/questions.service';

export class AdminController {
  
  async getQuestions(req: Request, res: Response) {
    try {
      console.log(`[ADMIN_CONTROLLER] Fetching all questions`);
      
      const allQuestions = await questionsService.getAllQuestions();
      
      res.json(allQuestions);
    } catch (error) {
      console.error("❌ [ADMIN_CONTROLLER] Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  }

  async createQuestion(req: Request, res: Response) {
    try {
      const questionData = req.body;

      console.log(`[ADMIN_CONTROLLER] Creating new question`);
      console.log(`[ADMIN_CONTROLLER] Request data:`, questionData);

      const question = await questionsService.createQuestion(questionData);

      res.status(201).json({ 
        message: "Pergunta criada com sucesso", 
        questionId: question.id,
        question: question 
      });
    } catch (error) {
      console.error("❌ [ADMIN_CONTROLLER] Error creating question:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: "Erro interno do servidor",
          error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
      }
    }
  }

  async updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const questionData = req.body;

      console.log(`[ADMIN_CONTROLLER] Updating question ${id}`);
      console.log(`[ADMIN_CONTROLLER] Request data:`, questionData);

      const updatedQuestion = await questionsService.updateQuestion(id, questionData);

      res.json({ 
        message: "Pergunta atualizada com sucesso", 
        question: updatedQuestion 
      });
    } catch (error) {
      console.error("❌ [ADMIN_CONTROLLER] Error updating question:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: "Erro interno do servidor",
          error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
      }
    }
  }

  async deleteQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log(`[ADMIN_CONTROLLER] Deleting question ${id}`);

      await questionsService.deleteQuestion(id);
      
      res.json({ message: "Pergunta deletada com sucesso" });
    } catch (error) {
      console.error("❌ [ADMIN_CONTROLLER] Error deleting question:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete question" });
      }
    }
  }
}

export const adminController = new AdminController();