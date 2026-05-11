import { Dashboard } from '@/components/Dashboard';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionHistory } from '@/components/TransactionHistory';
import { ItemCreateModal } from '@/components/ItemCreateModal';
import { StoreCreateModal } from '@/components/StoreCreateModal';
import { StockAnalysis } from '@/components/StockAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, PieChart } from "lucide-react";

export default function Home() {
  return (
    <Tabs defaultValue="inventory" className="flex flex-col min-h-screen bg-emerald-50/20 pb-12">
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-100"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              <h1 className="text-xl font-bold tracking-wider">しまんと在庫くん</h1>
            </div>
            
            <TabsList className="bg-emerald-800/40 p-1 h-10 gap-1 rounded-xl border-none shadow-inner">
              <TabsTrigger 
                value="inventory" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-emerald-100 hover:text-white"
              >
                <LayoutGrid className="size-3.5" />
                在庫一覧
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-emerald-100 hover:text-white"
              >
                <PieChart className="size-3.5" />
                在庫分析
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-4">
             <StoreCreateModal />
             <ItemCreateModal />
             <div className="text-sm font-medium px-3 py-1 bg-emerald-800 rounded-full shadow-inner">DEMO</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TabsContent value="inventory" className="space-y-10 outline-none">
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">リアルタイム在庫</h2>
                <p className="text-slate-500 text-sm mt-2">カードをクリックすると詳細な推移グラフが表示されます</p>
              </div>
              <div className="flex gap-3">
                <TransactionModal type="IN" />
                <TransactionModal type="OUT" />
              </div>
            </div>
            <Dashboard />
          </section>

          <section className="pt-8 border-t border-emerald-100">
            <TransactionHistory />
          </section>
        </TabsContent>

        <TabsContent value="analysis" className="outline-none">
          <StockAnalysis />
        </TabsContent>
      </main>
    </Tabs>
  );
}

