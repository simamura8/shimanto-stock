'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { StockTrendChart } from './StockTrendChart';
import { StoreDistributionPie } from './StoreDistributionPie';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Trash2, Calendar } from "lucide-react";

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
  shops?: { name: string };
  stores?: { name: string };
}

export function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '1y' | 'all'>('all');

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('id');
    if (data) setItems(data);
  };

  const fetchItemTransactions = async (itemId: string, range: string) => {
    let query = supabase
      .from('transactions')
      .select(`
        type, 
        quantity, 
        created_at,
        shops ( name ),
        stores ( name )
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    // 期間フィルターの適用
    const now = new Date();
    if (range === '1m') {
      const date = new Date();
      date.setMonth(now.getMonth() - 1);
      query = query.gte('created_at', date.toISOString());
    } else if (range === '3m') {
      const date = new Date();
      date.setMonth(now.getMonth() - 3);
      query = query.gte('created_at', date.toISOString());
    } else if (range === '1y') {
      const date = new Date();
      date.setFullYear(now.getFullYear() - 1);
      query = query.gte('created_at', date.toISOString());
    }

    const { data } = await query;
    if (data) setTransactions(data as any[]);
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
    setTimeRange('all');
    await fetchItemTransactions(item.id, 'all');
  };

  const handleRangeChange = async (range: '1m' | '3m' | '1y' | 'all') => {
    if (!selectedItem) return;
    setTimeRange(range);
    await fetchItemTransactions(selectedItem.id, range);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    if (!confirm(`「${selectedItem.name}」を削除してもよろしいですか？取引履歴も影響を受ける可能性があります。`)) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      alert("削除しました");
      setIsSheetOpen(false);
      fetchInventory();
    } catch (e: any) {
      alert("削除に失敗しました: " + e.message);
    }
  };

  // 店舗別の集計データ作成
  const storeDistribution = useMemo(() => {
    const outs = transactions.filter(t => t.type === 'OUT');
    const totals: Record<string, number> = {};
    
    outs.forEach(t => {
      const storeName = t.stores?.name || t.shops?.name || '不明な店舗';
      totals[storeName] = (totals[storeName] || 0) + Number(t.quantity);
    });

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions]);

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
        <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader className="mb-6 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">{selectedItem.category || '野菜'}</Badge>
                  </div>
                  <SheetTitle className="text-3xl font-bold text-slate-800">{selectedItem.name} の詳細分析</SheetTitle>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 transition-colors" onClick={handleDeleteItem}>
                  <Trash2 className="size-5" />
                </Button>
              </SheetHeader>

              <div className="space-y-8">
                {/* 期間選択フィルター */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                  <Calendar className="size-4 text-slate-500 mx-2" />
                  {(['1m', '3m', '1y', 'all'] as const).map((range) => (
                    <Button 
                      key={range}
                      variant={timeRange === range ? "default" : "ghost"}
                      size="sm"
                      className={`text-xs px-3 h-8 ${timeRange === range ? 'bg-emerald-600' : 'text-slate-600'}`}
                      onClick={() => handleRangeChange(range)}
                    >
                      {range === '1m' ? '1ヶ月' : range === '3m' ? '3ヶ月' : range === '1y' ? '1年' : '総合'}
                    </Button>
                  ))}
                </div>

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
                    在庫推移
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
                        指定期間の取引履歴がありません
                      </div>
                    )}
                  </div>
                </div>

                {/* 店舗別比率グラフ */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    店舗別・出荷比率
                  </h3>
                  <div className="bg-white p-4 rounded-xl border">
                    <StoreDistributionPie data={storeDistribution} />
                  </div>
                </div>

                {/* 直近の動き */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    履歴
                  </h3>
                  <div className="space-y-2">
                    {transactions.slice(0, 10).map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg text-sm shadow-sm">
                        <div className="flex items-center gap-3">
                          <Badge className={t.type === 'IN' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none'}>
                            {t.type}
                          </Badge>
                          <span className="font-bold text-slate-700">{t.quantity} {selectedItem.unit}</span>
                          <span className="text-slate-400 text-xs">{t.stores?.name || t.shops?.name || ''}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{new Date(t.created_at).toLocaleString('ja-JP')}</span>
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


