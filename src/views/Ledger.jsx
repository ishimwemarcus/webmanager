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
  Printer
} from 'lucide-react';

export default function Ledger() {
  const store = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [filterDate, setFilterDate] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
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

  const manualEntries = store.getLedgerManual();
  const sales = store.getSales();
  const expenses = store.getExpenses();
  const waitCredits = store.getWaitCredits();


  const handleAddEntry = (e) => {
    e.preventDefault();
    const recordType = entry.type === 'expense' ? 'expense' : 'ledger_entry';
    store.addRecord({
      ...entry,
      amount: parseFloat(entry.amount) || 0,
      paid: parseFloat(entry.paid) || 0,
      record_type: recordType,
      status: parseFloat(entry.paid) >= parseFloat(entry.amount) ? 'paid' : 'unpaid'
    });
    setShowModal(false);
    setEntry({ name: '', amount: 0, paid: 0, type: 'expense', client: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const allLedgerData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().substring(0, 7);

    let combined = [
      ...manualEntries.map(e => ({ ...e, type: e.type || (e.record_type === 'expense' ? 'expense' : 'receivable') })),
      ...sales.filter(s => (parseFloat(s.amount) || 0) > (parseFloat(s.paid) || 0)).map(s => ({
        ...s,
        type: 'receivable',
        description: `Ref: Sale linkage with ${s.client}`,
        isFromSale: true
      })),
      ...expenses.filter(e => !e.record_type || e.record_type === 'expense').map(e => ({
        ...e,
        type: 'expense',
        description: e.description || `Expenditure: ${e.name}`
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
    <div className="max-w-full mx-auto min-h-[calc(100vh-6rem)] bg-[#064E3B] rounded-[24px] p-4 md:p-8 space-y-4 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 fade-in-up">
      <div className="border-b border-navy-50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter text-white leading-none">
            {t('ledger')} Financier
          </h1>
          <h2 className="text-sm font-bold text-[#F59E0B] tracking-[0.2em] uppercase">
            {t('masterSettlement')}
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              const clients = [...new Set(waitCredits.map(w => w.client?.trim()).filter(Boolean))];
              clients.forEach(c => {
                const bal = store.getClientWaitBalance(c);
                if (bal > 0) {
                  // This will trigger a reconciliation via a dummy sale or a dedicated function if I had one.
                  // For now, I'll manually trigger it by adding a $0 sale with credit use.
                  store.processSmartTransaction({
                    name: 'Account Reconciliation',
                    client: c,
                    amount: 0,
                    paid: 0,
                    product_id: 'n/a',
                    quantity: 0,
                    useCredit: true,
                    date: new Date().toISOString()
                  });
                }
              });
              store.showAlert("Tous les comptes clients ont été réconciliés !");
            }}
            className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-success-pro text-white font-black uppercase text-xs md:text-sm tracking-widest shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" /> Réconciliation Globale
          </button>
          <button onClick={() => setShowModal(true)} className="flex-1 md:flex-none bg-[#BEF264] text-black font-black px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-white transition-all uppercase tracking-widest text-xs">
            <Plus className="w-5 h-5" /> Entrée Manuelle
          </button>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="glass-card p-6 rounded-[24px] border-l-4 border-red-400 bg-white/5 backdrop-blur-xl">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/50 mb-2">Débit (Dépenses)</p>
          <p className="text-2xl font-black text-white">{store.formatCurrency(metrics.totalExpensed)}</p>
        </div>
        <div className="glass-card p-6 rounded-[24px] border-l-4 border-green-400 bg-white/5 backdrop-blur-xl">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/50 mb-2">Crédit Stocké</p>
          <p className="text-2xl font-black text-green-400">{store.formatCurrency(metrics.totalClientCredits)}</p>
        </div>

        <div className="glass-card p-6 rounded-[24px] border-l-4 border-blue-400 bg-white/5 backdrop-blur-xl">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/50 mb-2">Créances Clients</p>
          <p className="text-2xl font-black text-blue-400">{store.formatCurrency(metrics.totalOutstanding)}</p>
        </div>
        <div className="glass-card p-6 rounded-[24px] border-l-4 border-purple-400 bg-white/5 backdrop-blur-xl">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/50 mb-2">Pourboires</p>
          <p className="text-2xl font-black text-purple-400">{store.formatCurrency(metrics.totalTips)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
        <div className="flex bg-navy-50 p-1 rounded-2xl border border-navy-100 w-fit">
          {['general', 'expense', 'receivable'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-navy-brand text-white shadow-lg' : 'text-blue-gray hover:text-navy-brand'}`}
            >
              {tab === 'general' ? 'Vue d\'ensemble' : tab === 'expense' ? 'Dépenses' : 'Créances'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-navy-50 p-1 rounded-2xl border border-navy-100">
          {['all', 'today', 'month'].map(time => (
            <button
              key={time}
              onClick={() => setFilterDate(time)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${filterDate === time ? 'bg-white text-navy-brand shadow-sm border border-navy-100' : 'text-blue-gray hover:text-navy-brand'}`}
            >
              {time === 'all' ? 'Tout' : time === 'today' ? 'Aujourd\'hui' : 'Ce Mois'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-2xl">

        {/* ✅ MOBILE: Card List */}
        <div className="block lg:hidden divide-y divide-navy-50">
          {filteredData.length > 0 ? (
            filteredData.map((d, idx) => (
              <div key={d.id || idx} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs md:text-sm md:text-xs uppercase font-black flex-shrink-0 ${d.type === 'expense' ? 'bg-danger-pro/5 text-danger-pro' : 'bg-success-pro/5 text-success-pro'
                        }`}>{d.type}</span>
                      <p className="font-black text-navy-900 uppercase tracking-tight text-sm truncate">{d.name}</p>
                    </div>
                    <p className="text-xs text-navy-brand font-bold">{d.client || 'INTERNAL'}</p>
                    <p className="text-xs text-blue-gray italic">{d.description}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${d.status === 'paid' ? 'bg-success-pro' : 'bg-danger-pro'}`}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-navy-50 rounded-xl p-2 text-center">
                    <p className="text-xs md:text-sm md:text-xs text-blue-gray uppercase font-black">Montant</p>
                    <p className="text-xs font-black text-navy-900">{store.formatCurrency(d.amount)}</p>
                  </div>
                  <div className="bg-navy-50 rounded-xl p-2 text-center">
                    <p className="text-xs md:text-sm md:text-xs text-blue-gray uppercase font-black">Payé</p>
                    <p className="text-xs font-black text-success-pro">{store.formatCurrency(d.paid)}</p>
                  </div>
                  <div className="bg-navy-50 rounded-xl p-2 text-center">
                    <p className="text-xs md:text-sm md:text-xs text-blue-gray uppercase font-black">Reste</p>
                    <p className="text-xs font-black text-danger-pro">{store.formatCurrency(Math.max(0, (parseFloat(d.amount) || 0) - (parseFloat(d.paid) || 0)))}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-gray font-bold">{store.formatDate(d.date)}</p>
                  <div className="flex gap-2">
                    {d.status !== 'paid' && (parseFloat(d.amount) || 0) > (parseFloat(d.paid) || 0) && (
                      <button onClick={() => setShowPayModal(d)}
                        className="px-3 py-1.5 bg-navy-brand text-white text-xs font-black uppercase rounded-full">
                        Régler
                      </button>
                    )}
                    <button onClick={() => store.deleteRecord(d)}
                      className="p-2 rounded-lg bg-danger-pro/5 border border-danger-pro/10">
                      <Trash2 className="w-3.5 h-3.5 text-danger-pro" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 md:p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-navy-200" />
              <p className="text-sm font-black uppercase tracking-widest text-blue-gray">Aucune entrée détectée</p>
            </div>
          )}
        </div>

        {/* ✅ DESKTOP: Full Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="premium-table w-full">
            <thead>
              <tr className="text-left bg-white/5">
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-white/50">Flux / Date</th>
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-white/50">Classification</th>
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-white/50">Entité</th>
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-white/50 text-right">Évaluation</th>
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-white/50 text-right">Réglé</th>
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-[#BEF264] text-right">Obligation</th>
                <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-white/50 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.length > 0 ? (
                filteredData.map((d, idx) => (
                  <tr key={d.id || idx} className="group hover:bg-navy-50/30 transition-colors">
                    <td className="p-6 text-white">
                      <button
                        onClick={() => { if (d.type === 'receivable') window.location.hash = '#/sales'; }}
                        className="flex items-center gap-3 cursor-pointer group/item"
                      >
                        <div className={`w-2 h-2 rounded-full ${d.status === 'paid' ? 'bg-green-400' : 'bg-red-400 group-hover/item:scale-150 transition-all'}`}></div>
                        <div className="text-white/40 font-bold group-hover/item:text-white">{store.formatDate(d.date)}</div>
                      </button>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs md:text-sm md:text-xs uppercase font-black ${d.type === 'expense' ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'}`}>
                          {d.type}
                        </span>
                        <div className="font-bold text-white uppercase tracking-tight">{d.name}</div>
                      </div>
                      <div className="text-xs md:text-sm text-white/30 font-medium italic">{d.description}</div>
                    </td>
                    <td className="p-6 font-bold text-white">{d.client || 'INTERNAL'}</td>
                    <td className="p-6 text-right font-bold text-white">{store.formatCurrency(d.amount)}</td>
                    <td className="p-6 text-right text-green-400 font-bold">{store.formatCurrency(d.paid)}</td>
                    <td className="p-6 text-right font-black text-red-400">{store.formatCurrency(Math.max(0, (parseFloat(d.amount) || 0) - (parseFloat(d.paid) || 0)))}</td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {d.status !== 'paid' && (parseFloat(d.amount) || 0) > (parseFloat(d.paid) || 0) && (
                          <button onClick={() => setShowPayModal(d)} className="bg-navy-brand text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md no-print">
                            Régler
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const originalTitle = document.title;
                            document.title = `Ledger_${d.client || 'Internal'}_${d.name}_${d.date?.split('T')[0]}`;
                            window.print();
                            document.title = originalTitle;
                          }}
                          className="p-3 rounded-2xl text-blue-gray hover:text-navy-brand hover:bg-navy-50 transition-all no-print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={() => store.deleteRecord(d)} className="p-3 rounded-2xl text-blue-gray hover:text-danger-pro hover:bg-danger-pro/5 transition-all no-print">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-32 text-center text-blue-gray">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-black uppercase tracking-widest">Aucune entrée détectée dans le grand livre</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
          <div className="glass-card rounded-[48px] shadow-2xl w-full max-w-xl relative overflow-hidden bg-white border border-navy-50 scale-in">
            <div className="p-10 bg-navy-brand text-white">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Entrée Manuelle</h3>
              <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/60 mt-1">Injection de Données Financières</p>
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-3 rounded-full hover:bg-white/10 text-white transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleAddEntry} className="p-10 space-y-8">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEntry({ ...entry, type: 'expense' })}
                  className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${entry.type === 'expense' ? 'border-danger-pro bg-danger-pro/5 text-danger-pro shadow-lg' : 'border-navy-50 text-blue-gray'}`}
                >
                  <TrendingDown className="w-6 h-6" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-widest">Debit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntry({ ...entry, type: 'receivable' })}
                  className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${entry.type === 'receivable' ? 'border-success-pro bg-success-pro/5 text-success-pro shadow-lg' : 'border-navy-50 text-blue-gray'}`}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-widest">Credit</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-brand"><CreditCard className="w-5 h-5" /></span>
                  <input value={entry.name} onChange={e => setEntry({ ...entry, name: e.target.value })} type="text" required className="w-full bg-navy-50 border border-navy-100 rounded-3xl pl-16 pr-6 py-5 text-charcoal font-bold focus:border-navy-brand transition-all outline-none" placeholder="Libellé / Objet" />
                </div>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-brand"><User className="w-5 h-5" /></span>
                  <input value={entry.client} onChange={e => setEntry({ ...entry, client: e.target.value })} type="text" className="w-full bg-navy-50 border border-navy-100 rounded-3xl pl-16 pr-6 py-5 text-charcoal font-bold focus:border-navy-brand transition-all outline-none" placeholder="Identité de l'Entité" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-navy-50 p-5 rounded-3xl border border-navy-100 text-center">
                    <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block">Valeur</label>
                    <input value={entry.amount} onChange={e => setEntry({ ...entry, amount: e.target.value })} type="number" required className="w-full bg-transparent text-2xl font-black text-charcoal focus:outline-none text-center" />
                  </div>
                  <div className="bg-navy-50 p-5 rounded-3xl border border-navy-100 text-center">
                    <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block">Payé</label>
                    <input value={entry.paid} onChange={e => setEntry({ ...entry, paid: e.target.value })} type="number" required className="w-full bg-transparent text-2xl font-black text-success-pro focus:outline-none text-center" />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-premium w-full !py-6">
                Autoriser l'Entrée <ArrowRight className="w-5 h-5 ml-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
          <div className="glass-card rounded-[48px] shadow-2xl w-full max-w-md relative overflow-hidden bg-white border border-navy-50 scale-in">
            <div className="p-10 bg-navy-brand text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Règlement de Dette</h3>
                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/60 mt-1">Solder l'Obligation</p>
              </div>
              <button onClick={() => { setShowPayModal(null); setPayAmount(''); }} className="p-3 rounded-full hover:bg-white/10 text-white transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleMarkPaid} className="p-10 space-y-8">
              <div className="bg-danger-pro/5 border border-danger-pro/20 p-8 rounded-[32px] text-center">
                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-danger-pro/80 mb-2">À régler</p>
                <p className="text-4xl font-black text-danger-pro">{store.formatCurrency((parseFloat(showPayModal.amount) || 0) - (parseFloat(showPayModal.paid) || 0))}</p>
              </div>

              <div className="space-y-4">
                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray text-center block">Montant de l'Injection</label>
                <div className="relative">
                  <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-navy-brand" />
                  <input
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(parseFloat(showPayModal.amount) || 0) - (parseFloat(showPayModal.paid) || 0)}
                    required
                    autoFocus
                    className="w-full bg-navy-50 border-2 border-navy-100 rounded-[32px] pl-20 pr-8 py-6 text-3xl font-black text-charcoal focus:border-navy-brand outline-none text-center"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button type="submit" className="btn-premium w-full !py-6">
                Confirmer le Règlement <CheckCircle2 className="w-5 h-5 ml-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
