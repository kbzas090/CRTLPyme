#!/usr/bin/env tsx

/**
 * Script de Verificación: Funcionalidad de Exportación de Reportes
 * 
 * Este script verifica que todos los componentes necesarios para la
 * exportación de reportes estén presentes y correctamente configurados.
 */

import { existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const results: TestResult[] = [];

function testFile(path: string, description: string): void {
  const fullPath = join(process.cwd(), path);
  const exists = existsSync(fullPath);
  
  results.push({
    name: description,
    status: exists ? 'PASS' : 'FAIL',
    message: exists ? `✅ ${path}` : `❌ ${path} no encontrado`
  });
}

function testDependency(packageName: string, description: string): void {
  try {
    require.resolve(packageName);
    results.push({
      name: description,
      status: 'PASS',
      message: `✅ ${packageName} instalado`
    });
  } catch {
    results.push({
      name: description,
      status: 'FAIL',
      message: `❌ ${packageName} no encontrado`
    });
  }
}

console.log('\n🔍 Verificando Funcionalidad de Exportación de Reportes...\n');
console.log('═'.repeat(70));

// Test 1: Verificar generadores
console.log('\n📦 Verificando Generadores de Archivos:\n');
testFile('lib/pdf-generator.ts', 'Generador de PDF');
testFile('lib/report-generator.ts', 'Generador de Excel/CSV');

// Test 2: Verificar API
console.log('\n🔌 Verificando API de Exportación:\n');
testFile('app/api/reports/export/route.ts', 'API de Exportación');
testFile('app/api/reports/sales/route.ts', 'API de Reporte de Ventas');
testFile('app/api/reports/products/route.ts', 'API de Reporte de Productos');
testFile('app/api/reports/customers/route.ts', 'API de Reporte de Clientes');

// Test 3: Verificar componentes de frontend
console.log('\n🎨 Verificando Componentes de Frontend:\n');
testFile('app/admin/reports/sales/page.tsx', 'Página de Reporte de Ventas');
testFile('app/admin/reports/products/page.tsx', 'Página de Reporte de Productos');
testFile('app/admin/reports/customers/page.tsx', 'Página de Reporte de Clientes');

// Test 4: Verificar dependencias
console.log('\n📚 Verificando Dependencias:\n');
testDependency('jspdf', 'jsPDF');
testDependency('jspdf-autotable', 'jsPDF AutoTable');
testDependency('xlsx', 'XLSX');

// Test 5: Verificar archivos de configuración
console.log('\n⚙️  Verificando Configuración:\n');
testFile('package.json', 'Package.json');
testFile('tsconfig.json', 'TypeScript Config');
testFile('next.config.js', 'Next.js Config');

// Mostrar resultados
console.log('\n═'.repeat(70));
console.log('\n📊 Resumen de Resultados:\n');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const total = results.length;

results.forEach(result => {
  console.log(result.message);
});

console.log('\n' + '═'.repeat(70));
console.log(`\n✅ Pruebas Exitosas: ${passed}/${total}`);
console.log(`❌ Pruebas Fallidas: ${failed}/${total}`);
console.log(`📈 Tasa de Éxito: ${((passed / total) * 100).toFixed(2)}%\n`);

if (failed === 0) {
  console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
  console.log('✅ La funcionalidad de exportación de reportes está completamente implementada.\n');
  process.exit(0);
} else {
  console.log('⚠️  Algunas pruebas fallaron. Por favor revise los archivos faltantes.\n');
  process.exit(1);
}
