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


export const printThermalReceipt = (sale, operator, formatCurrency) => {
  const content = `
    <html>
      <head>
        <title>Ticket de Caisse</title>
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
        <div class="center">TICKET DE CAISSE</div>
        <div class="divider"></div>
        <div><span class="bold">Date:</span> ${new Date(sale.date).toLocaleString()}</div>
        <div><span class="bold">Opérateur:</span> ${operator || 'Admin'}</div>
        <div><span class="bold">Client:</span> ${(sale.client || 'Client Standard').toUpperCase()}</div>
        <div class="divider"></div>
        <div class="flex bold">
          <span>Description</span>
          <span>Prix</span>
        </div>
        <div class="flex">
          <span>${sale.name} x${sale.quantity || 1}</span>
          <span>${formatCurrency(sale.amount)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex bold">
          <span>NET A PAYER:</span>
          <span class="large">${formatCurrency(sale.amount)}</span>
        </div>
        <div class="flex">
          <span>MONTANT RÉGLÉ:</span>
          <span>${formatCurrency(sale.paid)}</span>
        </div>
        ${sale.debtPaymentAmount > 0 ? `
        <div class="flex">
          <span>PAIEMENT DE DETTE:</span>
          <span>${formatCurrency(sale.debtPaymentAmount)}</span>
        </div>
        <div class="flex bold">
          <span>TOTAL ENCAISSÉ:</span>
          <span>${formatCurrency(parseFloat(sale.paid) + parseFloat(sale.debtPaymentAmount))}</span>
        </div>
        ` : ''}
        ${sale.paid < sale.amount ? `
        <div class="flex bold">
          <span>RESTE A PAYER (DETTE):</span>
          <span>${formatCurrency(sale.amount - sale.paid)}</span>
        </div>
        ` : ''}
        <div class="divider"></div>
        <div class="center" style="margin-top: 15px;">Merci de votre confiance !</div>
        <div class="center" style="font-size: 10px; margin-top: 4px;">SYSTEME MARC VER 4.0</div>
        
        <div class="center" style="margin-top: 15px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/portal/' + encodeURIComponent(sale.client) + '/' + encodeURIComponent(sale.phone || 'none'))}" style="width: 35mm; height: 35mm;" />
          <p style="font-size: 8px; margin-top: 4px; font-weight: bold;">SCANNEZ POUR VOTRE HISTORIQUE & DETTES</p>
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

export const printDebtSettlementReceipt = (data, operator, formatCurrency) => {
  const { client, phone, amount, paymentMethod, remainingBalance, date } = data;
  const content = `
    <html>
      <head>
        <title>Recu de Reglement</title>
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
        <div class="center">RECU DE REGLEMENT DE DETTE</div>
        <div class="divider"></div>
        <div><span class="bold">Date:</span> ${new Date(date).toLocaleString()}</div>
        <div><span class="bold">Opérateur:</span> ${operator || 'Admin'}</div>
        <div><span class="bold">Client:</span> ${client.toUpperCase()}</div>
        <div class="divider"></div>
        <div class="flex bold">
          <span>DÉSIGNATION</span>
          <span>MONTANT</span>
        </div>
        <div class="flex">
          <span>Règlement Balance Global</span>
          <span>${formatCurrency(amount)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex">
          <span>MODE DE PAIEMENT:</span>
          <span>${paymentMethod || 'Cash'}</span>
        </div>
        <div class="flex bold large" style="margin-top: 10px;">
          <span>TOTAL PAYÉ:</span>
          <span>${formatCurrency(amount)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex" style="color: ${remainingBalance < 0 ? '#ef4444' : '#10b981'}; font-weight: bold;">
          <span>NOUVEAU SOLDE WALLET:</span>
          <span>${formatCurrency(remainingBalance)}</span>
        </div>
        <div class="divider"></div>
        <div class="center" style="margin-top: 15px;">Merci pour votre règlement !</div>
        <div class="center" style="font-size: 10px; margin-top: 4px;">SYSTEME MARC VER 4.0</div>
        
        <div class="center" style="margin-top: 15px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/portal/' + encodeURIComponent(client) + '/' + encodeURIComponent(phone || 'none'))}" style="width: 35mm; height: 35mm;" />
          <p style="font-size: 8px; margin-top: 4px; font-weight: bold;">CONSULTEZ VOTRE COMPTE EN TEMPS RÉEL</p>
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

export const printThermalReport = (reportData, formatCurrency) => {
  const content = `
    <html>
      <head>
        <title>Accounting Report</title>
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
        <div class="center header">ACCOUNTING & OPERATIONS</div>
        <div class="center bold">MARC MANAGEMENT PLATFORM</div>
        <div class="divider"></div>
        <div><span class="bold">OPERATING DATE:</span> ${new Date().toLocaleDateString('fr-FR')}</div>
        <div class="divider"></div>
        
        <div class="flex">
          <span>Gross Revenue:</span>
          <span>${formatCurrency(reportData.totalSales)}</span>
        </div>
        <div class="flex">
          <span>Cash Collected:</span>
          <span>${formatCurrency(reportData.cashCollected)}</span>
        </div>
        <div class="flex">
          <span>Expenses:</span>
          <span>${formatCurrency(reportData.totalExpenses)}</span>
        </div>
        <div class="flex">
          <span>Losses (Spoilage):</span>
          <span>${formatCurrency(reportData.totalLossValuation)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="flex bold large">
          <span>NET PROFIT:</span>
          <span>${formatCurrency(reportData.netProfit)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="center bold italic" style="text-transform: uppercase;">STATUS: ${reportData.performance}</div>
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

export const printFullMasterReport = (data, formatCurrency) => {
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
        <title>Accounting & Operations Report</title>
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
          <h1>ACCOUNTING & OPERATIONS REPORT</h1>
          <p>Operating Date: ${reportDate}</p>
        </div>

        <div class="section">
          <div class="section-title">FINANCIAL PERFORMANCE SUMMARY</div>
          <div class="metrics-grid">
            <div class="metric-row"><span>Gross Sales Revenue</span> <span>${formatCurrency(financials.totalSales)}</span></div>
            <div class="metric-row"><span>Cash Liquid Collected</span> <span>${formatCurrency(financials.cashCollected)}</span></div>
            <div class="metric-row red"><span>Operating Expenses</span> <span>${formatCurrency(financials.totalExpenses)}</span></div>
            <div class="metric-row red"><span>Losses (Spoilage)</span> <span>${formatCurrency(financials.totalLossValuation)}</span></div>
            <div class="metric-row bold-large"><span>ADJUSTED NET PROFIT</span> <span>${formatCurrency(financials.netProfit)}</span></div>
          </div>
        </div>

        ${activeSectors.includes('sales') ? `
        <div class="section">
          <div class="section-title">SALES TRANSACTIONS</div>
          <table>
            <thead>
              <tr>
                <th>Time</th><th>Operator</th><th>Client</th><th>Product</th><th class="text-right">Qty</th><th class="text-right">Total</th><th class="text-right">Paid</th>
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
          <div class="section-title">LEDGER & LOSS LOG</div>
          <table>
            <thead>
              <tr>
                <th>Type</th><th>Time</th><th>Operator</th><th>Entity</th><th>Description</th><th class="text-right">Amount</th>
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
          <div class="section-title">INVENTORY / ASSET VALUATION</div>
          <table>
            <thead>
              <tr>
                <th>Product</th><th class="text-right">Qty</th><th class="text-right">Unit Cost</th><th class="text-right">Asset Value</th>
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
          <div class="total-footer">Total Inventory Asset Valuation: ${formatCurrency(inventory.reduce((acc, p) => acc + (p.quantity * p.cost), 0))}</div>
        </div>
        ` : ''}

        ${activeSectors.includes('shifts') ? `
        <div class="section">
          <div class="section-title">EMPLOYEE SHIFT PERFORMANCE</div>
          <table>
            <thead>
              <tr>
                <th>Operator</th><th>Shift Period</th><th class="text-center">Transactions</th><th class="text-right">Revenue</th>
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
              ${shifts.length === 0 ? '<tr><td colspan="4" class="text-center" style="padding: 40px; color: #94a3b8;">Aucune donnée de poste</td></tr>' : ''}
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

export const shareDailyReport = (reportData, formatCurrency) => {
  const text = `
📜 *ACCOUNTING & OPERATIONS REPORT*
📅 *Operating Date:* ${new Date().toLocaleDateString('fr-FR')}
---------------------------------------
💰 *Gross Sales Revenue:* ${formatCurrency(reportData.totalSales)}
💵 *Cash Liquid Collected:* ${formatCurrency(reportData.cashCollected)}
🛑 *Operating Expenses:* ${formatCurrency(reportData.totalExpenses)}
📉 *Losses (Spoilage):* ${formatCurrency(reportData.totalLossValuation)}
---------------------------------------
✨ *ADJUSTED NET PROFIT:* ${formatCurrency(reportData.netProfit)}
🏢 *Status:* ${reportData.performance.toUpperCase()}
---------------------------------------
_Sent from MARC Management Platform_
  `.trim();
  
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareReceipt = (sale, operator, formatCurrency) => {
  const dateStr = new Date(sale.date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  
  const debt = sale.amount - sale.paid;
  const status = sale.paid >= sale.amount ? '✅ PAYÉ' : '⚠️ PARTIEL';

  const text = `
📜 *RECU DE PAIEMENT - MARC*
---------------------------------------
📅 *Date:* ${dateStr}
👤 *Opérateur:* ${operator}
🤝 *Client:* ${sale.client.toUpperCase()}
---------------------------------------
🛒 *Article:* ${sale.name} (x${sale.quantity})
💰 *Total:* ${formatCurrency(sale.amount)}
💵 *Réglé:* ${formatCurrency(sale.paid)}
${sale.debtPaymentAmount > 0 ? `💳 *Paiement Dette:* ${formatCurrency(sale.debtPaymentAmount)}\n💰 *Total Reçu:* ${formatCurrency(parseFloat(sale.paid) + parseFloat(sale.debtPaymentAmount))}` : ''}
${debt > 0 ? `🛑 *Solde Restant:* ${formatCurrency(debt)}` : ''}
---------------------------------------
🔗 *Votre Portail Client:* ${(window.location.origin + window.location.pathname).replace(/\/$/, '')}/#/portal/${encodeURIComponent(sale.client)}/${encodeURIComponent(sale.phone || 'none')}
---------------------------------------
⚖️ *Statut:* ${status}
🙏 _Merci de votre confiance !_
  `.trim();

  const phoneDigits = sale.phone ? sale.phone.replace(/\D/g, '') : '';
  const url = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareDebtSettlementReceipt = (data, operator, formatCurrency) => {
  const { client, phone, amount, paymentMethod, remainingBalance, date } = data;
  const dateStr = new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const text = `
📜 *RECU DE REGLEMENT - MARC*
---------------------------------------
📅 *Date:* ${dateStr}
👤 *Opérateur:* ${operator}
🤝 *Client:* ${client.toUpperCase()}
---------------------------------------
💰 *Montant Payé:* ${formatCurrency(amount)}
💳 *Mode:* ${paymentMethod}
---------------------------------------
⚖️ *Nouveau Solde Wallet:* ${formatCurrency(remainingBalance)}
🔗 *Lien Portail:* ${(window.location.origin + window.location.pathname).replace(/\/$/, '')}/#/portal/${encodeURIComponent(client)}/${encodeURIComponent(phone || 'none')}
---------------------------------------
🙏 _Merci pour votre règlement !_
  `.trim();

  const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
  const url = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
