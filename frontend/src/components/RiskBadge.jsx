import React from 'react';
import { ShieldAlert, ShieldAlert as ShieldIcon, ShieldCheck } from 'lucide-react';

export default function RiskBadge({ level, score }) {
  const normalized = (level || 'LOW').toUpperCase();

  return (
    <span className={`risk-badge ${normalized}`} title={score !== undefined ? `Risk Score: ${score}/100` : ''}>
      {normalized === 'HIGH' && <ShieldAlert size={12} />}
      {normalized === 'MEDIUM' && <ShieldIcon size={12} />}
      {normalized === 'LOW' && <ShieldCheck size={12} />}
      <span>{normalized}</span>
      {score !== undefined && <span style={{ opacity: 0.75 }}>({score})</span>}
    </span>
  );
}
