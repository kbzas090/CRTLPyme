const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSessions() {
  try {
    console.log('\n=== SESIONES DE CAJA ACTIVAS ===\n');
    
    const openSessions = await prisma.cashSession.findMany({
      where: {
        status: 'OPEN'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        tenant: {
          select: {
            id: true,
            businessName: true
          }
        }
      },
      orderBy: {
        openedAt: 'desc'
      }
    });

    if (openSessions.length === 0) {
      console.log('✅ No hay sesiones de caja abiertas');
    } else {
      console.log(`⚠️  Sesiones abiertas: ${openSessions.length}\n`);
      openSessions.forEach((session, idx) => {
        console.log(`Sesión ${idx + 1}:`);
        console.log(`  ID: ${session.id}`);
        console.log(`  Usuario: ${session.user.email}`);
        console.log(`  Tenant: ${session.tenant.businessName}`);
        console.log(`  Monto inicial: $${session.initialAmount}`);
        console.log(`  Abierta: ${session.openedAt.toLocaleString()}`);
        console.log(`  Estado: ${session.status}`);
        console.log('');
      });
    }

    // Check total sessions
    const totalSessions = await prisma.cashSession.count();
    console.log(`Total de sesiones en BD: ${totalSessions}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();
