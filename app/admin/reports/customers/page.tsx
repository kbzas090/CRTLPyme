
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
import { Download, RefreshCw, Users, TrendingUp, DollarSign } from 'lucide-react';
import BackButton from '@/components/admin/BackButton';

interface CustomersReport {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    totalRevenue: number;
    averageCustomerValue: number;
    averagePurchaseFrequency: number;
  };
  customers: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    totalPurchases: number;
    totalSpent: number;
    averageTicket: number;
    lastPurchaseDate: Date | null;
    daysSinceLastPurchase: number | null;
  }>;
  topCustomers: Array<{
    name: string;
    totalSpent: number;
    totalPurchases: number;
  }>;
  segments: {
    vip: { count: number; totalRevenue: number };
    regular: { count: number; totalRevenue: number };
    occasional: { count: number; totalRevenue: number };
    new: { count: number; totalRevenue: number };
  };
  atRiskCustomers: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function CustomersReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CustomersReport | null>(null);
  const [minPurchases, setMinPurchases] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      !['ADMIN', 'PROVEEDOR'].includes(session?.user?.role || '')
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
      const params = new URLSearchParams();
      if (minPurchases) {
        params.append('minPurchases', minPurchases);
      }

      const response = await fetch(`/api/reports/customers?${params}`);
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
        type: 'customers',
        format,
      });

      const response = await fetch(`/api/reports/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf';
        a.download = `reporte-clientes-${Date.now()}.${extension}`;
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

  const segmentData = [
    { name: 'VIP (>$100k)', value: report.segments.vip.count, revenue: report.segments.vip.totalRevenue },
    { name: 'Regular ($50-100k)', value: report.segments.regular.count, revenue: report.segments.regular.totalRevenue },
    { name: 'Ocasional ($10-50k)', value: report.segments.occasional.count, revenue: report.segments.occasional.totalRevenue },
    { name: 'Nuevo (<$10k)', value: report.segments.new.count, revenue: report.segments.new.totalRevenue },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton href="/admin/reports" label="Volver a Reportes" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reporte de Clientes</h1>
        <p className="text-gray-600">
          Conoce el comportamiento y valor de tus clientes
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
            <div>
              <Label htmlFor="minPurchases">Mínimo de compras</Label>
              <Input
                id="minPurchases"
                type="number"
                placeholder="Ej: 3"
                value={minPurchases}
                onChange={(e) => setMinPurchases(e.target.value)}
              />
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
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">compras en últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${report.summary.averageCustomerValue.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-muted-foreground">por cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Riesgo</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {report.atRiskCustomers}
            </div>
            <p className="text-xs text-muted-foreground">sin compras en 60+ días</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Segmentación de Clientes</CardTitle>
            <CardDescription>Por nivel de gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
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
            <CardTitle>Ingresos por Segmento</CardTitle>
            <CardDescription>Valor total por tipo de cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top 10 Mejores Clientes</CardTitle>
          <CardDescription>Por valor total de compras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">
                    {customer.totalPurchases} compras
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ${customer.totalSpent.toLocaleString('es-CL')}
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
