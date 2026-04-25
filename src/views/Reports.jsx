import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { printThermalReport } from '../utils/Reporter';
import { Download, Calendar, Printer, FileText, TrendingUp, TrendingDown, Clock, Filter, Package, Trash2, CheckSquare, Square, Activity } from 'lucide-react';

import { getFormattedQuantity } from '../utils/ProductUtils';
export default function Reports() {
  const store = useStore();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const allSales = store.getSales() || [];
  const allLedger = store.getLedgerManual() || [];
  const allLosses = store.getLosses() || [];
  const allProducts = store.getProducts() || [];
  const allShifts = store.getShifts() || [];
  const [activeSectors, setActiveSectors] = useState(['sales', 'ledger', 'stock', 'losses', 'shifts']);

  const { dailySales, dailyLedger, dailyLosses, dailyShifts, totalSalesRev, totalSalesCash, totalSalesDebt, totalExpense, totalReceivable, totalLossValuation, netCashCollected } = useMemo(() => {
    const sales = allSales.filter(s => s.date && s.date.startsWith(reportDate));
    const ledger = allLedger.filter(l => l.date && l.date.startsWith(reportDate));
    const losses = allLosses.filter(l => l.date && l.date.startsWith(reportDate));
    const shifts = allShifts.filter(s => s.end && s.end.startsWith(reportDate));

    const rev = sales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const cash = sales.reduce((sum, s) => sum + (parseFloat(s.paid) || 0), 0);
    const exp = ledger.filter(l => l.type === 'expense').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
    const rec = ledger.filter(l => l.type === 'receivable').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
    const lossVal = losses.reduce((sum, l) => sum + (parseFloat(l.valuation) || 0), 0);

    return {
      dailySales: sales,
      dailyLedger: ledger,
      dailyLosses: losses,
      dailyShifts: shifts,
      totalSalesRev: rev,
      totalSalesCash: cash,
      totalSalesDebt: rev - cash,
      totalExpense: exp,
      totalReceivable: rec,
      totalLossValuation: lossVal,
      netCashCollected: cash + rec - exp - lossVal
    };
  }, [allSales, allLedger, allLosses, reportDate]);

  const totalStockValue = useMemo(() =>
    allProducts.reduce((sum, p) => sum + ((parseFloat(p.cost) || 0) * (parseFloat(p.quantity) || 0)), 0),
    [allProducts]
  );

  const toggleSector = (sector) => {
    setActiveSectors(prev => prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]);
  };

  const handleDownloadPDF = () => {
    if (!window.pdfMake) {
      store.showAlert("PDF Engine is loading or unavailable.", "warning");
      return;
    }

    const content = [
      { text: 'ACCOUNTING & OPERATIONS REPORT', style: 'header', alignment: 'center' },
      { text: `Operating Date: ${reportDate}`, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] }
    ];

    if (activeSectors.length === 0) {
      store.showAlert("Please select at least one sector for export.", "warning");
      return;
    }

    // 1. Financial Summary always included if we have sales/ledger/losses
    content.push({ text: 'FINANCIAL PERFORMANCE SUMMARY', style: 'sectionTitle', margin: [0, 10, 0, 10] });
    content.push({
      table: {
        widths: ['*', 'auto'],
        body: [
          [{ text: 'Gross Sales Revenue', bold: true }, { text: store.formatCurrency(totalSalesRev), alignment: 'right' }],
          [{ text: 'Cash Liquid Collected', bold: true }, { text: store.formatCurrency(totalSalesCash), alignment: 'right' }],
          [{ text: 'Operating Expenses', bold: true, color: 'red' }, { text: store.formatCurrency(totalExpense), alignment: 'right', color: 'red' }],
          [{ text: 'Losses (Spoilage)', bold: true, color: 'red' }, { text: store.formatCurrency(totalLossValuation), alignment: 'right', color: 'red' }],
          [{ text: 'ADJUSTED NET PROFIT', bold: true, fontSize: 14 }, { text: store.formatCurrency(netCashCollected), alignment: 'right', fontSize: 14, bold: true }]
        ]
      },
      layout: 'noBorders'
    });

    if (activeSectors.includes('sales')) {
      content.push({ text: 'SALES TRANSACTIONS', style: 'sectionTitle', margin: [0, 30, 0, 10] });
      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', 'auto', 'auto', 'auto'],
          body: [
            [{ text: 'Time', style: 'th' }, { text: 'Operator', style: 'th' }, { text: 'Client', style: 'th' }, { text: 'Product', style: 'th' }, { text: 'Qty', style: 'th', alignment: 'right' }, { text: 'Total', style: 'th', alignment: 'right' }, { text: 'Paid', style: 'th', alignment: 'right' }],
            ...dailySales.map(s => {
              const time = s.date ? new Date(s.date) : null;
              return [
                (time && !isNaN(time)) ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                { text: (s.operator || 'ADMIN').toUpperCase(), bold: true, color: '#666666' },
                s.client || 'Unknown',
                s.name, // Assuming s.name is product name
                { text: getFormattedQuantity(allProducts.find(p => p.product_id === s.product_id)), alignment: 'right' },
                { text: store.formatCurrency(s.amount), alignment: 'right' },
                { text: store.formatCurrency(s.paid), alignment: 'right', color: (s.paid < s.amount) ? 'red' : 'green' }
              ];
            })
          ]
        },
        layout: 'lightHorizontalLines'
      });
    }

    if (activeSectors.includes('ledger')) {
      content.push({ text: 'LEDGER & LOSS LOG', style: 'sectionTitle', margin: [0, 30, 0, 10] });
      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', '*', 'auto'],
          body: [
            [{ text: 'Type', style: 'th' }, { text: 'Time', style: 'th' }, { text: 'Entity', style: 'th' }, { text: 'Description', style: 'th' }, { text: 'Amount', style: 'th', alignment: 'right' }],
            ...dailyLedger.map(l => [
              { text: l.type.toUpperCase(), color: l.type === 'expense' ? 'red' : 'green', bold: true },
              new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              l.client || 'SYSTEM',
              l.description,
              { text: store.formatCurrency(l.amount), alignment: 'right' }
            ]),
            ...dailyLosses.map(l => [
              { text: 'LOSS/PERTE', color: 'orange', bold: true },
              new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              'INVENTORY',
              l.name + ' (' + l.reason + ')',
              { text: store.formatCurrency(l.valuation), alignment: 'right' }
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      });
    }

    if (activeSectors.includes('stock')) {
      content.push({ text: 'INVENTORY / ASSET VALUATION', style: 'sectionTitle', margin: [0, 30, 0, 10] });
      content.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [{ text: 'Product', style: 'th' }, { text: 'Qty', style: 'th', alignment: 'right' }, { text: 'Unit Cost', style: 'th', alignment: 'right' }, { text: 'Asset Value', style: 'th', alignment: 'right' }],
            ...allProducts.map(p => [ 
              p.name,
              { text: getFormattedQuantity(p), alignment: 'right', bold: true },
              { text: store.formatCurrency(p.cost), alignment: 'right' },
              { text: store.formatCurrency(p.quantity * p.cost), alignment: 'right', bold: true }
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      });
      content.push({ text: `Total Inventory Asset Valuation: ${store.formatCurrency(totalStockValue)}`, style: 'total', alignment: 'right', margin: [0, 10, 0, 0] });
    }

    if (activeSectors.includes('shifts')) {
      content.push({ text: 'EMPLOYEE SHIFT PERFORMANCE', style: 'sectionTitle', margin: [0, 30, 0, 10] });
      content.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [{ text: 'Operator', style: 'th' }, { text: 'Shift Period', style: 'th' }, { text: 'Transactions', style: 'th', alignment: 'right' }, { text: 'Revenue', style: 'th', alignment: 'right' }],
            ...dailyShifts.map(sh => [
              sh.operator.toUpperCase(),
              `${new Date(sh.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${new Date(sh.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
              { text: sh.transactions + ' Tx', alignment: 'right' },
              { text: store.formatCurrency(sh.revenue), alignment: 'right', bold: true }
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      });
    }

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: content,
      styles: {
        header: { fontSize: 22, bold: true, color: '#1a1a1a', margin: [0, 0, 0, 5] },
        subheader: { fontSize: 10, color: '#666666', bold: true, letterSpacing: 2 },
        sectionTitle: { fontSize: 13, bold: true, color: '#1a1a1a', margin: [0, 20, 0, 10], decoration: 'underline' },
        th: { fontSize: 9, bold: true, color: '#444444', fillColor: '#f8f9fa', padding: [6, 10] },
        total: { fontSize: 12, bold: true, margin: [0, 20, 0, 0] }
      },
      defaultStyle: { fontSize: 10, color: '#333333' }
    };

    if (window.pdfMakeFonts && window.pdfMakeFonts.pdfMake) {
      window.pdfMake.vfs = window.pdfMakeFonts.pdfMake.vfs;
    } else if (typeof pdfMake !== 'undefined' && pdfMake.vfs) {
      window.pdfMake.vfs = pdfMake.vfs;
    }

    try {
      window.pdfMake.createPdf(docDefinition).download(`Custom_Report_${reportDate}.pdf`);
    } catch (err) {
      store.showAlert("PDF Generation Failed: Check column alignment.", "error");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 no-print">
        <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">Intelligence d'Affaires</h1>
        <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase mt-1">Auditeur Multi-Secteurs</h2>
      </div>

      <div className="flex flex-col gap-6 no-print">
        <div className="flex flex-col gap-4 glass-card p-4 md:p-6 shadow-xl bg-white border border-navy-50">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray">Secteurs:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sales', label: 'Ventes' },
                { id: 'ledger', label: 'Grand Livre' },
                { id: 'stock', label: 'Stock' },
                { id: 'losses', label: 'Pertes' },
                { id: 'shifts', label: 'Postes' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSector(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${activeSectors.includes(s.id) ? 'bg-navy-brand text-white border-navy-brand' : 'bg-white text-blue-gray border-navy-100'}`}
                >
                  {activeSectors.includes(s.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  <span className="text-xs md:text-sm font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-gray" />
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="bg-transparent font-black text-navy-950 outline-none cursor-pointer text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleDownloadPDF} className="bg-navy-950 text-white px-4 md:px-8 py-3 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={() => printThermalReport({
                  totalSales: totalSalesRev,
                  cashCollected: totalSalesCash,
                  totalExpenses: totalExpense,
                  totalLossValuation: totalLossValuation,
                  netProfit: netCashCollected,
                  performance: netCashCollected > 0 ? 'STATUT: STABLE' : 'STATUT: DÉFICIT'
                }, store.formatCurrency)}
                className="bg-[#2563eb] text-white px-4 md:px-8 py-3 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <div className="glass-card flex flex-col justify-center border-l-8 border-emerald-500 bg-white shadow-xl group hover:scale-[1.02] transition-all">
          <p className="text-xs md:text-sm font-black uppercase text-blue-gray tracking-widest mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Revenus des Ventes</p>
          <p className="text-3xl font-black text-navy-950">{store.formatCurrency(totalSalesRev)}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-l-8 border-navy-brand bg-white shadow-xl">
          <p className="text-xs md:text-sm font-black uppercase text-blue-gray tracking-widest mb-1 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-navy-brand" /> Dettes Émises</p>
          <p className="text-3xl font-black text-navy-950">{store.formatCurrency(totalSalesDebt)}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-l-8 border-rose-500 bg-white shadow-xl">
          <p className="text-xs md:text-sm font-black uppercase text-blue-gray tracking-widest mb-1 flex items-center gap-2"><Trash2 className="w-4 h-4 text-rose-500" /> Pertes (Avaries)</p>
          <p className="text-3xl font-black text-navy-950">{store.formatCurrency(totalLossValuation)}</p>
        </div>
        <div className={`glass-card flex flex-col justify-center border-l-8 bg-white shadow-xl ${netCashCollected >= 0 ? 'border-emerald-400' : 'border-rose-400'}`}>
          <p className="text-xs md:text-sm font-black uppercase text-blue-gray tracking-widest mb-1 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-gray" /> MARGE NETTE</p>
          <p className={`text-3xl font-black ${netCashCollected >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{store.formatCurrency(netCashCollected)}</p>
        </div>
      </div>

      <div className="space-y-12">
        {activeSectors.includes('sales') && (
          <div className="glass-card rounded-[24px] overflow-hidden border border-navy-50 bg-white shadow-2xl">
            <div className="p-6 md:p-8 border-b border-navy-50 bg-navy-50/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-brand text-white flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-navy-brand">Manifeste des Transactions Actives</h3>
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-navy-50/50 text-xs md:text-sm font-black uppercase text-blue-gray">
                    <th className="p-6">Heure</th>
                    <th className="p-6">Identité du Client</th>
                    <th className="p-6">Produit</th>
                    <th className="p-6 text-right">Valeur</th>
                    <th className="p-6 text-right">Payé</th>
                    <th className="p-6 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailySales.map((s, idx) => (
                    <tr key={idx} className="hover:bg-navy-50/50 transition-colors">
                      <td className="p-6 text-xs text-blue-gray font-bold">{s.date ? new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                      <td className="p-6 text-xs font-black uppercase text-navy-brand">{s.client}</td>
                      <td className="p-6 text-xs font-bold text-navy-950/70">{s.name}</td>
                      <td className="p-6 text-right text-xs font-bold text-navy-950">{store.formatCurrency(s.amount)}</td>
                      <td className="p-6 text-right text-xs font-black text-emerald-600">{store.formatCurrency(s.paid)}</td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border-2 ${s.paid >= s.amount ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          {s.paid >= s.amount ? 'PAYÉ' : 'CRÉDIT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSectors.includes('ledger') && (
          <div className="glass-card rounded-[24px] overflow-hidden border border-navy-50 bg-white shadow-2xl">
            <div className="p-8 border-b border-navy-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center"><Clock className="w-5 h-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#2563eb]">Activité du Grand Livre et Pertes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-navy-50/50 text-xs md:text-sm font-black uppercase text-blue-gray">
                    <th className="p-6">Type</th>
                    <th className="p-6">Heure</th>
                    <th className="p-6">Description / Raison</th>
                    <th className="p-6 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailyLedger.map((l, idx) => (
                    <tr key={`ledger-${idx}`}>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${l.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{l.type === 'expense' ? 'DÉPENSE' : 'ENTRÉE'}</span>
                      </td>
                      <td className="p-6 text-xs font-bold text-blue-gray">{l.date ? new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                      <td className="p-6 text-xs font-black text-navy-950 italic">{l.description}</td>
                      <td className="p-6 text-right text-xs font-black text-navy-950">{store.formatCurrency(l.amount)}</td>
                    </tr>
                  ))}
                  {dailyLosses.map((l, idx) => (
                    <tr key={`loss-${idx}`}>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-orange-50 text-orange-600">PERTE (AVARIE)</span>
                      </td>
                      <td className="p-6 text-xs font-bold text-blue-gray">{l.date ? new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                      <td className="p-6 text-xs font-black text-navy-950 italic">{l.name} - Raison: {l.reason}</td>
                      <td className="p-6 text-right text-xs font-black text-rose-600">-{store.formatCurrency(l.valuation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSectors.includes('shifts') && (
          <div className="glass-card rounded-[24px] overflow-hidden border border-navy-50 bg-white shadow-2xl">
            <div className="p-8 border-b border-navy-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center"><Activity className="w-5 h-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-orange-500">Rapport de Vacation (Postes)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-navy-50/50 text-xs md:text-sm font-black uppercase text-blue-gray">
                    <th className="p-6">Employé</th>
                    <th className="p-6">Horaires</th>
                    <th className="p-6 text-right">Transactions</th>
                    <th className="p-6 text-right">Recette Totale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailyShifts.map((sh, idx) => (
                    <tr key={`shift-${idx}`}>
                      <td className="p-6 font-black uppercase text-navy-950">{sh.operator}</td>
                      <td className="p-6 text-xs font-bold text-blue-gray">
                        {new Date(sh.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(sh.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="p-6 text-right text-xs font-black text-navy-950">{sh.transactions} Tx</td>
                      <td className="p-6 text-right text-xs font-black text-emerald-600">{store.formatCurrency(sh.revenue)}</td>
                    </tr>
                  ))}
                  {dailyShifts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-blue-gray font-black uppercase tracking-widest opacity-20 italic">Aucune vacation enregistrée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
