import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('Verificando usuario CRTLPyme_Admin@gmail.com...\n');
    
    // Verificar en PlatformAdmin
    const platformAdmin = await prisma.platformAdmin.findUnique({
      where: { email: 'CRTLPyme_Admin@gmail.com' }
    });
    
    console.log('En tabla PlatformAdmin:');
    console.log(platformAdmin ? JSON.stringify(platformAdmin, null, 2) : 'NO ENCONTRADO');
    
    // Verificar en User
    const user = await prisma.user.findUnique({
      where: { email: 'CRTLPyme_Admin@gmail.com' }
    });
    
    console.log('\nEn tabla User:');
    console.log(user ? JSON.stringify(user, null, 2) : 'NO ENCONTRADO');
    
    // Verificar usuarios con nombres similares
    const similarUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'CRTLPyme', mode: 'insensitive' } },
          { email: { contains: 'Admin', mode: 'insensitive' } }
        ]
      },
      take: 5
    });
    
    console.log('\nUsuarios similares encontrados:');
    similarUsers.forEach(u => console.log(`- ${u.email} (rol: ${u.role})`));
    
    // Verificar administradores de plataforma
    const allAdmins = await prisma.platformAdmin.findMany();
    console.log(`\nTotal PlatformAdmins: ${allAdmins.length}`);
    allAdmins.forEach(a => console.log(`- ${a.email} (rol: ${a.role})`));
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
