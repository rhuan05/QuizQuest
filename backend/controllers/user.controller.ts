import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { generateToken } from '../auth/service/auth.service';
import bcrypt from 'bcryptjs';
import { storage } from '../server/storage';

export class UserController {
  
  async register(req: Request, res: Response) {
    try {
      const userData = req.body;

      console.log(`[USER_CONTROLLER] Registering new user`);
      console.log(`[USER_CONTROLLER] Request data:`, { email: userData.email, username: userData.username });

      const result = await userService.registerUser(userData);

      res.status(201).json(result);
    } catch (error) {
      console.error("❌ [USER_CONTROLLER] Error registering user:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: "Erro ao criar usuário",
          error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      console.log(`[USER_CONTROLLER] Login attempt for email: ${email}`);

      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash || "");
      if (!isValidPassword) {
        return res.status(401).json({ message: "Senha inválida" });
      }

      const token = generateToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });

      console.log(`[USER_CONTROLLER] Login successful for user: ${user.id}`);

      res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("❌ [USER_CONTROLLER] Error during login:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export const userController = new UserController();