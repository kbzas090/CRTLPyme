const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTenantsQuery() {
  try {
    console.log('Probando consulta de tenants corregida...');
    
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tenantInventories: true,  // Corregido a plural
            sales: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`✅ Total de tenants encontrados: ${tenants.length}`);
    if (tenants.length > 0) {
      console.log('\nPrimer tenant:');
      console.log(`  - Nombre: ${tenants[0].businessName}`);
      console.log(`  - RUT: ${tenants[0].rut}`);
      console.log(`  - Usuarios: ${tenants[0]._count.users}`);
      console.log(`  - Productos: ${tenants[0]._count.tenantInventories}`);
      console.log(`  - Ventas: ${tenants[0]._count.sales}`);
    }
  } catch (error) {
    console.error('❌ Error en la consulta:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTenantsQuery();
