
'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Breadcrumbs } from './Breadcrumbs'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  
  // Rutas que no necesitan layout
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        <Navbar />
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
}
