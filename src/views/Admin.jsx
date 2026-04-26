import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Users,
  Activity,
  UserPlus,
  Star,
  Database,
  Lock,
  Unlock,
  ExternalLink,
  ShieldQuestion,
  Trash2,
  Zap,
  Terminal,
  Fingerprint,
  ArrowRight,
  X,
  Edit2
} from 'lucide-react';

export default function Admin() {
  const store = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('accounts');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pin, setPin] = useState('');
  const [visiblePass, setVisiblePass] = useState({});

  const users = store.getUsers().filter(u => u.status !== 'deleted');
  const sales = store.getSales();
  const products = store.getProducts();

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        store.showConfirm("CRITICAL PROTOCOL: Overwrite all systems with this archive? This cannot be undone.", () => {
          store.importData(json);
        });
      } catch (err) {
        store.showAlert("Payload Corrupted.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleToggleAccess = (user) => {
    const newStatus = user.status === 'active' ? 'restricted' : 'active';
    store.updateRecord({ ...user, status: newStatus });
  };

  const getTradingRatio = () => {
    const netSales = sales.reduce((s, r) => s + (r.amount || 0), 0);
    const totalCost = sales.reduce((s, r) => {
      const p = products.find(prod => prod.product_id === r.product_id);
      return s + ((p?.cost || 0) * r.quantity);
    }, 0);
    const grossProfit = netSales - totalCost;
    return netSales > 0 ? (grossProfit / netSales).toFixed(2) : '0.00';
  };

  const report = store.generateDailySummary ? store.generateDailySummary(sales, store.getExpenses(), store.getLedgerManual()) : { whatsappText: 'N/A' };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] space-y-8 pb-20 fade-in-up">
      <div className="border-b border-navy-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black uppercase tracking-tighter text-navy-950 leading-none">
            Master Governance
          </h1>
          <h2 className="text-sm font-black text-blue-gray tracking-[0.4em] uppercase">
            System Control & Audit
          </h2>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="bg-navy-brand text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-navy-900 transition-all uppercase tracking-widest text-xs">
          <UserPlus className="w-5 h-5" /> Provision Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-navy-brand shadow-xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-navy-50 text-navy-brand flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">Provisioned Identities</p>
            <p className="text-3xl font-black text-navy-950">{users.length} <span className="text-xs text-blue-gray opacity-40">Accounts</span></p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-8 bg-white border-l-8 border-emerald-500 shadow-xl group hover:scale-[1.02] transition-all">
          <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-gray mb-1">System Integrity</p>
            <p className="text-3xl font-black text-navy-950">OPTIMAL <span className="text-xs text-emerald-500 italic">Live</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-12">
        <div className="space-y-3 no-print">
          <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-blue-gray mb-6 ml-4">Terminal Sectors</p>
          {[
            { id: 'accounts', label: 'Identities', icon: Users },
            { id: 'performance', label: 'Diagnostics', icon: Activity },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'data', label: 'Protocol', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all duration-500 border
                ${activeTab === tab.id
                  ? 'bg-navy-brand text-white border-navy-brand shadow-lg translate-x-3'
                  : 'bg-white text-blue-gray border-navy-100 hover:bg-navy-50 hover:text-navy-brand'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'accounts' && (
            <div className="glass-card rounded-[24px] p-10 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl fade-in">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Fingerprint className="w-6 h-6" /> Node Registry
                </h3>
              </div>

              <div className="space-y-4">
                {users.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5 group hover:border-[#F59E0B]/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-navy-50 text-navy-brand flex items-center justify-center font-black text-xl border border-navy-100 uppercase">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tight flex items-center gap-3 italic">
                          {u.name}
                          {u.role === 'Master' && <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />}
                        </p>
                        <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/40 mt-1">
                          {u.role} Node • {u.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {u.role !== 'Master' && (
                        <>
                          <button onClick={() => handleToggleAccess(u)} className={`p-4 rounded-2xl border transition-all ${u.status === 'active' ? 'bg-navy-brand text-white' : 'bg-danger-pro text-white'}`}>
                            {u.status === 'active' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setVisiblePass(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                            className="p-4 rounded-2xl bg-navy-50 text-navy-brand border border-navy-100 hover:bg-navy-brand hover:text-white transition-all"
                            title="Audit Protocol"
                          >
                            <ShieldQuestion className="w-4 h-4" />
                          </button>
                          <div className={`text-xs md:text-sm font-mono font-black border border-navy-100 px-4 py-3 rounded-xl bg-navy-50/50 transition-all ${visiblePass[u.id] ? 'opacity-100' : 'opacity-0 blur-sm select-none'}`}>
                            {u.password}
                          </div>
                          <button
                            onClick={() => {
                              const newPass = prompt("Set new protocol for " + u.name);
                              if (newPass) store.resetUserProtocol(u.id, newPass);
                            }}
                            className="p-4 rounded-2xl bg-navy-50 text-navy-brand border border-navy-100 hover:bg-navy-brand hover:text-white transition-all"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingUser(u);
                              setShowInviteModal(true);
                            }}
                            className="p-4 rounded-2xl bg-navy-50 text-navy-brand border border-navy-100 hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              store.showConfirm(`PURGE NODE: Are you sure you want to delete ${u.name}?`, () => {
                                store.deleteRecord({ ...u, record_type: 'user' });
                              });
                            }}
                            className="p-4 rounded-2xl bg-danger-pro/5 text-danger-pro border border-danger-pro/10 hover:bg-danger-pro hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8 fade-in">
              <div className="grid grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[24px] bg-white/5 border border-white/5 shadow-xl">
                  <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/40 mb-4">Trading Ratio</p>
                  <p className="text-[clamp(2rem,6vw,3rem)] font-black text-[#BEF264] tracking-tighter">{getTradingRatio()}</p>
                </div>
                <div className="glass-card p-10 rounded-[24px] bg-white/5 border border-white/5 shadow-xl">
                  <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/40 mb-4">Active Operations</p>
                  <p className="text-[clamp(2rem,6vw,3rem)] font-black text-white tracking-tighter">{sales.length}</p>
                </div>
              </div>

              <div className="glass-card p-10 rounded-[48px] bg-white border border-navy-50 shadow-2xl relative overflow-hidden">
                <h3 className="text-xl font-black text-navy-brand uppercase tracking-tight flex items-center gap-3 mb-8">
                  <Terminal className="w-6 h-6" /> Automated Summary
                </h3>
                <div className="bg-navy-50 p-8 rounded-[32px] font-mono text-sm text-charcoal whitespace-pre-wrap leading-relaxed shadow-inner">
                  {report.whatsappText}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card rounded-[48px] p-6 md:p-12 border border-navy-50 bg-white shadow-2xl text-center space-y-10 fade-in">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto border border-navy-100">
                <Lock className="w-10 h-10 text-navy-brand" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-navy-brand uppercase tracking-tighter">Engagement Protocol</h3>
                <p className="text-xs text-blue-gray font-bold uppercase tracking-widest italic">Define core system security PIN.</p>
              </div>
              <div className="max-w-xs mx-auto space-y-6">
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="0000"
                  maxLength="4"
                  className="w-full bg-navy-50 border-2 border-navy-100 rounded-[28px] px-8 py-6 text-center tracking-[1em] font-black text-3xl text-charcoal focus:border-navy-brand transition-all outline-none"
                />
                <button
                  onClick={() => {
                    localStorage.setItem('biztrack_locked', 'true');
                    localStorage.setItem('biztrack_pin', pin);
                    window.location.reload();
                  }}
                  className="btn-premium w-full !py-6"
                >
                  Engage Lockdown
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-in">
              <div className="glass-card p-10 rounded-[48px] bg-white border border-navy-50 shadow-xl space-y-6">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-brand border border-navy-100">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-navy-brand uppercase tracking-tight">System Export</h4>
                  <p className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest mt-2 h-8">Generate full structural backup.</p>
                </div>
                <button onClick={store.exportData} className="w-full py-5 bg-navy-50 text-navy-brand border border-navy-100 rounded-[24px] text-xs md:text-sm font-black uppercase hover:bg-navy-brand hover:text-white transition-all">Download Payload</button>
              </div>

              <div className="glass-card p-10 rounded-[48px] bg-white border border-navy-50 shadow-xl space-y-6">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-brand border border-navy-100">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-navy-brand uppercase tracking-tight">System Injection</h4>
                  <p className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest mt-2 h-8">Restore from structural backup.</p>
                </div>
                <label className="block">
                  <span className="w-full py-5 bg-navy-brand text-white rounded-[24px] text-xs md:text-sm font-black uppercase flex items-center justify-center cursor-pointer shadow-lg">Inject Payload</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 glass-card p-10 rounded-[48px] border-l-4 border-danger-pro bg-white shadow-xl flex items-center justify-between gap-8 mt-4">
                <div className="flex items-center gap-6">
                  <Trash2 className="w-10 h-10 text-danger-pro" />
                  <div>
                    <h4 className="text-xl font-black text-navy-brand uppercase tracking-tight">Factory Purge</h4>
                    <p className="text-xs md:text-sm text-blue-gray font-black uppercase tracking-widest mt-1">Permanently wipe all system data.</p>
                  </div>
                </div>
                <button onClick={() => store.showConfirm("Wipe all data?", store.clearAllData)} className="px-8 py-4 bg-danger-pro/5 text-danger-pro border border-danger-pro/10 rounded-2xl text-xs md:text-sm font-black uppercase hover:bg-danger-pro hover:text-white transition-all">Clear Systems</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
          <div className="glass-card rounded-[56px] shadow-2xl w-full max-w-xl relative bg-white border border-navy-50 overflow-hidden scale-in">
            <div className="p-6 md:p-12 text-center bg-navy-brand text-white">
              <h3 className="text-3xl font-black uppercase tracking-tighter">{editingUser ? 'Update Identity' : 'Provision Account'}</h3>
              <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] mt-2 opacity-60">Identity Authorization</p>
              <button onClick={() => { setShowInviteModal(false); setEditingUser(null); }} className="absolute top-10 right-10 p-3 rounded-full hover:bg-white/10 text-white transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const payload = {
                record_type: 'user',
                fullname: e.target.fullname.value.trim(),
                username: e.target.username.value.trim(),
                password: e.target.password.value,
                role: e.target.role.value,
                status: editingUser ? editingUser.status : 'active'
              };
              if (editingUser) {
                store.updateRecord({ ...editingUser, ...payload });
              } else {
                store.addRecord(payload);
              }
              setShowInviteModal(false);
              setEditingUser(null);
            }} className="p-6 md:p-12 space-y-8">
              <div className="space-y-6 text-center">
                <input name="fullname" type="text" required defaultValue={editingUser?.fullname || editingUser?.name || ''} className="w-full bg-navy-50 border border-navy-100 rounded-[28px] px-8 py-5 text-charcoal font-bold outline-none text-center italic" placeholder="Operator Name" />
                <input name="username" type="text" required defaultValue={editingUser?.username || ''} className="w-full bg-navy-50 border border-navy-100 rounded-[28px] px-8 py-5 text-charcoal font-bold outline-none text-center font-mono" placeholder="username_sector" />
                <input name="password" type="password" required defaultValue={editingUser?.password || ''} className="w-full bg-navy-50 border border-navy-100 rounded-[28px] px-8 py-5 text-charcoal font-bold outline-none text-center tracking-widest" placeholder="••••••••" />
                <select name="role" defaultValue={editingUser?.role || 'Operator'} className="w-full bg-navy-50 border border-navy-100 rounded-[28px] px-8 py-5 text-charcoal font-bold outline-none appearance-none text-center uppercase text-xs md:text-sm tracking-widest">
                  <option value="Operator">Operator Node</option>
                  <option value="Admin">Admin Node</option>
                  <option value="Master">Master Node</option>
                </select>
              </div>
              <button type="submit" className="btn-premium w-full !py-6">{editingUser ? 'Sync Protocol' : 'Authorize Node'} <ArrowRight className="w-5 h-5 ml-4" /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
