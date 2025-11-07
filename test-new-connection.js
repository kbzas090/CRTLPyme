const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '136.116.45.158',
    port: 5432,
    user: 'postgres',
    password: 'CRTLPyme2025!',
    database: 'crtlpyme',
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Check if database has tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\n📊 Tables in database:', tables.rows.length);
    console.log(tables.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ CONNECTION FAILED:', error.message);
    try { await client.end(); } catch {}
    return false;
  }
}

testConnection();
