import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowLeft
} from 'lucide-react';

export default function ClientPortal() {
  const { clientName, phone } = useParams();
  const store = useStore();
  const decodedName = decodeURIComponent(clientName || '');
  
  const allSales = store.getSales();
  const allWait = store.getWaitCredits();

  const { clientSales, clientCredits, totalSpent, totalPaid, currentDebt, currentCredit } = useMemo(() => {
    const decodedPhone = phone === 'none' ? '' : decodeURIComponent(phone || '');
    
    const s = allSales.filter(sale => 
      (sale.client || '').toLowerCase() === decodedName.toLowerCase() &&
      (sale.phone || '') === (decodedPhone || '')
    );
    const w = allWait.filter(wait => 
      (wait.client || '').toLowerCase() === decodedName.toLowerCase() && 
      (wait.phone || '') === (decodedPhone || '') &&
      wait.status === 'active'
    );
    
    const spent = s.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const paid = s.reduce((acc, curr) => acc + (parseFloat(curr.paid) || 0), 0);
    const debt = Math.max(0, spent - paid);
    const credit = w.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);

    return {
      clientSales: s,
      clientCredits: w,
      totalSpent: spent,
      totalPaid: paid,
      currentDebt: debt,
      currentCredit: credit
    };
  }, [allSales, allWait, decodedName]);

  if (!decodedName) return (
    <div className="min-h-[calc(100vh-6rem)] bg-navy-950 flex items-center justify-center p-6 text-center">
      <p className="text-white/40 font-black uppercase tracking-widest">Identité Client Invalide</p>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#F8FAFC] pb-20">
      {/* Premium Header */}
      <div className="bg-navy-950 text-white p-8 md:p-12 rounded-b-[64px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-navy-brand/20 blur-[100px] rounded-full"></div>
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex items-center justify-between">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all" onClick={() => window.history.back()}>
                <ArrowLeft className="w-6 h-6 text-white" />
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs md:text-sm font-black uppercase tracking-widest opacity-60">Portail Sécurisé</span>
             </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{decodedName}</h1>
            <p className="text-sm font-bold text-white/40 uppercase tracking-[0.4em]">Tableau de Bord Client</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] backdrop-blur-md">
               <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/40 mb-1">Total Achats</p>
               <p className="text-xl font-black">{store.formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] backdrop-blur-md">
               <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/40 mb-1">Total Payé</p>
               <p className="text-xl font-black text-emerald-400">{store.formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[32px] backdrop-blur-md">
               <p className="text-xs md:text-sm font-black uppercase tracking-widest text-rose-400 mb-1">Dette Actuelle</p>
               <p className="text-xl font-black text-rose-400">{store.formatCurrency(currentDebt)}</p>
            </div>
            <div className="bg-navy-brand/10 border border-navy-brand/20 p-5 rounded-[32px] backdrop-blur-md">
               <p className="text-xs md:text-sm font-black uppercase tracking-widest text-navy-brand mb-1">Crédit (Balance)</p>
               <p className="text-xl font-black text-navy-brand">{store.formatCurrency(currentCredit)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 space-y-8 relative z-20">
        {/* Active Transactions */}
        <div className="bg-white rounded-[40px] shadow-xl border border-navy-50 overflow-hidden">
           <div className="p-8 border-b border-navy-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-navy-brand">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-widest text-navy-950 text-sm">Historique des Transactions</h3>
              </div>
              <span className="text-xs md:text-sm font-black text-blue-gray/40">{clientSales.length} Achats</span>
           </div>
           
           <div className="divide-y divide-navy-50">
              {clientSales.map((sale, i) => (
                <div key={i} className="p-8 flex items-center justify-between hover:bg-navy-50/30 transition-colors">
                   <div className="flex items-center gap-6">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-black text-navy-950">{new Date(sale.date).getDate()}</p>
                        <p className="text-xs md:text-sm font-black uppercase text-blue-gray">{new Date(sale.date).toLocaleString('default', { month: 'short' })}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-navy-brand tracking-tight">{sale.name}</p>
                        <p className="text-xs md:text-sm font-bold text-blue-gray opacity-60">Quantité: {sale.quantity}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-navy-950">{store.formatCurrency(sale.amount)}</p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        {sale.paid >= sale.amount ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span className={`text-xs font-black uppercase tracking-widest ${sale.paid >= sale.amount ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {sale.paid >= sale.amount ? 'Réglé' : 'Partiel'}
                        </span>
                      </div>
                   </div>
                </div>
              ))}
              {clientSales.length === 0 && (
                <div className="p-6 md:p-20 text-center space-y-4">
                   <Package className="w-12 h-12 text-navy-100 mx-auto" />
                   <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray">Aucune transaction trouvée</p>
                </div>
              )}
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-navy-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-2 flex-shrink-0 shadow-xl">
              <QrCode className="w-full h-full text-navy-950" />
           </div>
           <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black uppercase tracking-tight">Accès Instantané</h4>
              <p className="text-xs text-white/60 font-bold leading-relaxed">Scannez le QR code sur votre ticket à chaque achat pour mettre à jour votre tableau de bord et suivre vos crédits en temps réel.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
