const { execSync } = require('child_process');

console.log('=== Iniciando configuración de base de datos ===');

try {
  console.log('1. Ejecutando prisma db push...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    env: process.env 
  });
  
  console.log('\n2. Ejecutando seed...');
  execSync('npm run seed', { 
    stdio: 'inherit',
    env: process.env 
  });
  
  console.log('\n✅ Base de datos configurada exitosamente');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
