/**
 * Página para agregar productos del pool compartido al inventario del tenant
 * Accesible por ADMIN e INVENTARIO
 */

'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Package, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

export default function AddFromPoolPage() {
  const router = useRouter()
  const [products, setProducts] = useState<MasterProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<MasterProduct | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    costPrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 5,
    location: '',
    customNotes: '',
  })

  useEffect(() => {
    fetchAvailableProducts()
  }, [selectedCategory])

  const fetchAvailableProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/inventory/available-products?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar productos disponibles')
      }

      const data = await response.json()
      setProducts(data.products)
      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProduct = (product: MasterProduct) => {
    setSelectedProduct(product)
    setFormData({
      costPrice: Number(product.suggestedPrice) * 0.7, // 70% del precio sugerido como costo
      salePrice: Number(product.suggestedPrice),
      stock: 0,
      minStock: 5,
      location: '',
      customNotes: product.description || '',
    })
    setShowAddForm(true)
  }

  const handleAddToInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterProductId: selectedProduct.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al agregar producto')
      }

      // Usar toast nativo de window para no depender de sonner
      if (typeof window !== 'undefined') {
        const toast = document.createElement('div')
        toast.textContent = 'Producto agregado exitosamente'
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 9999; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); font-weight: 600;'
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000)
      }
      
      setShowAddForm(false)
      setSelectedProduct(null)
      fetchAvailableProducts() // Recargar lista
    } catch (err) {
      // Usar toast nativo de window para errores
      if (typeof window !== 'undefined') {
        const toast = document.createElement('div')
        toast.textContent = '❌ ' + (err instanceof Error ? err.message : 'Error desconocido')
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; z-index: 9999; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);'
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agregar Productos del Pool</h1>
          <p className="text-muted-foreground">
            Explora el catálogo compartido y agrega productos a tu inventario
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/inventory')}
          className="px-4 py-2 border rounded-md hover:bg-muted"
        >
          Volver al Inventario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay productos disponibles</h3>
          <p className="mt-2 text-muted-foreground">
            Todos los productos del pool ya están en tu inventario.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {product.category}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio Sugerido</p>
                    <p className="text-lg font-bold text-primary">
                      ${Math.round(Number(product.suggestedPrice)).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </div>

                {product.brand && (
                  <p className="text-xs text-muted-foreground">
                    Marca: {product.brand}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Agregar a Inventario</h2>
            
            <div className="mb-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
              <p className="text-sm text-muted-foreground">Categoría: {selectedProduct.category}</p>
            </div>

            <form onSubmit={handleAddToInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio de Costo *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio de Venta *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ubicación en Almacén
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pasillo A, Estante 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notas Personalizadas
                </label>
                <textarea
                  rows={3}
                  placeholder="Información adicional..."
                  value={formData.customNotes}
                  onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedProduct(null)
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Agregando...
                    </span>
                  ) : (
                    'Agregar al Inventario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
