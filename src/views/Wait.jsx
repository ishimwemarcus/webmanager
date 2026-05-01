import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Clock, 
  Trash2, 
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Filter,
  Layers,
  ChevronDown,
  Printer,
  MessageSquare
} from 'lucide-react';

export default function Wait() {
  const store = useStore();
  const { t, L, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('DEBTS'); // 'CREDITS' or 'DEBTS'
  const [showPayModal, setShowPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];
  const sales = store.getSales ? store.getSales() : [];

  // Grouping Credits (Reliquats)
  const creditMap = useMemo(() => {
    const map = {};
    waitCredits.forEach(w => {
      const key = w.client?.toLowerCase() || 'unknown';
      if (!map[key]) map[key] = { client: w.client, records: [], total: 0, phone: w.phone || 'none' };
      map[key].records.push(w);
      map[key].total += parseFloat(w.balance) || 0;
    });
    return Object.values(map).sort((a,b) => b.total - a.total);
  }, [waitCredits]);

  // Grouping Debts (Impayés)
  const debtMap = useMemo(() => {
    const map = {};
    sales.filter(s => (parseFloat(s.amount)||0) > (parseFloat(s.paid)||0)).forEach(s => {
      const key = s.client?.toLowerCase() || 'unknown';
      if (!map[key]) map[key] = { client: s.client, records: [], total: 0, phone: s.phone || 'none' };
      map[key].records.push(s);
      map[key].total += (parseFloat(s.amount)||0) - (parseFloat(s.paid)||0);
    });
    return Object.values(map).sort((a,b) => b.total - a.total);
  }, [sales]);

  const totalCreditSum = creditMap.reduce((s, c) => s + c.total, 0);
  const totalDebtSum = debtMap.reduce((s, d) => s + d.total, 0);

  const handleMarkUsed = (record) => {
    store.showConfirm(L("Deduct this credit from client balance?", "Déduire ce crédit du solde client ?"), () => {
       store.updateRecord({ ...record, balance: 0, status: 'used' });
       store.showAlert(L("Credit balance updated.", "Solde de crédit mis à jour."));
    });
  };

  const handleSettleDebt = (e) => {
    e.preventDefault();
    if (!showPayModal || !payAmount) return;

    store.settleClientDebt(
       showPayModal.client, 
       showPayModal.phone, 
       payAmount, 
       payMethod, 
       store.currentOperator
    );
    
    store.showAlert(L(`Payment of ${store.formatCurrency(payAmount)} processed for ${showPayModal.client}.`, `Paiement de ${store.formatCurrency(payAmount)} traité pour ${showPayModal.client}.`));
    setShowPayModal(null);
    setPayAmount('');
  };

  const confirmDelete = (record) => {
    store.showConfirm(L("Do you want to delete this record from the registry?", "Voulez-vous supprimer cet enregistrement du registre ?"), () => {
      store.deleteRecord(record);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Client Ledger', 'Grand Livre Clients')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            {L('Balance Audit — Client Liabilities & Assets', 'Audit des Soldes — Passifs & Actifs Clients')}
          </p>
        </div>
      </div>

      {/* Dual Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <button 
           onClick={() => setActiveTab('CREDITS')}
           className={`glass-card p-8 rounded-[48px] border-2 flex items-center gap-8 transition-all shadow-sm text-left ${activeTab === 'CREDITS' ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-transparent hover:border-emerald-100'}`}
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner ${activeTab === 'CREDITS' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
            <TrendingUp className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('Credits (Balances)', 'Crédits (Reliquats)')}</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">{store.formatCurrency(totalCreditSum)}</p>
            <p className="text-[9px] font-black text-emerald-600 uppercase mt-1 tracking-widest">{creditMap.length} {L('Affected Clients', 'Clients Concernés')}</p>
          </div>
        </button>

        <button 
           onClick={() => setActiveTab('DEBTS')}
           className={`glass-card p-8 rounded-[48px] border-2 flex items-center gap-8 transition-all shadow-sm text-left ${activeTab === 'DEBTS' ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-500/10' : 'bg-white border-transparent hover:border-rose-100'}`}
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner ${activeTab === 'DEBTS' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
            <TrendingDown className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('Debts (Unpaid)', 'Dettes (Impayés)')}</p>
            <p className="text-4xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(totalDebtSum)}</p>
            <p className="text-[9px] font-black text-rose-500 uppercase mt-1 tracking-widest">{debtMap.length} {L('Active Debtors', 'Débiteurs Actifs')}</p>
          </div>
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-xs font-black uppercase tracking-[0.4em] text-navy-950 italic">
              {L('Manifest of', 'Manifeste des')} {activeTab === 'CREDITS' ? L('Credits', 'Crédits') : L('Debts', 'Dettes')}
           </h3>
           <div className="flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-blue-gray" />
              <span className="text-[9px] font-black uppercase text-blue-gray tracking-widest">{L('Intelligent Filtering', 'Filtrage Intelligent')}</span>
           </div>
        </div>

        {activeTab === 'CREDITS' ? (
           creditMap.length > 0 ? (
              creditMap.map((c, i) => (
                 <div key={i} className="glass-card bg-white rounded-[40px] border border-emerald-50 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-emerald-50/10">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-navy-950 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                             {c.client?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">{c.client}</h3>
                             <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mt-1">{L('Indexed Credit', 'Crédit Indexé')}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">{L('Positive Balance', 'Solde Positif')}</p>
                          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{store.formatCurrency(c.total)}</p>
                       </div>
                    </div>
                    <div className="divide-y divide-navy-50">
                       {c.records.map((r, j) => (
                          <div key={j} className="flex items-center justify-between p-6 hover:bg-emerald-50/20 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg"></div>
                                <div>
                                   <p className="text-xs font-black text-navy-950 uppercase">{r.note || L('Automatic Balance', 'Reliquat Automatique')}</p>
                                   <p className="text-[9px] font-black text-blue-gray uppercase opacity-40">{new Date(r.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <p className="text-lg font-black text-emerald-600">{store.formatCurrency(r.balance)}</p>
                                <button 
                                  onClick={() => handleMarkUsed(r)}
                                  className="p-2 bg-navy-50 text-navy-950 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                  title={L("Use Credit", "Utiliser Crédit")}
                                >
                                   <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))
           ) : (
              <div className="py-32 text-center glass-card border-dashed border-2 border-emerald-100 opacity-20">
                 <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">{L('No client credits', 'Aucun crédit client')}</p>
              </div>
           )
        ) : (
           debtMap.length > 0 ? (
              debtMap.map((c, i) => (
                 <div key={i} className="glass-card bg-white rounded-[40px] border border-rose-50 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-rose-50/10">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                             {c.client?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">{c.client}</h3>
                             <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mt-1 italic">{c.phone || L('No contact indexed', 'Aucun contact indexé')}</p>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-2">
                          <div>
                             <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">{L('Client Liability', 'Passif Client')}</p>
                             <p className="text-3xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(c.total)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => {
                                  setShowPayModal(c);
                                  setPayAmount(c.total);
                               }}
                               className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                             >
                                <Wallet className="w-3 h-3" /> {L('Settle Payment', 'Régler Paiement')}
                             </button>
                             <button 
                               onClick={() => {
                                  const summary = {
                                     client: c.client,
                                     phone: c.phone,
                                     name: L("DEBT STATEMENT", "RELEVÉ DE DETTE"),
                                     amount: c.total,
                                     paid: 0,
                                     date: new Date().toISOString()
                                  };
                                  import('../utils/Reporter').then(m => m.printThermalReceipt(summary, store.currentOperator, store.formatCurrency));
                               }}
                               className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                             >
                                <Printer className="w-3 h-3" /> {L('Print Statement', 'Imprimer Relevé')}
                             </button>
                          </div>
                       </div>
                    </div>
                    <div className="divide-y divide-navy-50">
                       {c.records.map((r, j) => (
                          <div key={j} className="flex items-center justify-between p-6 hover:bg-rose-50/20 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg"></div>
                                <div>
                                   <p className="text-xs font-black text-navy-950 uppercase">{L('Unpaid Sale', 'Vente Impayée')} : {r.name}</p>
                                   <p className="text-[9px] font-black text-blue-gray uppercase opacity-40">{new Date(r.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-black text-blue-gray uppercase italic">{L('Remaining to pay', 'Reste à payer')}</p>
                                <p className="text-lg font-black text-rose-600">{store.formatCurrency((parseFloat(r.amount)||0) - (parseFloat(r.paid)||0))}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))
           ) : (
              <div className="py-32 text-center glass-card border-dashed border-2 border-rose-100 opacity-20">
                 <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">{L('No active debt', 'Aucune dette active')}</p>
              </div>
           )
        )}
      </div>

       {/* Debt Settlement Modal */}
       {showPayModal && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowPayModal(null)}>
            <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-md w-full scale-in" onClick={e => e.stopPropagation()}>
               <div className="text-center space-y-2 mb-10">
                  <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">{L('Manual Settlement', 'Règlement Manuel')}</h3>
                  <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-40">{showPayModal.client}</p>
               </div>

               <div className="bg-rose-50 border border-rose-100 p-8 rounded-[40px] text-center mb-10">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">{L('Total Liability', 'Passif Total')}</p>
                  <p className="text-4xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(showPayModal.total)}</p>
               </div>

               <form onSubmit={handleSettleDebt} className="space-y-8">
                  <div className="space-y-6">
                     <div className="relative">
                        <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-navy-950" />
                        <input
                          autoFocus
                          value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          type="number"
                          step="0.01"
                          required
                          className="w-full bg-navy-50 border-2 border-transparent rounded-[32px] pl-20 pr-8 py-6 text-3xl font-black text-navy-950 outline-none focus:border-navy-950 transition-all text-center"
                          placeholder="0.00"
                        />
                     </div>
                     
                     <div className="flex bg-navy-50 p-1.5 rounded-3xl border border-navy-100">
                        {['Cash', 'Momo', 'Card'].map(m => (
                           <button
                              key={m}
                              type="button"
                              onClick={() => setPayMethod(m)}
                              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${payMethod === m ? 'bg-navy-950 text-white shadow-lg' : 'text-blue-gray'}`}
                           >
                              {m}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button type="submit" className="w-full py-8 bg-emerald-500 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98]">
                     {L('Validate Payment', 'Valider le Règlement')} <CheckCircle2 className="w-6 h-6" />
                  </button>
               </form>
            </div>
         </div>
       )}

    </div>
  );
}
