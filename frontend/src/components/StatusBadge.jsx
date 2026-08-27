import React from 'react';
import { AlertCircle, Clock, CheckCircle2, PauseCircle, ArrowUpRight } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'BLOCKED').toUpperCase();

  const getIcon = () => {
    switch (normalized) {
      case 'BLOCKED':
        return <AlertCircle size={12} />;
      case 'UNDER_REVIEW':
        return <Clock size={12} />;
      case 'RELEASED':
        return <CheckCircle2 size={12} />;
      case 'HOLD':
        return <PauseCircle size={12} />;
      case 'ESCALATED':
        return <ArrowUpRight size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case 'UNDER_REVIEW':
        return 'Under Review';
      default:
        return normalized.charAt(0) + normalized.slice(1).toLowerCase();
    }
  };

  return (
    <span className={`status-badge ${normalized}`}>
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
}
