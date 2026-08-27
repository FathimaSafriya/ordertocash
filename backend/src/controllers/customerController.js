const creditService = require('../services/creditService');

class CustomerController {
  /**
   * GET /api/customers/:id
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await creditService.getCustomerById(id);
      res.json({
        success: true,
        data: customer
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/customers
   */
  async getCustomers(req, res, next) {
    try {
      const customers = await creditService.getCustomers();
      res.json({
        success: true,
        data: customers
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
