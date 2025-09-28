import { storage } from "../server/storage";
import { QuizStartData, QuizAnswerData, QuizCompleteData } from "../shared/types";
import { randomUUID } from "crypto";

export class QuizService {
  
  async getQuestions(count: number, categoryId?: string) {
    console.log(`[QUIZ_SERVICE] Getting ${count} questions for category: ${categoryId}`);

    const questions = await storage.getRandomQuestions(count, categoryId as any);
    
    const sanitizedQuestions = questions.map(question => ({
      ...question,
      options: question.options.map(option => ({
        ...option,
        isCorrect: undefined
      }))
    }));
    
    console.log(`[QUIZ_SERVICE] Retrieved ${sanitizedQuestions.length} questions`);
    return sanitizedQuestions;
  }

  async getCategories() {
    console.log(`[QUIZ_SERVICE] Getting categories`);
    return await storage.getCategories();
  }

  async getDifficulties() {
    console.log(`[QUIZ_SERVICE] Getting difficulties`);
    return await storage.getDifficulties();
  }

  async startQuiz(quizData: QuizStartData, userAgent: string, ipAddress: string) {
    console.log(`[QUIZ_SERVICE] Starting quiz for category: ${quizData.category}`);

    const { category } = quizData;

    const sessionToken = randomUUID();

    const session = await storage.createQuizSession({
      sessionToken,
      totalQuestions: 10,
      userAgent,
      ipAddress,
      deviceType: userAgent?.includes('Mobile') ? 'mobile' : 'desktop'
    });

    const categoryDB = await storage.getCategoryByName(category);
    if (!categoryDB) {
      throw new Error(`Categoria '${category}' não encontrada`);
    }

    const questions = await storage.getRandomQuestions(10, categoryDB.id as any);

    if (questions.length === 0) {
      throw new Error("Nenhuma pergunta encontrada para esta categoria");
    }

    const sanitizedQuestions = questions.map(question => ({
      ...question,
      options: question.options.map(option => ({
        ...option,
        isCorrect: undefined
      }))
    }));

    console.log(`[QUIZ_SERVICE] Quiz started with ${sanitizedQuestions.length} questions`);

    return { 
      sessionToken, 
      sessionId: session.id,
      questions: sanitizedQuestions
    };
  }

  async submitAnswer(answerData: QuizAnswerData) {
    console.log(`[QUIZ_SERVICE] Submitting answer for question: ${answerData.questionId}`);

    const { sessionToken, questionId, optionId, timeSpent } = answerData;

    if (!sessionToken || !questionId || !optionId) {
      throw new Error("Missing required fields");
    }

    const session = await storage.getQuizSessionByToken(sessionToken);
    if (!session) {
      throw new Error("Session not found");
    }

    const question = await storage.getQuestionById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const selectedOption = question.options.find(opt => opt.id === optionId);
    if (!selectedOption) {
      throw new Error("Invalid option");
    }

    const isCorrect = selectedOption.isCorrect;

    await storage.createAnswer({
      sessionId: session.id,
      questionId,
      optionId,
      userId: session.userId,
      isCorrect,
      timeSpent: timeSpent || null
    });

    await storage.updateQuestionStats(questionId, isCorrect, timeSpent);

    if (isCorrect) {
      const updatedCorrectAnswers = session.correctAnswers + 1;
      const updatedScore = (updatedCorrectAnswers / session.totalQuestions) * 100;
      
      await storage.updateQuizSession(session.id, {
        correctAnswers: updatedCorrectAnswers,
        score: updatedScore
      });
    }

    await storage.updatedQuestionsAnswered(session.userId as string);

    console.log(`[QUIZ_SERVICE] Answer submitted - isCorrect: ${isCorrect}`);

    return {
      isCorrect,
      correctOption: question.options.find(opt => opt.isCorrect),
      explanation: question.explanation,
      currentScore: isCorrect ? session.score + (100 / session.totalQuestions) : session.score
    };
  }

