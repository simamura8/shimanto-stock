'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { StockTrendChart } from './StockTrendChart';
import { StoreDistributionPie } from './StoreDistributionPie';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, Calendar, TrendingUp, Package, MapPin } from "lucide-react";

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

// 年別フィルターの選択肢を生成（今年から過去10年 + 全期間）
function buildYearOptions(): { key: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const options: { key: string; label: string }[] = [];
  for (let y = currentYear; y >= currentYear - 9; y--) {
    options.push({ key: `y${y}`, label: `${y}年` });
  }
  options.push({ key: 'all', label: '全期間' });
  return options;
}

const YEAR_OPTIONS = buildYearOptions();

export function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('all');

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

    const now = new Date();

    if (range.startsWith('y')) {
      // 年フィルター: y2026, y2025, ...
      const year = parseInt(range.slice(1));
      const from = new Date(year, 0, 1);
      const to = new Date(year + 1, 0, 1);
      query = query.gte('created_at', from.toISOString()).lt('created_at', to.toISOString());
    }
    // 'all' の場合はフィルターなし

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
    setIsDialogOpen(true);
    setTimeRange('all');
    await fetchItemTransactions(item.id, 'all');
  };

  const handleRangeChange = async (range: string) => {
    if (!selectedItem) return;
    setTimeRange(range);
    await fetchItemTransactions(selectedItem.id, range);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    if (!confirm(`「${selectedItem.name}」を削除してもよろしいですか？`)) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      alert("削除しました");
      setIsDialogOpen(false);
      fetchInventory();
    } catch (e: any) {
      alert("削除に失敗しました: " + e.message);
    }
  };

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[95vw] w-[95vw] h-[95vh] p-8 flex flex-col overflow-hidden">
          {selectedItem && (
            <>
              <DialogHeader className="flex flex-row items-center justify-between border-b pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl">
                    <Package className="size-8 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-none">{selectedItem.category || '野菜'}</Badge>
                      <span className="text-slate-400 text-sm">ID: {selectedItem.id.slice(0,8)}</span>
                    </div>
                    <DialogTitle className="text-4xl font-black text-slate-800">{selectedItem.name}</DialogTitle>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
                    <Calendar className="size-4 text-slate-500" />
                    <select
                      value={timeRange}
                      onChange={(e) => handleRangeChange(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-2 py-1"
                    >
                      {YEAR_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl shrink-0" onClick={handleDeleteItem}>
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                  {/* 左側：メイングラフ */}
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="border shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <TrendingUp className="size-4 text-emerald-600" />
                          在庫推移チャート
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8">
                        {transactions.length > 0 ? (
                          <StockTrendChart 
                            currentStock={selectedItem.current_stock} 
                            transactions={transactions} 
                            unit={selectedItem.unit}
                          />
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-slate-400 italic">
                            データが不足しています
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                      <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-sm font-bold">取引履歴ログ</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-white border-b shadow-sm z-10">
                              <tr className="text-slate-500 font-medium">
                                <th className="px-4 py-3">日付</th>
                                <th className="px-4 py-3">種別</th>
                                <th className="px-4 py-3">数量</th>
                                <th className="px-4 py-3">取引先</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {transactions.map((t, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(t.created_at).toLocaleString('ja-JP')}</td>
                                  <td className="px-4 py-3">
                                    <Badge className={t.type === 'IN' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none'}>
                                      {t.type === 'IN' ? '入庫' : '出庫'}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 font-bold text-slate-700">{t.quantity} {selectedItem.unit}</td>
                                  <td className="px-4 py-3 text-slate-500 text-xs flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {t.stores?.name || t.shops?.name || '---'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 右側：サブ分析 */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                        <div className="text-xs font-bold opacity-80 uppercase tracking-widest">現在庫</div>
                        <div className="text-4xl font-black mt-2">{selectedItem.current_stock} <span className="text-lg font-normal opacity-80">{selectedItem.unit}</span></div>
                      </div>
                      <div className="p-6 rounded-2xl bg-white border shadow-sm">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">アラート基準</div>
                        <div className="text-3xl font-black text-slate-800 mt-2">{selectedItem.alert_threshold} <span className="text-lg font-normal text-slate-400">{selectedItem.unit}</span></div>
                      </div>
                    </div>

                    <Card className="border shadow-sm">
                      <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          店舗別出荷比率
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <StoreDistributionPie data={storeDistribution} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}



