import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import DesktopPageLayout from '../components/layout/DesktopPageLayout';
import {
  Activity, Zap, Clock, ShieldCheck, Database,
  CreditCard, AlertCircle, Cpu, MessageSquare, Printer
} from 'lucide-react';
import { generateDailySummary, shareDailyReport, printFullMasterReport } from '../utils/Reporter';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const store = useStore();
  const { L, lang } = useLanguage();
  const products = store.getProducts();
  const sales = store.getSales();
  const losses = store.getLosses ? store.getLosses() : [];
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];

  const totalStockValue = products.reduce((s, p) => s + ((parseFloat(p.quantity) || 0) * (parseFloat(p.cost) || 0)), 0);
  const totalSales     = sales.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalDebt      = sales.reduce((s, r) => s + Math.max(0, (parseFloat(r.amount) || 0) - (parseFloat(r.paid) || 0)), 0);
  const totalLoss      = losses.reduce((s, l) => s + (parseFloat(l.amount || l.valuation) || 0), 0);
  const totalCredit    = waitCredits.reduce((s, w) => s + (parseFloat(w.balance) || 0), 0);

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

  /* ── Header Actions ── */
  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => {
          const summary = generateDailySummary(sales, store.getExpenses(), store.getLedgerManual(), losses);
          printFullMasterReport({
            reportDate: new Date().toISOString().split('T')[0],
            financials: summary.raw,
            sales: sales.filter(s => s.date?.startsWith(new Date().toISOString().split('T')[0])),
            ledger: store.getLedgerManual().filter(l => l.date?.startsWith(new Date().toISOString().split('T')[0])),
            inventory: store.getProducts(),
            shifts: store.getShifts ? store.getShifts().filter(s => s.start?.startsWith(new Date().toISOString().split('T')[0])) : []
          }, store.formatCurrency, lang);
        }}
        className="btn-action bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        <Printer className="w-3.5 h-3.5" /> {L('Print', 'Imprimer')}
      </button>
      <button
        type="button"
        onClick={() => {
          const summary = generateDailySummary(sales, store.getExpenses(), store.getLedgerManual(), losses);
          shareDailyReport(summary.raw, store.formatCurrency, lang);
        }}
        className="btn-action bg-emerald-500 text-white hover:bg-emerald-600"
      >
        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
      </button>
    </>
  );

  /* ── Utility strip: 4 equal stat cards ── */
  const utilityPanel = (
    <>
      <div className="utility-card">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="min-w-0">
          <p className="text-label">{L('Client Credit', 'Crédit Client')}</p>
          <p className="text-body font-bold text-navy-950 truncate">{store.formatCurrency(totalCredit)}</p>
        </div>
      </div>
      <div className="utility-card">
        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-4 h-4 text-rose-500" />
        </div>
        <div className="min-w-0">
          <p className="text-label">{L('Unpaid Debt', 'Dette Impayée')}</p>
          <p className="text-body font-bold text-rose-600 truncate">{store.formatCurrency(totalDebt)}</p>
        </div>
      </div>
      <div className="utility-card">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <p className="text-label">{L('Loss / Spoilage', 'Perte / Avarie')}</p>
          <p className="text-body font-bold text-amber-600 truncate">{store.formatCurrency(totalLoss)}</p>
        </div>
      </div>
      <div className="utility-card utility-card--dark">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-label text-emerald-400">{L('Intelligence', 'Intelligence')}</p>
          <p className="text-body font-bold text-white truncate">{store.formatCurrency(totalSales)}</p>
          <p className="text-label text-white/40 normal-case">{sales.length} {L('txn', 'txn')}</p>
        </div>
      </div>
    </>
  );

  return (
    <DesktopPageLayout
      title={L('Management Overview', 'Aperçu de Gestion')}
      subtitle={`${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
      })} · GMT`}
      badge={
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {L('Active', 'Actif')}
        </span>
      }
      actions={headerActions}
      utilityPanel={utilityPanel}
    >
      {/* ── Equal-width top stat row ── */}
      <div className="panel-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="panel-stat">
          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-label">{L('Total Assets', 'Total Actifs')}</p>
            <p className="text-stat truncate">{store.formatCurrency(totalStockValue)}</p>
          </div>
        </div>
        <div className="panel-stat">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-label">{L('Revenue Flow', 'Flux Revenus')}</p>
            <p className="text-stat text-emerald-700 truncate">{store.formatCurrency(totalSales)}</p>
          </div>
        </div>
        <div className="panel-stat">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-label">{L('Outstanding Debt', 'Dette Totale')}</p>
            <p className="text-stat text-rose-600 truncate">{store.formatCurrency(totalDebt)}</p>
          </div>
        </div>
        <div className="panel-stat">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-label">{L('Total Losses', 'Pertes Totales')}</p>
            <p className="text-stat text-amber-600 truncate">{store.formatCurrency(totalLoss)}</p>
          </div>
        </div>
      </div>

      {/* ── Revenue Chart — full width ── */}
      <div className="chart-panel" style={{ minHeight: 200 }}>
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-title">{L('Revenue Growth', 'Croissance Revenus')}</h2>
          <span className="text-label text-emerald-600 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> {L('Live', 'Direct')}
          </span>
        </div>
        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={6}
              />
              <Tooltip
                cursor={{ fill: 'rgba(16,185,129,0.06)', radius: 6 }}
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-body shadow-xl border border-white/10">
                        {store.formatCurrency(payload[0].value)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={32} minPointSize={5}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 6 ? '#10B981' : '#A7F3D0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Stock status strip ── */}
      <div className="panel-card flex items-center gap-2 text-label text-emerald-700">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        {L('Optimal stock levels', 'Niveaux de stock optimaux')}
        <span className="ml-auto text-label text-slate-400">{products.length} {L('products tracked', 'produits suivis')}</span>
      </div>
    </DesktopPageLayout>
  );
}
