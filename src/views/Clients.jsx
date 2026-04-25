import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Award, AlertTriangle, TrendingUp, Star } from 'lucide-react';

export default function Clients() {
  const store = useStore();
  const { t } = useLanguage();
  
  const sales = store.getSales ? store.getSales() : [];
  
  const clientData = useMemo(() => {
    const clients = {};
    sales.forEach(sale => {
      const clsName = (sale.client || 'Client Standard').toLowerCase();
      if(!clients[clsName]) clients[clsName] = { name: sale.client || 'Client Standard', totalSpent: 0, transactions: 0, currentDebt: 0 };
      
      clients[clsName].totalSpent += (parseFloat(sale.amount) || 0);
      clients[clsName].transactions += 1;
    });

    Object.keys(clients).forEach(k => {
      clients[k].currentDebt = store.getClientDebtBalance ? store.getClientDebtBalance(k) : 0;
    });

    return Object.values(clients).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [sales, store]);

  const totalClients = clientData.length;
  const vipCount = clientData.filter(c => c.totalSpent > 1000 && c.transactions > 2).length;
  const riskCount = clientData.filter(c => c.currentDebt > c.totalSpent * 0.3).length;

  return (
    <div className="max-w-full mx-auto min-h-[calc(100vh-6rem)] bg-[#064E3B] rounded-[24px] p-4 md:p-8 space-y-4 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 fade-in-up">
      <div className="border-b border-navy-50 pb-8 flex items-end justify-between gap-6 no-print">
        <div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter text-white leading-none">{t('clientsDatabase')}</h1>
          <h2 className="text-sm font-bold text-[#F59E0B] tracking-[0.2em] uppercase mt-1">{t('loyaltyProgram')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="glass-card p-6 flex items-center gap-6 bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase text-blue-400 tracking-widest">Base Active</p>
            <p className="text-3xl font-black text-white">{totalClients} <span className="text-sm">Clients</span></p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-6 bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="w-14 h-14 bg-[#F59E0B]/10 text-[#F59E0B] rounded-2xl flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase text-[#F59E0B] tracking-widest">Membres VIP</p>
            <p className="text-3xl font-black text-white">{vipCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-6 bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase text-red-400 tracking-widest">Comptes à Risque</p>
            <p className="text-3xl font-black text-white">{riskCount}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-2xl">

        {/* ✅ MOBILE: Card List */}
        <div className="block lg:hidden divide-y divide-navy-50">
          {clientData.length > 0 ? clientData.map((c, i) => {
            const isVIP = c.totalSpent > 1000 && c.transactions > 2;
            const isRisk = c.currentDebt > c.totalSpent * 0.3 && c.currentDebt > 0;
            return (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-black uppercase tracking-tight text-navy-brand text-sm">{c.name}</p>
                  {isRisk ? (
                    <span className="bg-red-50 text-red-500 px-2 py-1 rounded-full text-xs font-black uppercase border border-red-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Risk</span>
                  ) : isVIP ? (
                    <span className="bg-gold/10 text-gold px-2 py-1 rounded-full text-xs font-black uppercase border border-gold/20 flex items-center gap-1"><Award className="w-3 h-3"/>VIP</span>
                  ) : (
                    <span className="text-blue-gray border border-blue-gray/10 px-2 py-1 rounded-full text-xs font-black uppercase">Standard</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-navy-50 rounded-lg p-2 text-center">
                    <p className="text-xs md:text-sm md:text-xs text-blue-gray uppercase font-black">Transactions</p>
                    <p className="text-xs font-black text-charcoal">{c.transactions}</p>
                  </div>
                  <div className="bg-navy-50 rounded-lg p-2 text-center">
                    <p className="text-xs md:text-sm md:text-xs text-blue-gray uppercase font-black">Total</p>
                    <p className="text-xs font-black text-navy-900">{store.formatCurrency(c.totalSpent)}</p>
                  </div>
                  <div className="bg-navy-50 rounded-lg p-2 text-center">
                    <p className="text-xs md:text-sm md:text-xs text-blue-gray uppercase font-black">Debt</p>
                    <p className={`text-xs font-black ${c.currentDebt > 0 ? 'text-red-500' : 'text-success-pro'}`}>{c.currentDebt > 0 ? store.formatCurrency(c.currentDebt) : 'Cleared'}</p>
                  </div>
                </div>
                <a 
                   href={`#/portal/${encodeURIComponent(c.name)}/none`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="mt-3 block w-full py-2 text-center bg-navy-brand text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
                >
                   Ouvrir Portail Client
                </a>
              </div>
            );
          }) : (
            <div className="p-6 md:p-12 text-center text-blue-gray font-black uppercase tracking-widest text-sm">No Client Records Found</div>
          )}
        </div>

        {/* ✅ DESKTOP: Full Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-xs font-black uppercase tracking-widest text-white/50">
                <th className="p-6">Client / Entité</th>
                <th className="p-6 text-center">Transactions</th>
                <th className="p-6 text-right">Dépenses Totales</th>
                <th className="p-6 text-right">Dette Active</th>
                <th className="p-6 text-center">Statut (I.A)</th>
                <th className="p-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clientData.map((c, i) => {
                 const isVIP = c.totalSpent > 1000 && c.transactions > 2;
                 const isRisk = c.currentDebt > c.totalSpent * 0.3 && c.currentDebt > 0;
                 return (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 font-black uppercase tracking-tight text-[#BEF264]">{c.name}</td>
                      <td className="p-6 text-center font-bold text-white/40">{c.transactions}</td>
                      <td className="p-6 text-right font-black text-white">{store.formatCurrency(c.totalSpent)}</td>
                      <td className={`p-6 text-right font-black ${c.currentDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>{c.currentDebt > 0 ? store.formatCurrency(c.currentDebt) : 'À Jour'}</td>
                      <td className="p-6 text-center text-xs md:text-sm font-black uppercase tracking-widest flex items-center justify-center">
                         {isRisk ? (
                           <span className="bg-red-400/10 text-red-400 px-4 py-2 rounded-full flex items-center gap-2 border border-red-400/20"><AlertTriangle className="w-3 h-3"/> {t('riskStatus')}</span>
                         ) : isVIP ? (
                           <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-4 py-2 rounded-full flex items-center gap-2 border border-[#F59E0B]/20"><Award className="w-3 h-3"/> {t('vipStatus')}</span>
                         ) : (
                           <span className="text-white/40 border border-white/10 px-4 py-2 rounded-full">Standard</span>
                         )}
                      </td>
                      <td className="p-6 text-center">
                         <a 
                           href={`#/portal/${encodeURIComponent(c.name)}/none`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="px-4 py-2 bg-navy-brand/20 text-navy-brand border border-navy-brand/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-brand hover:text-white transition-all"
                         >
                           Portal
                         </a>
                      </td>
                    </tr>
                 );
              })}
              {clientData.length === 0 && <tr><td colSpan="5" className="p-6 md:p-20 text-center text-white/40 font-black uppercase tracking-widest">No Client Records Found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
