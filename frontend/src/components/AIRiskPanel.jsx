import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Cpu, BookOpen } from 'lucide-react';
import RiskBadge from './RiskBadge';
import api from '../services/api';

export default function AIRiskPanel({ orderId, initialAssessment, onAssessmentUpdated }) {
  const [assessment, setAssessment] = useState(initialAssessment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAiAssessment(orderId);
      if (res?.success) {
        setAssessment(res.data);
        if (onAssessmentUpdated) {
          onAssessmentUpdated(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI assessment.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 61) return '#b91c1c';
    if (score >= 31) return '#c2410c';
    return '#15803d';
  };

  const getRecommendationBadge = (rec) => {
    switch (rec?.toUpperCase()) {
      case 'RELEASE':
        return <span className="status-badge RELEASED"><CheckCircle2 size={12} /> Release Recommended</span>;
      case 'HOLD':
        return <span className="status-badge HOLD"><AlertTriangle size={12} /> Hold Recommended</span>;
      case 'ESCALATE':
        return <span className="status-badge ESCALATED"><ShieldAlert size={12} /> Escalate Recommended</span>;
      default:
        return <span className="status-badge UNDER_REVIEW">{rec || 'Under Review'}</span>;
    }
  };

  return (
    <div className="panel-card" style={{ border: '1px solid #c7d2fe', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)' }}>
      <div className="panel-card-header" style={{ background: 'linear-gradient(to right, #f8faff, #f1f5f9)' }}>
        <div className="panel-title" style={{ color: '#312e81' }}>
          <Sparkles size={18} color="#4f46e5" />
          <span>AI Decision Support & Credit Risk Assessment</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {assessment?.source && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: assessment.source === 'AI_ASSISTED' ? '#e0e7ff' : '#f1f5f9',
                color: assessment.source === 'AI_ASSISTED' ? '#3730a3' : '#475569',
                border: '1px solid #cbd5e1'
              }}
            >
              {assessment.source === 'AI_ASSISTED' ? <Cpu size={12} /> : <BookOpen size={12} />}
              Source: {assessment.source === 'AI_ASSISTED' ? 'AI Assisted (Grounded)' : 'Rule-Based Engine (Fallback)'}
            </span>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={handleRunAssessment}
            disabled={loading}
            style={{ borderColor: '#818cf8', color: '#4338ca', background: 'white' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Analyzing credit risk...' : 'Run AI Assessment'}
          </button>
        </div>
      </div>

      <div className="panel-card-body">
        {loading ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
            <div style={{ marginBottom: '10px' }}>
              <Sparkles size={28} color="#4f46e5" className="spin" />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--sap-text-main)' }}>Analyzing credit risk with business rules & data grounding...</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Evaluating exposure utilization, past payment performance, and order size.</div>
          </div>
        ) : error ? (
          <div style={{ padding: '16px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', fontSize: '13px' }}>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Assessment Error</div>
            {error}
          </div>
        ) : assessment ? (
          <div>
            {/* Risk Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--sap-border-subtle)' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--sap-text-muted)', fontWeight: 600 }}>Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: getScoreColor(assessment.riskScore), lineHeight: 1 }}>
                    {assessment.riskScore}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--sap-text-muted)', fontWeight: 500 }}>/ 100</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--sap-text-muted)', fontWeight: 600 }}>Evaluated Risk Tier</div>
                <div style={{ marginTop: '8px' }}>
                  <RiskBadge level={assessment.riskLevel} score={assessment.riskScore} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--sap-text-muted)', fontWeight: 600 }}>System Recommendation</div>
                <div style={{ marginTop: '8px' }}>
                  {getRecommendationBadge(assessment.recommendation)}
                </div>
              </div>
            </div>

            {/* Grounded Explanation */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sap-text-muted)', marginBottom: '6px' }}>
                Executive Rationale & Assessment
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '6px', borderLeft: `4px solid ${getScoreColor(assessment.riskScore)}`, fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                {assessment.explanation}
              </div>
            </div>

            {/* Identified Factors */}
            {assessment.factors && assessment.factors.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sap-text-muted)', marginBottom: '8px' }}>
                  Key Risk Drivers
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {assessment.factors.map((factor, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--sap-text-main)' }}>
                      <span style={{ color: getScoreColor(assessment.riskScore), fontWeight: 700 }}>•</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--sap-text-muted)' }}>
            <p style={{ fontSize: '13px', marginBottom: '12px' }}>No risk assessment has been executed for this order yet.</p>
            <button className="btn btn-primary btn-sm" onClick={handleRunAssessment}>
              <Sparkles size={14} />
              Run Risk Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
