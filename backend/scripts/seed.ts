import { db } from "../server/db";
import { categories, difficulties, questions, options } from "../shared/schema";
import { randomUUID } from "crypto";

// Sample quiz data for development
const seedData = {
  categories: [
    {
      id: randomUUID(),
      name: "JavaScript Básico",
      description: "Conceitos fundamentais do JavaScript",
      slug: "javascript-basico",
      icon: "code",
      color: "#2563EB",
      isActive: true,
    },
    {
      id: randomUUID(),
      name: "Async/Await",
      description: "Programação assíncrona em JavaScript",
      slug: "async-await",
      icon: "clock",
      color: "#7C3AED",
      isActive: true,
    },
    {
      id: randomUUID(),
      name: "DOM Manipulation",
      description: "Manipulação do Document Object Model",
      slug: "dom-manipulation",
      icon: "layout",
      color: "#059669",
      isActive: true,
    },
  ],
  difficulties: [
    {
      id: randomUUID(),
      name: "easy",
      label: "Fácil",
      points: 1,
      color: "#059669",
      order: 1,
    },
    {
      id: randomUUID(),
      name: "medium",
      label: "Médio",
      points: 2,
      color: "#EA580C",
      order: 2,
    },
    {
      id: randomUUID(),
      name: "hard",
      label: "Difícil",
      points: 3,
      color: "#DC2626",
      order: 3,
    },
  ],
};

