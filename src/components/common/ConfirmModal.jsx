import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay">
      <div className="glass-card w-full max-w-md p-10 rounded-[48px] shadow-2xl relative overflow-hidden animate-slide-up border border-white/10 border-t-accent-500 border-t-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-accent-500/10 rounded-3xl flex items-center justify-center text-accent-500 mb-8 border border-accent-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <ShieldAlert className="w-10 h-10 text-glow-blue" />
          </div>

          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{t('confirmAction') || 'AUTHORIZE ACTION'}</h3>
          <p className="text-sm font-bold text-navy-400 mb-10 leading-relaxed uppercase italic">
            {message}
          </p>

          <div className="flex w-full gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-5 rounded-2xl bg-white/5 text-navy-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              <X className="w-4 h-4 mr-2 inline" /> {t('abort') || 'ABORT'}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-5 rounded-2xl bg-accent-500 text-navy-950 font-black text-xs uppercase tracking-widest hover:bg-accent-400 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
            >
              <Check className="w-4 h-4 mr-2 inline" /> {t('execute') || 'EXECUTE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
