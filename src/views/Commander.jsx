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
    const chartHeight = 256; // Matching h-64
    const maxVal = Math.max(...forecastData.map(d => d.high)) * 1.1;
    const minVal = Math.min(...forecastData.map(d => d.low)) * 0.9;
    const scale = (val) => chartHeight - ((val - minVal) / (maxVal - minVal) * chartHeight);

    return (
      <g>
        {/* Wick */}
        <line 
          x1={wickX} y1={scale(high)} 
          x2={wickX} y2={scale(low)} 
          stroke={fill} strokeWidth={2} 
        />
        {/* Body */}
        <rect 
          x={x + width * 0.15} 
          y={scale(Math.max(open, close))} 
          width={width * 0.7} 
          height={Math.max(Math.abs(scale(open) - scale(close)), 2)} 
          fill={fill}
          rx={4}
          className="transition-all hover:fill-[#0F172A]/60 cursor-pointer"
        />
      </g>
    );
  };

  const criticalStock = products.filter(p => p.quantity <= 2);
  const criticalDebt = clients.filter(c => (parseFloat(c.balance) || 0) > 500);

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Enterprise Intelligence
          </h1>
          <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase mt-1">
            {t('commanderInterface')} Center
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="px-8 py-4 bg-white border border-navy-100 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-brand">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray">Efficiency Index</p>
              <p className="text-xl font-black text-navy-brand italic">98.4% <span className="text-emerald-500">↑</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Forecast Card */}
        <div className="lg:col-span-2 glass-card rounded-[40px] bg-white p-10 space-y-8 shadow-2xl border border-navy-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-40 h-40 text-navy-brand" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-navy-950 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-emerald-500" /> {t('forecasting')}
              </h3>
              <p className="text-xs font-bold text-blue-gray mt-1 uppercase tracking-widest">Quantum Projection Protocol v.4.0</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-black text-blue-gray uppercase tracking-widest">Bullish</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[8px] font-black text-blue-gray uppercase tracking-widest">Bearish</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full bg-navy-50 rounded-[32px] p-6 border border-navy-100 relative group">
            <div className="absolute inset-0 grid grid-cols-7 gap-4 px-6 py-6 pointer-events-none opacity-5">
              {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-full border-r border-navy-950"></div>)}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748B' }} dy={10} />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip
                  cursor={{ fill: 'rgba(15, 23, 42, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-navy-100 rounded-2xl p-4 shadow-2xl">
                          <p className="text-[10px] font-black text-blue-gray uppercase mb-2">{data.name} Analysis</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-8"><span className="text-[9px] text-blue-gray">OPEN</span><span className="text-[10px] font-mono text-navy-950">{store.formatCurrency(data.open)}</span></div>
                            <div className="flex justify-between gap-8"><span className="text-[9px] text-blue-gray">HIGH</span><span className="text-[10px] font-mono text-emerald-600">{store.formatCurrency(data.high)}</span></div>
                            <div className="flex justify-between gap-8"><span className="text-[9px] text-blue-gray">LOW</span><span className="text-[10px] font-mono text-rose-600">{store.formatCurrency(data.low)}</span></div>
                            <div className="flex justify-between gap-8"><span className="text-[9px] text-blue-gray">CLOSE</span><span className={`text-[10px] font-mono ${data.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>{store.formatCurrency(data.close)}</span></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="forecast" shape={<Candle />} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{t('projectedRevenue')} (7D)</p>
              <p className="text-3xl font-black text-white">{store.formatCurrency(forecastData.reduce((s, f) => s + f.close, 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-success-pro mb-1">Stability Rating</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Stability Rating</p>
              <p className="text-xl font-black text-white italic tracking-tighter">ULTRA-GRADE <Zap className="inline w-5 h-5 text-emerald-400 fill-emerald-400" /></p>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-[#064E3B] rounded-[24px] p-4 text-white space-y-4 shadow-[0_16px_32px_-8px_rgba(6,78,59,0.3)] border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserPlus className="w-40 h-40 text-emerald-400" />
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <BadgeAlert className="w-6 h-6 text-emerald-400" /> {t('leaderboard')}
            </h3>
            <p className="text-[10px] font-bold text-emerald-400/50 mt-1 uppercase tracking-widest italic">Operational Performance Ranking</p>
          </div>

          <div className="space-y-4 relative z-10">
            {leaderboardData.map((op, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-[28px] border border-white/5 flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl transition-all ${i === 0 ? 'bg-[#22c55e] text-navy-950 shadow-[#22c55e]/20' : 'bg-white/10 text-white'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tighter">{op.name}</p>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{op.count} Operations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#22c55e] tabular-nums">{store.formatCurrency(op.revenue)}</p>
                </div>
              </div>
            ))}
            {leaderboardData.length === 0 && <p className="p-10 text-center opacity-20 italic font-black uppercase tracking-widest text-xs">Awaiting Data Streams...</p>}
          </div>
        </div>

      </div>

      {/* Risk Room */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 md:p-10 border-b border-navy-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-danger-pro flex items-center gap-3">
              <ShieldAlert className="w-6 h-6" /> {t('riskRoom')}
            </h3>
            <p className="text-xs font-bold text-blue-gray mt-1 uppercase tracking-widest">Active critical anomalies in the ecosystem</p>
          </div>
          <span className="px-5 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-100 self-start sm:self-auto">
            {criticalStock.length + criticalDebt.length} Anomalies detected
          </span>
        </div>

        {/* ✅ MOBILE: Card List */}
        <div className="block lg:hidden divide-y divide-navy-50">
          {[...criticalStock.map(p => ({ type: 'stock', item: p })), ...criticalDebt.map(c => ({ type: 'debt', item: c }))].map((entry, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${entry.type === 'stock' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                  {entry.type === 'stock' ? <AlertTriangle className="w-5 h-5" /> : <BadgeAlert className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-black text-navy-brand uppercase tracking-tight text-sm">{entry.type === 'stock' ? entry.item.name : entry.item.client}</p>
                  <p className="text-xs text-red-500 font-black uppercase">{entry.type === 'stock' ? 'Rupture Critique' : 'Dette Massive'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-red-50 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-red-400 uppercase font-black">Gravité</p>
                  <p className="text-[10px] font-black text-red-600">{entry.type === 'stock' ? 'Immédiat' : 'Défaut Risque'}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-blue-gray uppercase font-black">Impact</p>
                  <p className="text-xs font-black text-navy-900">{entry.type === 'stock' ? store.formatCurrency((parseFloat(entry.item.price) || 0) * 10) : `-${store.formatCurrency(entry.item.balance)}`}</p>
                </div>
              </div>
              <button className={`w-full py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl ${entry.type === 'stock' ? 'bg-navy-brand' : 'bg-red-600'}`}>
                {entry.type === 'stock' ? 'Restocker' : 'Contacter Client'}
              </button>
            </div>
          ))}
          {criticalStock.length === 0 && criticalDebt.length === 0 && (
            <div className="p-12 text-center text-blue-gray/30 font-black uppercase tracking-widest">No Critical Anomalies</div>
          )}
        </div>

        {/* ✅ DESKTOP: Full Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-50/50 text-[10px] font-black uppercase tracking-widest text-blue-gray">
                <th className="p-8">Type d'Anomalie</th>
                <th className="p-8">Node / Entité</th>
                <th className="p-8 text-center">Gravité</th>
                <th className="p-8 text-right">Impact Financier</th>
                <th className="p-8 text-center">Action Requise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {criticalStock.map((p, i) => (
                <tr key={i} className="hover:bg-red-50 transition-colors">
                  <td className="p-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
                    <span className="text-xs font-black uppercase tracking-widest text-red-500">Rupture Critique</span>
                  </td>
                  <td className="p-8 font-black uppercase text-navy-brand">{p.name}</td>
                  <td className="p-8 text-center text-[10px] font-black text-red-600 uppercase">Immédiat (0 Stock)</td>
                  <td className="p-8 text-right font-black text-navy-900">{store.formatCurrency((parseFloat(p.price) || 0) * 10)}</td>
                  <td className="p-8 text-center">
                    <button className="px-6 py-3 bg-navy-brand text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg">Restocker</button>
                  </td>
                </tr>
              ))}
              {criticalDebt.map((c, i) => (
                <tr key={i} className="hover:bg-red-50 transition-colors">
                  <td className="p-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><BadgeAlert className="w-5 h-5" /></div>
                    <span className="text-xs font-black uppercase tracking-widest text-red-600">Dette Massive</span>
                  </td>
                  <td className="p-8 font-black uppercase text-navy-brand">{c.client}</td>
                  <td className="p-8 text-center text-[10px] font-black text-red-600 uppercase">Risque de Défaut</td>
                  <td className="p-8 text-right font-black text-red-600">-{store.formatCurrency(c.balance)}</td>
                  <td className="p-8 text-center">
                    <button className="px-6 py-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg">Contacter Client</button>
                  </td>
                </tr>
              ))}
              {criticalStock.length === 0 && criticalDebt.length === 0 && (
                <tr><td colSpan="5" className="p-20 text-center text-blue-gray/30 font-black uppercase tracking-[0.5em]">No Critical Anomalies</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
