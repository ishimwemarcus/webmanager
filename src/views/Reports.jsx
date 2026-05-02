import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t, L, lang } = useLanguage();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const allSales = store.getSales() || [];
  const allLedger = store.getLedgerManual() || [];
  const allLosses = store.getLosses ? store.getLosses() : [];
  const allProducts = store.getProducts() || [];
  const allShifts = store.getShifts ? store.getShifts() : [];
  const [activeSectors, setActiveSectors] = useState(['sales', 'ledger', 'stock', 'losses', 'shifts']);

  const summaryData = useMemo(() => generateDailySummary(allSales, [], allLedger, allLosses, reportDate), [allSales, allLedger, allLosses, reportDate]);
  const reportData = summaryData.raw;

  const { dailySales, dailyLedger, dailyLosses, dailyShifts, totalSalesRev, totalSalesCash, totalSalesDebt, totalExpense, totalReceivable, totalLossValuation, netCashCollected, intelligence, anomalies, ecoImpact, bizHealthScore } = useMemo(() => {
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
       wasteReduced: spoilagePercentage < 2 ? L('Optimal (< 2% Loss)', 'Optimal (< 2% Perte)') : L('Warning (> 2% Loss)', 'Attention (> 2% Perte)'),
       isOptimal: spoilagePercentage < 2
    };

    // Business Health Score (0-100)
    let healthScore = 100;
    if (reportData.totalSales > 0) {
      const lossPenalty = (reportData.totalLossValuation / reportData.totalSales) * 50;
      const debtPenalty = (reportData.unpaidLedger / reportData.totalSales) * 30;
      const expensePenalty = (reportData.totalExpenses / reportData.totalSales) * 20;
      healthScore = Math.max(0, Math.min(100, 100 - lossPenalty - debtPenalty - expensePenalty));
    } else if (reportData.totalExpenses > 0) {
      healthScore = 50; // Expense without sales
    }

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
      ecoImpact,
      bizHealthScore: Math.round(healthScore)
    };
  }, [allSales, allLedger, allLosses, reportDate, allShifts, reportData, allProducts, L]);

  const totalStockValue = useMemo(() =>
    allProducts.reduce((sum, p) => sum + ((parseFloat(p.cost) || 0) * (parseFloat(p.quantity) || 0)), 0),
    [allProducts]
  );

  const toggleSector = (sector) => {
    setActiveSectors(prev => prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]);
  };

  const handleDownloadPDF = () => {
    if (!window.pdfMake) {
      store.showAlert(L("The PDF engine is loading...", "Le moteur PDF est en cours de chargement..."), "warning");
      return;
    }

    const docDefinition = {
      content: [
        { text: L('ACCOUNTING & OPERATIONS REPORT', 'RAPPORT COMPTABLE & OPÉRATIONNEL'), style: 'mainHeader' },
        { text: `${L('Operating Date', 'Date d\'Opération')}: ${reportDate}`, style: 'mainSubheader' },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
        { text: '\n' },

        ...(activeSectors.includes('sales') || activeSectors.includes('ledger') || activeSectors.includes('losses') ? [
          { text: L('FINANCIAL PERFORMANCE SUMMARY', 'RÉSUMÉ DE LA PERFORMANCE FINANCIÈRE'), style: 'sectionHeader' },
          {
            layout: 'noBorders',
            table: {
              widths: ['*', 'auto'],
              body: [
                ...(activeSectors.includes('sales') ? [
                  [L('Gross Sales Revenue', 'Chiffre d\'Affaires Brut'), { text: store.formatCurrency(totalSalesRev), alignment: 'right' }],
                  [L('Cash Liquid Collected', 'Liquidité Encaissée'), { text: store.formatCurrency(totalSalesCash), alignment: 'right' }]
                ] : []),
                ...(activeSectors.includes('ledger') ? [
                  [{ text: L('Operating Expenses', 'Dépenses Opérationnelles'), color: 'red' }, { text: store.formatCurrency(totalExpense), alignment: 'right', color: 'red' }]
                ] : []),
                ...(activeSectors.includes('losses') ? [
                  [{ text: L('Losses (Spoilage)', 'Pertes (Avaries)'), color: 'red' }, { text: store.formatCurrency(totalLossValuation), alignment: 'right', color: 'red' }]
                ] : []),
                ['', ''], // spacer
                [{ text: L('ADJUSTED NET PROFIT', 'PROFIT NET AJUSTÉ'), style: 'netProfitLabel' }, { text: store.formatCurrency(netCashCollected), style: 'netProfitValue' }]
              ]
            }
          },
          { text: '\n' }
        ] : []),

        // Business Intelligence Section
        { text: L('BUSINESS INTELLIGENCE & DECISION SUPPORT', 'INTELLIGENCE D\'AFFAIRES & SUPPORT DÉCISIONNEL'), style: 'sectionHeader' },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: `${L('Top Performing Articles', 'Articles les plus Performants')}\n`, bold: true, color: '#10B981', fontSize: 10 },
                ...(intelligence.topProducts.length > 0 ? intelligence.topProducts.map(p => `${p.name.toUpperCase()}: ${p.qty} ${L('Units Sold', 'Unités Vendues')}\n`) : [`${L('No data', 'Aucune donnée')}\n`])
              ],
              fontSize: 9
            },
            {
              width: '*',
              text: [
                { text: `${L('Operator Efficiency', 'Efficacité des Opérateurs')}\n`, bold: true, color: '#F59E0B', fontSize: 10 },
                ...(intelligence.topOperators.length > 0 ? intelligence.topOperators.slice(0,3).map(o => `${o.name.toUpperCase()}: ${store.formatCurrency(o.revenue)} (${o.transactions} Tx)\n`) : [`${L('No data', 'Aucune donnée')}\n`])
              ],
              fontSize: 9
            },
            {
              width: '*',
              text: [
                { text: `${L('Eco-Impact & Alerts', 'Impact Éco & Alertes')}\n`, bold: true, color: ecoImpact.isOptimal ? '#10B981' : '#EF4444', fontSize: 10 },
                `${L('System Status', 'Statut Système')}: ${anomalies.lowStock.length === 0 && anomalies.unpaidDebt.length === 0 ? L('NOMINAL', 'NOMINAL') : L('ATTENTION REQUIRED', 'ATTENTION REQUISE')}\n`,
                `${L('Spoilage Status', 'Statut Avaries')}: ${ecoImpact.wasteReduced}\n`,
                `${L('Low Stock Alerts', 'Alertes Stock Bas')}: ${anomalies.lowStock.length}\n`,
                `${L('Active Debts', 'Dettes Actives')}: ${anomalies.unpaidDebt.length}\n`
              ],
              fontSize: 9
            }
          ]
        },
        { text: '\n' },

        // Dynamic Content Based on Active Sectors
        ...(activeSectors.includes('sales') ? [
          { text: L('SALES TRANSACTIONS', 'TRANSACTIONS DE VENTE'), style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: L('Time', 'Heure'), style: 'tableHeader' },
                  { text: L('Operator', 'Opérateur'), style: 'tableHeader' },
                  { text: L('Client', 'Client'), style: 'tableHeader' },
                  { text: L('Product', 'Article'), style: 'tableHeader' },
                  { text: L('Qty', 'Qté'), style: 'tableHeader', alignment: 'right' },
                  { text: L('Total', 'Total'), style: 'tableHeader', alignment: 'right' },
                  { text: L('Paid', 'Payé'), style: 'tableHeader', alignment: 'right' },
                  { text: L('Debt', 'Dette'), style: 'tableHeader', alignment: 'right' }
                ],
                ...dailySales.map(s => {
                  const debt = (parseFloat(s.amount)||0) - (parseFloat(s.paid)||0);
                  return [
                    new Date(s.date).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                    (s.operator || 'ADMIN').toUpperCase(),
                    (s.client || L('STANDARD', 'STANDARD')).toUpperCase(),
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
          { text: L('LEDGER & LOSS LOG', 'LOG DU GRAND LIVRE & PERTES'), style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', 'auto', '*', 'auto'],
              body: [
                [
                  { text: L('Type', 'Type'), style: 'tableHeader' },
                  { text: L('Time', 'Heure'), style: 'tableHeader' },
                  { text: L('Entity', 'Entité'), style: 'tableHeader' },
                  { text: L('Description', 'Description'), style: 'tableHeader' },
                  { text: L('Amount', 'Montant'), style: 'tableHeader', alignment: 'right' }
                ],
                ...dailyLedger.map(l => [
                  { text: (l.type === 'expense' ? L('EXPENSE', 'DÉPENSE') : L('RECEIVABLE', 'CRÉANCE')).toUpperCase(), color: l.type === 'expense' ? 'red' : '#10B981', bold: true },
                  new Date(l.date).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                  (l.client || L('SYSTEM', 'SYSTÈME')).toUpperCase(),
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
          { text: L('INVENTORY / ASSET VALUATION', 'INVENTAIRE / VALORISATION DES ACTIFS'), style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: L('Product', 'Article'), style: 'tableHeader' },
                  { text: L('Qty', 'Qté'), style: 'tableHeader', alignment: 'right' },
                  { text: L('Unit Cost', 'Coût Unit'), style: 'tableHeader', alignment: 'right' },
                  { text: L('Asset Value', 'Valeur Asset'), style: 'tableHeader', alignment: 'right' }
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
          { text: `${L('Total Inventory Asset Valuation', 'Valorisation Totale des Actifs en Stock')}: ${store.formatCurrency(allProducts.reduce((acc, p) => acc + (p.quantity * p.cost), 0))}`, alignment: 'right', bold: true, margin: [0, 10, 0, 0] }
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
      store.showAlert(L("PDF report generated successfully!", "Rapport PDF généré avec succès !"));
    } catch (err) {
      console.error(err);
      store.showAlert(L("Error generating PDF", "Erreur lors de la génération du PDF"), "error");
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 1. Intelligence & Summary Section
    if (activeSectors.includes('sales') || activeSectors.includes('ledger') || activeSectors.includes('losses')) {
      csvContent += `=== ${L('BUSINESS INTELLIGENCE & SUMMARY', 'INTELLIGENCE D\'AFFAIRES & RÉSUMÉ')} ===\n`;
      if (activeSectors.includes('sales')) csvContent += `${L('Gross Sales Revenue', 'Chiffre d\'Affaires Brut')},${totalSalesRev}\n`;
      if (activeSectors.includes('sales')) csvContent += `${L('Cash Liquid Collected', 'Liquidité Encaissée')},${totalSalesCash}\n`;
      if (activeSectors.includes('ledger')) csvContent += `${L('Operating Expenses', 'Dépenses Opérationnelles')},${totalExpense}\n`;
      if (activeSectors.includes('losses')) csvContent += `${L('Losses (Spoilage)', 'Pertes (Avaries)')},${totalLossValuation}\n`;
      csvContent += `${L('Adjusted Net Profit', 'Profit Net Ajusté')},${netCashCollected}\n`;
      csvContent += `${L('System Status', 'Statut Système')},${anomalies.lowStock.length === 0 && anomalies.unpaidDebt.length === 0 ? L('NOMINAL', 'NOMINAL') : L('ATTENTION REQUIRED', 'ATTENTION REQUISE')}\n`;
      csvContent += `${L('Eco-Impact (Spoilage)', 'Impact Éco (Avaries)')},${ecoImpact.wasteReduced}\n\n`;
    }

    // 2. Transaction Log
    csvContent += `=== ${L('TRANSACTION LOG', 'JOURNAL DES TRANSACTIONS')} ===\n`;
    csvContent += `${L('Type,Date,Operator,Client,Item,Quantity,Amount,Paid,Debt,Status', 'Type,Date,Opérateur,Client,Article,Quantité,Montant,Payé,Dette,Statut')}\n`;
    
    if (activeSectors.includes('sales')) {
      dailySales.forEach(s => {
        const debt = (parseFloat(s.amount)||0) - (parseFloat(s.paid)||0);
        csvContent += `${L('Sale', 'Vente')},${s.date},${s.operator || 'ADMIN'},${s.client || L('STANDARD', 'STANDARD')},${s.name},${s.quantity},${s.amount},${s.paid},${Math.max(0, debt)},${s.status || 'N/A'}\n`;
      });
    }

    if (activeSectors.includes('ledger') || activeSectors.includes('losses')) {
      dailyLedger.forEach(l => {
        csvContent += `${L('Finance', 'Finance')} (${l.type === 'expense' ? L('EXPENSE', 'DÉPENSE') : L('RECEIVABLE', 'CRÉANCE')}),${l.date},${l.operator || 'ADMIN'},${l.client || L('SYSTEM', 'SYSTÈME')},${l.name},,${l.amount},,,${l.type}\n`;
      });
    }

    // 3. Inventory Section
    if (activeSectors.includes('stock')) {
      csvContent += `\n=== ${L('INVENTORY & ASSETS', 'INVENTAIRE & ACTIFS')} ===\n`;
      csvContent += `${L('Product,Qty,Unit Cost,Asset Value', 'Article,Qté,Coût Unit,Valeur Asset')}\n`;
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
    store.showAlert(L("CSV export completed successfully!", "Export CSV terminé avec succès !"));
  };


  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(1.6rem,5vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Business Intelligence', 'Intelligence d\'Affaires')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.3em] uppercase italic opacity-60">
            {L('Analytical Audit — High Fidelity Reporting', 'Audit Analytique — Reporting Haute Fidélité')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-emerald-100 shadow-sm">
               <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-navy-50" />
                     <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={106.8} strokeDashoffset={106.8 - (106.8 * bizHealthScore / 100)} className={`${bizHealthScore > 80 ? 'text-emerald-500' : bizHealthScore > 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000`} />
                  </svg>
                  <span className="absolute text-[9px] font-black text-navy-950">{bizHealthScore}%</span>
               </div>
               <div>
                  <p className="text-[7px] font-black uppercase text-blue-gray tracking-widest">{L('Health', 'Santé')}</p>
                  <p className="text-[9px] font-black text-navy-950 uppercase">{bizHealthScore > 80 ? 'Optimal' : bizHealthScore > 50 ? 'Stable' : 'Critical'}</p>
               </div>
            </div>

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
               <p className="text-[9px] font-black uppercase tracking-widest text-blue-gray italic mr-1">{L('Domains:', 'Domaines :')}</p>
               {[
                 { id: 'sales', label: L('Sales', 'Ventes') },
                 { id: 'ledger', label: L('Finance', 'Finance') },
                 { id: 'stock', label: L('Stock', 'Stock') },
                 { id: 'losses', label: L('Losses', 'Pertes') },
                 { id: 'shifts', label: L('Shifts', 'Postes') }
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
           { icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100', label: L('Gross Revenue', 'Revenus Bruts'), val: totalSalesRev, valColor: 'text-navy-950' },
           { icon: Wallet, bg: 'bg-navy-50', color: 'text-navy-950', border: 'border-navy-100', label: L('Cash Collected', 'Liquidité Encaissée'), val: totalSalesCash, valColor: 'text-navy-950' },
           { icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100', label: L('Pending', 'En Attente'), val: dailySales.filter(s => s.status === 'waiting').reduce((acc, s) => acc + (parseFloat(s.amount)||0), 0), valColor: 'text-amber-600' },
           { icon: TrendingDown, bg: 'bg-rose-50', color: 'text-rose-500', border: 'border-rose-100', label: L('Expenses', 'Dépenses'), val: totalExpense, valColor: 'text-rose-600' },
         ].map((m, i) => (
           <div key={i} className={`glass-card bg-white p-4 border ${m.border} shadow-sm relative overflow-hidden rounded-2xl`}>
              <div className={`w-8 h-8 ${m.bg} ${m.color} rounded-lg flex items-center justify-center mb-2 shadow-inner`}>
                 <m.icon className="w-4 h-4" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-gray mb-1 italic">{m.label}</p>
              <p className={`text-xl font-black ${m.valColor} tracking-tighter`}>{store.formatCurrency(m.val)}</p>
           </div>
         ))}
         <div className="glass-card bg-navy-950 p-4 shadow-xl relative overflow-hidden text-white border border-white/5 rounded-2xl">
            <div className="absolute top-0 right-0 p-2 opacity-10">
               <Activity className="w-8 h-8" />
            </div>
            <div className="w-8 h-8 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center mb-2 border border-white/10">
               <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 italic">{L('Adjusted Net Profit', 'Profit Net Ajusté')}</p>
            <p className="text-xl font-black text-white tracking-tighter">{store.formatCurrency(netCashCollected)}</p>
         </div>
      </div>

      {/* Business Intelligence & Peak Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
         <div className="lg:col-span-2 glass-card bg-white p-5 rounded-[24px] border-emerald-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-navy-950 tracking-widest flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> {L('Popular Items', 'Articles Populaires')}
               </h3>
               {intelligence.topProducts.length > 0 ? intelligence.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
                     <span className="text-sm font-bold text-navy-950 uppercase">{p.name}</span>
                     <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl">{p.qty} {L('sold', 'vendus')}</span>
                  </div>
               )) : <p className="text-xs text-blue-gray italic">{L('No data available.', 'Aucune donnée disponible.')}</p>}
            </div>
            
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-navy-950 tracking-widest flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-500" /> {L('Loyal Clients', 'Clients Fidèles')}
               </h3>
               {intelligence.loyalClients.length > 0 ? intelligence.loyalClients.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                     <span className="text-sm font-bold text-amber-900 uppercase">{c.name}</span>
                     <span className="text-xs font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-xl">{c.count} Tx</span>
                  </div>
               )) : <p className="text-xs text-blue-gray italic">{L('No data available.', 'Aucune donnée disponible.')}</p>}
            </div>
            
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-navy-950 tracking-widest flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-indigo-500" /> {L('Peak Hour', 'Pic d\'Affluence')}
               </h3>
               {intelligence.peakHour.hour !== null ? (
                  <div className="p-6 bg-indigo-50 rounded-[32px] text-center space-y-2 border border-indigo-100">
                     <p className="text-3xl font-black text-indigo-600">{intelligence.peakHour.hour}:00</p>
                     <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{intelligence.peakHour.count} {L('Transactions', 'Transactions')}</p>
                  </div>
               ) : <p className="text-xs text-blue-gray italic">{L('No data available.', 'Aucune donnée disponible.')}</p>}
            </div>
         </div>

         {/* Anomalies & Eco-Impact */}
         <div className="glass-card bg-navy-950 p-5 rounded-[24px] shadow-sm flex flex-col gap-5 text-white">
            <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-400" /> {L('Analysis & Alerts', 'Analyse & Alertes')}
            </h3>

            {intelligence.peakHour.hour !== null && (
               <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-emerald-500/10 transition-all">
                  <div className="flex items-center gap-3">
                     <Clock className="w-5 h-5 text-emerald-400" />
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{L('Peak Traffic', 'Pic d\'Affluence')}</p>
                        <p className="text-sm font-black text-white">{intelligence.peakHour.hour}:00</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg">{intelligence.peakHour.count} Tx</span>
               </div>
            )}
            
            {/* Alerts */}
            <div className="space-y-3">
               {anomalies.lowStock.length > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">{L('Critical Stock', 'Stock Critique')}</span>
                     <span className="text-xs font-black text-rose-500">{anomalies.lowStock.length} {L('Items', 'Articles')}</span>
                  </div>
               )}
               {anomalies.unpaidDebt.length > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">{L('Pending Debts', 'Dettes en Cours')}</span>
                     <span className="text-xs font-black text-amber-500">{anomalies.unpaidDebt.length} {L('Files', 'Dossiers')}</span>
                  </div>
               )}
               {anomalies.lowStock.length === 0 && anomalies.unpaidDebt.length === 0 && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{L('Operational Status', 'Statut Opérationnel')}</span>
                     <span className="text-xs font-black text-emerald-500">OPTIMAL</span>
                  </div>
               )}
            </div>

            {/* Eco Impact */}
            <div className={`mt-auto p-5 rounded-2xl border ${ecoImpact.isOptimal ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'}`}>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">{L('Eco Impact (Losses)', 'Impact Éco (Pertes)')}</p>
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
                        <h3 className="text-lg font-black text-navy-950 uppercase tracking-widest">{L('Sales Log', 'Journal des Ventes')}</h3>
                        <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] italic opacity-40">{L('Operational Transactions', 'Transactions Opérationnelles')}</p>
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
                           <th className="p-5">{L('Time', 'Heure')}</th>
                           <th className="p-5">{L('Operator', 'Opérateur')}</th>
                           <th className="p-5">{L('Client', 'Client')}</th>
                           <th className="p-5">{L('Item', 'Article')}</th>
                           <th className="p-5 text-right">{L('Vol.', 'Vol.')}</th>
                           <th className="p-5 text-right">{L('Total', 'Total')}</th>
                           <th className="p-5 text-center">{L('Status', 'Statut')}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-navy-50">
                        {dailySales.map((s, i) => (
                           <tr key={i} className="hover:bg-navy-50/20 transition-colors">
                              <td className="p-5 text-[10px] font-black text-navy-950">{new Date(s.date).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {hour:'2-digit', minute:'2-digit'})}</td>
                              <td className="p-5 text-[9px] font-black text-blue-gray uppercase">{s.operator || 'ADMIN'}</td>
                              <td className="p-5 text-[9px] font-black text-navy-950 uppercase">{s.client || L('STANDARD', 'STANDARD')}</td>
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
                        {dailySales.length === 0 && <tr><td colSpan="7" className="p-20 text-center text-blue-gray/20 font-black uppercase tracking-[0.5em] italic">{L('No sales data for this period', 'Aucune donnée de vente pour cette période')}</td></tr>}
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
                        <h3 className="text-lg font-black text-navy-950 uppercase tracking-widest">{L('Asset Valuation', 'Valorisation des Actifs')}</h3>
                        <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] italic opacity-40">{L('Initial Stock Audit', 'Audit du Stock Initial')}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xl font-black text-emerald-600">{store.formatCurrency(totalStockValue)}</p>
                     <p className="text-[9px] font-black uppercase text-blue-gray">{L('Total Asset Value', 'Valeur Asset Totale')}</p>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-navy-50/50 text-[9px] font-black uppercase tracking-widest text-blue-gray">
                           <th className="p-5">{L('Item', 'Article')}</th>
                           <th className="p-5">{L('Sector', 'Secteur')}</th>
                           <th className="p-5 text-right">{L('Qty', 'Qté')}</th>
                           <th className="p-5 text-right">{L('Unit Cost', 'P.A Unit')}</th>
                           <th className="p-5 text-right">{L('Valuation', 'Valorisation')}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-navy-50">
                        {allProducts.map((p, i) => (
                           <tr key={i} className="hover:bg-navy-50/20 transition-colors">
                              <td className="p-5 text-[10px] font-black text-navy-950 uppercase">{p.name}</td>
                              <td className="p-5 text-[9px] font-black text-blue-gray uppercase">{p.category || L('GENERAL', 'GENERAL')}</td>
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
