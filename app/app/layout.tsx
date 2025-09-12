
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'POS SaaS Chile - Gestión Inteligente para PYMEs',
  description: 'Plataforma de punto de venta diseñada especialmente para pequeñas y medianas empresas chilenas. Gestiona inventario, ventas y alcanza tu punto de equilibrio.',
  keywords: 'POS Chile, punto de venta, PYME, inventario, gestión, ventas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
