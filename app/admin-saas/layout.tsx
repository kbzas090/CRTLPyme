
/**
 * Layout para el módulo de Administrador SaaS
 * Solo accesible por usuarios con rol PROVEEDOR
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Building2,
  BarChart3,
  Users,
  Settings,
  Home,
  Shield,
  CreditCard,
  DollarSign,
  Package,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin-saas', icon: Home },
  { name: 'Tenants', href: '/admin-saas/tenants', icon: Building2 },
  { name: 'Suscripciones', href: '/admin-saas/subscriptions', icon: CreditCard },
  { name: 'Planes', href: '/admin-saas/plans', icon: Settings },
  { name: 'Ingresos', href: '/admin-saas/revenue', icon: DollarSign },
  { name: 'Productos Maestros', href: '/admin-saas/master-products', icon: Package },
  { name: 'Estadísticas', href: '/admin-saas/stats', icon: BarChart3 },
];

export default function AdminSaaSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'PROVEEDOR') {
      router.push('/admin/dashboard');
      return;
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'PROVEEDOR') {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-sm font-bold text-gray-900">CRTLPyme</h1>
            <p className="text-xs text-gray-500">Admin SaaS</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">CRTLPyme</h1>
              <p className="text-xs text-gray-500">Admin SaaS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrador SaaS</p>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">CRTLPyme</h1>
              <p className="text-xs text-gray-500">Admin SaaS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrador SaaS</p>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="mt-3 block w-full rounded-lg bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
