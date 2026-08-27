const { creditService } = require('../integrations');

class DomainCreditService {
  /**
   * Get customer by ID with full credit profile
   * @param {string} customerId
   */
  async getCustomerById(customerId) {
    const customer = await creditService.getCustomerCredit(customerId);
    if (!customer) {
      const err = new Error(`Customer with ID '${customerId}' was not found in SAP Master Data.`);
      err.code = 'CUSTOMER_NOT_FOUND';
      err.status = 404;
      throw err;
    }
    return customer;
  }

  /**
   * Get all customer credit profiles
   */
  async getCustomers() {
    return await creditService.getCustomers();
  }
}

module.exports = new DomainCreditService();
