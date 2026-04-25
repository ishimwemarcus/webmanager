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
  Users
} from 'lucide-react';

export default function Wait() {
  const store = useStore();
  const { t } = useLanguage();
  const waitCredits = store.getWaitCredits();
  const sales = store.getSales();

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

  const clients = Object.values(clientMap);
  const grandTotal = clients.reduce((s, c) => s + c.total, 0);

  const handleMarkUsed = (record) => {
    store.updateRecord({ ...record, balance: 0, status: 'used' });
  };

  const confirmDelete = (record) => {
    store.showConfirm(t('confirmAction'), () => {
      store.deleteRecord(record);
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 no-print">
        <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
          {t('waitSystem')}
        </h1>
        <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase">
          {t('creditRetention')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-navy-brand shadow-xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-navy-50 text-navy-brand flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Solde Global</p>
            <p className="text-3xl font-black text-navy-950">{store.formatCurrency(grandTotal)}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-emerald-500 shadow-xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Débiteurs Actifs</p>
            <p className="text-3xl font-black text-navy-950">{clients.filter(c => c.total > 0).length} <span className="text-xs text-blue-gray opacity-40">Comptes</span></p>
          </div>
        </div>
      </div>

      {clients.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {clients.map((c, i) => (
            <div key={i} className="glass-card rounded-[24px] overflow-hidden border border-navy-50 shadow-2xl bg-white group transition-all duration-700">
              <div className={`px-4 md:px-10 py-6 md:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-50 ${c.total > 0 ? 'bg-navy-50/30' : 'bg-transparent'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[24px] bg-navy-brand text-white flex items-center justify-center font-black text-2xl flex-shrink-0">
                    {c.client?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-xl font-black text-navy-950 uppercase tracking-tight">{c.client}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-success-pro animate-pulse"></div>
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray">
                        {c.phone || 'Aucun Contact'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray mb-1">Valeur Totale</p>
                  <p className={`text-2xl font-black tracking-tighter ${c.total > 0 ? 'text-navy-brand' : 'text-blue-gray/20'}`}>
                    {store.formatCurrency(c.total)}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-navy-50">
                {c.records.map((r, j) => (
                  <div key={j} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-10 py-4 md:py-6 hover:bg-navy-50 transition-all gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${(parseFloat(r.balance)||0) > 0 ? 'bg-success-pro shadow-lg' : 'bg-navy-100'}`}></div>
                      <div>
                        <p className="font-bold text-navy-950 uppercase tracking-tight">{r.note || 'Retention Protocol'}</p>
                        <p className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest mt-1 italic">{store.formatDate(r.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-10 ml-7 sm:ml-0">
                      <div>
                        <p className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest">Inception</p>
                        <p className="text-sm font-bold text-navy-950">{store.formatCurrency(r.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest">Reserve</p>
                        <p className={`text-lg font-black ${(parseFloat(r.balance)||0) > 0 ? 'text-success-pro' : 'text-blue-gray/20 line-through'}`}>
                          {store.formatCurrency(r.balance || 0)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {(parseFloat(r.balance)||0) > 0 && (
                          <button
                            onClick={() => handleMarkUsed(r)}
                            className="p-3 rounded-2xl text-blue-gray hover:text-success-pro hover:bg-navy-50 transition-all"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(r)}
                          className="p-3 rounded-2xl text-blue-gray hover:text-danger-pro hover:bg-navy-50 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[48px] p-32 text-center border border-navy-50 shadow-2xl bg-white">
          <Clock className="w-20 h-20 mx-auto mb-8 text-blue-gray/10" />
          <h3 className="text-3xl font-black text-navy-brand uppercase tracking-tighter mb-4">No Balances Detected</h3>
          <p className="text-sm font-bold text-blue-gray uppercase tracking-widest italic">All retention protocols are nominal.</p>
        </div>
      )}

      <div className="glass-card rounded-[32px] p-8 border border-navy-50 bg-white shadow-xl mt-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-navy-50 rounded-2xl text-navy-brand">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest leading-relaxed">
            <p className="text-navy-brand mb-1">Operational Protocol: Retention</p>
            <p>Monitors stored client value for future transaction linkage. Assets remain active until manually cleared or used during sales checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
