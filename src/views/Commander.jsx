import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { printThermalReceipt } from '../utils/Reporter';
import {
  ShoppingCart, Plus, Minus, Trash2, Search, Check,
  User, ChevronRight, X, Zap, Package, AlertTriangle,
  CreditCard, Wallet, Clock, Filter, Layers, ShieldCheck, Printer
} from 'lucide-react';

export default function Commander() {
  const store = useStore();
  const { t, L, lang } = useLanguage();

  const products = store.getProducts().filter(p => p.quantity > 0);
  
  // State
  const [cart, setCart] = useState([]); // [{product, qty, unitPrice}]
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Preparing, 1: Waiting Payment
  const [pendingSales, setPendingSales] = useState([]);

  // Categories
  const categories = useMemo(() => {
    const cats = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'ALL' || p.category === activeCategory;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, search, activeCategory]);

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const paidInput = parseFloat(amountPaid) || 0;
  const change = paidInput - cartTotal;
  const clientDebt = clientName ? store.getClientDebtBalance(clientName, clientPhone || 'none') : 0;
  const clientCredit = clientName ? store.getClientWaitBalance(clientName, clientPhone || 'none') : 0;

  // Cart actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === (product.id || product.product_id));
      if (existing) {
        if (existing.qty >= product.quantity) return prev; // Stock limit
        return prev.map(i => i.product.id === (product.id || product.product_id) ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1, unitPrice: parseFloat(product.price) || 0 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => (i.product.id || i.product.product_id) !== productId));
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if ((i.product.id || i.product.product_id) !== productId) return i;
      const newQty = i.qty + delta;
      if (newQty <= 0) return null;
      if (newQty > i.product.quantity) return i;
      return { ...i, qty: newQty };
    }).filter(Boolean));
  };

  // Stage 1: Client Accepts
  const handleAcceptance = () => {
    if (cart.length === 0) return;
    
    if (!clientName.trim() || !clientPhone.trim()) {
       store.showAlert(L("Client name and phone are mandatory.", "Le nom et le téléphone du client sont obligatoires."), "error");
       return;
    }
    
    setIsProcessing(true);

    const createdSales = [];
    cart.forEach(item => {
      const saleRecord = {
        record_type: 'sale',
        name: item.product.name,
        amount: item.qty * item.unitPrice,
        paid: 0,
        status: 'waiting',
        quantity: item.qty,
        client: clientName || L('Counter', 'Comptoir'),
        phone: clientPhone || 'none',
        date: new Date().toISOString(),
        product_id: item.product.id || item.product.product_id,
        useCredit: true
      };
      
      const res = store.processSmartTransaction(saleRecord);
      if (res) createdSales.push(res);
    });

    setPendingSales(createdSales);
    setCheckoutStep(1);
    setIsProcessing(false);
    store.showAlert(L("Order Accepted - Waiting for Payment", "Commande Acceptée - En attente de paiement"), "warning");
  };

  // Stage 2: Finalize Payment
  const handleFinalCheckout = () => {
    if (pendingSales.length === 0) return;
    setIsProcessing(true);

    const totalToPay = cartTotal;
    const actualPaid = paidInput;

    pendingSales.forEach(sale => {
      const shareOfPaid = totalToPay > 0 ? (actualPaid / totalToPay) * sale.amount : 0;
      const finalPaid = Math.min(shareOfPaid, sale.amount);
      
      store.updateRecord({
        ...sale,
        paid: finalPaid,
        status: finalPaid >= sale.amount ? 'paid' : 'partial',
        paymentMethod: 'Cash' // Default or can be expanded
      });
    });

    const extra = actualPaid - totalToPay;
    if (extra > 0 && clientName) {
      store.settleClientDebt(clientName, clientPhone, extra, 'Cash', store.currentOperator, pendingSales.map(s => s.id));
    }

    setTimeout(() => {
      setCart([]);
      setClientName('');
      setClientPhone('');
      setAmountPaid('');
      setPendingSales([]);
      setCheckoutStep(0);
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  const cancelPending = () => {
    store.showConfirm(L("Cancel this accepted order? Stocks will be restored.", "Annuler cette commande acceptée ? Les stocks seront restaurés."), () => {
       pendingSales.forEach(sale => {
          // 1. Delete the sale record
          store.deleteRecord(sale);
          // 2. Restore stock
          const prod = store.getProducts().find(p => p.id === sale.product_id || p.product_id === sale.product_id);
          if (prod) {
             store.updateRecord({ ...prod, quantity: (prod.quantity || 0) + (sale.quantity || 0) });
          }
       });
       setPendingSales([]);
       setCheckoutStep(0);
       store.showAlert(L("Order cancelled and stocks restored.", "Commande annulée et stocks restaurés."));
    });
  };

  return (
    <div className="max-w-[1800px] mx-auto h-[calc(100vh-6rem)] flex flex-col animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-4 flex items-center justify-between mb-4 no-print">
        <div>
          <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Take Order', 'Prendre Commande')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase mt-1 italic opacity-60">
            {L('Active POS — ', 'Point de Vente Actif — ')} {store.currentOperator}
          </p>
        </div>
        {success && (
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest animate-bounce-gentle shadow-2xl">
               <Check className="w-5 h-5" /> {L('Sale Recorded Successfully!', 'Vente Enregistrée avec Succès!')}
             </div>
             <button 
               onClick={() => {
                  store.showAlert(L("Searching for the last ticket...", "Recherche du dernier ticket..."));
                  // Since Commander clears state, we look for the most recent sale(s)
                  const allSales = store.getSales();
                  if (allSales.length > 0) {
                     const lastSale = allSales[0];
                     printThermalReceipt(lastSale, store.currentOperator, store.formatCurrency);
                  }
               }}
               className="p-4 bg-navy-950 text-white rounded-2xl shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
             >
                <Printer className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">{L('Print Ticket', 'Imprimer Ticket')}</span>
             </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

        {/* Product Catalog — Left Side (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
           
           {/* Filters & Search */}
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                 <input
                   type="text"
                   placeholder={L('Search a product...', 'Rechercher un produit...')}
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full bg-white border border-emerald-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-navy-950 placeholder:text-blue-gray/30 shadow-sm outline-none focus:border-emerald-500 transition-all uppercase"
                 />
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 w-full md:w-auto">
                 {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest flex-shrink-0 transition-all ${
                        activeCategory === cat
                          ? 'bg-navy-950 text-white shadow-lg'
                          : 'bg-white text-navy-950 border border-emerald-100 hover:border-emerald-500 shadow-sm'
                      }`}
                    >
                      {cat === 'ALL' ? L('ALL', 'TOUT') : cat}
                    </button>
                 ))}
              </div>
           </div>

           {/* Products Display */}
           <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                 {filteredProducts.map(product => {
                    const id = product.id || product.product_id;
                    const inCart = cart.find(i => (i.product.id || i.product.product_id) === id);
                    const isLow = product.quantity <= 3;
                    
                    return (
                       <div
                          key={id}
                          onClick={() => checkoutStep === 0 && addToCart(product)}
                          className={`glass-card bg-white p-3.5 rounded-2xl border-emerald-50 border-b-4 border-b-emerald-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative overflow-hidden group shadow-sm ${inCart ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''} ${checkoutStep > 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                          {inCart && (
                             <div className="absolute top-4 right-4 w-7 h-7 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-[10px] shadow-lg animate-scale-in">
                                {inCart.qty}
                             </div>
                          )}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-inner ${inCart ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                             <Package className="w-6 h-6" />
                          </div>
                          <h4 className="text-xs font-black text-navy-950 uppercase tracking-tight mb-1 group-hover:text-emerald-600 transition-colors truncate">{product.name}</h4>
                          <p className="text-[9px] font-black text-blue-gray uppercase tracking-widest opacity-40 mb-4">{product.category || L('General', 'Général')}</p>
                          
                          <div className="flex items-center justify-between mt-auto">
                             <p className="text-sm font-black text-navy-950">{store.formatCurrency(product.price)}</p>
                             <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase ${isLow ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                {isLow ? <AlertTriangle className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                                {product.quantity}
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Checkout Terminal — Right Side (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 pb-10">
           
           {/* Client Panel */}
           <div className="glass-card bg-white p-6 rounded-[40px] border-emerald-50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-950 flex items-center justify-center">
                    <User className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-navy-950 italic">{L('Client Profile', 'Profil Client')}</p>
              </div>

              <div className="space-y-4">
                 <input
                   type="text"
                   placeholder={L('CLIENT NAME...', 'NOM DU CLIENT...')}
                   value={clientName}
                   onChange={e => setClientName(e.target.value)}
                   className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-xs font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30"
                 />
                 <input
                   type="text"
                   placeholder={L('PHONE...', 'TÉLÉPHONE...')}
                   value={clientPhone}
                   onChange={e => setClientPhone(e.target.value)}
                   className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-xs font-black text-navy-950 outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30"
                 />
              </div>

              {clientName && (clientDebt > 0 || clientCredit > 0) && (
                 <div className="mt-6 flex flex-wrap gap-2">
                    {clientDebt > 0 && (
                       <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100">
                          {L('Debt:', 'Dette:')} {store.formatCurrency(clientDebt)}
                       </div>
                    )}
                    {clientCredit > 0 && (
                       <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          {L('Credit:', 'Crédit:')} {store.formatCurrency(clientCredit)}
                       </div>
                    )}
                 </div>
              )}
           </div>

           {/* Cart Terminal */}
           <div className="flex-1 glass-card bg-white p-5 rounded-3xl border-emerald-50 shadow-xl overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                       <ShoppingCart className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-navy-950 italic">{L('Cart', 'Panier')}</p>
                 </div>
                 {cart.length > 0 && (
                    <button onClick={() => setCart([])} className="text-[9px] font-black uppercase text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all">{L('Purge', 'Purger')}</button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                 {cart.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-10">
                       <ShoppingCart className="w-16 h-16 mb-4" />
                       <p className="text-xs font-black uppercase tracking-widest">{L('Cart Empty', 'Panier Vide')}</p>
                    </div>
                 )}
                 {cart.map(item => (
                    <div key={item.product.id || item.product.product_id} className="flex items-center gap-4 group">
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-navy-950 uppercase truncate">{item.product.name}</p>
                          <p className="text-[9px] font-black text-blue-gray uppercase opacity-60">{store.formatCurrency(item.unitPrice)}/u</p>
                       </div>
                        <div className="flex items-center gap-3">
                           {checkoutStep === 0 && (
                              <button onClick={() => updateQty(item.product.id || item.product.product_id, -1)} className="w-8 h-8 rounded-xl bg-navy-50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Minus className="w-3.5 h-3.5" /></button>
                           )}
                           <span className="w-5 text-center text-sm font-black text-navy-950">{item.qty}</span>
                           {checkoutStep === 0 && (
                              <button onClick={() => updateQty(item.product.id || item.product.product_id, 1)} className="w-8 h-8 rounded-xl bg-navy-50 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><Plus className="w-3.5 h-3.5" /></button>
                           )}
                        </div>
                       <p className="text-[11px] font-black text-navy-950 w-20 text-right">{store.formatCurrency(item.qty * item.unitPrice)}</p>
                    </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-navy-50 space-y-4">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray italic">{L('Subtotal', 'Sous-total')}</p>
                    <p className="text-2xl font-black text-navy-950 tracking-tighter">{store.formatCurrency(cartTotal)}</p>
                 </div>

                 <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500"><Wallet className="w-4 h-4" /></div>
                    <input
                      type="number"
                      placeholder={L('AMOUNT RECEIVED...', 'MONTANT REÇU...')}
                      value={amountPaid}
                      onChange={e => setAmountPaid(e.target.value)}
                      className="w-full bg-navy-50 border border-transparent rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30"
                    />
                 </div>

                 {paidInput > 0 && (
                    <div className={`p-4 rounded-2xl flex items-center justify-between border ${change >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                       <p className="text-[9px] font-black uppercase tracking-widest">{change >= 0 ? L('To return', 'À rendre') : L('Missing', 'Manquant')}</p>
                       <p className="text-xl font-black">{store.formatCurrency(Math.abs(change))}</p>
                    </div>
                 )}

                  <div key="checkout-actions-container" className="min-h-[80px]">
                     {checkoutStep === 1 ? (
                        <div key="step-1-actions" className="flex flex-col gap-3 animate-scale-in">
                           <button
                             onClick={handleFinalCheckout}
                             disabled={isProcessing}
                             className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all shadow-2xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 active:scale-[0.98]"
                           >
                             {isProcessing ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                             <span>{isProcessing ? L('Validating...', 'Validation...') : L('Confirm Payment', 'Confirmer Paiement')}</span>
                           </button>
                           <button
                             onClick={cancelPending}
                             className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] text-rose-500 hover:bg-rose-50 transition-all"
                           >
                               {L('Cancel Acceptance', 'Annuler l\'Acceptation')}
                           </button>
                        </div>
                     ) : (
                        <button
                          key="step-0-action"
                          onClick={handleAcceptance}
                          disabled={cart.length === 0 || isProcessing}
                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all shadow-2xl ${
                            cart.length === 0 || isProcessing
                              ? 'bg-navy-100 text-blue-gray cursor-not-allowed opacity-50'
                              : 'bg-navy-950 text-white hover:bg-emerald-600 shadow-navy-950/20 active:scale-[0.98]'
                          }`}
                        >
                          {isProcessing ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          <span>{isProcessing ? L('Validating...', 'Validation...') : L('Order Accepted', 'Commande Acceptée')}</span>
                        </button>
                     )}
                  </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
