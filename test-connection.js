const { Client } = require('pg');

async function testConnection() {
  // Test with different SSL modes
  const connectionStrings = [
    "postgresql://postgres:%7B%60hk1%5B%5B5B5y.Jx406_lyF@136.116.45.158:5432/crtlpyme?sslmode=require",
    "postgresql://postgres:%7B%60hk1%5B%5B5B5y.Jx406_lyF@136.116.45.158:5432/crtlpyme?sslmode=prefer",
    "postgresql://postgres:%7B%60hk1%5B%5B5B5y.Jx406_lyF@136.116.45.158:5432/crtlpyme?sslmode=disable"
  ];

  for (const connStr of connectionStrings) {
    console.log(`\nTesting: ${connStr.replace(/%7B%60hk1%5B%5B5B5y.Jx406_lyF/, '****')}`);
    const client = new Client({ connectionString: connStr });
    try {
      await client.connect();
      console.log('✅ Connection successful!');
      const result = await client.query('SELECT version()');
      console.log('Database version:', result.rows[0].version);
      await client.end();
      break;
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      try { await client.end(); } catch {}
    }
  }
}

testConnection();
