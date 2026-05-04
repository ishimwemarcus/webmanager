/**
 * Marc M Reporting Engine
 * Handles generation of PDF-ready data and WhatsApp-formatted summaries.
 */

export const generateDailySummary = (sales, expenses, ledger, losses = [], date = new Date().toISOString().split('T')[0]) => {
  const daySales = sales.filter(s => s.date.startsWith(date));
  const dayExpenses = expenses.filter(e => e.date.startsWith(date));
  const dayLosses = losses.filter(l => l.date.startsWith(date));

  const totalSales = daySales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const cashCollected = daySales.reduce((acc, s) => acc + (s.paid || 0), 0);
  const unpaidLedger = totalSales - cashCollected;
  const totalExpenses = dayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalLossValuation = dayLosses.reduce((acc, l) => acc + (l.valuation || 0), 0);
  const netProfit = cashCollected - totalExpenses - totalLossValuation;

  const performance = netProfit > 0 ? 'Stable' : 'Alert: Profit Compromised';

  const whatsappText = `
*DAILY REPORT - ${date}*
--------------------------
*Total Sales:* ${totalSales.toLocaleString()}
*Cash Collected:* ${cashCollected.toLocaleString()}
*Total Expenses:* ${totalExpenses.toLocaleString()}
*Total Losses (Waste):* ${totalLossValuation.toLocaleString()}
--------------------------
*Net Profit (Adjusted):* ${netProfit.toLocaleString()}
*Performance:* ${performance}
  `.trim();

  return {
    raw: { totalSales, cashCollected, unpaidLedger, totalExpenses, totalLossValuation, netProfit, performance },
    whatsappText
  };
};

