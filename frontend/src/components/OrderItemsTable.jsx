import React from 'react';
import { Package } from 'lucide-react';

export default function OrderItemsTable({ items = [], currency = 'INR' }) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '—';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="panel-card">
      <div className="panel-card-header">
        <div className="panel-title">
          <Package size={18} color="var(--sap-primary)" />
          <span>Sales Order Line Items</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--sap-text-muted)', fontWeight: 500 }}>
          {items.length} {items.length === 1 ? 'Line Item' : 'Line Items'}
        </span>
      </div>

      <div className="table-responsive">
        <table className="sap-table">
          <thead>
            <tr>
              <th>Item #</th>
              <th>Material ID</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.itemId}>
                <td className="mono" style={{ color: 'var(--sap-text-muted)' }}>
                  {item.itemId}
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  {item.materialId}
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{item.materialName}</span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
