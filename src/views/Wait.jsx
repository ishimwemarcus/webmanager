import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Clock, 
  Trash2, 
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Filter,
  Layers,
  ChevronDown,
  Printer,
  MessageSquare
} from 'lucide-react';

export default function Wait() {
  const store = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('DEBTS'); // 'CREDITS' or 'DEBTS'
  
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];
  const sales = store.getSales ? store.getSales() : [];

  // Grouping Credits (Reliquats)
  const creditMap = useMemo(() => {
    const map = {};
    waitCredits.forEach(w => {
      const key = w.client?.toLowerCase() || 'unknown';
      if (!map[key]) map[key] = { client: w.client, records: [], total: 0 };
      map[key].records.push(w);
      map[key].total += parseFloat(w.balance) || 0;
    });
    return Object.values(map).sort((a,b) => b.total - a.total);
  }, [waitCredits]);

  // Grouping Debts (Impayés)
  const debtMap = useMemo(() => {
    const map = {};
    sales.filter(s => (parseFloat(s.amount)||0) > (parseFloat(s.paid)||0)).forEach(s => {
      const key = s.client?.toLowerCase() || 'unknown';
      if (!map[key]) map[key] = { client: s.client, records: [], total: 0, phone: s.phone || 'none' };
      map[key].records.push(s);
      map[key].total += (parseFloat(s.amount)||0) - (parseFloat(s.paid)||0);
    });
    return Object.values(map).sort((a,b) => b.total - a.total);
  }, [sales]);

  const totalCreditSum = creditMap.reduce((s, c) => s + c.total, 0);
  const totalDebtSum = debtMap.reduce((s, d) => s + d.total, 0);

  const handleMarkUsed = (record) => {
    store.updateRecord({ ...record, balance: 0, status: 'used' });
  };

  const confirmDelete = (record) => {
    store.showConfirm("Voulez-vous supprimer cet enregistrement du registre ?", () => {
      store.deleteRecord(record);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Grand Livre Clients
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            Audit des Soldes — Passifs & Actifs Clients
          </p>
        </div>
      </div>

      {/* Dual Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <button 
           onClick={() => setActiveTab('CREDITS')}
           className={`glass-card p-8 rounded-[48px] border-2 flex items-center gap-8 transition-all shadow-sm text-left ${activeTab === 'CREDITS' ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-transparent hover:border-emerald-100'}`}
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner ${activeTab === 'CREDITS' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
            <TrendingUp className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Crédits (Reliquats)</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">{store.formatCurrency(totalCreditSum)}</p>
            <p className="text-[9px] font-black text-emerald-600 uppercase mt-1 tracking-widest">{creditMap.length} Clients Concernés</p>
          </div>
        </button>

        <button 
           onClick={() => setActiveTab('DEBTS')}
           className={`glass-card p-8 rounded-[48px] border-2 flex items-center gap-8 transition-all shadow-sm text-left ${activeTab === 'DEBTS' ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-500/10' : 'bg-white border-transparent hover:border-rose-100'}`}
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner ${activeTab === 'DEBTS' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
            <TrendingDown className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Dettes (Impayés)</p>
            <p className="text-4xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(totalDebtSum)}</p>
            <p className="text-[9px] font-black text-rose-500 uppercase mt-1 tracking-widest">{debtMap.length} Débiteurs Actifs</p>
          </div>
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-xs font-black uppercase tracking-[0.4em] text-navy-950 italic">
              Manifeste des {activeTab === 'CREDITS' ? 'Crédits' : 'Dettes'}
           </h3>
           <div className="flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-blue-gray" />
              <span className="text-[9px] font-black uppercase text-blue-gray tracking-widest">Filtrage Intelligent</span>
           </div>
        </div>

        {activeTab === 'CREDITS' ? (
           creditMap.length > 0 ? (
              creditMap.map((c, i) => (
                 <div key={i} className="glass-card bg-white rounded-[40px] border border-emerald-50 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-emerald-50/10">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-navy-950 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                             {c.client?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">{c.client}</h3>
                             <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mt-1">Crédit Indexé</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">Solde Positif</p>
                          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{store.formatCurrency(c.total)}</p>
                       </div>
                    </div>
                    <div className="divide-y divide-navy-50">
                       {c.records.map((r, j) => (
                          <div key={j} className="flex items-center justify-between p-6 hover:bg-emerald-50/20 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg"></div>
                                <div>
                                   <p className="text-xs font-black text-navy-950 uppercase">{r.note || 'Reliquat Automatique'}</p>
                                   <p className="text-[9px] font-black text-blue-gray uppercase opacity-40">{new Date(r.date).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <p className="text-lg font-black text-emerald-600">{store.formatCurrency(r.balance)}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              ))
           ) : (
              <div className="py-32 text-center glass-card border-dashed border-2 border-emerald-100 opacity-20">
                 <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">Aucun crédit client</p>
              </div>
           )
        ) : (
           debtMap.length > 0 ? (
              debtMap.map((c, i) => (
                 <div key={i} className="glass-card bg-white rounded-[40px] border border-rose-50 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-rose-50/10">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                             {c.client?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">{c.client}</h3>
                             <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mt-1 italic">{c.phone || 'Aucun contact indexé'}</p>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-2">
                          <div>
                             <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">Passif Client</p>
                             <p className="text-3xl font-black text-rose-600 tracking-tighter">{store.formatCurrency(c.total)}</p>
                          </div>
                          <button 
                            onClick={() => {
                               const summary = {
                                  client: c.client,
                                  phone: c.phone,
                                  name: "RELEVÉ DE DETTE",
                                  amount: c.total,
                                  paid: 0,
                                  date: new Date().toISOString()
                               };
                               import('../utils/Reporter').then(m => m.printThermalReceipt(summary, store.currentOperator, store.formatCurrency));
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                          >
                             <Printer className="w-3 h-3" /> Imprimer Relevé
                          </button>
                       </div>
                    </div>
                    <div className="divide-y divide-navy-50">
                       {c.records.map((r, j) => (
                          <div key={j} className="flex items-center justify-between p-6 hover:bg-rose-50/20 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg"></div>
                                <div>
                                   <p className="text-xs font-black text-navy-950 uppercase">Vente Impayée : {r.name}</p>
                                   <p className="text-[9px] font-black text-blue-gray uppercase opacity-40">{new Date(r.date).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-black text-blue-gray uppercase italic">Reste à payer</p>
                                <p className="text-lg font-black text-rose-600">{store.formatCurrency((parseFloat(r.amount)||0) - (parseFloat(r.paid)||0))}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))
           ) : (
              <div className="py-32 text-center glass-card border-dashed border-2 border-rose-100 opacity-20">
                 <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">Aucune dette active</p>
              </div>
           )
        )}
      </div>

      {/* Protocol Banner */}
      <div className="glass-card bg-navy-950 p-8 rounded-[40px] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden">
         <div className="absolute bottom-[-50%] right-[-10%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
         <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
            <Layers className="w-7 h-7 text-emerald-400" />
         </div>
         <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Architecture de Double Inscription</p>
            <p className="text-[11px] font-bold text-white/40 leading-relaxed max-w-2xl">
               Le système synchronise les reliquats (Crédits) et les impayés (Dettes) en temps réel. Cette vision bifocale permet une gestion optimale des liquidités et une réduction des risques d'insolvabilité.
            </p>
         </div>
      </div>

    </div>
  );
}
