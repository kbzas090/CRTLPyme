/**
 * React Hooks para verificación de permisos en el frontend
 * 
 * Estos hooks permiten verificar permisos de usuario directamente
 * en componentes de React para mostrar/ocultar funcionalidad.
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  hasModuleAccess,
  canPerformAction,
  getAccessibleModules,
  getAllowedActions,
  canAccessRoute,
  getRedirectUrlForRole,
  isAdmin,
  isReadOnly,
  type Module,
  type Action,
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

/**
 * Hook principal de permisos
 * Retorna funciones y datos relacionados con permisos del usuario actual
 */
export function usePermissions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  const userRole = session?.user?.role as UserRole | undefined

  return {
    // Estado de sesión
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    role: userRole,
    
    // Funciones de verificación
    hasModuleAccess: (module: Module) => {
      if (!userRole) return false
      return hasModuleAccess(userRole, module)
    },
    
    canPerformAction: (module: Module, action: Action) => {
      if (!userRole) return false
      return canPerformAction(userRole, module, action)
    },
    
    canAccessRoute: (route: string) => {
      if (!userRole) return false
      return canAccessRoute(userRole, route)
    },
    
    getAccessibleModules: () => {
      if (!userRole) return []
      return getAccessibleModules(userRole)
    },
    
    getAllowedActions: (module: Module) => {
      if (!userRole) return []
      return getAllowedActions(userRole, module)
    },
    
    isAdmin: () => {
      if (!userRole) return false
      return isAdmin(userRole)
    },
    
    isReadOnly: (module: Module) => {
      if (!userRole) return false
      return isReadOnly(userRole, module)
    },
    
    // Utilidades de navegación
    redirectToAllowed: () => {
      if (!userRole) return
      const url = getRedirectUrlForRole(userRole)
      router.push(url)
    },
    
    currentPath: pathname,
  }
}

/**
 * Hook para proteger páginas completas
 * Redirige automáticamente si el usuario no tiene acceso
 * 
 * @param requiredModule - Módulo requerido para acceder a la página
 * @param redirectUrl - URL a la que redirigir si no tiene acceso (opcional)
 */
export function useProtectedRoute(requiredModule: Module, redirectUrl?: string) {
  const { hasModuleAccess, role, isLoading, redirectToAllowed } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Esperar a que cargue la sesión
    if (isLoading) return
    
    // Si no tiene acceso al módulo
    if (!hasModuleAccess(requiredModule)) {
      console.warn(`Access denied to module: ${requiredModule} for role: ${role}`)
      
      // Redirigir a URL específica o a la página permitida
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push('/unauthorized')
      }
    }
  }, [hasModuleAccess, requiredModule, role, isLoading, redirectUrl, router, pathname])
  
  return {
    hasAccess: hasModuleAccess(requiredModule),
    isLoading,
  }
}

/**
 * Hook para verificar si el usuario puede realizar una acción específica
 * Útil para mostrar/ocultar botones de edición, eliminación, etc.
 * 
 * @param module - Módulo en el que se realiza la acción
 * @param action - Acción a verificar
 */
export function useCanPerformAction(module: Module, action: Action) {
  const { canPerformAction: checkAction, role, isLoading } = usePermissions()
  
  return {
    canPerform: checkAction(module, action),
    role,
    isLoading,
  }
}

/**
 * Hook para verificar si el usuario es administrador
 */
export function useIsAdmin() {
  const { isAdmin: checkAdmin, role, isLoading } = usePermissions()
  
  return {
    isAdmin: checkAdmin(),
    role,
    isLoading,
  }
}

/**
 * Hook para obtener módulos accesibles
 * Útil para generar menús dinámicos
 */
export function useAccessibleModules() {
  const { getAccessibleModules, role, isLoading } = usePermissions()
  
  return {
    accessibleModules: getAccessibleModules(),
    role,
    isLoading,
  }
}