export const generateSystemHealthReport = (products, sales, expenses, ledger, waitCredits, losses = []) => {
  const date = new Date().toISOString().split('T')[0];
  
  // 1. Inventory Summary
  const totalInStock = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalAssetValue = products.reduce((acc, p) => acc + ((p.quantity || 0) * (parseFloat(p.cost) || 0)), 0);
  
  // 2. Transaction Summary
  const totalSales = sales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const cashCollected = sales.reduce((acc, s) => acc + (s.paid || 0), 0);
  
  // 3. Loss Summary
  const totalLossValue = losses.reduce((acc, l) => acc + (parseFloat(l.valuation) || 0), 0);

  // 4. Credit (Wait) Summary
  const totalWaitBalance = waitCredits.reduce((acc, w) => acc + (parseFloat(w.balance) || 0), 0);
  
  // 5. Ledger Summary
  const ledgerTotal = ledger.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);

  const whatsappText = `
*MARC SYSTEM SNAPSHOT*
_Date: ${date}_
--------------------------
*📦 INVENTORY*
- Reserve: ${totalInStock} units
- Valuation: ${totalAssetValue.toLocaleString()}

*💰 TRANSACTIONS*
- Gross Revenue: ${totalSales.toLocaleString()}
- Cash Liquid: ${cashCollected.toLocaleString()}

*📉 LOSSES (PERTES)*
- Cumulative Waste: ${totalLossValue.toLocaleString()}

*⏳ CREDITS (WAIT)*
- Outstanding: ${totalWaitBalance.toLocaleString()}

*📜 LEDGER*
- Indexed Volume: ${ledgerTotal.toLocaleString()}
--------------------------
_Status: Full Business Intelligence Active_
  `.trim();

  return {
    id: `REP-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    data: {
      inventory: { totalInStock, totalAssetValue },
      transactions: { totalSales, cashCollected },
      losses: { totalLossValue },
      credits: { totalWaitBalance },
      ledger: { ledgerTotal }
    },
    whatsappText
  };
};

export const calculateTradingRatio = (grossProfit, netSales) => {
  if (!netSales) return 0;
  return (grossProfit / netSales).toFixed(2);
};

export const generateBusinessIntelligence = (sales) => {
  // Top Products by Quantity Sold
  const productSales = {};
  sales.forEach(s => {
    productSales[s.name] = (productSales[s.name] || 0) + (parseFloat(s.quantity) || 1);
  });
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, qty]) => ({ name, qty }));

  // Top Clients by Revenue
  const clientRevenue = {};
  sales.forEach(s => {
    const c = (s.client || 'STANDARD').toUpperCase();
    clientRevenue[c] = (clientRevenue[c] || 0) + (parseFloat(s.amount) || 0);
  });
  const topClients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, revenue]) => ({ name, revenue }));

  // Operator Efficiency
  const operatorStats = {};
  sales.forEach(s => {
    const op = (s.operator || 'ADMIN').toUpperCase();
    if (!operatorStats[op]) operatorStats[op] = { revenue: 0, transactions: 0 };
    operatorStats[op].revenue += (parseFloat(s.amount) || 0);
    operatorStats[op].transactions += 1;
  });
  const topOperators = Object.entries(operatorStats)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([name, stats]) => ({ name, ...stats }));

  // Peak Traffic Hours
  const hourlyTraffic = {};
  sales.forEach(s => {
    if (s.date) {
      const hour = new Date(s.date).getHours();
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    }
  });
  const peakHour = Object.entries(hourlyTraffic)
    .sort(([, a], [, b]) => b - a)[0] || [null, 0];

  // Client Loyalty (Frequency)
  const clientFrequency = {};
  sales.forEach(s => {
    const c = (s.client || 'STANDARD').toUpperCase();
    clientFrequency[c] = (clientFrequency[c] || 0) + 1;
  });
  const loyalClients = Object.entries(clientFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return { topProducts, topClients, topOperators, peakHour: { hour: peakHour[0], count: peakHour[1] }, loyalClients };
};


export const printThermalReceipt = (sale, operator, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const content = `
    <html>
      <head>
        <title>${L('Receipt', 'Ticket de Caisse')}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 13px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 18px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; border-bottom: none; }
          .flex { display: flex; justify-content: space-between; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="center bold large">MARC</div>
        <div class="center">${L('CASH RECEIPT', 'TICKET DE CAISSE')}</div>
        <div class="divider"></div>
        <div><span class="bold">${L('Date', 'Date')}:</span> ${new Date(sale.date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}</div>
        <div><span class="bold">${L('Operator', 'Opérateur')}:</span> ${operator || 'Admin'}</div>
        <div><span class="bold">${L('Client', 'Client')}:</span> ${(sale.client || L('Standard Client', 'Client Standard')).toUpperCase()}</div>
        <div class="divider"></div>
        <div class="flex bold">
          <span>${L('Description', 'Désignation')}</span>
          <span>${L('Price', 'Prix')}</span>
        </div>
        <div class="flex">
          <span>${sale.name} x${sale.quantity || 1}</span>
          <span>${formatCurrency(sale.amount)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex bold">
          <span>${L('NET TO PAY:', 'NET A PAYER :')}</span>
          <span class="large">${formatCurrency(sale.amount)}</span>
        </div>
        <div class="flex">
          <span>${L('AMOUNT PAID:', 'MONTANT RÉGLÉ :')}</span>
          <span>${formatCurrency(sale.paid)}</span>
        </div>
        ${sale.debtPaymentAmount > 0 ? `
        <div class="flex">
          <span>${L('DEBT PAYMENT:', 'PAIEMENT DE DETTE :')}</span>
          <span>${formatCurrency(sale.debtPaymentAmount)}</span>
        </div>
        <div class="flex bold">
          <span>${L('TOTAL COLLECTED:', 'TOTAL ENCAISSÉ :')}</span>
          <span>${formatCurrency(parseFloat(sale.paid) + parseFloat(sale.debtPaymentAmount))}</span>
        </div>
        ` : ''}
        ${sale.paid < sale.amount ? `
        <div class="flex bold">
          <span>${L('REMAINING (DEBT):', 'RESTE A PAYER (DETTE) :')}</span>
          <span>${formatCurrency(sale.amount - sale.paid)}</span>
        </div>
        ` : ''}
        <div class="divider"></div>
        <div class="center" style="margin-top: 15px;">${L('Thank you for your business!', 'Merci de votre confiance !')}</div>
        <div class="center" style="font-size: 10px; margin-top: 4px;">SYSTEME MARC VER 4.0</div>
        
        <div class="center" style="margin-top: 15px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/portal/' + encodeURIComponent(sale.client) + '/' + encodeURIComponent(sale.phone || 'none'))}" style="width: 35mm; height: 35mm;" />
          <p style="font-size: 8px; margin-top: 4px; font-weight: bold;">${L('SCAN FOR HISTORY & DEBTS', 'SCANNEZ POUR VOTRE HISTORIQUE & DETTES')}</p>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  printWindow.document.write(content);
  printWindow.document.close();
};

export const printDebtSettlementReceipt = (data, operator, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const { client, phone, amount, paymentMethod, remainingBalance, date } = data;
  const content = `
    <html>
      <head>
        <title>${L('Settlement Receipt', 'Recu de Reglement')}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 13px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 18px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; border-bottom: none; }
          .flex { display: flex; justify-content: space-between; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="center bold large">MARC</div>
        <div class="center">${L('DEBT SETTLEMENT RECEIPT', 'RECU DE REGLEMENT DE DETTE')}</div>
        <div class="divider"></div>
        <div><span class="bold">${L('Date', 'Date')}:</span> ${new Date(date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}</div>
        <div><span class="bold">${L('Operator', 'Opérateur')}:</span> ${operator || 'Admin'}</div>
        <div><span class="bold">${L('Client', 'Client')}:</span> ${client.toUpperCase()}</div>
        <div class="divider"></div>
        <div class="flex bold">
          <span>${L('DESIGNATION', 'DÉSIGNATION')}</span>
          <span>${L('AMOUNT', 'MONTANT')}</span>
        </div>
        <div class="flex">
          <span>${L('Global Wallet Settlement', 'Règlement Balance Global')}</span>
          <span>${formatCurrency(amount)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex">
          <span>${L('PAYMENT METHOD:', 'MODE DE PAIEMENT :')}</span>
          <span>${paymentMethod || 'Cash'}</span>
        </div>
        <div class="flex bold large" style="margin-top: 10px;">
          <span>${L('TOTAL PAID:', 'TOTAL PAYÉ :')}</span>
          <span>${formatCurrency(amount)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex" style="color: ${remainingBalance < 0 ? '#ef4444' : '#10b981'}; font-weight: bold;">
          <span>${L('NEW WALLET BALANCE:', 'NOUVEAU SOLDE WALLET :')}</span>
          <span>${formatCurrency(remainingBalance)}</span>
        </div>
        <div class="divider"></div>
        <div class="center" style="margin-top: 15px;">${L('Thank you for your payment!', 'Merci pour votre règlement !')}</div>
        <div class="center" style="font-size: 10px; margin-top: 4px;">SYSTEME MARC VER 4.0</div>
        
        <div class="center" style="margin-top: 15px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/portal/' + encodeURIComponent(client) + '/' + encodeURIComponent(phone || 'none'))}" style="width: 35mm; height: 35mm;" />
          <p style="font-size: 8px; margin-top: 4px; font-weight: bold;">${L('VIEW YOUR ACCOUNT IN REAL-TIME', 'CONSULTEZ VOTRE COMPTE EN TEMPS RÉEL')}</p>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  printWindow.document.write(content);
  printWindow.document.close();
};

export const printThermalReport = (reportData, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const content = `
    <html>
      <head>
        <title>${L('Accounting Report', 'Rapport de Comptabilité')}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 13px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; border-bottom: none; }
          .flex { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .header { font-size: 14px; font-weight: 900; margin-bottom: 5px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="center header">${L('ACCOUNTING & OPERATIONS', 'COMPTABILITÉ & OPÉRATIONS')}</div>
        <div class="center bold">MARC MANAGEMENT PLATFORM</div>
        <div class="divider"></div>
        <div><span class="bold">${L('OPERATING DATE:', 'DATE D\'OPÉRATION :')}</span> ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</div>
        <div class="divider"></div>
        
        <div class="flex">
          <span>${L('Gross Revenue:', 'Chiffre d\'Affaires Brut :')}</span>
          <span>${formatCurrency(reportData.totalSales)}</span>
        </div>
        <div class="flex">
          <span>${L('Cash Collected:', 'Espèces Encaissées :')}</span>
          <span>${formatCurrency(reportData.cashCollected)}</span>
        </div>
        <div class="flex">
          <span>${L('Expenses:', 'Dépenses :')}</span>
          <span>${formatCurrency(reportData.totalExpenses)}</span>
        </div>
        <div class="flex">
          <span>${L('Losses (Spoilage):', 'Pertes (Avaries) :')}</span>
          <span>${formatCurrency(reportData.totalLossValuation)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="flex bold large">
          <span>${L('NET PROFIT:', 'BÉNÉFICE NET :')}</span>
          <span>${formatCurrency(reportData.netProfit)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="center bold italic" style="text-transform: uppercase;">${L('STATUS', 'STATUT')}: ${L(reportData.performance, reportData.performance === 'Stable' ? 'Stable' : 'Alerte : Profit Compromis')}</div>
        <div class="divider"></div>
        <div class="center" style="font-size: 9px; opacity: 0.7;">HIGH-FIDELITY AUDIT LOG v4.0</div>
        
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  printWindow.document.write(content);
  printWindow.document.close();
};

export const printFullMasterReport = (data, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const { 
    reportDate, 
    financials, 
    sales, 
    ledger, 
    inventory, 
    shifts,
    activeSectors = ['sales', 'ledger', 'stock', 'losses', 'shifts']
  } = data;

  const content = `
    <html>
      <head>
        <title>${L('Accounting & Operations Report', 'Rapport de Comptabilité & Opérations')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
          body { font-family: 'Courier Prime', Courier, monospace; padding: 10px; color: #000; line-height: 1.4; width: 80mm; margin: 0 auto; background: white; font-size: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 16px; font-weight: 900; margin: 0; text-transform: uppercase; }
          .header p { font-size: 10px; margin: 4px 0 0; font-weight: 700; }
          
          .section { margin-bottom: 20px; }
          .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px; text-align: center; }
          
          .metrics-grid { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
          .metric-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; }
          .metric-row.bold-large { font-size: 12px; font-weight: 900; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; }
          
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th { text-align: left; padding: 4px 2px; border-bottom: 1px dashed #000; font-size: 8px; text-transform: uppercase; }
          td { padding: 4px 2px; vertical-align: top; border-bottom: 1px solid #f0f0f0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          @media print {
            body { padding: 0; margin: 0; }
            @page { size: 80mm auto; margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${L('ACCOUNTING & OPERATIONS REPORT', 'RAPPORT DE COMPTABILITÉ & OPÉRATIONS')}</h1>
          <p>${L('Operating Date:', 'Date d\'Opération :')} ${new Date(reportDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
        </div>

        <div class="section">
          <div class="section-title">${L('FINANCIAL PERFORMANCE SUMMARY', 'RÉSUMÉ DE LA PERFORMANCE FINANCIÈRE')}</div>
          <div class="metrics-grid">
            <div class="metric-row"><span>${L('Gross Sales Revenue', 'Chiffre d\'Affaires Brut')}</span> <span>${formatCurrency(financials.totalSales)}</span></div>
            <div class="metric-row"><span>${L('Cash Liquid Collected', 'Espèces Encaissées')}</span> <span>${formatCurrency(financials.cashCollected)}</span></div>
            <div class="metric-row red"><span>${L('Operating Expenses', 'Dépenses Opérationnelles')}</span> <span>${formatCurrency(financials.totalExpenses)}</span></div>
            <div class="metric-row red"><span>${L('Losses (Spoilage)', 'Pertes (Avaries)')}</span> <span>${formatCurrency(financials.totalLossValuation)}</span></div>
            <div class="metric-row bold-large"><span>${L('ADJUSTED NET PROFIT', 'BÉNÉFICE NET AJUSTÉ')}</span> <span>${formatCurrency(financials.netProfit)}</span></div>
          </div>
        </div>

        ${activeSectors.includes('sales') ? `
        <div class="section">
          <div class="section-title">${L('SALES TRANSACTIONS', 'TRANSACTIONS DE VENTE')}</div>
          <table>
            <thead>
              <tr>
                <th>${L('Time', 'Heure')}</th><th>${L('Operator', 'Opérateur')}</th><th>${L('Client', 'Client')}</th><th>${L('Product', 'Produit')}</th><th class="text-right">${L('Qty', 'Qté')}</th><th class="text-right">${L('Total', 'Total')}</th><th class="text-right">${L('Paid', 'Payé')}</th>
              </tr>
            </thead>
            <tbody>
              ${sales.map(s => `
                <tr>
                  <td style="font-weight: 700;">${new Date(s.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                  <td>${(s.operator || 'ADMIN').toUpperCase()}</td>
                  <td>${(s.client || 'STANDARD').toUpperCase()}</td>
                  <td>${s.name}</td>
                  <td class="text-right">${s.quantity}</td>
                  <td class="text-right" style="font-weight: 700;">${formatCurrency(s.amount)}</td>
                  <td class="text-right" style="color: #10b981; font-weight: 900;">${formatCurrency(s.paid)}</td>
                </tr>
              `).join('')}
              ${sales.length === 0 ? '<tr><td colspan="7" class="text-center" style="padding: 40px; color: #94a3b8;">Aucune transaction enregistrée</td></tr>' : ''}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${(activeSectors.includes('ledger') || activeSectors.includes('losses')) ? `
        <div class="section">
          <div class="section-title">${L('LEDGER & LOSS LOG', 'GRAND LIVRE & JOURNAL DES PERTES')}</div>
          <table>
            <thead>
              <tr>
                <th>${L('Type', 'Type')}</th><th>${L('Time', 'Heure')}</th><th>${L('Operator', 'Opérateur')}</th><th>${L('Entity', 'Entité')}</th><th>${L('Description', 'Description')}</th><th class="text-right">${L('Amount', 'Montant')}</th>
              </tr>
            </thead>
            <tbody>
              ${ledger.map(l => `
                <tr>
                  <td style="color: ${l.type === 'expense' ? '#ef4444' : '#10b981'}; font-weight: 900; font-size: 10px;">${l.type.toUpperCase()}</td>
                  <td>${new Date(l.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                  <td>${(l.operator || 'ADMIN').toUpperCase()}</td>
                  <td>${(l.client || 'SYSTEM').toUpperCase()}</td>
                  <td style="font-style: italic;">${l.name}</td>
                  <td class="text-right" style="font-weight: 700;">${formatCurrency(l.amount)}</td>
                </tr>
              `).join('')}
              ${ledger.length === 0 ? '<tr><td colspan="6" class="text-center" style="padding: 40px; color: #94a3b8;">Aucune entrée au grand livre</td></tr>' : ''}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${activeSectors.includes('stock') ? `
        <div class="section">
          <div class="section-title">${L('INVENTORY / ASSET VALUATION', 'INVENTAIRE / VALORISATION DES ACTIFS')}</div>
          <table>
            <thead>
              <tr>
                <th>${L('Product', 'Produit')}</th><th class="text-right">${L('Qty', 'Qté')}</th><th class="text-right">${L('Unit Cost', 'Coût Unit')}</th><th class="text-right">${L('Asset Value', 'Valeur Actif')}</th>
              </tr>
            </thead>
            <tbody>
              ${inventory.map(p => `
                <tr>
                  <td style="font-weight: 900; color: #082f49;">${p.name}</td>
                  <td class="text-right">${p.quantity}</td>
                  <td class="text-right">${formatCurrency(p.cost)}</td>
                  <td class="text-right" style="font-weight: 700;">${formatCurrency(p.quantity * p.cost)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-footer">${L('Total Inventory Asset Valuation:', 'Valorisation Totale des Actifs en Stock :')} ${formatCurrency(inventory.reduce((acc, p) => acc + (p.quantity * p.cost), 0))}</div>
        </div>
        ` : ''}

        ${activeSectors.includes('shifts') ? `
        <div class="section">
          <div class="section-title">${L('EMPLOYEE SHIFT PERFORMANCE', 'PERFORMANCE DES POSTES EMPLOYÉS')}</div>
          <table>
            <thead>
              <tr>
                <th>${L('Operator', 'Opérateur')}</th><th>${L('Shift Period', 'Période du Poste')}</th><th class="text-center">${L('Transactions', 'Transactions')}</th><th class="text-right">${L('Revenue', 'Chiffre d\'Aff')}</th>
              </tr>
            </thead>
            <tbody>
              ${shifts.map(sh => `
                <tr>
                  <td style="font-weight: 700;">${sh.operator.toUpperCase()}</td>
                  <td>${new Date(sh.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${sh.end ? new Date(sh.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'EN COURS'}</td>
                  <td class="text-center">${sh.transactionCount || 0}</td>
                  <td class="text-right" style="font-weight: 700;">${formatCurrency(sh.revenue || 0)}</td>
                </tr>
              `).join('')}
              ${shifts.length === 0 ? `<tr><td colspan="4" class="text-center" style="padding: 40px; color: #94a3b8;">${L('No shift data', 'Aucune donnée de poste')}</td></tr>` : ''}
            </tbody>
          </table>
        </div>
        ` : ''}

        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.onafterprint = () => window.close(); }, 600); }
        </script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(content);
  printWindow.document.close();
};

export const shareDailyReport = (reportData, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const text = `
📜 *${L('ACCOUNTING & OPERATIONS REPORT', 'RAPPORT DE COMPTABILITÉ & OPÉRATIONS')}*
📅 *${L('Operating Date:', 'Date d\'Opération :')}* ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
---------------------------------------
💰 *${L('Gross Sales Revenue:', 'CA Brut :')}* ${formatCurrency(reportData.totalSales)}
💵 *${L('Cash Liquid Collected:', 'Espèces Encaissées :')}* ${formatCurrency(reportData.cashCollected)}
🛑 *${L('Operating Expenses:', 'Dépenses :')}* ${formatCurrency(reportData.totalExpenses)}
📉 *${L('Losses (Spoilage):', 'Pertes (Avaries) :')}* ${formatCurrency(reportData.totalLossValuation)}
---------------------------------------
✨ *${L('ADJUSTED NET PROFIT:', 'BÉNÉFICE NET AJUSTÉ :')}* ${formatCurrency(reportData.netProfit)}
🏢 *${L('Status:', 'Statut :')}* ${L(reportData.performance, reportData.performance === 'Stable' ? 'Stable' : 'Alerte : Profit Compromis').toUpperCase()}
---------------------------------------
_Sent from MARC Management Platform_
  `.trim();
  
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareReceipt = (sale, operator, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const dateStr = new Date(sale.date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  
  const debt = sale.amount - sale.paid;
  const status = sale.paid >= sale.amount ? L('✅ PAID', '✅ PAYÉ') : L('⚠️ PARTIAL', '⚠️ PARTIEL');

  const text = `
📜 *${L('PAYMENT RECEIPT - MARC', 'RECU DE PAIEMENT - MARC')}*
---------------------------------------
📅 *${L('Date:', 'Date :')}* ${dateStr}
👤 *${L('Operator:', 'Opérateur :')}* ${operator}
🤝 *${L('Client:', 'Client :')}* ${sale.client.toUpperCase()}
---------------------------------------
🛒 *${L('Article:', 'Article :')}* ${sale.name} (x${sale.quantity})
💰 *${L('Total:', 'Total :')}* ${formatCurrency(sale.amount)}
💵 *${L('Paid:', 'Réglé :')}* ${formatCurrency(sale.paid)}
${sale.debtPaymentAmount > 0 ? `💳 *${L('Debt Payment:', 'Paiement Dette :')}* ${formatCurrency(sale.debtPaymentAmount)}\n💰 *${L('Total Received:', 'Total Reçu :')}* ${formatCurrency(parseFloat(sale.paid) + parseFloat(sale.debtPaymentAmount))}` : ''}
${debt > 0 ? `🛑 *${L('Remaining Balance:', 'Solde Restant :')}* ${formatCurrency(debt)}` : ''}
---------------------------------------
🔗 *${L('Your Client Portal:', 'Votre Portail Client :')}* ${(window.location.origin + window.location.pathname).replace(/\/$/, '')}/#/portal/${encodeURIComponent(sale.client)}/${encodeURIComponent(sale.phone || 'none')}
---------------------------------------
⚖️ *${L('Status:', 'Statut :')}* ${status}
🙏 _${L('Thank you for your business!', 'Merci de votre confiance !')}_
  `.trim();

  const phoneDigits = sale.phone ? sale.phone.replace(/\D/g, '') : '';
  const url = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareDebtSettlementReceipt = (data, operator, formatCurrency, lang = 'en') => {
  const L = (en, fr) => lang === 'fr' ? fr : en;
  const { client, phone, amount, paymentMethod, remainingBalance, date } = data;
  const dateStr = new Date(date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const text = `
📜 *${L('SETTLEMENT RECEIPT - MARC', 'RECU DE REGLEMENT - MARC')}*
---------------------------------------
📅 *${L('Date:', 'Date :')}* ${dateStr}
👤 *${L('Operator:', 'Opérateur :')}* ${operator}
🤝 *${L('Client:', 'Client :')}* ${client.toUpperCase()}
---------------------------------------
💰 *${L('Amount Paid:', 'Montant Payé :')}* ${formatCurrency(amount)}
💳 *${L('Method:', 'Mode :')}* ${paymentMethod}
---------------------------------------
⚖️ *${L('New Wallet Balance:', 'Nouveau Solde Wallet :')}* ${formatCurrency(remainingBalance)}
🔗 *${L('Portal Link:', 'Lien Portail :')}* ${(window.location.origin + window.location.pathname).replace(/\/$/, '')}/#/portal/${encodeURIComponent(client)}/${encodeURIComponent(phone || 'none')}
---------------------------------------
🙏 _${L('Thank you for your payment!', 'Merci pour votre règlement !')}_
  `.trim();

  const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
  const url = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
