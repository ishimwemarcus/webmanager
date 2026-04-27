import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { printThermalReport, printFullMasterReport } from '../utils/Reporter';
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

import { generateDailySummary, shareDailyReport, generateBusinessIntelligence } from '../utils/Reporter';
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

  const { dailySales, dailyLedger, dailyLosses, dailyShifts, totalSalesRev, totalSalesCash, totalSalesDebt, totalExpense, totalReceivable, totalLossValuation, netCashCollected, intelligence, anomalies, ecoImpact } = useMemo(() => {
    const sales = allSales.filter(s => s.date && s.date.startsWith(reportDate));
    const ledger = allLedger.filter(l => l.date && l.date.startsWith(reportDate));
    const losses = allLosses.filter(l => l.date && l.date.startsWith(reportDate));
    const shifts = allShifts.filter(s => s.end && s.end.startsWith(reportDate));

    // Intelligence Data
    const bizIntel = generateBusinessIntelligence(sales);

    // Anomalies
    const lowStockAlerts = allProducts.filter(p => (parseFloat(p.quantity)||0) < 5);
    const unpaidDebtAlerts = allLedger.filter(l => l.type === 'receivable' && (parseFloat(l.amount)||0) > 0);

    // Eco Impact (Heuristic: tracking spoilage reduction)
    const spoilagePercentage = reportData.totalSales > 0 ? (reportData.totalLossValuation / reportData.totalSales) * 100 : 0;
    const ecoImpact = {
       wasteReduced: spoilagePercentage < 2 ? 'Optimal (< 2% Perte)' : 'Attention (> 2% Perte)',
       isOptimal: spoilagePercentage < 2
    };

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
      netCashCollected: reportData.netProfit,
      intelligence: bizIntel,
      anomalies: { lowStock: lowStockAlerts, unpaidDebt: unpaidDebtAlerts },
      ecoImpact
    };
  }, [allSales, allLedger, allLosses, reportDate, allShifts, reportData, allProducts]);

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
        { text: 'ACCOUNTING & OPERATIONS REPORT', style: 'mainHeader' },
        { text: `Operating Date: ${reportDate}`, style: 'mainSubheader' },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
        { text: '\n' },

        ...(activeSectors.includes('sales') || activeSectors.includes('ledger') || activeSectors.includes('losses') ? [
          { text: 'FINANCIAL PERFORMANCE SUMMARY', style: 'sectionHeader' },
          {
            layout: 'noBorders',
            table: {
              widths: ['*', 'auto'],
              body: [
                ...(activeSectors.includes('sales') ? [
                  ['Gross Sales Revenue', { text: store.formatCurrency(totalSalesRev), alignment: 'right' }],
                  ['Cash Liquid Collected', { text: store.formatCurrency(totalSalesCash), alignment: 'right' }]
                ] : []),
                ...(activeSectors.includes('ledger') ? [
                  [{ text: 'Operating Expenses', color: 'red' }, { text: store.formatCurrency(totalExpense), alignment: 'right', color: 'red' }]
                ] : []),
                ...(activeSectors.includes('losses') ? [
                  [{ text: 'Losses (Spoilage)', color: 'red' }, { text: store.formatCurrency(totalLossValuation), alignment: 'right', color: 'red' }]
                ] : []),
                ['', ''], // spacer
                [{ text: 'ADJUSTED NET PROFIT', style: 'netProfitLabel' }, { text: store.formatCurrency(netCashCollected), style: 'netProfitValue' }]
              ]
            }
          },
          { text: '\n' }
        ] : []),

        // Business Intelligence Section
        { text: 'BUSINESS INTELLIGENCE & DECISION SUPPORT', style: 'sectionHeader' },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Top Performing Articles\n', bold: true, color: '#10B981', fontSize: 10 },
                ...(intelligence.topProducts.length > 0 ? intelligence.topProducts.map(p => `${p.name.toUpperCase()}: ${p.qty} Units Sold\n`) : ['No data\n'])
              ],
              fontSize: 9
            },
            {
              width: '*',
              text: [
                { text: 'Operator Efficiency\n', bold: true, color: '#F59E0B', fontSize: 10 },
                ...(intelligence.topOperators.length > 0 ? intelligence.topOperators.slice(0,3).map(o => `${o.name.toUpperCase()}: ${store.formatCurrency(o.revenue)} (${o.transactions} Tx)\n`) : ['No data\n'])
              ],
              fontSize: 9
            },
            {
              width: '*',
              text: [
                { text: 'Eco-Impact & Alerts\n', bold: true, color: ecoImpact.isOptimal ? '#10B981' : '#EF4444', fontSize: 10 },
                `System Status: ${anomalies.lowStock.length === 0 && anomalies.unpaidDebt.length === 0 ? 'NOMINAL' : 'ATTENTION REQUIRED'}\n`,
                `Spoilage Status: ${ecoImpact.wasteReduced}\n`,
                `Low Stock Alerts: ${anomalies.lowStock.length}\n`,
                `Active Debts: ${anomalies.unpaidDebt.length}\n`
              ],
              fontSize: 9
            }
          ]
        },
        { text: '\n' },

        // Dynamic Content Based on Active Sectors
        ...(activeSectors.includes('sales') ? [
          { text: 'SALES TRANSACTIONS', style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Time', style: 'tableHeader' },
                  { text: 'Operator', style: 'tableHeader' },
                  { text: 'Client', style: 'tableHeader' },
                  { text: 'Product', style: 'tableHeader' },
                  { text: 'Qty', style: 'tableHeader', alignment: 'right' },
                  { text: 'Total', style: 'tableHeader', alignment: 'right' },
                  { text: 'Paid', style: 'tableHeader', alignment: 'right' },
                  { text: 'Debt', style: 'tableHeader', alignment: 'right' }
                ],
                ...dailySales.map(s => {
                  const debt = (parseFloat(s.amount)||0) - (parseFloat(s.paid)||0);
                  return [
                    new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    (s.operator || 'ADMIN').toUpperCase(),
                    (s.client || 'STANDARD').toUpperCase(),
                    s.name,
                    { text: s.quantity, alignment: 'right' },
                    { text: store.formatCurrency(s.amount), alignment: 'right' },
                    { text: store.formatCurrency(s.paid), alignment: 'right', color: '#10B981', bold: true },
                    { text: debt > 0 ? store.formatCurrency(debt) : '-', alignment: 'right', color: debt > 0 ? '#EF4444' : '#94A3B8', bold: debt > 0 }
                  ];
                })
              ]
            },
            layout: 'lightHorizontalLines'
          },
          { text: '\n' }
        ] : []),

        ...(activeSectors.includes('ledger') || activeSectors.includes('losses') ? [
          { text: 'LEDGER & LOSS LOG', style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', '*', 'auto'],
              body: [
                [
                  { text: 'Type', style: 'tableHeader' },
                  { text: 'Time', style: 'tableHeader' },
                  { text: 'Entity', style: 'tableHeader' },
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Amount', style: 'tableHeader', alignment: 'right' }
                ],
                ...dailyLedger.map(l => [
                  { text: l.type.toUpperCase(), color: l.type === 'expense' ? 'red' : '#10B981', bold: true },
                  new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  (l.client || 'SYSTEM').toUpperCase(),
                  l.name,
                  { text: store.formatCurrency(l.amount), alignment: 'right' }
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          },
          { text: '\n' }
        ] : []),

        ...(activeSectors.includes('stock') ? [
          { text: 'INVENTORY / ASSET VALUATION', style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Product', style: 'tableHeader' },
                  { text: 'Qty', style: 'tableHeader', alignment: 'right' },
                  { text: 'Unit Cost', style: 'tableHeader', alignment: 'right' },
                  { text: 'Asset Value', style: 'tableHeader', alignment: 'right' }
                ],
                ...allProducts.map(p => [
                  p.name,
                  { text: p.quantity, alignment: 'right' },
                  { text: store.formatCurrency(p.cost), alignment: 'right' },
                  { text: store.formatCurrency(p.quantity * p.cost), alignment: 'right', bold: true }
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          },
          { text: `Total Inventory Asset Valuation: ${store.formatCurrency(allProducts.reduce((acc, p) => acc + (p.quantity * p.cost), 0))}`, alignment: 'right', bold: true, margin: [0, 10, 0, 0] }
        ] : [])
      ],
      styles: {
        mainHeader: { fontSize: 24, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
        mainSubheader: { fontSize: 10, alignment: 'center', color: '#64748B', margin: [0, 0, 0, 20] },
        sectionHeader: { fontSize: 12, bold: true, margin: [0, 20, 0, 10], underline: true },
        tableHeader: { fontSize: 9, bold: true, color: '#64748B' },
        netProfitLabel: { fontSize: 16, bold: true, margin: [0, 10, 0, 0] },
        netProfitValue: { fontSize: 16, bold: true, alignment: 'right', margin: [0, 10, 0, 0] }
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

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 1. Intelligence & Summary Section
    if (activeSectors.includes('sales') || activeSectors.includes('ledger') || activeSectors.includes('losses')) {
      csvContent += "=== BUSINESS INTELLIGENCE & SUMMARY ===\n";
      if (activeSectors.includes('sales')) csvContent += `Gross Sales Revenue,${totalSalesRev}\n`;
      if (activeSectors.includes('sales')) csvContent += `Cash Liquid Collected,${totalSalesCash}\n`;
      if (activeSectors.includes('ledger')) csvContent += `Operating Expenses,${totalExpense}\n`;
      if (activeSectors.includes('losses')) csvContent += `Losses (Spoilage),${totalLossValuation}\n`;
      csvContent += `Adjusted Net Profit,${netCashCollected}\n`;
      csvContent += `System Status,${anomalies.lowStock.length === 0 && anomalies.unpaidDebt.length === 0 ? 'NOMINAL' : 'ATTENTION REQUIRED'}\n`;
      csvContent += `Eco-Impact (Spoilage),${ecoImpact.wasteReduced}\n\n`;
    }

    // 2. Transaction Log
    csvContent += "=== TRANSACTION LOG ===\n";
    csvContent += "Type,Date,Operateur,Client,Article,Quantite,Montant,Paye,Dette,Statut\n";
    
    if (activeSectors.includes('sales')) {
      dailySales.forEach(s => {
        const debt = (parseFloat(s.amount)||0) - (parseFloat(s.paid)||0);
        csvContent += `Vente,${s.date},${s.operator || 'ADMIN'},${s.client || 'STANDARD'},${s.name},${s.quantity},${s.amount},${s.paid},${Math.max(0, debt)},${s.status || 'N/A'}\n`;
      });
    }

    if (activeSectors.includes('ledger') || activeSectors.includes('losses')) {
      dailyLedger.forEach(l => {
        csvContent += `Finance (${l.type}),${l.date},${l.operator || 'ADMIN'},${l.client || 'SYSTEM'},${l.name},,${l.amount},,,${l.type}\n`;
      });
    }

    // 3. Inventory Section
    if (activeSectors.includes('stock')) {
      csvContent += "\n=== INVENTORY & ASSETS ===\n";
      csvContent += "Product,Qty,Unit Cost,Asset Value\n";
      allProducts.forEach(p => {
        csvContent += `${p.name},${p.quantity},${p.cost},${p.quantity * p.cost}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MARC-Report-${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    store.showAlert("Export CSV terminé avec succès !");
  };


  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(1.6rem,5vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Intelligence d'Affaires
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.3em] uppercase italic opacity-60">
            Audit Analytique — Reporting Haute Fidélité
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <button 
               onClick={() => {
                  printFullMasterReport({
                     reportDate,
                     financials: reportData,
                     sales: activeSectors.includes('sales') ? dailySales : [],
                     ledger: activeSectors.includes('ledger') ? dailyLedger : [],
                     inventory: activeSectors.includes('stock') ? allProducts : [],
                     shifts: activeSectors.includes('shifts') ? dailyShifts : [],
                     activeSectors
                  }, store.formatCurrency);
               }}
               className="p-3 bg-white border border-emerald-100 rounded-xl text-navy-950 hover:bg-emerald-50 transition-all shadow-sm no-print"
            >
               <Printer className="w-4 h-4" />
            </button>
           <button onClick={handleDownloadCSV} className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-900 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-100 transition-all shadow-sm">
             <FileText className="w-4 h-4 text-emerald-600" /> CSV
           </button>
           <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 px-5 py-3 bg-navy-950 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
             <Download className="w-4 h-4 text-emerald-400" /> PDF
           </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="glass-card bg-white rounded-[var(--fluid-radius-lg)] border-emerald-100 shadow-xl no-print">
         <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
               <p className="text-[9px] font-black uppercase tracking-widest text-blue-gray italic mr-1">Domaines :</p>
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
                   className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border font-black text-[8px] uppercase tracking-widest ${activeSectors.includes(s.id) ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white text-blue-gray border-emerald-100 hover:border-emerald-400'}`}
                 >
                   {activeSectors.includes(s.id) ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                   {s.label}
                 </button>
               ))}
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 self-start">
               <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
               <input
                 type="date"
                 value={reportDate}
                 onChange={(e) => setReportDate(e.target.value)}
                 className="bg-transparent font-black text-navy-950 outline-none cursor-pointer text-sm uppercase tracking-widest w-full"
               />
            </div>
         </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="card-grid">
         {[
           { icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100', label: 'Revenus Bruts', val: totalSalesRev, valColor: 'text-navy-950' },
           { icon: Wallet, bg: 'bg-navy-50', color: 'text-navy-950', border: 'border-navy-100', label: 'Liquidité Encaissée', val: totalSalesCash, valColor: 'text-navy-950' },
           { icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100', label: 'En Attente', val: dailySales.filter(s => s.status === 'waiting').reduce((acc, s) => acc + (parseFloat(s.amount)||0), 0), valColor: 'text-amber-600' },
           { icon: TrendingDown, bg: 'bg-rose-50', color: 'text-rose-500', border: 'border-rose-100', label: 'Dépenses', val: totalExpense, valColor: 'text-rose-600' },
         ].map((m, i) => (
           <div key={i} className={`glass-card bg-white border ${m.border} shadow-sm relative overflow-hidden`}>
              <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-4 shadow-inner`}>
                 <m.icon className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-gray mb-1 italic">{m.label}</p>
              <p className={`text-[clamp(1.25rem,3vw,1.875rem)] font-black ${m.valColor} tracking-tighter`}>{store.formatCurrency(m.val)}</p>
           </div>
         ))}
         <div className="glass-card bg-navy-950 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Activity className="w-12 h-12" />
            </div>
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 border border-white/10">
               <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 italic">Profit Net Ajusté</p>
            <p className="text-[clamp(1.25rem,3vw,1.875rem)] font-black text-white tracking-tighter">{store.formatCurrency(netCashCollected)}</p>
         </div>
      </div>

      {/* Decision Support & Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
         {/* Top Performance (Intelligence) */}
         <div className="lg:col-span-2 glass-card bg-white p-8 rounded-[40px] border-emerald-100 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
               <h3 className="text-xs font-black uppercase text-navy-950 tracking-widest flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Articles Populaires
               </h3>
               {intelligence.topProducts.length > 0 ? intelligence.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-navy-50 rounded-2xl">
                     <span className="text-sm font-bold text-navy-950 uppercase">{p.name}</span>
                     <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl">{p.qty} vendus</span>
                  </div>
               )) : <p className="text-xs text-blue-gray italic">Aucune donnée disponible.</p>}
            </div>
            
            <div className="w-px bg-navy-50 hidden md:block"></div>
            
            <div className="flex-1 space-y-4">
               <h3 className="text-xs font-black uppercase text-navy-950 tracking-widest flex items-center gap-2 mb-4">
                  <Cpu className="w-4 h-4 text-amber-500" /> Performance Équipe
               </h3>
               {intelligence.topOperators.length > 0 ? intelligence.topOperators.slice(0,3).map((op, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
                     <span className="text-sm font-bold text-amber-900 uppercase">{op.name}</span>
                     <div className="text-right">
                        <p className="text-xs font-black text-amber-600">{store.formatCurrency(op.revenue)}</p>
                        <p className="text-[9px] font-black uppercase text-amber-500/60 tracking-widest">{op.transactions} Tx</p>
                     </div>
                  </div>
               )) : <p className="text-xs text-blue-gray italic">Aucune donnée disponible.</p>}
            </div>
         </div>

         {/* Anomalies & Eco-Impact */}
         <div className="glass-card bg-navy-950 p-8 rounded-[40px] shadow-sm flex flex-col gap-6 text-white">
            <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-400" /> Analyse & Alertes
            </h3>
            
            {/* Alerts */}
            <div className="space-y-3">
               {anomalies.lowStock.length > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Stock Critique</span>
                     <span className="text-xs font-black text-rose-500">{anomalies.lowStock.length} Articles</span>
                  </div>
               )}
               {anomalies.unpaidDebt.length > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Dettes en Cours</span>
                     <span className="text-xs font-black text-amber-500">{anomalies.unpaidDebt.length} Dossiers</span>
                  </div>
               )}
               {anomalies.lowStock.length === 0 && anomalies.unpaidDebt.length === 0 && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Statut Opérationnel</span>
                     <span className="text-xs font-black text-emerald-500">OPTIMAL</span>
                  </div>
               )}
            </div>

            {/* Eco Impact */}
            <div className={`mt-auto p-5 rounded-2xl border ${ecoImpact.isOptimal ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'}`}>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Impact Éco (Pertes)</p>
               <p className={`text-sm font-black uppercase ${ecoImpact.isOptimal ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ecoImpact.wasteReduced}
               </p>
            </div>
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
                                 <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${
                                    s.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                                    s.status === 'waiting' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-rose-50 text-rose-500'
                                 }`}>{s.status}</span>
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
