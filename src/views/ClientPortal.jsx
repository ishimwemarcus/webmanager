import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowLeft,
  CreditCard,
  Wallet,
  Calendar,
  Search,
  ShoppingCart
} from 'lucide-react';

export default function ClientPortal() {
  const { clientName, phone } = useParams();
  const store = useStore();
  const { t, L, lang } = useLanguage();
  const decodedName = decodeURIComponent(clientName || '');
  
  const allSales = store.getSales();
  const allWait = store.getWaitCredits();

  const { clientSales, totalSpent, totalPaid, currentDebt, currentCredit } = useMemo(() => {
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

    const history = [
      ...s.map(sale => ({ ...sale, timelineType: 'sale' })),
      ...w.map(wait => ({ ...wait, timelineType: 'credit' }))
    ].sort((a,b) => new Date(b.date) - new Date(a.date));

    return {
      clientSales: history,
      totalSpent: spent,
      totalPaid: paid,
      currentDebt: debt,
      currentCredit: credit
    };
  }, [allSales, allWait, decodedName, phone]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchPhone, setSearchPhone] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    window.location.hash = `#/portal/${encodeURIComponent(searchTerm)}/${encodeURIComponent(searchPhone || 'none')}`;
  };

  if (!decodedName) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-navy-brand/10 blur-[120px] rounded-full animate-pulse-gentle"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full animate-pulse-gentle delay-700"></div>

      <div className="max-w-md w-full glass-card bg-white/80 backdrop-blur-3xl border border-white p-10 md:p-12 rounded-[56px] shadow-2xl relative z-10 scale-in">
        <div className="flex flex-col items-center text-center space-y-6 mb-10">
           <div className="w-24 h-24 bg-navy-brand rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl animate-bounce-gentle">
              <ShieldCheck className="w-12 h-12" />
           </div>
           <div>
              <h1 className="text-4xl font-black text-navy-950 uppercase tracking-tighter leading-none">{L('Client Space', 'Espace Client')}</h1>
              <p className="text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] mt-2 italic">{L('Secure MARC Consultation', 'Consultation Sécurisée MARC')}</p>
           </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray ml-4">{L('Account Name', 'Nom de Compte')}</label>
              <input 
                type="text" 
                required
                placeholder={L('Your full name...', 'Votre nom complet...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-navy-50/50 border-2 border-transparent rounded-[24px] px-6 py-5 text-navy-950 font-black outline-none focus:border-navy-brand focus:bg-white transition-all shadow-inner uppercase"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-gray ml-4">{L('Phone (Optional)', 'Téléphone (Optionnel)')}</label>
              <input 
                type="text" 
                placeholder="078..."
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
                className="w-full bg-navy-50/50 border-2 border-transparent rounded-[24px] px-6 py-5 text-navy-950 font-black outline-none focus:border-navy-brand focus:bg-white transition-all shadow-inner"
              />
           </div>
           <button type="submit" className="w-full bg-navy-950 text-white font-black py-6 rounded-[24px] shadow-2xl flex items-center justify-center gap-3 hover:bg-navy-brand transition-all uppercase tracking-widest text-xs">
              {L('Access Registry', 'Accéder au Registre')} <Search className="w-4 h-4" />
           </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-50/30 pb-20 fade-in-up">
      {/* Premium Portal Header */}
      <div className="bg-navy-950 text-white p-8 md:p-16 rounded-b-[64px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-navy-brand/20 blur-[100px] rounded-full"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
           <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-navy-brand border border-white/20 shadow-2xl">
                 <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-navy-brand mb-2 italic">{L('MARC v4 Certified Client', 'Client Certifié MARC v4')}</p>
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">{decodedName}</h1>
                 <p className="text-xs font-bold text-white/40 mt-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {L('Member since', 'Membre depuis')} {clientSales.length > 0 ? new Date(clientSales[clientSales.length-1].date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : L('Today', 'Aujourd\'hui')}
                 </p>
              </div>
           </div>
           <button 
             onClick={() => window.location.hash = '#/portal'}
             className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest backdrop-blur-md"
           >
             <ArrowLeft className="w-4 h-4" /> {L('Exit', 'Quitter')}
           </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-16 px-6 space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: L('Total Purchases', 'Achats Totaux'), val: totalSpent, icon: ShoppingCart, color: 'text-navy-950', bg: 'bg-white' },
             { label: L('Total Settled', 'Total Réglé'), val: totalPaid, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: L('Current Debt', 'Dette Actuelle'), val: currentDebt, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
             { label: L('Credit Balance', 'Solde Créditeur'), val: currentCredit, icon: Wallet, color: 'text-navy-brand', bg: 'bg-navy-50' }
           ].map((m, i) => (
             <div key={i} className={`glass-card p-8 rounded-[40px] shadow-xl border border-navy-100 ${m.bg} group hover:scale-105 transition-all`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${m.color} bg-current/10`}>
                   <m.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-gray mb-1">{m.label}</p>
                <p className={`text-2xl font-black ${m.color}`}>{store.formatCurrency(m.val)}</p>
             </div>
           ))}
        </div>

        {/* Transaction History */}
        <div className="glass-card bg-white rounded-[48px] border border-navy-100 shadow-2xl overflow-hidden">
           <div className="p-10 border-b border-navy-50 flex items-center justify-between">
              <div>
                 <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter">{L('Transaction History', 'Historique des Transactions')}</h3>
                 <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest italic mt-1">{L('Complete record of your activities', 'Registre complet de vos activités')}</p>
              </div>
              <span className="px-6 py-2 bg-navy-50 text-navy-950 rounded-full text-xs font-black uppercase tracking-widest border border-navy-100">
                 {clientSales.length} {L('Operations', 'Opérations')}
              </span>
           </div>

           <div className="divide-y divide-navy-50">
              {clientSales.length > 0 ? clientSales.map((s, idx) => (
                <div key={idx} className="p-8 flex items-center justify-between hover:bg-navy-50/50 transition-all group">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${s.timelineType === 'credit' ? 'bg-amber-50 text-amber-500' : (s.paid >= s.amount ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}`}>
                         {s.timelineType === 'credit' ? <Wallet className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                      </div>
                      <div>
                         <p className={`font-black uppercase text-lg leading-none ${s.timelineType === 'credit' ? 'text-amber-600' : 'text-navy-950'}`}>
                            {s.timelineType === 'credit' ? L('Credit / Overpayment', 'Crédit / Trop-perçu') : s.name}
                         </p>
                         <p className="text-xs font-bold text-blue-gray mt-2 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 opacity-40" /> {new Date(s.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {day:'numeric', month:'short', year:'numeric'})}
                            {s.timelineType === 'credit' && s.note && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[9px]">{s.note}</span>}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-xl font-black ${s.timelineType === 'credit' ? 'text-amber-500' : 'text-navy-950'}`}>
                         {s.timelineType === 'credit' ? '+' : ''}{store.formatCurrency(s.balance || s.amount)}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.timelineType === 'credit' ? 'text-amber-500' : (s.paid >= s.amount ? 'text-emerald-500' : 'text-rose-500')}`}>
                         {s.timelineType === 'credit' ? (s.status === 'used' ? L('Used', 'Utilisé') : L('Available', 'Disponible')) : (s.paid >= s.amount ? L('Settled', 'Soldé') : `${L('Remaining:', 'Reste:')} ${store.formatCurrency(s.amount - s.paid)}`)}
                      </p>
                   </div>
                </div>
              )) : (
                <div className="p-20 text-center space-y-4 opacity-20">
                   <Clock className="w-16 h-16 mx-auto" />
                   <p className="text-sm font-black uppercase tracking-widest">{L('No history detected', 'Aucun historique détecté')}</p>
                </div>
              )}
           </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] font-black text-blue-gray uppercase tracking-[0.4em] mt-10 italic opacity-40">
         {L('MARC v4.0 Client Transparency Platform', 'Plateforme de Transparence Client MARC v4.0')}
      </p>
    </div>
  );
}
