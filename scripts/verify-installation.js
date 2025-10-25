/**
 * Script de Verificación del Módulo Admin SaaS
 * 
 * Este script verifica que:
 * - La base de datos esté accesible
 * - Los tenants estén creados
 * - Los usuarios estén configurados
 * - Los productos estén en su lugar
 * - El aislamiento de datos funcione correctamente
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${message}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

async function verifyDatabase() {
  section('1. VERIFICACIÓN DE BASE DE DATOS');
  
  try {
    await prisma.$connect();
    success('Conexión a la base de datos exitosa');
    return true;
  } catch (err) {
    error('No se pudo conectar a la base de datos');
    error(`Error: ${err.message}`);
    warning('Verifica la variable DATABASE_URL en el archivo .env');
    return false;
  }
}

async function verifyTenants() {
  section('2. VERIFICACIÓN DE TENANTS');
  
  try {
    const tenants = await prisma.tenant.findMany();
    
    if (tenants.length === 0) {
      error('No hay tenants en la base de datos');
      warning('Ejecuta: npm run seed:multitenancy');
      return false;
    }
    
    success(`Se encontraron ${tenants.length} tenants`);
    
    // Verificar los 4 tenants esperados
    const expectedTenants = [
      { rut: '76.543.210-1', name: 'Minimarket Los Andes' },
      { rut: '77.654.321-2', name: 'Ferretería El Tornillo' },
      { rut: '78.765.432-3', name: 'Librería Papelito' },
      { rut: '79.876.543-4', name: 'Almacén Don José' },
    ];
    
    let allFound = true;
    for (const expected of expectedTenants) {
      const found = tenants.find(t => t.rut === expected.rut);
      if (found) {
        success(`  - ${expected.name} (${expected.rut})`);
      } else {
        error(`  - ${expected.name} NO ENCONTRADO`);
        allFound = false;
      }
    }
    
    return allFound;
  } catch (err) {
    error(`Error al verificar tenants: ${err.message}`);
    return false;
  }
}

async function verifyUsers() {
  section('3. VERIFICACIÓN DE USUARIOS');
  
  try {
    const users = await prisma.user.findMany({
      include: {
        tenant: {
          select: {
            businessName: true,
          },
        },
      },
    });
    
    if (users.length === 0) {
      error('No hay usuarios en la base de datos');
      warning('Ejecuta: npm run seed:multitenancy');
      return false;
    }
    
    success(`Se encontraron ${users.length} usuarios`);
    
    // Verificar admin SaaS
    const adminSaas = users.find(u => u.role === 'PROVEEDOR');
    if (adminSaas) {
      success(`  Administrador SaaS: ${adminSaas.email}`);
    } else {
      error('  No se encontró el Administrador SaaS');
      return false;
    }
    
    // Contar por rol
    const roleCount = {};
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    
    info('  Distribución por rol:');
    Object.entries(roleCount).forEach(([role, count]) => {
      log(`    - ${role}: ${count}`, 'gray');
    });
    
    return true;
  } catch (err) {
    error(`Error al verificar usuarios: ${err.message}`);
    return false;
  }
}

async function verifyProducts() {
  section('4. VERIFICACIÓN DE PRODUCTOS');
  
  try {
    const products = await prisma.product.findMany({
      include: {
        tenant: {
          select: {
            businessName: true,
          },
        },
      },
    });
    
    if (products.length === 0) {
      error('No hay productos en la base de datos');
      warning('Ejecuta: npm run seed:multitenancy');
      return false;
    }
    
    success(`Se encontraron ${products.length} productos`);
    
    // Agrupar por tenant
    const productsByTenant = {};
    products.forEach(p => {
      const tenantName = p.tenant.businessName;
      if (!productsByTenant[tenantName]) {
        productsByTenant[tenantName] = [];
      }
      productsByTenant[tenantName].push(p);
    });
    
    info('  Productos por tenant:');
    Object.entries(productsByTenant).forEach(([tenant, prods]) => {
      log(`    - ${tenant}: ${prods.length} productos`, 'gray');
    });
    
    return true;
  } catch (err) {
    error(`Error al verificar productos: ${err.message}`);
    return false;
  }
}

async function verifyDataIsolation() {
  section('5. VERIFICACIÓN DE AISLAMIENTO DE DATOS');
  
  try {
    // Obtener dos tenants diferentes
    const tenants = await prisma.tenant.findMany({
      take: 2,
    });
    
    if (tenants.length < 2) {
      warning('No hay suficientes tenants para verificar aislamiento');
      return true;
    }
    
    const [tenant1, tenant2] = tenants;
    
    // Verificar que cada tenant solo vea sus productos
    const products1 = await prisma.product.findMany({
      where: { tenantId: tenant1.id },
    });
    
    const products2 = await prisma.product.findMany({
      where: { tenantId: tenant2.id },
    });
    
    success(`${tenant1.businessName} tiene ${products1.length} productos`);
    success(`${tenant2.businessName} tiene ${products2.length} productos`);
    
    // Verificar que no haya productos compartidos
    const sharedProducts = products1.filter(p1 => 
      products2.some(p2 => p2.id === p1.id)
    );
    
    if (sharedProducts.length > 0) {
      error('¡ALERTA! Hay productos compartidos entre tenants');
      return false;
    }
    
    success('Aislamiento de datos verificado correctamente');
    return true;
  } catch (err) {
    error(`Error al verificar aislamiento: ${err.message}`);
    return false;
  }
}

async function verifyAPIStructure() {
  section('6. VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'app/api/admin-saas/tenants/route.ts',
    'app/api/admin-saas/tenants/[id]/route.ts',
    'app/api/admin-saas/tenants/[id]/users/route.ts',
    'app/api/admin-saas/tenants/[id]/products/route.ts',
    'app/api/admin-saas/stats/route.ts',
    'app/admin-saas/layout.tsx',
    'app/admin-saas/page.tsx',
    'app/admin-saas/tenants/page.tsx',
    'app/admin-saas/tenants/[id]/page.tsx',
    'app/admin-saas/stats/page.tsx',
    'lib/admin-auth.ts',
    'prisma/seed-multitenancy.ts',
  ];
  
  let allFound = true;
  
  for (const file of requiredFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      success(`  ✓ ${file}`);
    } else {
      error(`  ✗ ${file} NO ENCONTRADO`);
      allFound = false;
    }
  }
  
  return allFound;
}

async function displayCredentials() {
  section('7. CREDENCIALES DE ACCESO');
  
  try {
    const adminSaas = await prisma.user.findFirst({
      where: { role: 'PROVEEDOR' },
    });
    
    if (adminSaas) {
      info('  Administrador SaaS:');
      log(`    Email:    ${adminSaas.email}`, 'cyan');
      log(`    Password: Admin2025!`, 'cyan');
      log(`    URL:      http://localhost:3000/admin-saas`, 'cyan');
    }
    
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' },
          take: 1,
        },
      },
    });
    
    log('\n  Tenants:', 'yellow');
    tenants.forEach((tenant, index) => {
      if (tenant.users.length > 0) {
        log(`\n  ${index + 1}. ${tenant.businessName}`, 'yellow');
        log(`     Admin: ${tenant.users[0].email} / Admin123!`, 'gray');
      }
    });
    
  } catch (err) {
    error(`Error al mostrar credenciales: ${err.message}`);
  }
}

async function displaySummary(results) {
  section('RESUMEN DE VERIFICACIÓN');
  
  const total = results.length;
  const passed = results.filter(r => r).length;
  const failed = total - passed;
  
  log('\n  Resultados:', 'blue');
  log(`    Total de pruebas:  ${total}`, 'gray');
  log(`    Exitosas:          ${passed}`, 'green');
  log(`    Fallidas:          ${failed}`, failed > 0 ? 'red' : 'gray');
  
  if (failed === 0) {
    log('\n  🎉 ¡TODAS LAS VERIFICACIONES PASARON!', 'green');
    log('  El módulo Admin SaaS está correctamente instalado.', 'green');
    log('\n  Siguiente paso:', 'cyan');
    log('    1. Ejecutar: npm run dev', 'cyan');
    log('    2. Visitar: http://localhost:3000/auth/login', 'cyan');
    log('    3. Login con: admin_saas@crtlpyme.cl / Admin2025!', 'cyan');
  } else {
    log('\n  ⚠️  ALGUNAS VERIFICACIONES FALLARON', 'yellow');
    log('  Revisa los errores anteriores y ejecuta:', 'yellow');
    log('    npm run seed:multitenancy', 'yellow');
  }
  
  log('\n');
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║    VERIFICACIÓN DEL MÓDULO ADMINISTRADOR SaaS         ║', 'blue');
  log('║              CRTLPyme - Multi-Tenant                  ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  const results = [];
  
  try {
    results.push(await verifyDatabase());
    
    if (results[0]) { // Solo continuar si la DB está conectada
      results.push(await verifyTenants());
      results.push(await verifyUsers());
      results.push(await verifyProducts());
      results.push(await verifyDataIsolation());
      results.push(await verifyAPIStructure());
      
      await displayCredentials();
      await displaySummary(results);
    }
  } catch (err) {
    error(`\nError inesperado: ${err.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
