/**
 * Utilidades de autenticación para el módulo de Administrador SaaS
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Verifica si el usuario actual es un administrador SaaS (PROVEEDOR)
 * Retorna la sesión si es válida, o null si no lo es
 */
export async function verifyAdminSaaSAccess() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      ),
      session: null,
    };
  }

  if (session.user.role !== 'PROVEEDOR') {
    return {
      error: NextResponse.json(
        { error: 'Acceso denegado. Solo administradores SaaS pueden acceder a este recurso.' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Verifica si el usuario tiene uno de los roles permitidos
 */
export async function verifyRoles(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      ),
      session: null,
    };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { error: 'Acceso denegado. No tiene permisos para acceder a este recurso.' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}
