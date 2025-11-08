'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Plus, 
  Search,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  Filter,
  Download,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Schema de validación para movimientos
const movementSchema = z.object({
  tenantInventoryId: z.string().min(1, 'Seleccione un producto'),
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT'], {
    errorMap: () => ({ message: 'Tipo de movimiento inválido' }),
  }),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  reason: z.string().min(1, 'El motivo es requerido').max(255, 'El motivo es muy largo'),
  notes: z.string().max(500, 'Las notas son muy largas').optional(),
})

type MovementFormData = z.infer<typeof movementSchema>

interface InventoryMovement {
  id: string
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'
  quantity: number
  reason: string
  notes?: string
  createdAt: string
  tenantInventory: {
    id: string
    customSku?: string
    masterProduct: {
      id: string
      sku: string
      name: string
      category: string
      brand?: string
    }
  }
  user: {
    id: string
    firstName: string
    lastName: string
  }
  previousStock?: number
  newStock?: number
}

interface TenantInventory {
  id: string
  customSku?: string
  stock: number
  salePrice: number
  masterProduct: {
    id: string
    sku: string
    name: string
    category: string
    brand?: string
  }
}

interface MovementStats {
  totalMovements: number
  entriesCount: number
  exitsCount: number
  adjustmentsCount: number
  totalEntryQuantity: number
  totalExitQuantity: number
}

export default function InventoryMovementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [stats, setStats] = useState<MovementStats | null>(null)
  const [inventory, setInventory] = useState<TenantInventory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)
  
  // Filtros
  const [filterType, setFilterType] = useState<string>('all')
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  // Estados para el diálogo de crear movimiento
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
  })

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Cargar inventario para el select
  useEffect(() => {
    if (isDialogOpen) {
      fetchInventory()
    }
  }, [isDialogOpen])

  // Cargar movimientos
  useEffect(() => {
    if (status === 'authenticated') {
      fetchMovements()
    }
  }, [status, filterType, filterProduct, startDate, endDate])

  const fetchInventory = async () => {
    setIsLoadingInventory(true)
    try {
      const response = await fetch('/api/inventory')
      if (!response.ok) throw new Error('Error al cargar inventario')
      
      const data = await response.json()
      setInventory(data.inventory)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar inventario')
    } finally {
      setIsLoadingInventory(false)
    }
  }

  const fetchMovements = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (filterProduct !== 'all') params.append('tenantInventoryId', filterProduct)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/inventory/movements?${params.toString()}`)
      if (!response.ok) throw new Error('Error al cargar movimientos')
      
      const data = await response.json()
      setMovements(data.movements)
      setStats(data.stats)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar movimientos')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: MovementFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al registrar movimiento')
      }

      const newMovement = await response.json()
      toast.success('Movimiento registrado exitosamente', {
        description: `Stock actualizado: ${newMovement.previousStock} → ${newMovement.newStock}`,
      })
      
      setIsDialogOpen(false)
      reset()
      fetchMovements()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al registrar movimiento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenDialog = () => {
    reset()
    setIsDialogOpen(true)
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return 'Entrada'
      case 'EXIT':
        return 'Salida'
      case 'ADJUSTMENT':
        return 'Ajuste'
      default:
        return type
    }
  }

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return <Badge className="bg-green-500"><ArrowUpCircle className="h-3 w-3 mr-1" />Entrada</Badge>
      case 'EXIT':
        return <Badge className="bg-red-500"><ArrowDownCircle className="h-3 w-3 mr-1" />Salida</Badge>
      case 'ADJUSTMENT':
        return <Badge className="bg-blue-500"><Settings className="h-3 w-3 mr-1" />Ajuste</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">
            Registra y visualiza todos los movimientos de stock
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Movimiento
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.entriesCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalEntryQuantity} unidades ingresadas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salidas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.exitsCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalExitQuantity} unidades salieron
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
              <Settings className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adjustmentsCount}</div>
              <p className="text-xs text-muted-foreground">
                Correcciones de inventario
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="filter-type">Tipo de Movimiento</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ENTRY">Entradas</SelectItem>
                  <SelectItem value="EXIT">Salidas</SelectItem>
                  <SelectItem value="ADJUSTMENT">Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterType('all')
                  setFilterProduct('all')
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            {movements.length} movimientos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {getMovementTypeBadge(movement.type)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movement.tenantInventory.masterProduct.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {movement.tenantInventory.masterProduct.category}
                            {movement.tenantInventory.masterProduct.brand && ` • ${movement.tenantInventory.masterProduct.brand}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.tenantInventory.customSku || movement.tenantInventory.masterProduct.sku}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={movement.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{movement.reason}</div>
                          {movement.notes && (
                            <div className="text-sm text-muted-foreground">{movement.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {movement.user.firstName} {movement.user.lastName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Movement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
            <DialogDescription>
              Registra una entrada, salida o ajuste de stock
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantInventoryId">Producto *</Label>
              <Select 
                onValueChange={(value) => setValue('tenantInventoryId', value)}
                disabled={isLoadingInventory}
              >
                <SelectTrigger id="tenantInventoryId">
                  <SelectValue placeholder="Seleccione un producto" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.masterProduct.name} - Stock: {item.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenantInventoryId && (
                <p className="text-sm text-red-500">{errors.tenantInventoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Movimiento *</Label>
              <Select onValueChange={(value: any) => setValue('type', value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY">
                    <div className="flex items-center">
                      <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
                      Entrada
                    </div>
                  </SelectItem>
                  <SelectItem value="EXIT">
                    <div className="flex items-center">
                      <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
                      Salida
                    </div>
                  </SelectItem>
                  <SelectItem value="ADJUSTMENT">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-blue-500" />
                      Ajuste
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="Ej: 10"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Input
                id="reason"
                {...register('reason')}
                placeholder="Ej: Compra a proveedor"
                maxLength={255}
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Información adicional (opcional)"
                maxLength={500}
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Registrar Movimiento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
