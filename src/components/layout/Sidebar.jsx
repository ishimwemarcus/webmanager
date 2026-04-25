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

  // Always point QR to the permanent global cloud URL
  const qrData = 'https://guardian-business.surge.sh';

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Performance' },
    { to: '/commander', icon: Cpu, label: 'Commander' },
    { to: '/stock', icon: Package, label: 'Inventory' },
    { to: '/sales', icon: ShoppingCart, label: 'Transactions' },
    { to: '/wait', icon: Clock, label: 'Credits' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
    { to: '/clients', icon: Users, label: 'Clients VIP' },
    { to: '/shifts', icon: Clock, label: 'Shifts' },
    { to: '/spoilage', icon: AlertTriangle, label: 'Pertes' },
    { to: '/cloture', icon: Calculator, label: 'Caisse' }
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

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
                  <stop offset="0%" style={{ stopColor: '#F59E0B' }} />
                  <stop offset="100%" style={{ stopColor: '#D97706' }} />
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
            <div className="h-1.5 w-12 bg-[#F59E0B] mx-auto mt-3 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-1 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-xs md:text-sm md:text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-4 italic">Management Sectors</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-500 group relative
                ${isActive 
                  ? 'bg-[#F59E0B] text-black shadow-[0_10px_20px_rgba(245,158,11,0.3)] translate-x-1' 
                  : 'hover:bg-white/5 text-white/40 hover:text-white hover:translate-x-1'}
                active:scale-95
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-green-500 rounded-full"></div>
                  )}
                  <item.icon className={`w-4 h-4 transition-all duration-500 ${isActive ? 'text-black scale-125' : 'group-hover:text-black'}`} />
                  <span className={`text-xs font-black uppercase tracking-widest transition-all duration-500`}>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-black animate-bounce-horizontal" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-xl">
        <NavLink
          to="/cloture"
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500
            ${isActive
              ? 'bg-[#F59E0B] text-black shadow-xl'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}
          `}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">{t('cashRegister')}</span>
        </NavLink>
      </div>

      <div className="p-4 mt-auto space-y-3">
        <div 
          onClick={() => {
            store.showConfirm(`END SHIFT: Are you sure you want to end your session?`, () => {
              const endTime = new Date().toISOString();
              const allSales = store.getSales();
              const shiftSales = allSales.filter(s => s.shiftId === store.shiftStart || s.operator === store.currentOperator);
              const revenue = shiftSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
              
              store.addRecord({
                record_type: 'shift',
                operator: store.currentOperator,
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
          className="flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-black text-xs md:text-sm uppercase tracking-[0.3em] cursor-pointer hover:bg-red-500/20 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('logout') || 'End Shift'}</span>
        </div>

        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 group transition-all duration-500 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black border border-white/10 text-xs shadow-inner">
              {store.currentOperator?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-black text-white truncate uppercase tracking-tight italic">{store.currentOperator || 'Operator'}</p>
              <p className="text-xs md:text-sm md:text-xs text-white/30 font-black uppercase tracking-widest">Active Shift</p>
            </div>
          </div>
          <div className="text-xs md:text-sm md:text-xs text-white/30 font-black bg-black/20 rounded-lg px-3 py-2 border border-white/5 flex justify-between items-center tracking-widest uppercase italic">
            <span>Standby</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
