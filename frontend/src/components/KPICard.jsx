import React from 'react';

export default function KPICard({ label, value, subtext, icon: Icon, color = '#0070f2', bg = '#eff6ff' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon" style={{ backgroundColor: bg, color: color }}>
          {Icon && <Icon size={18} />}
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      {subtext && <div className="kpi-subtext">{subtext}</div>}
    </div>
  );
}
