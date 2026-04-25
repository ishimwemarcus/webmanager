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

      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white lg:hidden transition-all border border-white/10"
        >
          <Menu className="w-6 h-6 outline-none" />
        </button>
        <div className="hidden sm:block">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {t('dashboard').split(' ')[0]} <span className="font-black text-[#F59E0B]">{t('commandInterface')}</span>
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-white">{t('liveSync')}</span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-white/50 font-bold uppercase tracking-[0.25em] mt-1 italic">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 lg:gap-10">

        <div className="flex items-center gap-3">
          {/* Operator Badge */}
          {currentOperator && (
            <div
              onClick={() => {
                store.showConfirm(`END SHIFT: Are you sure you want to close this session for ${currentOperator}?`, () => {
                  const endTime = new Date().toISOString();
                  const allSales = store.getSales();
                  const shiftSales = allSales.filter(s => s.shiftId === store.shiftStart || s.operator === currentOperator);
                  const revenue = shiftSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                  
                  store.addRecord({
                    record_type: 'shift',
                    operator: currentOperator,
                    start: store.shiftStart,
                    end: endTime,
                    revenue: revenue,
                    transactions: shiftSales.length
                  });

                  store.setShiftStart('');
                  store.setCurrentOperator('');
                  localStorage.removeItem('biztrack_operator');
                  localStorage.removeItem('biztrack_shift_start');
                  window.location.reload();
                });
              }}
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
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-xs md:text-sm font-black uppercase text-white/40" title="Currency Profile">CUR</span>
            <input
              type="text"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-10 bg-transparent text-white font-black text-xs text-center border-b border-white/20 focus:border-[#BEF264] outline-none transition-all"
              maxLength={4}
              title="Change System Currency"
            />
          </div>

          <div className="group relative">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl border border-white/10 p-1 shadow-lg hover:scale-110 hover:bg-gold/20 hover:border-gold/50 transition-all duration-700 cursor-pointer overflow-hidden opacity-10 hover:opacity-100 backdrop-blur-sm hover:backdrop-blur-none group">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=BEF264&bgcolor=050A09&data=${encodeURIComponent('https://ishimwemarcus.github.io/webmanager/')}`}
                alt="System Link"
                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Tooltip/Hover Effect */}
            <div className="absolute top-full right-0 mt-4 w-48 bg-navy-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-500 z-[110] shadow-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-white mb-2 italic">Global Network Link</p>
              <div className="w-full aspect-square bg-white rounded-lg p-2 mb-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://ishimwemarcus.github.io/webmanager/')}`}
                  alt="System Link"
                  className="w-full h-full object-contain"
                />
            </div>
              <p className="text-xs md:text-sm md:text-xs text-white/50 font-bold uppercase tracking-tight leading-relaxed">Scan to access the platform across distributed nodes.</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
