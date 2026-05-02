import React, { useState } from 'react';
import { Menu, Bell, Search, Settings, LogOut, Globe, QrCode, X, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export default function TopBar({ onToggleSidebar }) {
  const store = useStore();
  const { lang, toggleLang, t, L } = useLanguage();
  const { currency, setCurrency, currentOperator } = store;
  const [showQR, setShowQR] = useState(false);
  const [eyeCare, setEyeCare] = useState(() => localStorage.getItem('biztrack_eyecare') === 'true');
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (eyeCare) {
      document.documentElement.classList.add('eye-care-mode');
      localStorage.setItem('biztrack_eyecare', 'true');
    } else {
      document.documentElement.classList.remove('eye-care-mode');
      localStorage.setItem('biztrack_eyecare', 'false');
    }
  }, [eyeCare]);

  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = currentTime.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });

  const timeStr = currentTime.toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }) + ' GMT';


  return (
    <header className="h-14 md:h-20 bg-navy-950 border-b border-white/5 flex items-center justify-between px-4 md:px-10 z-[100] no-print transition-all duration-500 shadow-xl">

      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 text-white lg:hidden transition-all border border-white/10"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6 outline-none" />
        </button>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-xs md:text-lg font-black text-white uppercase tracking-tighter">
                {L('VIEW', 'VUE')} <span className="text-emerald-500 hidden xs:inline">{t('commandInterface')}</span><span className="text-emerald-500 xs:hidden">CONSOLE</span>
              </h2>
              <div className="hidden md:flex items-center gap-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">{t('liveSync')}</span>
              </div>
            </div>
            <p className="hidden sm:block text-[8px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-0.5 italic leading-none">{todayDate} | {timeStr}</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <div className={`w-2 h-2 rounded-full animate-pulse ${store.getSystemStatus() === 'systemWarning' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {store.getSystemStatus() === 'systemWarning' ? L('Attention Required', 'Attention Requise') : L('System Nominal', 'Système Nominal')}
              </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-10">

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Operator Badge */}
          {currentOperator && (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Operator name badge */}
              <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-[10px] sm:text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  {currentOperator.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-white max-w-[80px] truncate">{currentOperator}</span>
              </div>

              {/* Shift End Button — prominently red */}
              <button
                onClick={() => store.setIsShiftEndModalOpen(true)}
                title={L('End shift and pass hand', 'Terminer le poste et passer la main')}
                className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 border border-rose-500 rounded-xl sm:rounded-2xl text-white font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-600/30"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">{L('End Shift', 'Fin Poste')}</span>
              </button>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white transition-all font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-widest group hover:bg-white/10"
          >
            <Globe className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform text-emerald-500" />
            <span>{lang === 'en' ? 'EN' : 'FR'}</span>
          </button>

          {/* Eye Care Toggle */}
          <button
            onClick={() => setEyeCare(!eyeCare)}
            title={L('Toggle Eye Care Mode', 'Activer le mode confort visuel')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-xl sm:rounded-2xl transition-all font-black group ${eyeCare ? 'bg-[#BEF264]/20 border-[#BEF264] text-[#BEF264]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Boss Live Sync QR Shortcut */}
          <button
            onClick={async () => {
              if (isSyncing) return;
              setIsSyncing(true);
              setShowQR(true);
              
              const keys = ['products', 'sales', 'expenses', 'users', 'ledger', 'wait', 'losses', 'reconciliations', 'categories', 'shifts', 'reports'];
              const API_URL = 'https://marcus-boss-sync.loca.lt/manager%20web/api.php';
              
              try {
                for (const k of keys) {
                  const localData = localStorage.getItem('biztrack_' + k);
                  if (localData) {
                    await fetch(`${API_URL}?action=overwrite&key=biztrack_${k}`, {
                      method: 'POST',
                      headers: { 'Bypass-Tunnel-Reminder': 'true' },
                      body: localData
                    });
                  }
                }
                // Special case for currency (wrapped)
                await fetch(`${API_URL}?action=overwrite&key=biztrack_currency`, { 
                  method: 'POST', 
                  headers: { 'Bypass-Tunnel-Reminder': 'true' },
                  body: JSON.stringify([{ val: currency }]) 
                });
                
                store.showAlert(L('Sync Complete', 'Synchronisation Terminée'), 'success');
              } catch (e) {
                store.showAlert('Sync Failed', 'error');
              } finally {
                setIsSyncing(false);
              }
            }}
            title={L('Live Sync / Screen Share QR', 'QR Sync Rapide')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-xl sm:rounded-2xl transition-all font-black group ${isSyncing ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            <QrCode className={`w-3 h-3 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing && <span className="text-[8px] uppercase animate-pulse">Sync</span>}
          </button>

          {/* Currency Input Modifier */}
          <div className="flex items-center gap-1 md:gap-2 px-1 sm:px-2 md:px-3 py-1 sm:py-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl">
            <span className="hidden md:inline text-xs font-black uppercase text-white/40" title={L('Currency Profile', 'Profil Devise')}>CUR</span>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-6 sm:w-10 md:w-12 bg-transparent border-none text-white font-black text-[10px] sm:text-xs md:text-sm p-0 focus:ring-0 text-center uppercase"
            />
          </div>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="bg-white p-10 rounded-[40px] shadow-2xl relative scale-in max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 p-2 hover:bg-navy-50 rounded-full transition-all"><X className="w-6 h-6" /></button>
            <div className="w-20 h-20 bg-navy-brand rounded-3xl mx-auto flex items-center justify-center text-white mb-6">
              <QrCode className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter mb-2">{L('Boss Live Sync', 'Sync Direct Boss')}</h3>
            <p className="text-xs font-bold text-blue-gray uppercase tracking-widest mb-8 leading-relaxed">{L('Scan to mirror this terminal in real-time.', 'Scannez pour répliquer ce terminal en temps réel.')}</p>
            <div className="bg-navy-50 p-6 rounded-3xl mb-4 border-2 border-dashed border-navy-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-brand/0 via-navy-brand/10 to-navy-brand/0 h-2 top-0 animate-scan z-10"></div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://ishimwemarcus.github.io/webmanager/?pass=MARCUS')}`} alt="QR Code" className="w-full h-auto rounded-xl relative z-0" />
            </div>
            <p className="text-[10px] font-black uppercase text-navy-brand tracking-[0.3em]">MARC Protocol v4.0 Active</p>
          </div>
        </div>
      )}
    </header>
  );
}
