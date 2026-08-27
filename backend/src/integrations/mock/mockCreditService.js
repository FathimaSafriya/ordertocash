const { customers } = require('../../data/seedData');
const { mapSapCreditAccountToCanonical } = require('../sap/sapMapper');

class MockCreditService {
  constructor() {
    this.customers = JSON.parse(JSON.stringify(customers));
  }

  /**
   * Get all customers with credit profiles
   * @returns {Promise<Array>}
   */
  async getCustomers() {
    return this.customers.map(c => mapSapCreditAccountToCanonical(c, c));
  }

  /**
   * Get customer credit profile by customerId
   * @param {string} customerId
   * @returns {Promise<Object|null>}
   */
  async getCustomerCredit(customerId) {
    const cust = this.customers.find(c => c.customerId.toUpperCase() === customerId.toUpperCase());
    if (!cust) return null;
    return mapSapCreditAccountToCanonical(cust, cust);
  }

  /**
   * Get customer credit exposure details
   * @param {string} customerId
   * @returns {Promise<Object>}
   */
  async getCreditExposure(customerId) {
    const cust = await this.getCustomerCredit(customerId);
    if (!cust) {
      throw new Error(`Customer ${customerId} not found.`);
    }

    return {
      customerId: cust.customerId,
      creditLimit: cust.creditLimit,
      currentExposure: cust.currentExposure,
      overdueAmount: cust.overdueAmount,
      availableCredit: cust.availableCredit,
      utilizationPercent: cust.utilizationPercent
    };
  }

  /**
   * Update customer exposure (e.g. when order is released or modified)
   * @param {string} customerId
   * @param {number} deltaExposure
   */
  async adjustExposure(customerId, deltaExposure) {
    const cust = this.customers.find(c => c.customerId.toUpperCase() === customerId.toUpperCase());
    if (cust) {
      cust.currentExposure = Math.max(0, cust.currentExposure + deltaExposure);
    }
  }

  reset() {
    this.customers = JSON.parse(JSON.stringify(customers));
  }
}

module.exports = new MockCreditService();
