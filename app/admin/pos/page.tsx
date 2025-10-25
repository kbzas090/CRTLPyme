'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  AlertCircle,
  Receipt,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand?: string
  salePrice: number
  stock: number
  barcode?: string
}

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

interface Sale {
  id: string
  saleNumber: string
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  createdAt: string
  items: Array<{
    product: {
      name: string
    }
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  user: {
    firstName: string
    lastName: string
  }
}

export default function POSPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasActiveSession, setHasActiveSession] = useState(false)

  // Estado para el diálogo de pago
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DEBIT' | 'CREDIT' | 'TRANSFER'>('CASH')
  const [cashReceived, setCashReceived] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Estado para el diálogo de comprobante
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])

  useEffect(() => {
    // Filtrar productos
    if (searchTerm) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Verificar sesión de caja activa
      const sessionRes = await fetch('/api/cash-sessions/active')
      setHasActiveSession(sessionRes.ok)

      // Cargar productos
      const productsRes = await fetch('/api/products')
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.filter((p: Product) => p.stock > 0))
        setFilteredProducts(data.filter((p: Product) => p.stock > 0))
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    if (!hasActiveSession) {
      toast.error('Debes abrir una sesión de caja primero')
      return
    }

    const existingItem = cart.find((item) => item.product.id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay suficiente stock disponible')
        return
      }
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        subtotal: product.salePrice,
      }
      setCart([...cart, newItem])
      toast.success(`${product.name} agregado al carrito`)
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const item = cart.find((item) => item.product.id === productId)
    if (!item) return

    if (newQuantity > item.product.stock) {
      toast.error('No hay suficiente stock disponible')
      return
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.product.salePrice * newQuantity,
            }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
    toast.info('Producto eliminado del carrito')
  }

  const clearCart = () => {
    setCart([])
    toast.info('Carrito vaciado')
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * 0.19
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const openPaymentDialog = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    if (!hasActiveSession) {
      toast.error('Debes abrir una sesión de caja primero')
      return
    }

    setPaymentMethod('CASH')
    setCashReceived('')
    setIsPaymentDialogOpen(true)
  }

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    const { total } = calculateTotals()

    // Validar efectivo recibido si es pago en efectivo
    if (paymentMethod === 'CASH') {
      const received = parseFloat(cashReceived)
      if (isNaN(received) || received < total) {
        toast.error('El monto recibido es insuficiente')
        return
      }
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod,
          cashReceived: paymentMethod === 'CASH' ? parseFloat(cashReceived) : undefined,
        }),
      })

      if (response.ok) {
        const sale = await response.json()
        toast.success('Venta procesada correctamente')
        setCompletedSale(sale)
        setIsPaymentDialogOpen(false)
        setIsReceiptDialogOpen(true)
        setCart([])
        loadData() // Recargar productos para actualizar stock
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al procesar venta')
      }
    } catch (error) {
      console.error('Error al procesar venta:', error)
      toast.error('Error al procesar venta')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const printReceipt = () => {
    window.print()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const { subtotal, tax, total } = calculateTotals()
  const change = paymentMethod === 'CASH' && cashReceived 
    ? parseFloat(cashReceived) - total 
    : 0

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de ventas rápido y eficiente
          </p>
        </div>
        {!hasActiveSession && (
          <Button
            variant="outline"
            onClick={() => router.push('/admin/cash-session')}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Abrir Sesión de Caja
          </Button>
        )}
      </div>

      {/* Alerta si no hay sesión activa */}
      {!hasActiveSession && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                No hay sesión de caja activa. Debes abrir una sesión antes de realizar ventas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de productos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barra de búsqueda */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Grid de productos */}
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  {searchTerm
                    ? 'No se encontraron productos'
                    : 'No hay productos disponibles'}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-2">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {product.category}
                        {product.brand && ` • ${product.brand}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(product.salePrice)}
                        </div>
                        <Badge
                          variant={product.stock > 10 ? 'outline' : 'secondary'}
                          className={product.stock <= 10 ? 'border-orange-500 text-orange-500' : ''}
                        >
                          Stock: {product.stock}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        SKU: {product.sku}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Panel del carrito */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">El carrito está vacío</p>
                  <p className="text-xs mt-1">
                    Selecciona productos para agregar
                  </p>
                </div>
              ) : (
                <>
                  {/* Items del carrito */}
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm line-clamp-2">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatCurrency(item.product.salePrice)} c/u
                            </div>
                            <div className="text-sm font-bold mt-1">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator />

                  {/* Totales */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA (19%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Botón de procesar venta */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={openPaymentDialog}
                    disabled={!hasActiveSession}
                  >
                    <DollarSign className="mr-2 h-5 w-5" />
                    Procesar Venta
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de Pago */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Selecciona el método de pago y completa la transacción
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resumen de totales */}
            <div className="rounded-lg border bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (19%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total a Pagar:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="DEBIT">Débito</SelectItem>
                  <SelectItem value="CREDIT">Crédito</SelectItem>
                  <SelectItem value="TRANSFER">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Monto recibido (solo para efectivo) */}
            {paymentMethod === 'CASH' && (
              <>
                <div className="space-y-2">
                  <Label>Monto Recibido</Label>
                  <Input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                </div>

                {cashReceived && parseFloat(cashReceived) >= total && (
                  <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 font-medium">Vuelto:</span>
                      <span className="text-green-700 font-bold text-lg">
                        {formatCurrency(change)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={processSale} disabled={isProcessing}>
              {isProcessing ? 'Procesando...' : 'Confirmar Venta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Comprobante */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Venta Completada
            </DialogTitle>
          </DialogHeader>

          {completedSale && (
            <div className="space-y-4">
              {/* Comprobante */}
              <div className="rounded-lg border p-4 space-y-3 bg-white">
                <div className="text-center border-b pb-3">
                  <h3 className="font-bold">COMPROBANTE DE VENTA</h3>
                  <p className="text-sm text-muted-foreground">
                    N° {completedSale.saleNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(completedSale.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>

                <div className="space-y-2 border-b pb-3">
                  {completedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
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
                    <span>{formatCurrency(Number(completedSale.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (19%):</span>
                    <span>{formatCurrency(Number(completedSale.tax))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(Number(completedSale.total))}</span>
                  </div>
                </div>

                <div className="border-t pt-3 text-xs text-center text-muted-foreground">
                  <p>Método de pago: {completedSale.paymentMethod}</p>
                  <p>Atendido por: {completedSale.user.firstName} {completedSale.user.lastName}</p>
                  <p className="mt-2">¡Gracias por su compra!</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsReceiptDialogOpen(false)}
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
