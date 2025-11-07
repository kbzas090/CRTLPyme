
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function BackButton({ href, label = 'Volver', variant = 'ghost' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button onClick={handleClick} variant={variant} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
