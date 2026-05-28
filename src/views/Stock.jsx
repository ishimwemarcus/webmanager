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
  Square,
  AlertTriangle,
  Layers,
  Database,
  Filter,
  Wallet
} from 'lucide-react';
import { getFormattedQuantity, getBundleInfo, hasBundleSupport } from '../utils/ProductUtils';
import Pagination from '../components/common/Pagination';

export default function Stock() {
  const store = useStore();
  const { t, L } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    packageType: '',
    packWeight: '',
    packCount: '',
    quantity: 0,
    cost: 0,
    price: 0,
    // Bundle decomposition (optional)
    baseUnit: '',
    bundleName: '',
    bundleSize: '',
    bundlePrice: '',
  });

  const [editProduct, setEditProduct] = useState(null);
  const [showLossModal, setShowLossModal] = useState(null);
  const [lossData, setLossData] = useState({ quantity: 1, reason: '' });

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

  const products = store.getProducts();
  const categories = store.getCategories();

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages === 0 ? 1 : totalPages));
  const paginatedProducts = filteredProducts.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const totalValuation = products.reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (parseFloat(p.quantity) || 0)), 0);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    store.showConfirm(L(`PURGE ${selectedIds.length} ASSETS? This will permanently delete them from the registry.`, `PURGER ${selectedIds.length} ACTIFS? Cette action supprimera définitivement les éléments du registre.`), () => {
      selectedIds.forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) store.deleteRecord(prod);
      });
      setSelectedIds([]);
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    store.addRecord({
      record_type: 'product',
      name: newProduct.name,
      category: newProduct.category,
      packageType: newProduct.packageType,
      quantity: parseFloat(newProduct.quantity) || 0,
      cost: parseFloat(newProduct.cost) || 0,
      price: parseFloat(newProduct.price) || 0,
      // Bundle fields (only save if all are filled)
      baseUnit: newProduct.baseUnit || '',
      bundleName: newProduct.bundleName || '',
      bundleSize: newProduct.bundleName && newProduct.bundleSize ? parseFloat(newProduct.bundleSize) : '',
      bundlePrice: newProduct.bundlePrice ? parseFloat(newProduct.bundlePrice) : '',
      status: 'active',
      date: new Date().toISOString()
    });
    setNewProduct({ name: '', category: '', packageType: 'U', quantity: 0, cost: 0, price: 0, baseUnit: '', bundleName: '', bundleSize: '', bundlePrice: '' });
    setShowModal(false);
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    store.updateRecord({
      ...editProduct,
      packageType: editProduct.packageType || 'U',
      quantity: parseFloat(editProduct.quantity) || 0,
      cost: parseFloat(editProduct.cost) || 0,
      price: parseFloat(editProduct.price) || 0,
      baseUnit: editProduct.baseUnit || '',
      bundleName: editProduct.bundleName || '',
      bundleSize: editProduct.bundleName && editProduct.bundleSize ? parseFloat(editProduct.bundleSize) : '',
      bundlePrice: editProduct.bundlePrice ? parseFloat(editProduct.bundlePrice) : '',
    });
    setEditProduct(null);
  };

  const confirmDelete = (product) => {
    store.showConfirm(L(`DELETE ${product.name.toUpperCase()}?`, `SUPPRIMER ${product.name.toUpperCase()}?`), () => {
      store.deleteRecord(product);
    });
  };

  const handleReportLoss = (e) => {
    e.preventDefault();
    if (!showLossModal) return;
    
    store.addRecord({
      record_type: 'loss',
      product_id: showLossModal.id || showLossModal.product_id,
      name: showLossModal.name,
      quantity: parseFloat(lossData.quantity) || 0,
      reason: lossData.reason,
      date: new Date().toISOString(),
      valuation: (parseFloat(lossData.quantity) || 0) * (parseFloat(showLossModal.cost) || 0)
    });
    
    store.showAlert(L(`Loss of ${lossData.quantity} recorded for ${showLossModal.name}`, `Perte de ${lossData.quantity} enregistrée pour ${showLossModal.name}`));
    setShowLossModal(null);
    setLossData({ quantity: 1, reason: '' });
  };

  return (
    <div className="page-shell page-shell--fit animate-fade-in">
      
      {/* Premium Header */}
      <header className="page-header border-b border-navy-100 pb-1.5 flex flex-col md:flex-row md:items-end justify-between gap-2 no-print shrink-0">
        <div className="space-y-1">
          <h1 className="text-display leading-none">
            {L('Stock Inventory', 'Inventaire Stock')}
          </h1>
          <p className="text-[10px] font-medium text-blue-gray tracking-[0.14em] uppercase opacity-60">
            {L('Asset Management — Centralized Registry', 'Gestion des Actifs — Registre Centralisé')}
          </p>

        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 md:gap-4">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-wide shadow-xl shadow-rose-500/20 flex items-center gap-1.5 hover:bg-rose-600 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> {L(`Delete ${selectedIds.length} Items`, `Supprimer ${selectedIds.length} Articles`)}
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-navy-950 text-white rounded-xl font-black uppercase tracking-wide text-[9px] md:text-[10px] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" /> {L('Add Asset', 'Ajouter un Actif')}
          </button>

        </div>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 no-print">
        <div className="glass-card bg-white p-3 rounded-2xl border-emerald-100 flex items-center gap-3 group hover:scale-[1.01] transition-all shadow-sm min-h-[74px]">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.12em] text-blue-gray mb-0 italic">{L('Total Valuation', 'Évaluation Totale')}</p>
            <p className="text-base md:text-lg font-black text-navy-950 tracking-tight leading-none">
              {store.formatCurrency(totalValuation)}
            </p>
          </div>
        </div>

        <div className="glass-card bg-white p-3 rounded-2xl border-emerald-100 flex items-center gap-3 group hover:scale-[1.01] transition-all shadow-sm min-h-[74px]">
          <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy-950 flex items-center justify-center shadow-inner">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.12em] text-blue-gray mb-0 italic">{L('Operational Assets', 'Actifs Opérationnels')}</p>
            <p className="text-base md:text-lg font-black text-navy-950 tracking-tight leading-none">
              {products.length} <span className="text-[9px] text-blue-gray opacity-40 font-black">{L('Lines', 'Lignes')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search & Back Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 no-print">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          <input
            type="text"
            placeholder={L('Search inventory...', 'Rechercher dans l\'inventaire...')}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-emerald-100 rounded-xl pl-10 pr-3 py-2.5 text-[10px] md:text-xs font-black text-navy-950 placeholder:text-blue-gray/30 shadow-xl outline-none focus:border-emerald-500 transition-all uppercase"
          />
        </div>
        {selectedCategory && (
          <button 
            onClick={() => { setSelectedCategory(null); setCurrentPage(1); }} 
            className="w-full md:w-auto px-4 py-2.5 bg-navy-950 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 shadow-lg hover:bg-emerald-600 transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180 text-emerald-400" /> {L('Back to Sectors', 'Retour aux Secteurs')}
          </button>
        )}
      </div>

      {/* Categories Grid */}
      {!searchQuery && !selectedCategory && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 no-print animate-scale-in">
          {categories.map((cat) => {
            const catProducts = products.filter(p => p.category === cat.name);
            const catCount = catProducts.length;
            const catValue = catProducts.reduce((s, p) => s + (p.price * p.quantity), 0);
            const lowStockCount = catProducts.filter(p => p.quantity <= 5).length;
            
            return (
              <div 
                key={cat.id}
                className={`glass-card bg-white p-3 rounded-2xl border-2 flex flex-col items-center text-center group cursor-pointer transition-all shadow-sm relative overflow-hidden min-h-[138px] ${lowStockCount > 0 ? 'border-rose-100 hover:border-rose-500' : 'border-emerald-50 hover:border-emerald-500'}`}
                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
              >
                {lowStockCount > 0 && (
                   <div className="absolute top-3 left-3 px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-wide animate-pulse z-10">
                      {lowStockCount} {L('Critical', 'Critique')}
                   </div>
                )}
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <Box className="w-24 h-24" />
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 shadow-inner ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                   <Box className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-navy-950 tracking-tight leading-tight">{L('Sector', 'Secteur')} {cat.name}</h4>
                <p className="text-[9px] font-medium text-blue-gray mt-0.5 uppercase tracking-wide opacity-60">{catCount} {L('Items', 'Articles')}</p>

                <div className="mt-2 pt-1.5 border-t border-navy-50 w-full flex justify-between items-center text-[9px] font-black uppercase tracking-wide text-navy-950">
                   <span>{L('Estimated Value', 'Valeur Estimée')}</span>
                   <span className={lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>{store.formatCurrency(catValue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registry Manifest (Table View) */}
      {(selectedCategory || searchQuery) && (
        <div className="space-y-4 animate-fade-in">
           <div className="flex items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-black text-navy-950 uppercase tracking-widest">
                 {selectedCategory ? `${L('Sector Manifest', 'Manifeste Secteur')} : ${selectedCategory}` : L('Search Results', 'Résultats de Recherche')}
              </h3>
           </div>

           <div className="space-y-3">
              {paginatedProducts.map((p) => (
                 <div key={p.id} className={`glass-card bg-white p-2.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center gap-2.5 hover:border-emerald-400 group ${selectedIds.includes(p.id) ? 'border-emerald-500 bg-emerald-50/10' : 'border-emerald-50'}`}>
                    <div className="flex items-center gap-2.5 md:min-w-[240px]">
                       <button onClick={() => toggleSelect(p.id)} className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${selectedIds.includes(p.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-emerald-100 hover:border-emerald-500'}`}>
                          {selectedIds.includes(p.id) && <CheckSquare className="w-3 h-3" />}
                       </button>
                       <div className="w-9 h-9 bg-navy-50 text-navy-950 rounded-lg flex items-center justify-center font-black">
                          <Package className="w-4 h-4" />
                       </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-navy-950 tracking-tight group-hover:text-emerald-600 transition-colors truncate">{p.name}</h4>
                          <p className="text-[9px] font-medium text-blue-gray uppercase tracking-wide opacity-60">{p.category || L('General', 'Général')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 flex-1 text-left">
                       <div>
                          <p className="text-[9px] font-black text-blue-gray uppercase tracking-wide mb-0.5 italic">{L('Available Stock', 'Stock Disponible')}</p>
                          <div className="flex items-center justify-start gap-1.5">
                             <span className="text-[10px] font-black text-navy-950">{getFormattedQuantity(p)}</span>
                             {hasBundleSupport(p) && (
                               <span className="text-[8px] font-bold text-blue-400">({p.quantity} {p.baseUnit || p.packageType})</span>
                             )}
                             <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${p.quantity <= 5 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white shadow-sm'}`}>
                                {p.quantity <= 5 ? L('Low', 'Bas') : L('Optimal', 'Optimal')}
                             </span>
                          </div>
                          {hasBundleSupport(p) && (
                            <p className="text-[8px] font-bold text-blue-400/70 mt-0.5">1 {p.bundleName} = {p.bundleSize} {p.baseUnit || p.packageType}</p>
                          )}
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-blue-gray uppercase tracking-wide mb-0.5 italic">{L('Unit Price', 'Prix Unitaire')}</p>
                          <p className="text-[10px] font-black text-navy-950">{store.formatCurrency(p.price)}</p>
                       </div>
                       <div className="hidden md:block">
                          <p className="text-[9px] font-black text-blue-gray uppercase tracking-wide mb-0.5 italic">{L('Asset Value', 'Valeur Assets')}</p>
                          <p className="text-[10px] font-black text-emerald-600">{store.formatCurrency(p.quantity * p.price)}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-start md:justify-end gap-1.5 md:ml-auto">
                       <button 
                         onClick={() => setShowLossModal(p)} 
                         className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                         title={L('Report Loss', 'Signaler Perte')}
                       >
                          <AlertTriangle className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => setEditProduct(p)} className="p-2 bg-navy-50 text-navy-950 rounded-lg hover:bg-navy-950 hover:text-white transition-all shadow-sm">
                          <Pencil className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => confirmDelete(p)} className="p-2 bg-navy-50 text-navy-950 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
           
           {totalPages > 1 && (
             <div className="pt-4 border-t border-navy-50/20 mt-6">
                <Pagination 
                   currentPage={validCurrentPage} 
                   totalPages={totalPages} 
                   onPageChange={(page) => setCurrentPage(page)} 
                />
             </div>
           )}

           {filteredProducts.length === 0 && (
              <div className="py-32 text-center glass-card border-dashed border-2 border-emerald-100 opacity-20">
                 <Database className="w-20 h-20 mx-auto text-blue-gray mb-6" />
                 <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">{L('No items found in this sector', 'Aucun article trouvé dans ce secteur')}</p>
              </div>
           )}
        </div>
      )}

      {/* Modals for Add/Edit */}
      {(showModal || editProduct) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-navy-50 flex items-center justify-between bg-navy-50/50">
                 <h2 className="text-xl font-black text-navy-950 uppercase tracking-tighter">
                    {editProduct ? L('Modify Asset', 'Modifier Actif') : L('New Record', 'Nouvel Enregistrement')}
                 </h2>
                 <button onClick={() => {setShowModal(false); setEditProduct(null);}} className="p-2 hover:bg-navy-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={editProduct ? handleEditProduct : handleAddProduct} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
                 <div>
                    <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Item Name', 'Nom de l\'article')}</label>
                    <input
                      required
                      type="text"
                      placeholder={L('Asset designation...', 'Désignation de l\'actif...')}
                      value={editProduct ? editProduct.name : newProduct.name}
                      onChange={e => editProduct ? setEditProduct({...editProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-blue-gray/30"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Sector / Category', 'Secteur / Catégorie')}</label>
                      <select
                        required
                        value={editProduct ? editProduct.category : newProduct.category}
                        onChange={e => editProduct ? setEditProduct({...editProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">{L('Select', 'Sélectionner')}</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Initial Stock', 'Stock Initial')}</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          value={editProduct ? editProduct.quantity : newProduct.quantity}
                          onChange={e => editProduct ? setEditProduct({...editProduct, quantity: e.target.value}) : setNewProduct({...newProduct, quantity: e.target.value})}
                          className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Unit', 'Unité')}</label>
                        <select
                          required
                          value={editProduct ? editProduct.packageType : newProduct.packageType}
                          onChange={e => editProduct ? setEditProduct({...editProduct, packageType: e.target.value}) : setNewProduct({...newProduct, packageType: e.target.value})}
                          className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-xs sm:text-sm font-black text-navy-950 uppercase outline-none focus:border-emerald-500 transition-all truncate pr-10 cursor-pointer"
                        >
                          <option value="U">{L('Unit (Pcs)', 'Unité (Pcs)')}</option>
                          <option value="Kg">Kilogram (Kg)</option>
                          <option value="g">Gram (g)</option>
                          <option value="L">Liter (L)</option>
                          <option value="ml">Milliliter (ml)</option>
                          <option value="Box">Box / Carton</option>
                        </select>
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Purchase Price (Unit)', 'Prix d\'Achat (Unit)')}</label>
                      <input
                        required
                        type="number"
                        value={editProduct ? editProduct.cost : newProduct.cost}
                        onChange={e => editProduct ? setEditProduct({...editProduct, cost: e.target.value}) : setNewProduct({...newProduct, cost: e.target.value})}
                        className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Selling Price (Unit)', 'Prix de Vente (Unit)')}</label>
                      <input
                        required
                        type="number"
                        value={editProduct ? editProduct.price : newProduct.price}
                        onChange={e => editProduct ? setEditProduct({...editProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                 </div>

                 {/* Bundle Decomposition — Optional Section */}
                 <div className="border-t border-navy-50 pt-6">
                   <div className="flex items-center gap-2 mb-4">
                     <Layers className="w-4 h-4 text-blue-500" />
                     <p className="text-xs font-black uppercase tracking-widest text-blue-500">{L('Bundle Decomposition (Optional)', 'Décomposition Lot (Optionnel)')}</p>
                   </div>
                   <p className="text-[10px] font-medium text-blue-gray/60 mb-4 leading-relaxed">
                     {L('Configure if this product is sold both as a full bundle (e.g. Box) and individually (e.g. Apple).', 'Configurez si ce produit se vend en lot (ex: Carton) et à l\'unité (ex: Pomme).')}
                   </p>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 block">{L('Base Unit Name', 'Nom Unité de Base')}</label>
                       <input
                         type="text"
                         placeholder={L('e.g. Apple, Bottle, Egg', 'ex: Pomme, Bouteille, Oeuf')}
                         value={editProduct ? (editProduct.baseUnit || '') : (newProduct.baseUnit || '')}
                         onChange={e => editProduct ? setEditProduct({...editProduct, baseUnit: e.target.value}) : setNewProduct({...newProduct, baseUnit: e.target.value})}
                         className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-xs font-black text-navy-950 outline-none focus:border-blue-400 transition-all placeholder:text-blue-gray/30"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 block">{L('Bundle Name', 'Nom du Lot')}</label>
                       <input
                         type="text"
                         placeholder={L('e.g. Box, Carton, Tray', 'ex: Carton, Caisse, Plateau')}
                         value={editProduct ? (editProduct.bundleName || '') : (newProduct.bundleName || '')}
                         onChange={e => editProduct ? setEditProduct({...editProduct, bundleName: e.target.value}) : setNewProduct({...newProduct, bundleName: e.target.value})}
                         className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-xs font-black text-navy-950 outline-none focus:border-blue-400 transition-all placeholder:text-blue-gray/30"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 block">{L('Units per Bundle', 'Unités par Lot')}</label>
                       <input
                         type="number"
                         min="2"
                         step="1"
                         placeholder={L('e.g. 12, 24, 30', 'ex: 12, 24, 30')}
                         value={editProduct ? (editProduct.bundleSize || '') : (newProduct.bundleSize || '')}
                         onChange={e => editProduct ? setEditProduct({...editProduct, bundleSize: e.target.value}) : setNewProduct({...newProduct, bundleSize: e.target.value})}
                         className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-xs font-black text-navy-950 outline-none focus:border-blue-400 transition-all"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1 block">{L('Bundle Sell Price', 'Prix Vente Lot')}</label>
                       <input
                         type="number"
                         min="0"
                         step="0.01"
                         placeholder={L('Auto: unit price × size', 'Auto: prix × taille')}
                         value={editProduct ? (editProduct.bundlePrice || '') : (newProduct.bundlePrice || '')}
                         onChange={e => editProduct ? setEditProduct({...editProduct, bundlePrice: e.target.value}) : setNewProduct({...newProduct, bundlePrice: e.target.value})}
                         className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-xs font-black text-navy-950 outline-none focus:border-blue-400 transition-all"
                       />
                     </div>
                   </div>
                   {/* Live preview */}
                   {((editProduct?.bundleName && editProduct?.bundleSize) || (newProduct.bundleName && newProduct.bundleSize)) && (
                     <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                       <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                         ✓ {L('Bundle configured', 'Lot configuré')} — 1 {(editProduct || newProduct).bundleName} = {(editProduct || newProduct).bundleSize} {(editProduct || newProduct).baseUnit || (editProduct || newProduct).packageType || 'units'}
                       </p>
                     </div>
                   )}
                 </div>

                 <button
                   type="submit"
                   className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   <ShieldCheck className="w-5 h-5" /> {editProduct ? L('Save Changes', 'Sauvegarder Changements') : L('Register Asset', 'Inscrire au Registre')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Direct Loss Modal */}
      {showLossModal && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-scale-in">
            <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-md w-full scale-in" onClick={e => e.stopPropagation()}>
               <div className="text-center space-y-2 mb-10">
                  <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">{L('Report Spoilage', 'Signaler Avarie')}</h3>
                  <p className="text-xs md:text-sm font-black text-blue-gray uppercase tracking-widest italic opacity-40">{showLossModal.name}</p>
               </div>

               <form onSubmit={handleReportLoss} className="space-y-8">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <p className="text-xs md:text-sm font-black text-blue-gray uppercase tracking-widest ml-4">{L('Quantity Lost', 'Quantité Perdue')}</p>
                        <input
                          autoFocus
                          value={lossData.quantity}
                          onChange={e => setLossData({ ...lossData, quantity: e.target.value })}
                          type="number"
                          step="0.01"
                          required
                          className="w-full bg-navy-50 border-2 border-transparent rounded-[32px] px-8 py-6 text-3xl font-black text-navy-950 outline-none focus:border-rose-500 transition-all text-center"
                          placeholder="0.00"
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <p className="text-xs md:text-sm font-black text-blue-gray uppercase tracking-widest ml-4">{L('Reason / Cause', 'Raison / Cause')}</p>
                        <input
                          value={lossData.reason}
                          onChange={e => setLossData({ ...lossData, reason: e.target.value })}
                          type="text"
                          required
                          placeholder={L('Ex: Damaged, Expired...', 'Ex: Endommagé, Périmé...')}
                          className="w-full bg-navy-50 border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-black text-navy-950 uppercase outline-none focus:border-rose-500 transition-all"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => setShowLossModal(null)} className="py-6 bg-navy-50 text-navy-950 rounded-[32px] font-black uppercase text-xs md:text-sm tracking-widest hover:bg-navy-100 transition-all">{L('Cancel', 'Annuler')}</button>
                     <button type="submit" className="py-6 bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-[0.98]">
                        {L('Confirm Loss', 'Confirmer Perte')}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
