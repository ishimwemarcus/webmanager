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
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 pb-20 fade-in-up">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b border-navy-100 pb-8">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-[clamp(1.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Vue Console de Gestion
          </h1>
          <h2 className="text-[10px] md:text-xs font-black text-blue-gray tracking-[0.4em] uppercase italic">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-navy-100 rounded-2xl shadow-lg">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-navy-950">Système Nominal</span>
            </div>
            {store.currentOperator && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-navy-950 text-white rounded-2xl shadow-lg">
                 <Clock className="w-3.5 h-3.5 text-navy-brand" />
                 <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">Poste: {store.currentOperator}</span>
              </div>
            )}
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card group hover-elevate hover:border-navy-brand transition-all">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-navy-brand/10 text-navy-brand rounded-2xl flex items-center justify-center">
                 <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <TrendingUpIcon className="w-5 h-5 text-emerald-500" />
           </div>
           <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Ventes Globales</p>
           <p className="text-2xl md:text-3xl font-black text-navy-950 leading-none">{store.formatCurrency(totalSales)}</p>
        </div>

        <div className="glass-card group hover-elevate hover:border-navy-brand transition-all">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                 <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <TrendingDown className="w-5 h-5 text-rose-500" />
           </div>
           <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Dette Clients Active</p>
           <p className="text-2xl md:text-3xl font-black text-rose-600 leading-none">{store.formatCurrency(totalDebt)}</p>
        </div>

        <div className="glass-card group hover-elevate hover:border-navy-brand transition-all">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                 <Box className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="w-8 h-1 bg-amber-500/20 rounded-full overflow-hidden">
                 <div className="w-3/4 h-full bg-amber-500"></div>
              </div>
           </div>
           <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Valeur du Stock</p>
           <p className="text-2xl md:text-3xl font-black text-navy-950 leading-none">{store.formatCurrency(totalStockValue)}</p>
        </div>

        <div className="glass-card group hover-elevate hover:border-navy-brand transition-all !bg-navy-950 !text-white border-none shadow-navy-brand/20">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 text-navy-brand rounded-2xl flex items-center justify-center">
                 <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="px-2 py-1 bg-navy-500 rounded text-[8px] font-black tracking-widest">LIVE</div>
           </div>
           <p className="text-[9px] md:text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Recette du Jour</p>
           <p className="text-2xl md:text-3xl font-black text-white leading-none">{store.formatCurrency(todayRevenue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card min-h-[400px] flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">Flux Financier</h3>
                 <p className="text-[10px] font-black text-blue-gray tracking-[0.2em] uppercase italic">Performance sur les 7 derniers jours</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-50 rounded-xl">
                 <TrendingUpIcon className="w-3 h-3 text-emerald-500" />
                 <span className="text-[8px] font-black text-navy-950 uppercase">Croissance</span>
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
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-navy-950 text-white p-4 rounded-2xl shadow-2xl border border-white/10 scale-in">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{payload[0].payload.name}</p>
                            <p className="text-lg font-black">{store.formatCurrency(payload[0].value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" radius={[10, 10, 10, 10]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#0F172A' : '#F1F5F9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">Récentes Vacations</h3>
              <p className="text-[8px] font-black text-blue-gray tracking-widest uppercase italic">Activité du personnel (Aujourd'hui)</p>
           </div>

           <div className="flex-1 flex flex-col justify-center items-center gap-4 py-10">
              {shifts.filter(s => s.end?.startsWith(today)).length > 0 ? (
                <div className="w-full space-y-4">
                  {shifts.filter(s => s.end?.startsWith(today)).slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-navy-50 rounded-2xl border border-navy-100/50 hover:border-navy-brand transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-navy-100 flex items-center justify-center text-navy-brand font-black">
                          {s.operator?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-navy-950 uppercase">{s.operator}</p>
                          <p className="text-[8px] font-bold text-blue-gray">{new Date(s.end).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-navy-brand">{store.formatCurrency(s.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border-4 border-navy-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-navy-100" />
                  </div>
                  <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.2em] italic opacity-40">Aucune vacation archivée aujourd'hui</p>
                </>
              )}
           </div>

           <button 
             onClick={() => window.location.hash = '#/shifts'}
             className="mt-auto w-full py-4 bg-navy-50 text-navy-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-navy-100 transition-all flex items-center justify-center gap-2 group"
           >
             Consulter le journal complet <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
}
