const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCashierUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'MinimarketDonLuis_Caja@gmail.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            businessName: true,
            rut: true,
          }
        }
      }
    });
    
    console.log('Usuario Cajero encontrado:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCashierUser();
