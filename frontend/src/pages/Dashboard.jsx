import React, { useState, useEffect } from 'react';
import { AlertOctagon, DollarSign, Clock, ShieldAlert, Layers, Search, RefreshCw } from 'lucide-react';
import KPICard from '../components/KPICard';
import OrderTable from '../components/OrderTable';
import Toast from '../components/Toast';
import api from '../services/api';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadData = async () => {
    setLoadingOrders(true);
    setLoadingKpis(true);

    try {
      const [kpiRes, ordersRes] = await Promise.all([
        api.getKpis(),
        api.getOrders()
      ]);

      if (kpiRes?.success) {
        setKpis(kpiRes.data);
      }
      if (ordersRes?.success) {
        setOrders(ordersRes.data);
      }
    } catch (err) {
      addToast('error', err.message || 'Failed to load cockpit data from backend.', 'Data Fetch Error');
    } finally {
      setLoadingOrders(false);
      setLoadingKpis(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '—';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q ||
      order.orderId.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerId.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div>
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2 className="page-title">AI Credit Release Cockpit</h2>
            <p className="page-subtitle">Order-to-Cash | Operational Credit Check & Release Workbench</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={loadData}
            disabled={loadingOrders || loadingKpis}
            title="Refresh cockpit data"
          >
            <RefreshCw size={13} className={loadingOrders ? 'spin' : ''} />
            Refresh Cockpit
          </button>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="kpi-grid">
        <KPICard
          label="Blocked Orders"
          value={kpis ? kpis.blockedOrdersCount : '—'}
          subtext="Pending credit evaluation"
          icon={AlertOctagon}
          color="#b91c1c"
          bg="#fee2e2"
        />
        <KPICard
          label="Blocked Order Value"
          value={kpis ? formatCurrency(kpis.blockedOrderValue) : '—'}
          subtext="Delayed revenue fulfillment"
          icon={DollarSign}
          color="#c2410c"
          bg="#ffedd5"
        />
        <KPICard
          label="Average Release Time"
          value={kpis ? kpis.avgReleaseTimeFormatted : '—'}
          subtext="Benchmark: < 4.0 hrs"
          icon={Clock}
          color="#0070f2"
          bg="#eff6ff"
        />
        <KPICard
          label="High Risk Orders"
          value={kpis ? kpis.highRiskOrdersCount : '—'}
          subtext="Requiring escalation / review"
          icon={ShieldAlert}
          color="#6d28d9"
          bg="#ede9fe"
        />
        <KPICard
          label="Total Credit Exposure"
          value={kpis ? formatCurrency(kpis.totalCreditExposure) : '—'}
          subtext="Active customer portfolio"
          icon={Layers}
          color="#0d9488"
          bg="#ccfbf1"
        />
      </div>

      {/* Cockpit Table Panel */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-title">
            <span>Credit Blocked Sales Orders</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sap-text-muted)', marginLeft: '6px' }}>
              ({filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'})
            </span>
          </div>
        </div>

        <div className="panel-card-body" style={{ paddingBottom: '8px' }}>
          {/* Toolbar */}
          <div className="cockpit-toolbar">
            <div className="filter-tabs">
              {['ALL', 'BLOCKED', 'UNDER_REVIEW', 'HOLD', 'ESCALATED', 'RELEASED'].map(tab => (
                <button
                  key={tab}
                  className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab === 'ALL' ? 'All Orders' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="search-box">
              <Search size={16} color="var(--sap-text-muted)" />
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Orders Table */}
          <OrderTable orders={filteredOrders} loading={loadingOrders} />
        </div>
      </div>
    </div>
  );
}
