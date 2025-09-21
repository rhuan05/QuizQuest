const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function inspectQuestions() {
  const client = await pool.connect();
  
  try {
    console.log("🔍 Inspecionando tabela 'questions'...\n");
    
    // Ver estrutura da tabela
    const schema = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log("📋 Colunas da tabela 'questions':");
    schema.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(pode ser NULL)' : '(obrigatória)';
      console.log(`- ${col.column_name}: ${col.data_type} ${nullable}`);
    });

    // Ver constraints (chaves estrangeiras, etc)
    const constraints = await client.query(`
      SELECT 
        constraint_name,
        constraint_type,
        column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'questions' AND tc.table_schema = 'public'
    `);
    
    console.log("\n🔒 Constraints da tabela 'questions':");
    constraints.rows.forEach(constraint => {
      console.log(`- ${constraint.constraint_name}: ${constraint.constraint_type} (${constraint.column_name})`);
    });

    // Tentar um INSERT mínimo para ver quais colunas são obrigatórias
    console.log("\n🧪 Testando INSERT mínimo...");
    
    // Pegar IDs de categoria e dificuldade existentes
    const categoryResult = await client.query('SELECT id FROM categories LIMIT 1');
    const difficultyResult = await client.query('SELECT id FROM difficulties LIMIT 1');
    
    if (categoryResult.rows.length > 0 && difficultyResult.rows.length > 0) {
      const categoryId = categoryResult.rows[0].id;
      const difficultyId = difficultyResult.rows[0].id;
      
      // Tentar diferentes combinações
      const attempts = [
        { name: 'apenas IDs', query: 'INSERT INTO questions (category_id, difficulty_id) VALUES ($1, $2) RETURNING id', params: [categoryId, difficultyId] },
        { name: 'com is_active', query: 'INSERT INTO questions (category_id, difficulty_id, is_active) VALUES ($1, $2, true) RETURNING id', params: [categoryId, difficultyId] },
        { name: 'com title', query: 'INSERT INTO questions (category_id, difficulty_id, title) VALUES ($1, $2, $3) RETURNING id', params: [categoryId, difficultyId, 'Teste'] },
        { name: 'com question', query: 'INSERT INTO questions (category_id, difficulty_id, question) VALUES ($1, $2, $3) RETURNING id', params: [categoryId, difficultyId, 'Teste'] },
        { name: 'com text', query: 'INSERT INTO questions (category_id, difficulty_id, text) VALUES ($1, $2, $3) RETURNING id', params: [categoryId, difficultyId, 'Teste'] }
      ];
      
      for (const attempt of attempts) {
        try {
          const result = await client.query(attempt.query, attempt.params);
          console.log(`✅ ${attempt.name}: FUNCIONOU! ID = ${result.rows[0].id}`);
          
          // Limpar o teste
          await client.query('DELETE FROM questions WHERE id = $1', [result.rows[0].id]);
          break;
        } catch (error) {
          console.log(`❌ ${attempt.name}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectQuestions();