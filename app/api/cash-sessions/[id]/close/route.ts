
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validación para cerrar sesión
const closeSessionSchema = z.object({
  finalAmount: z.number().min(0, 'El monto final no puede ser negativo'),
})

// POST: Cerrar sesión de caja
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = closeSessionSchema.parse(body)

    const { id } = await params

    // Obtener la sesión de caja
    const cashSession = await prisma.cashSession.findUnique({
      where: { id },
      include: {
        sales: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    })

    if (!cashSession) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    // Verificar que la sesión pertenezca al tenant del usuario
    if (cashSession.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Verificar que la sesión esté abierta
    if (cashSession.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'La sesión ya está cerrada' },
        { status: 400 }
      )
    }

    // Verificar que sea el dueño de la sesión o ADMIN
    if (cashSession.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para cerrar esta sesión' },
        { status: 403 }
      )
    }

    // Calcular monto esperado
    const totalSales = cashSession.sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const expectedAmount = Number(cashSession.initialAmount) + totalSales
    const difference = validatedData.finalAmount - expectedAmount

    // Cerrar sesión
    const updatedSession = await prisma.cashSession.update({
      where: { id },
      data: {
        finalAmount: validatedData.finalAmount,
        expectedAmount,
        difference,
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'CashSession',
        entityId: updatedSession.id,
        oldValues: { status: 'OPEN' },
        newValues: updatedSession,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al cerrar sesión:', error)
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 })
  }
}
