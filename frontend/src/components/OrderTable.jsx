import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';

export default function OrderTable({ orders = [], loading = false }) {
  const navigate = useNavigate();

  const formatCurrency = (val, currency = 'INR') => {
    if (val === undefined || val === null) return '—';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
        <div style={{ marginBottom: '12px' }}>
          <div className="dot" style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--sap-primary)', animation: 'pulse 1.2s infinite' }}></div>
        </div>
        <div style={{ fontWeight: 600 }}>Loading sales orders from SAP...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
        <FileText size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--sap-text-main)' }}>No Sales Orders Found</div>
        <div style={{ fontSize: '13px', marginTop: '4px' }}>No orders match the selected filter criteria.</div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="sap-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Order Value</th>
            <th>Credit Status</th>
            <th>Risk Tier</th>
            <th>Overdue Balance</th>
            <th>Order Date</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const hasOverdue = (order.overdueAmount || 0) > 0;
            return (
              <tr key={order.orderId}>
                <td>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--sap-primary)' }}>
                    {order.orderId}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)' }}>ID: {order.customerId}</div>
                </td>
                <td style={{ fontWeight: 600 }}>
                  {formatCurrency(order.orderValue, order.currency)}
                </td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  <RiskBadge level={order.riskLevel || 'LOW'} score={order.riskScore} />
                </td>
                <td>
                  <span style={{ fontWeight: hasOverdue ? 600 : 400, color: hasOverdue ? '#b91c1c' : 'var(--sap-text-muted)' }}>
                    {formatCurrency(order.overdueAmount || 0)}
                  </span>
                </td>
                <td style={{ color: 'var(--sap-text-muted)', fontSize: '12px' }}>
                  {formatDate(order.orderDate)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    title={`Review order ${order.orderId}`}
                  >
                    Review
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
