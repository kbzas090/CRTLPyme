
'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const Chart = dynamic(() => Promise.resolve(() => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={mockSalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <XAxis 
        dataKey="day" 
        tick={{ fontSize: 10 }} 
        tickLine={false}
      />
      <YAxis 
        tick={{ fontSize: 10 }} 
        tickLine={false}
        label={{ value: 'Ventas (CLP)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
      />
      <Tooltip 
        contentStyle={{ fontSize: 11 }}
        labelStyle={{ fontSize: 11 }}
      />
      <Legend 
        verticalAlign="top" 
        wrapperStyle={{ fontSize: 11 }}
      />
      <Line 
        type="monotone" 
        dataKey="ventas" 
        stroke="#60B5FF" 
        strokeWidth={2}
        dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
        name="Ventas Diarias"
      />
    </LineChart>
  </ResponsiveContainer>
)), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
})

const mockSalesData = [
  { day: 'Lun', ventas: 125000 },
  { day: 'Mar', ventas: 185000 },
  { day: 'Mié', ventas: 165000 },
  { day: 'Jue', ventas: 195000 },
  { day: 'Vie', ventas: 285000 },
  { day: 'Sáb', ventas: 325000 },
  { day: 'Dom', ventas: 205000 },
]

export function SalesChart() {
  return (
    <div className="h-[300px] w-full">
      <Chart />
    </div>
  )
}
