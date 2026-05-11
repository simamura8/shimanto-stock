"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { StockDistributionChart } from "./StockDistributionChart"
import { Loader2 } from "lucide-react"

export function StockAnalysis() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStockData = async () => {
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select('name, current_stock')
        .gt('current_stock', 0) // 在庫があるものだけ

      if (inventoryData) {
        const formatted = inventoryData.map(item => ({
          name: item.name,
          value: Number(item.current_stock)
        }))
        setData(formatted)
      }
      setLoading(false)
    }

    fetchStockData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600 size-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockDistributionChart data={data} />
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-800 mb-4">在庫バランスの分析</h3>
          <p className="text-slate-600 leading-relaxed">
            現在、品目ごとの在庫比率は左のグラフの通りです。
            特定の品目に在庫が偏りすぎていないか、あるいは棚の占有率が適正かを確認してください。
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-xs text-emerald-600 font-bold uppercase">最多在庫</div>
              <div className="text-xl font-bold text-emerald-800 mt-1">
                {data.length > 0 ? [...data].sort((a,b) => b.value - a.value)[0].name : "---"}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-bold uppercase">管理品目数</div>
              <div className="text-xl font-bold text-slate-800 mt-1">{data.length} 品目</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