const quizQuestions = [
  {
    title: "Comportamento do typeof null",
    question: "Qual será o resultado do código abaixo?",
    code: `console.log(typeof null);
console.log(null === undefined);
console.log(null == undefined);`,
    explanation: "Em JavaScript, typeof null retorna 'object' devido a um bug histórico da linguagem que foi mantido por compatibilidade. null === undefined é false (comparação estrita), mas null == undefined é true (comparação com coerção).",
    categorySlug: "javascript-basico",
    difficultyName: "medium",
    options: [
      { text: '"object", false, true', isCorrect: true, order: 1 },
      { text: '"null", false, false', isCorrect: false, order: 2 },
      { text: '"undefined", true, true', isCorrect: false, order: 3 },
      { text: "Erro de sintaxe", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Mutabilidade de Arrays",
    question: "O que será impresso no console?",
    code: `const arr1 = [1, 2, 3];
const arr2 = arr1;
arr2.push(4);
console.log(arr1.length);
console.log(arr2.length);`,
    explanation: "Arrays são objetos em JavaScript e são passados por referência. Quando arr2 = arr1, ambas as variáveis apontam para o mesmo array na memória. Modificar arr2 também modifica arr1.",
    categorySlug: "javascript-basico",
    difficultyName: "easy",
    options: [
      { text: "3, 4", isCorrect: false, order: 1 },
      { text: "4, 4", isCorrect: true, order: 2 },
      { text: "3, 3", isCorrect: false, order: 3 },
      { text: "Erro", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Operador de Incremento",
    question: "Qual será o valor final de x?",
    code: `let x = 5;
let y = ++x + x++ + x;
console.log(y);`,
    explanation: "++x incrementa x para 6 e retorna 6. x++ retorna 6 e depois incrementa x para 7. O último x vale 7. Então y = 6 + 6 + 7 = 19.",
    categorySlug: "javascript-basico",
    difficultyName: "hard",
    options: [
      { text: "17", isCorrect: false, order: 1 },
      { text: "18", isCorrect: false, order: 2 },
      { text: "19", isCorrect: true, order: 3 },
      { text: "20", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Comparação de Igualdade",
    question: "Quais comparações retornam true?",
    code: `console.log(0 == false);
console.log('' == false);
console.log(null == false);
console.log(undefined == false);`,
    explanation: "Com o operador ==, JavaScript faz coerção de tipos. 0 e '' são convertidos para false, então as duas primeiras são true. null e undefined não são convertidos para false, então são false.",
    categorySlug: "javascript-basico",
    difficultyName: "medium",
    options: [
      { text: "Apenas as duas primeiras", isCorrect: true, order: 1 },
      { text: "Todas são true", isCorrect: false, order: 2 },
      { text: "Apenas a primeira", isCorrect: false, order: 3 },
      { text: "Nenhuma é true", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Precisão de Ponto Flutuante",
    question: "O que será impresso?",
    code: `console.log(0.1 + 0.2 === 0.3);
console.log(0.1 + 0.2);`,
    explanation: "Devido à representação binária dos números de ponto flutuante, 0.1 + 0.2 não é exatamente 0.3, mas sim 0.30000000000000004. Isso é um comportamento normal em JavaScript e outras linguagens.",
    categorySlug: "javascript-basico",
    difficultyName: "medium",
    options: [
      { text: "true, 0.3", isCorrect: false, order: 1 },
      { text: "false, 0.30000000000000004", isCorrect: true, order: 2 },
      { text: "false, 0.3", isCorrect: false, order: 3 },
      { text: "true, 0.30000000000000004", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Hoisting e Temporal Dead Zone",
    question: "O que acontece ao executar este código?",
    code: `console.log(a);
console.log(b);
var a = 1;
let b = 2;`,
    explanation: "var é hoisted e inicializada com undefined, então console.log(a) imprime undefined. let também é hoisted, mas fica na Temporal Dead Zone até ser inicializada, causando um ReferenceError.",
    categorySlug: "javascript-basico",
    difficultyName: "hard",
    options: [
      { text: "undefined, undefined", isCorrect: false, order: 1 },
      { text: "ReferenceError na primeira linha", isCorrect: false, order: 2 },
      { text: "undefined, ReferenceError na segunda linha", isCorrect: true, order: 3 },
      { text: "1, 2", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Coerção com Arrays",
    question: "Qual será o resultado?",
    code: `console.log([1, 2] + [3, 4]);
console.log([1, 2] - [3, 4]);`,
    explanation: "No operador +, arrays são convertidos para strings e concatenados: '1,2' + '3,4' = '1,23,4'. No operador -, arrays são convertidos para números (NaN), então NaN - NaN = NaN.",
    categorySlug: "javascript-basico",
    difficultyName: "hard",
    options: [
      { text: "'1,23,4', NaN", isCorrect: true, order: 1 },
      { text: "[1,2,3,4], [-2,-2]", isCorrect: false, order: 2 },
      { text: "'13,24', -2", isCorrect: false, order: 3 },
      { text: "Erro de sintaxe", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Strict vs Loose Equality",
    question: "Quantas comparações retornam true?",
    code: `console.log('5' == 5);
console.log('5' === 5);
console.log(false == 0);
console.log(false === 0);
console.log(null == undefined);
console.log(null === undefined);`,
    explanation: "Com ==: '5' é convertido para 5 (true), false é convertido para 0 (true), null == undefined sempre é true. Com ===: tipos diferentes sempre retornam false. Total: 3 comparações true.",
    categorySlug: "javascript-basico",
    difficultyName: "medium",
    options: [
      { text: "2", isCorrect: false, order: 1 },
      { text: "3", isCorrect: true, order: 2 },
      { text: "4", isCorrect: false, order: 3 },
      { text: "6", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Arrow Functions e this",
    question: "O que será impresso?",
    code: `const obj = {
  name: 'JavaScript',
  regular: function() {
    console.log(this.name);
  },
  arrow: () => {
    console.log(this.name);
  }
};
obj.regular();
obj.arrow();`,
    explanation: "Funções regulares têm seu próprio contexto 'this', então this.name é 'JavaScript'. Arrow functions herdam o 'this' do escopo pai (global), onde this.name é undefined.",
    categorySlug: "javascript-basico",
    difficultyName: "hard",
    options: [
      { text: "'JavaScript', 'JavaScript'", isCorrect: false, order: 1 },
      { text: "'JavaScript', undefined", isCorrect: true, order: 2 },
      { text: "undefined, undefined", isCorrect: false, order: 3 },
      { text: "undefined, 'JavaScript'", isCorrect: false, order: 4 },
    ],
  },
  {
    title: "Event Loop e Execução",
    question: "Em que ordem será a saída?",
    code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    explanation: "O Event Loop prioriza: 1) código síncrono ('1', '4'), 2) microtasks (Promises - '3'), 3) macrotasks (setTimeout - '2'). Ordem final: 1, 4, 3, 2.",
    categorySlug: "async-await",
    difficultyName: "hard",
    options: [
      { text: "1, 2, 3, 4", isCorrect: false, order: 1 },
      { text: "1, 4, 2, 3", isCorrect: false, order: 2 },
      { text: "1, 4, 3, 2", isCorrect: true, order: 3 },
      { text: "1, 3, 2, 4", isCorrect: false, order: 4 },
    ],
  },
];

async function seed() {
  console.log("🌱 Iniciando processo de seed...");

  try {
    // Insert categories
    console.log("📁 Inserindo categorias...");
    const insertedCategories = await db.insert(categories).values(seedData.categories).returning();
    console.log(`✅ ${insertedCategories.length} categorias inseridas`);

    // Insert difficulties
    console.log("📊 Inserindo dificuldades...");
    const insertedDifficulties = await db.insert(difficulties).values(seedData.difficulties).returning();
    console.log(`✅ ${insertedDifficulties.length} dificuldades inseridas`);

    // Create maps for easy lookup
    const categoryMap = new Map(insertedCategories.map(cat => [cat.slug, cat.id]));
    const difficultyMap = new Map(insertedDifficulties.map(diff => [diff.name, diff.id]));

    // Insert questions and options
    console.log("❓ Inserindo perguntas...");
    for (const q of quizQuestions) {
      const questionId = randomUUID();
      const categoryId = categoryMap.get(q.categorySlug);
      const difficultyId = difficultyMap.get(q.difficultyName);

      if (!categoryId || !difficultyId) {
        console.error(`Erro: categoria ou dificuldade não encontrada para pergunta: ${q.title}`);
        continue;
      }

      // Insert question
      await db.insert(questions).values({
        id: questionId,
        title: q.title,
        question: q.question,
        code: q.code,
        explanation: q.explanation,
        categoryId,
        difficultyId,
        isActive: true,
      });

      // Insert options
      const optionValues = q.options.map(opt => ({
        id: randomUUID(),
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: opt.order,
        questionId,
      }));

      await db.insert(options).values(optionValues);
      console.log(`✅ Pergunta "${q.title}" inserida com ${q.options.length} opções`);
    }

    console.log("🎉 Seed concluído com sucesso!");
    console.log(`📊 Resumo:`);
    console.log(`   - ${insertedCategories.length} categorias`);
    console.log(`   - ${insertedDifficulties.length} dificuldades`);
    console.log(`   - ${quizQuestions.length} perguntas`);
    console.log(`   - ${quizQuestions.reduce((sum, q) => sum + q.options.length, 0)} opções`);

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    process.exit(1);
  }
}

// Execute seed if run directly
seed().then(() => {
  console.log("✨ Processo de seed finalizado!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Erro durante execução:", error);
  process.exit(1);
});

export default seed;