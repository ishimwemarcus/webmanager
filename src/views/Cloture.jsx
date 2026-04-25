import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Calculator, Wallet, CheckCircle2, XCircle, AlertTriangle, TrendingUp, History } from 'lucide-react';

export default function Cloture() {
   const store = useStore();
   const { t } = useLanguage();

   const [actualCash, setActualCash] = useState('');
   const [note, setNote] = useState('');
   const [editingRecord, setEditingRecord] = useState(null);

   const today = new Date().toISOString().split('T')[0];
   const sales = store.getSales();
   const ledger = store.getLedgerManual();

   const stats = useMemo(() => {
      const daySales = sales.filter(s => s.date.startsWith(today));
      const dayLedger = ledger.filter(l => l.date.startsWith(today));

      const salesCash = daySales.reduce((acc, s) => acc + (parseFloat(s.paid) || 0), 0);
      const ledgerIncome = dayLedger.filter(l => l.type === 'receivable').reduce((acc, l) => acc + (parseFloat(l.paid) || parseFloat(l.amount) || 0), 0);
      const ledgerExpense = dayLedger.filter(l => l.type === 'expense').reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);

      const expected = salesCash + ledgerIncome - ledgerExpense;
      return { expected, salesCash, ledgerIncome, ledgerExpense };
   }, [sales, ledger, today]);

   const history = store.getReconciliations();
   const discrepancy = parseFloat(actualCash || 0) - stats.expected;

   const handleEdit = (record) => {
      setEditingRecord(record);
      setActualCash(record.actual.toString());
      setNote(record.note || '');
   };

   const handleDelete = (record) => {
      store.showConfirm("Confirmer la suppression de cette clôture ?", () => {
         store.deleteRecord(record);
         store.showAlert("Clôture supprimée", "success");
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
         store.showAlert("Clôture mise à jour avec succès!");
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
         store.showAlert("Clôture de caisse enregistrée avec succès!");
      }
      
      setActualCash('');
      setNote('');
   };

   const cancelEdit = () => {
      setEditingRecord(null);
      setActualCash('');
      setNote('');
   };

   return (
    <div className="max-w-[1600px] mx-auto min-h-screen space-y-8 pb-20 fade-in-up">
         <div className="border-b border-navy-100 pb-8">
            <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">{t('closeRegister')}</h1>
            <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase mt-1">Audit Journalier du Tiroir-Caisse</h2>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Verification Card */}
            <div className="glass-card rounded-[24px] bg-white shadow-xl border border-navy-100 p-10 space-y-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-navy-brand">
                     <Calculator className="w-6 h-6" />
                     <h3 className="text-xl font-black uppercase tracking-tight text-navy-950">Calcul Théorique (Système)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-navy-50 rounded-[24px] border border-navy-100">
                        <p className="text-[10px] font-black uppercase text-blue-gray mb-1">Ventes Espèces</p>
                        <p className="font-black text-navy-950">{store.formatCurrency(stats.salesCash)}</p>
                     </div>
                     <div className="p-6 bg-navy-50 rounded-[24px] border border-navy-100">
                        <p className="text-[10px] font-black uppercase text-blue-gray mb-1">Entrées Ledger</p>
                        <p className="font-black text-emerald-600">{store.formatCurrency(stats.ledgerIncome)}</p>
                     </div>
                     <div className="p-6 bg-navy-50 rounded-[24px] border border-navy-100">
                        <p className="text-[10px] font-black uppercase text-blue-gray mb-1">Dépenses Sorties</p>
                        <p className="font-black text-rose-600">-{store.formatCurrency(stats.ledgerExpense)}</p>
                     </div>
                     <div className="p-6 bg-navy-900 rounded-[24px] border border-navy-800 shadow-lg">
                        <p className="text-[10px] font-black uppercase text-white/60 mb-1">Solde Attendu</p>
                        <p className="text-xl font-black text-white">{store.formatCurrency(stats.expected)}</p>
                     </div>
                  </div>
               </div>

                <form onSubmit={handleReconcile} className="space-y-8 pt-8 border-t border-navy-100">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black uppercase tracking-tight text-navy-950">{editingRecord ? 'Modifier la Clôture' : 'Nouvelle Clôture'}</h3>
                     {editingRecord && (
                        <button type="button" onClick={cancelEdit} className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 hover:text-red-700">
                           <XCircle className="w-4 h-4" /> Annuler
                        </button>
                     )}
                  </div>
                  <div className="space-y-4">
                     <label className="text-xs font-black uppercase tracking-widest text-navy-400 ml-2">{t('actualCash')}</label>
                     <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-brand"><Wallet className="w-6 h-6" /></span>
                        <input
                           type="number"
                           required
                           value={actualCash}
                           onChange={e => setActualCash(e.target.value)}
                           placeholder="Somme physique comptée..."
                           className="w-full bg-navy-50 border border-navy-100 rounded-[24px] pl-16 pr-6 py-6 text-2xl font-black text-navy-950 outline-none focus:border-navy-brand transition-all"
                        />
                     </div>
                  </div>

                  {actualCash && (
                     <div className={`p-6 rounded-[24px] flex items-center justify-between animate-fade-in ${discrepancy === 0 ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'}`}>
                        <div className="flex items-center gap-4">
                           {discrepancy === 0 ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest">Différence de Caisse</p>
                              <p className="text-xl font-black">{store.formatCurrency(discrepancy)}</p>
                           </div>
                        </div>
                        <p className="text-xs font-bold font-italic uppercase">{discrepancy === 0 ? 'Équilibré' : discrepancy > 0 ? 'Surplus' : 'Manquant'}</p>
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-navy-400 ml-2">Note / Commentaire</label>
                     <textarea
                        rows="2"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="w-full bg-navy-50 border border-navy-100 rounded-3xl p-6 text-sm font-bold text-navy-950 outline-none focus:border-navy-brand transition-all"
                        placeholder="Raison du surplus ou du manque..."
                     />
                  </div>

                  <button type="submit" className="bg-navy-brand text-white font-black w-full py-6 rounded-3xl shadow-xl flex items-center justify-center gap-3 hover:bg-navy-900 transition-all uppercase tracking-widest text-sm">
                     {editingRecord ? 'Mettre à jour la Clôture' : 'Valider la Clôture'} <TrendingUp className="w-5 h-5" />
                  </button>
               </form>
            </div>

            {/* History Area */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 text-navy-400 ml-4">
                  <History className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-navy-950">Archives des Clôtures</h3>
               </div>

               <div className="space-y-4">
                  {history.map((r, i) => (
                     <div key={i} className="bg-white p-8 rounded-[24px] border border-navy-100 shadow-xl flex items-center justify-between group hover:border-navy-brand/20 transition-all">
                        <div className="space-y-1">
                           <p className="text-xs font-black text-navy-950 uppercase tracking-tighter">{new Date(r.date).toLocaleDateString()} - <span className="text-blue-gray">{new Date(r.date).toLocaleTimeString()}</span></p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-navy-brand">{r.operator || 'Admin'}</p>
                           {r.note && <p className="text-[10px] text-blue-gray italic font-bold mt-2">"{r.note}"</p>}
                        </div>
                         <div className="flex items-center gap-6">
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest mb-1">Écart</p>
                               <p className={`text-xl font-black ${r.discrepancy === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {r.discrepancy > 0 ? '+' : ''}{store.formatCurrency(r.discrepancy)}
                               </p>
                            </div>
                            <div className="flex flex-col gap-2">
                               <button onClick={() => handleEdit(r)} className="p-2 bg-navy-50 rounded-xl text-navy-brand hover:bg-navy-brand hover:text-white transition-all"><TrendingUp className="w-4 h-4" /></button>
                               <button onClick={() => handleDelete(r)} className="p-2 bg-rose-50 rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><XCircle className="w-4 h-4" /></button>
                            </div>
                         </div>
                     </div>
                  ))}
                  {history.length === 0 && <div className="p-20 text-center text-blue-gray font-black uppercase tracking-widest opacity-20 border-2 border-dashed border-navy-100 rounded-[40px]">Aucune archive</div>}
               </div>
            </div>
         </div>
      </div>
   );
}
