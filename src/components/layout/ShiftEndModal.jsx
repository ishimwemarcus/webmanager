import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, CheckCircle2, X, ShoppingCart, TrendingUp, User, Star } from 'lucide-react';

export default function ShiftEndModal({ isOpen, onClose }) {
  const store = useStore();
  const { t } = useLanguage();
  const [endTime, setEndTime] = useState(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
  const [blindCount, setBlindCount] = useState('');
  const [isCounted, setIsCounted] = useState(false);

  const shiftData = useMemo(() => {
    return store.getShiftTransactions(store.shiftStart);
  }, [store.shiftStart, store.getSales(), store.getLedgerManual()]);

  const revenue = useMemo(() => {
    return (shiftData.sales || []).reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  }, [shiftData.sales]);

  const expenseTotal = useMemo(() => {
    return (shiftData.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [shiftData.expenses]);

  const tipTotal = useMemo(() => {
    return (shiftData.tips || []).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [shiftData.tips]);

  const netCash = revenue - expenseTotal + tipTotal;

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalEnd = new Date(endTime).toISOString();
    
    const existingShift = store.getShifts().find(s => s.start === store.shiftStart);
    const shiftDataToSave = {
      record_type: 'shift',
      operator: store.currentOperator,
      start: store.shiftStart,
      end: finalEnd,
      status: 'closed',
      revenue: revenue,
      expenses: expenseTotal,
      net: netCash,
      blind_count: parseFloat(blindCount) || 0,
      count_difference: (parseFloat(blindCount) || 0) - netCash,
      transactions: shiftData.sales.length,
      sales: shiftData.sales,
      expenseList: shiftData.expenses
    };

    if (existingShift) {
      store.updateRecord({ ...existingShift, ...shiftDataToSave });
    } else {
      store.addRecord(shiftDataToSave);
    }

    store.setShiftStart('');
    store.setCurrentOperator('');
    localStorage.removeItem('biztrack_operator');
    localStorage.removeItem('biztrack_shift_start');
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-navy-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white max-w-2xl w-full rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-navy-50 scale-in">
        <div className="p-10 border-b border-navy-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-navy-brand rounded-2xl flex items-center justify-center text-white">
                <Clock className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter">Fin de Poste</h3>
                <p className="text-xs font-bold text-blue-gray uppercase tracking-widest italic">{store.currentOperator} (Session Active)</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-navy-50 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-blue-gray" />
          </button>
        </div>

        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-navy-50 p-6 rounded-3xl border border-navy-100">
                <p className="text-xs font-black uppercase text-blue-gray mb-1">Début du Poste</p>
                <p className="text-lg font-black text-navy-950">{new Date(store.shiftStart).toLocaleString()}</p>
             </div>
             <div className="bg-navy-900 p-6 rounded-3xl border border-navy-800">
                <label className="text-xs font-black uppercase text-white/40 mb-2 block tracking-widest">Heure de Départ (Modifiable)</label>
                <input 
                  type="datetime-local" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-black outline-none focus:border-navy-brand transition-all"
                />
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <p className="text-xs font-black uppercase tracking-widest text-blue-gray flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Vos Transactions ({shiftData.sales.length})
                </p>
                <p className="text-xs font-black uppercase tracking-widest text-navy-brand italic">Strictement à vous</p>
             </div>
             <div className="divide-y divide-navy-50 border border-navy-50 rounded-[32px] overflow-hidden bg-white shadow-sm">
                {shiftData.sales.map((s, i) => (
                  <div key={i} className="p-5 flex items-center justify-between hover:bg-navy-50/50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-navy-950 font-black text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-black text-navy-950 uppercase">{s.name}</p>
                          <p className="text-[10px] font-bold text-blue-gray">{new Date(s.date).toLocaleTimeString()}</p>
                        </div>
                     </div>
                     <p className="font-black text-navy-brand">{store.formatCurrency(s.amount)}</p>
                  </div>
                ))}
                {shiftData.sales.length === 0 && (
                  <div className="p-10 text-center text-blue-gray text-xs font-black uppercase tracking-widest opacity-40 italic">
                    Aucune transaction effectuée durant ce poste.
                  </div>
                )}
             </div>
          </div>

          {/* Tips Section */}
          {(shiftData.tips || []).length > 0 && (
            <div className="space-y-3">
               <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Pourboires Reçus ({shiftData.tips.length})
                  </p>
                  <p className="text-xs font-black text-amber-600">{store.formatCurrency(tipTotal)}</p>
               </div>
               <div className="divide-y divide-amber-50 border border-amber-100 rounded-3xl overflow-hidden bg-amber-50/30">
                  {shiftData.tips.map((t, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Star className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-amber-900 uppercase">{t.client || 'Client'}</p>
                            <p className="text-[9px] font-bold text-amber-500/70">{new Date(t.date).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <p className="font-black text-amber-600">{store.formatCurrency(t.amount)}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-navy-50/50 border-t border-navy-50 flex flex-col md:flex-row items-center justify-between gap-6">
           {!isCounted ? (
              <div className="w-full flex flex-col items-center gap-4">
                 <div className="w-full max-w-md space-y-2">
                    <label className="text-xs font-black uppercase text-navy-950 tracking-widest text-center block">Comptage Physique Caisse</label>
                    <p className="text-[10px] text-blue-gray uppercase tracking-widest text-center italic mb-4">Combien d'espèces avez-vous exactement en caisse ?</p>
                    <input 
                       type="number"
                       value={blindCount}
                       onChange={e => setBlindCount(e.target.value)}
                       placeholder="Saisissez le montant compté..."
                       className="w-full bg-white border-2 border-emerald-500/20 rounded-2xl px-6 py-4 text-center text-xl font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                    />
                 </div>
                 <button 
                   onClick={() => {
                     if (blindCount === '') {
                        store.showAlert("Veuillez saisir le montant compté.", "warning");
                        return;
                     }
                     setIsCounted(true);
                   }}
                   className="btn-premium w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white"
                 >
                   Valider le Comptage <CheckCircle2 className="w-5 h-5" />
                 </button>
              </div>
           ) : (
              <div className="w-full space-y-6">
                 <div className="space-y-3">
                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                       <div className="p-4 bg-emerald-50 rounded-2xl text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Ventes</p>
                          <p className="text-lg font-black text-emerald-700">{store.formatCurrency(revenue)}</p>
                       </div>
                       <div className="p-4 bg-amber-50 rounded-2xl text-center">
                          <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest mb-1">Pourboires</p>
                          <p className="text-lg font-black text-amber-600">{store.formatCurrency(tipTotal)}</p>
                       </div>
                       <div className="p-4 bg-rose-50 rounded-2xl text-center">
                          <p className="text-[9px] font-black uppercase text-rose-500 tracking-widest mb-1">Dépenses</p>
                          <p className="text-lg font-black text-rose-600">-{store.formatCurrency(expenseTotal)}</p>
                       </div>
                    </div>
                    {/* Main reconciliation row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-navy-50 shadow-sm">
                       <div className="text-center">
                          <p className="text-[9px] font-black uppercase text-blue-gray tracking-widest mb-1">Net Attendu</p>
                          <p className="text-2xl font-black text-navy-950">{store.formatCurrency(netCash)}</p>
                       </div>
                       <div className="text-2xl font-black text-navy-200">vs</div>
                       <div className="text-center">
                          <p className="text-[9px] font-black uppercase text-blue-gray tracking-widest mb-1">Votre Comptage</p>
                          <p className="text-2xl font-black text-navy-950">{store.formatCurrency(parseFloat(blindCount) || 0)}</p>
                       </div>
                       <div className={`text-center px-5 py-3 rounded-2xl ${((parseFloat(blindCount) || 0) - netCash) < 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1">Écart</p>
                          <p className="text-xl font-black">
                             {((parseFloat(blindCount) || 0) - netCash) > 0 ? '+' : ''}
                             {store.formatCurrency((parseFloat(blindCount) || 0) - netCash)}
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex justify-end">
                    <button 
                      onClick={handleConfirm}
                      className="btn-premium !bg-navy-950"
                    >
                      Confirmer & Fermer le Poste <CheckCircle2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
