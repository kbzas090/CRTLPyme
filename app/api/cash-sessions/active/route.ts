
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Obtener sesión activa del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener usuario completo de la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Usuario sin tenant' }, { status: 400 })
    }

    const activeSession = await prisma.cashSession.findFirst({
      where: {
        userId: user.id,
        tenantId: user.tenantId,
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sales: {
          where: {
            status: 'COMPLETED',
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
    })

    if (!activeSession) {
      return NextResponse.json({ hasActiveSession: false, session: null }, { status: 200 })
    }

    // Calcular totales de la sesión
    const totalSales = activeSession.sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalCash = activeSession.sales
      .filter(sale => sale.paymentMethod === 'CASH')
      .reduce((sum, sale) => sum + Number(sale.total), 0)

    const expectedAmount = Number(activeSession.initialAmount) + totalSales

    return NextResponse.json({
      hasActiveSession: true,
      session: {
        ...activeSession,
        totalSales,
        totalCash,
        expectedAmount,
      }
    })
  } catch (error) {
    console.error('Error al obtener sesión activa:', error)
    return NextResponse.json({ error: 'Error al obtener sesión activa' }, { status: 500 })
  }
}
