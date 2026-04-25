import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Award, AlertTriangle, TrendingUp, Star, QrCode } from 'lucide-react';

export default function Clients() {
  const store = useStore();
  const { t } = useLanguage();
  const [showPortalQR, setShowPortalQR] = React.useState(false);
  
  const sales = store.getSales ? store.getSales() : [];
  
  const clientData = useMemo(() => {
    const clients = {};
    sales.forEach(sale => {
      const name = sale.client || 'Client Standard';
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

    return Object.values(clients).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [sales, store]);

  const totalClients = clientData.length;
  const vipCount = clientData.filter(c => c.totalSpent > 1000 && c.transactions > 2).length;
  const riskCount = clientData.filter(c => c.currentDebt > c.totalSpent * 0.3).length;

  const portalUrl = `${window.location.origin}${window.location.pathname}#/portal`;

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">{t('clientsDatabase')}</h1>
          <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase mt-1">{t('loyaltyProgram')}</h2>
        </div>
        <button 
          onClick={() => setShowPortalQR(true)}
          className="px-8 py-4 bg-navy-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-navy-brand transition-all shadow-2xl shadow-navy-950/20 active:scale-95"
        >
          <QrCode className="w-5 h-5" /> Générer QR Portail Client
        </button>
      </div>

      {showPortalQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/60 backdrop-blur-3xl p-4 no-print animate-fade-in" onClick={() => setShowPortalQR(false)}>
           <div className="bg-white p-12 rounded-[56px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-w-sm w-full text-center space-y-8 scale-in" onClick={e => e.stopPropagation()}>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter">Affiche Boutique</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest">Espace de Consultation Client</p>
              </div>
              
              <div className="bg-navy-50 p-6 rounded-[40px] border-4 border-navy-100 shadow-inner">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`} 
                   alt="Portal QR"
                   className="w-full aspect-square rounded-[32px] mix-blend-multiply"
                 />
              </div>

              <div className="space-y-4">
                 <p className="text-xs font-bold text-navy-950/60 leading-relaxed px-4 italic">
                   "Affichez ce code en boutique pour permettre à vos clients de consulter leurs transactions en un scan."
                 </p>
                 <button 
                   onClick={() => window.print()}
                   className="w-full py-4 bg-navy-brand text-white font-black rounded-2xl shadow-xl hover:bg-navy-900 transition-all uppercase tracking-widest text-[10px]"
                 >
                   Imprimer l'Affiche
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl flex items-center gap-6 group hover:border-navy-brand transition-all">
          <div className="w-16 h-16 bg-navy-brand/10 text-navy-brand rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-blue-gray tracking-widest mb-1 italic">Base de Données</p>
            <p className="text-3xl font-black text-navy-950">{totalClients} <span className="text-sm">Clients</span></p>
          </div>
        </div>
        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl flex items-center gap-6 group hover:border-navy-brand transition-all">
          <div className="w-16 h-16 bg-[#F59E0B]/10 text-[#F59E0B] rounded-2xl flex items-center justify-center">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-blue-gray tracking-widest mb-1 italic">Élite VIP</p>
            <p className="text-3xl font-black text-navy-950">{vipCount}</p>
          </div>
        </div>
        <div className="glass-card p-8 bg-white border border-navy-100 shadow-xl flex items-center gap-6 group hover:border-navy-brand transition-all">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-blue-gray tracking-widest mb-1 italic">Analyse de Risque</p>
            <p className="text-3xl font-black text-rose-600">{riskCount}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-[48px] overflow-hidden border border-navy-100 bg-white shadow-2xl">
        {/* MOBILE: Compact List */}
        <div className="block lg:hidden divide-y divide-navy-50">
          {clientData.length > 0 ? clientData.map((c, i) => {
            const isVIP = c.totalSpent > 1000 && c.transactions > 2;
            const isRisk = c.currentDebt > c.totalSpent * 0.3 && c.currentDebt > 0;
            return (
              <div key={i} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black uppercase tracking-tighter text-navy-950 text-lg">{c.name}</p>
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest">{c.phone === 'none' ? 'Aucun Téléphone' : c.phone}</p>
                  </div>
                  {isRisk ? (
                    <span className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-rose-100 flex items-center gap-1">Risk</span>
                  ) : isVIP ? (
                    <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#F59E0B]/20 flex items-center gap-1">VIP</span>
                  ) : (
                    <span className="text-blue-gray bg-navy-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">Standard</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-navy-50/50 rounded-2xl p-3 text-center border border-navy-100/50">
                    <p className="text-[10px] text-blue-gray uppercase font-black mb-1">Vol.</p>
                    <p className="text-xs font-black text-navy-950">{c.transactions}</p>
                  </div>
                  <div className="bg-navy-50/50 rounded-2xl p-3 text-center border border-navy-100/50">
                    <p className="text-[10px] text-blue-gray uppercase font-black mb-1">Achats</p>
                    <p className="text-xs font-black text-navy-950">{store.formatCurrency(c.totalSpent)}</p>
                  </div>
                  <div className="bg-navy-50/50 rounded-2xl p-3 text-center border border-navy-100/50">
                    <p className="text-[10px] text-blue-gray uppercase font-black mb-1">Dette</p>
                    <p className={`text-xs font-black ${c.currentDebt > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{c.currentDebt > 0 ? store.formatCurrency(c.currentDebt) : 'À Jour'}</p>
                  </div>
                </div>
                <a 
                   href={`#/portal/${encodeURIComponent(c.name)}/${encodeURIComponent(c.phone)}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block w-full py-4 text-center bg-navy-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-navy-900 transition-all"
                >
                   Ouvrir Portail Client
                </a>
              </div>
            );
          }) : (
            <div className="p-20 text-center text-blue-gray font-black uppercase tracking-[0.4em] opacity-20 italic">Aucun Client Trouvé</div>
          )}
        </div>

        {/* DESKTOP: Full Manifest */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-blue-gray">
                <th className="p-8">Client / Téléphone</th>
                <th className="p-8 text-center">Transactions</th>
                <th className="p-8 text-right">Dépenses Totales</th>
                <th className="p-8 text-right">Dette Active</th>
                <th className="p-8 text-center">Statut (Intelligence)</th>
                <th className="p-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {clientData.map((c, i) => {
                 const isVIP = c.totalSpent > 1000 && c.transactions > 2;
                 const isRisk = c.currentDebt > c.totalSpent * 0.3 && c.currentDebt > 0;
                 return (
                    <tr key={i} className="hover:bg-navy-50/30 transition-colors group">
                      <td className="p-8">
                         <p className="font-black uppercase tracking-tight text-navy-950 text-lg group-hover:text-navy-brand transition-colors">{c.name}</p>
                         <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mt-1 italic">{c.phone === 'none' ? 'Aucun contact' : c.phone}</p>
                      </td>
                      <td className="p-8 text-center font-black text-navy-950/60">{c.transactions} <span className="text-[10px]">Ventes</span></td>
                      <td className="p-8 text-right font-black text-navy-950">{store.formatCurrency(c.totalSpent)}</td>
                      <td className={`p-8 text-right font-black ${c.currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{c.currentDebt > 0 ? store.formatCurrency(c.currentDebt) : 'Cleared'}</td>
                      <td className="p-8 text-center">
                         <div className="flex justify-center">
                            {isRisk ? (
                              <span className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-rose-100 flex items-center gap-2 shadow-sm"><AlertTriangle className="w-3.5 h-3.5"/> Risque</span>
                            ) : isVIP ? (
                              <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-4 py-2 rounded-full text-[10px] font-black uppercase border border-[#F59E0B]/20 flex items-center gap-2 shadow-sm"><Award className="w-3.5 h-3.5"/> Premium VIP</span>
                            ) : (
                              <span className="text-blue-gray bg-navy-50 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-navy-100/50">Standard</span>
                            )}
                         </div>
                      </td>
                      <td className="p-8 text-center">
                         <a 
                           href={`#/portal/${encodeURIComponent(c.name)}/${encodeURIComponent(c.phone)}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 px-6 py-3 bg-navy-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-brand transition-all shadow-xl"
                         >
                           Accès Portail
                         </a>
                      </td>
                    </tr>
                 );
              })}
              {clientData.length === 0 && <tr><td colSpan="6" className="p-20 text-center text-blue-gray font-black uppercase tracking-[0.4em] opacity-20 italic">Aucune donnée client indexée</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
