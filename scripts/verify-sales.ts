import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySales() {
  try {
    console.log('=== VERIFICACIÓN DE VENTAS ===\n');

    // 1. Total de ventas
    const totalSales = await prisma.sale.count();
    console.log(`1. TOTAL DE VENTAS: ${totalSales}`);

    // 2. Ventas recientes (últimas 20)
    const recentSales = await prisma.sale.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tenantId: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
      },
    });
    console.log('\n2. ÚLTIMAS 20 VENTAS:');
    console.table(recentSales);

    // 3. Obtener tenants de prueba
    const tenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { businessName: { contains: 'Minimarket', mode: 'insensitive' } },
          { businessName: { contains: 'Rinconcito', mode: 'insensitive' } },
          { businessName: { contains: 'Ferretería', mode: 'insensitive' } },
        ],
      },
      select: { id: true, businessName: true },
    });
    console.log('\n3. TENANTS DE PRUEBA:');
    console.table(tenants);

    // 4. Ventas por tenant
    const salesByTenant = await prisma.sale.groupBy({
      by: ['tenantId'],
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _count: { id: 'desc' } },
    });
    console.log('\n4. VENTAS POR TENANT:');
    console.table(salesByTenant);

    // 5. Ventas específicas de Minimarket Don Luis (si existe)
    const minimarketTenant = tenants.find(t => 
      t.businessName.toLowerCase().includes('minimarket')
    );
    
    if (minimarketTenant) {
      console.log(`\n5. VENTAS DE ${minimarketTenant.businessName} (ID: ${minimarketTenant.id}):`);
      
      const minimarketSales = await prisma.sale.findMany({
        where: { tenantId: minimarketTenant.id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: { id: true },
          },
        },
      });
      
      const salesWithItemCount = minimarketSales.map(sale => ({
        id: sale.id,
        total: sale.total,
        status: sale.status,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
        items_count: sale.items.length,
      }));
      
      console.table(salesWithItemCount);
    }

    // 6. Total de items vendidos
    const totalSaleItems = await prisma.saleItem.count();
    console.log(`\n6. TOTAL DE ITEMS VENDIDOS: ${totalSaleItems}`);

    // 7. Ejemplo de items
    const sampleItems = await prisma.saleItem.findMany({
      take: 10,
    });
    console.log('\n7. EJEMPLO DE SALE ITEMS:');
    console.table(sampleItems);

    // 8. Ventas por fecha (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesLast30Days = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Agrupar por fecha
    const salesByDate = salesLast30Days.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { fecha: date, ventas: 0, monto_total: 0 };
      }
      acc[date].ventas++;
      acc[date].monto_total += Number(sale.total);
      return acc;
    }, {} as Record<string, { fecha: string; ventas: number; monto_total: number }>);

    console.log('\n8. VENTAS POR FECHA (ÚLTIMOS 30 DÍAS):');
    console.table(Object.values(salesByDate).sort((a, b) => b.fecha.localeCompare(a.fecha)));

    // 9. Verificar ventas con IDs inválidos
    const allSales = await prisma.sale.findMany({
      select: { id: true },
    });
    
    const invalidIds = allSales.filter(sale => 
      sale.id.includes('NaN') || sale.id.includes('undefined') || sale.id.includes('null')
    );
    
    console.log(`\n9. VENTAS CON IDs INVÁLIDOS: ${invalidIds.length}`);
    if (invalidIds.length > 0) {
      console.table(invalidIds.slice(0, 10));
    }

    // 10. Estadísticas por método de pago
    const salesByPaymentMethod = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { total: true },
    });
    console.log('\n10. VENTAS POR MÉTODO DE PAGO:');
    console.table(salesByPaymentMethod);

    // 11. Estadísticas por status
    const salesByStatus = await prisma.sale.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { total: true },
    });
    console.log('\n11. VENTAS POR STATUS:');
    console.table(salesByStatus);

  } catch (error) {
    console.error('Error verificando ventas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySales();
