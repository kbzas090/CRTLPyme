
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/customers - Listar todos los clientes del tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const where: any = {
      tenantId,
      isActive: true
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { rut: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Obtener clientes con paginación
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { sales: true }
          }
        }
      }),
      prisma.customer.count({ where })
    ])

    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await request.json()

    const { firstName, lastName, email, phone, address, rut, notes } = body

    // Validaciones
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'El nombre y apellido son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el RUT ya existe para este tenant
    if (rut) {
      const existingCustomer = await prisma.customer.findUnique({
        where: {
          tenantId_rut: {
            tenantId,
            rut
          }
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este RUT' },
          { status: 400 }
        )
      }
    }

    // Crear cliente
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        rut,
        notes,
        tenantId
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
