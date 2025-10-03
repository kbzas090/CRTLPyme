
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema de validación
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  rut: z.string().min(8, 'RUT inválido'),
  businessName: z.string().min(3, 'El nombre de la empresa debe tener al menos 3 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = registerSchema.parse(body)

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar si el RUT ya existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { rut: validatedData.rut },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Este RUT ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Crear tenant y usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el tenant (empresa)
      const tenant = await tx.tenant.create({
        data: {
          businessName: validatedData.businessName,
          rut: validatedData.rut,
          email: validatedData.email,
          isActive: true,
          planType: 'BASIC',
          maxCashiers: 2,
          extraCashiers: 0,
        },
      })

      // Crear el usuario administrador
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: 'ADMIN', // Primer usuario siempre es ADMIN
          isActive: true,
          tenantId: tenant.id,
        },
      })

      return { tenant, user }
    })

    // Retornar éxito (sin datos sensibles)
    return NextResponse.json(
      {
        success: true,
        message: 'Cuenta creada exitosamente',
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro:', error)

    // Errores de validación de Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    // Error genérico
    return NextResponse.json(
      { error: 'Error al crear la cuenta. Por favor intenta nuevamente.' },
      { status: 500 }
    )
  }
}
