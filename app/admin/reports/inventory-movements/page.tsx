
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
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
  LineChart,
  Line,
} from 'recharts';
import { Download, RefreshCw, TrendingUp, Package, ArrowUpDown } from 'lucide-react';
import BackButton from '@/components/admin/BackButton';

interface InventoryMovementsReport {
  summary: {
    totalMovements: number;
    entriesCount: number;
    exitsCount: number;
    adjustmentsCount: number;
    totalEntryQuantity: number;
    totalExitQuantity: number;
    netChange: number;
  };
  movementsByType: Array<{
    type: string;
    count: number;
    totalQuantity: number;
  }>;
  movementsByDay: Array<{
    date: string;
    entries: number;
    exits: number;
    adjustments: number;
    total: number;
  }>;
  movementsByUser: Array<{
    user: string;
    count: number;
  }>;
  topProducts: Array<{
    product: string;
    entries: number;
    exits: number;
    adjustments: number;
    totalQuantity: number;
  }>;
  rawMovements: Array<{
    id: string;
    type: string;
    quantity: number;
    reason: string | null;
    notes: string | null;
    productName: string;
    productSku: string;
    userName: string;
    createdAt: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Ajuste',
};

export default function InventoryMovementsReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InventoryMovementsReport | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [movementType, setMovementType] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && !['ADMIN', 'PROVEEDOR'].includes(session?.user?.role || '')) {
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
        startDate,
        endDate,
      });

      if (movementType !== 'all') {
        params.append('type', movementType);
      }

      const response = await fetch(`/api/reports/inventory-movements?${params}`);
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

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        type: 'inventory-movements',
        format,
        startDate,
        endDate,
      });

      if (movementType !== 'all') {
        params.append('movementType', movementType);
      }

      const response = await fetch(`/api/reports/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf';
        a.download = `reporte-movimientos-inventario-${Date.now()}.${extension}`;
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
        <h1 className="text-3xl font-bold mb-2">Reporte de Movimientos de Inventario</h1>
        <p className="text-gray-600">
          Analiza las entradas, salidas y ajustes de tu inventario
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Personaliza el período y tipo de movimiento del reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="movementType">Tipo de Movimiento</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ENTRY">Entradas</SelectItem>
                  <SelectItem value="EXIT">Salidas</SelectItem>
                  <SelectItem value="ADJUSTMENT">Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={fetchReport} disabled={loading} className="flex-1">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.totalMovements}</div>
            <p className="text-xs text-muted-foreground">
              movimientos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{report.summary.totalEntryQuantity}
            </div>
            <p className="text-xs text-muted-foreground">
              {report.summary.entriesCount} movimientos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{report.summary.totalExitQuantity}
            </div>
            <p className="text-xs text-muted-foreground">
              {report.summary.exitsCount} movimientos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cambio Neto</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {report.summary.netChange >= 0 ? '+' : ''}{report.summary.netChange}
            </div>
            <p className="text-xs text-muted-foreground">
              unidades en el período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Movimientos por Día</CardTitle>
            <CardDescription>Evolución diaria de los movimientos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.movementsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entries" stroke="#10b981" name="Entradas" />
                <Line type="monotone" dataKey="exits" stroke="#ef4444" name="Salidas" />
                <Line type="monotone" dataKey="adjustments" stroke="#f59e0b" name="Ajustes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Movimiento</CardTitle>
            <CardDescription>Distribución por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.movementsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) =>
                    `${type}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {report.movementsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Productos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top 10 Productos con Más Movimientos</CardTitle>
          <CardDescription>Productos con mayor actividad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium">{product.product}</p>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span className="text-green-600">↑ {product.entries} entradas</span>
                    <span className="text-red-600">↓ {product.exits} salidas</span>
                    <span className="text-yellow-600">± {product.adjustments} ajustes</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {product.totalQuantity}
                  </p>
                  <p className="text-xs text-gray-500">movimientos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Movimientos Recientes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>Últimos movimientos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Producto</th>
                  <th className="text-left py-2 px-2">SKU</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-right py-2 px-2">Cantidad</th>
                  <th className="text-left py-2 px-2">Usuario</th>
                  <th className="text-left py-2 px-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {report.rawMovements.slice(0, 20).map((movement) => (
                  <tr key={movement.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">
                      {format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="py-2 px-2">{movement.productName}</td>
                    <td className="py-2 px-2 font-mono text-xs">{movement.productSku}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        movement.type === 'ENTRY' ? 'bg-green-100 text-green-800' :
                        movement.type === 'EXIT' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {MOVEMENT_TYPE_LABELS[movement.type]}
                      </span>
                    </td>
                    <td className={`py-2 px-2 text-right font-semibold ${
                      movement.type === 'ENTRY' ? 'text-green-600' :
                      movement.type === 'EXIT' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {movement.type === 'ENTRY' ? '+' : movement.type === 'EXIT' ? '-' : '±'}
                      {Math.abs(movement.quantity)}
                    </td>
                    <td className="py-2 px-2">{movement.userName}</td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {movement.reason || movement.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
