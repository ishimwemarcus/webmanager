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
  Filter
} from 'lucide-react';
import { getFormattedQuantity } from '../utils/ProductUtils';

export default function Stock() {
  const store = useStore();
  const { t, L } = useLanguage();
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

  const products = store.getProducts();
  const categories = store.getCategories();

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      status: 'active',
      date: new Date().toISOString()
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
    store.showConfirm(L(`DELETE ${product.name.toUpperCase()}?`, `SUPPRIMER ${product.name.toUpperCase()}?`), () => {
      store.deleteRecord(product);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Stock Inventory', 'Inventaire Stock')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            {L('Asset Management — Centralized Registry', 'Gestion des Actifs — Registre Centralisé')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-rose-500 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 flex items-center gap-2 hover:bg-rose-600 transition-all active:scale-95"
            >
              <Trash2 className="w-5 h-5" /> {L(`Delete ${selectedIds.length} Items`, `Supprimer ${selectedIds.length} Articles`)}
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-navy-950 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95"
          >
            <Plus className="w-5 h-5 text-emerald-400" /> {L('Add an Asset', 'Ajouter un Actif')}
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('Total Valuation', 'Évaluation Totale')}</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">
              {store.formatCurrency(totalValuation)}
            </p>
          </div>
        </div>

        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-navy-50 text-navy-950 flex items-center justify-center shadow-inner">
            <Layers className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('Operational Assets', 'Actifs Opérationnels')}</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">
              {products.length} <span className="text-xs text-blue-gray opacity-40 font-black">{L('Lines', 'Lignes')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search & Back Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
          <input
            type="text"
            placeholder={L('Search inventory...', 'Rechercher dans l\'inventaire...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-emerald-100 rounded-[28px] pl-16 pr-8 py-5 text-sm font-black text-navy-950 placeholder:text-blue-gray/30 shadow-xl outline-none focus:border-emerald-500 transition-all uppercase"
          />
        </div>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)} 
            className="px-8 py-4 bg-navy-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg hover:bg-emerald-600 transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-emerald-400" /> {L('Back to Sectors', 'Retour aux Secteurs')}
          </button>
        )}
      </div>

      {/* Categories Grid */}
      {!searchQuery && !selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 no-print animate-scale-in">
          {categories.map((cat) => {
            const catCount = products.filter(p => p.category === cat.name).length;
            const catValue = products.filter(p => p.category === cat.name).reduce((s, p) => s + (p.price * p.quantity), 0);
            return (
              <div 
                key={cat.id}
                className="glass-card bg-white p-8 rounded-[40px] border-emerald-50 flex flex-col items-center text-center group cursor-pointer hover:border-emerald-500 transition-all shadow-sm relative overflow-hidden"
                onClick={() => setSelectedCategory(cat.name)}
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <Box className="w-24 h-24" />
                </div>
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                   <Box className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tighter text-navy-950">{L('Sector', 'Secteur')} {cat.name}</h4>
                <p className="text-[10px] font-black text-blue-gray mt-1 uppercase tracking-widest opacity-60 italic">{catCount} {L('Items', 'Articles')}</p>
                <div className="mt-6 pt-4 border-t border-navy-50 w-full flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-navy-950">
                   <span>{L('Estimated Value', 'Valeur Estimée')}</span>
                   <span className="text-emerald-600">{store.formatCurrency(catValue)}</span>
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
              {filteredProducts.map((p) => (
                 <div key={p.id} className={`glass-card bg-white p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center gap-4 hover:border-emerald-400 group ${selectedIds.includes(p.id) ? 'border-emerald-500 bg-emerald-50/10' : 'border-emerald-50'}`}>
                    <div className="flex items-center gap-4">
                       <button onClick={() => toggleSelect(p.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selectedIds.includes(p.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-emerald-100 hover:border-emerald-500'}`}>
                          {selectedIds.includes(p.id) && <CheckSquare className="w-4 h-4" />}
                       </button>
                       <div className="w-12 h-12 bg-navy-50 text-navy-950 rounded-xl flex items-center justify-center font-black">
                          <Package className="w-6 h-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-navy-950 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{p.name}</h4>
                          <p className="text-[9px] font-black text-blue-gray uppercase tracking-widest opacity-60 italic">{p.category || L('General', 'Général')}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1 text-center md:text-left">
                       <div>
                          <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Available Stock', 'Stock Disponible')}</p>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                             <span className="text-xs font-black text-navy-950">{p.quantity}</span>
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${p.quantity <= 5 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white shadow-sm'}`}>
                                {p.quantity <= 5 ? L('Low', 'Bas') : L('Optimal', 'Optimal')}
                             </span>
                          </div>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Unit Price', 'Prix Unitaire')}</p>
                          <p className="text-xs font-black text-navy-950">{store.formatCurrency(p.price)}</p>
                       </div>
                       <div className="hidden md:block">
                          <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Asset Value', 'Valeur Assets')}</p>
                          <p className="text-xs font-black text-emerald-600">{store.formatCurrency(p.quantity * p.price)}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => setEditProduct(p)} className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-navy-950 hover:text-white transition-all shadow-sm">
                          <Pencil className="w-4 h-4" />
                       </button>
                       <button onClick={() => confirmDelete(p)} className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>

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
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Item Name', 'Nom de l\'article')}</label>
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
                      <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Sector / Category', 'Secteur / Catégorie')}</label>
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
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Initial Stock', 'Stock Initial')}</label>
                      <input
                        required
                        type="number"
                        value={editProduct ? editProduct.quantity : newProduct.quantity}
                        onChange={e => editProduct ? setEditProduct({...editProduct, quantity: e.target.value}) : setNewProduct({...newProduct, quantity: e.target.value})}
                        className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Purchase Price (Unit)', 'Prix d\'Achat (Unit)')}</label>
                      <input
                        required
                        type="number"
                        value={editProduct ? editProduct.cost : newProduct.cost}
                        onChange={e => editProduct ? setEditProduct({...editProduct, cost: e.target.value}) : setNewProduct({...newProduct, cost: e.target.value})}
                        className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-2 block italic">{L('Selling Price (Unit)', 'Prix de Vente (Unit)')}</label>
                      <input
                        required
                        type="number"
                        value={editProduct ? editProduct.price : newProduct.price}
                        onChange={e => editProduct ? setEditProduct({...editProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full bg-navy-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-black text-navy-950 outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
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

    </div>
  );
}
