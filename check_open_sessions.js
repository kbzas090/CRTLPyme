const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOpenSessions() {
  try {
    const openSessions = await prisma.cashSession.findMany({
      where: {
        tenantId: 'cmhwiqlif00dxupszipjv1mpv', // Minimarket Don Luis
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    
    console.log(`Sesiones abiertas encontradas: ${openSessions.length}`);
    if (openSessions.length > 0) {
      console.log('Detalles:', JSON.stringify(openSessions, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOpenSessions();
