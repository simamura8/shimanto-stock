"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { StockDistributionChart } from "./StockDistributionChart"
import { Loader2, Store, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StockAnalysis() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [stores, setStores] = useState<{ id: string; name: string; location: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStockData = async () => {
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('name, current_stock')
      .gt('current_stock', 0)

    if (inventoryData) {
      const formatted = inventoryData.map(item => ({
        name: item.name,
        value: Number(item.current_stock)
      }))
      setData(formatted)
    }
  }

  const fetchStores = async () => {
    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .order('name')
    if (storeData) setStores(storeData)
  }

  const handleDeleteStore = async (id: string, name: string) => {
    if (!confirm(`店舗「${name}」を削除してもよろしいですか？関連する取引履歴の表示に影響が出る場合があります。`)) return

    try {
      const { error } = await supabase.from('stores').delete().eq('id', id)
      if (error) throw error
      fetchStores()
    } catch (e: any) {
      alert("削除に失敗しました: " + e.message)
    }
  }

  useEffect(() => {
    Promise.all([fetchStockData(), fetchStores()]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600 size-8" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </section>

      {/* 店舗管理セクション */}
      <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex items-center gap-2">
          <Store className="size-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-800">取引先（店舗）管理</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 font-medium">
                <th className="px-6 py-3">店舗名</th>
                <th className="px-6 py-3">所在地</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{store.name}</td>
                  <td className="px-6 py-4 text-slate-500">{store.location || '---'}</td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      onClick={() => handleDeleteStore(store.id, store.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">
                    登録されている店舗はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

