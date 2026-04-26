import React, { useState, useEffect, useMemo } from 'react';
import { printThermalReceipt, shareReceipt } from '../utils/Reporter';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  ShoppingCart,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Gift,
  ShieldCheck,
  Search,
  Clock,
  Wallet,
  Printer,
  Volume2,
  TrendingUp,
  Calculator,
  Calendar,
  Filter,
  CreditCard,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { getFormattedQuantity } from '../utils/ProductUtils';

export default function Sales() {
  const store = useStore();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayModal, setShowPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState('today');
  const [filterShift, setFilterShift] = useState(true);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showConfirmPop, setShowConfirmPop] = useState(false);

  const [newSale, setNewSale] = useState({
    product_id: '',
    client: '',
    quantity: 1,
    amount: 0,
    paid: 0,
    paymentMethod: 'Cash',
    phone: '',
    useCredit: true,
    overpayType: null
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaleRecord, setLastSaleRecord] = useState(null);

  const products = store.getProducts();
  const sales = store.getSales();
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];
  const availableCredit = store.getClientWaitBalance && newSale.client ? store.getClientWaitBalance(newSale.client, newSale.phone) : 0;
  const clientDebt = store.getClientDebtBalance && newSale.client ? store.getClientDebtBalance(newSale.client, newSale.phone) : 0;

  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().substring(0, 7);

    return sales.filter(s => {
      const matchesSearch = !searchQuery ||
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.client && s.client.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Shift Filter
      if (filterShift && store.currentOperator) {
        if (s.operator !== store.currentOperator) return false;
      }

      if (filterDate === 'today') {
        return s.date?.startsWith(today);
      } else if (filterDate === 'month') {
        return s.date?.startsWith(thisMonth);
      } else if (filterDate === 'custom') {
        if (customDates.start && customDates.end) {
          const sDate = s.date?.split('T')[0];
          return sDate >= customDates.start && sDate <= customDates.end;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [sales, searchQuery, filterDate, customDates, filterShift, store.currentOperator]);

  useEffect(() => {
    if (newSale.product_id) {
      const p = products.find(pr => pr.id === newSale.product_id || pr.product_id === newSale.product_id);
      if (p) {
        const total = p.price * (newSale.quantity || 1);
        setNewSale(prev => ({ ...prev, amount: total, paid: total }));
      }
    }
  }, [newSale.product_id, newSale.quantity]);

  const handleSalePreSubmit = (e) => {
    if (e) e.preventDefault();
    const product = products.find(p => p.id === newSale.product_id || p.product_id === newSale.product_id);
    if (!product) return;
    if (product.quantity < newSale.quantity) {
      store.showAlert('Unité de stock insuffisante.');
      return;
    }
    if (!newSale.client.trim()) return;

    if (parseFloat(newSale.paid) > parseFloat(newSale.amount)) {
      setNewSale(prev => ({ ...prev, overpayType: null }));
    }
    setShowConfirmPop(true);
  };

  const registerSale = () => {
    const product = products.find(p => p.id === newSale.product_id || p.product_id === newSale.product_id);
    const amount = parseFloat(newSale.amount);
    const paid = parseFloat(newSale.paid);
    const totalPayment = paid + (newSale.useCredit ? availableCredit : 0);

    const finalSale = {
      record_type: 'sale',
      name: product.name,
      status: totalPayment < amount ? 'partial' : 'paid',
      date: new Date().toISOString(),
      product_id: product.id || product.product_id,
      client: newSale.client,
      quantity: parseFloat(newSale.quantity),
      amount,
      paid: totalPayment,
      phone: newSale.phone,
      paymentMethod: newSale.paymentMethod,
      useCredit: newSale.useCredit
    };

    store.processSmartTransaction(finalSale);

    setLastSaleRecord(finalSale);
    setShowSuccess(true);
    closeAll();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const closeAll = () => {
    setShowModal(false);
    setShowConfirmPop(false);
    setNewSale({ product_id: '', client: '', phone: '', quantity: 1, amount: 0, paid: 0, paymentMethod: 'Cash', useCredit: true, overpayType: null });
  };

  const handlePayDebt = (e) => {
    e.preventDefault();
    if (!showPayModal || !payAmount) return;
    
    const payment = parseFloat(payAmount);
    const currentPaid = parseFloat(showPayModal.paid) || 0;
    const totalAmount = parseFloat(showPayModal.amount) || 0;
    const newPaid = currentPaid + payment;
    
    // Determine new status
    const newStatus = newPaid >= totalAmount ? 'PAID' : 'PARTIAL';
    
    store.updateRecord({
      ...showPayModal,
      paid: newPaid,
      status: newStatus,
      paymentMethod: payMethod // Update method for the final settlement if desired
    });
    
    store.showAlert(`Règlement de ${store.formatCurrency(payment)} enregistré !`);
    setShowPayModal(null);
    setPayAmount('');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Opérations de Vente
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            Flux de Revenus — Archivage Temps Réel
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-navy-950 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-2xl hover:shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5 text-emerald-400" /> + New Sale
        </button>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Today's Revenue</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">
              {store.formatCurrency(sales.filter(s => s.date && s.date.startsWith(new Date().toISOString().split('T')[0])).reduce((acc, s) => acc + (parseFloat(s.paid) || 0), 0))}
            </p>
          </div>
        </div>

        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-navy-50 text-navy-950 flex items-center justify-center shadow-inner">
            <Calculator className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Total Transactions</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">
              {sales.length} <span className="text-xs text-blue-gray opacity-40 font-black">Records</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Rechercher des archives..."
            className="w-full bg-white border border-emerald-100 rounded-[24px] pl-16 pr-6 py-5 text-navy-950 font-black text-sm focus:border-emerald-500 outline-none transition-all shadow-xl placeholder:text-blue-gray/30 uppercase"
          />
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-emerald-100 shadow-xl overflow-x-auto scrollbar-hide max-w-full">
          <button
            onClick={() => setFilterShift(!filterShift)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 flex-shrink-0 ${filterShift ? 'bg-navy-950 text-white shadow-lg' : 'text-blue-gray hover:text-emerald-500'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            {filterShift ? 'Mon Poste' : 'Tous les Postes'}
          </button>
          
          <div className="w-px h-6 bg-emerald-100 mx-1 flex-shrink-0"></div>

          <div className="flex items-center gap-1">
            {[
              { id: 'today', label: 'Today' },
              { id: 'month', label: 'Month' },
              { id: 'custom', label: 'Custom' }
            ].map(time => (
              <button
                key={time.id}
                onClick={() => setFilterDate(time.id)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${filterDate === time.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-blue-gray hover:text-emerald-500'}`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
         <div className="bg-emerald-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce-gentle font-black text-xs uppercase tracking-widest no-print">
            <CheckCircle2 className="w-5 h-5" /> Vente enregistrée avec succès !
         </div>
      )}

      {/* Main Table / List View */}
      <div className="space-y-4">
        {filteredSales.length > 0 ? (
          filteredSales.map((s, idx) => (
            <div key={s.id || idx} className="glass-card bg-white border border-emerald-50 border-b-4 border-b-emerald-100 p-6 hover:border-emerald-400 transition-all group shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${s.status?.includes('paid') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                      {s.status?.includes('paid') ? <ShieldCheck className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-navy-950 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">{s.name}</h3>
                      <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic">{s.client || 'Client Anonyme'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-8 text-center flex-1 max-w-xl">
                   <div>
                      <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">Volume</p>
                      <p className="text-xs font-black text-navy-950">{s.quantity} {s.unit || 'Kg'}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xs font-black text-navy-950">{store.formatCurrency(s.amount)}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">Method</p>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-navy-950">
                         <Wallet className="w-3.5 h-3.5 text-emerald-500" /> {s.paymentMethod || 'Cash'}
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-navy-950 uppercase">{new Date(s.date).toLocaleDateString()}</p>
                      <p className="text-[8px] font-bold text-blue-gray uppercase tracking-widest opacity-60">{new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <button className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-navy-950 hover:text-white transition-all shadow-sm">
                      <Printer className="w-4 h-4" />
                   </button>
                   <button className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                      <Trash2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => {
                        if (s.status?.toLowerCase() === 'partial') {
                           setShowPayModal(s);
                           setPayAmount((parseFloat(s.amount)||0) - (parseFloat(s.paid)||0));
                        }
                     }}
                     disabled={s.status?.toLowerCase() === 'paid'}
                     className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${s.status?.toLowerCase() === 'paid' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-default' : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20'}`}
                   >
                      {s.status?.toLowerCase() === 'partial' ? <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> {s.status}</span> : s.status}
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (

          <div className="py-32 text-center glass-card border-dashed border-2 border-emerald-100 opacity-30">
             <ShoppingCart className="w-20 h-20 mx-auto text-blue-gray mb-6" />
             <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">Aucune transaction enregistrée</p>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-navy-50 flex items-center justify-between bg-navy-50/50">
               <h2 className="text-xl font-black text-navy-950 uppercase tracking-tighter">Nouvelle Vente</h2>
               <button onClick={closeAll} className="p-2 hover:bg-navy-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSalePreSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
               {/* Product Selection */}
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">Produit</label>
                  <select
                    required
                    value={newSale.product_id}
                    onChange={e => setNewSale({...newSale, product_id: e.target.value})}
                    className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name.toUpperCase()} ({p.quantity} en stock)</option>
                    ))}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">Quantité</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newSale.quantity}
                      onChange={e => setNewSale({...newSale, quantity: e.target.value})}
                      className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">Mode Paiement</label>
                    <select
                      value={newSale.paymentMethod}
                      onChange={e => setNewSale({...newSale, paymentMethod: e.target.value})}
                      className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Momo">Momo</option>
                      <option value="Card">Carte</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">Client</label>
                  <input
                    type="text"
                    required
                    placeholder="Nom du client..."
                    value={newSale.client}
                    onChange={e => setNewSale({...newSale, client: e.target.value})}
                    className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30"
                  />
               </div>

               {/* Pricing Summary */}
               <div className="bg-navy-950 p-6 rounded-3xl text-white space-y-3">
                  <div className="flex justify-between items-center opacity-60">
                     <p className="text-[10px] font-black uppercase tracking-widest">Total HT</p>
                     <p className="text-sm font-black">{store.formatCurrency(newSale.amount)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total à Payer</p>
                     <p className="text-2xl font-black">{store.formatCurrency(newSale.amount)}</p>
                  </div>
               </div>

               <button
                 type="submit"
                 className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 <Zap className="w-5 h-5" /> Enregistrer Transaction
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPop && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-scale-in">
            <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-3xl">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter mb-2">Confirmer Vente</h3>
               <p className="text-xs font-black text-blue-gray uppercase tracking-widest mb-8 leading-relaxed opacity-60">Voulez-vous finaliser l'enregistrement de cette opération de {store.formatCurrency(newSale.amount)} ?</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handlePopConfirm(false)} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-navy-100 transition-all">Annuler</button>
                  <button onClick={() => handlePopConfirm(true)} className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Confirmer</button>
               </div>
            </div>
         </div>
      )}

      {/* Debt Settlement Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowPayModal(null)}>
           <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-md w-full scale-in" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-2 mb-10">
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">Règlement de Dette</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-40">Solder l'Obligation Financière</p>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-8 rounded-[40px] text-center mb-10">
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Reste à payer</p>
                 <p className="text-4xl font-black text-rose-600 tracking-tighter">{store.formatCurrency((parseFloat(showPayModal.amount) || 0) - (parseFloat(showPayModal.paid) || 0))}</p>
              </div>

              <form onSubmit={handlePayDebt} className="space-y-8">
                 <div className="space-y-6">
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
                    Valider le Règlement <CheckCircle2 className="w-6 h-6" />
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
