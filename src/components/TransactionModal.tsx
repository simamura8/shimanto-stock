'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type InventoryItem = { id: string; name: string; unit: string; current_stock: number; };
type Store = { id: string; name: string; };

export function TransactionModal({ type, onSuccess }: { type: 'IN' | 'OUT', onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from('inventory').select('id, name, unit, current_stock').order('id').then(({ data }) => data && setItems(data));
      if (type === 'OUT') {
        supabase.from('stores').select('id, name').order('id').then(({ data }) => data && setStores(data));
      }
    }
  }, [open, type]);

  const handleSubmit = async () => {
    if (!selectedItem || !quantity) return;
    if (type === 'OUT' && !selectedStore) return;
    
    setLoading(true);
    const numQty = parseFloat(quantity);
    
    const item = items.find(i => i.id === selectedItem);
    if (!item) return;

    const newStock = type === 'IN' ? item.current_stock + numQty : item.current_stock - numQty;

    try {
      await Promise.all([
        supabase.from('transactions').insert({
          item_id: selectedItem,
          store_id: type === 'OUT' ? selectedStore : null,
          type: type,
          quantity: numQty
        }),
        supabase.from('inventory').update({ current_stock: newStock }).eq('id', selectedItem)
      ]);
      setOpen(false);
      setSelectedItem('');
      setSelectedStore('');
      setQuantity('');
      if(onSuccess) onSuccess();
    } catch(e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className={`h-16 text-xl px-8 shadow-md hover:shadow-lg transition-all ${type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
          {type === 'IN' ? '入庫 (IN)' : '出庫 (OUT)'}
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">{type === 'IN' ? '入庫登録' : '出庫登録'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-lg font-medium text-slate-700">品目を選択</label>
            <Select value={selectedItem} onValueChange={(val) => setSelectedItem(val as string)}>
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder="野菜を選んでください" />
              </SelectTrigger>
              <SelectContent>
                {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {type === 'OUT' && (
            <div className="space-y-2">
              <label className="text-lg font-medium text-slate-700">卸先店舗を選択</label>
              <Select value={selectedStore} onValueChange={(val) => setSelectedStore(val as string)}>
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="店舗を選んでください" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-lg font-medium text-slate-700">数量を入力</label>
            <Input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              className="h-14 text-xl" 
              placeholder="0"
            />
          </div>

          <Button 
            className="w-full h-16 text-xl bg-slate-800 hover:bg-slate-900 text-white" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? '処理中...' : '登録する'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

