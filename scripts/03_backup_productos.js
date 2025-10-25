/**
 * Script para hacer backup completo de productos existentes
 * Fase 1: Verificación y Backup (CRÍTICO)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciales de Supabase proporcionadas
const SUPABASE_URL = 'https://bxfetsflhxhigacuqtfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZmV0c2ZsaHhoaWdhY3VxdGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg5ODcsImV4cCI6MjA3NTA5NDk4N30.naviCeiUfRlViW0E-bq9Bn4iOWmeSI0Zh2R9HrpgVx0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function hacerBackup() {
  try {
    console.log('💾 FASE 1: BACKUP DE PRODUCTOS EXISTENTES\n');
    console.log('='.repeat(60));
    
    // 1. Obtener todos los productos
    console.log('📥 Obteniendo todos los productos...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: true });
    
    if (error) {
      console.error('❌ Error al obtener productos:', error);
      throw error;
    }
    
    console.log(`✅ ${products.length} productos obtenidos\n`);
    
    // 2. Obtener todos los tenants
    console.log('📥 Obteniendo todos los tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      console.error('⚠️  Error al obtener tenants:', tenantsError);
      // Continuamos sin los tenants si hay error
    }
    
    console.log(`✅ ${tenants ? tenants.length : 0} tenants obtenidos\n`);
    
    // 3. Crear objeto de backup
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      totalProducts: products.length,
      totalTenants: tenants ? tenants.length : 0,
      tenants: tenants || [],
      products: products,
      statistics: {
        productsByCategory: {},
        productsByTenant: {},
        productsWithTenantId: products.filter(p => p.tenantId !== null && p.tenantId !== undefined).length,
        productsWithoutTenantId: products.filter(p => p.tenantId === null || p.tenantId === undefined).length
      }
    };
    
    // Calcular estadísticas por categoría
    products.forEach(product => {
      const category = product.category || 'sin_categoria';
      backup.statistics.productsByCategory[category] = (backup.statistics.productsByCategory[category] || 0) + 1;
      
      const tenantId = product.tenantId || 'sin_tenant';
      backup.statistics.productsByTenant[tenantId] = (backup.statistics.productsByTenant[tenantId] || 0) + 1;
    });
    
    // 4. Guardar backup en archivo JSON
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup_products_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);
    
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
    
    console.log('📊 ESTADÍSTICAS DEL BACKUP:');
    console.log('-'.repeat(60));
    console.log(`Total de productos: ${backup.totalProducts}`);
    console.log(`Total de tenants: ${backup.totalTenants}`);
    console.log(`Productos con tenant_id: ${backup.statistics.productsWithTenantId}`);
    console.log(`Productos sin tenant_id: ${backup.statistics.productsWithoutTenantId}`);
    console.log('\nProductos por categoría:');
    Object.entries(backup.statistics.productsByCategory).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });
    console.log('\nProductos por tenant:');
    Object.entries(backup.statistics.productsByTenant).forEach(([tenant, count]) => {
      console.log(`  - ${tenant}: ${count}`);
    });
    
    console.log('\n💾 ARCHIVO DE BACKUP CREADO:');
    console.log('-'.repeat(60));
    console.log(`Ubicación: ${backupPath}`);
    console.log(`Tamaño: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
    
    // 5. Crear también un backup simplificado para referencia rápida
    const simpleBackupPath = path.join(backupDir, 'backup_products_LATEST.json');
    fs.writeFileSync(simpleBackupPath, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`Backup LATEST: ${simpleBackupPath}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Backup completado exitosamente');
    
    return {
      backupPath,
      simpleBackupPath,
      backup
    };
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  hacerBackup()
    .then(() => {
      console.log('\n✅ Script de backup completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { hacerBackup };
