import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Obtener sesión actual del usuario (para validaciones)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const activeSession = await prisma.cashSession.findFirst({
      where: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        status: 'OPEN',
      },
      select: {
        id: true,
        status: true,
        openedAt: true,
        initialAmount: true,
      },
    })

    if (!activeSession) {
      return NextResponse.json({ session: null })
    }

    return NextResponse.json({ session: activeSession })
  } catch (error) {
    console.error('Error al obtener sesión actual:', error)
    return NextResponse.json({ error: 'Error al obtener sesión actual' }, { status: 500 })
  }
}
