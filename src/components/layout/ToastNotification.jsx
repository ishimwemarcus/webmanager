import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export default function ToastNotification() {
  const { notification } = useStore();

  if (!notification) return null;

  const config = {
    success: { icon: CheckCircle2, color: 'text-success-pro', bg: 'bg-green-50', border: 'border-green-100' },
    error: { icon: XCircle, color: 'text-danger-pro', bg: 'bg-red-50', border: 'border-red-100' },
    warning: { icon: AlertCircle, color: 'text-[#2563eb]', bg: 'bg-amber-50', border: 'border-amber-100' }
  }[notification.type || 'success'];

  const Icon = config.icon;

  return (
    <div className="fixed bottom-10 right-10 z-[200] animate-slide-up no-print">
      <div className={`glass-card flex items-center gap-4 p-5 rounded-[28px] border ${config.border} ${config.bg} shadow-2xl min-w-[320px]`}>
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${config.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-gray/50 mb-0.5">System Message</p>
          <p className="text-sm font-black text-navy-brand">{notification.message}</p>
        </div>
      </div>
    </div>
  );
}
