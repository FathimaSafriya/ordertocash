import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        return (
          <div key={toast.id} className={`toast ${type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {type === 'success' && <CheckCircle2 size={18} color="#15803d" />}
              {type === 'error' && <AlertCircle size={18} color="#b91c1c" />}
              {type === 'warning' && <AlertTriangle size={18} color="#c2410c" />}
              <div>
                {toast.title && <div style={{ fontWeight: 600, fontSize: '13px' }}>{toast.title}</div>}
                <div style={{ fontSize: '12px' }}>{toast.message}</div>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(toast.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--sap-text-muted)', padding: '2px' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
