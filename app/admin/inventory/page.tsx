
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { usePermissions } from '@/hooks/usePermissions'
import { MODULES, ACTIONS } from '@/lib/permissions'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Package,
  AlertTriangle
} from 'lucide-react'

// Schema de validación para productos
const productSchema = z.object({
  sku: z.string().min(1, 'El código es requerido'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  brand: z.string().optional(),
  costPrice: z.string().min(1, 'El precio de compra es requerido'),
  salePrice: z.string().min(1, 'El precio de venta es requerido'),
  stock: z.string().min(0, 'El stock no puede ser negativo'),
  minStock: z.string().min(0, 'El stock mínimo no puede ser negativo'),
})

type ProductFormData = z.infer<typeof productSchema>

interface MasterProduct {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  category: string
  brand?: string
  suggestedPrice: number
  unit: string
  imageUrl?: string
}

interface Product {
  id: string
  customSku?: string
  costPrice: number
  salePrice: number
  stock: number
  minStock: number
  isActive: boolean
  location?: string
  customNotes?: string
  createdAt: string
  updatedAt: string
  masterProduct: MasterProduct
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { canPerformAction, role } = usePermissions()
  
  // Verificar permisos para acciones específicas
  const canEdit = canPerformAction(MODULES.INVENTORY, ACTIONS.EDIT)
  const canDelete = canPerformAction(MODULES.INVENTORY, ACTIONS.DELETE)
  const canCreate = canPerformAction(MODULES.INVENTORY, ACTIONS.CREATE)
  const canViewCostPrice = role !== 'CAJA' // Los cajeros no pueden ver precios de compra
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para el diálogo de crear/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Estados para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      loadProducts()
    }
  }, [status, router])

  useEffect(() => {
    // Filtrar productos según el término de búsqueda
    if (searchTerm) {
      const filtered = products.filter(
        (p) =>
          p.masterProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.masterProduct.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.masterProduct.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.masterProduct.barcode && p.masterProduct.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.customSku && p.customSku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        // La API de inventory devuelve { inventory: [], total: number, stats: {...} }
        setProducts(data.inventory || [])
        setFilteredProducts(data.inventory || [])
      } else {
        toast.error('Error al cargar inventario')
      }
    } catch (error) {
      console.error('Error al cargar inventario:', error)
      toast.error('Error al cargar inventario')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    reset({
      sku: '',
      barcode: '',
      name: '',
      description: '',
      category: '',
      brand: '',
      costPrice: '',
      salePrice: '',
      stock: '0',
      minStock: '5',
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    reset({
      sku: product.customSku || product.masterProduct.sku,
      barcode: product.masterProduct.barcode || '',
      name: product.masterProduct.name,
      description: product.masterProduct.description || '',
      category: product.masterProduct.category,
      brand: product.masterProduct.brand || '',
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true)

    try {
      // Solo permitir editar para actualizar precios y stock
      if (!editingProduct) {
        toast.error('Use "Agregar del Pool" para añadir nuevos productos')
        setIsSaving(false)
        return
      }

      // Convertir strings a números y validar
      const costPrice = parseFloat(data.costPrice)
      const salePrice = parseFloat(data.salePrice)
      const stock = parseInt(data.stock)
      const minStock = parseInt(data.minStock)

      // Validar que los números sean válidos
      if (isNaN(costPrice) || costPrice < 0) {
        toast.error('El precio de compra debe ser un número válido')
        setIsSaving(false)
        return
      }

      if (isNaN(salePrice) || salePrice < 0) {
        toast.error('El precio de venta debe ser un número válido')
        setIsSaving(false)
        return
      }

      if (isNaN(stock) || stock < 0) {
        toast.error('El stock debe ser un número válido')
        setIsSaving(false)
        return
      }

      if (isNaN(minStock) || minStock < 0) {
        toast.error('El stock mínimo debe ser un número válido')
        setIsSaving(false)
        return
      }

      // Preparar datos para enviar (solo incluir campos que han cambiado y son válidos)
      const productData: any = {
        costPrice,
        salePrice,
        stock,
        minStock,
      }

      // Agregar customSku solo si es diferente al SKU del producto maestro
      if (data.sku && data.sku !== editingProduct.masterProduct.sku) {
        productData.customSku = data.sku
      }

      // Agregar location solo si tiene valor
      if (editingProduct.location) {
        productData.location = editingProduct.location
      }

      // Agregar customNotes solo si tiene valor
      if (editingProduct.customNotes) {
        productData.customNotes = editingProduct.customNotes
      }

      const url = `/api/inventory/${editingProduct.id}`
      const method = 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast.success('Producto actualizado correctamente')
        setIsDialogOpen(false)
        loadProducts()
      } else {
        const error = await response.json()
        // Mostrar detalles específicos si hay errores de validación
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach((detail: any) => {
            toast.error(`${detail.path?.join('.')}: ${detail.message}`)
          })
        } else {
          toast.error(error.error || 'Error al guardar producto')
        }
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error al guardar producto')
    } finally {
      setIsSaving(false)
    }
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/inventory/${productToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Producto eliminado del inventario')
        setIsDeleteDialogOpen(false)
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('Error al eliminar producto')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Agotado</Badge>
    } else if (product.stock <= product.minStock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Stock Bajo</Badge>
    } else {
      return <Badge variant="outline" className="border-green-500 text-green-500">Disponible</Badge>
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
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
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus productos y stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/inventory/movements')}
          >
            <Package className="mr-2 h-4 w-4" />
            Movimientos
          </Button>
          {canCreate && (
            <Button onClick={() => router.push('/admin/inventory/add-from-pool')}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar del Pool
            </Button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda y estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código, categoría o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            Lista de todos los productos en inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  {canViewCostPrice && (
                    <TableHead className="text-right">Precio Compra</TableHead>
                  )}
                  <TableHead className="text-right">Precio Venta</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      {searchTerm
                        ? 'No se encontraron productos con ese criterio'
                        : 'No hay productos registrados. Crea tu primer producto.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.customSku || product.masterProduct.sku}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.masterProduct.name}</div>
                          {product.masterProduct.brand && (
                            <div className="text-sm text-muted-foreground">{product.masterProduct.brand}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.masterProduct.category}</TableCell>
                      {canViewCostPrice && (
                        <TableCell className="text-right">
                          ${Math.round(Number(product.costPrice)).toLocaleString('es-CL')}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        ${Math.round(Number(product.salePrice)).toLocaleString('es-CL')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {product.stock <= product.minStock && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={product.stock <= product.minStock ? 'text-orange-500 font-semibold' : ''}>
                            {product.stock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockBadge(product)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de crear/editar producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Actualiza la información del producto'
                : 'Completa los datos del nuevo producto'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Código SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">Código SKU *</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Ej: PROD001"
                />
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku.message}</p>
                )}
              </div>

              {/* Código de Barras */}
              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                  placeholder="Ej: 7891234567890"
                />
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Coca Cola 1.5L"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Descripción opcional del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Ej: Bebidas"
                />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  {...register('brand')}
                  placeholder="Ej: Coca Cola"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Precio de Compra */}
              {canViewCostPrice && (
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Precio de Compra *</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    {...register('costPrice')}
                    placeholder="0.00"
                  />
                  {errors.costPrice && (
                    <p className="text-sm text-red-500">{errors.costPrice.message}</p>
                  )}
                </div>
              )}

              {/* Precio de Venta */}
              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio de Venta *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  {...register('salePrice')}
                  placeholder="0.00"
                />
                {errors.salePrice && (
                  <p className="text-sm text-red-500">{errors.salePrice.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Actual *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register('stock')}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>

              {/* Stock Mínimo */}
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  {...register('minStock')}
                  placeholder="5"
                />
                {errors.minStock && (
                  <p className="text-sm text-red-500">{errors.minStock.message}</p>
                )}
              </div>
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
                {isSaving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto "{productToDelete?.masterProduct?.name}" de tu inventario. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
