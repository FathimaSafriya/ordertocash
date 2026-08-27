const { salesOrderService, creditService, isSapMode } = require('../integrations');
const { calculateRisk } = require('./riskEngine');
const { validateTransition, validateBusinessRules } = require('./workflowService');

class OrderService {
  /**
   * Get list of all sales orders with augmented risk indicators
   */
  async getSalesOrders(filter = {}) {
    const orders = await salesOrderService.getSalesOrders(filter);

    // Augment each order with quick risk calculation
    const augmented = await Promise.all(
      orders.map(async (order) => {
        try {
          const customer = await creditService.getCustomerCredit(order.customerId);
          if (customer) {
            const risk = calculateRisk(order, customer);
            return {
              ...order,
              riskScore: risk.score,
              riskLevel: risk.level,
              overdueAmount: customer.overdueAmount,
              creditLimit: customer.creditLimit,
              currentExposure: customer.currentExposure
            };
          }
        } catch (err) {
          // If customer lookup fails, preserve order with fallback
        }
        return order;
      })
    );

    return augmented;
  }

  /**
   * Get single order by ID with complete customer credit profile and risk assessment
   */
  async getSalesOrderById(orderId) {
    const order = await salesOrderService.getSalesOrderById(orderId);
    if (!order) return null;

    const customer = await creditService.getCustomerCredit(order.customerId);
    const risk = customer ? calculateRisk(order, customer) : null;

    return {
      ...order,
      customerProfile: customer || null,
      riskAssessment: risk ? {
        score: risk.score,
        level: risk.level,
        factors: risk.factors,
        recommendation: risk.recommendation
      } : null
    };
  }

  /**
   * Transition order to RELEASED
   */
  async releaseOrder(orderId, { decisionMaker, reason } = {}) {
    const order = await salesOrderService.getSalesOrderById(orderId);
    if (!order) {
      const err = new Error(`Sales order ${orderId} was not found.`);
      err.code = 'ORDER_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    const customer = await creditService.getCustomerCredit(order.customerId);
    const risk = customer ? calculateRisk(order, customer) : { level: 'LOW', score: 0 };

    // Validate workflow transition
    const transitionCheck = validateTransition(order.status, 'RELEASED');
    if (!transitionCheck.valid) {
      const err = new Error(transitionCheck.error);
      err.code = 'INVALID_STATUS_TRANSITION';
      err.status = 400;
      throw err;
    }

    // Validate business rules
    validateBusinessRules(order, customer, 'RELEASE', {
      riskLevel: risk.level,
      reason,
      decisionMaker
    });

    const updatedOrder = await salesOrderService.updateOrderStatus(orderId, 'RELEASED', {
      decisionMaker: decisionMaker || 'Credit Manager',
      reason: reason || 'Approved release following credit risk evaluation.',
      riskScore: risk.score,
      recommendation: 'RELEASE'
    });

    return updatedOrder;
  }

  /**
   * Transition order to HOLD
   */
  async holdOrder(orderId, { decisionMaker, reason } = {}) {
    const order = await salesOrderService.getSalesOrderById(orderId);
    if (!order) {
      const err = new Error(`Sales order ${orderId} was not found.`);
      err.code = 'ORDER_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    const customer = await creditService.getCustomerCredit(order.customerId);
    const risk = customer ? calculateRisk(order, customer) : { level: 'MEDIUM', score: 50 };

    const transitionCheck = validateTransition(order.status, 'HOLD');
    if (!transitionCheck.valid) {
      const err = new Error(transitionCheck.error);
      err.code = 'INVALID_STATUS_TRANSITION';
      err.status = 400;
      throw err;
    }

    validateBusinessRules(order, customer, 'HOLD', {
      riskLevel: risk.level,
      reason,
      decisionMaker
    });

    const updatedOrder = await salesOrderService.updateOrderStatus(orderId, 'HOLD', {
      decisionMaker: decisionMaker || 'Credit Manager',
      reason: reason || 'Placed on credit hold pending balance settlement or collateral.',
      riskScore: risk.score,
      recommendation: 'HOLD'
    });

    return updatedOrder;
  }

  /**
   * Transition order to ESCALATED
   */
  async escalateOrder(orderId, { decisionMaker, reason } = {}) {
    const order = await salesOrderService.getSalesOrderById(orderId);
    if (!order) {
      const err = new Error(`Sales order ${orderId} was not found.`);
      err.code = 'ORDER_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    const customer = await creditService.getCustomerCredit(order.customerId);
    const risk = customer ? calculateRisk(order, customer) : { level: 'HIGH', score: 80 };

    const transitionCheck = validateTransition(order.status, 'ESCALATED');
    if (!transitionCheck.valid) {
      const err = new Error(transitionCheck.error);
      err.code = 'INVALID_STATUS_TRANSITION';
      err.status = 400;
      throw err;
    }

    validateBusinessRules(order, customer, 'ESCALATE', {
      riskLevel: risk.level,
      reason,
      decisionMaker
    });

    const updatedOrder = await salesOrderService.updateOrderStatus(orderId, 'ESCALATED', {
      decisionMaker: decisionMaker || 'Credit Manager',
      reason: reason || 'Escalated to Head of Credit / CFO due to high credit limit breach.',
      riskScore: risk.score,
      recommendation: 'ESCALATE'
    });

    return updatedOrder;
  }
}

module.exports = new OrderService();
