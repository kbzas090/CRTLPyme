
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  icon: LucideIcon
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon,
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-600 mb-2">{subtitle}</p>
        )}
        {change && (
          <Badge 
            variant={change.type === 'positive' ? 'default' : change.type === 'negative' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {change.value}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
