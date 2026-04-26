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
  Cpu
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const store = useStore();
  const { t } = useLanguage();
  const products = store.getProducts();
  const sales = store.getSales();
  const losses = store.getLosses ? store.getLosses() : [];
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];

  // Metrics Calculations
  const totalStockValue = products.reduce((s, p) => s + ((p.quantity || 0) * (parseFloat(p.cost) || 0)), 0);
  const totalSales = sales.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalPaid = sales.reduce((s, r) => s + (parseFloat(r.paid) || 0), 0);
  const totalDebt = Math.max(0, totalSales - totalPaid);
  const totalLoss = losses.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  const totalCredit = waitCredits.reduce((s, w) => s + (parseFloat(w.balance) || 0), 0);
  
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const rev = sales.filter(s => s.date?.startsWith(ds)).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
      days.push({ name: dayName.toUpperCase(), revenue: rev });
    }
    return days;
  }, [sales]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-navy-950 uppercase tracking-tighter bg-gradient-to-r from-navy-950 to-navy-700 bg-clip-text text-transparent">
                Vue Console de Gestion
              </h1>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 Statut Système : Actif
              </div>
           </div>
           <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] italic opacity-60">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
           </p>
        </div>

        <div className="w-full lg:w-auto glass-card !p-4 bg-white border-emerald-100 flex items-center justify-between gap-8 group hover:border-emerald-500 transition-all shadow-sm">
           <div className="space-y-0.5">
              <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest italic">Target Link (IP or Domain)</p>
              <p className="text-xs font-black text-navy-950 tracking-tighter">10.166.75.218</p>
           </div>
           <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4" />
           </div>
        </div>
      </div>

      <div className="space-y-2">
         <h2 className="text-4xl font-black text-navy-950 uppercase tracking-tighter leading-none">Vue d'ensemble</h2>
         <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.5em] opacity-40 italic">Dossiers Système</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Metrics Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Total Assets */}
           <div className="glass-card bg-white p-10 rounded-[48px] border-emerald-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Database className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 bg-navy-50 text-navy-950 rounded-2xl flex items-center justify-center mb-6">
                 <Database className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.3em] mb-3 italic">Total des Actifs</p>
              <p className="text-4xl font-black text-navy-950 mb-6 tracking-tighter">{store.formatCurrency(totalStockValue)}</p>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                 <ShieldCheck className="w-3.5 h-3.5" /> Stock Optimal
              </div>
           </div>

           {/* Revenue Flow */}
           <div className="glass-card bg-white p-10 rounded-[48px] border-emerald-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="w-16 h-16 bg-navy-950 text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-navy-950/20">
                 <Zap className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.3em] mb-3 italic">Flux de Revenus</p>
              <p className="text-4xl font-black text-navy-950 mb-6 tracking-tighter">{store.formatCurrency(totalSales)}</p>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 mb-8">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 Inbound Stream Active
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full px-6">
                 <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-100 text-left">
                    <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Ajuster</p>
                    <p className="text-xs font-black text-navy-950">0.00 £</p>
                 </div>
                 <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-100 text-left">
                    <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Unit</p>
                    <p className="text-xs font-black text-navy-950">{sales.length}</p>
                 </div>
              </div>
           </div>

           {/* Revenue Chart */}
           <div className="md:col-span-2 glass-card bg-white p-10 rounded-[48px] border-emerald-100 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-sm font-black text-navy-950 uppercase tracking-widest mb-1">Croissance des Revenus</h3>
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest opacity-60 italic">Progression sur les 7 derniers jours</p>
                 </div>
                 <div className="flex items-center gap-2 text-navy-950 text-[10px] font-black uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" /> Live Flow
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
                 <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Crédit Client</p>
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
                 <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Dette Impayée</p>
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
                 <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Déclarer une perte (Avarie)</p>
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
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 italic">Résumé de l'Intelligence</p>
                 </div>
                 
                 <div className="space-y-6 flex-1">
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1 italic">Total Facturation</p>
                       <p className="text-3xl font-black tracking-tighter">{store.formatCurrency(totalSales)}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1 italic">Volume Transactions</p>
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

    </div>
  );
}
