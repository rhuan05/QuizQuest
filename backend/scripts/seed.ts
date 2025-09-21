import { db } from "../server/db";
import { categories, difficulties, users, questions, options, userPlans } from "../shared/schema";
import { randomUUID } from "crypto";

// Tech-focused quiz data for development
const seedData = {
  categories: [
    {
      name: "JavaScript",
      description: "Fundamentos, ES6+, promises, async/await",
      slug: "javascript",
      icon: "code",
      color: "#F7DF1E",
    },
    {
      name: "React",
      description: "Hooks, componentes, state management",
      slug: "react",
      icon: "layers",
      color: "#61DAFB",
    },
    {
      name: "Node.js",
      description: "Backend, APIs, Express, middleware",
      slug: "nodejs",
      icon: "server",
      color: "#339933",
    },
    {
      name: "Banco de Dados",
      description: "SQL, NoSQL, queries, otimização",
      slug: "database",
      icon: "database",
      color: "#336791",
    },
    {
      name: "Web APIs",
      description: "REST, GraphQL, autenticação, CORS",
      slug: "web-apis",
      icon: "globe",
      color: "#FF6B6B",
    },
    {
      name: "Segurança",
      description: "JWT, HTTPS, XSS, CSRF, validação",
      slug: "security",
      icon: "shield",
      color: "#E74C3C",
    },
    {
      name: "TypeScript",
      description: "Tipagem estática, interfaces, generics",
      slug: "typescript",
      icon: "code2",
      color: "#3178C6",
    },
    {
      name: "CSS & Styling",
      description: "Flexbox, Grid, responsivo, frameworks",
      slug: "css",
      icon: "palette",
      color: "#1572B6",
    },
  ],
  difficulties: [
    {
      name: "easy",
      label: "Fácil",
      points: 1,
      color: "#10B981",
      order: 1,
    },
    {
      name: "medium",
      label: "Médio",
      points: 2,
      color: "#F59E0B",
      order: 2,
    },
    {
      name: "hard",
      label: "Difícil",
      points: 3,
      color: "#EF4444",
      order: 3,
    },
  ],
};

