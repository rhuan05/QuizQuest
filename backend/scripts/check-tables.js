const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
  try {
    console.log("🔍 Verificando tabelas no banco...");
    
    // Listar todas as tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log("📋 Tabelas encontradas:");
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Verificar se as tabelas principais existem
    const requiredTables = [
      'users', 
      'categories', 
      'difficulties', 
      'questions', 
      'options', 
      'user_plans', 
      'daily_question_usage'
    ];
    
    const existingTables = tables.map(t => t.table_name);
    
    console.log("\n✅ Status das tabelas necessárias:");
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`${exists ? '✅' : '❌'} ${table}`);
    });
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log("\n❌ Tabelas ausentes:", missingTables);
      console.log("👉 Você precisa executar: npx drizzle-kit push");
    } else {
      console.log("\n🎉 Todas as tabelas necessárias existem!");
      
      // Verificar se há dados
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
      const questionCount = await sql`SELECT COUNT(*) as count FROM questions`;
      
      console.log("\n📊 Contagem de dados:");
      console.log(`- Usuários: ${userCount[0].count}`);
      console.log(`- Categorias: ${categoryCount[0].count}`);
      console.log(`- Perguntas: ${questionCount[0].count}`);
      
      if (userCount[0].count === '0' || categoryCount[0].count === '0' || questionCount[0].count === '0') {
        console.log("\n💡 Banco vazio! Execute: node scripts/seed-simple.js");
      }
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar tabelas:", error);
    
    if (error.message.includes('does not exist')) {
      console.log("\n💡 Parece que as tabelas não existem. Execute:");
      console.log("1. npx drizzle-kit push");
      console.log("2. node scripts/seed-simple.js");
    }
  }
}

checkTables();
