const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('🔍 Probando conexión a Cloud SQL...\n');
    
    // Test básico de conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos\n');
    
    // Verificar tenant
    const tenants = await prisma.tenant.findMany();
    console.log(`📊 Tenants encontrados: ${tenants.length}`);
    if (tenants.length > 0) {
      console.log(`   - Tenant principal: ${tenants[0].businessName} (ID: ${tenants[0].id})`);
    }
    
    // Verificar usuarios
    const users = await prisma.user.count();
    console.log(`👤 Usuarios totales: ${users}`);
    
    // Verificar productos
    const products = await prisma.masterProduct.count();
    console.log(`📦 Productos maestros: ${products}`);
    
    // Verificar inventario
    const inventory = await prisma.tenantInventory.count();
    console.log(`🏭 Items en inventario: ${inventory}`);
    
    // Verificar ventas
    const sales = await prisma.sale.count();
    console.log(`💰 Ventas registradas: ${sales}`);
    
    console.log('\n✅ Verificación de configuración completa');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
