import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Trash2, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Package, 
  Clock, 
  X, 
  Activity, 
  ShieldAlert, 
  TrendingDown,
  ChevronRight,
  Database
} from 'lucide-react';

export default function Spoilage() {
  const store = useStore();
  const { t } = useLanguage();

  const [showModal, setShowModal] = useState(false);
  const [editingLoss, setEditingLoss] = useState(null);
  const [newLoss, setNewLoss] = useState({ product_id: '', quantity: '', reason: '' });

  const products = store.getProducts ? store.getProducts() : [];
  const losses = store.getLosses ? store.getLosses() : [];

  const handleOpenModal = (loss = null) => {
    if (loss) {
      setEditingLoss(loss);
      setNewLoss({
        product_id: loss.product_id,
        quantity: loss.quantity,
        reason: loss.reason
      });
    } else {
      setEditingLoss(null);
      setNewLoss({ product_id: '', quantity: '', reason: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => (p.id || p.product_id) === newLoss.product_id);
    if (!product) return;

    const qtyNum = parseFloat(newLoss.quantity);

    if (editingLoss) {
      // Revert old stock impact
      const oldProduct = products.find(p => (p.id || p.product_id) === editingLoss.product_id);
      if (oldProduct) {
        store.updateRecord({
          ...oldProduct,
          quantity: (oldProduct.quantity || 0) + (editingLoss.quantity || 0) - qtyNum
        });
      }

      store.updateRecord({
        ...editingLoss,
        product_id: newLoss.product_id,
        name: product.name,
        quantity: qtyNum,
        reason: newLoss.reason,
        valuation: qtyNum * (parseFloat(product.cost) || 0)
      });
    } else {
      // Logic for new loss
      if (qtyNum > (product.quantity || 0)) {
        store.showAlert("Erreur: Quantité supérieure au stock disponible!", "error");
        return;
      }

      store.addRecord({
        record_type: 'loss',
        product_id: newLoss.product_id,
        name: product.name,
        quantity: qtyNum,
        reason: newLoss.reason,
        date: new Date().toISOString(),
        valuation: qtyNum * (parseFloat(product.cost) || 0),
        operator: store.currentOperator
      });

      // Update stock
      store.updateRecord({
        ...product,
        quantity: (product.quantity || 0) - qtyNum
      });
    }

    setShowModal(false);
    setNewLoss({ product_id: '', quantity: '', reason: '' });
    setEditingLoss(null);
  };

  const handleDelete = (loss) => {
    store.showConfirm("Êtes-vous sûr de vouloir supprimer ce record ? La quantité sera retournée au stock.", () => {
      const product = products.find(p => (p.id || p.product_id) === loss.product_id);
      if (product) {
        store.updateRecord({
          ...product,
          quantity: (product.quantity || 0) + (loss.quantity || 0)
        });
      }
      store.deleteRecord(loss);
      store.showAlert("Perte supprimée et stock rétabli", "success");
    });
  };

  const totalLossValue = losses.reduce((sum, l) => sum + (parseFloat(l.valuation) || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Pertes & Avaries
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            Audit des Pertes Critiques — Valorisation du Gaspillage
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-2xl active:scale-95 shadow-rose-600/20"
        >
          <Plus className="w-5 h-5" /> Signaler une Perte
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        <div className="glass-card bg-white p-8 rounded-[48px] border-rose-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
            <TrendingDown className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Impact Financier</p>
            <p className="text-4xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(totalLossValue)}</p>
          </div>
        </div>

        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Incidents Détectés</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">{losses.length} <span className="text-xs">Cas</span></p>
          </div>
        </div>

        <div className="glass-card bg-navy-950 p-8 rounded-[48px] text-white flex items-center gap-8 shadow-2xl relative overflow-hidden hidden lg:flex">
           <div className="absolute top-0 right-0 p-6 opacity-10">
              <Activity className="w-20 h-20" />
           </div>
           <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
              <Clock className="w-8 h-8 text-rose-400" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 italic">Dernière Perte</p>
              <p className="text-xl font-black text-white">{losses.length > 0 ? new Date(losses[losses.length-1].date).toLocaleDateString() : 'N/A'}</p>
           </div>
        </div>
      </div>

      {/* Loss Registry List */}
      <div className="space-y-4">
        {losses.length > 0 ? (
          losses.map((l, i) => (
            <div key={i} className="glass-card bg-white border border-rose-50 p-6 hover:border-rose-400 transition-all group shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                     <Package className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-navy-950 uppercase tracking-tighter group-hover:text-rose-600 transition-colors">{l.name}</h3>
                     <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-60">{l.reason || 'Raison non spécifiée'}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 max-w-2xl text-center md:text-left">
                  <div>
                     <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Date / Heure</p>
                     <p className="text-xs font-black text-navy-950 uppercase opacity-60">
                        {new Date(l.date).toLocaleDateString()} — {new Date(l.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                     </p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Volume Perdu</p>
                     <p className="text-sm font-black text-rose-600">{l.quantity}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Valeur Impactée</p>
                     <p className="text-sm font-black text-navy-950">{store.formatCurrency(l.valuation || 0)}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Opérateur</p>
                     <p className="text-[10px] font-black text-navy-950 uppercase tracking-widest">{l.operator || 'ADMIN'}</p>
                  </div>
               </div>

               <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => handleOpenModal(l)}
                    className="p-3 bg-navy-50 text-navy-950 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(l)}
                    className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center glass-card border-dashed border-2 border-rose-100 opacity-20">
             <ShieldAlert className="w-20 h-20 mx-auto text-blue-gray mb-6" />
             <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">Aucune perte indexée</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowModal(false)}>
           <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-lg w-full scale-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">
                       {editingLoss ? 'Modifier l\'Avarie' : 'Nouveau Signalement'}
                    </h3>
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic opacity-40">Registre des Pertes Critiques</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-3 hover:bg-navy-50 rounded-full transition-all">
                    <X className="w-6 h-6 text-blue-gray" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest ml-4">Article Concerné</p>
                    <select
                      required
                      disabled={!!editingLoss}
                      value={newLoss.product_id}
                      onChange={e => setNewLoss({ ...newLoss, product_id: e.target.value })}
                      className="w-full bg-navy-50 border-2 border-transparent rounded-3xl px-6 py-5 text-sm font-black text-navy-950 uppercase outline-none focus:border-rose-500 transition-all disabled:opacity-50 appearance-none"
                    >
                      <option value="">Sélectionner un produit...</option>
                      {products.map(p => <option key={p.id || p.product_id} value={p.id || p.product_id}>{p.name} ({p.quantity} en stock)</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest ml-4">Quantité</p>
                       <input
                         type="number"
                         required
                         value={newLoss.quantity}
                         onChange={e => setNewLoss({ ...newLoss, quantity: e.target.value })}
                         className="w-full bg-navy-50 border-2 border-transparent rounded-3xl px-6 py-5 text-sm font-black text-navy-950 outline-none focus:border-rose-500 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest ml-4">Cause</p>
                       <input
                         type="text"
                         placeholder="Ex: PÉRIME..."
                         required
                         value={newLoss.reason}
                         onChange={e => setNewLoss({ ...newLoss, reason: e.target.value })}
                         className="w-full bg-navy-50 border-2 border-transparent rounded-3xl px-6 py-5 text-sm font-black text-navy-950 uppercase outline-none focus:border-rose-500 transition-all placeholder:text-blue-gray/30"
                       />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full py-6 bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-[0.98]"
                 >
                   <AlertCircle className="w-5 h-5" /> {editingLoss ? 'Mettre à jour le registre' : 'Confirmer la Perte'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
