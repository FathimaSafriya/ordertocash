import React, { useState } from 'react';
import { CheckCircle2, PauseCircle, ArrowUpRight, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ActionButtons({ order, onActionSuccess, onActionError }) {
  const { user } = useAuth();
  const defaultDecisionMaker = user ? `${user.name} (${user.roleLabel})` : 'Credit Manager';
  const [modalAction, setModalAction] = useState(null); // 'RELEASE' | 'HOLD' | 'ESCALATE'
  const [reason, setReason] = useState('');
  const [decisionMaker, setDecisionMaker] = useState(defaultDecisionMaker);
  const [submitting, setSubmitting] = useState(false);

  const isTerminal = order.status === 'RELEASED';

  const openModal = (action) => {
    setModalAction(action);
    setReason('');
    setDecisionMaker(defaultDecisionMaker);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalAction(null);
    setReason('');
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res;
      const payload = {
        reason: reason.trim() || undefined,
        decisionMaker
      };

      if (modalAction === 'RELEASE') {
        res = await api.releaseOrder(order.orderId, payload);
      } else if (modalAction === 'HOLD') {
        res = await api.holdOrder(order.orderId, payload);
      } else if (modalAction === 'ESCALATE') {
        res = await api.escalateOrder(order.orderId, payload);
      }

      if (res?.success) {
        closeModal();
        if (onActionSuccess) {
          onActionSuccess(res.data, res.message);
        }
      }
    } catch (err) {
      if (onActionError) {
        onActionError(err.message || 'Operation failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-title">
            <AlertCircle size={18} color="var(--sap-primary)" />
            <span>Credit Decision Actions</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--sap-text-muted)' }}>
            Current Status: <strong style={{ color: 'var(--sap-text-main)' }}>{order.status}</strong>
          </span>
        </div>

        <div className="panel-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>Make Business Decision</div>
            <div style={{ fontSize: '12px', color: 'var(--sap-text-muted)' }}>
              Decisions are verified against SAP business rules, dispatched to the backend, and recorded in the audit log.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-warning"
              onClick={() => openModal('HOLD')}
              disabled={isTerminal || submitting}
              title="Place sales order on credit hold"
            >
              <PauseCircle size={16} />
              HOLD ORDER
            </button>

            <button
              className="btn btn-purple"
              onClick={() => openModal('ESCALATE')}
              disabled={isTerminal || submitting}
              title="Escalate order to Senior Management / CFO"
            >
              <ArrowUpRight size={16} />
              ESCALATE
            </button>

            <button
              className="btn btn-success"
              onClick={() => openModal('RELEASE')}
              disabled={isTerminal || submitting}
              title="Release sales order from credit block"
            >
              <CheckCircle2 size={16} />
              RELEASE ORDER
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Audit Reason Modal */}
      {modalAction && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                Confirm Decision: <span style={{ color: 'var(--sap-primary)' }}>{modalAction}</span>
              </div>
              <button
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--sap-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAction}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--sap-text-main)' }}>
                  You are performing action <strong>{modalAction}</strong> on Sales Order <strong>{order.orderId}</strong> ({order.customerName}).
                </div>

                <div className="form-group">
                  <label className="form-label">Decision Maker</label>
                  <input
                    type="text"
                    className="form-control"
                    value={decisionMaker}
                    onChange={(e) => setDecisionMaker(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Business Justification & Audit Note
                    {modalAction === 'RELEASE' && (order.riskAssessment?.level === 'HIGH' || order.riskLevel === 'HIGH') && (
                      <span style={{ color: '#b91c1c', marginLeft: '4px' }}>* Required for High-Risk Release</span>
                    )}
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={`Provide rationale for ${modalAction.toLowerCase()}ing this order...`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required={modalAction === 'RELEASE' && (order.riskAssessment?.level === 'HIGH' || order.riskLevel === 'HIGH')}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-sm ${
                    modalAction === 'RELEASE' ? 'btn-success' : modalAction === 'HOLD' ? 'btn-warning' : 'btn-purple'
                  }`}
                  disabled={submitting}
                >
                  {submitting ? 'Updating order...' : `Confirm ${modalAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