  async completeQuiz(completeData: QuizCompleteData) {
    console.log(`[QUIZ_SERVICE] Completing quiz session: ${completeData.sessionToken}`);

    const { sessionToken, timeSpent } = completeData;

    if (!sessionToken) {
      throw new Error("Session token required");
    }

    const session = await storage.getQuizSessionByToken(sessionToken);
    if (!session) {
      throw new Error("Session not found");
    }

    await storage.updateQuizSession(session.id, {
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: timeSpent || null
    });

    const detailedSession = await storage.getQuizSession(session.id);

    console.log(`[QUIZ_SERVICE] Quiz completed successfully`);
    return detailedSession;
  }

  async getResults(sessionToken: string) {
    console.log(`[QUIZ_SERVICE] Getting results for session: ${sessionToken}`);

    const session = await storage.getQuizSessionByToken(sessionToken);
    if (!session) {
      throw new Error("Session not found");
    }

    const categoryStats = new Map();
    const difficultyStats = new Map();
    
    for (const answer of session.answers) {
      const category = await storage.getCategoryById(answer.question.categoryId) || null;
      const difficulty = await storage.getDifficultyById(answer.question.difficultyId) || null;

      const categoryKey = category?.name ?? "unknown-category";
      const difficultyKey = difficulty?.name ?? "unknown-difficulty";
      
      if (!categoryStats.has(categoryKey)) {
        categoryStats.set(categoryKey, { total: 0, correct: 0, name: category?.name ?? "Desconhecido" });
      }
      const catStat = categoryStats.get(categoryKey);
      catStat.total += 1;
      if (answer.isCorrect) catStat.correct += 1;
      
      if (!difficultyStats.has(difficultyKey)) {
        difficultyStats.set(difficultyKey, { total: 0, correct: 0, name: difficulty?.name ?? "Desconhecido" });
      }
      const diffStat = difficultyStats.get(difficultyKey);
      diffStat.total += 1;
      if (answer.isCorrect) diffStat.correct += 1;
    }

    let performanceLevel = 'Iniciante';
    if (session.score >= 80) performanceLevel = 'Avançado';
    else if (session.score >= 60) performanceLevel = 'Intermediário';

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

    console.log(`[QUIZ_SERVICE] Analytics calculated successfully`);
    return analytics;
  }

  async getDashboard() {
    console.log(`[QUIZ_SERVICE] Getting dashboard data`);
    return await storage.getCompletedQuizSession();
  }

  async checkDailyLimit(userId: string) {
    console.log(`[QUIZ_SERVICE] Checking daily limit for user: ${userId}`);
    return await storage.checkDailyLimit(userId);
  }

  async startQuizWithLimit(userId: string, categoryId: string) {
    console.log(`[QUIZ_SERVICE] Starting quiz with limit for user: ${userId}`);

    const { canAnswer, remaining } = await storage.checkDailyLimit(userId);
    
    if (!canAnswer) {
      throw new Error("Limite diário atingido");
    }

    const questions = await storage.getRandomQuestions(1, categoryId as any);
    
    if (questions.length === 0) {
      throw new Error("Nenhuma pergunta encontrada");
    }

    const sanitizedQuestion = {
      ...questions[0],
      options: questions[0].options.map(option => ({
        ...option,
        isCorrect: undefined
      }))
    };

    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = await storage.getDailyUsage(userId, today);
    
    if (dailyUsage) {
      await storage.updateDailyUsage(userId, today, dailyUsage.questionsAnswered + 1);
    } else {
      await storage.createDailyUsage({
        userId: userId,
        date: today,
        questionsAnswered: 1
      });
    }

    console.log(`[QUIZ_SERVICE] Quiz with limit started - remaining: ${remaining - 1}`);

    return { 
      question: sanitizedQuestion,
      remaining: remaining - 1
    };
  }
}

export const quizService = new QuizService();