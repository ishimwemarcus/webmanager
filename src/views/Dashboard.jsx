import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  ShoppingCart,
  Database,
  Box,
  Zap,
  ShieldAlert,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const store = useStore();
  const { t } = useLanguage();
  const products = store.getProducts();
  const sales = store.getSales();
  const shifts = store.getShifts();
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];

  // Metrics Calculations
  const totalStockValue = products.reduce((s, p) => s + ((p.quantity || 0) * (p.cost || 0)), 0);
  const totalSales = sales.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalPaid = sales.reduce((s, r) => s + (parseFloat(r.paid) || 0), 0);
  const totalDebt = Math.max(0, totalSales - totalPaid);
  
  const today = new Date().toISOString().split('T')[0];
  const todayShifts = shifts.filter(s => s.end?.startsWith(today));
  const todayRevenue = todayShifts.reduce((acc, s) => acc + (parseFloat(s.revenue) || 0), 0);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const rev = sales.filter(s => s.date?.startsWith(ds)).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
      days.push({ name: dayName, revenue: rev });
    }
    return days;
  }, [sales]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 fade-in-up">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b border-navy-100 pb-8">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-[clamp(1.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Console de Contrôle
          </h1>
          <h2 className="text-xs font-black text-blue-gray tracking-[0.4em] uppercase italic">
            Diagnostic Opérationnel MARC v4
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-4 bg-white border border-navy-100 rounded-3xl shadow-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-navy-950">Système Nominal</span>
           </div>
           {store.currentOperator && (
             <div className="flex items-center gap-3 px-6 py-4 bg-navy-950 text-white rounded-3xl shadow-xl">
                <Clock className="w-4 h-4 text-navy-brand" />
                <span className="text-xs font-black uppercase tracking-widest">Poste Actif: {store.currentOperator}</span>
             </div>
           )}
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl rounded-[40px] group hover:border-navy-brand transition-all">
           <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-navy-brand/10 text-navy-brand rounded-2xl flex items-center justify-center">
                 <ShoppingCart className="w-6 h-6" />
              </div>
              <TrendingUpIcon className="w-5 h-5 text-emerald-500" />
           </div>
           <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Ventes Globales</p>
           <p className="text-3xl font-black text-navy-950 leading-none">{store.formatCurrency(totalSales)}</p>
        </div>

        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl rounded-[40px] group hover:border-navy-brand transition-all">
           <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                 <ShieldAlert className="w-6 h-6" />
              </div>
              <TrendingDown className="w-5 h-5 text-rose-500" />
           </div>
           <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Dette Clients Active</p>
           <p className="text-3xl font-black text-rose-600 leading-none">{store.formatCurrency(totalDebt)}</p>
        </div>

        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl rounded-[40px] group hover:border-navy-brand transition-all">
           <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                 <Box className="w-6 h-6" />
              </div>
              <Database className="w-5 h-5 text-amber-500" />
           </div>
           <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Valeur du Stock</p>
           <p className="text-3xl font-black text-navy-950 leading-none">{store.formatCurrency(totalStockValue)}</p>
        </div>

        <div className="glass-card p-8 bg-navy-950 border border-navy-900 shadow-2xl rounded-[40px] group relative overflow-hidden">
           <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-navy-brand/20 blur-3xl rounded-full"></div>
           <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 text-navy-brand rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5">
                 <Zap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-navy-brand text-white text-[8px] font-black uppercase rounded-full">Live</span>
           </div>
           <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 italic relative z-10">Recette du Jour</p>
           <p className="text-3xl font-black text-white leading-none relative z-10">{store.formatCurrency(todayRevenue)}</p>
        </div>
      </div>

      {/* Analytics & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card bg-white border border-navy-100 shadow-2xl rounded-[48px] p-10 space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter">Flux Financier</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic">Performance sur les 7 derniers jours</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-2xl text-[10px] font-black text-navy-950 uppercase border border-navy-100">
                    <TrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" /> Croissance
                 </div>
              </div>
           </div>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 900 }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                  />
                  <Bar dataKey="revenue" radius={[12, 12, 12, 12]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#F59E0B' : '#0F172A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card bg-white border border-navy-100 shadow-2xl rounded-[48px] p-10 flex flex-col">
           <div className="mb-10">
              <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter">Récentes Vacations</h3>
              <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic">Activité du personnel (Aujourd'hui)</p>
           </div>

           <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-thin">
              {todayShifts.length > 0 ? todayShifts.map((sh, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-navy-50/50 rounded-3xl border border-navy-100/50 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-navy-950 font-black text-sm border border-navy-100 group-hover:bg-navy-brand group-hover:text-white transition-colors shadow-sm">
                         {sh.operator?.charAt(0)}
                      </div>
                      <div>
                         <p className="font-black text-navy-950 uppercase text-sm">{sh.operator}</p>
                         <p className="text-[10px] font-bold text-blue-gray uppercase italic">Fin: {new Date(sh.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-navy-brand text-sm">{store.formatCurrency(sh.revenue)}</p>
                      <p className="text-[10px] font-black text-blue-gray uppercase">{sh.transactions} Tx</p>
                   </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-20 py-20">
                   <Clock className="w-12 h-12 text-blue-gray" />
                   <p className="text-xs font-black uppercase tracking-widest text-blue-gray">Aucune vacation archivée aujourd'hui</p>
                </div>
              )}
           </div>

           <button 
             onClick={() => window.location.hash = '#/shifts'}
             className="mt-8 w-full py-5 bg-navy-50 text-navy-950 font-black rounded-3xl border border-navy-100 hover:bg-navy-brand hover:text-white transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
           >
             Consulter le Journal Complet <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
