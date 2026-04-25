import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  AlertTriangle,
  ShoppingCart,
  Database,
  Box,
  ShieldCheck,
  Zap,
  Cpu,
  Globe,
  ShieldAlert,
  TrendingDown,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { getFormattedQuantity } from '../utils/ProductUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function MasterDashboard({ currentUser, isOperator }) {
  const store = useStore();
  const { t } = useLanguage();
  const products = store.getProducts();
  const sales = store.getSales();
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];

  // Metrics Calculations
  const totalStockValue = products.reduce((s, p) => s + ((p.quantity || 0) * (p.cost || 0)), 0);
  const lowStockItems = products.filter(p => p.quantity <= 5);

  const totalSales = sales.reduce((s, r) => s + (r.amount || 0), 0);
  const totalTips = sales.reduce((s, r) => s + (parseFloat(r.tip) || 0), 0);

  const totalReceivable = sales.reduce((s, r) => s + Math.max(0, (parseFloat(r.amount) || 0) - (parseFloat(r.paid) || 0)), 0);
  const unpaidReceivablesCount = sales.filter(r => (parseFloat(r.amount) || 0) > (parseFloat(r.paid) || 0)).length;

  const totalWaitBalance = waitCredits.reduce((s, w) => s + (parseFloat(w.balance) || 0), 0);
  const waitClientCount = new Set(waitCredits.map(w => w.client)).size;

  const losses = store.getLosses();
  const totalSpoilageValue = losses.reduce((s, l) => s + (parseFloat(l.valuation) || 0), 0);

  // Prepare Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const rev = sales.filter(s => s.date?.startsWith(ds)).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
      days.push({ name: dayName, revenue: rev, date: ds });
    }
    return days;
  }, [sales]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 fade-in-up">
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 border-b border-navy-50 pb-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-[clamp(2rem,6vw,3rem)] font-black uppercase tracking-tighter text-navy-brand italic leading-none">
            {t('dashboard')}
          </h1>
          <h2 className="text-xs font-black text-blue-gray tracking-[0.4em] uppercase opacity-100">
            {t('operationalDiagnostics')}
          </h2>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 border rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-sm transition-all duration-500 ${store.getSystemStatus() === 'allProtocolsNominal'
          ? 'bg-success-pro/5 border-success-pro/20 text-success-pro'
          : 'bg-danger-pro/5 border-danger-pro/20 text-danger-pro'
          }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${store.getSystemStatus() === 'allProtocolsNominal' ? 'bg-success-pro' : 'bg-danger-pro'
            }`}></div>
          {t('allProtocolsNominal')}
        </div>

        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-navy-100 shadow-xl group/ip animate-fade-in">
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-black text-blue-gray uppercase tracking-widest">Lien de Connexion (IP ou Domaine)</span>
              <input
                type="text"
                placeholder="Ex: 10.166.75.218 ou https://lien.lt"
                defaultValue={localStorage.getItem('custom_domain') || localStorage.getItem('server_ip') || ''}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('http')) {
                    localStorage.setItem('custom_domain', val);
                    localStorage.removeItem('server_ip');
                  } else {
                    localStorage.setItem('server_ip', val);
                    localStorage.removeItem('custom_domain');
                  }
                  window.location.reload();
                }}
                className="bg-transparent text-xs font-black text-navy-brand outline-none w-48 border-b border-transparent focus:border-navy-brand transition-all"
              />
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localStorage.getItem('server_ip') || localStorage.getItem('custom_domain') ? 'bg-success-pro/10 text-success-pro' : 'bg-danger-pro/10 text-danger-pro animate-bounce'}`}>
              <Globe className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      <div className="relative py-12 px-4 no-print">
        <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-[20%] w-[33%] h-0.5 bg-gradient-to-r from-navy-500 via-accent-500 to-navy-500 animate-pulse"></div>
          <div className="absolute top-1/2 left-[48%] w-[33%] h-0.5 bg-gradient-to-r from-navy-500 via-accent-500 to-navy-500 animate-pulse"></div>
          <div className="absolute top-1/2 left-[50%] w-0.5 h-32 bg-gradient-to-b from-accent-500 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 relative z-10">
          <div className="flex flex-col items-center group">
            <div className="glass-card w-full rounded-[32px] p-8 border-t-2 border-navy-100 shadow-xl hover:border-navy-brand/30 hover:shadow-2xl transition-all duration-500 bg-white">
              <div className="relative mx-auto w-12 h-12 bg-navy-50 border border-navy-100 rounded-xl flex items-center justify-center text-navy-brand shadow-sm mb-6 group-hover:scale-110 transition-transform animate-rubber-band">
                <Box className="w-6 h-6 text-navy-brand" />
              </div>

              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.5em] text-blue-gray mb-3">{t('assetManifest')}</h3>
                  <p className="text-[clamp(1.5rem,5vw,2.25rem)] font-black text-pure-black tracking-tighter drop-shadow-sm">{store.formatCurrency(totalStockValue)}</p>
                </div>

                <div className="h-px bg-navy-50 w-full"></div>

                <div className="h-28 flex flex-col justify-center">
                  {lowStockItems.length > 0 ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 text-left">
                      <div className="flex items-center gap-2 mb-3 text-danger">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs md:text-sm font-black uppercase tracking-widest">{t('reserveLow')}</span>
                      </div>
                      <div className="space-y-2">
                        {lowStockItems.slice(0, 2).map(item => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-xs md:text-sm text-navy-400 font-bold uppercase truncate pr-4">{item.name}</span>
                            <span className="text-xs font-black text-danger">{getFormattedQuantity(item)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-60" />
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest text-emerald-600">{t('reserveOptimal')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center group -translate-y-4">
            <div className="w-full max-w-sm rounded-[48px] p-10 bg-white border-2 border-navy-brand/20 shadow-[0_32px_64px_-16px_rgba(21,128,61,0.15)] hover:shadow-[0_48px_80px_-16px_rgba(21,128,61,0.25)] transition-all duration-700 relative overflow-hidden group/card">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-navy-brand/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover/card:bg-navy-brand/10 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/5 blur-2xl rounded-full -ml-8 -mb-8"></div>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-2 bg-navy-brand rounded-b-full shadow-[0_4px_12px_rgba(21,128,61,0.3)]"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-navy-brand rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-10 group-hover/card:rotate-12 group-hover/card:scale-110 transition-all duration-500 ring-8 ring-navy-50 animate-bounce-gentle">
                  <Zap className="w-10 h-10 fill-white" />
                </div>
  
                <div className="text-center space-y-4 mb-10 w-full">
                  <div className="space-y-1">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-navy-brand/60">{t('liquidityDelta')}</h3>
                    <p className="text-[clamp(2rem,6vw,3rem)] font-black text-pure-black tracking-tighter drop-shadow-sm leading-none">
                      {store.formatCurrency(totalSales)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs md:text-sm font-black text-emerald-600 uppercase tracking-widest">Flux Entrant Actif</span>
                  </div>
                </div>
  
                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="bg-navy-50/50 backdrop-blur-sm p-5 rounded-[32px] border border-navy-100/50 group-hover/card:bg-navy-50 transition-colors">
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-1.5 opacity-60">{t('varianceTip').split(' ')[0]}</p>
                    <p className="text-lg font-black text-purple-700 leading-none">{store.formatCurrency(totalTips)}</p>
                  </div>
                  <div className="bg-navy-50/50 backdrop-blur-sm p-5 rounded-[32px] border border-navy-100/50 group-hover/card:bg-navy-50 transition-colors">
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-1.5 opacity-60">UNIT</p>
                    <p className="text-lg font-black text-charcoal leading-none">{sales.length}</p>
                  </div>
                </div>

                {/* Bottom Decorative Indicator */}
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-1 bg-navy-100 rounded-full overflow-hidden">
                      <div className="h-full bg-navy-brand w-1/2 animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="text-xs md:text-sm md:text-xs font-black text-blue-gray/30 uppercase tracking-[0.3em]">Flux Opérationnel V.2.0</p>
                  </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="glass-card p-6 rounded-[24px] border-l-4 border-purple-500 shadow-md group hover:-translate-x-2 transition-transform duration-500 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-700 shadow-sm group-hover:scale-110 transition-transform animate-rubber-band">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">{t('retentionCredit')}</h3>
                  <p className="text-2xl font-black text-pure-black tracking-tighter">{store.formatCurrency(totalWaitBalance)}</p>
                  <p className="text-xs md:text-sm font-black text-purple-600 uppercase tracking-widest mt-1">En Attente / {waitClientCount} Comptes</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-[24px] border-l-4 border-danger-pro shadow-md group hover:-translate-x-2 transition-transform duration-500 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-danger-pro shadow-sm group-hover:scale-110 transition-transform animate-rubber-band">
                  <Database className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">{t('liabilityIndex')}</h3>
                  <p className="text-2xl font-black text-pure-black tracking-tighter">{store.formatCurrency(totalReceivable)}</p>
                  <p className="text-xs md:text-sm font-black text-danger-pro uppercase tracking-widest mt-1">Impayé / {unpaidReceivablesCount} Actions</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => window.location.hash = '#/spoilage'}
              className="glass-card p-6 rounded-[24px] border-l-4 border-red-600 shadow-md group hover:-translate-x-2 transition-transform duration-500 bg-white cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-red-600 shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">{t('spoilage')}</h3>
                  <p className="text-2xl font-black text-red-600 tracking-tighter">{store.formatCurrency(totalSpoilageValue)}</p>
                  <p className="text-xs md:text-sm font-black text-red-500 uppercase tracking-widest mt-1">Impact des Pertes</p>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Visual Analytics Sector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mt-6 lg:mt-12">
          <div className="lg:col-span-2 glass-card rounded-[48px] p-10 bg-white border border-navy-50 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-blue-gray mb-1">Croissance des Revenus</h3>
                <p className="text-sm font-bold text-navy-brand">Progression sur les 7 derniers jours</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUpIcon className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Live Flow</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#030711', fontSize: 12, fontWeight: 900 }}
                    dy={15}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px', fontWeight: '900' }}
                  />
                  <Bar dataKey="revenue" radius={[12, 12, 0, 0]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === chartData.length - 1 ? "url(#barGradientPrimary)" : "url(#barGradientSecondary)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card-dark rounded-[48px] p-10 bg-navy-brand text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Cpu className="w-32 h-32" />
            </div>
            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/80 mb-6">Résumé de l'Intelligence</h3>

            <div className="space-y-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#2563eb] mb-2">Total Facturation</p>
                <p className="text-3xl font-black">{store.formatCurrency(totalSales)}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-2">Volume Transactions</p>
                <p className="text-3xl font-black">{sales.length}</p>
              </div>
              <div className="pt-8 border-t border-white/10">
                <button onClick={() => window.location.hash = '#/reports'} className="w-full bg-white text-navy-brand font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2563eb] hover:text-white transition-all text-xs tracking-widest uppercase shadow-xl">
                  Intelligence Complète <TrendingUpIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12 bg-white border border-navy-100 rounded-full px-6 md:px-12 py-5 shadow-xl no-print text-xs md:text-sm font-black uppercase tracking-[0.3em] text-navy-500">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-500 blur-[2px]"></div>
          <span>{t('stock')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-success-pro blur-[2px]"></div>
          <span>Flow</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-danger-pro blur-[2px]"></div>
          <span>{t('ledger')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 blur-[2px]"></div>
          <span>{t('waitSystem')}</span>
        </div>
      </div>
    </div>
  );
}

export default MasterDashboard;
