
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, RefreshCw, Package, TrendingUp, AlertCircle } from 'lucide-react';
import BackButton from '@/components/admin/BackButton';

interface ProductsReport {
  summary: {
    totalProducts: number;
    totalInventoryValue: number;
    totalRevenue: number;
    outOfStock: number;
    lowStock: number;
    averageProductValue: number;
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    stockStatus: string;
    costPrice: number;
    salePrice: number;
    profitMargin: number;
    totalSold: number;
    totalRevenue: number;
    inventoryValue: number;
  }>;
  productsByCategory: Array<{
    category: string;
    count: number;
    totalValue: number;
    totalRevenue: number;
  }>;
  topSellingProducts: Array<{
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductsReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ProductsReport | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      !['ADMIN', 'INVENTARIO', 'PROVEEDOR'].includes(session?.user?.role || '')
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReport();
    }
  }, [status]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lowStock: lowStockOnly.toString(),
      });

      const response = await fetch(`/api/reports/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReport(data);
      } else {
        alert('Error al cargar el reporte: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const params = new URLSearchParams({
        type: 'products',
        format,
      });

      const response = await fetch(`/api/reports/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-productos-${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al exportar el reporte');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error al exportar el reporte');
    }
  };

  if (status === 'loading' || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton href="/admin/reports" label="Volver a Reportes" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reporte de Productos</h1>
        <p className="text-gray-600">
          Analiza el inventario y rendimiento de tus productos
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Personaliza la visualización del reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lowStock"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="lowStock">Solo productos con stock bajo</Label>
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">productos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${report.summary.totalInventoryValue.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-muted-foreground">al costo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {report.summary.lowStock}
            </div>
            <p className="text-xs text-muted-foreground">productos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {report.summary.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">productos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos por Categoría</CardTitle>
            <CardDescription>Distribución del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.productsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {report.productsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor por Categoría</CardTitle>
            <CardDescription>Valor total del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.productsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalValue" fill="#8884d8" name="Valor Inventario" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Productos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
          <CardDescription>Productos con mayor rotación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.topSellingProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.totalSold} unidades vendidas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ${product.totalRevenue.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exportación */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Reporte</CardTitle>
          <CardDescription>
            Descarga el reporte completo en el formato que prefieras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Descargar CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
