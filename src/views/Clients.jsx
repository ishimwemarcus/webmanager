import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Award, AlertTriangle, TrendingUp, Star, QrCode, Search, Filter, ShieldCheck, ChevronRight, ExternalLink } from 'lucide-react';

export default function Clients() {
  const store = useStore();
  const { t, L } = useLanguage();
  const [showPortalQR, setShowPortalQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const sales = store.getSales ? store.getSales() : [];
  
  const clientData = useMemo(() => {
    const clients = {};
    sales.forEach(sale => {
      const name = sale.client || L('Standard Client', 'Client Standard');
      const phone = sale.phone || 'none';
      const key = `${name.toLowerCase()}|${phone}`;
      
      if(!clients[key]) {
        clients[key] = { 
          name, 
          phone,
          totalSpent: 0, 
          totalPaid: 0,
          transactions: 0, 
          currentDebt: 0 
        };
      }
      
      clients[key].totalSpent += (parseFloat(sale.amount) || 0);
      clients[key].totalPaid += (parseFloat(sale.paid) || 0);
      clients[key].transactions += 1;
    });

    Object.keys(clients).forEach(k => {
      const c = clients[k];
      clients[k].currentDebt = store.getClientDebtBalance ? store.getClientDebtBalance(c.name, c.phone) : 0;
    });

    return Object.values(clients)
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
      .sort((a,b) => b.totalSpent - a.totalSpent);
  }, [sales, store, searchQuery, L]);

  const totalClients = clientData.length;
  const vipCount = clientData.filter(c => c.totalSpent > 1000 && c.transactions > 2).length;
  const riskCount = clientData.filter(c => c.currentDebt > c.totalSpent * 0.3).length;

  const portalUrl = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/#/portal`;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4 lg:px-0">
      
      {/* Premium Header */}
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            {L('Client Base', 'Base Clients')}
          </h1>
          <p className="text-[10px] font-black text-blue-gray tracking-[0.4em] uppercase italic opacity-60">
            {L('Loyalty & Risk Analysis — Loyalty Program', 'Fidélisation & Analyse de Risque — Programme Loyalty')}
          </p>
        </div>
        <button 
          onClick={() => setShowPortalQR(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-navy-950 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95"
        >
          <QrCode className="w-5 h-5 text-emerald-400" /> {L('Generate Client Portal QR', 'Générer QR Portail Client')}
        </button>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('Database', 'Base de Données')}</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">{totalClients} <span className="text-xs font-black">{L('Clients', 'Clients')}</span></p>
          </div>
        </div>

        <div className="glass-card bg-white p-8 rounded-[48px] border-emerald-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Star className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('VIP Elite', 'Élite VIP')}</p>
            <p className="text-4xl font-black text-navy-950 tracking-tighter">{vipCount}</p>
          </div>
        </div>

        <div className="glass-card bg-white p-8 rounded-[48px] border-rose-100 flex items-center gap-8 group hover:scale-[1.02] transition-all shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray mb-1 italic">{L('Risk Analysis', 'Analyse de Risque')}</p>
            <p className="text-4xl font-black text-rose-600 tracking-tighter">{riskCount}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative group no-print">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          type="text"
          placeholder={L('Search a client or a number...', 'Rechercher un client ou un numéro...')}
          className="w-full bg-white border border-emerald-100 rounded-[28px] pl-16 pr-6 py-5 text-sm font-black text-navy-950 placeholder:text-blue-gray/30 shadow-xl outline-none focus:border-emerald-500 transition-all uppercase"
        />
      </div>

      {/* Client Registry List */}
      <div className="space-y-4">
        {clientData.length > 0 ? (
          clientData.map((c, i) => {
            const isVIP = c.totalSpent > 1000 && c.transactions > 2;
            const isRisk = c.currentDebt > c.totalSpent * 0.3 && c.currentDebt > 0;
            return (
              <div key={i} className="glass-card bg-white border border-emerald-50 p-6 hover:border-emerald-400 transition-all group shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black ${isRisk ? 'bg-rose-50 text-rose-500' : isVIP ? 'bg-emerald-50 text-emerald-600' : 'bg-navy-50 text-navy-950'}`}>
                      {isRisk ? <AlertTriangle className="w-8 h-8" /> : isVIP ? <Award className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-navy-950 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">{c.name}</h3>
                      <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic">{c.phone === 'none' ? L('No contact indexed', 'Aucun contact indexé') : c.phone}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 max-w-2xl text-center md:text-left">
                   <div>
                      <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Transactions', 'Transactions')}</p>
                      <p className="text-xs font-black text-navy-950">{c.transactions} {L('Sales', 'Ventes')}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Total Spent', 'Dépenses Totales')}</p>
                      <p className="text-xs font-black text-navy-950">{store.formatCurrency(c.totalSpent)}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest mb-1 italic">{L('Active Debt', 'Dette Active')}</p>
                      <p className={`text-xs font-black ${c.currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {c.currentDebt > 0 ? store.formatCurrency(c.currentDebt) : L('Up to date', 'À Jour')}
                      </p>
                   </div>
                   <div className="hidden md:flex items-center justify-center">
                      {isRisk ? (
                         <span className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">{L('Risk Alert', 'Risque Alert')}</span>
                      ) : isVIP ? (
                         <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">{L('Premium VIP', 'Premium VIP')}</span>
                      ) : (
                         <span className="px-4 py-2 bg-navy-50 text-blue-gray rounded-xl text-[8px] font-black uppercase tracking-widest">{L('Standard', 'Standard')}</span>
                      )}
                   </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                   <a 
                     href={`#/portal/${encodeURIComponent(c.name)}/${encodeURIComponent(c.phone)}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 px-6 py-4 bg-navy-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                   >
                     <ExternalLink className="w-4 h-4 text-emerald-400" /> {L('Portal Access', 'Accès Portail')}
                   </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-32 text-center glass-card border-dashed border-2 border-emerald-100 opacity-20">
             <Users className="w-20 h-20 mx-auto text-blue-gray mb-6" />
             <p className="text-xs font-black uppercase text-blue-gray tracking-[0.5em]">{L('No clients found in the registry', 'Aucun client trouvé dans le registre')}</p>
          </div>
        )}
      </div>

      {/* Portal QR Modal */}
      {showPortalQR && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={() => setShowPortalQR(false)}>
           <div className="bg-white p-12 rounded-[56px] shadow-3xl max-w-sm w-full text-center space-y-8 animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter leading-none">{L('Store Poster', 'Affiche Boutique')}</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest">{L('Client Consultation Space', 'Espace Consultation Client')}</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-[48px] border-4 border-emerald-100 shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent"></div>
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`} 
                   alt="Portal QR"
                   className="w-full aspect-square rounded-[32px] mix-blend-multiply relative z-10"
                 />
              </div>

              <div className="space-y-4">
                 <p className="text-[11px] font-bold text-navy-950/40 leading-relaxed px-4 italic">
                    {L('Scan to access the portal and consult your transactions in real time.', 'Scannez pour accéder au portail et consulter vos transactions en temps réel.')}
                 </p>
                 <button 
                   onClick={() => window.print()}
                   className="w-full py-5 bg-navy-950 text-white font-black rounded-3xl shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest text-[10px] active:scale-95 flex items-center justify-center gap-3"
                 >
                   <TrendingUp className="w-4 h-4 text-emerald-400" /> {L('Print Poster', 'Imprimer l\'Affiche')}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
