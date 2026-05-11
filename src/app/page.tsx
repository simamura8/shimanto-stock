import { Dashboard } from '@/components/Dashboard';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionHistory } from '@/components/TransactionHistory';
import { ItemCreateModal } from '@/components/ItemCreateModal';
import { StoreCreateModal } from '@/components/StoreCreateModal';
import { StockAnalysis } from '@/components/StockAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50/20 pb-12">
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-100"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            <h1 className="text-2xl font-bold tracking-wider">四万十・産直在庫管理</h1>
          </div>
          <div className="flex items-center gap-4">
             <StoreCreateModal />
             <ItemCreateModal />
             <div className="text-sm font-medium px-3 py-1 bg-emerald-800 rounded-full shadow-inner">DEMO</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <TabsList className="bg-emerald-100/50">
              <TabsTrigger value="inventory" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">在庫一覧</TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">在庫分析</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <TransactionModal type="IN" />
              <TransactionModal type="OUT" />
            </div>
          </div>

          <TabsContent value="inventory" className="space-y-10 outline-none">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">リアルタイム在庫</h2>
                <p className="text-slate-500 text-sm mt-1">カードをクリックすると詳細な推移グラフが表示されます</p>
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
        </Tabs>
      </main>
    </div>
  );
}

