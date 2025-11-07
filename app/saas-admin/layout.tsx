/**
 * Layout for SaaS Admin Subscription Management Dashboard
 * Only accessible by users with PROVEEDOR role
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  BarChart3,
  Home,
  Shield,
  Users,
  DollarSign,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/saas-admin', icon: Home },
  { name: 'Suscripciones', href: '/saas-admin/subscriptions', icon: CreditCard },
  { name: 'Planes', href: '/saas-admin/plans', icon: Settings },
  { name: 'Ingresos', href: '/saas-admin/revenue', icon: DollarSign },
];

export default function SaaSAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'PROVEEDOR') {
      router.push('/dashboard');
      return;
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'PROVEEDOR') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CRTLPyme</h1>
              <p className="text-xs text-gray-500 font-medium">Gestión de Suscripciones</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="border-t border-gray-200 p-4 mb-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Panel de Control
              </p>
              <p className="text-sm text-gray-700">
                Sistema de gestión de suscripciones y planes para la plataforma CRTLPyme
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrador SaaS</p>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="block w-full rounded-lg bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
