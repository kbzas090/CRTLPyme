import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Obtener sesión actual del usuario (para validaciones)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener usuario completo de la base de datos para asegurar consistencia
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
      select: {
        id: true,
        status: true,
        openedAt: true,
        initialAmount: true,
        userId: true,
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
