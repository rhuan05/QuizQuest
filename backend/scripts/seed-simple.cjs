const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const client = await pool.connect();
  
  try {
    // 1. Limpar dados existentes
    console.log("🧹 Limpando dados existentes...");
    await client.query('DELETE FROM options');
    await client.query('DELETE FROM questions');
    await client.query('DELETE FROM user_plans');
    await client.query('DELETE FROM daily_question_usage');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM difficulties');
    await client.query('DELETE FROM users');

    // 2. Criar categorias
    console.log("📂 Criando categorias...");
    const categories = [
      { name: 'JavaScript', slug: 'javascript', description: 'Fundamentos, ES6+, promises, async/await', icon: 'code' },
      { name: 'React', slug: 'react', description: 'Hooks, componentes, state management', icon: 'layers' },
      { name: 'Node.js', slug: 'nodejs', description: 'Backend, APIs, Express, middleware', icon: 'server' },
      { name: 'Banco de Dados', slug: 'database', description: 'SQL, NoSQL, queries, otimização', icon: 'database' },
      { name: 'TypeScript', slug: 'typescript', description: 'Tipagem estática, interfaces, generics', icon: 'code2' },
      { name: 'CSS & Styling', slug: 'css', description: 'Flexbox, Grid, responsivo, frameworks', icon: 'palette' }
    ];

    const insertedCategories = [];
    for (const cat of categories) {
      const result = await client.query(`
        INSERT INTO categories (name, slug, description, icon, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING id, name, slug
      `, [cat.name, cat.slug, cat.description, cat.icon]);
      
      insertedCategories.push(result.rows[0]);
      console.log(`✅ Categoria criada: ${cat.name}`);
    }

    // 3. Criar dificuldades
    console.log("📊 Criando dificuldades...");
    const difficulties = [
      { name: 'Iniciante', label: 'Fácil', order: 1 },
      { name: 'Intermediário', label: 'Médio', order: 2 },
      { name: 'Avançado', label: 'Difícil', order: 3 }
    ];

    const insertedDifficulties = [];
    for (const diff of difficulties) {
      const result = await client.query(`
        INSERT INTO difficulties (name, label, "order")
        VALUES ($1, $2, $3)
        RETURNING id, name, label
      `, [diff.name, diff.label, diff.order]);
      
      insertedDifficulties.push(result.rows[0]);
      console.log(`✅ Dificuldade criada: ${diff.name} (${diff.label})`);
    }

    // 4. Criar usuário admin
    console.log("👤 Criando usuário admin...");
    const adminPassword = await bcrypt.hash("password", 10);
    
    const adminResult = await client.query(`
      INSERT INTO users (email, username, password_hash, display_name, role, is_anonymous)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING id, email
    `, ['admin@quizquest.com', 'admin', adminPassword, 'Administrador', 'admin']);
    
    const adminUser = adminResult.rows[0];
    console.log(`✅ Admin criado: ${adminUser.email}`);

    // 5. Criar plano premium para admin
    await client.query(`
      INSERT INTO user_plans (user_id, plan_type, questions_per_day, current_day_questions)
      VALUES ($1, 'premium', 999, 0)
    `, [adminUser.id]);
    console.log("✅ Plano premium criado para admin");

    // 6. Criar perguntas exemplo - VERSÃO CORRIGIDA
    console.log("❓ Criando perguntas exemplo...");
    
    const jsCategory = insertedCategories.find(c => c.slug === 'javascript');
    const reactCategory = insertedCategories.find(c => c.slug === 'react');
    const nodeCategory = insertedCategories.find(c => c.slug === 'nodejs');
    const iniciante = insertedDifficulties.find(d => d.name === 'Iniciante');
    const intermediario = insertedDifficulties.find(d => d.name === 'Intermediário');
    const avancado = insertedDifficulties.find(d => d.name === 'Avançado');

    const questions = [
      {
        title: "Declaração de Variáveis ES6+",
        question: "Qual é a forma correta de declarar uma variável em JavaScript ES6+?",
        explanation: "Em ES6+, 'let' e 'const' são as formas modernas de declarar variáveis, oferecendo escopo de bloco ao contrário de 'var'.",
        categoryId: jsCategory.id,
        difficultyId: iniciante.id,
        options: [
          { text: "var nome = 'João'", isCorrect: false, order: 1 },
          { text: "let nome = 'João'", isCorrect: true, order: 2 },
          { text: "variable nome = 'João'", isCorrect: false, order: 3 },
          { text: "declare nome = 'João'", isCorrect: false, order: 4 }
        ]
      },
      {
        title: "Hook de Estado no React",
        question: "Qual hook é usado para gerenciar estado em componentes funcionais do React?",
        explanation: "useState é o hook fundamental para gerenciar estado local em componentes funcionais React. Ele retorna um array com o valor atual e uma função para atualizá-lo.",
        categoryId: reactCategory.id,
        difficultyId: intermediario.id,
        options: [
          { text: "useEffect", isCorrect: false, order: 1 },
          { text: "useState", isCorrect: true, order: 2 },
          { text: "useContext", isCorrect: false, order: 3 },
          { text: "useReducer", isCorrect: false, order: 4 }
        ]
      },
      {
        title: "Typeof null em JavaScript",
        question: "O que acontece quando você chama console.log(typeof null)?",
        explanation: "typeof null retorna 'object' devido a um bug histórico do JavaScript que foi mantido por compatibilidade com código legado.",
        categoryId: jsCategory.id,
        difficultyId: intermediario.id,
        options: [
          { text: "'null'", isCorrect: false, order: 1 },
          { text: "'undefined'", isCorrect: false, order: 2 },
          { text: "'object'", isCorrect: true, order: 3 },
          { text: "Error", isCorrect: false, order: 4 }
        ]
      },
      {
        title: "Promises vs Callbacks",
        question: "Como você pode evitar o callback hell em JavaScript?",
        explanation: "Promises e async/await são as principais formas de evitar callback hell, tornando o código assíncrono mais legível e fácil de manter.",
        categoryId: jsCategory.id,
        difficultyId: intermediario.id,
        options: [
          { text: "Usando mais callbacks aninhados", isCorrect: false, order: 1 },
          { text: "Usando Promises ou async/await", isCorrect: true, order: 2 },
          { text: "Usando setTimeout", isCorrect: false, order: 3 },
          { text: "Não é possível evitar", isCorrect: false, order: 4 }
        ]
      },
      {
        title: "useEffect vs useLayoutEffect",
        question: "Qual é a principal diferença entre useEffect e useLayoutEffect no React?",
        explanation: "useLayoutEffect executa sincronamente após todas as mutações do DOM, antes da tela ser pintada, enquanto useEffect executa assincronamente após a renderização.",
        categoryId: reactCategory.id,
        difficultyId: avancado.id,
        options: [
          { text: "Não há diferença significativa", isCorrect: false, order: 1 },
          { text: "useLayoutEffect executa sincronamente", isCorrect: true, order: 2 },
          { text: "useEffect é sempre mais rápido", isCorrect: false, order: 3 },
          { text: "useLayoutEffect só funciona em classes", isCorrect: false, order: 4 }
        ]
      },
      {
        title: "Node.js Event Loop",
        question: "O que é o Event Loop no Node.js?",
        explanation: "O Event Loop é o mecanismo que permite ao Node.js realizar operações não-bloqueantes, mesmo sendo single-threaded, delegando operações para o sistema quando possível.",
        categoryId: nodeCategory.id,
        difficultyId: avancado.id,
        options: [
          { text: "Um loop infinito que trava a aplicação", isCorrect: false, order: 1 },
          { text: "Mecanismo de operações não-bloqueantes", isCorrect: true, order: 2 },
          { text: "Uma biblioteca externa do Node.js", isCorrect: false, order: 3 },
          { text: "Parte do V8 engine", isCorrect: false, order: 4 }
        ]
      }
    ];

    for (const questionData of questions) {
      try {
        // Inserir pergunta com TODAS as colunas obrigatórias
        const questionResult = await client.query(`
          INSERT INTO questions (title, question, explanation, category_id, difficulty_id, is_active)
          VALUES ($1, $2, $3, $4, $5, true)
          RETURNING id
        `, [
          questionData.title,
          questionData.question, 
          questionData.explanation, 
          questionData.categoryId, 
          questionData.difficultyId
        ]);
        
        const questionId = questionResult.rows[0].id;
        
        // Inserir opções
        for (const option of questionData.options) {
          await client.query(`
            INSERT INTO options (question_id, text, is_correct, "order")
            VALUES ($1, $2, $3, $4)
          `, [questionId, option.text, option.isCorrect, option.order]);
        }
        
        console.log(`✅ Pergunta criada: ${questionData.title}`);
        
      } catch (error) {
        console.error(`❌ Erro ao inserir pergunta "${questionData.title}":`, error.message);
      }
    }

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📋 Resumo:");
    console.log(`- ${insertedCategories.length} categorias de tecnologia`);
    console.log(`- ${insertedDifficulties.length} níveis de dificuldade`);
    console.log(`- 1 usuário administrador com plano premium`);
    console.log(`- ${questions.length} perguntas exemplo com opções`);
    console.log("\n🔐 Credenciais do Admin:");
    console.log("Email: admin@quizquest.com");
    console.log("Senha: password");
    console.log("\n🚀 Agora você pode testar o quiz!");

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar seed
seedDatabase()
  .then(() => {
    console.log("✅ Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });