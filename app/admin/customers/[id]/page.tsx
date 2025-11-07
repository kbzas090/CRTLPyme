'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BackButton } from '@/components/layout'
import { toast } from '@/components/ui/use-toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShoppingCart,
  DollarSign,
  Calendar,
  Edit
} from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address: string | null
  rut: string | null
  notes: string | null
  createdAt: string
  _count: {
    sales: number
  }
  totalPurchases: number
  sales: any[]
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
  }, [params.id])

  const loadCustomer = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/customers/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el cliente',
          variant: 'destructive'
        })
        router.push('/admin/customers')
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar el cliente',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL')
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="p-8 space-y-6">
      <BackButton href="/admin/customers" />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-8 w-8" />
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Cliente desde {formatDate(customer.createdAt)}
          </p>
        </div>
        <Link href={`/admin/customers/${customer.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Estadísticas del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Total de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer._count.sales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Gastado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(customer.totalPurchases).toLocaleString('es-CL')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Última Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {customer.sales.length > 0
                ? formatDate(customer.sales[0].createdAt)
                : 'Sin compras'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              RUT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{customer.rut || '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Datos de contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
            )}
            
            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
            )}
            
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{customer.address}</p>
                </div>
              </div>
            )}
          </div>

          {customer.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Notas</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de compras */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras ({customer.sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Venta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Este cliente aún no ha realizado compras
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customer.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                      <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                      <TableCell>
                        {sale.paymentMethod === 'CASH' && 'Efectivo'}
                        {sale.paymentMethod === 'DEBIT' && 'Débito'}
                        {sale.paymentMethod === 'CREDIT' && 'Crédito'}
                        {sale.paymentMethod === 'TRANSFER' && 'Transferencia'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(sale.total).toLocaleString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sale.status === 'COMPLETED' ? 'default' :
                            sale.status === 'PENDING' ? 'secondary' : 'destructive'
                          }
                        >
                          {sale.status === 'COMPLETED' && 'Completada'}
                          {sale.status === 'PENDING' && 'Pendiente'}
                          {sale.status === 'CANCELLED' && 'Cancelada'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
