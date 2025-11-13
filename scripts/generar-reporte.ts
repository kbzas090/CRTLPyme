import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateReport() {
  console.log('📊 Generando reporte detallado...\n')

  try {
    // Obtener tenants activos (excepto demos)
    const tenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
        businessName: {
          notIn: ['Empresa Demo CRTLPyme', 'CRTLPyme - Plataforma']
        }
      },
      orderBy: { businessName: 'asc' }
    })

    const reportData: any[] = []
    let globalStats = {
      totalProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalTenants: tenants.length
    }

    for (const tenant of tenants) {
      // Contar productos
      const productsCount = await prisma.tenantInventory.count({
        where: { tenantId: tenant.id, isActive: true }
      })

      // Obtener ventas
      const sales = await prisma.sale.findMany({
        where: { tenantId: tenant.id },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              tenantInventory: {
                select: {
                  masterProduct: {
                    select: {
                      name: true,
                      category: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      const salesCount = sales.length
      const completedSales = sales.filter(s => s.status === 'COMPLETED')
      const revenue = completedSales.reduce((sum, s) => sum + Number(s.total), 0)

      // Productos más vendidos
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
      
      for (const sale of completedSales) {
        for (const item of sale.items) {
          const productName = item.tenantInventory.masterProduct.name
          if (!productSales[productName]) {
            productSales[productName] = { name: productName, quantity: 0, revenue: 0 }
          }
          productSales[productName].quantity += item.quantity
          productSales[productName].revenue += item.quantity * Number(item.unitPrice)
        }
      }

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      // Ventas por mes
      const salesByMonth: Record<string, number> = {}
      for (const sale of completedSales) {
        const month = sale.createdAt.toISOString().substring(0, 7) // YYYY-MM
        if (!salesByMonth[month]) salesByMonth[month] = 0
        salesByMonth[month]++
      }

      reportData.push({
        name: tenant.businessName,
        rut: tenant.rut,
        email: tenant.email,
        plan: tenant.planType,
        productsCount,
        salesCount,
        completedSalesCount: completedSales.length,
        revenue,
        topProducts,
        salesByMonth
      })

      globalStats.totalProducts += productsCount
      globalStats.totalSales += salesCount
      globalStats.totalRevenue += revenue
    }

    // Generar reporte en Markdown
    let markdown = `# 📊 REPORTE DE POBLACIÓN DE DATOS - CRTLPyme\n\n`
    markdown += `**Fecha de generación:** ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}\n\n`
    markdown += `---\n\n`

    markdown += `## 🎯 RESUMEN EJECUTIVO\n\n`
    markdown += `- **Tenants procesados:** ${globalStats.totalTenants}\n`
    markdown += `- **Total de productos creados:** ${globalStats.totalProducts}\n`
    markdown += `- **Total de ventas registradas:** ${globalStats.totalSales}\n`
    markdown += `- **Ingresos totales:** CLP $${globalStats.totalRevenue.toLocaleString('es-CL')}\n\n`
    markdown += `---\n\n`

    markdown += `## 📋 DETALLE POR TENANT\n\n`

    for (let i = 0; i < reportData.length; i++) {
      const data = reportData[i]
      markdown += `### ${i + 1}. ${data.name}\n\n`
      markdown += `**Información General:**\n`
      markdown += `- RUT: ${data.rut}\n`
      markdown += `- Email: ${data.email}\n`
      markdown += `- Plan: ${data.plan}\n\n`

      markdown += `**Estadísticas:**\n`
      markdown += `- Productos en inventario: ${data.productsCount}\n`
      markdown += `- Ventas totales: ${data.salesCount}\n`
      markdown += `- Ventas completadas: ${data.completedSalesCount}\n`
      markdown += `- Ingresos generados: CLP $${data.revenue.toLocaleString('es-CL')}\n\n`

      if (data.topProducts.length > 0) {
        markdown += `**Top 5 Productos Más Vendidos:**\n\n`
        markdown += `| Producto | Unidades | Ingresos |\n`
        markdown += `|----------|----------|----------|\n`
        for (const product of data.topProducts) {
          markdown += `| ${product.name} | ${product.quantity} | CLP $${product.revenue.toLocaleString('es-CL')} |\n`
        }
        markdown += `\n`
      }

      if (Object.keys(data.salesByMonth).length > 0) {
        markdown += `**Ventas por Mes:**\n\n`
        markdown += `| Mes | Ventas |\n`
        markdown += `|-----|--------|\n`
        for (const [month, count] of Object.entries(data.salesByMonth).sort()) {
          markdown += `| ${month} | ${count} |\n`
        }
        markdown += `\n`
      }

      markdown += `---\n\n`
    }

    markdown += `## ✅ NOTAS FINALES\n\n`
    markdown += `- Se crearon productos de inventario realistas para todos los tenants de tipo minimarket/almacén\n`
    markdown += `- Los tenants ya tenían ventas existentes, por lo que NO se crearon ventas adicionales\n`
    markdown += `- Todos los productos fueron agregados al catálogo maestro (master_products) y al inventario de cada tenant (tenant_inventory)\n`
    markdown += `- Stock inicial establecido con valores realistas para negocio tipo minimarket\n`
    markdown += `- Backup de la base de datos creado en: /home/ubuntu/backups/\n\n`

    return markdown
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// Ejecutar
generateReport()
  .then((markdown) => {
    console.log(markdown)
    // Guardar en archivo
    require('fs').writeFileSync('/home/ubuntu/POBLACION_DATOS_VENTAS_INVENTARIO.md', markdown, 'utf8')
    console.log('\n✅ Reporte guardado en /home/ubuntu/POBLACION_DATOS_VENTAS_INVENTARIO.md')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
