import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { printThermalReport } from '../utils/Reporter';
import { 
  Download, 
  Calendar, 
  Printer, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Filter, 
  Package, 
  Trash2, 
  CheckSquare, 
  Square, 
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  BarChart2,
  PieChart,
  Wallet,
  MessageSquare
} from 'lucide-react';

import { generateDailySummary, shareDailyReport } from '../utils/Reporter';
import { getFormattedQuantity } from '../utils/ProductUtils';

export default function Reports() {
  const store = useStore();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const allSales = store.getSales() || [];
  const allLedger = store.getLedgerManual() || [];
  const allLosses = store.getLosses ? store.getLosses() : [];
  const allProducts = store.getProducts() || [];
  const allShifts = store.getShifts ? store.getShifts() : [];
  const [activeSectors, setActiveSectors] = useState(['sales', 'ledger', 'stock', 'losses', 'shifts']);

  const summaryData = useMemo(() => generateDailySummary(allSales, [], allLedger, allLosses, reportDate), [allSales, allLedger, allLosses, reportDate]);
  const reportData = summaryData.raw;

  const { dailySales, dailyLedger, dailyLosses, dailyShifts, totalSalesRev, totalSalesCash, totalSalesDebt, totalExpense, totalReceivable, totalLossValuation, netCashCollected } = useMemo(() => {
    const sales = allSales.filter(s => s.date && s.date.startsWith(reportDate));
    const ledger = allLedger.filter(l => l.date && l.date.startsWith(reportDate));
    const losses = allLosses.filter(l => l.date && l.date.startsWith(reportDate));
    const shifts = allShifts.filter(s => s.end && s.end.startsWith(reportDate));

    return {
      dailySales: sales,
      dailyLedger: ledger,
      dailyLosses: losses,
      dailyShifts: shifts,
      totalSalesRev: reportData.totalSales,
      totalSalesCash: reportData.cashCollected,
      totalSalesDebt: reportData.unpaidLedger,
      totalExpense: reportData.totalExpenses,
      totalReceivable: ledger.filter(l => l.type === 'receivable').reduce((s, l) => s + (parseFloat(l.amount)||0), 0),
      totalLossValuation: reportData.totalLossValuation,
      netCashCollected: reportData.netProfit
    };
  }, [allSales, allLedger, allLosses, reportDate, allShifts, reportData]);

  const totalStockValue = useMemo(() =>
    allProducts.reduce((sum, p) => sum + ((parseFloat(p.cost) || 0) * (parseFloat(p.quantity) || 0)), 0),
    [allProducts]
  );

  const toggleSector = (sector) => {
    setActiveSectors(prev => prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]);
  };

  const handleDownloadPDF = () => {
    if (!window.pdfMake) {
      store.showAlert("Le moteur PDF est en cours de chargement...", "warning");
      return;
    }

    const docDefinition = {
      content: [
        { text: 'MARC INTELLIGENCE - RAPPORT D\'ACTIVITÉ', style: 'header' },
        { text: `Date du Rapport: ${reportDate}`, style: 'subheader' },
        { text: '\n' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Indicateur', style: 'tableHeader' }, { text: 'Valeur', style: 'tableHeader' }],
              ['Revenus Bruts', store.formatCurrency(totalSalesRev)],
              ['Cash Encaissé', store.formatCurrency(totalSalesCash)],
              ['Dépenses', store.formatCurrency(totalExpense)],
              ['Pertes', store.formatCurrency(totalLossValuation)],
              ['Profit Net', store.formatCurrency(netCashCollected)]
            ]
          }
        },
        { text: '\n\nJournal des Ventes détaillée:', style: 'sectionHeader' },
        {
          table: {
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              ['Heure', 'Client', 'Article', 'Total'],
              ...dailySales.map(s => [
                new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                s.client || 'STANDARD',
                s.name,
                store.formatCurrency(s.amount)
              ])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 22, bold: true, color: '#082F49', alignment: 'center' },
        subheader: { fontSize: 12, alignment: 'center', color: '#64748B' },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] },
        tableHeader: { bold: true, fontSize: 13, color: 'black' }
      }
    };

    try {
      window.pdfMake.createPdf(docDefinition).download(`MARC-Report-${reportDate}.pdf`);
      store.showAlert("Rapport PDF généré avec succès !");
    } catch (err) {
      console.error(err);
      store.showAlert("Erreur lors de la génération du PDF", "error");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Intelligence d'Affaires
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            Audit Analytique — Reporting Haute Fidélité
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => window.print()} className="p-4 bg-white border border-emerald-100 rounded-2xl text-navy-950 hover:bg-emerald-50 transition-all shadow-sm">
              <Printer className="w-5 h-5" />
           </button>
           <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-3 px-8 py-4 bg-navy-950 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95">
             <Download className="w-5 h-5 text-emerald-400" /> Export PDF
           </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 shadow-xl no-print space-y-8">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray italic mr-2">Domaines d'Audit :</p>
               {[
                 { id: 'sales', label: 'Ventes' },
                 { id: 'ledger', label: 'Finance' },
                 { id: 'stock', label: 'Stock' },
                 { id: 'losses', label: 'Pertes' },
                 { id: 'shifts', label: 'Postes' }
               ].map(s => (
                 <button
                   key={s.id}
                   onClick={() => toggleSector(s.id)}
                   className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border font-black text-[9px] uppercase tracking-widest ${activeSectors.includes(s.id) ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-blue-gray border-emerald-100 hover:border-emerald-500'}`}
                 >
                   {activeSectors.includes(s.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                   {s.label}
                 </button>
               ))}
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100">
               <Calendar className="w-5 h-5 text-emerald-600" />
               <input
                 type="date"
                 value={reportDate}
                 onChange={(e) => setReportDate(e.target.value)}
                 className="bg-transparent font-black text-navy-950 outline-none cursor-pointer text-sm uppercase tracking-widest"
               />
            </div>
         </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="glass-card bg-white p-8 rounded-[40px] border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 italic">Revenus Bruts</p>
            <p className="text-3xl font-black text-navy-950 tracking-tighter">{store.formatCurrency(totalSalesRev)}</p>
         </div>

         <div className="glass-card bg-white p-8 rounded-[40px] border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 bg-navy-50 text-navy-950 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <Wallet className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 italic">Liquidité Encaissée</p>
            <p className="text-3xl font-black text-navy-950 tracking-tighter">{store.formatCurrency(totalSalesCash)}</p>
         </div>

         <div className="glass-card bg-white p-8 rounded-[40px] border-rose-100 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <TrendingDown className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 italic">Dépenses Opérationnelles</p>
            <p className="text-3xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(totalExpense)}</p>
         </div>

         <div className="glass-card bg-navy-950 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <Activity className="w-16 h-16" />
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/10">
               <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 italic">Profit Net Ajusté</p>
            <p className="text-3xl font-black text-white tracking-tighter">{store.formatCurrency(netCashCollected)}</p>
         </div>
      </div>

      {/* Main Report Body */}
      <div className="space-y-8 print:space-y-12">
         {activeSectors.includes('sales') && (
            <div className="glass-card bg-white p-10 rounded-[48px] border-emerald-100 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-navy-50">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
                        <BarChart2 className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-navy-950 uppercase tracking-widest">Journal des Ventes</h3>
                        <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] italic opacity-40">Transactions Opérationnelles</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xl font-black text-navy-950">{dailySales.length} Tx</p>
                     <p className="text-[9px] font-black uppercase text-emerald-500">Live Flow Audit</p>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-navy-50/50 text-[9px] font-black uppercase tracking-widest text-blue-gray">
                           <th className="p-5">Heure</th>
                           <th className="p-5">Opérateur</th>
                           <th className="p-5">Client</th>
                           <th className="p-5">Article</th>
                           <th className="p-5 text-right">Vol.</th>
                           <th className="p-5 text-right">Total</th>
                           <th className="p-5 text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-navy-50">
                        {dailySales.map((s, i) => (
                           <tr key={i} className="hover:bg-navy-50/20 transition-colors">
                              <td className="p-5 text-[10px] font-black text-navy-950">{new Date(s.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                              <td className="p-5 text-[9px] font-black text-blue-gray uppercase">{s.operator || 'ADMIN'}</td>
                              <td className="p-5 text-[9px] font-black text-navy-950 uppercase">{s.client || 'STANDARD'}</td>
                              <td className="p-5 text-[9px] font-black text-navy-950 uppercase">{s.name}</td>
                              <td className="p-5 text-right text-[10px] font-black text-navy-950">{s.quantity}</td>
                              <td className="p-5 text-right text-[10px] font-black text-navy-950">{store.formatCurrency(s.amount)}</td>
                              <td className="p-5 text-center">
                                 <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${s.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{s.status}</span>
                              </td>
                           </tr>
                        ))}
                        {dailySales.length === 0 && <tr><td colSpan="7" className="p-20 text-center text-blue-gray/20 font-black uppercase tracking-[0.5em] italic">Aucune donnée de vente pour cette période</td></tr>}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Sector: Stock Valuation */}
         {activeSectors.includes('stock') && (
            <div className="glass-card bg-white p-10 rounded-[48px] border-emerald-100 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-navy-50">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-navy-50 text-navy-950 rounded-3xl flex items-center justify-center shadow-inner">
                        <Package className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-navy-950 uppercase tracking-widest">Valorisation des Actifs</h3>
                        <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] italic opacity-40">Audit du Stock Initial</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xl font-black text-emerald-600">{store.formatCurrency(totalStockValue)}</p>
                     <p className="text-[9px] font-black uppercase text-blue-gray">Valeur Asset Totale</p>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-navy-50/50 text-[9px] font-black uppercase tracking-widest text-blue-gray">
                           <th className="p-5">Article</th>
                           <th className="p-5">Secteur</th>
                           <th className="p-5 text-right">Qty</th>
                           <th className="p-5 text-right">P.A Unit</th>
                           <th className="p-5 text-right">Valorisation</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-navy-50">
                        {allProducts.map((p, i) => (
                           <tr key={i} className="hover:bg-navy-50/20 transition-colors">
                              <td className="p-5 text-[10px] font-black text-navy-950 uppercase">{p.name}</td>
                              <td className="p-5 text-[9px] font-black text-blue-gray uppercase">{p.category || 'GENERAL'}</td>
                              <td className="p-5 text-right text-[10px] font-black text-navy-950">{p.quantity}</td>
                              <td className="p-5 text-right text-[10px] font-black text-navy-950">{store.formatCurrency(p.cost)}</td>
                              <td className="p-5 text-right text-[10px] font-black text-emerald-600">{store.formatCurrency(p.quantity * p.cost)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}
