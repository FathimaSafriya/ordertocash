const { salesOrders, customers } = require('../../data/seedData');
const { mapSapSalesOrderToCanonical } = require('../sap/sapMapper');

class MockSalesOrderService {
  constructor() {
    // Deep clone initial seed data to maintain mutable state during demo sessions
    this.orders = JSON.parse(JSON.stringify(salesOrders));
    this.customers = JSON.parse(JSON.stringify(customers));
  }

  /**
   * Get list of all sales orders (mapped to canonical model)
   * @param {Object} [filter]
   * @returns {Promise<Array>}
   */
  async getSalesOrders(filter = {}) {
    let result = [...this.orders];

    if (filter.status) {
      result = result.filter(o => o.status.toUpperCase() === filter.status.toUpperCase());
    }
    if (filter.customerId) {
      result = result.filter(o => o.customerId === filter.customerId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerId.toLowerCase().includes(q)
      );
    }

    return result.map(o => {
      const cust = this.customers.find(c => c.customerId === o.customerId);
      return mapSapSalesOrderToCanonical(o, cust);
    });
  }

  /**
   * Get single sales order by ID
   * @param {string} orderId
   * @returns {Promise<Object|null>}
   */
  async getSalesOrderById(orderId) {
    const rawOrder = this.orders.find(o => o.orderId.toUpperCase() === orderId.toUpperCase());
    if (!rawOrder) return null;

    const cust = this.customers.find(c => c.customerId === rawOrder.customerId);
    return mapSapSalesOrderToCanonical(rawOrder, cust);
  }

  /**
   * Update order status & append audit record
   * @param {string} orderId
   * @param {string} newStatus
   * @param {Object} auditDetails
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, newStatus, auditDetails = {}) {
    const orderIndex = this.orders.findIndex(o => o.orderId.toUpperCase() === orderId.toUpperCase());
    if (orderIndex === -1) {
      throw new Error(`Sales order ${orderId} not found.`);
    }

    const order = this.orders[orderIndex];
    const previousStatus = order.status;
    order.status = newStatus;

    // Update credit status flag
    if (newStatus === 'RELEASED') {
      order.creditStatus = 'CREDIT_RELEASED_BY_MANAGER';
    } else if (newStatus === 'HOLD') {
      order.creditStatus = 'CREDIT_HELD_FOR_REVIEW';
    } else if (newStatus === 'ESCALATED') {
      order.creditStatus = 'ESCALATED_TO_MANAGEMENT';
    } else if (newStatus === 'UNDER_REVIEW') {
      order.creditStatus = 'UNDER_CREDIT_REVIEW';
    }

    // Add audit entry
    if (!order.auditTrail) {
      order.auditTrail = [];
    }

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action: `STATUS_TRANSITION_${newStatus}`,
      previousStatus,
      newStatus,
      decisionMaker: auditDetails.decisionMaker || 'Credit Manager (Current User)',
      reason: auditDetails.reason || 'Decision recorded in Credit Release Cockpit.',
      riskScore: auditDetails.riskScore || null,
      recommendation: auditDetails.recommendation || null,
      source: auditDetails.source || 'Manual Cockpit Action'
    };

    order.auditTrail.unshift(auditEntry);

    const cust = this.customers.find(c => c.customerId === order.customerId);
    return mapSapSalesOrderToCanonical(order, cust);
  }

  /**
   * Reset mock data to initial seeds (useful for testing/demo resets)
   */
  reset() {
    this.orders = JSON.parse(JSON.stringify(salesOrders));
  }
}

module.exports = new MockSalesOrderService();
