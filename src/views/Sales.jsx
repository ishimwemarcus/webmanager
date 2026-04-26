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
  Calculator
} from 'lucide-react';
import { getFormattedQuantity } from '../utils/ProductUtils';

export default function Sales() {
  const store = useStore();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
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
  const availableCredit = store.getClientWaitBalance && newSale.client ? store.getClientWaitBalance(newSale.client) : 0;
  const clientDebt = store.getClientDebtBalance && newSale.client ? store.getClientDebtBalance(newSale.client) : 0;

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
        if (s.operator !== store.currentOperator.name) return false;
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
      const p = products.find(pr => pr.product_id === newSale.product_id);
      if (p) {
        const total = p.price * (newSale.quantity || 1);
        setNewSale(prev => ({ ...prev, amount: total, paid: total }));
      }
    }
  }, [newSale.product_id, newSale.quantity]);

  const handleSalePreSubmit = (e) => {
    if (e) e.preventDefault();
    const product = products.find(p => p.product_id === newSale.product_id);
    if (!product) return;
    if (product.quantity < newSale.quantity) {
      store.showAlert('Insufficient units in stock.');
      return;
    }
    if (!newSale.client.trim()) return;

    if (parseFloat(newSale.paid) > parseFloat(newSale.amount)) {
      setNewSale(prev => ({ ...prev, overpayType: null }));
    }
    setShowConfirmPop(true);
  };

  const registerSale = () => {
    const product = products.find(p => p.product_id === newSale.product_id);
    const amount = parseFloat(newSale.amount);
    const paid = parseFloat(newSale.paid);
    const totalPayment = paid + (newSale.useCredit ? availableCredit : 0);

    const finalSale = {
      name: product.name,
      status: totalPayment < amount ? 'partial' : 'paid',
      date: new Date().toISOString(),
      product_id: newSale.product_id,
      client: newSale.client,
      quantity: parseFloat(newSale.quantity),
      amount,
      paid: totalPayment,
      phone: newSale.phone,
      paymentMethod: newSale.paymentMethod,
      tip: 0,
      useCredit: newSale.useCredit
    };

    store.processSmartTransaction(finalSale);



    setLastSaleRecord(finalSale);
    setShowSuccess(true);
    closeAll();
  };

  const closeAll = () => {
    setShowModal(false);
    setShowConfirmPop(false);
    setNewSale({ product_id: '', client: '', phone: '', quantity: 1, amount: 0, paid: 0, paymentMethod: 'Cash', useCredit: true, overpayType: null });
  };

  const handlePopConfirm = (isCorrect) => {
    if (!isCorrect) { closeAll(); return; }
    const amount = parseFloat(newSale.amount);
    const paid = parseFloat(newSale.paid);
    const total = paid + (newSale.useCredit ? availableCredit : 0);
    if (total > amount && !newSale.overpayType) return;
    registerSale();
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {t('sales')}
          </h1>
          <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase">
            {t('liquidityDelta')}
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-navy-brand text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-navy-900 transition-all uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5" /> New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-emerald-500 shadow-2xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Today's Revenue</p>
            <p className="text-3xl font-black text-navy-950">{store.formatCurrency(sales.filter(s => s.date && s.date.startsWith(new Date().toISOString().split('T')[0])).reduce((acc, s) => acc + (parseFloat(s.paid) || 0), 0))}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-navy-brand shadow-2xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-navy-50 text-navy-brand flex items-center justify-center">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Total Transactions</p>
            <p className="text-3xl font-black text-navy-950">{sales.length} <span className="text-xs text-blue-gray opacity-40">Records</span></p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-gray" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            type="text"
            placeholder={t('search')}
            className="w-full bg-white border border-navy-100 rounded-[24px] pl-16 pr-6 py-5 text-navy-950 font-bold focus:border-navy-brand outline-none transition-all shadow-xl"
          />
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-navy-100 shadow-xl">
          <button
            onClick={() => setFilterShift(!filterShift)}
            className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterShift ? 'bg-navy-brand text-white shadow-lg' : 'text-blue-gray hover:text-navy-brand'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            {filterShift ? 'Current Shift' : 'All Shifts'}
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1"></div>

          <div className="flex items-center gap-1">
            {['today', 'month', 'custom'].map(time => (
              <button
                key={time}
                onClick={() => setFilterDate(time)}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${filterDate === time ? 'bg-[#F59E0B] text-black shadow-md' : 'text-blue-gray hover:text-navy-brand'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ MOBILE: Card List (no horizontal scroll) */}
      <div className="block lg:hidden space-y-3">
        {filteredSales.length > 0 ? (
          filteredSales.map((s, idx) => (
            <div key={s.id || idx} className="bg-white rounded-2xl border border-navy-50 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-black text-navy-900 uppercase tracking-tight">{s.name}</p>
                  <p className="text-xs text-navy-brand font-bold mt-0.5">{s.client}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-black uppercase border
                  ${s.status?.includes('paid') ? 'bg-success-pro/5 text-success-pro border-success-pro/20' : 'bg-danger-pro/5 text-danger-pro border-danger-pro/20'}`}>
                  {s.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-navy-50 rounded-xl p-2 text-center">
                  <p className="text-xs md:text-sm text-blue-gray uppercase font-black">Volume</p>
                  <p className="text-xs font-black text-navy-900">{getFormattedQuantity(products.find(p => p.product_id === s.product_id))}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-2 text-center">
                  <p className="text-xs md:text-sm text-blue-gray uppercase font-black">Total</p>
                  <p className="text-xs font-black text-navy-900">{store.formatCurrency(s.amount)}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-2 text-center">
                  <p className="text-xs md:text-sm text-blue-gray uppercase font-black">Method</p>
                  <p className="text-xs font-black text-blue-gray">{s.paymentMethod || 'Cash'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-gray font-bold">{store.formatDate(s.date)}</p>
                <div className="flex gap-2">
                  <button onClick={() => printThermalReceipt(s, store.currentOperator, store.formatCurrency)}
                    className="p-2 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20">
                    <Printer className="w-3.5 h-3.5 text-[#2563eb]" />
                  </button>
                  <button onClick={() => shareReceipt(s, store.currentOperator, store.formatCurrency)}
                    className="p-2 rounded-lg bg-success-pro/10 border border-success-pro/20">
                    <ShoppingCart className="w-3.5 h-3.5 text-success-pro" />
                  </button>
                  <button onClick={() => store.deleteRecord(s)}
                    className="p-2 rounded-lg bg-danger-pro/5 border border-danger-pro/10">
                    <Trash2 className="w-3.5 h-3.5 text-danger-pro" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-navy-50 p-6 md:p-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-navy-200" />
            <p className="text-sm font-black uppercase tracking-widest text-blue-gray">No transactions found</p>
          </div>
        )}
      </div>

      {/* ✅ DESKTOP: Full Table */}
      <div className="hidden lg:block glass-card rounded-[32px] overflow-hidden border border-navy-50 shadow-2xl bg-white animate-scale-in">
        <div className="overflow-x-auto">
          <table className="premium-table w-full">
            <thead>
              <tr className="text-left bg-navy-50/50 border-b border-navy-100">
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand">{t('exchangeDate')}</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand">{t('assetDetail')}</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand">{t('entityInfo')}</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand text-right">{t('transactionVal')}</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand text-right">{t('settledAmount')}</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand text-center">Type</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand text-center">{t('status')}</th>
                <th className="px-6 py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-navy-brand text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filteredSales.length > 0 ? (
                filteredSales.map((s, idx) => (
                  <tr key={s.id || idx} className="group hover:bg-navy-50 transition-colors">
                    <td className="p-6 text-xs text-blue-gray font-bold">{s.date ? new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                    <td className="p-6">
                      <p className="text-xs font-black uppercase text-navy-brand">{s.client}</p>
                      <p className="text-xs font-bold text-blue-gray opacity-50">{s.phone || 'Pas de Contact'}</p>
                    </td>
                    <td className="p-6 text-xs font-bold text-navy-950/70">{s.name}</td>
                    <td className="px-6 py-5 text-right text-xs font-bold text-navy-950">{store.formatCurrency(s.amount)}</td>
                    <td className="px-6 py-5 text-right text-xs text-emerald-600 font-black">{store.formatCurrency(s.paid)}</td>
                    <td className="px-6 py-5 text-center text-xs md:text-sm font-black uppercase text-blue-gray tracking-widest">{s.paymentMethod || 'Cash'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => { if (s.status === 'partial') window.location.hash = '#/ledger'; }}
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase border transition-all
                          ${s.status.includes('paid') ? 'bg-success-pro/5 text-success-pro border-success-pro/20' : 'bg-danger-pro/5 text-danger-pro border-danger-pro/20 hover:scale-110 active:scale-95 cursor-pointer'}`}>
                        {s.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center space-x-1">
                      <button onClick={() => printThermalReceipt(s, store.currentOperator, store.formatCurrency)}
                        className="p-2.5 rounded-xl text-pure-black bg-[#2563eb]/10 hover:bg-[#2563eb]/20 transition-all no-print inline-flex items-center gap-2 shadow-sm border border-[#2563eb]/10">
                        <Printer className="w-3.5 h-3.5 text-[#2563eb]" />
                      </button>
                      <button onClick={() => shareReceipt(s, store.currentOperator, store.formatCurrency)}
                        className="p-2.5 rounded-xl text-pure-black bg-success-pro/10 hover:bg-success-pro/20 transition-all no-print inline-flex items-center gap-2 shadow-sm border border-success-pro/10">
                        <ShoppingCart className="w-3.5 h-3.5 text-success-pro" />
                      </button>
                      <button onClick={() => { 
                        window.speechSynthesis.cancel();
                        const msg = new SpeechSynthesisUtterance(`${s.client} a acheté ${s.name} pour ${s.amount} ${store.currency === '€' ? 'Euros' : store.currency}.`); 
                        msg.lang = 'fr-FR'; 
                        msg.pitch = 1.0;
                        msg.rate = 1.0;
                        window.speechSynthesis.speak(msg); 
                      }}
                        className="p-3 rounded-2xl text-blue-gray hover:text-navy-brand hover:bg-navy-50 transition-all no-print">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => store.deleteRecord(s)} className="p-3 rounded-2xl text-blue-gray hover:text-danger-pro hover:bg-danger-pro/5 transition-all no-print">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-32 text-center text-blue-gray">
                    <ShoppingCart className="w-20 h-20 mx-auto mb-6 opacity-10" />
                    <p className="text-sm font-black uppercase tracking-widest">No transactions found</p>
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
              <h3 className="text-3xl font-black uppercase tracking-tighter">{t('transactionPortal')}</h3>
              <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/60 mt-1">{t('commandGateway')}</p>
              <button onClick={closeAll} className="absolute top-10 right-10 p-3 rounded-full hover:bg-white/10 text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSalePreSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-3 block ml-1">{t('assetIdentity')}</label>
                  <select
                    value={newSale.product_id}
                    onChange={e => setNewSale({ ...newSale, product_id: e.target.value })}
                    required
                    className="w-full bg-navy-50 border border-navy-100 rounded-3xl px-6 py-5 text-charcoal font-bold focus:border-navy-brand outline-none transition-all appearance-none"
                  >
                    <option value="">Sélectionner un Article</option>
                    {products.map(p => (
                      <option key={p.id} value={p.product_id} disabled={p.quantity === 0}>
                        {p.name} — ({p.quantity} Units) — {store.formatCurrency(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-3 block ml-1">{t('entityInfo')}</label>
                  <input
                    value={newSale.client}
                    onChange={e => setNewSale({ ...newSale, client: e.target.value })}
                    type="text"
                    required
                    placeholder="ENTREZ VOTRE NOM..."
                    className="w-full bg-navy-50 border-2 border-transparent rounded-[24px] px-6 py-5 text-navy-950 font-black focus:bg-white focus:border-navy-brand focus:ring-8 focus:ring-navy-brand/5 outline-none transition-all text-lg md:text-xl uppercase placeholder:text-navy-100"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-3 block ml-1">Numéro de Téléphone</label>
                  <input
                    value={newSale.phone}
                    onChange={e => setNewSale({ ...newSale, phone: e.target.value })}
                    type="tel"
                    className="w-full bg-navy-50 border border-navy-100 rounded-3xl px-6 py-5 text-charcoal font-bold focus:border-navy-brand outline-none transition-all"
                    placeholder="+250 ..."
                  />
                </div>

                <div>
                  {clientDebt > 0 && newSale.client.length > 1 && (
                    <div className="mt-3 bg-danger-pro/10 border-l-4 border-danger-pro p-4 rounded-r-2xl flex items-center gap-3 animate-fade-in shadow-sm">
                      <AlertCircle className="w-5 h-5 text-danger-pro flex-shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm uppercase font-black tracking-widest text-danger-pro">{t('riskStatus')}</p>
                        <p className="text-sm font-black text-danger-pro">
                          Cette entité doit à l'entreprise <span className="text-xl px-1">{store.formatCurrency(clientDebt)}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-navy-50 px-2 py-4 md:py-5 rounded-2xl md:rounded-3xl border border-navy-100 text-center">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-wider md:tracking-widest text-blue-gray mb-1 md:mb-2 block">Quantity</label>
                    <input
                      value={newSale.quantity}
                      onChange={e => setNewSale({ ...newSale, quantity: parseFloat(e.target.value) || '' })}
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      className="w-full bg-transparent text-xl md:text-2xl font-black text-charcoal focus:outline-none text-center"
                    />
                  </div>
                  <div className="bg-navy-50 px-2 py-4 md:py-5 rounded-2xl md:rounded-3xl border border-navy-100 text-center">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-wider md:tracking-widest text-blue-gray mb-1 md:mb-2 block">Settlement</label>
                    <input
                      value={newSale.paid}
                      onChange={e => setNewSale({ ...newSale, paid: parseFloat(e.target.value) })}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="w-full bg-transparent text-xl md:text-2xl font-black text-success-pro focus:outline-none text-center"
                    />
                  </div>
                  <div className="bg-navy-50 px-2 py-4 md:py-5 rounded-2xl md:rounded-3xl border border-navy-100 text-center flex flex-col justify-center">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-wider md:tracking-widest text-blue-gray mb-1 md:mb-2 block">{t('protocol')}</label>
                    <select
                      value={newSale.paymentMethod}
                      onChange={e => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                      className="w-full bg-transparent text-xs md:text-sm font-black text-charcoal focus:outline-none text-center uppercase appearance-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                      <option value="Card">Card</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Mobile Money">Mobile Mo.</option>
                    </select>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-navy-50 border border-navy-100 space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray">{t('identityIdentity')}</label>
                    <span className="text-xs font-bold text-navy-brand opacity-50">Session v2.4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray">Total Valuation</p>
                      <p className="text-3xl font-black text-navy-brand">{store.formatCurrency(newSale.amount)}</p>
                    </div>
                    {availableCredit > 0 && newSale.useCredit && (
                      <div className="text-right">
                        <p className="text-xs md:text-sm font-black uppercase tracking-widest text-success-pro">Credit Applied</p>
                        <p className="text-xl font-bold text-success-pro">-{store.formatCurrency(Math.min(availableCredit, newSale.amount))}</p>
                      </div>
                    )}
                  </div>
                </div>

                {availableCredit > 0 && (
                  <div className="flex items-center justify-between p-5 rounded-3xl bg-white border border-navy-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6 text-navy-brand" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-charcoal">Use Credit</p>
                        <p className="text-xs md:text-sm text-blue-gray font-bold">Balance: {store.formatCurrency(availableCredit)}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={newSale.useCredit} onChange={e => setNewSale({ ...newSale, useCredit: e.target.checked })} />
                      <div className="w-12 h-6 bg-navy-200 rounded-full peer peer-checked:bg-navy-brand after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                )}
              </div>

              <button type="submit" className="btn-premium w-full !py-6 !text-sm">
                Confirm Sale <ArrowRight className="w-5 h-5 ml-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {showConfirmPop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card rounded-[48px] p-6 md:p-12 max-w-md w-full text-center space-y-8 bg-white shadow-2xl border border-navy-50 scale-in">
            <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto border border-navy-100">
              <AlertCircle className="w-10 h-10 text-navy-brand" />
            </div>

            <div className="space-y-4">
              <h4 className="text-2xl font-black uppercase tracking-tighter text-navy-brand">{t('confirmAction')}</h4>

              {parseFloat(newSale.paid) + (newSale.useCredit ? availableCredit : 0) > newSale.amount ? (
                <div className="bg-navy-50 p-6 rounded-[32px] border border-navy-100 text-left space-y-6">
                  <div>
                    <p className="text-xs md:text-sm text-success-pro font-black uppercase tracking-widest mb-1">Store Credit Auto-Applied</p>
                    <p className="text-2xl font-black text-success-pro">
                      {store.formatCurrency((parseFloat(newSale.paid) || 0) + (newSale.useCredit ? availableCredit : 0) - newSale.amount)}
                    </p>
                    <p className="text-xs text-blue-gray font-bold mt-2">Ce montant sera utilisable lors de son prochain achat.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewSale(prev => ({ ...prev, overpayType: 'wait' }))}
                      className={`p-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2
                        ${newSale.overpayType === 'wait' ? 'border-navy-brand bg-white text-navy-brand shadow-lg scale-105' : 'border-navy-100 bg-white text-blue-gray'}`}
                    >
                      <Clock className="w-6 h-6" />
                      <span className="text-xs font-black uppercase">To Balance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSale(prev => ({ ...prev, overpayType: 'tip' }))}
                      className={`p-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2
                        ${newSale.overpayType === 'tip' ? 'border-navy-brand bg-white text-navy-brand shadow-lg scale-105' : 'border-navy-100 bg-white text-blue-gray'}`}
                    >
                      <Gift className="w-6 h-6" />
                      <span className="text-xs font-black uppercase">To Tip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-blue-gray font-bold uppercase tracking-widest leading-relaxed">
                  Protocole de sécurité actif. Les données de session seront cryptées et synchronisées avec le grand livre mondial.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={() => handlePopConfirm(false)} className="py-4 rounded-2xl bg-navy-50 text-blue-gray font-black uppercase tracking-widest border border-navy-100 hover:bg-navy-100 transition-all">Cancel</button>
              <button
                onClick={() => handlePopConfirm(true)}
                className="py-4 rounded-2xl bg-navy-brand text-white font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 backdrop-blur-xl p-4 animate-fade-in">
          <div className="glass-card max-w-sm w-full rounded-[48px] bg-white p-10 text-center shadow-2xl scale-in border border-white/20">
            <div className="w-20 h-20 bg-success-pro/10 rounded-full flex items-center justify-center mx-auto text-success-pro mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-navy-brand uppercase tracking-tighter mb-2">Vente Réussie</h3>
            <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-6">La transaction a été cryptée et archivée</p>
            
            <div className="bg-navy-50 p-6 rounded-[32px] border border-navy-100 mb-8 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray">Suivi Client (QR Link)</p>
              <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto shadow-md">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}#/portal/${encodeURIComponent(lastSaleRecord?.client)}/${encodeURIComponent(lastSaleRecord?.phone || 'none')}`)}`}
                  alt="Client Portal"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] text-blue-gray leading-tight italic font-bold">Le client peut scanner ce code pour suivre ses transactions et son crédit en temps réel.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  printThermalReceipt(lastSaleRecord, store.currentOperator, store.formatCurrency);
                  setShowSuccess(false);
                }}
                className="w-full bg-[#2563eb] text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-lg hover:bg-black transition-all uppercase text-xs tracking-widest"
              >
                <Printer className="w-5 h-5" /> Imprimer le Ticket
              </button>
              <button
                onClick={() => {
                  shareReceipt(lastSaleRecord, store.currentOperator, store.formatCurrency);
                  setShowSuccess(false);
                }}
                className="w-full bg-success-pro text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-lg hover:bg-black transition-all uppercase text-xs tracking-widest"
              >
                <ShoppingCart className="w-5 h-5" /> Partager (WhatsApp)
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-navy-50 text-blue-gray font-black py-4 rounded-3xl uppercase text-xs md:text-sm tracking-widest hover:bg-navy-100 transition-all"
              >
                Continuer sans Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
