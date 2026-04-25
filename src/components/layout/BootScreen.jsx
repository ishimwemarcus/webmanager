import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, LayoutGrid } from 'lucide-react';

export default function BootScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

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
    <div className={`fixed inset-0 z-[100] bg-pure-black flex flex-col items-center justify-center transition-all duration-[800ms] ${phase === 4 ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
      
      {/* Ultra Extra Background Ambience */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] blur-[120px] rounded-full bg-gradient-radial from-[#2563eb]/30 via-transparent to-transparent animate-spin-slow"></div>
        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        {/* Scanning Laser Line */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-[#2563eb] shadow-[0_0_20px_#2563eb] transition-all duration-[4000ms] ease-linear ${phase >= 1 ? 'translate-y-[100vh]' : 'translate-y-0 opacity-0'}`}></div>
      </div>

      {/* Main Intro Video / Sequence Area */}
      <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
        <div className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-20'}`}>
          <div className="w-36 h-36 mx-auto rounded-3xl bg-white flex items-center justify-center text-pure-black shadow-[0_0_100px_rgba(37, 99, 235,0.6)] relative overflow-hidden group p-0">
            <div className="absolute inset-0 bg-[#2563eb]/20 animate-pulse"></div>
            <div className={`absolute top-0 bottom-0 left-0 w-1 bg-[#2563eb] transition-all duration-[2000ms] ease-out ${phase >= 1 ? 'h-full' : 'h-0'} z-20`}></div>
            
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://guardian-business.surge.sh')}`} alt="MARC QR Boot" className="absolute inset-0 w-full h-full object-contain p-4 z-10" />
          </div>
        </div>

        <div className={`space-y-4 transition-all duration-1000 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter shadow-black drop-shadow-2xl">
            MARC
          </h1>
          <p className="text-sm font-black uppercase tracking-[1em] text-[#2563eb]">Enterprise Management System</p>
        </div>

        {/* Loading Metrics Video Effect */}
        <div className={`max-w-md mx-auto w-full transition-all duration-500 delay-300 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden border border-white/10 relative">
            <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-[#2563eb] to-white transition-all duration-[3000ms] ease-out ${phase >= 1 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex justify-between mt-3 text-xs md:text-sm font-black uppercase tracking-widest text-white/50">
            <span className={`${phase >= 3 ? 'text-[#2563eb]' : ''} transition-colors duration-300`}>Sys. Boot</span>
            <span className={`${phase >= 3 ? 'text-white' : ''} transition-colors duration-300`}>{phase >= 3 ? 'COMPLETE' : 'INITIALIZING'}</span>
          </div>
        </div>

        {/* System Checks */}
        <div className={`flex items-center justify-center gap-12 mt-12 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-success-pro animate-pulse">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black">Ledger Linked</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-success-pro animate-pulse delay-75">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black">Stock Mounted</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-success-pro animate-pulse delay-150">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black">Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
