'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Receipt,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  Eye,
  Filter,
  Download,
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Sale {
  id: string
  saleNumber: string
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'CASH' | 'DEBIT' | 'CREDIT' | 'TRANSFER'
  status: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    subtotal: number
    product: {
      id: string
      name: string
      sku: string
    }
  }>
  cashSession?: {
    id: string
    openedAt: string
  }
}

interface Stats {
  totalSales: number
  totalRevenue: number
  totalItems: number
  averageTicket: number
  salesByPaymentMethod: Record<
    string,
    {
      count: number
      total: number
    }
  >
}

export default function SalesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Filtros
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router, period, startDate, endDate])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams()
      params.append('limit', '100')

      if (startDate) {
        params.append('startDate', new Date(startDate).toISOString())
      }
      if (endDate) {
        params.append('endDate', new Date(endDate).toISOString())
      }

      // Cargar ventas
      const salesRes = await fetch(`/api/sales?${params}`)
      if (salesRes.ok) {
        const data = await salesRes.json()
        setSales(data)
      }

      // Cargar estadísticas
      const statsRes = await fetch(`/api/sales/stats?period=${period}`)
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const viewSaleDetail = (sale: Sale) => {
    setSelectedSale(sale)
    setIsDetailDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (date: string) => {
    return format(new Date(date), "d 'de' MMM, HH:mm", { locale: es })
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Efectivo',
      DEBIT: 'Débito',
      CREDIT: 'Crédito',
      TRANSFER: 'Transferencia',
    }
    return labels[method] || method
  }

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      CASH: 'default',
      DEBIT: 'secondary',
      CREDIT: 'outline',
      TRANSFER: 'outline',
    }
    return (
      <Badge variant={variants[method] || 'outline'}>
        {getPaymentMethodLabel(method)}
      </Badge>
    )
  }

  const applyQuickFilter = (filterPeriod: 'today' | 'week' | 'month') => {
    const now = new Date()
    setPeriod(filterPeriod)

    switch (filterPeriod) {
      case 'today':
        setStartDate(format(startOfDay(now), 'yyyy-MM-dd'))
        setEndDate(format(endOfDay(now), 'yyyy-MM-dd'))
        break
      case 'week':
        setStartDate(format(startOfDay(subDays(now, 7)), 'yyyy-MM-dd'))
        setEndDate(format(endOfDay(now), 'yyyy-MM-dd'))
        break
      case 'month':
        setStartDate(format(startOfDay(subDays(now, 30)), 'yyyy-MM-dd'))
        setEndDate(format(endOfDay(now), 'yyyy-MM-dd'))
        break
    }
  }

  const printReceipt = () => {
    window.print()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
          <p className="text-muted-foreground mt-2">
            Consulta y analiza tus ventas realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2">
        <Button
          variant={period === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyQuickFilter('today')}
        >
          Hoy
        </Button>
        <Button
          variant={period === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyQuickFilter('week')}
        >
          Última Semana
        </Button>
        <Button
          variant={period === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyQuickFilter('month')}
        >
          Último Mes
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {period === 'today' && 'Hoy'}
                {period === 'week' && 'Últimos 7 días'}
                {period === 'month' && 'Últimos 30 días'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Total recaudado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.averageTicket)}
              </div>
              <p className="text-xs text-muted-foreground">Por transacción</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Unidades totales</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ventas por método de pago */}
      {stats && Object.keys(stats.salesByPaymentMethod).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(stats.salesByPaymentMethod).map(([method, data]) => (
                <div key={method} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodBadge(method)}
                  </div>
                  <div className="text-2xl font-bold">{data.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(data.total)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros personalizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadData} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            {sales.length} venta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Venta</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Método de Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Receipt className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      No se encontraron ventas en este período
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        #{sale.saleNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDateTime(sale.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        {sale.user.firstName} {sale.user.lastName}
                      </TableCell>
                      <TableCell className="text-center">
                        {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPaymentMethodBadge(sale.paymentMethod)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(Number(sale.total))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSaleDetail(sale)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalle de venta */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Detalle de Venta
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              {/* Comprobante */}
              <div className="rounded-lg border p-4 space-y-3 bg-white">
                <div className="text-center border-b pb-3">
                  <h3 className="font-bold">COMPROBANTE DE VENTA</h3>
                  <p className="text-sm text-muted-foreground">
                    N° {selectedSale.saleNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(selectedSale.createdAt),
                      "d 'de' MMMM 'de' yyyy, HH:mm",
                      { locale: es }
                    )}
                  </p>
                </div>

                <div className="space-y-2 border-b pb-3">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.quantity} x {formatCurrency(Number(item.unitPrice))}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(Number(item.subtotal))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(Number(selectedSale.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (19%):</span>
                    <span>{formatCurrency(Number(selectedSale.tax))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(Number(selectedSale.total))}</span>
                  </div>
                </div>

                <div className="border-t pt-3 text-xs text-center text-muted-foreground">
                  <p>
                    Método de pago: {getPaymentMethodLabel(selectedSale.paymentMethod)}
                  </p>
                  <p>
                    Atendido por: {selectedSale.user.firstName}{' '}
                    {selectedSale.user.lastName}
                  </p>
                  <p className="mt-2">¡Gracias por su compra!</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button className="flex-1" onClick={printReceipt}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
