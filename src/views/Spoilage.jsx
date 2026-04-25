import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, AlertCircle, Plus, Edit2, Package, Clock, X } from 'lucide-react';

export default function Spoilage() {
  const store = useStore();
  const { t } = useLanguage();

  const [showModal, setShowModal] = useState(false);
  const [editingLoss, setEditingLoss] = useState(null);
  const [newLoss, setNewLoss] = useState({ product_id: '', quantity: '', reason: '' });

  const products = store.getProducts();
  const losses = store.getLosses();

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
    const product = products.find(p => p.product_id === newLoss.product_id);
    if (!product) return;

    const qtyNum = parseFloat(newLoss.quantity);

    if (editingLoss) {
      // Revert old stock impact
      const oldProduct = products.find(p => p.product_id === editingLoss.product_id);
      if (oldProduct) {
        store.updateRecord({
          ...oldProduct,
          quantity: oldProduct.quantity + editingLoss.quantity - qtyNum
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
      if (qtyNum > product.quantity) {
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
        valuation: qtyNum * (parseFloat(product.cost) || 0)
      });

      // Update stock
      store.updateRecord({
        ...product,
        quantity: product.quantity - qtyNum
      });
    }

    setShowModal(false);
    setNewLoss({ product_id: '', quantity: '', reason: '' });
    setEditingLoss(null);
  };

  const handleDelete = (loss) => {
    store.showConfirm("Êtes-vous sûr de vouloir supprimer ce record ? La quantité sera retournée au stock.", () => {
      // Revert stock impact
      const product = products.find(p => p.product_id === loss.product_id);
      if (product) {
        store.updateRecord({
          ...product,
          quantity: product.quantity + loss.quantity
        });
      }
      store.deleteRecord(loss); // Pass the whole object
      store.showAlert("Perte supprimée et stock rétabli", "success");
    });
  };

  return (
    <div className="max-w-full mx-auto min-h-[calc(100vh-6rem)] bg-[#064E3B] rounded-[24px] p-4 md:p-8 space-y-4 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 fade-in-up">
      <div className="border-b border-navy-50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter text-white leading-none">{t('spoilage')}</h1>
          <h2 className="text-sm font-bold text-[#F59E0B] tracking-[0.2em] uppercase mt-1">Audit des Pertes Critiques</h2>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#BEF264] text-black font-black px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-white transition-all uppercase tracking-widest text-xs">
          <Plus className="w-5 h-5" /> Signaler une Perte
        </button>
      </div>

      <div className="glass-card rounded-[24px] overflow-hidden bg-white/5 backdrop-blur-2xl shadow-2xl border border-white/10">

        {/* ✅ MOBILE: Card List */}
        <div className="block lg:hidden divide-y divide-navy-50">
          {losses.length > 0 ? losses.map((l, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-black text-navy-brand uppercase tracking-tight text-sm">{l.name}</p>
                  <p className="text-xs text-blue-gray font-bold mt-0.5 italic">{l.reason}</p>
                </div>
                <span className="bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full text-xs font-black uppercase">-{l.quantity}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-navy-50 rounded-lg p-2 text-center">
                  <p className="text-xs md:text-sm text-blue-gray uppercase font-black">Value Lost</p>
                  <p className="text-xs font-black text-navy-900">{store.formatCurrency(l.valuation || 0)}</p>
                </div>
                <div className="bg-navy-50 rounded-lg p-2 text-center">
                  <p className="text-xs md:text-sm text-blue-gray uppercase font-black">Operator</p>
                  <p className="text-xs font-black text-blue-gray">{l.operator || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-gray font-bold">{new Date(l.date).toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(l)} className="p-2 rounded-lg bg-white border border-navy-100 text-blue-gray"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(l)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-6 md:p-12 text-center text-blue-gray/30 font-black uppercase tracking-widest text-sm">Aucune perte enregistrée</div>
          )}
        </div>

        {/* ✅ DESKTOP: Full Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-xs font-black uppercase tracking-widest text-white/50">
                <th className="p-6">Date / Heure</th>
                <th className="p-6">Produit</th>
                <th className="p-6 text-center">Quantité</th>
                <th className="p-6">Raison</th>
                <th className="p-6 text-right">Valeur Perdue</th>
                <th className="p-6 text-center">Opérateur</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {losses.map((l, i) => (
                <tr key={i} className="hover:bg-red-400/10 transition-colors group">
                  <td className="p-6 text-xs text-white/40 font-bold">{new Date(l.date).toLocaleString()}</td>
                  <td className="p-6 font-black text-white uppercase tracking-tight">{l.name}</td>
                  <td className="p-6 text-center font-black text-red-400">{l.quantity}</td>
                  <td className="p-6 text-sm text-white/50 font-bold italic">{l.reason}</td>
                  <td className="p-6 text-right font-black text-white">{store.formatCurrency(l.valuation || 0)}</td>
                  <td className="p-6 text-center text-xs md:text-sm font-black uppercase tracking-widest text-white/40">{l.operator || 'Admin'}</td>
                  <td className="p-6 text-center">
                    <button onClick={() => handleOpenModal(l)} className="p-3 bg-white border border-navy-100 rounded-xl text-blue-gray hover:text-navy-brand transition-all shadow-sm mr-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(l)} className="p-3 bg-white border border-navy-100 rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {losses.length === 0 && (
                <tr><td colSpan="7" className="p-6 md:p-20 text-center text-blue-gray font-black uppercase tracking-widest opacity-20">Aucune perte enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-md p-4">
          <div className="glass-card max-w-lg w-full rounded-[40px] bg-white shadow-2xl border border-white/10 overflow-hidden relative scale-in">
            <div className="p-8 border-b border-navy-50 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter text-navy-brand">{editingLoss ? 'Modifier l\'Avarie' : 'Signaler une Avarie'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-navy-50 rounded-full transition-all text-blue-gray"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray ml-2">Produit</label>
                <select
                  required
                  disabled={!!editingLoss}
                  value={newLoss.product_id}
                  onChange={e => setNewLoss({ ...newLoss, product_id: e.target.value })}
                  className="w-full bg-navy-50 border border-navy-100 rounded-2xl px-6 py-4 text-charcoal font-bold outline-none focus:border-red-500 transition-all disabled:opacity-50"
                >
                  <option value="">Choisir un produit...</option>
                  {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name} ({p.quantity} dispo)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray ml-2">Quantité Perdue</label>
                  <input
                    type="number"
                    required
                    value={newLoss.quantity}
                    onChange={e => setNewLoss({ ...newLoss, quantity: e.target.value })}
                    className="w-full bg-navy-50 border border-navy-100 rounded-2xl px-6 py-4 text-charcoal font-bold outline-none focus:border-red-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray ml-2">Raison</label>
                  <input
                    type="text"
                    placeholder="Ex: Pourri, Cassé"
                    required
                    value={newLoss.reason}
                    onChange={e => setNewLoss({ ...newLoss, reason: e.target.value })}
                    className="w-full bg-navy-50 border border-navy-100 rounded-2xl px-6 py-4 text-charcoal font-bold outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-3xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> {editingLoss ? 'Mettre à jour' : 'Enregistrer la Perte'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
