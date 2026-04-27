import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  History,
  X,
  TrendingDown,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  Trash2
} from 'lucide-react';

export default function Cloture() {
   const store = useStore();
   const { t, L } = useLanguage();

   const [actualCash, setActualCash] = useState('');
   const [note, setNote] = useState('');
   const [editingRecord, setEditingRecord] = useState(null);

   const today = new Date().toISOString().split('T')[0];
   const sales = store.getSales ? store.getSales() : [];
   const ledger = store.getLedgerManual ? store.getLedgerManual() : [];

   const stats = useMemo(() => {
      const daySales = sales.filter(s => s.date.startsWith(today));
      const dayLedger = ledger.filter(l => l.date.startsWith(today));

      const salesCash = daySales.reduce((acc, s) => acc + (parseFloat(s.paid) || 0), 0);
      const ledgerIncome = dayLedger.filter(l => l.type === 'receivable').reduce((acc, l) => acc + (parseFloat(l.paid) || parseFloat(l.amount) || 0), 0);
      const ledgerExpense = dayLedger.filter(l => l.type === 'expense').reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);

      const expected = salesCash + ledgerIncome - ledgerExpense;
      return { expected, salesCash, ledgerIncome, ledgerExpense };
   }, [sales, ledger, today]);

   const history = store.getReconciliations ? store.getReconciliations() : [];
   const discrepancy = parseFloat(actualCash || 0) - stats.expected;

   const handleEdit = (record) => {
      setEditingRecord(record);
      setActualCash(record.actual.toString());
      setNote(record.note || '');
   };

   const handleDelete = (record) => {
      store.showConfirm(L("Confirm deletion of this reconciliation?", "Confirmer la suppression de cette clôture ?"), () => {
         store.deleteRecord(record);
         store.showAlert(L("Reconciliation deleted", "Clôture supprimée"), "success");
      });
   };

   const handleReconcile = (e) => {
      e.preventDefault();
      
      if (editingRecord) {
         store.updateRecord({
            ...editingRecord,
            actual: parseFloat(actualCash),
            discrepancy,
            note
         });
         store.showAlert(L("Reconciliation updated successfully!", "Clôture mise à jour avec succès!"));
         setEditingRecord(null);
      } else {
         store.addRecord({
            record_type: 'reconciliation',
            date: new Date().toISOString(),
            expected: stats.expected,
            actual: parseFloat(actualCash),
            discrepancy,
            note,
            operator: store.currentOperator
         });
         
         store.showAlert(L("Shift end recorded. Logging out...", "Fin de poste enregistrée. Déconnexion en cours..."), "success");
         
         setTimeout(() => {
            if (store.setShiftStart) store.setShiftStart('');
            if (store.setCurrentOperator) store.setCurrentOperator('');
            localStorage.removeItem('biztrack_operator');
            localStorage.removeItem('biztrack_shift_start');
            window.location.reload();
         }, 2000);
      }
      
      setActualCash('');
      setNote('');
   };

   return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Cash Register', 'Clôture Caisse')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            {L('Daily Audit — Cash Drawer Reconciliation', 'Audit Journalier — Réconciliation du Tiroir-Caisse')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         
         {/* Reconciliation Terminal */}
         <div className="lg:col-span-7 space-y-8">
            <div className="glass-card bg-white p-10 rounded-[56px] border border-navy-100 shadow-sm space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Calculator className="w-32 h-32" />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-navy-50 rounded-3xl border border-navy-100">
                     <p className="text-[8px] font-black uppercase text-blue-gray mb-1 italic">{L('Cash Sales', 'Ventes Cash')}</p>
                     <p className="text-lg font-black text-navy-950 tracking-tighter">{store.formatCurrency(stats.salesCash)}</p>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                     <p className="text-[8px] font-black uppercase text-emerald-600 mb-1 italic">{L('Ledger (+)', 'Ledger (+)')}</p>
                     <p className="text-lg font-black text-emerald-600 tracking-tighter">{store.formatCurrency(stats.ledgerIncome)}</p>
                  </div>
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                     <p className="text-[8px] font-black uppercase text-rose-500 mb-1 italic">{L('Ledger (-)', 'Ledger (-)')}</p>
                     <p className="text-lg font-black text-rose-500 tracking-tighter">-{store.formatCurrency(stats.ledgerExpense)}</p>
                  </div>
                  <div className="p-6 bg-navy-950 rounded-3xl text-white shadow-xl">
                     <p className="text-[8px] font-black uppercase text-white/40 mb-1 italic">{L('Expected', 'Théorique')}</p>
                     <p className="text-lg font-black text-emerald-400 tracking-tighter">{store.formatCurrency(stats.expected)}</p>
                  </div>
               </div>

               <form onSubmit={handleReconcile} className="space-y-8 pt-8 border-t border-navy-50">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest ml-4 italic">{L('Physical Cash Count', 'Somme Physique Comptée')}</p>
                     <div className="relative group">
                        <Wallet className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-navy-950" />
                        <input
                           type="number"
                           required
                           value={actualCash}
                           onChange={e => setActualCash(e.target.value)}
                           className="w-full bg-navy-50 border-2 border-transparent rounded-[32px] pl-20 pr-10 py-8 text-4xl font-black text-navy-950 outline-none focus:border-navy-950 transition-all placeholder:text-blue-gray/20"
                           placeholder="0.00"
                        />
                     </div>
                  </div>

                  {actualCash && (
                     <div className={`p-8 rounded-[40px] flex items-center justify-between animate-fade-in ${discrepancy === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${discrepancy === 0 ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}>
                              {discrepancy === 0 ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{L('Cash Discrepancy', 'Écart de Caisse')}</p>
                              <p className="text-3xl font-black tracking-tighter">{store.formatCurrency(discrepancy)}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
                           {discrepancy === 0 
                              ? L('SYSTEM BALANCED', 'SYSTÈME ÉQUILIBRÉ') 
                              : discrepancy > 0 
                                 ? L('SURPLUS DETECTED', 'SURPLUS DÉTECTÉ') 
                                 : L('SHORTAGE DETECTED', 'MANQUANT DÉTECTÉ')}
                        </span>
                     </div>
                  )}

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest ml-4 italic">{L('Audit Comment', 'Commentaire d\'Audit')}</p>
                     <textarea
                        rows="3"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="w-full bg-navy-50 border-2 border-transparent rounded-[32px] p-8 text-sm font-black text-navy-950 uppercase outline-none focus:border-navy-950 transition-all placeholder:text-blue-gray/20"
                        placeholder={L('Specify the reason for discrepancy or note shift-end details...', 'Précisez la raison de l\'écart ou notez les détails de fin de poste...')}
                     />
                  </div>

                  <button 
                     type="submit" 
                     className="w-full py-8 bg-navy-950 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all active:scale-[0.98]"
                  >
                     {editingRecord ? L('Update Reconciliation', 'Mettre à jour la Clôture') : L('Confirm & Validate Register', 'Confirmer & Valider la Caisse')} <TrendingUp className="w-5 h-5" />
                  </button>
               </form>
            </div>
         </div>

         {/* History Terminal */}
         <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 mb-2 px-4">
               <History className="w-5 h-5 text-blue-gray" />
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-navy-950 italic">{L('Audit Archives', 'Archives d\'Audit')}</h3>
            </div>

            <div className="space-y-4">
               {history.map((r, i) => (
                  <div key={i} className="glass-card bg-white p-8 rounded-[40px] border border-navy-50 shadow-sm group hover:border-emerald-500 transition-all flex items-center justify-between">
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <p className="text-xs font-black text-navy-950 uppercase tracking-tighter">
                              {new Date(r.date).toLocaleDateString()}
                           </p>
                           <span className="w-1 h-1 rounded-full bg-blue-gray/30"></span>
                           <p className="text-[10px] font-black text-blue-gray uppercase">{new Date(r.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{r.operator || 'SYSTEM ADMIN'}</p>
                        {r.note && <p className="text-[10px] text-blue-gray italic font-bold mt-3 leading-relaxed border-l-2 border-navy-50 pl-4">"{r.note}"</p>}
                     </div>
                     
                     <div className="text-right space-y-4">
                        <div>
                           <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Variance', 'Écart')}</p>
                           <p className={`text-xl font-black ${r.discrepancy === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {r.discrepancy > 0 ? '+' : ''}{store.formatCurrency(r.discrepancy)}
                           </p>
                        </div>
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEdit(r)} className="p-3 bg-navy-50 rounded-xl text-navy-950 hover:bg-navy-950 hover:text-white transition-all"><Activity className="w-4 h-4" /></button>
                           <button onClick={() => handleDelete(r)} className="p-3 bg-rose-50 rounded-xl text-rose-500 hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </div>
                  </div>
               ))}
               {history.length === 0 && (
                  <div className="py-20 text-center glass-card border-dashed border-2 border-navy-100 opacity-20">
                     <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">{L('No archives', 'Aucune archive')}</p>
                  </div>
               )}
            </div>
         </div>

      </div>
    </div>
   );
}
