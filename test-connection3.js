const { Client } = require('pg');

async function testConnection() {
  // Try different password variations
  const passwords = [
    '{`hk1[[5B5y.Jx406_lyF',  // As documented
    '{\'hk1[[5B5y.Jx406_lyF', // With escaped backtick
    '{`hk1[5B5y.Jx406_lyF',   // With single bracket
  ];

  for (const password of passwords) {
    console.log(`\nTrying password: ${password.substring(0, 5)}...`);
    const client = new Client({
      host: '136.116.45.158',
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'crtlpyme',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    try {
      await client.connect();
      console.log('✅ CONNECTION SUCCESSFUL!');
      console.log(`✅ CORRECT PASSWORD: ${password}`);
      const result = await client.query('SELECT version()');
      console.log('Database version:', result.rows[0].version);
      await client.end();
      return password;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      try { await client.end(); } catch {}
    }
  }
  return null;
}

testConnection();
