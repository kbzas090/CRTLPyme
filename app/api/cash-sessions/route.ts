
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validación para abrir sesión de caja
const openSessionSchema = z.object({
  initialAmount: z.number().min(0, 'El monto inicial no puede ser negativo'),
})

// GET: Obtener sesiones de caja
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      tenantId: session.user.tenantId,
    }

    // Filtrar por usuario si es CAJA
    if (session.user.role === 'CAJA') {
      where.userId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const cashSessions = await prisma.cashSession.findMany({
      where,
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
      orderBy: { openedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(cashSessions)
  } catch (error) {
    console.error('Error al obtener sesiones:', error)
    return NextResponse.json({ error: 'Error al obtener sesiones' }, { status: 500 })
  }
}

// POST: Abrir nueva sesión de caja
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (ADMIN y CAJA pueden abrir sesiones)
    if (!['ADMIN', 'CAJA'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para abrir sesiones de caja' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = openSessionSchema.parse(body)

    // Verificar que el usuario no tenga ya una sesión abierta
    // Permitimos múltiples sesiones en el tenant (una por usuario/cajero)
    const openSession = await prisma.cashSession.findFirst({
      where: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (openSession) {
      return NextResponse.json(
        { 
          error: 'Ya tienes una sesión de caja abierta',
          sessionId: openSession.id,
          openedAt: openSession.openedAt,
          initialAmount: openSession.initialAmount
        },
        { status: 400 }
      )
    }

    // Crear sesión de caja
    const cashSession = await prisma.cashSession.create({
      data: {
        initialAmount: validatedData.initialAmount,
        userId: session.user.id,
        tenantId: session.user.tenantId,
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
      },
    })

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'CashSession',
        entityId: cashSession.id,
        newValues: cashSession,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(cashSession, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al abrir sesión:', error)
    return NextResponse.json({ error: 'Error al abrir sesión' }, { status: 500 })
  }
}
