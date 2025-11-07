/**
 * Script para crear las tablas master_products y tenant_inventory usando SQL
 * Fase 2: Migración de Base de Datos
 */

const { Pool } = require('pg');

// Usar la conexión pooler
const pool = new Pool({
  connectionString: "postgresql://postgres:CRTLPyme2025!@136.116.45.158:5432/crtlpyme",
  ssl: false // pgbouncer no usa SSL
});

async function crearTablas() {
  const client = await pool.connect();
  
  try {
    console.log('🏗️  FASE 2: CREACIÓN DE TABLAS NUEVAS\n');
    console.log('='.repeat(60));
    
    // 1. Crear tabla master_products
    console.log('1. Creando tabla master_products...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS master_products (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        brand TEXT,
        "suggestedPrice" DECIMAL(10,2) NOT NULL,
        unit TEXT DEFAULT 'unidad',
        "imageUrl" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('   ✅ Tabla master_products creada');
    
    // Crear índices para master_products
    console.log('   📑 Creando índices para master_products...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_master_products_category ON master_products(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_master_products_barcode ON master_products(barcode);`);
    console.log('   ✅ Índices creados');
    
    // 2. Crear tabla tenant_inventory
    console.log('\n2. Creando tabla tenant_inventory...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenant_inventory (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "tenantId" TEXT NOT NULL,
        "masterProductId" TEXT NOT NULL,
        "customSku" TEXT,
        "costPrice" DECIMAL(10,2) NOT NULL,
        "salePrice" DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        "minStock" INT DEFAULT 5,
        location TEXT,
        "customNotes" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_tenant_inventory_tenant FOREIGN KEY ("tenantId") 
          REFERENCES tenants(id) ON DELETE CASCADE,
        CONSTRAINT fk_tenant_inventory_master_product FOREIGN KEY ("masterProductId") 
          REFERENCES master_products(id),
        CONSTRAINT unique_tenant_product UNIQUE ("tenantId", "masterProductId")
      );
    `);
    console.log('   ✅ Tabla tenant_inventory creada');
    
    // Crear índices para tenant_inventory
    console.log('   📑 Creando índices para tenant_inventory...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tenant_inventory_tenant ON tenant_inventory("tenantId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tenant_inventory_tenant_sku ON tenant_inventory("tenantId", "customSku");`);
    console.log('   ✅ Índices creados');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Tablas creadas exitosamente');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('   ℹ️  Las tablas ya existen');
    } else {
      console.error('❌ Error al crear tablas:', error);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  crearTablas()
    .then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { crearTablas };
