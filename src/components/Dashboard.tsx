'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { StockTrendChart } from './StockTrendChart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type InventoryItem = {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  alert_threshold: number;
  category?: string;
}

type Transaction = {
  type: 'IN' | 'OUT';
  quantity: number;
  created_at: string;
}

export function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('id');
    if (data) setItems(data);
  };

  const fetchItemTransactions = async (itemId: string) => {
    const { data } = await supabase
      .from('transactions')
      .select('type, quantity, created_at')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setTransactions(data as Transaction[]);
  };

  useEffect(() => {
    fetchInventory();

    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        fetchInventory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCardClick = async (item: InventoryItem) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
    await fetchItemTransactions(item.id);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map(item => {
          const isLowStock = item.current_stock < item.alert_threshold;
          return (
            <Card 
              key={item.id} 
              className={`border-l-4 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:shadow-md ${isLowStock ? 'border-l-red-500 bg-red-50/50' : 'border-l-emerald-500 bg-emerald-50/30'}`}
              onClick={() => handleCardClick(item)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg flex justify-between items-center whitespace-nowrap">
                  {item.name}
                  {isLowStock && <Badge variant="destructive" className="ml-2">品薄</Badge>}
                </CardTitle>
                {item.category && <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.category}</div>}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-bold text-slate-800">
                  {item.current_stock} <span className="text-base font-normal text-slate-500">{item.unit}</span>
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                  基準: {item.alert_threshold} {item.unit}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[500px] w-full overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">{selectedItem.category || '野菜'}</Badge>
                </div>
                <SheetTitle className="text-3xl font-bold text-slate-800">{selectedItem.name} の詳細分析</SheetTitle>
              </SheetHeader>

              <div className="space-y-8">
                {/* 現在の状況 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border">
                    <div className="text-xs font-bold text-slate-400 uppercase">現在庫</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{selectedItem.current_stock} {selectedItem.unit}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border">
                    <div className="text-xs font-bold text-slate-400 uppercase">アラート基準</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{selectedItem.alert_threshold} {selectedItem.unit}</div>
                  </div>
                </div>

                {/* 推移グラフ */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    直近の在庫推移
                  </h3>
                  <div className="bg-white p-4 rounded-xl border">
                    {transactions.length > 0 ? (
                      <StockTrendChart 
                        currentStock={selectedItem.current_stock} 
                        transactions={transactions} 
                        unit={selectedItem.unit}
                      />
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm italic">
                        十分な取引履歴がありません
                      </div>
                    )}
                  </div>
                </div>

                {/* 直近の動き */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    直近の取引履歴 (30件)
                  </h3>
                  <div className="space-y-2">
                    {transactions.map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg text-sm shadow-sm">
                        <div className="flex items-center gap-3">
                          <Badge className={t.type === 'IN' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none'}>
                            {t.type}
                          </Badge>
                          <span className="font-bold text-slate-700">{t.quantity} {selectedItem.unit}</span>
                        </div>
                        <span className="text-slate-400 text-xs">{new Date(t.created_at).toLocaleString('ja-JP')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

