import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Server, Award, LayoutDashboard, LogOut, UserCheck, LogIn } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [health, setHealth] = useState(null);
  const [escalatedCount, setEscalatedCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isSeniorManager } = useAuth();

  useEffect(() => {
    api.getHealth()
      .then((res) => {
        if (res?.success) {
          setHealth(res.data);
        }
      })
      .catch((err) => {
        console.warn('Health check failed:', err);
      });

    // Check escalated orders count
    api.getOrders({ status: 'ESCALATED' })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setEscalatedCount(res.data.length);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSap = health?.sapMode === 'sap';
  const isExecutivePage = location.pathname === '/executive';

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="navbar-logo">
            <ShieldCheck size={24} />
          </div>
          <div className="navbar-title">
            <h1>AI Credit Release Cockpit</h1>
            <span>SAP S/4HANA Order-to-Cash (O2C) | Decision Support</span>
          </div>
        </Link>
      </div>

      {/* Role View: Strict Separation between Credit Manager and Senior Manager */}
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSeniorManager ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/executive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6d28d9',
                  backgroundColor: '#ede9fe',
                  border: '1px solid #c4b5fd',
                  textDecoration: 'none'
                }}
              >
                <Award size={14} />
                <span>Senior Executive Portal</span>
                {escalatedCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#6d28d9',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '1px 6px',
                      marginLeft: '2px'
                    }}
                  >
                    {escalatedCount}
                  </span>
                )}
              </Link>
              <Link
                to="/"
                style={{
                  fontSize: '12px',
                  color: 'var(--sap-text-muted)',
                  textDecoration: 'none',
                  padding: '4px 8px'
                }}
              >
                View Cockpit
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--sap-primary)' }}>
              <LayoutDashboard size={14} />
              <span>Credit Operations Workbench</span>
            </div>
          )}
        </div>
      )}

      <div className="navbar-meta">
        {/* Environment Mode Indicator */}
        <div className={`mode-badge ${isSap ? 'sap' : 'mock'}`} title={`System Mode: ${health?.sapMode?.toUpperCase() || 'MOCK'}`}>
          <span className="dot"></span>
          {isSap ? (
            <>
              <Server size={14} />
              <span>SAP S/4HANA CONNECTED</span>
            </>
          ) : (
            <>
              <Database size={14} />
              <span>DEMO / MOCK SAP MODE</span>
            </>
          )}
        </div>

        {/* User Identity & Logout Button */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--sap-border)', paddingLeft: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isSeniorManager ? '#6d28d9' : '#0070f2',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isSeniorManager ? <Award size={16} /> : <UserCheck size={16} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--sap-text-main)' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '11px', color: isSeniorManager ? '#6d28d9' : 'var(--sap-primary)', fontWeight: 600 }}>
                  {user.roleLabel}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--sap-text-muted)' }}
              title="Sign out of SAP session"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <LogIn size={14} />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
