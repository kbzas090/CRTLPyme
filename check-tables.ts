import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    console.log('\n=== DATABASE TABLES ===');
    result.forEach((row: any) => {
      console.log(`- ${row.tablename}`);
    });
    console.log(`\nTotal tables: ${result.length}\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
