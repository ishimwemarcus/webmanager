import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, Check, X } from 'lucide-react';

export default function GlobalAlerts() {
  const store = useStore();
  const users = store.getUsers();
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('biztrack_user')); }
    catch { return null; }
  })();

  const [pendingUser, setPendingUser] = useState(null);
  const [lifespanDays, setLifespanDays] = useState('permanent');

  useEffect(() => {
    // Only Master Admins get these alerts
    if (currentUser?.role !== 'Master') return;

    // Find the first pending user
    const pending = users.find(u => u.status === 'pending');
    
    // Check if we haven't already dismissed them in this session (optional, but let's just show it)
    if (pending && (!pendingUser || pendingUser.id !== pending.id)) {
      setPendingUser(pending);
    } else if (!pending) {
      setPendingUser(null);
    }
  }, [users, currentUser]);

  const handleDecision = (decision) => {
    if (!pendingUser) return;
    
    if (decision === 'approve') {
      let expiresAt = null;
      if (lifespanDays !== 'permanent') {
        const days = parseInt(lifespanDays);
        expiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);
      }
      const activeUser = { 
        ...pendingUser, 
        status: 'active',
        expiresAt: expiresAt
      };
      store.updateRecord(activeUser);
      // Account is now active — the operator logs in themselves with their credentials.
    } else {
      store.updateRecord({ ...pendingUser, status: 'restricted' });
    }
    setPendingUser(null);
    setLifespanDays('permanent');
  };

  if (!pendingUser || currentUser?.role !== 'Master') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-[40px] shadow-2xl relative overflow-hidden animate-slide-up border border-amber-500/30">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-lg relative mb-6 text-amber-500 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <h2 className="font-display text-2xl font-bold text-navy-950 mb-2">Access Request</h2>
          <p className="text-sm text-navy-500 mb-6 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 w-full">
            <strong className="text-navy-900 block text-lg">{pendingUser.name}</strong>
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-navy-400">System ID: {pendingUser.username}</span>
            <br/><br/>
            This operator has just registered and requires Master clearance to enter the platform.
          </p>

          <div className="w-full mb-6 text-left">
            <label className="text-xs md:text-sm font-black uppercase tracking-widest text-navy-400 mb-2 block ml-1">Grant Access Lifespan</label>
            <select 
              value={lifespanDays}
              onChange={(e) => setLifespanDays(e.target.value)}
              className="w-full bg-navy-50/50 border border-navy-100 rounded-xl px-4 py-3 text-sm font-bold text-navy-900 focus:outline-none focus:border-amber-400"
            >
              <option value="1">24 Hours (Temp)</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="permanent">Permanent Access</option>
            </select>
          </div>

          <div className="flex w-full gap-4">
            <button 
              onClick={() => handleDecision('deny')}
              className="flex-1 py-4 rounded-2xl bg-red-50 text-danger font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Deny
            </button>
            <button 
              onClick={() => handleDecision('approve')}
              className="flex-1 py-4 rounded-2xl bg-accent-500 text-navy-950 font-black text-xs uppercase tracking-widest hover:bg-accent-400 transition-colors shadow-[0_4px_15px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Grant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
