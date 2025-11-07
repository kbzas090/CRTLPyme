
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { AdminLayout } from '@/components/layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRTLPyme - Control Total para PYMEs',
  description: 'Sistema POS-SaaS completo para tiendas de abarrotes, kioscos y pequeños comercios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <AdminLayout>
            {children}
          </AdminLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
// Cache bust: 1759582656
