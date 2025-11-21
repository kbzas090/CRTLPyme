'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermissions } from '@/hooks/usePermissions'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { redirectToAllowed, role } = usePermissions()

  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    // Redirigir a la página principal permitida para su rol
    redirectToAllowed()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acceso Denegado
          </CardTitle>
          <CardDescription className="text-base mt-2">
            No tienes permisos para acceder a esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
            <p className="text-gray-700 mb-2">
              <strong>Usuario:</strong> {session?.user?.firstName} {session?.user?.lastName}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Rol:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{role}</span>
            </p>
            <p className="text-gray-600 text-xs mt-3">
              Tu rol actual no tiene permisos para acceder al recurso solicitado. 
              Si crees que esto es un error, contacta con tu administrador.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="default"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir a mi página principal
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver atrás
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              ¿Necesitas más acceso? Contacta con tu administrador para solicitar permisos adicionales.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
