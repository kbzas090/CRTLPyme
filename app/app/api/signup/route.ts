
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  businessName: z.string().min(1),
  rut: z.string().min(1),
  role: z.enum(['PROVEEDOR', 'ADMIN', 'CAJA', 'INVENTARIO', 'SOPORTE']).default('ADMIN'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Check if RUT already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { rut: validatedData.rut }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'El RUT ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          businessName: validatedData.businessName,
          rut: validatedData.rut,
          email: validatedData.email,
        }
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: validatedData.role as any,
          tenantId: tenant.id,
        }
      })

      return { tenant, user }
    })

    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      tenantId: result.tenant.id,
      userId: result.user.id
    })

  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
