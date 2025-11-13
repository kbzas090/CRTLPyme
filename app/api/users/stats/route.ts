/**
 * API para obtener estadísticas de usuarios del tenant
 * Accesible por ADMIN
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/users/stats
 * Obtener estadísticas de usuarios activos del tenant
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Contar usuarios activos del tenant
    const activeUsers = await prisma.user.count({
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
      },
    })

    // Contar usuarios por rol
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
      },
      _count: {
        id: true,
      },
    })

    // Contar total de usuarios (incluyendo inactivos)
    const totalUsers = await prisma.user.count({
      where: {
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      activeUsers,
      totalUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.id,
      })),
    })
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de usuarios' },
      { status: 500 }
    )
  }
}