const quizQuestions = [
  // JavaScript Questions
  {
    title: "Comportamento do typeof null",
    question: "Qual será o resultado do código abaixo?",
    code: `console.log(typeof null);
console.log(null === undefined);
console.log(null == undefined);`,
    explanation: "Em JavaScript, typeof null retorna 'object' devido a um bug histórico da linguagem que foi mantido por compatibilidade. null === undefined é false (comparação estrita), mas null == undefined é true (comparação com coerção).",
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
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
    categorySlug: "javascript",
    difficultyName: "hard",
    options: [
      { text: "1, 2, 3, 4", isCorrect: false, order: 1 },
      { text: "1, 4, 2, 3", isCorrect: false, order: 2 },
      { text: "1, 4, 3, 2", isCorrect: true, order: 3 },
      { text: "1, 3, 2, 4", isCorrect: false, order: 4 },
    ],
  },

  // React Questions
  {
    title: "useState Hook",
    question: "O que acontece quando chamamos setState com o mesmo valor?",
    code: `const [count, setCount] = useState(0);

// Chamando setCount(0) quando count já é 0
setCount(0);`,
    explanation: "O React otimiza re-renders usando Object.is() para comparar valores. Se o novo valor for igual ao atual, o componente não re-renderiza.",
    categorySlug: "react",
    difficultyName: "medium",
    options: [
      { text: "O componente sempre re-renderiza", isCorrect: false, order: 1 },
      { text: "O componente não re-renderiza", isCorrect: true, order: 2 },
      { text: "Gera um erro", isCorrect: false, order: 3 },
      { text: "Depende do valor anterior", isCorrect: false, order: 4 },
    ],
  },

  {
    title: "useEffect Dependencies",
    question: "Quando o useEffect será executado?",
    code: `const [count, setCount] = useState(0);
const [name, setName] = useState('');

useEffect(() => {
  console.log('Effect executado');
}, [count]);`,
    explanation: "O useEffect será executado apenas quando 'count' mudar. Mudanças em 'name' não irão disparar o effect pois não está no array de dependências.",
    categorySlug: "react",
    difficultyName: "easy",
    options: [
      { text: "Sempre que o componente re-renderizar", isCorrect: false, order: 1 },
      { text: "Apenas quando count mudar", isCorrect: true, order: 2 },
      { text: "Apenas quando name mudar", isCorrect: false, order: 3 },
      { text: "Nunca", isCorrect: false, order: 4 },
    ],
  },

  // Node.js Questions  
  {
    title: "Módulos CommonJS vs ES6",
    question: "Qual a principal diferença entre require() e import?",
    code: `// CommonJS
const fs = require('fs');

// ES6 Modules  
import fs from 'fs';`,
    explanation: "require() é síncrono e carrega módulos em runtime, enquanto import é assíncrono, carregado em build-time e permite tree-shaking.",
    categorySlug: "nodejs",
    difficultyName: "medium",
    options: [
      { text: "Não há diferença prática", isCorrect: false, order: 1 },
      { text: "require() é assíncrono, import é síncrono", isCorrect: false, order: 2 },
      { text: "require() é síncrono, import permite tree-shaking", isCorrect: true, order: 3 },
      { text: "import só funciona no browser", isCorrect: false, order: 4 },
    ],
  },

  {
    title: "Event Loop Node.js",
    question: "Em que ordem serão executados os console.log?",
    code: `console.log('1');
setImmediate(() => console.log('2')); 
process.nextTick(() => console.log('3'));
setTimeout(() => console.log('4'), 0);
console.log('5');`,
    explanation: "Ordem: código síncrono (1,5), nextTick (3), setTimeout (4), setImmediate (2). NextTick tem prioridade sobre setTimeout e setImmediate.",
    categorySlug: "nodejs",
    difficultyName: "hard",
    options: [
      { text: "1, 5, 3, 4, 2", isCorrect: true, order: 1 },
      { text: "1, 2, 3, 4, 5", isCorrect: false, order: 2 },
      { text: "1, 5, 2, 3, 4", isCorrect: false, order: 3 },
      { text: "1, 5, 4, 3, 2", isCorrect: false, order: 4 },
    ],
  },

  // Database Questions
  {
    title: "SQL JOIN Types",
    question: "Qual JOIN retorna registros mesmo quando não há correspondência na tabela direita?",
    code: `SELECT users.name, orders.total
FROM users 
??? JOIN orders ON users.id = orders.user_id`,
    explanation: "LEFT JOIN retorna todos os registros da tabela esquerda (users) mesmo quando não há correspondência na tabela direita (orders).",
    categorySlug: "database",
    difficultyName: "easy",
    options: [
      { text: "INNER JOIN", isCorrect: false, order: 1 },
      { text: "LEFT JOIN", isCorrect: true, order: 2 },
      { text: "RIGHT JOIN", isCorrect: false, order: 3 },
      { text: "FULL JOIN", isCorrect: false, order: 4 },
    ],
  },

  {
    title: "Database Indexing",
    question: "Qual é o principal benefício de criar um índice em uma coluna?",
    code: `CREATE INDEX idx_email ON users(email);`,
    explanation: "Índices aceleram consultas SELECT, mas tornam INSERT/UPDATE/DELETE mais lentos pois o índice precisa ser atualizado.",
    categorySlug: "database",
    difficultyName: "medium",
    options: [
      { text: "Acelera INSERT operations", isCorrect: false, order: 1 },
      { text: "Acelera SELECT queries", isCorrect: true, order: 2 },
      { text: "Reduz o tamanho da tabela", isCorrect: false, order: 3 },
      { text: "Melhora a segurança", isCorrect: false, order: 4 },
    ],
  },

  // Web APIs Questions
  {
    title: "HTTP Status Codes",
    question: "Qual status code indica que o recurso foi criado com sucesso?",
    code: `POST /api/users
{
  "name": "João",
  "email": "joao@email.com"
}`,
    explanation: "Status 201 (Created) indica que a requisição foi bem-sucedida e um novo recurso foi criado. 200 é para sucesso geral, 204 para sucesso sem conteúdo.",
    categorySlug: "web-apis",
    difficultyName: "easy",
    options: [
      { text: "200 OK", isCorrect: false, order: 1 },
      { text: "201 Created", isCorrect: true, order: 2 },
      { text: "204 No Content", isCorrect: false, order: 3 },
      { text: "202 Accepted", isCorrect: false, order: 4 },
    ],
  },

  {
    title: "CORS Headers",
    question: "Qual header permite que qualquer origem acesse a API?",
    code: `app.use((req, res, next) => {
  res.header('???', '???');
  next();
});`,
    explanation: "Access-Control-Allow-Origin: * permite que qualquer domínio acesse a API. Porém, em produção é recomendado especificar domínios específicos por segurança.",
    categorySlug: "web-apis",
    difficultyName: "medium",
    options: [
      { text: "Access-Control-Allow-Origin: *", isCorrect: true, order: 1 },
      { text: "Access-Control-Allow-Methods: *", isCorrect: false, order: 2 },
      { text: "Access-Control-Allow-Headers: *", isCorrect: false, order: 3 },
      { text: "Access-Control-Max-Age: *", isCorrect: false, order: 4 },
    ],
  },

  // Security Questions
  {
    title: "JWT Structure",
    question: "Quais são as três partes de um JWT?",
    code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    explanation: "JWT tem 3 partes separadas por pontos: Header (algoritmo), Payload (dados), Signature (verificação de integridade).",
    categorySlug: "security",
    difficultyName: "easy",
    options: [
      { text: "Header, Body, Footer", isCorrect: false, order: 1 },
      { text: "Header, Payload, Signature", isCorrect: true, order: 2 },
      { text: "Type, Data, Hash", isCorrect: false, order: 3 },
      { text: "Algorithm, Claims, Secret", isCorrect: false, order: 4 },
    ],
  },

  {
    title: "XSS Prevention",
    question: "Qual é a melhor forma de prevenir ataques XSS?",
    code: `// Dados do usuário
const userInput = '<script>alert("XSS")</script>';

// Como exibir com segurança?
document.innerHTML = userInput; // ❌ Perigoso`,
    explanation: "Sanitização/escape de dados de entrada e uso de textContent ao invés de innerHTML previnem XSS. Content Security Policy (CSP) adiciona uma camada extra de proteção.",
    categorySlug: "security",
    difficultyName: "medium",
    options: [
      { text: "Usar HTTPS apenas", isCorrect: false, order: 1 },
      { text: "Sanitizar inputs e usar textContent", isCorrect: true, order: 2 },
      { text: "Validar apenas no backend", isCorrect: false, order: 3 },
      { text: "Usar cookies seguros", isCorrect: false, order: 4 },
    ],
  },

  // TypeScript Questions
  {
    title: "Type vs Interface",
    question: "Qual a principal diferença entre type e interface no TypeScript?",
    code: `// Type alias
type User = {
  name: string;
};

// Interface
interface IUser {
  name: string;
}`,
    explanation: "Interfaces podem ser estendidas e mescladas (declaration merging), enquanto types são mais flexíveis para unions, primitivos e operações avançadas.",
    categorySlug: "typescript",
    difficultyName: "medium",
    options: [
      { text: "Não há diferença", isCorrect: false, order: 1 },
      { text: "Interface permite extensão e merging", isCorrect: true, order: 2 },
      { text: "Type é mais performático", isCorrect: false, order: 3 },
      { text: "Interface só funciona com objetos", isCorrect: false, order: 4 },
    ],
  },

  // CSS Questions
  {
    title: "Flexbox vs Grid",
    question: "Quando usar CSS Grid ao invés de Flexbox?",
    code: `/* Flexbox */
.container {
  display: flex;
}

/* Grid */
.container {
  display: grid;
}`,
    explanation: "Grid é ideal para layouts bidimensionais (linhas e colunas), enquanto Flexbox é melhor para layouts unidimensionais (uma direção por vez).",
    categorySlug: "css",
    difficultyName: "easy",
    options: [
      { text: "Grid é sempre melhor", isCorrect: false, order: 1 },
      { text: "Para layouts bidimensionais complexos", isCorrect: true, order: 2 },
      { text: "Grid tem melhor suporte", isCorrect: false, order: 3 },
      { text: "Apenas para responsividade", isCorrect: false, order: 4 },
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

    // Create admin user
    console.log("👤 Criando usuário admin...");
    const adminUser = await db.insert(users).values({
      email: "admin@quizquest.com",
      username: "admin@quizquest.com", 
      passwordHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password = "password"
      displayName: "Administrador",
      isAnonymous: false,
      role: "admin",
    }).returning();
    
    // Create user plan for admin (premium)
    await db.insert(userPlans).values({
      userId: adminUser[0].id,
      planType: "premium",
      questionsPerDay: 999, // High limit for admin
    });
    
    console.log(`✅ Admin user criado: ${adminUser[0].email}`);

    // Create maps for easy lookup
    const categoryMap = new Map(insertedCategories.map(cat => [cat.slug, cat.id]));
    const difficultyMap = new Map(insertedDifficulties.map(diff => [diff.name, diff.id]));

    // Insert questions and options
    console.log("❓ Inserindo perguntas...");
    for (const q of quizQuestions) {
      const categoryId = categoryMap.get(q.categorySlug);
      const difficultyId = difficultyMap.get(q.difficultyName);

      if (!categoryId || !difficultyId) {
        console.error(`Erro: categoria ou dificuldade não encontrada para pergunta: ${q.title}`);
        continue;
      }

      // Insert question
      const questionData: any = {
        title: q.title,
        question: q.question,
        explanation: q.explanation,
        categoryId,
        difficultyId,
      };
      
      // Add code field only if it exists
      if (q.code) {
        questionData.code = q.code;
      }
      
      const insertedQuestion = await db.insert(questions).values(questionData).returning();

      // Insert options
      const optionValues = q.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: opt.order,
        questionId: insertedQuestion[0].id,
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
    console.log(`   - 1 usuário admin (admin@quizquest.com / password)`);

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