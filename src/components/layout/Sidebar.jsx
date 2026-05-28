import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BookOpen,
  Clock, BarChart2, Users, AlertTriangle, Calculator, Cpu, LogOut
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
    { to: '/',          icon: LayoutDashboard, label: t('dashboard') },
    { to: '/commander', icon: Cpu,             label: t('commanderInterface'), writeOnly: true },
    { to: '/stock',     icon: Package,         label: t('stock') },
    { to: '/sales',     icon: ShoppingCart,    label: t('sales') },
    { to: '/wait',      icon: BookOpen,        label: t('ledger') },
    { to: '/reports',   icon: BarChart2,       label: t('intelligence') },
    { to: '/clients',   icon: Users,           label: t('clientsDatabase') },
    { to: '/shifts',    icon: Clock,           label: t('currentShift') },
    { to: '/spoilage',  icon: AlertTriangle,   label: t('spoilage'), writeOnly: true },
    { to: '/cloture',   icon: Calculator,      label: t('closeRegister'), writeOnly: true },
  ];

  // Filter out write-only pages for the boss (read-only) view
  const visibleNavItems = store.isReadOnly
    ? navItems.filter(item => !item.writeOnly)
    : navItems;

  return (
    <aside className={`app-sidebar no-print ${className ?? ''}`}>

      {/* ── Brand ── */}
      <div className="app-sidebar__brand py-4">
        <div
          onClick={() => window.location.href = '/'}
          className="flex flex-col items-center text-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative overflow-hidden">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent" />
            <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 animate-bounce-gentle">
              <defs>
                <linearGradient id="sl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style={{ stopColor: '#10B981' }} />
                  <stop offset="100%" style={{ stopColor: '#34D399' }} />
                </linearGradient>
              </defs>
              <path
                d="M20 75V25L50 55L80 25V75"
                fill="none"
                stroke="url(#sl-grad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-[0.28em] text-white uppercase leading-none">MARC</h1>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mt-2 opacity-60" />
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <div className="app-sidebar__nav scroll-panel flex-1 min-h-0">
        <p className="text-label text-white/25 mb-2 px-2 tracking-widest">MENU</p>
        <nav className="app-sidebar__nav-list">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => window.innerWidth < 1024 && document.dispatchEvent(new CustomEvent('marc-close-sidebar'))}
              className={({ isActive }) => `
                app-sidebar__link flex items-center gap-2.5 transition-all duration-200 group relative
                ${isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.15)] translate-x-0.5'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5 hover:translate-x-0.5 border border-transparent'}
                active:scale-95
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="nav-active-bar" />}
                  <item.icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? 'text-emerald-400' : 'opacity-50 group-hover:opacity-80'}`} />
                  <span className="text-body font-semibold truncate normal-case">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div className="app-sidebar__footer space-y-2">
        {/* Operator badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs flex-shrink-0">
            {(store.currentOperator || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-label text-white/30 leading-none mb-0.5">ACTIVE</p>
            <p className="text-xs font-black text-white uppercase truncate leading-none">{store.currentOperator || 'Admin'}</p>
          </div>
        </div>

        {/* End shift */}
        {/* Boss view indicator OR End shift */}
        {store.isReadOnly ? (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <div className="overflow-hidden min-w-0">
              <p className="text-[0.6rem] font-black text-amber-400 uppercase tracking-widest leading-none mb-0.5">BOSS VIEW</p>
              <p className="text-[0.6rem] font-bold text-amber-400/60 uppercase leading-none">Read-Only Mode</p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => store.setIsShiftEndModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-rose-500/8 border border-rose-500/20 rounded-xl text-rose-400 cursor-pointer hover:bg-rose-500/15 hover:border-rose-500/35 transition-all group min-h-[40px] active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
            <span className="text-body font-bold">{t('logOut')}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
