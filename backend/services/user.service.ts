import { storage } from "../server/storage";
import { UserFormData } from "../shared/types";
import bcrypt from "bcryptjs";

export class UserService {
  
  async registerUser(userData: UserFormData) {
    console.log('[USER_SERVICE] Registering new user');
    
    const { email, username, password } = userData;
    
    this.validateUserData(userData);
    
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      throw new Error("Email já está em uso.");
    }

    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      throw new Error("Username já está em uso.");
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

    await storage.createUserPlan({
      userId: newUser.id,
      planType: "free",
      questionsPerDay: 10,
      currentDayQuestions: 0
    });

    console.log('[USER_SERVICE] User registered successfully:', newUser.id);
    
    return {
      message: "Usuário criado com sucesso.",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    };
  }

  private validateUserData(userData: UserFormData): void {
    const { email, username, password } = userData;
    
    if (!email || !username || !password) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Formato de email inválido");
    }

    if (password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    if (username.length < 3) {
      throw new Error("Username deve ter pelo menos 3 caracteres");
    }
  }
}

export const userService = new UserService();