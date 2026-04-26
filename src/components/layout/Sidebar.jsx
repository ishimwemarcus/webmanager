import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BookOpen,
  ChevronRight,
  Clock,
  BarChart2,
  Users,
  AlertTriangle,
  Calculator,
  Cpu,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export default function Sidebar({ className }) {
  const { t } = useLanguage();
  const store = useStore();

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('biztrack_user')); } catch { return null; }
  })();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'PERFORMANCE' },
    { to: '/commander', icon: Cpu, label: 'PRENDRE COMMANDE' },
    { to: '/stock', icon: Package, label: 'INVENTAIRE' },
    { to: '/sales', icon: ShoppingCart, label: 'TRANSACTIONS' },
    { to: '/wait', icon: Clock, label: 'GRAND LIVRE' },
    { to: '/reports', icon: BarChart2, label: 'INTELLIGENCE' },
    { to: '/clients', icon: Users, label: 'BASE CLIENTS' },
    { to: '/shifts', icon: Clock, label: 'JOURNAL DES POSTES' },
    { to: '/spoilage', icon: AlertTriangle, label: 'PERTES (AVARIES)' },
    { to: '/cloture', icon: Calculator, label: 'CLÔTURE CAISSE' }
  ];

  return (
    <aside className={`w-72 bg-[#0F172A] text-white flex flex-col flex-shrink-0 transition-all duration-300 no-print z-30 border-r border-white/5 ${className}`}>
      <div className="p-8">
        <div
          onClick={() => window.location.href = '/'}
          className="flex flex-col items-center text-center gap-4 group/logo cursor-pointer hover:opacity-90 transition-all active:scale-95"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-white/5 p-4 shadow-2xl border border-white/10 relative overflow-hidden group/logo-img flex items-center justify-center backdrop-blur-xl">
            <svg viewBox="0 0 100 100" className="w-14 h-14 group-hover:scale-110 transition-transform duration-700 animate-bounce-gentle">
              <defs>
                <linearGradient id="sidebar-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#10B981' }} />
                  <stop offset="100%" style={{ stopColor: '#059669' }} />
                </linearGradient>
              </defs>
              <path
                d="M20 75V25L50 55L80 25V75"
                fill="none"
                stroke="url(#sidebar-logo-gradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-white uppercase leading-none">
              MARC
            </h1>
            <div className="h-1.5 w-12 bg-[#10B981] mx-auto mt-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-1 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 ml-4 italic">Management Sectors</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-500 group relative
                ${isActive 
                  ? 'bg-[#10B981] text-black shadow-[0_10px_20px_rgba(16,185,129,0.3)] translate-x-1' 
                  : 'hover:bg-white/5 text-white/40 hover:text-white hover:translate-x-1'}
                active:scale-95
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 mt-auto space-y-3">
        <NavLink 
          to="/cloture"
          className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:bg-white/10 transition-all group"
        >
          <Calculator className="w-4 h-4" />
          <span>CASHREGISTER</span>
        </NavLink>

        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl mb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Session Active</p>
            <p className="text-xs font-black text-white uppercase truncate">{store.currentOperator || 'Administrateur'}</p>
          </div>
        </div>

        <div 
          onClick={() => store.setIsShiftEndModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:bg-rose-500/20 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>LOGOUT</span>
        </div>
      </div>
    </aside>
  );
}
