const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTenantsQuery() {
  try {
    console.log('Probando consulta de tenants...');
    
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tenantInventory: true,
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
    
    console.log(`Total de tenants encontrados: ${tenants.length}`);
    console.log('Primeros 3 tenants:', JSON.stringify(tenants.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error en la consulta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTenantsQuery();
