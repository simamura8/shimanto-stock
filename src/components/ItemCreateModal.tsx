"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

export function ItemCreateModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // フォームの状態
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("個")
  const [alertThreshold, setAlertThreshold] = useState("0")
  const [category, setCategory] = useState("野菜")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert("品目名を入力してください")
      return
    }

    setLoading(true)
    
    try {
      // 1. 重複チェック
      const { data: existing } = await supabase
        .from('items')
        .select('id')
        .eq('name', name.trim())
        .single()

      if (existing) {
        alert("その品目名は既に登録されています")
        setLoading(false)
        return
      }

      // 2. 登録処理 (items テーブルへ挿入)
      const { error } = await supabase.from('items').insert([
        {
          name: name.trim(),
          unit,
          alert_threshold: parseInt(alertThreshold),
          category,
        },
      ])

      if (error) throw error

      alert("品目を登録しました")
      setOpen(false)
      // フォームをリセット
      setName("")
      setUnit("個")
      setAlertThreshold("0")
      setCategory("野菜")
      
      // 画面更新のためにリロード（本来はRealtimeで反映されますが、テーブル変更に伴い必要になる場合があります）
      window.location.reload()
      
    } catch (error: any) {
      alert("登録に失敗しました: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="flex items-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50">
          <PlusCircle className="size-4" />
          品目追加
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">新規品目登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">品目名 <span className="text-red-500">*</span></label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="例: ナス、四万十ひき肉" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">単位 <span className="text-red-500">*</span></label>
              <Select value={unit} onValueChange={(val) => setUnit(val as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="単位を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="個">個</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="パック">パック</SelectItem>
                  <SelectItem value="袋">袋</SelectItem>
                  <SelectItem value="束">束</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">アラート基準値</label>
              <Input 
                type="number" 
                min="0"
                value={alertThreshold} 
                onChange={(e) => setAlertThreshold(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">カテゴリ</label>
            <Select value={category} onValueChange={(val) => setCategory(val as string)}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="野菜">野菜</SelectItem>
                <SelectItem value="果物">果物</SelectItem>
                <SelectItem value="加工品">加工品</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? "保存中..." : "品目を保存する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
