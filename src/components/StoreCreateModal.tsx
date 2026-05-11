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
import { Store, MapPin } from "lucide-react"

export function StoreCreateModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert("店舗名を入力してください")
      return
    }

    setLoading(true)
    
    try {
      // 重複チェック
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('name', name.trim())
        .single()

      if (existing) {
        alert("その店舗名は既に登録されています")
        setLoading(false)
        return
      }

      // 登録処理
      const { error } = await supabase.from('stores').insert([
        {
          name: name.trim(),
          location: location.trim(),
        },
      ])

      if (error) throw error

      alert("店舗を登録しました")
      setOpen(false)
      setName("")
      setLocation("")
      
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
        <Button variant="outline" className="flex items-center gap-2 border-slate-600 text-slate-700 hover:bg-slate-50">
          <Store className="size-4" />
          取引先追加
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">新規取引先登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">店舗名 <span className="text-red-500">*</span></label>
            <div className="relative">
              <Store className="absolute left-3 top-3 size-4 text-slate-400" />
              <Input 
                className="pl-9"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="例: 道の駅 四万十、〇〇スーパー" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">所在地</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 size-4 text-slate-400" />
              <Input 
                className="pl-9"
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="例: 四万十市〇〇町" 
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-900 text-white"
              disabled={loading}
            >
              {loading ? "保存中..." : "店舗を保存する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
