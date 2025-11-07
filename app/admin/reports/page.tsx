
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Package,
  Users,
  Download,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && !['ADMIN', 'PROVEEDOR'].includes(session?.user?.role || '')) {
      router.push('/');
    }
  }, [status, session, router]);

  const reportTypes = [
    {
      title: 'Reportes de Ventas',
      description: 'Analiza tus ventas por período, cajero y método de pago',
      icon: ShoppingCart,
      href: '/admin/reports/sales',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Reportes de Productos',
      description: 'Visualiza el rendimiento de tus productos e inventario',
      icon: Package,
      href: '/admin/reports/products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Reportes de Clientes',
      description: 'Conoce el comportamiento de compra de tus clientes',
      icon: Users,
      href: '/admin/reports/customers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Centro de Reportería</h1>
        <p className="text-gray-600">
          Genera y exporta reportes detallados de tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={report.href}>
                  <Button className="w-full">
                    Ver Reportes
                    <BarChart3 className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Exportación de Reportes</CardTitle>
          <CardDescription>
            Todos los reportes pueden ser exportados en formato Excel o CSV para su análisis externo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Download className="w-8 h-8 text-gray-400" />
            <div>
              <h3 className="font-semibold">Formatos disponibles</h3>
              <p className="text-sm text-gray-600">
                Excel (.xlsx) • CSV (.csv)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
