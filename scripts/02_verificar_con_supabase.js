/**
 * Script para verificar el estado actual usando Supabase Client
 * Fase 1: Verificación y Backup
 */

const { createClient } = require('@supabase/supabase-js');

// Credenciales de Supabase proporcionadas
const SUPABASE_URL = 'https://bxfetsflhxhigacuqtfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZmV0c2ZsaHhoaWdhY3VxdGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg5ODcsImV4cCI6MjA3NTA5NDk4N30.naviCeiUfRlViW0E-bq9Bn4iOWmeSI0Zh2R9HrpgVx0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verificarEstadoActual() {
  try {
    console.log('🔍 FASE 1: VERIFICACIÓN DEL ESTADO ACTUAL\n');
    console.log('='.repeat(60));
    console.log(`Conectando a: ${SUPABASE_URL}\n`);
    
    // 1. Verificar tenants
    console.log('📊 TENANTS EXISTENTES:');
    console.log('-'.repeat(60));
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (tenantsError) {
      console.error('❌ Error al obtener tenants:', tenantsError);
      
      // Si hay error de permisos, intentar con RPC o verificar permisos
      if (tenantsError.message.includes('permission')) {
        console.log('\n⚠️  ADVERTENCIA: La clave proporcionada (anon) no tiene permisos para acceder a la tabla tenants.');
        console.log('Se necesita una clave service_role para operaciones de migración.\n');
      }
      
      return { error: tenantsError };
    }
    
    console.log(`Total de tenants: ${tenants.length}\n`);
    tenants.forEach((tenant, idx) => {
      console.log(`${idx + 1}. ${tenant.name} (${tenant.slug || 'N/A'})`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Creado: ${tenant.createdAt || tenant.created_at || 'N/A'}`);
      console.log('');
    });
    
    // 2. Verificar productos
    console.log('📦 PRODUCTOS EXISTENTES:');
    console.log('-'.repeat(60));
    const { data: products, error: productsError, count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: false });
    
    if (productsError) {
      console.error('❌ Error al obtener productos:', productsError);
      return { error: productsError };
    }
    
    console.log(`Total de productos: ${products.length}\n`);
    
    // 3. Verificar si los productos tienen tenantId
    console.log('🔎 VERIFICACIÓN DE TENANT_ID EN PRODUCTOS:');
    console.log('-'.repeat(60));
    const conTenantId = products.filter(p => p.tenantId !== null && p.tenantId !== undefined).length;
    const sinTenantId = products.filter(p => p.tenantId === null || p.tenantId === undefined).length;
    
    console.log(`Total productos: ${products.length}`);
    console.log(`Con tenant_id: ${conTenantId}`);
    console.log(`Sin tenant_id: ${sinTenantId}`);
    
    // 4. Muestra de productos
    console.log('\n📋 MUESTRA DE PRODUCTOS (primeros 10):');
    console.log('-'.repeat(60));
    const sampleProducts = products.slice(0, 10);
    
    sampleProducts.forEach((prod, idx) => {
      console.log(`${idx + 1}. ${prod.name}`);
      console.log(`   SKU: ${prod.sku}`);
      console.log(`   Precio: $${prod.salePrice || prod.price || 'N/A'}`);
      console.log(`   Costo: $${prod.costPrice || 'N/A'}`);
      console.log(`   Stock: ${prod.stock}`);
      console.log(`   Categoría: ${prod.category || 'N/A'}`);
      console.log(`   Tenant ID: ${prod.tenantId || 'NULL'}`);
      console.log('');
    });
    
    // 5. Verificar categorías únicas
    console.log('🏷️  CATEGORÍAS DE PRODUCTOS:');
    console.log('-'.repeat(60));
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    console.log(`Total de categorías: ${categories.length}`);
    categories.forEach(cat => console.log(`  - ${cat}`));
    
    // 6. Verificar estructura de campos
    console.log('\n🗂️  CAMPOS DISPONIBLES EN PRODUCTS:');
    console.log('-'.repeat(60));
    if (products.length > 0) {
      const fields = Object.keys(products[0]);
      fields.forEach(field => {
        console.log(`  - ${field}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificación completada exitosamente');
    
    return {
      tenants,
      products,
      totalProducts: products.length,
      conTenantId,
      sinTenantId,
      categories,
      sampleProducts
    };
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarEstadoActual()
    .then((result) => {
      if (result.error) {
        console.log('\n⚠️  Verificación completada con errores de permisos');
        process.exit(1);
      }
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { verificarEstadoActual };
