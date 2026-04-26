import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Cpu,
  AlertTriangle,
  BarChart3,
  BadgeAlert,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

export default function Commander() {
  const store = useStore();
  const { t } = useLanguage();

  const sales = store.getSales();
  const products = store.getProducts();
  const clients = store.getWaitCredits ? store.getWaitCredits() : [];

  // 1. Operator Leaderboard Logic
  const leaderboardData = useMemo(() => {
    const table = {};
    sales.forEach(s => {
      const op = s.operator || 'Admin';
      if (!table[op]) table[op] = { name: op, revenue: 0, count: 0 };
      table[op].revenue += (parseFloat(s.amount) || 0);
      table[op].count += 1;
    });
    return Object.values(table).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  // 2. Forecasting Logic (Candlestick Simulation)
  const forecastData = useMemo(() => {
    const dailyRev = {};
    sales.forEach(s => {
      const ds = s.date?.split('T')[0];
      if (ds) dailyRev[ds] = (dailyRev[ds] || 0) + (parseFloat(s.amount) || 0);
    });
    const values = Object.values(dailyRev);
    const avg = values.length > 0 ? values.reduce((m, v) => m + v, 0) / values.length : 1000;

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const base = avg * (1 + (Math.random() * 0.1 - 0.05));
      const open = base * (1 + (Math.random() * 0.05 - 0.025));
      const close = base * (1 + (Math.random() * 0.05 - 0.025));
      return {
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        open: open,
        close: close,
        high: Math.max(open, close) * (1 + Math.random() * 0.02),
        low: Math.min(open, close) * (1 - Math.random() * 0.02),
        isUp: close >= open
      };
    });
  }, [sales]);

  // Custom Candle Component
  const Candle = (props) => {
    const { x, y, width, open, close, high, low, isUp } = props;
    const fill = isUp ? '#22c55e' : '#ef4444';
    const wickX = x + width / 2;
    
    // Scale wicks/body
    const chartHeight = 256; 
    const maxVal = Math.max(...forecastData.map(d => d.high)) * 1.1;
    const minVal = Math.min(...forecastData.map(d => d.low)) * 0.9;
    const scale = (val) => chartHeight - ((val - minVal) / (maxVal - minVal) * chartHeight);

    return (
      <g>
        <line x1={wickX} y1={scale(high)} x2={wickX} y2={scale(low)} stroke={fill} strokeWidth={2} />
        <rect 
          x={x + width * 0.15} y={scale(Math.max(open, close))} width={width * 0.7} 
          height={Math.max(Math.abs(scale(open) - scale(close)), 2)} fill={fill} rx={4}
          className="transition-all hover:fill-[#0F172A]/60 cursor-pointer"
        />
      </g>
    );
  };

  const criticalStock = products.filter(p => p.quantity <= 2);
  const criticalDebt = clients.filter(c => (parseFloat(c.balance) || 0) > 500);

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 pb-20 fade-in-up px-2 md:px-0">
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">Intelligence</h1>
          <h2 className="text-[10px] md:text-xs font-black text-blue-gray tracking-[0.4em] uppercase mt-1 italic">Protocoles Prédictifs & Audit</h2>
        </div>
        <div className="flex items-center gap-2 px-6 py-4 bg-navy-50 border border-navy-100 rounded-3xl">
           <Zap className="w-5 h-5 text-gold animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-navy-950">Moteur Neural Actif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card group hover-elevate hover:border-navy-brand transition-all">
          <div className="w-12 h-12 bg-navy-brand/10 text-navy-brand rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Score d'Efficacité</p>
          <p className="text-2xl md:text-3xl font-black text-navy-950 uppercase">Optimal</p>
        </div>

        <div className="glass-card group hover-elevate hover:border-rose-500 transition-all">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <BadgeAlert className="w-6 h-6" />
          </div>
          <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Alerte Stocks</p>
          <p className="text-2xl md:text-3xl font-black text-rose-600 uppercase">{criticalStock.length} Critiques</p>
        </div>

        <div className="glass-card group hover-elevate hover:border-emerald-500 transition-all">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Projection Ventes</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-600 uppercase">+12% Prévu</p>
        </div>

        <div className="glass-card group hover-elevate hover:border-gold transition-all">
          <div className="w-12 h-12 bg-gold/10 text-gold-dark rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Engagement Client</p>
          <p className="text-2xl md:text-3xl font-black text-gold-dark uppercase">Élevé</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">Forecasting (Modèle Candlestick)</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[8px] font-black uppercase">Hausse</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[8px] font-black uppercase">Baisse</span></div>
              </div>
           </div>
           <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} />
                  <Tooltip content={({ payload }) => payload?.[0] ? (
                    <div className="bg-navy-950 text-white p-4 rounded-2xl shadow-2xl border border-white/10 scale-in">
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">{payload[0].payload.name}</p>
                       <p className="text-xs font-bold text-emerald-400">High: {store.formatCurrency(payload[0].payload.high)}</p>
                       <p className="text-xs font-bold text-rose-400">Low: {store.formatCurrency(payload[0].payload.low)}</p>
                    </div>
                  ) : null} />
                  <Bar dataKey="close" shape={<Candle />} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card">
           <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter mb-8">Classement Opérateurs</h3>
           <div className="space-y-4">
              {leaderboardData.map((op, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-navy-50 rounded-2xl border border-navy-100/50 group hover:border-navy-brand transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-navy-100 flex items-center justify-center text-navy-brand font-black">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-black text-navy-950 uppercase">{op.name}</p>
                      <p className="text-[8px] font-bold text-blue-gray uppercase">{op.count} Transactions</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-navy-brand">{store.formatCurrency(op.revenue)}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
