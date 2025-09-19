// Script de desenvolvimento compatível com Windows
process.env.NODE_ENV = 'development';

// Importa e executa o servidor
import('../server/index.ts').catch(console.error);