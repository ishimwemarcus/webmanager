import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserCheck, ArrowRight, User, ShieldCheck } from 'lucide-react';

export default function ShiftGateway() {
  const store = useStore();
  const { t } = useLanguage();
  const [operator, setOperator] = useState('');

  const handleStartShift = (e) => {
    e.preventDefault();
    if (operator.trim().length > 0) {
      const name = operator.trim().toUpperCase();
      const shiftId = new Date().toISOString();
      store.setCurrentOperator(name);
      if (store.setShiftStart) store.setShiftStart(shiftId);
      localStorage.setItem('biztrack_operator', name);
      localStorage.setItem('biztrack_shift_start', shiftId);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-navy-950/40 backdrop-blur-2xl p-4 overflow-hidden animate-fade-in">
      {/* Background Graphic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEF264]/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      
      <div className="bg-white max-w-lg w-full relative z-[1001] rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] overflow-hidden border border-white/50 animate-scale-in">
        <div className="p-12 text-center bg-gradient-to-b from-navy-50/50 to-transparent">
            <div className="w-24 h-24 bg-navy-brand rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/20">
                <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-navy-950 uppercase tracking-tighter mb-2">MARC GATEWAY</h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] text-blue-gray uppercase tracking-[0.4em] font-black">Authentication Required</p>
            </div>
        </div>

        <form onSubmit={handleStartShift} className="p-12 pt-4 space-y-10">
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-gray">Identity Credentials</label>
                  <span className="text-[9px] font-bold text-navy-brand opacity-50">Shift v2.4</span>
                </div>
                <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-gray group-focus-within:text-navy-brand transition-colors"><User className="w-6 h-6" /></span>
                    <input 
                        type="text" 
                        required
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        placeholder="ENTER YOUR NAME..."
                        className="w-full bg-navy-50 border-2 border-transparent rounded-[24px] pl-16 pr-6 py-6 text-navy-950 font-black focus:bg-white focus:border-navy-brand focus:ring-8 focus:ring-navy-brand/5 outline-none transition-all text-xl tracking-[0.2em] uppercase placeholder:text-navy-100"
                        autoFocus
                    />
                </div>
            </div>

            <button type="submit" className="w-full py-6 rounded-[24px] bg-navy-brand text-white text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:bg-navy-900 active:scale-95 transition-all group overflow-hidden relative">
                <span className="relative z-10">Initialize Shift</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            <p className="text-center text-[9px] text-blue-gray font-bold uppercase tracking-widest leading-relaxed">
              Security Protocol Active. Session data will be encrypted and synchronized with the global ledger.
            </p>
        </form>
      </div>
    </div>
  );
}
