import React from 'react';
import { QrCode, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';

export default function QRModal() {
  const { showQRModal, setShowQRModal, currency, showAlert, API_URL } = useStore();
  const { L } = useLanguage();
  const [isSyncing, setIsSyncing] = React.useState(false);

  if (!showQRModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030711]/98 backdrop-blur-3xl p-4 no-print overflow-hidden">
      <div className="glass-card relative w-full max-w-[360px] md:max-w-md bg-[#030711] border border-accent-500/30 rounded-[40px] p-6 md:p-10 flex flex-col items-center shadow-[0_0_200px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in duration-500">


        <button 
          onClick={() => setShowQRModal(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="hidden md:flex w-16 h-16 bg-accent-500/20 text-accent-500 rounded-2xl items-center justify-center mb-6 border border-accent-500/50">
          <QrCode className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-1 text-center mt-4 md:mt-0">{L('Boss Live Sync', 'Sync Direct Boss')}</h2>
        <p className="text-xs md:text-xs md:text-sm text-navy-400 text-center font-bold mb-4 md:mb-8 uppercase tracking-widest leading-relaxed max-w-[200px] md:max-w-none">
          {L('Scan to mirror this terminal in real-time.', 'Scannez pour répliquer ce terminal en temps réel.')}
        </p>
        
        <div className="relative bg-white p-4 rounded-[32px] shadow-[0_0_60px_rgba(59,130,246,0.4)] border-8 border-white/10 hover:scale-105 transition-transform duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-t from-accent-500/0 via-accent-500/20 to-accent-500/0 h-1 sm:h-2 top-0 animate-scan z-10"></div>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://ishimwemarcus.github.io/webmanager/?pass=MARCUS')}`} 
            alt="MARC Boss Sync QR Code"
            className="w-56 h-56 md:w-64 md:h-64 rounded-xl object-contain bg-white relative z-0"
          />
        </div>

        
        <a 
          href="https://ishimwemarcus.github.io/webmanager/?pass=MARCUS" 
          target="_blank" 
          rel="noreferrer"
          className="mt-6 text-xs md:text-sm md:text-xs text-accent-500 font-bold tracking-widest hover:text-white hover:underline uppercase text-center break-all px-4"
        >
          ishimwemarcus.github.io/webmanager/?pass=MARCUS
        </a>

        {/* Manual Master Override Sync Button */}
        <button
          id="sync-btn-global"
          disabled={isSyncing}
          onClick={async () => {
            setIsSyncing(true);
            const keys = ['products', 'sales', 'expenses', 'users', 'ledger', 'wait', 'losses', 'reconciliations', 'categories', 'shifts', 'reports'];
            
            try {
              for (const k of keys) {
                const localData = localStorage.getItem('biztrack_' + k);
                if (localData) {
                  await fetch(`${API_URL}?action=overwrite&key=biztrack_${k}`, {
                    method: 'POST',
                    body: localData
                  });
                }
              }
              // Special case for currency
              await fetch(`${API_URL}?action=overwrite&key=biztrack_currency`, { 
                method: 'POST', 
                body: JSON.stringify([{ val: currency }]) 
              });

              showAlert(L('All systems synchronized successfully.', 'Tous les systèmes synchronisés avec succès.'), 'success');
            } catch (e) {
              showAlert("Sync Protocol Failed.", "error");
            } finally {
              setIsSyncing(false);
            }
          }}
          className={`w-full mt-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border flex items-center justify-center gap-3 ${isSyncing ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-accent-500/10 border-accent-500/20 text-accent-500 hover:bg-accent-500/20'}`}
        >
          <QrCode className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? L('Syncing...', 'Synchronisation...') : L('Manual Master Override', 'Surcharge Maître Manuelle')}
        </button>
      </div>
    </div>
  );
}
