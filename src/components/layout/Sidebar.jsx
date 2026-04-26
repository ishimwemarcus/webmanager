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
    { to: '/', icon: LayoutDashboard, label: 'Performance' },
    { to: '/commander', icon: Cpu, label: 'Prendre Commande' },
    { to: '/stock', icon: Package, label: 'Inventaire' },
    { to: '/sales', icon: ShoppingCart, label: 'Transactions' },
    { to: '/wait', icon: Clock, label: 'Crédits Clients' },
    { to: '/reports', icon: BarChart2, label: 'Intelligence' },
    { to: '/clients', icon: Users, label: 'Base Clients' },
    { to: '/shifts', icon: Clock, label: 'Journal des Postes' },
    { to: '/spoilage', icon: AlertTriangle, label: 'Pertes (Avaries)' },
    { to: '/cloture', icon: Calculator, label: 'Clôture Caisse' }
  ];

  return (
    <aside className={`w-72 bg-[#BEF264] flex flex-col flex-shrink-0 transition-all duration-300 no-print z-30 border-r border-black/5 ${className}`}>
      <div className="p-8">
        <div
          onClick={() => window.location.href = '/'}
          className="flex flex-col items-center text-center gap-4 group/logo cursor-pointer hover:opacity-90 transition-all active:scale-95"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-white p-4 shadow-2xl relative overflow-hidden group/logo-img flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-14 h-14 group-hover:scale-110 transition-transform duration-700 animate-bounce-gentle">
              <defs>
                <linearGradient id="sidebar-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0F172A' }} />
                  <stop offset="100%" style={{ stopColor: '#0369A1' }} />
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
            <h1 className="text-3xl font-black tracking-[-0.05em] text-navy-950 uppercase leading-none">
              MARC
            </h1>
            <div className="h-1.5 w-12 bg-navy-brand mx-auto mt-3 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-1 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-navy-950/40 mb-6 ml-4 italic">Management Sectors</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-500 group relative
                ${isActive 
                  ? 'bg-navy-950 text-white shadow-2xl translate-x-1' 
                  : 'hover:bg-black/5 text-navy-950/60 hover:text-navy-950 hover:translate-x-1'}
                active:scale-95
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 mt-auto space-y-3">
        <div 
          onClick={() => store.setIsShiftEndModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-black text-xs md:text-sm uppercase tracking-[0.3em] cursor-pointer hover:bg-rose-100 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('logout') || 'End Shift'}</span>
        </div>
      </div>
    </aside>
  );
}
