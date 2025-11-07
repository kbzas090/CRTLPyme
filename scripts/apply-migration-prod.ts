import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  const DATABASE_URL = process.env.DATABASE_URL || 
    'postgresql://postgres:CRTLPyme2025!@136.116.45.158:5432/crtlpyme';

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Supabase requiere SSL
    }
  });

  try {
    console.log('📡 Conectando a la base de datos...');
    const client = await pool.connect();
    console.log('✅ Conexión establecida\n');

    // Verificar si las tablas ya existen
    console.log('🔍 Verificando estado actual de la base de datos...');
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('master_products', 'tenant_inventory', 'products_legacy', 'products');
    `);
    
    const existingTables = checkTables.rows.map(r => r.table_name);
    console.log('Tablas existentes:', existingTables);

    if (existingTables.includes('master_products')) {
      console.log('\n⚠️  Las tablas master_products y tenant_inventory ya existen.');
      console.log('La migración podría ya haber sido aplicada.\n');
      
      // Verificar cuántos productos maestros hay
      const countResult = await client.query('SELECT COUNT(*) FROM master_products');
      console.log(`📊 Productos maestros en base de datos: ${countResult.rows[0].count}\n`);
      
      const continueAnyway = process.argv.includes('--force');
      if (!continueAnyway) {
        console.log('❌ Abortando. Usa --force para ejecutar de todos modos.');
        client.release();
        await pool.end();
        process.exit(0);
      }
    }

    // Leer el archivo de migración
    const migrationPath = path.join(
      __dirname, 
      '../prisma/migrations/20251025141836_add_master_products_and_tenant_inventory/migration.sql'
    );
    
    console.log('📄 Leyendo archivo de migración...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('✅ Archivo de migración cargado\n');

    // Ejecutar la migración
    console.log('🚀 Ejecutando migración...');
    console.log('⏳ Esto puede tomar varios segundos...\n');
    
    await client.query('BEGIN');
    try {
      await client.query(migrationSQL);
      await client.query('COMMIT');
      console.log('✅ Migración ejecutada exitosamente!\n');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    // Verificar resultados
    console.log('🔍 Verificando resultados...\n');
    
    const masterProductsCount = await client.query('SELECT COUNT(*) FROM master_products');
    console.log(`✅ Productos maestros creados: ${masterProductsCount.rows[0].count}`);
    
    const tenantInventoryCount = await client.query('SELECT COUNT(*) FROM tenant_inventory');
    console.log(`✅ Registros de inventario creados: ${tenantInventoryCount.rows[0].count}`);
    
    const productsLegacyCount = await client.query('SELECT COUNT(*) FROM products_legacy');
    console.log(`📦 Productos legacy conservados: ${productsLegacyCount.rows[0].count}\n`);

    client.release();
    console.log('✨ Proceso completado exitosamente!');

  } catch (error: any) {
    console.error('❌ Error al ejecutar la migración:');
    console.error(error.message);
    
    if (error.code) {
      console.error(`Código de error: ${error.code}`);
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
