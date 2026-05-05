import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  Zap,
  Fingerprint
} from 'lucide-react';

export default function Auth({ onLogin }) {
  const store = useStore();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const username = formData.username.trim().toLowerCase();
    const password = formData.password;
    const users = store.getUsers();

    const user = users.find(u => u.username?.toLowerCase() === username && u.password === password);
    if (!user) { setError("Node access denied. Check credentials."); return; }
    if (user.status === 'pending') { setError("Clearance pending. Contact Administration."); return; }
    if (user.status === 'restricted') { setError("Access revoked by Governance."); return; }
    localStorage.setItem('biztrack_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-transparent flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-navy-brand/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-[480px] relative z-10 fade-in-up">
        {/* BRANDING */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[32px] flex items-center justify-center shadow-2xl mb-8 border border-white overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-14 h-14">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#16a34a' }} />
                  <stop offset="100%" style={{ stopColor: '#2563eb' }} />
                </linearGradient>
              </defs>
              <path
                d="M20 75V25L50 55L80 25V75"
                fill="none"
                stroke="url(#logo-gradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,3.75rem)] font-black text-navy-brand uppercase tracking-tighter leading-none italic">
            MARC
          </h1>
          <p className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-blue-gray mt-4 opacity-50">High-Security Governance</p>
        </div>

        {/* AUTH CARD */}
        <div className="glass-card rounded-[56px] p-16 border border-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] opacity-[0.02] text-navy-brand">
            <Fingerprint className="w-64 h-64" />
          </div>

          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-black text-charcoal uppercase tracking-tight italic">
                Interface Entry
              </h2>
              <p className="text-xs md:text-sm font-black text-blue-gray uppercase tracking-widest mt-2">
                Initialize Operational Session
              </p>
            </div>

            {error && (
              <div className="bg-navy-50 border-l-4 border-navy-brand px-6 py-4 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest text-navy-brand animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray ml-2 block">Username Sector</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-200" />
                  <input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} type="text" required className="w-full bg-navy-50 border border-navy-100 rounded-[28px] pl-16 pr-8 py-5 text-sm font-bold text-charcoal focus:border-navy-brand outline-none transition-all font-mono" placeholder="username_id" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-gray ml-2 block">Security Protocol</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-200" />
                  <input value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} type="password" required className="w-full bg-navy-50 border border-navy-100 rounded-[28px] pl-16 pr-8 py-5 text-sm font-bold text-charcoal focus:border-navy-brand outline-none transition-all tracking-[0.5em]" placeholder="••••" />
                </div>
              </div>

              <button type="submit" className="btn-premium w-full !py-6 !text-sm !rounded-[32px] mt-4">
                Initialize System
                <ArrowRight className="w-5 h-5 ml-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
