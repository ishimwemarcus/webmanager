import React, { useState } from 'react';
import { Menu, Globe, QrCode, X, LayoutGrid, LogOut, Cpu, Calculator, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export default function TopBar({ onToggleSidebar, onToggleCalculator, isCalculatorOpen }) {
  const store = useStore();
  const { lang, toggleLang, t, L } = useLanguage();
  const { currency, setCurrency, currentOperator } = store;
  const [showQR, setShowQR] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = Number(localStorage.getItem('biztrack_ui_zoom'));
    if (Number.isFinite(saved) && saved >= 0.85 && saved <= 1.5) return saved;
    return 1.1;
  });

  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--ui-zoom', String(zoomLevel));
    localStorage.setItem('biztrack_ui_zoom', String(zoomLevel));
  }, [zoomLevel]);

  const increaseZoom = () => setZoomLevel(prev => Math.min(1.5, Math.round((prev + 0.05) * 100) / 100));
  const decreaseZoom = () => setZoomLevel(prev => Math.max(0.85, Math.round((prev - 0.05) * 100) / 100));
  const resetZoom = () => setZoomLevel(1.1);

  const timeStr = currentTime.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  const syncColor =
    store.syncStatus === 'connected' ? 'bg-emerald-500 status-dot-green' :
    store.syncStatus === 'syncing'   ? 'bg-amber-400 status-dot-amber' :
                                       'bg-rose-500 status-dot-red';

  const syncLabel =
    store.syncStatus === 'connected' ? L('Sync Active', 'Sync Actif') :
    store.syncStatus === 'syncing'   ? L('Syncing…',   'Sync…') :
                                       L('Offline',    'Hors ligne');

  return (
    <>
      <header className="app-topbar flex items-center justify-between gap-2 px-3 md:px-4 z-[100] no-print">

        {/* ── LEFT ── */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">

          {/* Hamburger (mobile only) */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white lg:hidden transition-all border border-white/10 active:scale-90 flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Brand / Title */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-black text-sm shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                M
              </div>
              <span className="text-white font-black uppercase tracking-[0.18em] text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                MARC
              </span>
              {/* Live badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400" style={{ fontSize: '0.6rem' }}>
                  LIVE
                </span>
              </div>
            </div>
            <p className="hidden md:block text-white/30 leading-none truncate" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em' }}>
              {timeStr} · {L('Business Management System', 'Système de Gestion')}
            </p>
          </div>

          {/* Sync indicator (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${syncColor}`} />
            <span className="text-white font-bold" style={{ fontSize: '0.7rem' }}>{syncLabel}</span>
          </div>

          {/* Read-only badge */}
          {store.isReadOnly && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-black uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.08em' }}>
                {L('Live View', 'Vue Direct')}
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

          {/* Operator chip — shown in both modes */}
          {currentOperator && (
            <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-white/8 border border-white/10 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-xs shadow-[0_0_8px_rgba(16,185,129,0.4)] flex-shrink-0">
                {currentOperator.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block font-black uppercase text-white" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', maxWidth: 72 }} title={currentOperator}>
                {currentOperator.length > 8 ? currentOperator.slice(0, 7) + '…' : currentOperator}
              </span>
            </div>
          )}

          <div className="w-px h-5 bg-white/10 mx-0.5 hidden sm:block" />

          {/* Language */}
          <button
            onClick={toggleLang}
            title="Toggle language"
            className="flex items-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/12 border border-white/10 rounded-lg transition-all active:scale-90"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="font-black text-white hidden xs:inline" style={{ fontSize: '0.65rem' }}>{lang.toUpperCase()}</span>
          </button>

          {/* Controls only shown to staff, not the boss */}
          {!store.isReadOnly && (
            <>
              {/* QR / Grid */}
              <button
                onClick={() => setShowQR(true)}
                title={L('Boss Sync QR', 'QR Sync Boss')}
                className="p-1.5 bg-white/5 border border-white/10 rounded-lg transition-all active:scale-90 hover:bg-white/12 text-white/50 hover:text-white"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>

              {/* Calculator */}
              <button
                onClick={onToggleCalculator}
                title={L('Calculator', 'Calculatrice')}
                className={`p-1.5 border border-white/10 rounded-lg transition-all active:scale-90 ${
                  isCalculatorOpen
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 text-white/50 hover:bg-white/12 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
              </button>

              {/* UI Zoom */}
              <div className="flex items-center gap-1 px-1 py-1 bg-white/5 border border-white/10 rounded-lg">
                <button
                  onClick={decreaseZoom}
                  title={L('Zoom out', 'Zoom arrière')}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetZoom}
                  title={L('Reset zoom', 'Réinitialiser zoom')}
                  className="min-w-[3rem] px-1 text-center text-[0.62rem] font-black text-emerald-300"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={increaseZoom}
                  title={L('Zoom in', 'Zoom avant')}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Currency chip */}
              <button
                className="flex items-center justify-center w-7 h-7 bg-emerald-500 text-black rounded-lg font-black text-sm shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 active:scale-90"
                title={`Currency: ${currency}`}
              >
                {String(currency?.val || currency || '€')}
              </button>

              {/* End Shift */}
              <button
                onClick={() => store.setIsShiftEndModalOpen(true)}
                title={L('End shift', 'Fin de poste')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 border border-rose-500/50 rounded-lg text-white font-black uppercase transition-all shadow-lg shadow-rose-600/25"
                style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">{L('End', 'Fin')}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── QR Modal ── */}
      {showQR && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white p-8 rounded-3xl shadow-2xl relative scale-in max-w-xs w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-all">
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-500/30">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{L('Boss Live Sync', 'Sync Direct Boss')}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 leading-relaxed">
              {L('Scan to mirror this terminal in real-time.', 'Scannez pour répliquer ce terminal.')}
            </p>
            <div className="bg-slate-50 p-5 rounded-2xl mb-3 border-2 border-dashed border-slate-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 via-emerald-500/8 to-emerald-500/0 h-2 top-0 animate-scan z-10" />
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  window.location.origin + window.location.pathname + '#/?pass=MARCUS&sync=' + encodeURIComponent(store.syncUrl)
                )}`}
                alt="QR Code"
                className="w-full h-auto rounded-xl relative z-0"
              />
            </div>
            <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">MARC Protocol v4.0</p>
          </div>
        </div>
      )}
    </>
  );
}
