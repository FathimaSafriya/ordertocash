import React from 'react';
import { History } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function AuditTrail({ auditTrail = [] }) {
  if (!auditTrail || auditTrail.length === 0) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="panel-card">
      <div className="panel-card-header">
        <div className="panel-title">
          <History size={18} color="var(--sap-primary)" />
          <span>Decision Audit Trail & Workflow History</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--sap-text-muted)', fontWeight: 500 }}>
          {auditTrail.length} Recorded {auditTrail.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>

      <div className="table-responsive">
        <table className="sap-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Transition</th>
              <th>Decision Maker</th>
              <th>Business Justification / Reason</th>
            </tr>
          </thead>
          <tbody>
            {auditTrail.map((entry, idx) => (
              <tr key={entry.id || idx}>
                <td style={{ fontSize: '12px', color: 'var(--sap-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(entry.timestamp)}
                </td>
                <td style={{ fontWeight: 600 }}>
                  <span className="mono" style={{ fontSize: '11px' }}>{entry.action}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--sap-text-muted)' }}>{entry.previousStatus}</span>
                    <span style={{ color: 'var(--sap-text-muted)' }}>→</span>
                    <StatusBadge status={entry.newStatus} />
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>
                  {entry.decisionMaker}
                </td>
                <td style={{ fontSize: '12px', color: '#334155', maxWidth: '380px' }}>
                  {entry.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
