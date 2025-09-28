export interface QuestionFormData {
  question: string;
  explanation: string;
  category: string;
  difficulty: string;
  options: OptionFormData[];
}

export interface OptionFormData {
  text: string;
  isCorrect: boolean;
}

export interface UserFormData {
  email: string;
  username: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface QuizStartData {
  category: string;
}

export interface QuizAnswerData {
  sessionToken: string;
  questionId: string;
  optionId: string;
  timeSpent?: number;
}

export interface QuizCompleteData {
  sessionToken: string;
  timeSpent?: number;
}