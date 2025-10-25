const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Conectando a la base de datos...\n');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos\n');
    
    // Contar registros en cada tabla
    const tenantsCount = await prisma.tenant.count();
    const usersCount = await prisma.user.count();
    const productsCount = await prisma.product.count();
    const salesCount = await prisma.sale.count();
    
    console.log('📊 Estado actual de la base de datos:');
    console.log('   - Tenants:', tenantsCount);
    console.log('   - Usuarios:', usersCount);
    console.log('   - Productos:', productsCount);
    console.log('   - Ventas:', salesCount);
    console.log('');
    
    // Mostrar tenants existentes
    if (tenantsCount > 0) {
      const tenants = await prisma.tenant.findMany({
        select: {
          id: true,
          businessName: true,
          rut: true,
          planType: true,
          isActive: true
        }
      });
      console.log('🏢 Tenants existentes:');
      tenants.forEach(t => {
        console.log(`   - ${t.businessName} (${t.rut}) - Plan: ${t.planType} - Activo: ${t.isActive}`);
      });
      console.log('');
    }
    
    // Mostrar usuarios existentes
    if (usersCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
          isActive: true
        }
      });
      console.log('👥 Usuarios existentes:');
      users.forEach(u => {
        console.log(`   - ${u.firstName} ${u.lastName} (${u.email}) - Rol: ${u.role} - TenantID: ${u.tenantId}`);
      });
      console.log('');
    }
    
    // Verificar si existe usuario admin_saas
    const adminSaas = await prisma.user.findFirst({
      where: { role: 'PROVEEDOR' }
    });
    
    if (adminSaas) {
      console.log('✅ Ya existe usuario administrador SaaS (PROVEEDOR)');
    } else {
      console.log('❌ No existe usuario administrador SaaS (PROVEEDOR)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
