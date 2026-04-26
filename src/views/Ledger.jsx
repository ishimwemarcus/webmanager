import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  Trash2,
  X,
  CreditCard,
  User,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Printer,
  Calendar,
  Filter,
  Activity,
  ChevronRight,
  Edit2
} from 'lucide-react';

export default function Ledger() {
  const store = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [filterDate, setFilterDate] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const [entry, setEntry] = useState({
    name: '',
    amount: 0,
    paid: 0,
    type: 'expense',
    client: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const manualEntries = store.getLedgerManual ? store.getLedgerManual() : [];
  const sales = store.getSales ? store.getSales() : [];
  const expenses = store.getExpenses ? store.getExpenses() : [];
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];

  const allLedgerData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().substring(0, 7);

    let combined = [
      ...manualEntries.map(e => ({ ...e, type: e.type || (e.record_type === 'expense' ? 'expense' : 'receivable') })),
      ...sales.filter(s => (parseFloat(s.amount) || 0) > (parseFloat(s.paid) || 0)).map(s => ({
        ...s,
        type: 'receivable',
        description: `Liaison Vente : ${s.client}`,
        isFromSale: true
      })),
      ...expenses.filter(e => !e.record_type || e.record_type === 'expense').map(e => ({
        ...e,
        type: 'expense',
        description: e.description || `Dépense : ${e.name}`
      }))
    ];

    if (filterDate === 'today') {
      combined = combined.filter(d => d.date?.startsWith(todayStr));
    } else if (filterDate === 'month') {
      combined = combined.filter(d => d.date?.startsWith(thisMonth));
    } else if (filterDate === 'custom' && customDates.start && customDates.end) {
      combined = combined.filter(d => {
        const dDate = d.date?.split('T')[0];
        return dDate >= customDates.start && dDate <= customDates.end;
      });
    }

    return combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [manualEntries, sales, expenses, filterDate, customDates]);

  const filteredData = allLedgerData.filter(d => {
    if (activeTab === 'general') return true;
    return d.type === activeTab;
  });

  const metrics = useMemo(() => {
    const totalOutstanding = allLedgerData.reduce((s, d) => s + Math.max(0, (parseFloat(d.amount) || 0) - (parseFloat(d.paid) || 0)), 0);
    const totalExpensed = allLedgerData.filter(d => d.type === 'expense').reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
    const totalReceivables = allLedgerData.filter(d => d.type === 'receivable').reduce((s, d) => s + Math.max(0, (parseFloat(d.amount) || 0) - (parseFloat(d.paid) || 0)), 0);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().substring(0, 7);
    const totalTips = sales.filter(s => {
      if (filterDate === 'today') return s.date?.startsWith(todayStr);
      if (filterDate === 'month') return s.date?.startsWith(thisMonth);
      if (filterDate === 'custom' && customDates.start && customDates.end) {
        const sDate = s.date?.split('T')[0];
        return sDate >= customDates.start && sDate <= customDates.end;
      }
      return true;
    }).reduce((s, r) => s + (parseFloat(r.tip) || 0), 0);

    const totalClientCredits = waitCredits.reduce((s, w) => s + (parseFloat(w.balance) || 0), 0);

    return { totalOutstanding, totalExpensed, totalReceivables, totalTips, totalClientCredits };
  }, [allLedgerData, sales, waitCredits, filterDate, customDates]);

  const handleAddEntry = (e) => {
    e.preventDefault();
    const recordType = entry.type === 'expense' ? 'expense' : 'ledger_entry';
    if (editingEntry) {
      store.updateRecord({
        ...editingEntry,
        ...entry,
        amount: parseFloat(entry.amount) || 0,
        paid: parseFloat(entry.paid) || 0,
        record_type: recordType,
        status: parseFloat(entry.paid) >= parseFloat(entry.amount) ? 'paid' : 'unpaid'
      });
    } else {
      store.addRecord({
        ...entry,
        amount: parseFloat(entry.amount) || 0,
        paid: parseFloat(entry.paid) || 0,
        record_type: recordType,
        status: parseFloat(entry.paid) >= parseFloat(entry.amount) ? 'paid' : 'unpaid'
      });
    }
    setShowModal(false);
    setEditingEntry(null);
    setEntry({ name: '', amount: 0, paid: 0, type: 'expense', client: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleEditEntry = (d) => {
    setEditingEntry(d);
    setEntry({
      name: d.name || '',
      amount: d.amount || 0,
      paid: d.paid || 0,
      type: d.type || 'expense',
      client: d.client || '',
      description: d.description || '',
      date: d.date || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleMarkPaid = (e) => {
    e.preventDefault();
    const payment = parseFloat(payAmount);
    if (!payment || payment <= 0) return;
    const currentPaid = parseFloat(showPayModal.paid) || 0;
    const newPaid = currentPaid + payment;
    const isFullyPaid = newPaid >= parseFloat(showPayModal.amount);
    store.updateRecord({ ...showPayModal, paid: newPaid, status: isFullyPaid ? 'paid' : 'partial' });
    setShowPayModal(null);
    setPayAmount('');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Audit Financier
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            Grand Livre — Flux de Trésorerie & Obligations
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowModal(true)}
             className="flex items-center justify-center gap-3 px-8 py-4 bg-navy-950 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl active:scale-95"
           >
             <Plus className="w-5 h-5" /> Nouvelle Entrée
           </button>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
         <div className="glass-card bg-white p-8 rounded-[48px] border-rose-100 shadow-sm hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-3 italic">Débit (Dépenses)</p>
            <p className="text-3xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(metrics.totalExpensed)}</p>
         </div>
         <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 shadow-sm hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-3 italic">Crédit Clients</p>
            <p className="text-3xl font-black text-emerald-600 tracking-tighter">{store.formatCurrency(metrics.totalClientCredits)}</p>
         </div>
         <div className="glass-card bg-white p-8 rounded-[48px] border-indigo-100 shadow-sm hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-3 italic">Créances Actives</p>
            <p className="text-3xl font-black text-indigo-600 tracking-tighter">{store.formatCurrency(metrics.totalOutstanding)}</p>
         </div>
         <div className="glass-card bg-navy-950 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
               <TrendingUp className="w-16 h-16" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 italic">Pourboires</p>
            <p className="text-3xl font-black text-white tracking-tighter">{store.formatCurrency(metrics.totalTips)}</p>
         </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 no-print">
         <div className="flex bg-navy-50 p-1.5 rounded-3xl border border-navy-100">
            {['general', 'expense', 'receivable'].map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-navy-950 text-white shadow-lg' : 'text-blue-gray hover:text-navy-950'}`}
               >
                  {tab === 'general' ? 'Vue Totale' : tab === 'expense' ? 'Dépenses' : 'Créances'}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-3 bg-navy-50 p-1.5 rounded-3xl border border-navy-100">
            {['all', 'today', 'month'].map(time => (
               <button
                  key={time}
                  onClick={() => setFilterDate(time)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterDate === time ? 'bg-white text-navy-950 shadow-sm' : 'text-blue-gray hover:text-navy-950'}`}
               >
                  {time === 'all' ? 'Archive' : time === 'today' ? 'Journée' : 'Mois'}
               </button>
            ))}
         </div>
      </div>

      {/* Data Engine List */}
      <div className="space-y-4">
         {filteredData.length > 0 ? (
            filteredData.map((d, i) => (
               <div key={i} className="glass-card bg-white border border-navy-50 p-6 hover:border-emerald-500 transition-all group shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${d.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {d.type === 'expense' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-navy-950 uppercase tracking-tighter">{d.name}</h3>
                        <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-60">{d.client || 'OPÉRATION INTERNE'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 max-w-3xl text-center md:text-left">
                     <div>
                        <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Date / Flux</p>
                        <p className="text-xs font-black text-navy-950 uppercase opacity-60">
                           {new Date(d.date).toLocaleDateString()}
                        </p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Évaluation</p>
                        <p className="text-sm font-black text-navy-950">{store.formatCurrency(d.amount)}</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Solde Réglé</p>
                        <p className="text-sm font-black text-emerald-600">{store.formatCurrency(d.paid)}</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Obligation</p>
                        <p className={`text-sm font-black ${ (parseFloat(d.amount)||0) > (parseFloat(d.paid)||0) ? 'text-rose-600' : 'text-blue-gray/20' }`}>
                           {store.formatCurrency(Math.max(0, (parseFloat(d.amount)||0) - (parseFloat(d.paid)||0)))}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                     {d.status !== 'paid' && (parseFloat(d.amount) || 0) > (parseFloat(d.paid) || 0) && (
                        <button 
                          onClick={() => setShowPayModal(d)}
                          className="px-6 py-3 bg-navy-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md"
                        >
                           Solder
                        </button>
                     )}
                     <button 
                        onClick={() => {
                           const originalTitle = document.title;
                           document.title = `Audit_${d.name}_${new Date(d.date).toISOString().split('T')[0]}`;
                           window.print();
                           document.title = originalTitle;
                        }}
                        className="p-3 bg-navy-50 text-blue-gray rounded-xl hover:bg-navy-950 hover:text-white transition-all shadow-sm"
                     >
                        <Printer className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={() => handleEditEntry(d)}
                        className="p-3 bg-navy-50 text-blue-gray rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                     >
                        <Edit2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => store.deleteRecord(d)}
                       className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))
         ) : (
            <div className="py-32 text-center glass-card border-dashed border-2 border-navy-100 opacity-20">
               <BookOpen className="w-20 h-20 mx-auto text-blue-gray mb-6" />
               <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">Aucune archive détectée</p>
            </div>
         )}
      </div>

      {/* Modals: Manual Entry & Payment */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowModal(false)}>
           <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-xl w-full scale-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">Entrée Manuelle</h3>
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-40">Injection de Données Financières</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-3 hover:bg-navy-50 rounded-full transition-all">
                    <X className="w-6 h-6 text-blue-gray" />
                 </button>
              </div>

              <form onSubmit={handleAddEntry} className="space-y-8">
                 <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEntry({ ...entry, type: 'expense' })}
                      className={`flex-1 p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${entry.type === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-navy-50 border-transparent text-blue-gray opacity-40'}`}
                    >
                       <TrendingDown className="w-8 h-8" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Débit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntry({ ...entry, type: 'receivable' })}
                      className={`flex-1 p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${entry.type === 'receivable' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-navy-50 border-transparent text-blue-gray opacity-40'}`}
                    >
                       <TrendingUp className="w-8 h-8" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Crédit</span>
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div className="relative">
                       <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-gray" />
                       <input value={entry.name} onChange={e => setEntry({ ...entry, name: e.target.value })} type="text" required className="w-full bg-navy-50 border-2 border-transparent rounded-3xl pl-16 pr-6 py-5 text-sm font-black text-navy-950 uppercase outline-none focus:border-navy-950 transition-all placeholder:text-blue-gray/20" placeholder="Objet de l'Opération" />
                    </div>
                    <div className="relative">
                       <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-gray" />
                       <input value={entry.client} onChange={e => setEntry({ ...entry, client: e.target.value })} type="text" className="w-full bg-navy-50 border-2 border-transparent rounded-3xl pl-16 pr-6 py-5 text-sm font-black text-navy-950 uppercase outline-none focus:border-navy-950 transition-all placeholder:text-blue-gray/20" placeholder="Entité / Client" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-navy-50 p-6 rounded-3xl text-center border border-navy-100">
                       <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-2">Montant</p>
                       <input value={entry.amount} onChange={e => setEntry({ ...entry, amount: e.target.value })} type="number" required className="w-full bg-transparent text-2xl font-black text-navy-950 outline-none text-center" />
                    </div>
                    <div className="bg-navy-50 p-6 rounded-3xl text-center border border-navy-100">
                       <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-2">Réglé</p>
                       <input value={entry.paid} onChange={e => setEntry({ ...entry, paid: e.target.value })} type="number" required className="w-full bg-transparent text-2xl font-black text-emerald-600 outline-none text-center" />
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-navy-950 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all">
                    Confirmer l'Entrée <ArrowRight className="w-5 h-5" />
                 </button>
              </form>
           </div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowPayModal(null)}>
           <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-md w-full scale-in" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-2 mb-10">
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">Règlement</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-40">Solder l'Obligation Financière</p>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-8 rounded-[40px] text-center mb-10">
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Balance Ouverte</p>
                 <p className="text-4xl font-black text-rose-600 tracking-tighter">{store.formatCurrency((parseFloat(showPayModal.amount) || 0) - (parseFloat(showPayModal.paid) || 0))}</p>
              </div>

              <form onSubmit={handleMarkPaid} className="space-y-8">
                 <div className="relative">
                    <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-navy-950" />
                    <input
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-navy-50 border-2 border-transparent rounded-[32px] pl-20 pr-8 py-6 text-3xl font-black text-navy-950 outline-none focus:border-navy-950 transition-all text-center"
                      placeholder="0.00"
                    />
                 </div>

                 <button type="submit" className="w-full py-6 bg-navy-950 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all">
                    Valider le Paiement <CheckCircle2 className="w-5 h-5" />
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
