/**
 * Sistema de Control de Acceso Basado en Roles (RBAC)
 * 
 * Define qué módulos y acciones puede realizar cada rol de usuario.
 * 
 * Roles disponibles:
 * - PROVEEDOR: Administrador SaaS (acceso total)
 * - ADMIN: Administrador del Tenant (acceso total a su tenant)
 * - CAJA: Operador de Punto de Venta (ventas, inventario consulta)
 * - INVENTARIO: Encargado de Stock (gestión de inventario)
 * - SOPORTE: Soporte técnico (acceso limitado de lectura)
 */

import { UserRole } from '@prisma/client'

// ============ MÓDULOS DEL SISTEMA ============

export const MODULES = {
  DASHBOARD: 'dashboard',
  POS: 'pos',
  SALES: 'sales',
  INVENTORY: 'inventory',
  INVENTORY_MOVEMENTS: 'inventory-movements',
  INVENTORY_ADD: 'inventory-add',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  CASH_SESSION: 'cash-session',
  REPORTS: 'reports',
  REPORTS_SALES: 'reports-sales',
  REPORTS_PRODUCTS: 'reports-products',
  REPORTS_CUSTOMERS: 'reports-customers',
  REPORTS_INVENTORY_MOVEMENTS: 'reports-inventory-movements',
  SETTINGS: 'settings',
  USERS: 'users',
} as const

export type Module = (typeof MODULES)[keyof typeof MODULES]

// ============ ACCIONES POR MÓDULO ============

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]

// ============ CONFIGURACIÓN DE PERMISOS POR ROL ============

interface RolePermissions {
  modules: Module[]
  actions: {
    [key in Module]?: Action[]
  }
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  // PROVEEDOR: Acceso total al sistema (Administrador SaaS)
  PROVEEDOR: {
    modules: Object.values(MODULES),
    actions: {
      [MODULES.DASHBOARD]: [ACTIONS.VIEW],
      [MODULES.POS]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.SALES]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.INVENTORY]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.INVENTORY_ADD]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.PRODUCTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.CUSTOMERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.CASH_SESSION]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
      [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_SALES]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_PRODUCTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_CUSTOMERS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT],
      [MODULES.USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
    },
  },

  // ADMIN: Acceso total al tenant (Administrador del Cliente)
  ADMIN: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.POS,
      MODULES.SALES,
      MODULES.INVENTORY,
      MODULES.INVENTORY_MOVEMENTS,
      MODULES.INVENTORY_ADD,
      MODULES.PRODUCTS,
      MODULES.CUSTOMERS,
      MODULES.CASH_SESSION,
      MODULES.REPORTS,
      MODULES.REPORTS_SALES,
      MODULES.REPORTS_PRODUCTS,
      MODULES.REPORTS_CUSTOMERS,
      MODULES.REPORTS_INVENTORY_MOVEMENTS,
      MODULES.SETTINGS,
      MODULES.USERS,
    ],
    actions: {
      [MODULES.DASHBOARD]: [ACTIONS.VIEW],
      [MODULES.POS]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.SALES]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.INVENTORY]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.INVENTORY_ADD]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.PRODUCTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.CUSTOMERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.CASH_SESSION]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
      [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_SALES]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_PRODUCTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_CUSTOMERS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT],
      [MODULES.USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
    },
  },

  // CAJA/POS: Operador de Punto de Venta
  // Puede vender, ver inventario (solo consulta), gestionar clientes
  CAJA: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.POS,
      MODULES.SALES,
      MODULES.INVENTORY,
      MODULES.PRODUCTS,
      MODULES.CUSTOMERS,
      MODULES.CASH_SESSION,
    ],
    actions: {
      [MODULES.DASHBOARD]: [ACTIONS.VIEW],
      [MODULES.POS]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.SALES]: [ACTIONS.VIEW],
      [MODULES.INVENTORY]: [ACTIONS.VIEW], // Solo consulta, no puede modificar
      [MODULES.PRODUCTS]: [ACTIONS.VIEW], // Solo consulta
      [MODULES.CUSTOMERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
      [MODULES.CASH_SESSION]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    },
  },

  // INVENTARIO: Encargado de Stock
  // Solo gestiona inventario, productos y movimientos
  INVENTARIO: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.INVENTORY,
      MODULES.INVENTORY_MOVEMENTS,
      MODULES.INVENTORY_ADD,
      MODULES.PRODUCTS,
      MODULES.REPORTS_PRODUCTS,
      MODULES.REPORTS_INVENTORY_MOVEMENTS,
    ],
    actions: {
      [MODULES.DASHBOARD]: [ACTIONS.VIEW],
      [MODULES.INVENTORY]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.INVENTORY_ADD]: [ACTIONS.VIEW, ACTIONS.CREATE],
      [MODULES.PRODUCTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
      [MODULES.REPORTS_PRODUCTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    },
  },

  // SOPORTE: Soporte técnico (acceso limitado de lectura)
  SOPORTE: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.SALES,
      MODULES.INVENTORY,
      MODULES.PRODUCTS,
      MODULES.CUSTOMERS,
      MODULES.REPORTS,
      MODULES.REPORTS_SALES,
      MODULES.REPORTS_PRODUCTS,
      MODULES.REPORTS_CUSTOMERS,
      MODULES.REPORTS_INVENTORY_MOVEMENTS,
    ],
    actions: {
      [MODULES.DASHBOARD]: [ACTIONS.VIEW],
      [MODULES.SALES]: [ACTIONS.VIEW],
      [MODULES.INVENTORY]: [ACTIONS.VIEW],
      [MODULES.PRODUCTS]: [ACTIONS.VIEW],
      [MODULES.CUSTOMERS]: [ACTIONS.VIEW],
      [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_SALES]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_PRODUCTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_CUSTOMERS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
      [MODULES.REPORTS_INVENTORY_MOVEMENTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    },
  },
}

