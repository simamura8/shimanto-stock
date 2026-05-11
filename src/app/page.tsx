import { Dashboard } from '@/components/Dashboard';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionHistory } from '@/components/TransactionHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50/20">
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-100"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            <h1 className="text-2xl font-bold tracking-wider">四万十・産直在庫管理</h1>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-emerald-800 rounded-full shadow-inner">
            DEMO
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">リアルタイム在庫</h2>
              <p className="text-slate-500 text-sm mt-1">在庫情報は自動的に更新されます</p>
            </div>
            <div className="flex gap-4">
              <TransactionModal type="IN" />
              <TransactionModal type="OUT" />
            </div>
          </div>
          <Dashboard />
        </section>

        <section className="pt-8 border-t border-emerald-100">
          <TransactionHistory />
        </section>
      </main>
    </div>
  );
}
