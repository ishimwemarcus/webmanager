import React, { useState, useEffect, useMemo } from 'react';
import { printThermalReceipt, shareReceipt, printDebtSettlementReceipt, shareDebtSettlementReceipt } from '../utils/Reporter';
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
  Zap,
  Edit2,
  Phone,
  Check,
  MessageSquare,
  Banknote,
  Star
} from 'lucide-react';
import { getFormattedQuantity } from '../utils/ProductUtils';

export default function Sales() {
  const store = useStore();
  const { t, L } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayModal, setShowPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState('today');
  const [filterShift, setFilterShift] = useState(true);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showConfirmPop, setShowConfirmPop] = useState(false);
  const [showOverpayModal, setShowOverpayModal] = useState(false);
  const [pendingOverpay, setPendingOverpay] = useState(0);
  const [editingSale, setEditingSale] = useState(null);
  const [debtPayment, setDebtPayment] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletSettleAmount, setWalletSettleAmount] = useState('');

  const [newSale, setNewSale] = useState({
    product_id: '',
    client: '',
    quantity: 1,
    amount: 0,
    paid: 0,
    paymentMethod: 'Cash',
    phone: '',
    useCredit: true,
    overpayType: null,
    isAccepted: false,
    debtPaymentAmount: 0
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
    
    if (!newSale.isAccepted) {
       // Step 1: Acceptance
       if (product.quantity < newSale.quantity) {
          store.showAlert(L('Insufficient stock unit.', 'Unité de stock insuffisante.'));
          return;
       }
       if (!newSale.client.trim()) {
          store.showAlert("Veuillez entrer le nom du client.");
          return;
       }
       
       setNewSale(prev => ({ ...prev, isAccepted: true }));
       store.showAlert(L("Offer accepted by the client. Ready for finalization.", "Offre acceptée par le client. Prêt pour finalisation."), "warning");
       return;
    }

    const overpay = (parseFloat(newSale.paid) || 0) - (parseFloat(newSale.amount) || 0);
    if (overpay > 0) {
      // Intercept: show the overpayment choice modal
      setPendingOverpay(overpay);
      setShowOverpayModal(true);
      return;
    }

    setShowConfirmPop(true);
  };

  const registerSale = (overpayChoice = null) => {
    const product = products.find(p => p.id === newSale.product_id || p.product_id === newSale.product_id);
    const amount = parseFloat(newSale.amount);
    const paid = parseFloat(newSale.paid);
    const totalPayment = paid + (newSale.useCredit ? availableCredit : 0);
    const overpay = Math.max(0, totalPayment - amount);
    const effectivePaid = overpayChoice ? amount : totalPayment;
    const debtPaymentAmt = parseFloat(newSale.debtPaymentAmount) || 0;

    const finalSale = {
      record_type: 'sale',
      name: product.name,
      status: effectivePaid < amount ? 'partial' : 'paid',
      date: new Date().toISOString(),
      product_id: product.id || product.product_id,
      client: newSale.client,
      quantity: parseFloat(newSale.quantity),
      amount,
      paid: effectivePaid,
      phone: newSale.phone,
      paymentMethod: newSale.paymentMethod,
      useCredit: newSale.useCredit,
      overpayChoice,
      debtPaymentAmount: debtPaymentAmt
    };

    store.processSmartTransaction(finalSale);

    // NEW: Handle debt payment
    if (debtPaymentAmt > 0 && newSale.client) {
      store.addRecord({
        record_type: 'debt_payment',
        client: newSale.client,
        phone: newSale.phone,
        amount: debtPaymentAmt,
        paymentMethod: newSale.paymentMethod,
        date: new Date().toISOString(),
        operator: store.currentOperator,
        note: L(`Debt payment during purchase of ${product.name}`, `Paiement de dette lors de l'achat de ${product.name}`)
      });
      store.showAlert(L(`${store.formatCurrency(debtPaymentAmt)} applied to debt for ${newSale.client}!`, `${store.formatCurrency(debtPaymentAmt)} appliqué à la dette de ${newSale.client} !`), 'success');
    }

    // Handle overpayment based on operator choice
    if (overpay > 0 && overpayChoice === 'tip') {
      // Register as a tip for the current operator's shift
      store.addRecord({
        record_type: 'ledger_entry',
        type: 'tip',
        name: `Pourboire — ${newSale.client || 'Client'}`,
        amount: overpay,
        operator: store.currentOperator,
        shiftId: store.shiftStart,
        client: newSale.client,
        phone: newSale.phone,
        date: new Date().toISOString(),
        note: L(`Tip received on sale of ${product.name}`, `Pourboire reçu sur vente de ${product.name}`)
      });
      store.showAlert(L(`Tip of ${store.formatCurrency(overpay)} recorded for ${store.currentOperator}!`, `Pourboire de ${store.formatCurrency(overpay)} enregistré pour ${store.currentOperator} !`), 'success');
    } else if (overpay > 0 && overpayChoice === 'credit') {
      // Registered as wait credit by processSmartTransaction automatically
      store.showAlert(L(`${store.formatCurrency(overpay)} added as Client Credit for ${newSale.client}.`, `${store.formatCurrency(overpay)} ajouté en Crédit Client pour ${newSale.client}.`), 'success');
    }

    setLastSaleRecord(finalSale);
    setShowSuccess(true);
    closeAll();
    setPendingOverpay(0);
    setShowOverpayModal(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSettleFullWallet = (e) => {
    if (e) e.preventDefault();
    const amount = parseFloat(walletSettleAmount);
    if (!amount || amount <= 0) return;

    store.settleClientDebt(newSale.client, newSale.phone, amount, newSale.paymentMethod, store.currentOperator);
    store.showAlert(L(`${store.formatCurrency(amount)} applied to settle ${newSale.client}'s wallet!`, `${store.formatCurrency(amount)} appliqué pour solder le compte de ${newSale.client} !`), 'success');
    
    // Generate Receipt for Settlement
    const receiptData = {
      client: newSale.client,
      phone: newSale.phone,
      amount: amount,
      paymentMethod: newSale.paymentMethod,
      remainingBalance: store.getClientGlobalBalance(newSale.client, newSale.phone) - amount, // Optimistic UI or better: get fresh
      date: new Date().toISOString()
    };
    // Re-calculating correctly for receipt
    receiptData.remainingBalance = store.getClientGlobalBalance(newSale.client, newSale.phone);

    printDebtSettlementReceipt(receiptData, store.currentOperator, store.formatCurrency);

    setWalletSettleAmount('');
    setShowWalletModal(false);
  };

  const sendWhatsAppReminder = (name, phone, balance) => {
    if (!phone || phone === 'none') {
      store.showAlert(L("No phone number found for this client.", "Aucun numéro de téléphone trouvé pour ce client."), "error");
      return;
    }
    const message = L(
      `Hello ${name}, your current balance at ${L('MARC Store', 'Boutique MARC')} is ${store.formatCurrency(balance)}. Thank you for your loyalty!`,
      `Bonjour ${name}, votre solde actuel chez ${L('MARC Store', 'Boutique MARC')} est de ${store.formatCurrency(balance)}. Merci pour votre fidélité !`
    );
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEditSale = (s) => {
    setEditingSale(s);
    const product = products.find(p => p.name === s.name);
    setNewSale({
      product_id: s.product_id || (product ? product.id : ''),
      client: s.client || '',
      phone: s.phone || '',
      quantity: s.quantity || 1,
      amount: s.amount || 0,
      paid: s.paid || 0,
      paymentMethod: s.paymentMethod || 'Cash',
      useCredit: s.useCredit !== false,
      overpayType: null,
      isAccepted: false,
      debtPaymentAmount: 0
    });
    setShowModal(true);
  };

  const updateSale = () => {
    if (!editingSale) return;
    const product = products.find(p => p.id === newSale.product_id || p.product_id === newSale.product_id);
    const amount = parseFloat(newSale.amount);
    const paid = parseFloat(newSale.paid);
    
    const updatedSale = {
      ...editingSale,
      name: product ? product.name : editingSale.name,
      product_id: newSale.product_id,
      client: newSale.client,
      quantity: parseFloat(newSale.quantity),
      amount,
      paid,
      phone: newSale.phone,
      paymentMethod: newSale.paymentMethod,
      status: paid < amount ? 'partial' : 'paid'
    };

    store.updateRecord(updatedSale);
    setShowSuccess(true);
    closeAll();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const closeAll = () => {
    setShowModal(false);
    setShowConfirmPop(false);
    setEditingSale(null);
    setDebtPayment(0);
    setNewSale({ product_id: '', client: '', phone: '', quantity: 1, amount: 0, paid: 0, paymentMethod: 'Cash', useCredit: true, overpayType: null, isAccepted: false, debtPaymentAmount: 0 });
  };

  const handlePayDebt = (e) => {
    e.preventDefault();
    if (!showPayModal || !payAmount) return;
    
    const payment = parseFloat(payAmount);
    const currentPaid = parseFloat(showPayModal.paid) || 0;
    const totalAmount = parseFloat(showPayModal.amount) || 0;
    const remainingDebt = totalAmount - currentPaid;
    
    let overpayment = 0;
    let newPaid = currentPaid + payment;

    if (payment > remainingDebt) {
       overpayment = payment - remainingDebt;
       newPaid = totalAmount;

       store.addRecord({
          record_type: 'wait',
          client: showPayModal.client || 'STANDARD',
          phone: showPayModal.phone || 'none',
          balance: overpayment,
          date: new Date().toISOString()
       });
       
       store.showAlert(L(`Debt cleared. ${store.formatCurrency(overpayment)} added as wait credit.`, `Dette soldée. ${store.formatCurrency(overpayment)} ajouté en crédit d'attente.`));
    } else {
       store.showAlert(L(`Payment of ${store.formatCurrency(payment)} recorded!`, `Règlement de ${store.formatCurrency(payment)} enregistré !`));
    }
    
    const newStatus = newPaid >= totalAmount ? 'PAID' : 'PARTIAL';
    
    store.updateRecord({
      ...showPayModal,
      paid: newPaid,
      status: newStatus,
      paymentMethod: payMethod
    });
    
    setShowPayModal(null);
    setPayAmount('');
  };

  const handleDeleteSale = (sale) => {
    store.showConfirm(L(`Delete this sale of ${sale.name}?`, `Supprimer cette vente de ${sale.name} ?`), () => {
      store.deleteRecord(sale);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Sales Operations', 'Opérations de Vente')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            {L('Revenue Flow — Real-Time Archiving', 'Flux de Revenus — Archivage Temps Réel')}
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
            {filterShift ? L('My Shift', 'Mon Poste') : L('All Shifts', 'Tous les Postes')}
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
            <CheckCircle2 className="w-5 h-5" /> {L('Sale recorded successfully!', 'Vente enregistrée avec succès !')}
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
                      <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic">{s.client || 'Client Anonyme'} | PAR: {s.operator || 'ADMIN'}</p>
                      {s.phone && s.phone !== 'none' && (
                         <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <Phone className="w-2 h-2" /> {s.phone}
                         </p>
                      )}
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
                      <p className="text-[10px] font-black text-navy-950 uppercase">{new Date(s.date).toLocaleDateString()} | {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-[8px] font-bold text-blue-gray uppercase tracking-widest opacity-60">{new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <button 
                     onClick={() => printThermalReceipt(s, s.operator, store.formatCurrency)}
                     className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-navy-950 hover:text-white transition-all shadow-sm"
                   >
                      <Printer className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => shareReceipt(s, s.operator, store.formatCurrency)}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                   >
                      <MessageSquare className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => handleEditSale(s)}
                      className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                   >
                      <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => handleDeleteSale(s)}
                      className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                   >
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
             <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">{L('No transactions recorded', 'Aucune transaction enregistrée')}</p>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-navy-50 flex items-center justify-between bg-navy-50/50">
               <h2 className="text-xl font-black text-navy-950 uppercase tracking-tighter">{editingSale ? L('Edit Sale', 'Modifier la Vente') : L('New Sale', 'Nouvelle Vente')}</h2>
               <button onClick={closeAll} className="p-2 hover:bg-navy-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSalePreSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
               {/* Product Selection */}
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">{L('Product', 'Produit')}</label>
                  <select
                    required
                    value={newSale.product_id}
                    onChange={e => setNewSale({...newSale, product_id: e.target.value})}
                    className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">{L('Select a product', 'Sélectionner un produit')}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={newSale.isAccepted}>{p.name.toUpperCase()} ({p.quantity} en stock)</option>
                    ))}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">{L('Quantity', 'Quantité')}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={newSale.isAccepted}
                      value={newSale.quantity}
                      onChange={e => setNewSale({...newSale, quantity: e.target.value})}
                      className={`w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all ${newSale.isAccepted ? 'opacity-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">{L('Payment Method', 'Mode Paiement')}</label>
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

               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">{L('Client', 'Client')}</label>
                     <input
                       type="text"
                       placeholder="Nom..."
                       disabled={newSale.isAccepted}
                       value={newSale.client}
                       onChange={e => setNewSale({...newSale, client: e.target.value})}
                       className={`w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30 ${newSale.isAccepted ? 'opacity-50' : ''}`}
                     />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block">{L('Phone', 'Téléphone')}</label>
                    <input
                      type="text"
                      placeholder="07..."
                      disabled={newSale.isAccepted}
                      value={newSale.phone}
                      onChange={e => setNewSale({...newSale, phone: e.target.value})}
                      className={`w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30 ${newSale.isAccepted ? 'opacity-50' : ''}`}
                    />
                  </div>
               </div>

               {/* Smart Wallet Snapshot */}
               {newSale.client && (
                 <div className="bg-navy-950 rounded-[32px] p-6 text-white space-y-4 shadow-2xl relative overflow-hidden group animate-scale-in">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all"></div>
                   
                   <div className="flex items-center justify-between relative z-10">
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 italic mb-1">MARC Smart Wallet</p>
                       <h4 className="text-lg font-black uppercase tracking-tighter">{newSale.client}</h4>
                     </div>
                     <div className="flex items-center gap-1">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3 h-3 ${i < store.getClientTrustScore(newSale.client, newSale.phone) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                       ))}
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 relative z-10">
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">{L('Net Balance', 'Solde Net')}</p>
                       <p className={`text-xl font-black ${store.getClientGlobalBalance(newSale.client, newSale.phone) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                         {store.formatCurrency(store.getClientGlobalBalance(newSale.client, newSale.phone))}
                       </p>
                     </div>
                     <div className="flex flex-col gap-2">
                       <button 
                         type="button"
                         onClick={() => {
                           const bal = store.getClientGlobalBalance(newSale.client, newSale.phone);
                           if (bal < 0) {
                             setWalletSettleAmount(Math.abs(bal).toString());
                             setShowWalletModal(true);
                           }
                         }}
                         className="flex-1 bg-white text-navy-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                       >
                         <Zap className="w-3 h-3" /> {L('Settle All', 'Tout Solder')}
                       </button>
                       <button 
                         type="button"
                         onClick={() => sendWhatsAppReminder(newSale.client, newSale.phone, store.getClientGlobalBalance(newSale.client, newSale.phone))}
                         className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                       >
                         <MessageSquare className="w-3 h-3" /> {L('Remind', 'Rappeler')}
                       </button>
                     </div>
                   </div>
                 </div>
               )}

               {/* NEW: Client Debt Display and Payment */}
               {newSale.client && clientDebt > 0 && (
                  <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl space-y-4 animate-scale-in">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{L('Active Debt', 'Dette Active')}</p>
                        <p className="text-2xl font-black text-rose-600">{store.formatCurrency(clientDebt)}</p>
                     </div>
                     
                     <div className="relative">
                        <label className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2 block">{L('Pay toward debt', 'Payer vers la dette')}</label>
                        <input
                          type="number"
                          min="0"
                          max={clientDebt}
                          step="0.01"
                          value={newSale.debtPaymentAmount}
                          onChange={e => {
                            const val = Math.min(parseFloat(e.target.value) || 0, clientDebt);
                            setNewSale({...newSale, debtPaymentAmount: val});
                          }}
                          className="w-full bg-white border-2 border-rose-200 rounded-2xl px-5 py-4 text-sm font-black text-rose-600 outline-none focus:border-rose-500 transition-all placeholder:text-rose-300"
                          placeholder="0.00"
                        />
                     </div>

                     {newSale.debtPaymentAmount > 0 && (
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-rose-100">
                           <p className="text-[9px] font-black uppercase text-rose-500">{L('After payment', 'Après paiement')}</p>
                           <p className="text-sm font-black text-emerald-600">{store.formatCurrency(clientDebt - newSale.debtPaymentAmount)}</p>
                        </div>
                     )}
                  </div>
               )}

               {/* Pricing Summary */}
               <div className="bg-navy-950 p-6 rounded-3xl text-white space-y-3">
                  <div className="flex justify-between items-center opacity-60">
                     <p className="text-[10px] font-black uppercase tracking-widest">Total HT</p>
                     <p className="text-sm font-black">{store.formatCurrency(newSale.amount)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{L('Total Due', 'Total à Payer')}</p>
                     <p className="text-2xl font-black">{store.formatCurrency(newSale.amount)}</p>
                  </div>
               </div>

               {newSale.isAccepted && (
                  <div className="space-y-3 animate-scale-in">
                     <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 block italic">{L('Payment (Amount Received)', 'Encaissement (Montant Reçu)')}</label>
                     <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500"><Wallet className="w-4 h-4" /></div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          autoFocus
                          required
                          value={newSale.paid}
                          onChange={e => setNewSale({...newSale, paid: e.target.value})}
                          className="w-full bg-emerald-50/50 border-2 border-emerald-500/20 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30"
                        />
                     </div>
                     {(parseFloat(newSale.amount) - (parseFloat(newSale.paid) || 0)) > 0 && (
                        <div className="flex justify-between items-center px-4 py-2 bg-rose-50 rounded-xl">
                           <p className="text-[8px] font-black uppercase text-rose-500 tracking-widest">{L('Remaining (Debt)', 'Reste à payer (Dette)')}</p>
                           <p className="text-xs font-black text-rose-600">{store.formatCurrency(parseFloat(newSale.amount) - (parseFloat(newSale.paid) || 0))}</p>
                        </div>
                     )}
                  </div>
               )}

                <button
                  type="submit"
                  className={`w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${newSale.isAccepted ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-navy-950 shadow-navy-950/30'}`}
                >
                  <span className="flex items-center gap-3">
                     {newSale.isAccepted ? <Check className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                     <span>{newSale.isAccepted ? L('Record Transaction', 'Enregistrer Transaction') : L('Client Accepted', 'Le Client a Accepté')}</span>
                  </span>
                </button>

               {newSale.isAccepted && (
                  <button 
                    type="button"
                    onClick={() => setNewSale(prev => ({ ...prev, isAccepted: false }))}
                    className="w-full py-2 text-[9px] font-black uppercase text-blue-gray hover:text-rose-500 transition-all"
                  >
                     {L('Modify order', 'Modifier la commande')}
                  </button>
               )}
            </form>
          </div>
        </div>
      )}

      {/* Overpayment Choice Modal */}
      {showOverpayModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-scale-in">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-3xl">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <Banknote className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter mb-1">{L('Overpayment Detected', 'Trop-Perçu Détecté')}</h3>
            <p className="text-xs font-black text-blue-gray uppercase tracking-widest mb-2 opacity-60">{L('Client paid more than amount due', 'Le client a payé plus que le montant dû')}</p>
            <div className="my-4 py-4 px-6 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">{L('Surplus', 'Excédent')}</p>
              <p className="text-3xl font-black text-amber-600">{store.formatCurrency(pendingOverpay)}</p>
            </div>
            <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-6 leading-relaxed opacity-60">
              {L('Classify this surplus as:', 'Classer cet excédent comme :')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setShowOverpayModal(false); registerSale('tip'); }}
                className="flex flex-col items-center gap-2 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-3xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg shadow-amber-500/30 active:scale-95"
              >
                <Star className="w-6 h-6" />
                {L('Tip', 'Pourboire')}
                <span className="text-[8px] opacity-70 normal-case font-bold">{L('Given to operator', 'Offert à l\'opérateur')}</span>
              </button>
              <button
                onClick={() => { setShowOverpayModal(false); registerSale('credit'); }}
                className="flex flex-col items-center gap-2 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                <Wallet className="w-6 h-6" />
                {L('Client Credit', 'Crédit Client')}
                <span className="text-[8px] opacity-70 normal-case font-bold">{L('Reserved for next purchase', 'Réservé au prochain achat')}</span>
              </button>
            </div>
            <button onClick={() => setShowOverpayModal(false)} className="mt-4 text-[9px] font-black uppercase text-blue-gray tracking-widest opacity-40 hover:opacity-70 transition-all">
              {L('Cancel', 'Annuler')}
            </button>
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
               <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter mb-2">{editingSale ? L('Confirm Edit', 'Confirmer Modification') : L('Confirm Sale', 'Confirmer Vente')}</h3>
               <p className="text-xs font-black text-blue-gray uppercase tracking-widest mb-8 leading-relaxed opacity-60">{L(`Finalize this ${store.formatCurrency(newSale.amount)} operation?`, `Voulez-vous finaliser l'enregistrement de cette opération de ${store.formatCurrency(newSale.amount)} ?`)}</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowConfirmPop(false)} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-navy-100 transition-all">{L('Cancel', 'Annuler')}</button>
                  <button onClick={() => { setShowConfirmPop(false); if (editingSale) updateSale(); else registerSale(); }} className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">{L('Confirm', 'Confirmer')}</button>
               </div>
            </div>
         </div>
      )}

      {/* Debt Settlement Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowPayModal(null)}>
           <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-md w-full scale-in" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-2 mb-10">
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">{L('Debt Settlement', 'Règlement de Dette')}</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-40">{L('Clear Financial Obligation', 'Solder l\'Obligation Financière')}</p>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-8 rounded-[40px] text-center mb-10">
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">{L('Remaining', 'Reste à payer')}</p>
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
                    {L('Validate Payment', 'Valider le Règlement')} <CheckCircle2 className="w-6 h-6" />
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Wallet Settlement Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-3xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter mb-1">{L('Quick Settlement', 'Règlement Rapide')}</h3>
            <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-8 italic opacity-60">{L('Clearing Global Wallet Balance', 'Solde du Compte Global')}</p>
            
            <form onSubmit={handleSettleFullWallet} className="space-y-6">
               <div className="bg-navy-50 p-6 rounded-3xl border border-navy-100 mb-6">
                  <p className="text-[9px] font-black text-blue-gray uppercase tracking-widest mb-2">{L('Amount to Pay', 'Montant à Payer')}</p>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    value={walletSettleAmount}
                    onChange={e => setWalletSettleAmount(e.target.value)}
                    className="w-full bg-transparent text-3xl font-black text-navy-950 text-center outline-none"
                    placeholder="0.00"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setShowWalletModal(false)} className="py-4 bg-navy-50 text-navy-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-navy-100 transition-all">{L('Cancel', 'Annuler')}</button>
                  <button type="submit" className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">{L('Validate', 'Valider')}</button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}