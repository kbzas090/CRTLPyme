/**
 * Página de gestión de productos maestros (catálogo compartido)
 * Solo accesible por usuarios con rol PROVEEDOR
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'

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
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function MasterProductsPage() {
  const [products, setProducts] = useState<MasterProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        activeOnly: 'true',
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/admin-saas/master-products?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar productos maestros')
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
          <h1 className="text-3xl font-bold">Productos Maestros</h1>
          <p className="text-muted-foreground">
            Catálogo compartido de productos disponible para todos los tenants
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => alert('Funcionalidad de crear producto en desarrollo')}
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Precio Promedio</p>
              <p className="text-2xl font-bold">
                ${products.length > 0 
                  ? Math.round(products.reduce((sum, p) => sum + Number(p.suggestedPrice), 0) / products.length)
                  : 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o código de barras..."
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

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay productos</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedCategory !== 'all'
              ? 'No se encontraron productos con los filtros aplicados.'
              : 'Comienza agregando tu primer producto maestro.'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Marca</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Precio Sugerido</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Unidad</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-mono">{product.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.barcode && (
                          <div className="text-xs text-muted-foreground">
                            EAN: {product.barcode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{product.brand || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ${Number(product.suggestedPrice).toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{product.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert('Editar producto: ' + product.id)}
                          className="p-2 hover:bg-muted rounded-md"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este producto?')) {
                              alert('Eliminar producto: ' + product.id)
                            }
                          }}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-md"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
