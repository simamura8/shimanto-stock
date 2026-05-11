"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataItem {
  name: string
  value: number
}

interface StockDistributionChartProps {
  data: DataItem[]
}

const COLORS = [
  '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
  '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4',
  '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'
]

export function StockDistributionChart({ data }: StockDistributionChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-800">在庫比率（全体バランス）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} 単位`, '在庫数']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          
          {/* 中央の合計表示 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-slate-400 text-sm">合計在庫</div>
            <div className="text-3xl font-bold text-emerald-700">{total}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
