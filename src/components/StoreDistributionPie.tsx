"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface StoreData {
  name: string
  value: number
}

interface StoreDistributionPieProps {
  data: StoreData[]
}

const COLORS = ['#059669', '#34d399', '#fbbf24', '#f87171', '#818cf8', '#a78bfa']

export function StoreDistributionPie({ data }: StoreDistributionPieProps) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm italic">
        出荷データがありません
      </div>
    )
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${value}`, '合計出荷数']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
