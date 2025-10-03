
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Middleware de protección de rutas
export default withAuth(
  function middleware(req) {
    // El usuario está autenticado, permitir acceso
    return NextResponse.next()
  },
  {
    callbacks: {
      // Verificar si el usuario está autorizado
      authorized: ({ token }) => {
        // Si hay token, el usuario está autenticado
        return !!token
      },
    },
    pages: {
      signIn: '/auth/login', // Redirigir a login si no está autenticado
    },
  }
)

// Configurar qué rutas proteger
export const config = {
  matcher: [
    // Proteger todas las rutas de admin
    '/admin/:path*',
    // Proteger todas las rutas de caja
    '/caja/:path*',
    // Proteger todas las rutas de inventario
    '/inventario/:path*',
    // Proteger todas las rutas de soporte
    '/soporte/:path*',
    // Proteger todas las rutas de saas
    '/saas/:path*',
  ],
}
