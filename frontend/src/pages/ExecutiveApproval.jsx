import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  PauseCircle, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  FileText,
  UserCheck,
  AlertTriangle,
  Award
} from 'lucide-react';
import KPICard from '../components/KPICard';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import api from '../services/api';

export default function ExecutiveApproval() {
  const navigate = useNavigate();
  const [escalatedOrders, setEscalatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Executive Action Modal state
  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [executiveAction, setExecutiveAction] = useState(null); // 'RELEASE' | 'HOLD'
  const [executiveRole, setExecutiveRole] = useState('Jaris (Senior Finance Manager / CFO)');
  const [executiveNote, setExecutiveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addToast = (type, message, title) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadEscalatedOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({ status: 'ESCALATED' });
      if (res?.success) {
        setEscalatedOrders(res.data);
      }
    } catch (err) {
      addToast('error', err.message || 'Failed to fetch escalated orders.', 'Data Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscalatedOrders();
  }, []);

  const openActionModal = (order, action) => {
    setActiveModalOrder(order);
    setExecutiveAction(action);
    setExecutiveNote('');
  };

  const closeActionModal = () => {
    if (submitting) return;
    setActiveModalOrder(null);
    setExecutiveAction(null);
    setExecutiveNote('');
  };

  const handleConfirmExecutiveDecision = async (e) => {
    e.preventDefault();
    if (!activeModalOrder) return;
    setSubmitting(true);

    try {
      const payload = {
        decisionMaker: executiveRole,
        reason: executiveNote.trim() || (executiveAction === 'RELEASE' ? 'Executive credit limit override approved by CFO.' : 'Order placed on mandatory collateral hold by Executive Committee.')
      };

      let res;
      if (executiveAction === 'RELEASE') {
        res = await api.releaseOrder(activeModalOrder.orderId, payload);
      } else {
        res = await api.holdOrder(activeModalOrder.orderId, payload);
      }

      if (res?.success) {
        closeActionModal();
        addToast('success', res.message || `Executive decision executed for ${activeModalOrder.orderId}.`, 'Executive Action Logged');
        loadEscalatedOrders();
      }
    } catch (err) {
      addToast('error', err.message || 'Failed to execute executive decision.', 'Action Rejected');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '—';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  // Extract Credit Manager's latest escalation note from audit trail
  const getEscalationNote = (order) => {
    if (!order.auditTrail || order.auditTrail.length === 0) return 'Escalated for senior management review.';
    const escalationEntry = order.auditTrail.find(e => e.action?.includes('ESCALATED') || e.newStatus === 'ESCALATED');
    return escalationEntry?.reason || order.auditTrail[0]?.reason || 'Escalated for senior review.';
  };

  const totalEscalatedValue = escalatedOrders.reduce((sum, o) => sum + (o.orderValue || 0), 0);

  return (
    <div>
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Senior Manager Header Banner */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 className="page-title" style={{ color: '#1e1b4b' }}>
                Executive Escalation Workbench
              </h2>
              <span style={{ backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Award size={12} />
                SENIOR MANAGEMENT PORTAL
              </span>
            </div>
            <p className="page-subtitle">
              CFO & Credit Committee Governance | High-Risk Credit Limit Exceptions & Overrides
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={loadEscalatedOrders}
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              Refresh Escalations
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/')}
            >
              Back to Operations Cockpit
            </button>
          </div>
        </div>
      </div>

      {/* Executive KPI Metrics */}
      <div className="kpi-grid">
        <KPICard
          label="Orders Awaiting CFO Decision"
          value={loading ? '—' : escalatedOrders.length}
          subtext="High-risk escalated queue"
          icon={ShieldAlert}
          color="#6d28d9"
          bg="#ede9fe"
        />
        <KPICard
          label="Total Escalated Exposure"
          value={loading ? '—' : formatCurrency(totalEscalatedValue)}
          subtext="Requires executive override"
          icon={DollarSign}
          color="#b91c1c"
          bg="#fee2e2"
        />
        <KPICard
          label="Approval Authority Level"
          value="Unlimited"
          subtext="CFO / Senior Committee"
          icon={Award}
          color="#0070f2"
          bg="#eff6ff"
        />
        <KPICard
          label="Target Decision SLA"
          value="< 2.0 hrs"
          subtext="Executive turnaround standard"
          icon={Clock}
          color="#0d9488"
          bg="#ccfbf1"
        />
      </div>

      {/* Escalated Orders Review Table */}
      <div className="panel-card" style={{ border: '1px solid #c4b5fd', boxShadow: '0 4px 14px rgba(109, 40, 217, 0.08)' }}>
        <div className="panel-card-header" style={{ background: 'linear-gradient(to right, #faf5ff, #f8fafc)' }}>
          <div className="panel-title" style={{ color: '#4c1d95' }}>
            <ShieldAlert size={18} color="#6d28d9" />
            <span>Senior Executive Review Queue</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sap-text-muted)', marginLeft: '6px' }}>
              ({escalatedOrders.length} {escalatedOrders.length === 1 ? 'Order' : 'Orders'} Pending Approval)
            </span>
          </div>
        </div>

        <div className="panel-card-body">
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
              <RefreshCw size={30} color="#6d28d9" className="spin" style={{ marginBottom: '10px' }} />
              <div style={{ fontWeight: 600, color: 'var(--sap-text-main)' }}>Loading executive escalation queue from SAP...</div>
            </div>
          ) : escalatedOrders.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
              <CheckCircle2 size={42} color="#15803d" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--sap-text-main)' }}>Executive Queue is Clear!</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                There are currently no sales orders pending Senior Management / CFO review.
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>
                View Operations Cockpit
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="sap-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Order Value</th>
                    <th>Risk Tier</th>
                    <th>Overdue Balance</th>
                    <th>Credit Manager Escalation Note</th>
                    <th style={{ textAlign: 'right' }}>Executive Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {escalatedOrders.map((order) => (
                    <tr key={order.orderId} style={{ backgroundColor: '#faf5ff' }}>
                      <td>
                        <div className="mono" style={{ fontWeight: 700, color: '#6d28d9', fontSize: '14px' }}>
                          {order.orderId}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)' }}>
                          {formatDate(order.orderDate)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--sap-text-main)' }}>{order.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--sap-text-muted)' }}>ID: {order.customerId}</div>
                      </td>

                      <td style={{ fontWeight: 700, fontSize: '14px' }}>
                        {formatCurrency(order.orderValue)}
                      </td>

                      <td>
                        <RiskBadge level={order.riskLevel || 'HIGH'} score={order.riskScore} />
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: (order.overdueAmount || 0) > 0 ? '#b91c1c' : 'inherit' }}>
                          {formatCurrency(order.overdueAmount || 0)}
                        </span>
                      </td>

                      <td style={{ maxWidth: '340px' }}>
                        <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e9d5ff', fontSize: '12px', color: '#4c1d95', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 600 }}>Credit Manager: </span>
                          "{getEscalationNote(order)}"
                        </div>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/orders/${order.orderId}`)}
                            title="Open full financial audit review"
                          >
                            Details
                          </button>

                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => openActionModal(order, 'HOLD')}
                            title="Require letter of credit / bank guarantee"
                          >
                            <PauseCircle size={13} />
                            Mandate Hold
                          </button>

                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openActionModal(order, 'RELEASE')}
                            title="Grant executive one-time credit waiver"
                          >
                            <CheckCircle2 size={13} />
                            Approve Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Executive Decision Modal */}
      {activeModalOrder && (
        <div className="modal-overlay" onClick={closeActionModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: executiveAction === 'RELEASE' ? '#f0fdf4' : '#fffbeb' }}>
              <div className="modal-title" style={{ color: executiveAction === 'RELEASE' ? '#15803d' : '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} />
                <span>Executive Decision: {executiveAction === 'RELEASE' ? 'One-Time Credit Override' : 'Mandate Collateral Hold'}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmExecutiveDecision}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--sap-text-main)', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--sap-border-subtle)' }}>
                  <div><strong>Sales Order:</strong> {activeModalOrder.orderId} ({formatCurrency(activeModalOrder.orderValue)})</div>
                  <div><strong>Customer:</strong> {activeModalOrder.customerName}</div>
                  <div><strong>Escalation Reason:</strong> "{getEscalationNote(activeModalOrder)}"</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Approving Senior Authority</label>
                  <select
                    className="form-control"
                    value={executiveRole}
                    onChange={(e) => setExecutiveRole(e.target.value)}
                  >
                    <option value="Jaris (Senior Finance Manager / CFO)">Jaris (Senior Finance Manager / CFO)</option>
                    <option value="Jaris (Head of Credit Committee)">Jaris (Head of Credit Committee)</option>
                    <option value="Executive Finance Committee">Executive Finance Committee</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Executive Approval Note & Audit Mandate</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={
                      executiveAction === 'RELEASE' 
                        ? "e.g. One-time executive credit waiver approved based on strategic account relationship; payment guaranteed in 15 days."
                        : "e.g. Reject waiver; order must remain on hold until full payment of overdue invoices or bank guarantee."
                    }
                    value={executiveNote}
                    onChange={(e) => setExecutiveNote(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={closeActionModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-sm ${executiveAction === 'RELEASE' ? 'btn-success' : 'btn-warning'}`}
                  disabled={submitting}
                >
                  {submitting ? 'Recording in SAP...' : `Confirm Executive ${executiveAction === 'RELEASE' ? 'Override Release' : 'Hold'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
