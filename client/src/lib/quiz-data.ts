import type { QuestionWithOptions } from "@shared/schema";

// This file contains sample quiz data for development
// In production, this data should come from the database

export const sampleQuestions: QuestionWithOptions[] = [
  {
    id: "1",
    title: "Qual será o resultado do seguinte código?",
    question: "Analise o código JavaScript abaixo e determine o output:",
    code: `console.log(typeof null);
console.log(null === undefined);
console.log(null == undefined);`,
    explanation: "Em JavaScript, typeof null retorna 'object' devido a um bug histórico da linguagem que foi mantido por compatibilidade. null === undefined é false (comparação estrita de tipos), mas null == undefined é true (comparação com coerção).",
    isActive: true,
    categoryId: "js-basics",
    difficultyId: "medium",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "js-basics",
      name: "JavaScript Básico",
      description: "Conceitos fundamentais",
      slug: "javascript-basico",
      icon: "code",
      color: "#2563EB",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    difficulty: {
      id: "medium",
      name: "medium",
      label: "Médio",
      points: 2,
      color: "#EA580C",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    options: [
      {
        id: "1a",
        text: '"object", false, true',
        isCorrect: true,
        order: 1,
        questionId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1b",
        text: '"null", false, false',
        isCorrect: false,
        order: 2,
        questionId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1c",
        text: '"undefined", true, true',
        isCorrect: false,
        order: 3,
        questionId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1d",
        text: "Erro de sintaxe",
        isCorrect: false,
        order: 4,
        questionId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  // Add more sample questions here for development...
];
