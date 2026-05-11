'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type InventoryItem = {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  alert_threshold: number;
}

export function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id');
    if (data) setItems(data);
  };

  useEffect(() => {
    fetchInventory();

    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
        fetchInventory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map(item => {
        const isLowStock = item.current_stock < item.alert_threshold;
        return (
          <Card key={item.id} className={`border-l-4 shadow-sm transition-all hover:shadow-md ${isLowStock ? 'border-l-red-500 bg-red-50/50' : 'border-l-emerald-500 bg-emerald-50/30'}`}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex justify-between items-center whitespace-nowrap">
                {item.name}
                {isLowStock && <Badge variant="destructive" className="ml-2">品薄</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold text-slate-800">
                {item.current_stock} <span className="text-base font-normal text-slate-500">{item.unit}</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                アラート基準: {item.alert_threshold} {item.unit}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
