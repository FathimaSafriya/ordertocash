import React from 'react';
import { CreditCard, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function CreditSummary({ customer, order }) {
  if (!customer) return null;

  const creditLimit = customer.creditLimit || 0;
  const currentExposure = customer.currentExposure || 0;
  const overdueAmount = customer.overdueAmount || 0;
  const availableCredit = Math.max(0, creditLimit - currentExposure);
  const orderValue = order?.orderValue || 0;
  
  const totalProjectedExposure = currentExposure + orderValue;
  const utilizationPercent = creditLimit > 0 ? Math.round((totalProjectedExposure / creditLimit) * 100) : 0;
  const isLimitBreached = totalProjectedExposure > creditLimit;

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '—';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const getProgressBarColor = () => {
    if (utilizationPercent > 100) return '#b91c1c'; // Red
    if (utilizationPercent > 80) return '#c2410c'; // Orange
    return '#15803d'; // Green
  };

  return (
    <div className="panel-card">
      <div className="panel-card-header">
        <div className="panel-title">
          <CreditCard size={18} color="var(--sap-primary)" />
          <span>Customer Financial & Credit Profile (System of Record: SAP S/4HANA)</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--sap-text-muted)', fontWeight: 500 }}>
          Segment: {customer.creditSegment || '1000'} | Rating: {customer.riskClass || 'Standard'}
        </span>
      </div>

      <div className="panel-card-body">
        {/* Metric Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--sap-border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Credit Limit</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{formatCurrency(creditLimit)}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--sap-border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Exposure</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: currentExposure > 0 ? '#1e293b' : 'inherit' }}>
              {formatCurrency(currentExposure)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)' }}>
              {creditLimit > 0 ? `${Math.round((currentExposure / creditLimit) * 100)}% of limit` : ''}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--sap-border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Available Buffer</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: availableCredit > 0 ? '#15803d' : '#b91c1c' }}>
              {formatCurrency(availableCredit)}
            </div>
          </div>

          <div style={{ background: overdueAmount > 0 ? '#fef2f2' : '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: `1px solid ${overdueAmount > 0 ? '#fca5a5' : 'var(--sap-border-subtle)'}` }}>
            <div style={{ fontSize: '11px', color: overdueAmount > 0 ? '#991b1b' : 'var(--sap-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Overdue Liabilities
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: overdueAmount > 0 ? '#b91c1c' : 'inherit' }}>
              {formatCurrency(overdueAmount)}
            </div>
            {overdueAmount > 0 && (
              <div style={{ fontSize: '11px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <AlertTriangle size={11} />
                Requires review
              </div>
            )}
          </div>
        </div>

        {/* Credit Limit vs Exposure Bar */}
        <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px 16px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
            <span>Credit Limit Utilization with Current Order ({formatCurrency(orderValue)})</span>
            <span style={{ color: getProgressBarColor() }}>
              {utilizationPercent}% {isLimitBreached ? '(Limit Exceeded!)' : ''}
            </span>
          </div>

          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, utilizationPercent)}%`,
                backgroundColor: getProgressBarColor()
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--sap-text-muted)', marginTop: '4px' }}>
            <span>Current Exposure: {formatCurrency(currentExposure)}</span>
            <span>Projected: {formatCurrency(totalProjectedExposure)} / {formatCurrency(creditLimit)}</span>
          </div>
        </div>

        {/* Payment History Note */}
        {customer.paymentHistory && (
          <div style={{ fontSize: '12px', color: 'var(--sap-text-muted)', background: '#f1f5f9', padding: '10px 14px', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <TrendingUp size={15} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--sap-primary)' }} />
            <div>
              <span style={{ fontWeight: 600, color: 'var(--sap-text-main)' }}>Payment Behavior: </span>
              {customer.paymentHistory}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
