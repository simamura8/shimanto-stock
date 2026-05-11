"use client"

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'

interface Transaction {
  type: 'IN' | 'OUT'
  quantity: number
  created_at: string
}

interface StockTrendChartProps {
  currentStock: number
  transactions: Transaction[]
  unit: string
}

export function StockTrendChart({ currentStock, transactions, unit }: StockTrendChartProps) {
  const chartData = useMemo(() => {
    // 履歴を時間順（古い順）にソート
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // 現在から遡って在庫推移を計算する
    // dataPoints[n] = { time: T, stock: S }
    // 最後のポイントは「現在」の在庫
    let runningStock = currentStock
    const points = []

    // 現在のポイントを追加
    points.push({
      time: '現在',
      stock: runningStock
    })

    // 新しい順に取引を処理して、過去の在庫を算出
    const reversed = [...sorted].reverse()
    for (const t of reversed) {
      // 直前の在庫 = 今の在庫 - (入庫量) or + (出庫量)
      if (t.type === 'IN') {
        runningStock -= t.quantity
      } else {
        runningStock += t.quantity
      }
      
      points.push({
        time: format(parseISO(t.created_at), 'MM/dd HH:mm'),
        stock: runningStock
      })
    }

    // グラフ表示用に古い順に戻す
    return points.reverse()
  }, [currentStock, transactions])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b' }}
            width={30}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`${value} ${unit}`, '在庫数']}
          />
          <Line 
            type="monotone" 
            dataKey="stock" 
            stroke="#059669" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
