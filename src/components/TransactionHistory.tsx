'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TransactionHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [filterShop, setFilterShop] = useState<string>('all');

  const fetchHistory = async () => {
    let query = supabase
      .from('transactions')
      .select(`
        id, type, quantity, created_at,
        inventory ( name, unit ),
        shops ( id, name )
      `)
      .order('created_at', { ascending: false })
      .limit(30);

    if (filterShop !== 'all') {
      query = query.eq('shop_id', filterShop);
    }

    const { data } = await query;
    if (data) setHistory(data);
  };

  useEffect(() => {
    supabase.from('shops').select('*').then(({data}) => data && setShops(data));
  }, []);

  useEffect(() => {
    fetchHistory();
    const channel = supabase.channel('history_changes').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => {
      fetchHistory();
    }).subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [filterShop]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <CardTitle className="text-xl text-slate-800">直近の入出庫履歴</CardTitle>
        <Select value={filterShop} onValueChange={(val) => setFilterShop(val as string)}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="店舗で絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての店舗</SelectItem>
            {shops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[180px]">日時</TableHead>
                <TableHead>区分</TableHead>
                <TableHead>品目</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>店舗</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-slate-500">{new Date(t.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {t.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{t.inventory?.name}</TableCell>
                  <TableCell>{t.quantity} {t.inventory?.unit}</TableCell>
                  <TableCell className="text-slate-600">{t.shops?.name || '-'}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">履歴がありません</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
