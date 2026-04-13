import React from 'react';
import { useToasts } from '../services/notifications';

const variantStyles: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-orange-200 bg-orange-50 text-slate-900',
};

export const ToastViewport: React.FC = () => {
  const { toasts, dismiss } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${variantStyles[toast.type]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-widest">{toast.title}</p>
              {toast.message && <p className="mt-1 text-sm leading-relaxed text-slate-600">{toast.message}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700">
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
