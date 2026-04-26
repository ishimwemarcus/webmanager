import React, { useState } from 'react';
import { Menu, Bell, Search, Settings, LogOut, Globe, QrCode, X, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export default function TopBar({ onToggleSidebar }) {
  const store = useStore();
  const { lang, toggleLang, t } = useLanguage();
  const { currency, setCurrency, currentOperator } = store;
  const [showQR, setShowQR] = useState(false);
  const [eyeCare, setEyeCare] = useState(() => localStorage.getItem('biztrack_eyecare') === 'true');

  React.useEffect(() => {
    if (eyeCare) {
      document.documentElement.classList.add('eye-care-mode');
      localStorage.setItem('biztrack_eyecare', 'true');
    } else {
      document.documentElement.classList.remove('eye-care-mode');
      localStorage.setItem('biztrack_eyecare', 'false');
    }
  }, [eyeCare]);

  const today = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


  return (
    <header className="h-14 md:h-20 bg-gradient-to-r from-[#064E3B] to-[#0F172A] border-b border-white/10 flex items-center justify-between px-4 md:px-10 z-[100] no-print transition-all duration-500">

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
                VUE <span className="text-[#F59E0B] hidden xs:inline">CONSOLE DE GESTION</span><span className="text-[#F59E0B] xs:hidden">CONSOLE</span>
              </h2>
              <div className="hidden md:flex items-center gap-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">SYNCHRONISATION</span>
              </div>
            </div>
            <p className="text-[8px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-0.5 italic leading-none">{today}</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <div className={`w-2 h-2 rounded-full animate-pulse ${store.getSystemStatus() === 'systemWarning' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {store.getSystemStatus() === 'systemWarning' ? 'Attention Requise' : 'Système Nominal'}
              </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 lg:gap-10">

        <div className="flex items-center gap-3">
          {/* Operator Badge */}
          {currentOperator && (
            <div
              onClick={() => store.setIsShiftEndModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all"
              title="Click to End Shift"
            >
              <div className="w-6 h-6 rounded-full bg-[#F59E0B] text-black flex items-center justify-center font-black text-xs md:text-sm">
                {currentOperator.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-xs md:text-sm font-black uppercase tracking-widest text-white max-w-[80px] truncate">{currentOperator}</span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-white transition-all font-black text-xs md:text-sm uppercase tracking-widest group hover:bg-white/10"
          >
            <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform text-[#F59E0B]" />
            <span>{lang === 'en' ? 'EN' : 'FR'}</span>
          </button>

          {/* Eye Care Toggle */}
          <button
            onClick={() => setEyeCare(!eyeCare)}
            title="Toggle Eye Care Mode"
            className={`flex items-center gap-2 px-3 py-2 border rounded-2xl transition-all font-black group ${eyeCare ? 'bg-[#BEF264]/20 border-[#BEF264] text-[#BEF264]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Currency Input Modifier */}
          <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 bg-white/5 border border-white/10 rounded-2xl">
            <span className="hidden md:inline text-xs font-black uppercase text-white/40" title="Currency Profile">CUR</span>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-10 md:w-12 bg-transparent border-none text-white font-black text-xs md:text-sm p-0 focus:ring-0 text-center uppercase"
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
            <h3 className="text-2xl font-black text-navy-950 uppercase tracking-tighter mb-2">Accès Mobile</h3>
            <p className="text-xs font-bold text-blue-gray uppercase tracking-widest mb-8 leading-relaxed">Scannez pour synchroniser ce terminal avec votre smartphone.</p>
            <div className="bg-navy-50 p-6 rounded-3xl mb-4 border-2 border-dashed border-navy-200">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://guardian-business.surge.sh" alt="QR Code" className="w-full h-auto rounded-xl" />
            </div>
            <p className="text-[10px] font-black uppercase text-navy-brand tracking-[0.3em]">Guardian Protocol v4.0 Active</p>
          </div>
        </div>
      )}
    </header>
  );
}
