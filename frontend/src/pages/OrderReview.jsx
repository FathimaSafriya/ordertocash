import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Calendar, Tag, Building2, ShoppingBag, Award } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import CreditSummary from '../components/CreditSummary';
import OrderItemsTable from '../components/OrderItemsTable';
import AIRiskPanel from '../components/AIRiskPanel';
import ActionButtons from '../components/ActionButtons';
import AuditTrail from '../components/AuditTrail';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrderReview() {
  const { isSeniorManager } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title) => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4500);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrderById(id);
      if (res?.success) {
        setOrder(res.data);
      } else {
        setError('Order could not be retrieved.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sales order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleActionSuccess = (updatedOrder, message) => {
    setOrder((prev) => ({
      ...prev,
      ...updatedOrder,
      customerProfile: prev?.customerProfile
    }));
    addToast('success', message || 'Order updated successfully in SAP.', 'Action Executed');
  };

  const handleActionError = (errMsg) => {
    addToast('error', errMsg, 'Action Rejected');
  };

  const handleAssessmentUpdated = (newAssessment) => {
    setOrder((prev) => ({
      ...prev,
      riskAssessment: newAssessment
    }));
    addToast('success', 'Credit risk assessment recalculated with current exposure.', 'AI Analysis Complete');
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '—';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
        <RefreshCw size={32} color="var(--sap-primary)" className="spin" style={{ marginBottom: '14px' }} />
        <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--sap-text-main)' }}>
          Retrieving Sales Order {id} from SAP S/4HANA...
        </div>
        <div style={{ fontSize: '13px', marginTop: '4px' }}>Loading line items, exposure buffers, and customer credit master.</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Toast toasts={toasts} onDismiss={removeToast} />
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Back to Cockpit
          </Link>
        </div>
        <div className="panel-card" style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{ color: '#b91c1c', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
            Failed to Load Sales Order
          </div>
          <p style={{ color: 'var(--sap-text-muted)', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchOrderDetails}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={14} />
          Back to Cockpit Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={fetchOrderDetails} title="Refresh order state">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Order Header Banner */}
      <div className="panel-card" style={{ marginBottom: '20px' }}>
        <div className="panel-card-body" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <span className="mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--sap-primary)' }}>
                  {order.orderId}
                </span>
                <StatusBadge status={order.status} />
                {order.riskAssessment?.level && (
                  <RiskBadge level={order.riskAssessment.level} score={order.riskAssessment.score} />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--sap-text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--sap-text-main)' }}>
                  <Building2 size={15} color="var(--sap-primary)" />
                  {order.customerName} ({order.customerId})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {formatDate(order.orderDate)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={14} />
                  Credit Block Reason: <strong>{order.creditStatus || 'STANDARD_CHECK'}</strong>
                </span>
              </div>
            </div>

            {/* Total Order Amount Box */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--sap-text-muted)', fontWeight: 600 }}>
                Total Order Value
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--sap-text-main)', marginTop: '2px' }}>
                {formatCurrency(order.orderValue)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)' }}>
                Currency: <strong>{order.currency}</strong> | Org: {order.salesOrganization}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Senior Executive Alert Banner if ESCALATED */}
      {order.status === 'ESCALATED' && (
        <div style={{ background: '#faf5ff', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={22} color="#6d28d9" />
            <div>
              <div style={{ fontWeight: 700, color: '#4c1d95', fontSize: '13px' }}>Senior Executive Escalation Active</div>
              <div style={{ fontSize: '12px', color: '#6d28d9' }}>This order has been forwarded to the CFO / Credit Committee for executive waiver or collateral mandate.</div>
            </div>
          </div>
          {isSeniorManager ? (
            <Link to="/executive" className="btn btn-purple btn-sm">
              Open in Senior Manager Portal &rarr;
            </Link>
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', backgroundColor: '#ede9fe', border: '1px solid #c4b5fd', padding: '5px 12px', borderRadius: '14px' }}>
              Forwarded to CFO &bull; Awaiting Senior Review
            </span>
          )}
        </div>
      )}

      {/* Customer Financial & Credit Profile */}
      <CreditSummary customer={order.customerProfile} order={order} />

      {/* AI Decision Support Panel */}
      <AIRiskPanel
        orderId={order.orderId}
        initialAssessment={order.riskAssessment}
        onAssessmentUpdated={handleAssessmentUpdated}
      />

      {/* Decision Action Buttons */}
      <ActionButtons
        order={order}
        onActionSuccess={handleActionSuccess}
        onActionError={handleActionError}
      />

      {/* Order Line Items */}
      <OrderItemsTable items={order.items} currency={order.currency} />

      {/* Decision Audit Trail */}
      <AuditTrail auditTrail={order.auditTrail} />
    </div>
  );
}
