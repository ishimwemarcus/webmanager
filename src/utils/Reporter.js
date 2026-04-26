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

export const printThermalReport = (reportData, formatCurrency) => {
  const content = `
    <html>
      <head>
        <title>Rapport Journalier</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 13px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; border-bottom: none; }
          .flex { display: flex; justify-content: space-between; margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="center bold large">MARC Intelligence</div>
        <div class="center">RAPPORT DE FIN DE JOURNÉE</div>
        <div class="divider"></div>
        <div><span class="bold">Date:</span> ${new Date().toLocaleDateString('fr-FR')}</div>
        <div class="divider"></div>
        
        <div class="flex">
          <span class="bold">VENTES TOTALES:</span>
          <span>${formatCurrency(reportData.totalSales)}</span>
        </div>
        <div class="flex">
          <span class="bold">CASH RÉCOLTÉ:</span>
          <span>${formatCurrency(reportData.cashCollected)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="flex">
          <span>DÉPENSES:</span>
          <span>${formatCurrency(reportData.totalExpenses)}</span>
        </div>
        <div class="flex">
          <span>PERTES (SPOIL):</span>
          <span>${formatCurrency(reportData.totalLossValuation)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="flex bold large">
          <span>PROFIT NET:</span>
          <span>${formatCurrency(reportData.netProfit)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="center bold italic">${reportData.performance}</div>
        <div class="divider"></div>
        <div class="center" style="font-size: 10px;">GÉNÉRÉ PAR MARC v4.0</div>
        
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

export const shareDailyReport = (reportData, formatCurrency) => {
  const text = `
📊 *RAPPORT JOURNALIER - MARC*
📅 *Date:* ${new Date().toLocaleDateString('fr-FR')}
---------------------------------------
💰 *Total Revenu:* ${formatCurrency(reportData.totalSales)}
💵 *Cash Encaissé:* ${formatCurrency(reportData.cashCollected)}
🧾 *Créances Client:* ${formatCurrency(reportData.unpaidLedger)}
🛑 *Total Dépenses:* ${formatCurrency(reportData.totalExpenses)}
📉 *Total Pertes:* ${formatCurrency(reportData.totalLossValuation)}
---------------------------------------
✨ *PROFIT NET (CASH):* ${formatCurrency(reportData.netProfit)}
🏢 *Performance:* ${reportData.performance}
---------------------------------------
_Généré par le système d'intelligence MARC_
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
${debt > 0 ? `🛑 *Solde Restant:* ${formatCurrency(debt)}` : ''}
---------------------------------------
🔗 *Votre Portail Client:* ${(window.location.origin + window.location.pathname).replace(/\/$/, '')}/#/portal/${encodeURIComponent(sale.client)}/${encodeURIComponent(sale.phone || 'none')}
---------------------------------------
⚖️ *Statut:* ${status}
🙏 _Merci de votre confiance !_
  `.trim();

  const phone = sale.phone ? sale.phone.replace(/\D/g, '') : '';
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