// ============ FUNCIONES DE VERIFICACIÓN DE PERMISOS ============

/**
 * Verifica si un rol tiene acceso a un módulo específico
 */
export function hasModuleAccess(role: UserRole | string, module: Module): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  
  return permissions.modules.includes(module)
}

/**
 * Verifica si un rol puede realizar una acción específica en un módulo
 */
export function canPerformAction(
  role: UserRole | string,
  module: Module,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  
  // Primero verificar si tiene acceso al módulo
  if (!permissions.modules.includes(module)) return false
  
  // Verificar si tiene permiso para la acción
  const moduleActions = permissions.actions[module]
  if (!moduleActions) return false
  
  return moduleActions.includes(action)
}

/**
 * Obtiene todos los módulos accesibles para un rol
 */
export function getAccessibleModules(role: UserRole | string): Module[] {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return []
  
  return permissions.modules
}

/**
 * Obtiene todas las acciones permitidas para un rol en un módulo
 */
export function getAllowedActions(role: UserRole | string, module: Module): Action[] {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return []
  
  return permissions.actions[module] || []
}

/**
 * Mapeo de rutas a módulos para verificación de acceso
 */
export const ROUTE_TO_MODULE_MAP: Record<string, Module> = {
  '/admin/dashboard': MODULES.DASHBOARD,
  '/admin/pos': MODULES.POS,
  '/admin/sales': MODULES.SALES,
  '/admin/inventory': MODULES.INVENTORY,
  '/admin/inventory/movements': MODULES.INVENTORY_MOVEMENTS,
  '/admin/inventory/add-from-pool': MODULES.INVENTORY_ADD,
  '/admin/cash-session': MODULES.CASH_SESSION,
  '/admin/reports': MODULES.REPORTS,
  '/admin/reports/sales': MODULES.REPORTS_SALES,
  '/admin/reports/products': MODULES.REPORTS_PRODUCTS,
  '/admin/reports/customers': MODULES.REPORTS_CUSTOMERS,
  '/admin/reports/inventory-movements': MODULES.REPORTS_INVENTORY_MOVEMENTS,
  '/admin/settings': MODULES.SETTINGS,
}

/**
 * Verifica si un usuario puede acceder a una ruta específica
 */
export function canAccessRoute(role: UserRole | string, route: string): boolean {
  // Normalizar la ruta (remover query params y trailing slash)
  const normalizedRoute = route.split('?')[0].replace(/\/$/, '')
  
  // Buscar el módulo correspondiente a la ruta
  const module = ROUTE_TO_MODULE_MAP[normalizedRoute]
  
  // Si no hay módulo mapeado, buscar la ruta padre
  if (!module) {
    // Intentar con la ruta padre
    const parentRoute = normalizedRoute.split('/').slice(0, -1).join('/')
    const parentModule = ROUTE_TO_MODULE_MAP[parentRoute]
    
    if (parentModule) {
      return hasModuleAccess(role, parentModule)
    }
    
    // Si no encuentra el módulo, denegar por defecto (whitelist approach)
    return false
  }
  
  return hasModuleAccess(role, module)
}

/**
 * Obtiene la URL de redirección para un rol que no tiene acceso
 */
export function getRedirectUrlForRole(role: UserRole | string): string {
  // Obtener el primer módulo accesible para el rol
  const accessibleModules = getAccessibleModules(role)
  
  if (accessibleModules.length === 0) {
    return '/unauthorized'
  }
  
  // Buscar la ruta del primer módulo accesible
  const firstModule = accessibleModules[0]
  const routeEntry = Object.entries(ROUTE_TO_MODULE_MAP).find(
    ([_, module]) => module === firstModule
  )
  
  return routeEntry ? routeEntry[0] : '/admin/dashboard'
}

/**
 * Verifica si un rol es administrador (tiene acceso completo)
 */
export function isAdmin(role: UserRole | string): boolean {
  return role === 'ADMIN' || role === 'PROVEEDOR'
}

/**
 * Verifica si un rol tiene permisos de solo lectura en un módulo
 */
export function isReadOnly(role: UserRole | string, module: Module): boolean {
  const allowedActions = getAllowedActions(role, module)
  
  // Si solo puede ver, es read-only
  return allowedActions.length === 1 && allowedActions[0] === ACTIONS.VIEW
}
