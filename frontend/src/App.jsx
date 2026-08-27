import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import OrderReview from './pages/OrderReview';
import ExecutiveApproval from './pages/ExecutiveApproval';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ExecutiveRoute({ children }) {
  const { isAuthenticated, isSeniorManager } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isSeniorManager) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executive"
            element={
              <ExecutiveRoute>
                <ExecutiveApproval />
              </ExecutiveRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer style={{ borderTop: '1px solid var(--sap-border)', padding: '16px 28px', textAlign: 'center', fontSize: '12px', color: 'var(--sap-text-muted)', background: 'var(--sap-surface)', marginTop: 'auto' }}>
        <div>
          <strong>SAP S/4HANA Order-to-Cash (O2C)</strong> &bull; AI-Powered Credit Release Cockpit &bull; Role-Based Governance
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px' }}>
          Credit Manager &bull; Senior Executive / CFO &bull; Human-in-the-Loop Decision Support
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
