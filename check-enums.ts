import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnums() {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT t.typname as enum_name, 
             array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    
    console.log('\n=== DATABASE ENUMS ===\n');
    result.forEach((row: any) => {
      console.log(`${row.enum_name}:`);
      console.log(`  ${row.enum_values.join(', ')}\n`);
    });
    console.log(`Total enums: ${result.length}\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnums();
