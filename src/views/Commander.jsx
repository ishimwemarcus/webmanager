import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingCart, Plus, Minus, Trash2, Search, Check,
  User, ChevronRight, X, Zap, Package, AlertTriangle,
  CreditCard, Wallet, Clock
} from 'lucide-react';

export default function Commander() {
  const store = useStore();
  const { t } = useLanguage();

  const products = store.getProducts().filter(p => p.quantity > 0);
  const allClients = store.getWaitCredits ? store.getWaitCredits() : [];

  // State
  const [cart, setCart] = useState([]); // [{product, qty, unitPrice}]
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const paid = parseFloat(amountPaid) || 0;
  const change = paid - cartTotal;
  const clientDebt = clientName ? store.getClientDebtBalance(clientName, clientPhone || 'none') : 0;
  const clientCredit = clientName ? store.getClientWaitBalance(clientName, clientPhone || 'none') : 0;

  // Cart actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.quantity) return prev; // Stock limit
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1, unitPrice: parseFloat(product.price) || 0 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i;
      const newQty = i.qty + delta;
      if (newQty <= 0) return null;
      if (newQty > i.product.quantity) return i;
      return { ...i, qty: newQty };
    }).filter(Boolean));
  };

  // Process sale
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    // Save one sale record per cart item
    cart.forEach(item => {
      const saleRecord = {
        record_type: 'sale',
        name: item.product.name,
        amount: item.qty * item.unitPrice,
        paid: Math.min(paid > 0 ? (paid / cartTotal) * (item.qty * item.unitPrice) : 0, item.qty * item.unitPrice),
        quantity: item.qty,
        client: clientName || 'Comptoir',
        phone: clientPhone || 'none',
        date: new Date().toISOString(),
      };
      store.addRecord(saleRecord);

      // Decrement stock
      const updatedProduct = { ...item.product, quantity: item.product.quantity - item.qty };
      store.updateRecord(updatedProduct);
    });

    setTimeout(() => {
      setCart([]);
      setClientName('');
      setClientPhone('');
      setAmountPaid('');
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-[1800px] mx-auto h-[calc(100vh-6rem)] flex flex-col fade-in-up">
      {/* Header */}
      <div className="border-b border-navy-100 pb-4 flex items-center justify-between mb-4 no-print">
        <div>
          <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Prendre Commande
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase mt-1 italic">
            Point de Vente Actif — {store.currentOperator}
          </p>
        </div>
        {success && (
          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest scale-in shadow-2xl">
            <Check className="w-5 h-5" /> Vente Enregistrée!
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

        {/* LEFT — Product Catalog */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">
          {/* Search + Categories */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1 bg-white border border-navy-100 rounded-2xl px-4 py-3 shadow-sm">
              <Search className="w-4 h-4 text-blue-gray flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-black text-navy-950 placeholder:text-blue-gray/40 uppercase"
              />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-blue-gray" /></button>}
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex-shrink-0 transition-all ${
                  activeCategory === cat
                    ? 'bg-navy-950 text-white shadow-lg'
                    : 'bg-white text-navy-950 border border-navy-100 hover:border-navy-brand'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product.id === product.id);
                const outOfStock = product.quantity <= 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => !outOfStock && addToCart(product)}
                    disabled={outOfStock}
                    className={`glass-card text-left transition-all hover-elevate active:scale-95 relative overflow-hidden ${
                      inCart ? 'border-navy-brand bg-navy-50 shadow-navy-brand/20 shadow-xl' : 'hover:border-navy-brand'
                    } ${outOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-navy-brand rounded-full flex items-center justify-center text-white text-[10px] font-black z-10">
                        {inCart.qty}
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      inCart ? 'bg-navy-brand text-white' : 'bg-navy-50 text-navy-brand'
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <p className="font-black text-navy-950 uppercase text-xs leading-tight truncate">{product.name}</p>
                    <p className="text-[10px] font-bold text-blue-gray mt-1 uppercase">{product.category || 'Général'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-black text-navy-brand text-sm">{store.formatCurrency(product.price)}</p>
                      <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        product.quantity <= 3
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {product.quantity <= 3 ? `⚠ ${product.quantity}` : `${product.quantity} en stock`}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full p-16 text-center opacity-30">
                  <Package className="w-12 h-12 mx-auto text-blue-gray mb-4" />
                  <p className="font-black uppercase text-blue-gray tracking-widest text-xs">Aucun produit trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Order Summary / Checkout */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Client Info */}
          <div className="glass-card bg-white border border-navy-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-3 flex items-center gap-2 italic">
              <User className="w-3.5 h-3.5" /> Client (Optionnel)
            </p>
            <input
              type="text"
              placeholder="Nom du client..."
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full bg-navy-50 border border-transparent rounded-xl px-4 py-3 text-sm font-black text-navy-950 uppercase outline-none focus:border-navy-brand transition-all mb-2 placeholder:text-blue-gray/40 placeholder:normal-case"
            />
            <input
              type="text"
              placeholder="Téléphone (optionnel)..."
              value={clientPhone}
              onChange={e => setClientPhone(e.target.value)}
              className="w-full bg-navy-50 border border-transparent rounded-xl px-4 py-3 text-sm font-black text-navy-950 outline-none focus:border-navy-brand transition-all placeholder:text-blue-gray/40"
            />
            {clientName && (clientDebt > 0 || clientCredit > 0) && (
              <div className="mt-3 flex gap-2">
                {clientDebt > 0 && <span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase">Dette: {store.formatCurrency(clientDebt)}</span>}
                {clientCredit > 0 && <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase">Crédit: {store.formatCurrency(clientCredit)}</span>}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 glass-card bg-white border border-navy-100 shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest italic flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5" /> Commande en cours
              </p>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-[9px] font-black uppercase text-rose-500 hover:underline">
                  Tout vider
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-8">
                  <ShoppingCart className="w-10 h-10 text-blue-gray mb-2" />
                  <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest">Panier vide</p>
                </div>
              )}
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 bg-navy-50 rounded-2xl p-3 group hover:bg-navy-100 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-navy-950 uppercase text-xs truncate">{item.product.name}</p>
                    <p className="text-[10px] font-bold text-blue-gray">{store.formatCurrency(item.unitPrice)} / unité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-navy-100 hover:border-rose-500 hover:text-rose-500 transition-all">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-navy-950">{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-navy-100 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-navy-100 hover:border-rose-500 hover:bg-rose-500 hover:text-white transition-all ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-black text-navy-brand text-sm w-16 text-right">{store.formatCurrency(item.qty * item.unitPrice)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="border-t border-navy-100 pt-3 mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest">Total Commande</p>
                  <p className="text-xl font-black text-navy-950">{store.formatCurrency(cartTotal)}</p>
                </div>

                {/* Payment input */}
                <div className="flex items-center gap-2 bg-navy-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-navy-brand transition-all">
                  <CreditCard className="w-4 h-4 text-blue-gray flex-shrink-0" />
                  <input
                    type="number"
                    placeholder="Montant reçu..."
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm font-black text-navy-950 placeholder:text-blue-gray/40"
                  />
                </div>

                {paid > 0 && (
                  <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
                    change >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
                  }`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {change >= 0 ? 'Monnaie à rendre' : 'Reste à payer'}
                    </p>
                    <p className={`font-black text-lg ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {store.formatCurrency(Math.abs(change))}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-2xl ${
              cart.length === 0
                ? 'bg-navy-100 text-blue-gray cursor-not-allowed'
                : isProcessing
                ? 'bg-navy-brand text-white animate-pulse'
                : 'bg-navy-950 text-white hover:bg-navy-brand active:scale-95 shadow-navy-950/30'
            }`}
          >
            {isProcessing ? (
              <><Clock className="w-5 h-5 animate-spin" /> Traitement...</>
            ) : (
              <><Zap className="w-5 h-5" /> Valider la Vente — {cart.length > 0 ? store.formatCurrency(cartTotal) : '—'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
