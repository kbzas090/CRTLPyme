const { Client } = require('pg');

// URL original del usuario
const client = new Client({
  connectionString: "postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres"
});

async function test() {
  try {
    console.log("Intentando conectar a Supabase con la URL original del usuario...");
    await client.connect();
    console.log("✅ CONEXIÓN EXITOSA!\n");
    
    // Listar tablas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`Total de tablas: ${result.rows.length}\n`);
    console.log("Tablas encontradas:");
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    await client.end();
  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
}

test();
