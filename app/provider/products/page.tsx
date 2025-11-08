/**
 * Alias page for provider products - redirects to admin-saas master-products
 * This provides backward compatibility and cleaner URL structure
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProviderProductsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin-saas/master-products')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
