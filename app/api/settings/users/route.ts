
/**
 * API para gestionar usuarios del tenant
 * Solo ADMIN puede acceder
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { canPerformAction } from '@/lib/subscription-middleware'

/**
 * GET /api/settings/users
 * Lista todos los usuarios del tenant actual
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Solo administradores.' },
      { status: 403 }
    )
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Error al listar usuarios:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings/users
 * Crea un nuevo usuario para el tenant actual
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Solo administradores.' },
      { status: 403 }
    )
  }

  // VALIDACIÓN DE LÍMITES DE SUSCRIPCIÓN
  const limitCheck = await canPerformAction(session.user.tenantId, 'create_user')
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { 
        success: false,
        error: limitCheck.message,
        limitExceeded: true,
        upgradeRequired: true 
      },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, role } = body

    // Validar campos requeridos
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar rol
    const validRoles = ['ADMIN', 'CAJA', 'INVENTARIO']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rol inválido' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        tenantId: session.user.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'User',
        entityId: newUser.id,
        newValues: {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Usuario creado exitosamente',
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings/users
 * Actualiza un usuario del tenant actual
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Solo administradores.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { userId, firstName, lastName, role, password } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario pertenece al tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: session.user.tenantId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (role) {
      const validRoles = ['ADMIN', 'CAJA', 'INVENTARIO']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Rol inválido' },
          { status: 400 }
        )
      }
      updateData.role = role
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'User',
        entityId: updatedUser.id,
        newValues: updateData,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuario actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/settings/users
 * Desactiva un usuario del tenant actual
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Solo administradores.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // No permitir que el admin se desactive a sí mismo
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'No puedes desactivar tu propia cuenta' },
        { status: 400 }
      )
    }

    // Verificar que el usuario pertenece al tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: session.user.tenantId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Desactivar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'User',
        entityId: updatedUser.id,
        oldValues: { isActive: true },
        newValues: { isActive: false },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuario desactivado exitosamente',
    })
  } catch (error) {
    console.error('Error al desactivar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al desactivar usuario' },
      { status: 500 }
    )
  }
}
