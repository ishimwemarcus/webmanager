import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Globe,
  Activity,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Database,
  CreditCard,
  AlertCircle,
  Cpu,
  Layers,
  Wallet,
  FileText,
  MessageSquare,
  Printer
} from 'lucide-react';
import { generateDailySummary, shareDailyReport, printThermalReport, printFullMasterReport } from '../utils/Reporter';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const store = useStore();
  const { t, L, lang } = useLanguage();
  const products = store.getProducts();
  const sales = store.getSales();
  const losses = store.getLosses ? store.getLosses() : [];
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];

  // Metrics Calculations
  const totalStockValue = products.reduce((s, p) => s + ((parseFloat(p.quantity) || 0) * (parseFloat(p.cost) || 0)), 0);
  const totalSales = sales.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalPaid = sales.reduce((s, r) => s + (parseFloat(r.paid) || 0), 0);
  
  // Decoupled Debt/Credit Logic: Avoid global cancellation
  const totalDebt = sales.reduce((s, r) => {
    const debt = Math.max(0, (parseFloat(r.amount) || 0) - (parseFloat(r.paid) || 0));
    return s + debt;
  }, 0);
  
  const totalLoss = losses.reduce((s, l) => s + (parseFloat(l.amount || l.valuation) || 0), 0);
  const totalCredit = waitCredits.reduce((s, w) => s + (parseFloat(w.balance) || 0), 0);
  
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
      const rev = sales.filter(s => s.date?.startsWith(ds)).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
      days.push({ name: dayName.toUpperCase(), revenue: rev });
    }
    return days;
  }, [sales, lang]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-navy-950 uppercase tracking-tighter bg-gradient-to-r from-navy-950 to-navy-700 bg-clip-text text-transparent">
                {L('Management Console View', 'Vue Console de Gestion')}
              </h1>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 {L('System Status: Active', 'Statut Système : Actif')}
              </div>
           </div>
           <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] italic opacity-60">
              {new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })} | {new Date().toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} GMT
           </p>
        </div>

         <div className="flex items-center gap-3">
            <button 
               onClick={() => {
                  const summary = generateDailySummary(sales, store.getExpenses(), store.getLedgerManual(), losses);
                  printFullMasterReport({
                     reportDate: new Date().toISOString().split('T')[0],
                     financials: summary.raw,
                     sales: sales.filter(s => s.date && s.date.startsWith(new Date().toISOString().split('T')[0])),
                     ledger: store.getLedgerManual().filter(l => l.date && l.date.startsWith(new Date().toISOString().split('T')[0])),
                     inventory: store.getProducts(),
                     shifts: store.getShifts ? store.getShifts().filter(s => s.start && s.start.startsWith(new Date().toISOString().split('T')[0])) : []
                  }, store.formatCurrency);
               }}
               className="flex items-center gap-2 px-6 py-4 bg-white border border-emerald-200 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
            >
               <Printer className="w-4 h-4" /> {L('Print Full Report', 'Imprimer Rapport Complet')}
            </button>
            <button 
               onClick={() => {
                  const summary = generateDailySummary(sales, store.getExpenses(), store.getLedgerManual(), losses);
                  shareDailyReport(summary.raw, store.formatCurrency);
               }}
               className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
               <MessageSquare className="w-4 h-4" /> {L('WhatsApp Report', 'Rapport WhatsApp')}
            </button>
            <div className="hidden lg:flex items-center gap-8 glass-card !p-4 bg-white border-emerald-100 group hover:border-emerald-500 transition-all shadow-sm">
               <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest italic">{L('Target Link (IP or Domain)', 'Lien Cible (IP ou Domaine)')}</p>
                  <p className="text-xs font-black text-navy-950 tracking-tighter">10.166.75.218</p>
               </div>
               <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4" />
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-1">
         <h2 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">{L('Overview', 'Vue d\'ensemble')}</h2>
         <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.5em] opacity-40 italic">{L('System Folders', 'Dossiers Système')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Metrics Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Total Assets */}
           <div className="glass-card bg-white p-6 rounded-[32px] border-emerald-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Database className="w-24 h-24" />
              </div>
              <div className="w-10 h-10 bg-navy-50 text-navy-950 rounded-xl flex items-center justify-center mb-4">
                 <Database className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-black text-blue-gray uppercase tracking-[0.2em] mb-2 italic">{L('Total Assets', 'Total des Actifs')}</p>
              <p className="text-3xl font-black text-navy-950 mb-4 tracking-tighter">{store.formatCurrency(totalStockValue)}</p>
              <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                 <ShieldCheck className="w-3 h-3" /> {L('Optimal Stock', 'Stock Optimal')}
              </div>
           </div>

           {/* Revenue Flow */}
           <div className="glass-card bg-white p-6 rounded-[32px] border-emerald-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="w-12 h-12 bg-navy-950 text-white rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-navy-950/20">
                 <Zap className="w-6 h-6" />
              </div>
              <p className="text-[9px] font-black text-blue-gray uppercase tracking-[0.2em] mb-2 italic">{L('Revenue Flow', 'Flux de Revenus')}</p>
              <p className="text-3xl font-black text-navy-950 mb-4 tracking-tighter">{store.formatCurrency(totalSales)}</p>
              <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-6">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                 {L('Inbound Stream Active', 'Flux Entrant Actif')}
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full px-6">
                 <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-100 text-left">
                    <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Adjust', 'Ajuster')}</p>
                    <p className="text-xs font-black text-navy-950">0.00 £</p>
                 </div>
                 <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-100 text-left">
                    <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Units', 'Unités')}</p>
                    <p className="text-xs font-black text-navy-950">{sales.length}</p>
                 </div>
              </div>
           </div>

           {/* Revenue Chart */}
           <div className="md:col-span-2 glass-card bg-white p-10 rounded-[48px] border-emerald-100 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-sm font-black text-navy-950 uppercase tracking-widest mb-1">{L('Revenue Growth', 'Croissance des Revenus')}</h3>
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest opacity-60 italic">{L('Progression over the last 7 days', 'Progression sur les 7 derniers jours')}</p>
                 </div>
                 <div className="flex items-center gap-2 text-navy-950 text-[10px] font-black uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" /> {L('Live Flow', 'Flux Direct')}
                 </div>
              </div>
              
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} 
                          dy={15}
                       />
                       <Tooltip 
                          cursor={{fill: 'transparent'}}
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-navy-950 text-white p-4 rounded-3xl shadow-2xl border border-white/10 animate-fade-in">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{payload[0].payload.name}</p>
                                      <p className="text-xl font-black">{store.formatCurrency(payload[0].value)}</p>
                                   </div>
                                );
                             }
                             return null;
                          }}
                       />
                       <Bar dataKey="revenue" radius={[12, 12, 12, 12]} barSize={40}>
                          {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 6 ? 'url(#barGradient)' : '#F1F5F9'} />
                          ))}
                       </Bar>
                       <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#10B981" />
                             <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                       </defs>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Sidebar Info Section */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Client Credit */}
           <div className="glass-card bg-white p-8 rounded-[40px] border-emerald-100 flex items-center gap-6 group hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                 <Clock className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Client Credit', 'Crédit Client')}</p>
                 <p className="text-2xl font-black text-navy-950">{store.formatCurrency(totalCredit)}</p>
                 <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Pending / {waitCredits.length} Nodes</p>
              </div>
           </div>

           {/* Unpaid Debt */}
           <div className="glass-card bg-white p-8 rounded-[40px] border-emerald-100 flex items-center gap-6 group hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                 <CreditCard className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Unpaid Debt', 'Dette Impayée')}</p>
                 <p className="text-2xl font-black text-navy-950">{store.formatCurrency(totalDebt)}</p>
                 <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Unsettled / 0 Actions</p>
              </div>
           </div>

           {/* Declare Loss */}
           <div className="glass-card bg-white p-8 rounded-[40px] border-emerald-100 flex items-center gap-6 group hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Declare a loss (Spoilage)', 'Déclarer une perte (Avarie)')}</p>
                 <p className="text-2xl font-black text-rose-600">{store.formatCurrency(totalLoss)}</p>
                 <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Total Loss Impact</p>
              </div>
           </div>

           {/* Intelligence Summary */}
           <div className="glass-card bg-navy-950 !p-10 rounded-[48px] border-none text-white relative overflow-hidden group">
              <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                       <Cpu className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 italic">{L('Intelligence Summary', 'Résumé de l\'Intelligence')}</p>
                 </div>
                 
                 <div className="space-y-6 flex-1">
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1 italic">{L('Total Billing', 'Total Facturation')}</p>
                       <p className="text-3xl font-black tracking-tighter">{store.formatCurrency(totalSales)}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1 italic">{L('Transaction Volume', 'Volume Transactions')}</p>
                       <p className="text-3xl font-black tracking-tighter">{sales.length}</p>
                    </div>
                 </div>

                 <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">MARC V4.5 Neural Core</p>
                    <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </div>

        </div>

      </div>

      {/* Actionable Ledger Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
         <div className="glass-card bg-white p-8 rounded-[48px] border-rose-50 shadow-sm group hover:border-rose-200 transition-all">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-navy-950 italic">{L('Top Debtors (Unpaid)', 'Top Débiteurs (Impayés)')}</p>
            </div>
            <div className="space-y-3">
               {sales.filter(s => (parseFloat(s.amount)||0) > (parseFloat(s.paid)||0)).slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-navy-50/50 rounded-2xl border border-navy-50 group-hover:bg-rose-50/10 transition-colors">
                     <div>
                        <p className="text-xs font-black text-navy-950 uppercase">{s.client || L('Standard Client', 'Client Standard')}</p>
                        <p className="text-[9px] font-black text-blue-gray uppercase opacity-60">{s.name}</p>
                     </div>
                     <p className="text-sm font-black text-rose-600">-{store.formatCurrency((parseFloat(s.amount)||0) - (parseFloat(s.paid)||0))}</p>
                  </div>
               ))}
               {sales.filter(s => (parseFloat(s.amount)||0) > (parseFloat(s.paid)||0)).length === 0 && (
                  <p className="text-[10px] text-center py-6 text-blue-gray uppercase font-black opacity-20 italic">{L('No active debt', 'Aucune dette active')}</p>
               )}
            </div>
         </div>

         <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-50 shadow-sm group hover:border-emerald-200 transition-all">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-navy-950 italic">{L('Top Credits (Balances)', 'Top Crédits (Reliquats)')}</p>
            </div>
            <div className="space-y-3">
               {waitCredits.filter(w => (parseFloat(w.balance)||0) > 0).slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-emerald-50/20 rounded-2xl border border-emerald-50 group-hover:bg-emerald-50/30 transition-colors">
                     <div>
                        <p className="text-xs font-black text-navy-950 uppercase">{w.client || L('Standard Client', 'Client Standard')}</p>
                        <p className="text-[9px] font-black text-blue-gray uppercase opacity-60">{new Date(w.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
                     </div>
                     <p className="text-sm font-black text-emerald-600">+{store.formatCurrency(w.balance)}</p>
                  </div>
               ))}
               {waitCredits.filter(w => (parseFloat(w.balance)||0) > 0).length === 0 && (
                  <p className="text-[10px] text-center py-6 text-blue-gray uppercase font-black opacity-20 italic">{L('No active credit', 'Aucun crédit actif')}</p>
               )}
            </div>
         </div>
      </div>

    </div>
  );
}
