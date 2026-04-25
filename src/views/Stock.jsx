import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  Package,
  Trash2,
  X,
  LayoutGrid,
  Search,
  ArrowRight,
  Pencil,
  ShieldCheck,
  TrendingUp,
  Box,
  CheckSquare,
  Square
} from 'lucide-react';
import { getFormattedQuantity } from '../utils/ProductUtils';

export default function Stock() {
  const store = useStore();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    packageType: '',
    packWeight: '',
    packCount: '',
    quantity: 0,
    cost: 0,
    price: 0
  });

  const [editProduct, setEditProduct] = useState(null);

  React.useEffect(() => {
    if (newProduct.packWeight && newProduct.packCount) {
      const weight = parseFloat(newProduct.packWeight) || 0;
      const count = parseFloat(newProduct.packCount) || 0;
      setNewProduct(prev => ({ ...prev, quantity: weight * count }));
    }
  }, [newProduct.packWeight, newProduct.packCount]);

  React.useEffect(() => {
    if (editProduct && editProduct.packWeight && editProduct.packCount) {
      const weight = parseFloat(editProduct.packWeight) || 0;
      const count = parseFloat(editProduct.packCount) || 0;
      setEditProduct(prev => ({ ...prev, quantity: weight * count }));
    }
  }, [editProduct?.packWeight, editProduct?.packCount]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const products = store.getProducts();
  const categories = store.getCategories();

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const getStatusInfo = (qty) => {
    if (qty <= 0) return { cls: 'bg-danger-pro/5 text-danger-pro border-danger-pro/20', text: t('depleted') };
    if (qty <= 5) return { cls: 'bg-warning-pro/5 text-warning-pro border-warning-pro/20', text: t('low') };
    return { cls: 'bg-success-pro/5 text-success-pro border-success-pro/20', text: t('optimal') };
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    store.showConfirm(`PURGE ${selectedIds.length} ASSETS? This will permanently remove selected items from the registry.`, () => {
      selectedIds.forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) store.deleteRecord(prod);
      });
      setSelectedIds([]);
      store.showAlert(`${selectedIds.length} items purged successfully`, "success");
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    store.addRecord({
      record_type: 'product',
      product_id: 'p' + Date.now().toString(36),
      status: 'active',
      date: new Date().toISOString(),
      quantity: parseFloat(newProduct.quantity) || 0,
      cost: parseFloat(newProduct.cost) || 0,
      price: parseFloat(newProduct.price) || 0,
      name: newProduct.name,
      category: newProduct.category,
      packageType: newProduct.packageType
    });
    setNewProduct({ name: '', category: '', packageType: '', quantity: 0, cost: 0, price: 0 });
    setShowModal(false);
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    store.updateRecord({
      ...editProduct,
      quantity: parseFloat(editProduct.quantity) || 0,
      cost: parseFloat(editProduct.cost) || 0,
      price: parseFloat(editProduct.price) || 0,
    });
    setEditProduct(null);
  };

  const confirmDelete = (product) => {
    store.showConfirm(`DELETE ${product.name.toUpperCase()}? This action is irreversible.`, () => {
      store.deleteRecord(product);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {t('stock')}
          </h1>
          <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase">
            {t('projectTracker')}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center gap-2 hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" /> Delete {selectedIds.length} Items
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn-premium">
            <Plus className="w-5 h-5 mr-3" /> {t('addRecord')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-emerald-500 shadow-2xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Total Valuation</p>
            <p className="text-3xl font-black text-navy-950">{store.formatCurrency(products.reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (parseFloat(p.quantity) || 0)), 0))}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-navy-brand shadow-2xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-navy-50 text-navy-brand flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Active Assets</p>
            <p className="text-3xl font-black text-navy-950">{products.length} <span className="text-xs text-blue-gray opacity-40">SKUs</span></p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-gray" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-navy-100 rounded-[28px] pl-16 pr-8 py-5 text-sm font-black text-navy-950 placeholder:text-blue-gray/50 shadow-xl outline-none focus:border-navy-brand transition-all"
          />
        </div>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)} 
            className="px-8 py-4 bg-navy-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg hover:shadow-navy-brand/30 transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> {t('back')}
          </button>
        )}
      </div>

      {/* ✅ Premium Category Grid (Two Boxes) */}
      {!searchQuery && !selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print animate-scale-in">
          
          {categories.map((cat, idx) => {
            const catCount = products.filter(p => p.category === cat.name).length;
            return (
              <div 
                key={cat.id}
                className="glass-card flex items-center justify-between group cursor-pointer hover:border-emerald-500 transition-all"
                onClick={() => setSelectedCategory(cat.name)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-emerald-500 text-white flex items-center justify-center shadow-2xl">
                    <Box className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter text-navy-950">{cat.name} Sector</h4>
                    <p className="text-xs font-bold text-blue-gray mt-1 uppercase tracking-widest">{catCount} Assets Managed</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-navy-200 group-hover:text-emerald-500 transition-all" />
              </div>
            );
          })}
        </div>
      )}

      {/* Registry Table: Revealed after interaction */}
      {(selectedCategory || searchQuery) && (
        <div className="glass-card rounded-[40px] overflow-hidden border border-navy-100 shadow-2xl fade-in bg-white animate-scale-in">
          <div className="p-8 border-b-2 border-navy-50 bg-gradient-to-r from-navy-50 to-white flex items-center justify-between">
            <h4 className="text-lg font-black text-navy-brand uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-inner flex items-center justify-center">
                <Package className="w-6 h-6 text-navy-brand" />
              </div>
              {selectedCategory ? `${selectedCategory} Sector Manifest` : 'Search Results'}
            </h4>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleSelectAll}
                className="text-[10px] font-black uppercase tracking-widest text-navy-brand flex items-center gap-2 hover:opacity-70 transition-all"
              >
                {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? 'Unselect All' : 'Select All Area'}
              </button>
              <span className="px-4 py-1.5 bg-navy-brand text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {filteredProducts.length} Nodes Active
              </span>
            </div>
          </div>

          {/* ✅ MOBILE: Compact Card List */}
          <div className="block lg:hidden divide-y divide-navy-50">
          {Object.keys(groupedProducts).length > 0 ? (
            Object.keys(groupedProducts).map(category => (
              <React.Fragment key={category}>
                <div className="bg-navy-50/50 p-4 border-y border-navy-100/50">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy-brand flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-navy-brand"></div>
                    {category}
                  </span>
                </div>
                {groupedProducts[category].map((p, pIdx) => {
                  const status = getStatusInfo(p.quantity);
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <div key={p.id || pIdx} className={`p-5 flex items-start gap-4 ${isSelected ? 'bg-navy-50' : ''} hover:bg-navy-50 transition-colors`}>
                      <button onClick={() => toggleSelect(p.id)} className="mt-1 text-navy-brand flex-shrink-0">
                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 opacity-30" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-black text-charcoal uppercase tracking-tighter text-sm truncate cursor-pointer hover:text-navy-brand" onClick={() => setDetailProduct(p)}>{p.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border flex-shrink-0 ${status.cls}`}>{status.text}</span>
                        </div>
                        <p className="text-[10px] text-blue-gray font-black uppercase tracking-widest mb-3 italic opacity-60">
                          {p.category || 'Standard'} · {p.packageType || 'Unit'}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-navy-50/50 rounded-xl p-2.5 border border-navy-50 text-center">
                            <p className="text-[8px] text-blue-gray uppercase font-black mb-0.5">Stock</p>
                            <p className="text-sm font-black text-charcoal">{getFormattedQuantity(p)}</p>
                          </div>
                          <div className="bg-navy-50/50 rounded-xl p-2.5 border border-navy-50 text-center">
                            <p className="text-[8px] text-blue-gray uppercase font-black mb-0.5">Value</p>
                            <p className="text-[10px] font-black text-navy-brand">{store.formatCurrency(p.price)}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => setEditProduct(p)} className="flex-1 bg-white border border-navy-100 rounded-lg flex items-center justify-center text-blue-gray hover:text-navy-brand shadow-sm">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => confirmDelete(p)} className="flex-1 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-500 shadow-sm">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))
          ) : (
            <div className="p-20 text-center text-blue-gray/30 font-black uppercase tracking-widest text-sm italic">Registry is currently void</div>
          )}
        </div>

        {/* ✅ DESKTOP: High-Visibility Manifest Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-50 text-[11px] font-black uppercase tracking-widest text-navy-950 border-b-2 border-navy-100">
                <th className="p-6 w-16"></th>
                <th className="p-6">Asset Identity</th>
                <th className="p-6">Sector / Unit</th>
                <th className="p-6 text-right">Reserve</th>
                <th className="p-6 text-right">Unit Rate</th>
                <th className="p-6 text-right">Total Valuation</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {Object.keys(groupedProducts).length > 0 ? (
                Object.keys(groupedProducts).map(category => (
                  <React.Fragment key={category}>
                    <tr className="bg-navy-50/30">
                      <td colSpan="8" className="p-4 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-navy-brand shadow-sm"></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-brand">{category}</span>
                        </div>
                      </td>
                    </tr>
                    {groupedProducts[category].map((p, pIdx) => {
                      const status = getStatusInfo(p.quantity);
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr key={p.id || pIdx} className={`group hover:bg-navy-50 transition-all ${isSelected ? 'bg-navy-50/50' : ''}`}>
                          <td className="p-6 text-center">
                            <button onClick={() => toggleSelect(p.id)} className="text-navy-brand transition-all">
                              {isSelected ? <CheckSquare className="w-5 h-5 shadow-sm" /> : <Square className="w-5 h-5 opacity-20 hover:opacity-100" />}
                            </button>
                          </td>
                          <td className="p-6 cursor-pointer" onClick={() => setDetailProduct(p)}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-navy-brand text-white' : 'bg-navy-50 text-navy-brand group-hover:bg-navy-brand group-hover:text-white group-hover:rotate-6'}`}>
                                <Box className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-charcoal uppercase tracking-tighter text-sm truncate">{p.name}</p>
                                <p className="text-[8px] text-blue-gray font-black tracking-[0.2em] uppercase opacity-40">Node: {p.product_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-navy-brand">{p.category || 'Standard'}</span>
                              <span className="text-[9px] font-bold text-blue-gray italic uppercase tracking-wider">{p.packageType || 'Unit'}</span>
                            </div>
                          </td>
                          <td className="p-6 text-right font-black text-lg text-charcoal tabular-nums">{getFormattedQuantity(p)}</td>
                          <td className="p-6 text-right text-blue-gray font-black tabular-nums">{store.formatCurrency(p.cost)}</td>
                          <td className="p-6 text-right text-navy-950 font-black tabular-nums">{store.formatCurrency(p.price)}</td>
                          <td className="p-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${status.cls}`}>{status.text}</span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setEditProduct(p)} className="p-2.5 bg-white border border-navy-100 rounded-lg text-blue-gray hover:text-navy-brand hover:border-navy-brand transition-all shadow-sm">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => confirmDelete(p)} className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                <tr><td colSpan="8" className="p-20 text-center text-blue-gray/30 font-black uppercase tracking-[0.5em] italic">No active assets detected in this sector</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* Product Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-card max-w-2xl w-full rounded-[40px] bg-[#064E3B] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative scale-in">
            <div className="p-10 border-b border-white/5 flex justify-between items-center text-white">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{t('addRecord')}</h3>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-all text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">{t('assetIdentity')}</label>
                  <input
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-[#065F46] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#BEF264] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">{t('sector')}</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#065F46] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#BEF264] transition-all appearance-none"
                  >
                    <option value="" className="bg-[#064E3B]">Choose Sector...</option>
                    {categories.map(c => <option key={c.id} value={c.name} className="bg-[#064E3B]">{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">Unité de Mesure</label>
                  <select
                    required
                    value={newProduct.packageType}
                    onChange={e => setNewProduct({ ...newProduct, packageType: e.target.value })}
                    className="w-full bg-[#065F46] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#BEF264] transition-all"
                  >
                    <option value="" className="bg-[#064E3B]">Sélectionner une unité...</option>
                    <option value="Kg" className="bg-[#064E3B]">Kilogramme (Kg)</option>
                    <option value="L" className="bg-[#064E3B]">Litre (L)</option>
                    <option value="Bouteille" className="bg-[#064E3B]">Bouteille</option>
                    <option value="Unité" className="bg-[#064E3B]">Unité</option>
                    <option value="Boîte" className="bg-[#064E3B]">Boîte</option>
                    <option value="Sac" className="bg-[#064E3B]">Sac</option>
                    <option value="Carton" className="bg-[#064E3B]">Carton</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">Stock Total</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newProduct.quantity}
                    onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full bg-[#065F46] border border-[#BEF264]/30 rounded-2xl px-6 py-4 text-[#BEF264] font-black text-xl outline-none focus:border-[#BEF264] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">Coût d'Achat</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.cost}
                    onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })}
                    className="w-full bg-[#065F46] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#BEF264] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">Prix de Vente</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#065F46] border border-white/10 rounded-2xl px-6 py-4 text-[#BEF264] font-black text-2xl outline-none focus:border-[#BEF264] transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#BEF264] text-black font-black py-5 rounded-[28px] shadow-2xl shadow-[#BEF264]/20 flex items-center justify-center gap-3 hover:bg-white transition-all uppercase tracking-widest">
                {t('addRecord')} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-md p-4">
          <div className="glass-card max-w-2xl w-full rounded-[40px] bg-white shadow-2xl border border-white/10 overflow-hidden relative scale-in">
            <div className="p-10 border-b border-navy-50 flex justify-between items-center text-navy-brand">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Modify Asset Registry</h3>
              <button onClick={() => setEditProduct(null)} className="p-3 hover:bg-navy-50 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleEditProduct} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray ml-2">Identifier</label>
                  <input
                    disabled
                    value={editProduct.name}
                    className="w-full bg-navy-50/50 border border-navy-50 rounded-2xl px-6 py-4 text-gray-400 font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray ml-2">Current Reserve</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editProduct.quantity}
                    onChange={e => setEditProduct({ ...editProduct, quantity: e.target.value })}
                    className="w-full bg-navy-50 border border-navy-brand rounded-2xl px-6 py-4 text-navy-brand font-black text-xl outline-none focus:border-navy-brand transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray ml-2">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProduct.cost}
                    onChange={e => setEditProduct({ ...editProduct, cost: e.target.value })}
                    className="w-full bg-navy-50 border border-navy-100 rounded-2xl px-6 py-4 text-charcoal font-bold outline-none focus:border-navy-brand transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray ml-2">Unit Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                    className="w-full bg-navy-50 border border-navy-100 rounded-2xl px-6 py-4 text-charcoal font-black text-2xl text-navy-brand outline-none focus:border-navy-brand transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-navy-brand text-white font-black py-5 rounded-[28px] shadow-2xl flex items-center justify-center gap-3 hover:bg-success-pro transition-all uppercase tracking-widest">
                Confirm Modifications <ShieldCheck className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Product Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/60 backdrop-blur-xl p-4" onClick={() => setDetailProduct(null)}>
          <div className="creative-product-card scale-in shadow-[0_50px_100px_rgba(0,0,0,0.4)]" onClick={e => e.stopPropagation()}>
            <div className="banner-area relative">
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
                  {detailProduct.category || 'Standard'}
                </span>
              </div>
              <button onClick={() => setDetailProduct(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center mb-4 border border-white/20 shadow-2xl group-hover:rotate-12 transition-transform">
                 <Package className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{detailProduct.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Asset Intelligence Node</p>
            </div>

            <div className="reveal-content">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray/40">Current Reserve</p>
                <p className="text-4xl font-black text-charcoal">{getFormattedQuantity(detailProduct)}</p>
                <div className="flex justify-center">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border mt-2 ${getStatusInfo(detailProduct.quantity).cls}`}>
                     {getStatusInfo(detailProduct.quantity).text}
                   </span>
                </div>
              </div>

              <div className="stats-grid grid grid-cols-2 gap-4">
                 <div className="bg-navy-50/50 p-4 rounded-3xl border border-navy-50">
                    <p className="text-[8px] font-black uppercase text-blue-gray mb-1">Unit Cost</p>
                    <p className="text-sm font-black text-charcoal">{store.formatCurrency(detailProduct.cost)}</p>
                 </div>
                 <div className="bg-navy-50/50 p-4 rounded-3xl border border-navy-50">
                    <p className="text-[8px] font-black uppercase text-blue-gray mb-1">Market Price</p>
                    <p className="text-sm font-black text-navy-brand">{store.formatCurrency(detailProduct.price)}</p>
                 </div>
                 <div className="col-span-2 bg-navy-brand/5 p-4 rounded-3xl border border-navy-brand/10">
                    <p className="text-[8px] font-black uppercase text-navy-brand mb-1">Total Asset Value</p>
                    <p className="text-lg font-black text-navy-brand">{store.formatCurrency(detailProduct.quantity * detailProduct.cost)}</p>
                 </div>
              </div>

              <div className="action-icons pt-4 flex gap-3">
                 <button onClick={() => { setEditProduct(detailProduct); setDetailProduct(null); }} className="p-4 bg-navy-brand text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                    <Pencil className="w-5 h-5" />
                 </button>
                 <button onClick={() => { confirmDelete(detailProduct); setDetailProduct(null); }} className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-md">
                    <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
