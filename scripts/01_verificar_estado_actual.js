/**
 * Script para verificar el estado actual de la base de datos
 * Fase 1: Verificación y Backup
 */

const { Pool } = require('pg');

// Configuración de la conexión a Cloud SQL PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:CRTLPyme2025!@136.116.45.158:5432/crtlpyme",
});

async function verificarEstadoActual() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 FASE 1: VERIFICACIÓN DEL ESTADO ACTUAL\n');
    console.log('='.repeat(60));
    
    // 1. Verificar tenants
    console.log('\n📊 TENANTS EXISTENTES:');
    console.log('-'.repeat(60));
    const tenantsResult = await client.query(`
      SELECT id, name, slug, created_at
      FROM tenants
      ORDER BY created_at DESC
    `);
    
    console.log(`Total de tenants: ${tenantsResult.rows.length}\n`);
    tenantsResult.rows.forEach((tenant, idx) => {
      console.log(`${idx + 1}. ${tenant.name} (${tenant.slug})`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Creado: ${tenant.created_at}`);
      console.log('');
    });
    
    // 2. Verificar productos
    console.log('📦 PRODUCTOS EXISTENTES:');
    console.log('-'.repeat(60));
    const productsResult = await client.query(`
      SELECT COUNT(*) as total
      FROM products
    `);
    
    console.log(`Total de productos: ${productsResult.rows[0].total}\n`);
    
    // 3. Verificar estructura de la tabla products
    console.log('🗂️  ESTRUCTURA DE LA TABLA PRODUCTS:');
    console.log('-'.repeat(60));
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 4. Verificar si los productos tienen tenantId
    console.log('\n🔎 VERIFICACIÓN DE TENANT_ID EN PRODUCTOS:');
    console.log('-'.repeat(60));
    const tenantIdCheck = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(tenant_id) as con_tenant_id,
        COUNT(*) - COUNT(tenant_id) as sin_tenant_id
      FROM products
    `);
    
    const stats = tenantIdCheck.rows[0];
    console.log(`Total productos: ${stats.total}`);
    console.log(`Con tenant_id: ${stats.con_tenant_id}`);
    console.log(`Sin tenant_id: ${stats.sin_tenant_id}`);
    
    // 5. Muestra de productos
    console.log('\n📋 MUESTRA DE PRODUCTOS (primeros 10):');
    console.log('-'.repeat(60));
    const sampleProducts = await client.query(`
      SELECT id, name, sku, price, stock, category, tenant_id
      FROM products
      LIMIT 10
    `);
    
    sampleProducts.rows.forEach((prod, idx) => {
      console.log(`${idx + 1}. ${prod.name}`);
      console.log(`   SKU: ${prod.sku}`);
      console.log(`   Precio: $${prod.price}`);
      console.log(`   Stock: ${prod.stock}`);
      console.log(`   Categoría: ${prod.category || 'N/A'}`);
      console.log(`   Tenant ID: ${prod.tenant_id || 'NULL'}`);
      console.log('');
    });
    
    // 6. Verificar si existen las tablas master_products y tenant_inventory
    console.log('🔍 VERIFICACIÓN DE TABLAS EXISTENTES:');
    console.log('-'.repeat(60));
    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('master_products', 'tenant_inventory')
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    console.log(`Tabla master_products: ${existingTables.includes('master_products') ? '✅ Existe' : '❌ No existe'}`);
    console.log(`Tabla tenant_inventory: ${existingTables.includes('tenant_inventory') ? '✅ Existe' : '❌ No existe'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificación completada exitosamente');
    
    return {
      tenants: tenantsResult.rows,
      totalProducts: parseInt(productsResult.rows[0].total),
      productStructure: structureResult.rows,
      tenantIdStats: stats,
      sampleProducts: sampleProducts.rows,
      existingTables
    };
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarEstadoActual()
    .then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { verificarEstadoActual };
