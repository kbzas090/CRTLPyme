
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

// Schema de validación con Zod
const registerSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  rut: z.string().min(8, 'Ingresa un RUT válido (ej: 12345678-9)'),
  businessName: z.string().min(3, 'El nombre de la empresa debe tener al menos 3 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Error al crear la cuenta')
        return
      }

      // Registro exitoso
      setSuccess(true)
      
      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err) {
      setError('Ocurrió un error al crear la cuenta. Por favor intenta nuevamente.')
      console.error('Error en registro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Registra tu empresa en CRTLPyme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Cuenta creada exitosamente! Redirigiendo al login...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Mensaje de error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Información de la Empresa */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Información de la Empresa</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre de la Empresa *</Label>
                  <Input
                    id="businessName"
                    {...register('businessName')}
                    placeholder="Ej: Mi Negocio SpA"
                    disabled={isLoading}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500">{errors.businessName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rut">RUT de la Empresa *</Label>
                  <Input
                    id="rut"
                    {...register('rut')}
                    placeholder="12345678-9"
                    disabled={isLoading}
                  />
                  {errors.rut && (
                    <p className="text-sm text-red-500">{errors.rut.message}</p>
                  )}
                </div>
              </div>

              {/* Información Personal */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Información Personal</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      placeholder="Juan"
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      placeholder="Pérez"
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="tu@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Seguridad</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Repite tu contraseña"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Botón de registro */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>

              {/* Link a login */}
              <div className="text-center text-sm">
                <span className="text-gray-600">¿Ya tienes una cuenta? </span>
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
