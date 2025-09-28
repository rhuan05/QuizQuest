import { storage } from "../server/storage";
import { Question } from "../shared/schema";
import { QuestionFormData } from "../shared/types";

export class QuestionService {
    async updateQuestion(id: string, questionData: QuestionFormData): Promise<Question> {
        console.log(`[QUESTION_SERVICE] Updating question ${id}`);
    
        const category = await storage.getCategoryByName(questionData.category);
        if (!category) {
        throw new Error(`Categoria '${questionData.category}' não encontrada`);
        }

        const difficulty = await storage.getDifficultyByName(questionData.difficulty);
        if (!difficulty) {
        throw new Error(`Dificuldade '${questionData.difficulty}' não encontrada`);
        }

        this.validateQuestionData(questionData);

        const formattedUpdates = {
        categoryId: category.id,
        difficultyId: difficulty.id,
        question: questionData.question.trim(),
        explanation: questionData.explanation.trim()
        };

        const updatedQuestion = await storage.updateQuestion(id, formattedUpdates);
        
        if (questionData.options) {
        const validOptions = questionData.options.filter(opt => opt.text && opt.text.trim());
        await storage.updateQuestionOptions(id, validOptions.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
        })));
        }

        console.log(`[QUESTION_SERVICE] Question updated successfully: ${updatedQuestion.id}`);
        return updatedQuestion;
    }

    private validateQuestionData(questionData: QuestionFormData): void {
        if (!questionData.question || !questionData.question.trim()) {
            throw new Error('Pergunta é obrigatória');
        }

        if (!questionData.explanation || !questionData.explanation.trim()) {
            throw new Error('Explicação é obrigatória');
        }

        if (!questionData.options || questionData.options.length < 2) {
            throw new Error('Devem haver pelo menos 2 opções');
        }

        const validOptions = questionData.options.filter(opt => opt.text && opt.text.trim());
        
        if (validOptions.length < 2) {
            throw new Error('Devem haver pelo menos 2 opções válidas');
        }

        const correctOptions = validOptions.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
            throw new Error('Deve haver exatamente 1 opção correta');
        }
    }

    async createQuestion(questionData: QuestionFormData): Promise<Question> {
        console.log(`[QUESTION_SERVICE] Creating new question`);
        
        const category = await storage.getCategoryByName(questionData.category);
        if (!category) {
            throw new Error(`Categoria '${questionData.category}' não encontrada`);
        }

        const difficulty = await storage.getDifficultyByName(questionData.difficulty);
        if (!difficulty) {
            throw new Error(`Dificuldade '${questionData.difficulty}' não encontrada`);
        }

        this.validateQuestionData(questionData);

        const validOptions = questionData.options.filter(opt => opt.text && opt.text.trim());
        const formattedQuestionData = {
            categoryId: category.id,
            difficultyId: difficulty.id,
            title: questionData.question.trim(),
            question: questionData.question.trim(),
            code: null,
            explanation: questionData.explanation.trim(),
            options: validOptions.map(opt => ({
                text: opt.text.trim(),
                isCorrect: opt.isCorrect
            }))
        };

        console.log(`[QUESTION_SERVICE] Creating question with data:`, formattedQuestionData);

        const question = await storage.createQuestionWithOptions(formattedQuestionData);
        
        console.log(`[QUESTION_SERVICE] Question created successfully: ${question.id}`);
        return question;
    }

    async getAllQuestions(): Promise<Question[]> {
        console.log(`[QUESTION_SERVICE] Fetching all questions`);
        return await storage.getAllQuestionsAdmin();
    }

    async deleteQuestion(id: string): Promise<void> {
        console.log(`[QUESTION_SERVICE] Deleting question ${id}`);
        await storage.deleteQuestion(id);
        console.log(`[QUESTION_SERVICE] Question deleted successfully: ${id}`);
    }
}

export const questionsService = new QuestionService();