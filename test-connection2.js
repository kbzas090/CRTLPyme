const { Client } = require('pg');

async function testConnection() {
  console.log('\nTesting with SSL but without certificate verification...');
  const client = new Client({
    connectionString: "postgresql://postgres:%7B%60hk1%5B%5B5B5y.Jx406_lyF@136.116.45.158:5432/crtlpyme",
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log('✅ Connection successful!');
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    // Test a simple query
    const countResult = await client.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log(`Number of tables: ${countResult.rows[0].count}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    try { await client.end(); } catch {}
    return false;
  }
}

testConnection();
