/**
 * Script para verificar si las tablas master_products y tenant_inventory ya existen
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bxfetsflhxhigacuqtfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZmV0c2ZsaHhoaWdhY3VxdGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg5ODcsImV4cCI6MjA3NTA5NDk4N30.naviCeiUfRlViW0E-bq9Bn4iOWmeSI0Zh2R9HrpgVx0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verificarTablasExistentes() {
  try {
    console.log('🔍 VERIFICACIÓN DE TABLAS EN LA BASE DE DATOS\n');
    console.log('='.repeat(60));
    
    // Intentar acceder a master_products
    console.log('1. Verificando master_products...');
    const { data: masterProducts, error: mpError } = await supabase
      .from('master_products')
      .select('id')
      .limit(1);
    
    if (mpError) {
      if (mpError.message.includes('does not exist') || mpError.code === '42P01') {
        console.log('   ❌ Tabla master_products NO EXISTE');
      } else {
        console.log(`   ⚠️  Error al acceder: ${mpError.message}`);
      }
    } else {
      console.log('   ✅ Tabla master_products EXISTE');
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from('master_products')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`   📊 Registros: ${count || 0}`);
      }
    }
    
    // Intentar acceder a tenant_inventory
    console.log('\n2. Verificando tenant_inventory...');
    const { data: tenantInventory, error: tiError } = await supabase
      .from('tenant_inventory')
      .select('id')
      .limit(1);
    
    if (tiError) {
      if (tiError.message.includes('does not exist') || tiError.code === '42P01') {
        console.log('   ❌ Tabla tenant_inventory NO EXISTE');
      } else {
        console.log(`   ⚠️  Error al acceder: ${tiError.message}`);
      }
    } else {
      console.log('   ✅ Tabla tenant_inventory EXISTE');
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from('tenant_inventory')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`   📊 Registros: ${count || 0}`);
      }
    }
    
    // Verificar tabla products (actual)
    console.log('\n3. Verificando products (tabla actual)...');
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (pError) {
      console.log(`   ❌ Error: ${pError.message}`);
    } else {
      console.log('   ✅ Tabla products EXISTE');
      
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`   📊 Registros: ${count || 0}`);
      }
    }
    
    // Verificar products_legacy
    console.log('\n4. Verificando products_legacy...');
    const { data: productsLegacy, error: plError } = await supabase
      .from('products_legacy')
      .select('id')
      .limit(1);
    
    if (plError) {
      if (plError.message.includes('does not exist') || plError.code === '42P01') {
        console.log('   ❌ Tabla products_legacy NO EXISTE');
      } else {
        console.log(`   ⚠️  Error al acceder: ${plError.message}`);
      }
    } else {
      console.log('   ✅ Tabla products_legacy EXISTE');
      
      const { count, error: countError } = await supabase
        .from('products_legacy')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`   📊 Registros: ${count || 0}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  }
}

if (require.main === module) {
  verificarTablasExistentes()
    .then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { verificarTablasExistentes };
