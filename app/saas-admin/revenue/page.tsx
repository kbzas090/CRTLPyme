/**
 * SaaS Admin - Revenue Page
 * Displays revenue metrics, trends, and analytics
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Pie, PieChart, Cell } from 'recharts';

interface RevenueData {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  planRevenue: Array<{
    plan: string;
    revenue: number;
  }>;
  totalRevenue: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [months, setMonths] = useState<number>(6);

  useEffect(() => {
    loadRevenueData();
  }, [months]);

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/saas/revenue?months=${months}`);
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
  };

  const calculateGrowth = () => {
    if (!revenueData || revenueData.monthlyRevenue.length < 2) return 0;
    const current = revenueData.monthlyRevenue[revenueData.monthlyRevenue.length - 1].revenue;
    const previous = revenueData.monthlyRevenue[revenueData.monthlyRevenue.length - 2].revenue;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const averageMonthlyRevenue = revenueData 
    ? revenueData.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0) / revenueData.monthlyRevenue.length
    : 0;

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Análisis de Ingresos
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Métricas y tendencias de ingresos de suscripciones
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={months.toString()} onValueChange={(value) => setMonths(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Últimos 12 meses</SelectItem>
              <SelectItem value="24">Últimos 24 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadRevenueData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !revenueData ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            No hay datos de ingresos disponibles
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ingresos Totales
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(revenueData.totalRevenue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Últimos {months} meses
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Promedio Mensual
                </CardTitle>
                <Calendar className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(averageMonthlyRevenue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresos promedio por mes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Crecimiento
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${calculateGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateGrowth() >= 0 ? '+' : ''}{calculateGrowth().toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  vs. mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos Mensuales</CardTitle>
              <CardDescription>
                Evolución de ingresos por suscripciones en los últimos {months} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonthLabel}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Ingresos']}
                      labelFormatter={formatMonthLabel}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Ingresos"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Plan */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Plan</CardTitle>
                <CardDescription>
                  Distribución de ingresos según cada plan de suscripción
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueData.planRevenue}
                        dataKey="revenue"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.plan}: ${formatCurrency(entry.revenue)}`}
                      >
                        {revenueData.planRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparación por Plan</CardTitle>
                <CardDescription>
                  Ingresos totales generados por cada plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.planRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="plan" stroke="#6b7280" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Ingresos']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="revenue" name="Ingresos">
                        {revenueData.planRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle Mensual</CardTitle>
              <CardDescription>
                Tabla detallada de ingresos por mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left font-semibold text-gray-700">Mes</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Ingresos</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.monthlyRevenue.map((item, index) => {
                      const previousRevenue = index > 0 ? revenueData.monthlyRevenue[index - 1].revenue : 0;
                      const change = previousRevenue > 0 
                        ? ((item.revenue - previousRevenue) / previousRevenue) * 100 
                        : 0;

                      return (
                        <tr key={item.month} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatMonthLabel(item.month)}
                            </div>
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {formatCurrency(item.revenue)}
                          </td>
                          <td className="p-3 text-right">
                            {index > 0 && (
                              <span className={`inline-flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
