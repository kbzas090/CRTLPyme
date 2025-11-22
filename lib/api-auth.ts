/**
 * Middleware de autorización para rutas de API
 * 
 * Proporciona funciones para verificar permisos en los endpoints de API
 * y responder con errores apropiados cuando no se tienen permisos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  hasModuleAccess,
  canPerformAction,
  canAccessRoute,
  isAdmin,
  type Module,
  type Action,
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

/**
 * Interfaz para la sesión del usuario autenticado
 */
interface AuthenticatedSession {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    tenantId: string
  }
}

/**
 * Obtiene la sesión del usuario autenticado desde la request
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedSession | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }
    
    // Buscar usuario completo en la base de datos para asegurar que tenemos todos los campos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
      }
    })
    
    if (!user) {
      return null
    }
    
    return { user }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Verifica que el usuario esté autenticado
 * Retorna error 401 si no está autenticado
 */
export async function requireAuth(): Promise<
  { success: true; user: AuthenticatedSession['user'] } | 
  { success: false; response: NextResponse }
> {
  const session = await getAuthenticatedUser()
  
  if (!session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'No autenticado. Por favor inicie sesión.' },
        { status: 401 }
      ),
    }
  }
  
  return {
    success: true,
    user: session.user,
  }
}

/**
 * Verifica que el usuario tenga acceso a un módulo específico
 * Retorna error 403 si no tiene acceso
 */
export async function requireModuleAccess(
  module: Module
): Promise<
  { success: true; user: AuthenticatedSession['user'] } | 
  { success: false; response: NextResponse }
> {
  // Primero verificar autenticación
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult
  }
  
  const { user } = authResult
  
  // Verificar acceso al módulo
  if (!hasModuleAccess(user.role, module)) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Acceso denegado. No tiene permisos para acceder a este módulo.',
          module,
          role: user.role,
        },
        { status: 403 }
      ),
    }
  }
  
  return {
    success: true,
    user,
  }
}

/**
 * Verifica que el usuario pueda realizar una acción específica en un módulo
 * Retorna error 403 si no puede realizar la acción
 */
export async function requirePermission(
  module: Module,
  action: Action
): Promise<
  { success: true; user: AuthenticatedSession['user'] } | 
  { success: false; response: NextResponse }
> {
  // Primero verificar autenticación
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult
  }
  
  const { user } = authResult
  
  // Verificar permiso para la acción
  if (!canPerformAction(user.role, module, action)) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: `Acceso denegado. No tiene permisos para realizar esta acción.`,
          module,
          action,
          role: user.role,
        },
        { status: 403 }
      ),
    }
  }
  
  return {
    success: true,
    user,
  }
}

/**
 * Verifica que el usuario sea administrador
 * Retorna error 403 si no es administrador
 */
export async function requireAdmin(): Promise<
  { success: true; user: AuthenticatedSession['user'] } | 
  { success: false; response: NextResponse }
> {
  // Primero verificar autenticación
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult
  }
  
  const { user } = authResult
  
  // Verificar si es admin
  if (!isAdmin(user.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Acceso denegado. Esta acción requiere permisos de administrador.',
          role: user.role,
        },
        { status: 403 }
      ),
    }
  }
  
  return {
    success: true,
    user,
  }
}

/**
 * Verifica que el usuario pertenezca al tenant especificado
 * Previene acceso cruzado entre tenants
 */
export async function requireTenantAccess(
  tenantId: string
): Promise<
  { success: true; user: AuthenticatedSession['user'] } | 
  { success: false; response: NextResponse }
> {
  // Primero verificar autenticación
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult
  }
  
  const { user } = authResult
  
  // Verificar que el usuario pertenezca al tenant
  // Excepto PROVEEDOR que puede acceder a todos los tenants
  if (user.role !== 'PROVEEDOR' && user.tenantId !== tenantId) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Acceso denegado. No tiene permisos para acceder a este tenant.',
          requestedTenantId: tenantId,
          userTenantId: user.tenantId,
        },
        { status: 403 }
      ),
    }
  }
  
  return {
    success: true,
    user,
  }
}

/**
 * Función helper para manejar errores de autorización de forma consistente
 */
export function unauthorizedResponse(message?: string) {
  return NextResponse.json(
    { error: message || 'No autenticado. Por favor inicie sesión.' },
    { status: 401 }
  )
}

/**
 * Función helper para manejar errores de permisos de forma consistente
 */
export function forbiddenResponse(message?: string, details?: Record<string, any>) {
  return NextResponse.json(
    { 
      error: message || 'Acceso denegado. No tiene permisos suficientes.',
      ...details,
    },
    { status: 403 }
  )
}

/**
 * Middleware combinado que verifica múltiples condiciones
 */
export async function requirePermissions(options: {
  module?: Module
  action?: Action
  adminOnly?: boolean
  tenantId?: string
}): Promise<
  { success: true; user: AuthenticatedSession['user'] } | 
  { success: false; response: NextResponse }
> {
  const { module, action, adminOnly, tenantId } = options
  
  // 1. Verificar autenticación
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult
  }
  
  const { user } = authResult
  
  // 2. Si requiere admin, verificar
  if (adminOnly && !isAdmin(user.role)) {
    return {
      success: false,
      response: forbiddenResponse('Esta acción requiere permisos de administrador.', {
        role: user.role,
      }),
    }
  }
  
  // 3. Si especifica tenantId, verificar acceso
  if (tenantId && user.role !== 'PROVEEDOR' && user.tenantId !== tenantId) {
    return {
      success: false,
      response: forbiddenResponse('No tiene permisos para acceder a este tenant.', {
        requestedTenantId: tenantId,
        userTenantId: user.tenantId,
      }),
    }
  }
  
  // 4. Si especifica módulo y acción, verificar permisos
  if (module && action) {
    if (!canPerformAction(user.role, module, action)) {
      return {
        success: false,
        response: forbiddenResponse('No tiene permisos para realizar esta acción.', {
          module,
          action,
          role: user.role,
        }),
      }
    }
  } else if (module) {
    // Solo verificar acceso al módulo
    if (!hasModuleAccess(user.role, module)) {
      return {
        success: false,
        response: forbiddenResponse('No tiene permisos para acceder a este módulo.', {
          module,
          role: user.role,
        }),
      }
    }
  }
  
  return {
    success: true,
    user,
  }
}
