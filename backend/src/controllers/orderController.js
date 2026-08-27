const orderService = require('../services/orderService');
const creditService = require('../services/creditService');
const riskEngine = require('../services/riskEngine');
const aiService = require('../services/aiService');

class OrderController {
  /**
   * GET /api/orders
   */
  async getOrders(req, res, next) {
    try {
      const { status, customerId, search } = req.query;
      const orders = await orderService.getSalesOrders({ status, customerId, search });
      res.json({
        success: true,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getSalesOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Sales order ${id} was not found.`
          }
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/orders/:id/risk
   * Pure deterministic calculation
   */
  async getOrderRisk(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getSalesOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Sales order ${id} was not found.`
          }
        });
      }

      const customer = await creditService.getCustomerById(order.customerId);
      const risk = riskEngine.calculateRisk(order, customer);

      res.json({
        success: true,
        data: {
          orderId: order.orderId,
          riskScore: risk.score,
          riskLevel: risk.level,
          factors: risk.factors,
          recommendation: risk.recommendation,
          breakdown: risk.breakdown,
          source: 'DETERMINISTIC_ENGINE'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/orders/:id/ai-assessment
   * Grounded AI evaluation with rule-based fallback
   */
  async getAiAssessment(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getSalesOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Sales order ${id} was not found.`
          }
        });
      }

      const customer = await creditService.getCustomerById(order.customerId);
      const assessment = await aiService.assessCreditRisk(order, customer);

      res.json({
        success: true,
        data: assessment
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/orders/:id/release
   */
  async releaseOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, decisionMaker } = req.body || {};

      const updated = await orderService.releaseOrder(id, {
        reason,
        decisionMaker: decisionMaker || 'Credit Manager'
      });

      res.json({
        success: true,
        data: updated,
        message: `Sales order ${id} successfully released from credit block.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/orders/:id/hold
   */
  async holdOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, decisionMaker } = req.body || {};

      const updated = await orderService.holdOrder(id, {
        reason,
        decisionMaker: decisionMaker || 'Credit Manager'
      });

      res.json({
        success: true,
        data: updated,
        message: `Sales order ${id} successfully placed on credit hold.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/orders/:id/escalate
   */
  async escalateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, decisionMaker } = req.body || {};

      const updated = await orderService.escalateOrder(id, {
        reason,
        decisionMaker: decisionMaker || 'Credit Manager'
      });

      res.json({
        success: true,
        data: updated,
        message: `Sales order ${id} escalated to senior management.`
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderController();
