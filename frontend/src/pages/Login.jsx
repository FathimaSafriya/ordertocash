import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // Active Role Tab: 'CREDIT_MANAGER' vs 'SENIOR_MANAGER'
  const [selectedRole, setSelectedRole] = useState('CREDIT_MANAGER');
  const [username, setUsername] = useState('safriya@kaartech.com');
  const [password, setPassword] = useState('Credit@123');
  const [error, setError] = useState(null);

  const handleTabSwitch = (role) => {
    setError(null);
    setSelectedRole(role);
    if (role === 'CREDIT_MANAGER') {
      setUsername('safriya@kaartech.com');
      setPassword('Credit@123');
    } else {
      setUsername('jaris.cfo@kaartech.com');
      setPassword('Executive@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await login(username, password);
    if (res.success) {
      if (res.user.role === 'SENIOR_MANAGER') {
        navigate('/executive');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const isCM = selectedRole === 'CREDIT_MANAGER';

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '490px', width: '100%' }}>
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: isCM
                ? 'linear-gradient(135deg, #0070f2 0%, #003e8a 100%)'
                : 'linear-gradient(135deg, #6d28d9 0%, #3b0764 100%)',
              color: 'white',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isCM ? '0 4px 12px rgba(0, 112, 242, 0.3)' : '0 4px 12px rgba(109, 40, 217, 0.3)',
              marginBottom: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            {isCM ? <ShieldCheck size={34} /> : <Award size={34} />}
          </div>
          <h2 style={{ fontSize: '23px', fontWeight: 800, color: 'var(--sap-text-main)', letterSpacing: '-0.02em' }}>
            AI Credit Release Cockpit
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--sap-text-muted)', marginTop: '4px' }}>
            SAP S/4HANA Order-to-Cash (O2C) &bull; Enterprise Role Authentication
          </p>
        </div>

        {/* Form Container */}
        <div className="panel-card" style={{ padding: '0', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          {/* Distinct Portal Selection Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--sap-border)', background: '#f8fafc' }}>
            <button
              type="button"
              onClick={() => handleTabSwitch('CREDIT_MANAGER')}
              style={{
                flex: 1,
                padding: '14px 12px',
                border: 'none',
                borderBottom: isCM ? '3px solid var(--sap-primary)' : '3px solid transparent',
                backgroundColor: isCM ? 'white' : 'transparent',
                fontWeight: 700,
                fontSize: '13px',
                color: isCM ? 'var(--sap-primary)' : 'var(--sap-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <UserCheck size={16} />
              <span>Credit Manager</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('SENIOR_MANAGER')}
              style={{
                flex: 1,
                padding: '14px 12px',
                border: 'none',
                borderBottom: !isCM ? '3px solid #6d28d9' : '3px solid transparent',
                backgroundColor: !isCM ? 'white' : 'transparent',
                fontWeight: 700,
                fontSize: '13px',
                color: !isCM ? '#6d28d9' : 'var(--sap-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Award size={16} />
              <span>Senior Manager</span>
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Active Role Information Card */}
            <div
              style={{
                background: isCM ? '#f0f7ff' : '#faf5ff',
                border: `1px solid ${isCM ? '#bfdbfe' : '#e9d5ff'}`,
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13px', color: isCM ? '#0070f2' : '#6d28d9' }}>
                {isCM ? 'Credit Operations Workbench Sign-In' : 'Senior Executive Escalation Portal'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sap-text-muted)', marginTop: '3px' }}>
                {isCM ? (
                  <>
                    Sign in as <strong>Safriya</strong> &bull; Credit Operations Manager (DOA: ₹10 Lakh)
                  </>
                ) : (
                  <>
                    Sign in as <strong>Jaris</strong> &bull; Senior Finance Manager / CFO (DOA: Unlimited)
                  </>
                )}
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '12px', marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} />
                  Corporate User Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} />
                  SAP System Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn ${isCM ? 'btn-primary' : 'btn-purple'}`}
                style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating with SAP...' : `Sign In as ${isCM ? 'Credit Manager (Safriya)' : 'Senior Manager (Jaris)'}`}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Credentials Reference Box */}
        <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid var(--sap-border-subtle)', borderRadius: '6px', padding: '12px 16px', fontSize: '11px', color: 'var(--sap-text-muted)' }}>
          <div style={{ fontWeight: 600, color: 'var(--sap-text-main)', marginBottom: '4px' }}>Separate Role Credentials:</div>
          <div>&bull; <strong>Credit Manager (Safriya):</strong> <code>safriya@kaartech.com</code> / <code>Credit@123</code></div>
          <div>&bull; <strong>Senior Manager (Jaris):</strong> <code>jaris.cfo@kaartech.com</code> / <code>Executive@123</code></div>
        </div>
      </div>
    </div>
  );
}
