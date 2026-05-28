import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BootScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const { L } = useLanguage();

  // Dynamic QR Code link builder
  const qrDataUrl = React.useMemo(() => {
    const customSyncUrl = localStorage.getItem('biztrack_sync_url') || '';
    const activeSyncTarget = customSyncUrl || (
      window.location.hostname === 'localhost' && window.location.port !== ''
        ? `${window.location.protocol}//${window.location.hostname}/manager web/api.php`
        : `${window.location.origin}/manager web/api.php`
    );
    return `https://ishimwemarcus.github.io/webmanager/?pass=MARCUS&sync=${encodeURIComponent(activeSyncTarget)}`;
  }, []);

  useEffect(() => {
    const sequence = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => setPhase(4), 4000),      // Flash
      setTimeout(() => onComplete(), 4500)      // Done
    ];
    return () => sequence.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-[800ms] p-4 ${phase === 4 ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`} style={{background:'linear-gradient(135deg,#0B1628 0%,#0F172A 50%,#0A1F12 100%)'}}>
      
      {/* Ultra Extra Background Ambience */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] blur-[120px] rounded-full" style={{background:'radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 60%)'}} />
        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        {/* Scanning Laser Line */}
        <div className={`absolute top-0 left-0 w-full h-px bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.8)] transition-all duration-[4000ms] ease-linear ${phase >= 1 ? 'translate-y-[100vh]' : 'translate-y-0 opacity-0'}`}></div>
      </div>

      {/* Main Intro Video / Sequence Area */}
      <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
        <div className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-20'}`}>
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-3xl bg-white flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)] relative overflow-hidden group p-0">
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
            <div className={`absolute top-0 bottom-0 left-0 w-1 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-[2000ms] ease-out ${phase >= 1 ? 'h-full' : 'h-0'} z-20`}></div>
            
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`} alt="MARC Boss Sync QR" className="absolute inset-0 w-full h-full object-contain p-4 z-10" />
          </div>
        </div>

        <div className={`space-y-4 transition-all duration-1000 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
            MARC
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-400 opacity-80 mt-1">{L('Enterprise Management System', "Système de Gestion d'Entreprise")}</p>
        </div>


        {/* Loading Metrics Video Effect */}
        <div className={`max-w-md mx-auto w-full transition-all duration-500 delay-300 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
            <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-white/80 transition-all duration-[3000ms] ease-out rounded-full ${phase >= 1 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex justify-between mt-2 text-xs font-black uppercase tracking-widest text-white/40">
            <span className={`${phase >= 3 ? 'text-emerald-400' : ''} transition-colors duration-300`}>{L('Sys. Boot', 'Boot Sys.')}</span>
            <span className={`${phase >= 3 ? 'text-white' : ''} transition-colors duration-300`}>{phase >= 3 ? L('COMPLETE', 'TERMINÉ') : L('INITIALIZING', 'INITIALISATION')}</span>
          </div>
        </div>

        {/* System Checks */}
        <div className={`flex items-center justify-center gap-12 mt-12 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-success-pro animate-pulse">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black">{L('Ledger Linked', 'Ledger Couplé')}</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-success-pro animate-pulse delay-75">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black">{L('Stock Mounted', 'Stock Indexé')}</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-success-pro animate-pulse delay-150">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black">{L('Secured', 'Sécurisé')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
