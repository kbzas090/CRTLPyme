
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Obtener estadísticas de ventas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'

    let startDate: Date
    const now = new Date()

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    // Obtener ventas del período
    const sales = await prisma.sale.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: true,
      },
    })

    // Calcular estadísticas
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalItems = sales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    // Ventas por método de pago
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 }
      }
      acc[method].count++
      acc[method].total += Number(sale.total)
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    return NextResponse.json({
      totalSales,
      totalRevenue,
      totalItems,
      averageTicket,
      salesByPaymentMethod,
      period,
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
