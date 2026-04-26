import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, CheckCircle2, X, ShoppingCart, TrendingUp, User } from 'lucide-react';

export default function ShiftEndModal({ isOpen, onClose }) {
  const store = useStore();
  const { t } = useLanguage();
  const [endTime, setEndTime] = useState(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm

  const shiftData = useMemo(() => {
    return store.getShiftTransactions(store.shiftStart);
  }, [store.shiftStart, store.getSales(), store.getLedgerManual()]);

  const revenue = useMemo(() => {
    return (shiftData.sales || []).reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  }, [shiftData.sales]);

  const expenseTotal = useMemo(() => {
    return (shiftData.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [shiftData.expenses]);

  const netCash = revenue - expenseTotal;

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalEnd = new Date(endTime).toISOString();
    
    store.addRecord({
      record_type: 'shift',
      operator: store.currentOperator,
      start: store.shiftStart,
      end: finalEnd,
      revenue: revenue,
      expenses: expenseTotal,
      net: netCash,
      transactions: shiftData.sales.length,
      sales: shiftData.sales,
      expenseList: shiftData.expenses
    });

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
                  <ShoppingCart className="w-4 h-4" /> Vos Transactions ({shiftSales.length})
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
        </div>

        <div className="p-10 bg-navy-50/50 border-t border-navy-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Net à Remettre</p>
              <p className="text-3xl font-black text-navy-950">{store.formatCurrency(netCash)}</p>
           </div>
           <button 
             onClick={handleConfirm}
             className="btn-premium !bg-navy-950"
           >
             Confirmer & Fermer le Poste <CheckCircle2 className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
