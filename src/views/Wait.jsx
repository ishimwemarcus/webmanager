import React from 'react';
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
  ArrowRight
} from 'lucide-react';

export default function Wait() {
  const store = useStore();
  const { t } = useLanguage();
  const waitCredits = store.getWaitCredits ? store.getWaitCredits() : [];
  const sales = store.getSales ? store.getSales() : [];

  const clientMap = waitCredits.reduce((acc, w) => {
    const key = w.client?.toLowerCase() || 'unknown';
    if (!acc[key]) {
      const lastSale = sales.find(s => s.client?.toLowerCase() === key);
      acc[key] = { client: w.client, records: [], total: 0, phone: lastSale?.phone || '' };
    }
    acc[key].records.push(w);
    acc[key].total += parseFloat(w.balance) || 0;
    return acc;
  }, {});

  const clients = Object.values(clientMap).sort((a,b) => b.total - a.total);
  const grandTotal = clients.reduce((s, c) => s + c.total, 0);

  const handleMarkUsed = (record) => {
    store.updateRecord({ ...record, balance: 0, status: 'used' });
  };

  const confirmDelete = (record) => {
    store.showConfirm("Voulez-vous supprimer ce reliquat du registre ?", () => {
      store.deleteRecord(record);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Reliquats Clients
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            Gestion des Crédits — Rétention de Valeur
          </p>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Wallet className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Solde Global Client</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">{store.formatCurrency(grandTotal)}</p>
          </div>
        </div>

        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-navy-50 text-navy-950 flex items-center justify-center shadow-inner">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">Comptes Débiteurs</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">
              {clients.filter(c => c.total > 0).length} <span className="text-xs font-black">Actifs</span>
            </p>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-6">
        {clients.length > 0 ? (
          clients.map((c, i) => (
            <div key={i} className="glass-card bg-white rounded-[40px] border border-emerald-50 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-50 bg-emerald-50/10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-navy-950 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                       {c.client?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-navy-950 uppercase tracking-tighter">{c.client}</h3>
                       <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mt-1 italic">{c.phone || 'Aucun contact indexé'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1">Position Nette</p>
                    <p className={`text-3xl font-black tracking-tighter ${c.total > 0 ? 'text-emerald-600' : 'text-blue-gray/20'}`}>
                       {store.formatCurrency(c.total)}
                    </p>
                 </div>
              </div>

              <div className="divide-y divide-navy-50">
                 {c.records.map((r, j) => (
                    <div key={j} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-emerald-50/20 transition-all gap-4">
                       <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${(parseFloat(r.balance)||0) > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-navy-100'}`}></div>
                          <div>
                             <p className="text-xs font-black text-navy-950 uppercase tracking-tight">{r.note || 'Reliquat Automatique'}</p>
                             <p className="text-[9px] font-black text-blue-gray uppercase tracking-widest mt-0.5 opacity-60 italic">{new Date(r.date).toLocaleDateString()} — {new Date(r.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between md:justify-end gap-10">
                          <div className="text-center md:text-right">
                             <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Initial</p>
                             <p className="text-xs font-black text-navy-950">{store.formatCurrency(r.amount)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">Réserve</p>
                             <p className={`text-xl font-black ${(parseFloat(r.balance)||0) > 0 ? 'text-emerald-600' : 'text-blue-gray/20 line-through'}`}>
                                {store.formatCurrency(r.balance || 0)}
                             </p>
                          </div>
                          <div className="flex gap-2">
                             {(parseFloat(r.balance)||0) > 0 && (
                                <button
                                  onClick={() => handleMarkUsed(r)}
                                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                  title="Marquer comme utilisé"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                             )}
                             <button
                               onClick={() => confirmDelete(r)}
                               className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                               title="Supprimer"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center glass-card border-dashed border-2 border-emerald-100 opacity-20">
             <Clock className="w-20 h-20 mx-auto text-blue-gray mb-6" />
             <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">Aucun reliquat client détecté</p>
          </div>
        )}
      </div>

      {/* Protocol Banner */}
      <div className="glass-card bg-navy-950 p-8 rounded-[40px] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden">
         <div className="absolute bottom-[-50%] right-[-10%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
         <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
         </div>
         <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Protocole Opérationnel : Rétention</p>
            <p className="text-[11px] font-bold text-white/40 leading-relaxed max-w-2xl">
               Le système suit automatiquement les soldes clients pour un couplage futur lors des transactions. Les actifs restent actifs jusqu'à leur utilisation lors du passage en caisse.
            </p>
         </div>
      </div>

    </div>
  );
}
