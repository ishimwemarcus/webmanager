import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Clock, User, TrendingUp, ShoppingBag, History, Calendar, Trash2 } from 'lucide-react';

export default function Shifts() {
  const store = useStore();
  const { t } = useLanguage();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAll, setShowAll] = useState(false);
  
  const allShifts = store.getShifts();
  const allSales = store.getSales();

  const filteredShifts = useMemo(() => {
    if (showAll) return allShifts;
    return allShifts.filter(s => s.end && s.end.startsWith(filterDate));
  }, [allShifts, filterDate, showAll]);

  const stats = useMemo(() => {
    const totalRevenue = filteredShifts.reduce((acc, curr) => acc + (parseFloat(curr.revenue) || 0), 0);
    const totalTransactions = filteredShifts.reduce((acc, curr) => acc + (parseInt(curr.transactions) || 0), 0);
    return { totalRevenue, totalTransactions };
  }, [filteredShifts]);

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">Journal des Postes</h1>
          <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase mt-1">Suivi des Performances Employés</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-navy-100 shadow-xl">
              <Calendar className="w-5 h-5 text-blue-gray" />
              <input 
                type="date" 
                value={filterDate}
                onChange={e => { setFilterDate(e.target.value); setShowAll(false); }}
                className="bg-transparent font-black text-navy-950 outline-none text-sm cursor-pointer"
              />
          </div>
          <button 
            onClick={() => setShowAll(!showAll)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all shadow-xl ${showAll ? 'bg-navy-950 text-white border-navy-950' : 'bg-white text-navy-950 border-navy-100 hover:border-navy-brand'}`}
          >
            {showAll ? 'Voir par Date' : 'Voir Tout Historique'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl flex items-center gap-6 group hover:border-navy-brand transition-all">
          <div className="w-16 h-16 bg-navy-brand/10 text-navy-brand rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-blue-gray tracking-widest mb-1">Chiffre d'Affaires Total</p>
            <p className="text-3xl font-black text-navy-950">{store.formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl flex items-center gap-6 group hover:border-navy-brand transition-all">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-blue-gray tracking-widest mb-1">Total Transactions</p>
            <p className="text-3xl font-black text-navy-950">{stats.totalTransactions} <span className="text-sm">Ventes</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredShifts.length > 0 ? filteredShifts.map((shift, i) => (
          <div key={i} className="glass-card bg-white border border-navy-100 shadow-xl overflow-hidden group hover-elevate hover:border-navy-brand transition-all">
            <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-navy-50 rounded-3xl flex flex-col items-center justify-center text-navy-brand border border-navy-100 group-hover:bg-navy-brand group-hover:text-white transition-all">
                  <User className="w-8 h-8" />
                  <p className="text-[10px] font-black uppercase mt-1">{shift.operator?.charAt(0)}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-navy-950">{shift.operator}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <p className="text-xs font-bold text-blue-gray flex items-center gap-1.5">
                       <Clock className="w-3.5 h-3.5" /> 
                       {new Date(shift.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                       <span className="opacity-30">→</span> 
                       {new Date(shift.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-xs font-bold text-blue-gray flex items-center gap-1.5">
                       <Calendar className="w-3.5 h-3.5" />
                       {new Date(shift.end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Ventes Réalisées</p>
                   <p className="text-2xl font-black text-navy-brand">{store.formatCurrency(shift.revenue)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1 italic">Volume</p>
                   <p className="text-2xl font-black text-navy-950">{shift.transactions} <span className="text-xs">Tx</span></p>
                </div>
                <button 
                  onClick={() => store.showConfirm("Supprimer l'archive de ce poste ?", () => store.deleteRecord(shift))}
                  className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Detailed Transaction List for this shift (Optional peek) */}
            <div className="px-8 pb-8">
               <div className="bg-navy-50/50 rounded-3xl p-4 border border-navy-100/50">
                  <p className="text-[10px] font-black uppercase text-blue-gray mb-3 tracking-widest flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Aperçu des transactions liées à ce poste
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(shift.sales || allSales.filter(s => s.shiftId === shift.start)).slice(0, 5).map((s, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-white border border-navy-100 rounded-xl text-[10px] font-bold text-navy-900 shadow-sm flex items-center gap-2">
                        <span className="text-navy-brand">{store.formatCurrency(s.amount)}</span>
                        <span className="opacity-30">|</span>
                        <span>{s.name}</span>
                      </div>
                    ))}
                    {(shift.sales?.length || allSales.filter(s => s.shiftId === shift.start).length) > 5 && (
                      <div className="px-3 py-1.5 bg-navy-100 rounded-xl text-[10px] font-black text-blue-gray">
                        + {(shift.sales?.length || allSales.filter(s => s.shiftId === shift.start).length) - 5} autres
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center space-y-4 bg-white border-2 border-dashed border-navy-100 rounded-[48px] opacity-40">
             <Clock className="w-16 h-16 mx-auto text-blue-gray" />
             <p className="text-sm font-black uppercase tracking-[0.4em] text-blue-gray">Aucun poste enregistré ce jour</p>
          </div>
        )}
      </div>
    </div>
  );
}
