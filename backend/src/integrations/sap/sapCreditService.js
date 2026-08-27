const config = require('../../config/environment');
const sapClient = require('./sapClient');
const { mapSapCreditAccountToCanonical } = require('./sapMapper');

/**
 * SAP S/4HANA Real Credit Management Service
 * Communicates with official SAP Credit Management OData service:
 * API_CR_CREDIT_ACCOUNT_SRV or Business Partner Credit API
 */
class SapCreditService {
  constructor() {
    this.endpoint = config.sap.creditEndpoint;
  }

  /**
   * Get customer credit profile from SAP Credit Management
   */
  async getCustomerCredit(customerId) {
    const key = customerId.startsWith("'") ? customerId : `'${customerId}'`;
    const url = `${this.endpoint}/CreditAccount(${key})`;

    const response = await sapClient.request({
      method: 'get',
      url
    });

    const rawCredit = response.data?.d || response.data;
    if (!rawCredit) return null;

    return mapSapCreditAccountToCanonical(rawCredit);
  }

  /**
   * Get credit exposure summary
   */
  async getCreditExposure(customerId) {
    const profile = await this.getCustomerCredit(customerId);
    if (!profile) {
      throw new Error(`Customer credit account ${customerId} not found in SAP S/4HANA.`);
    }

    return {
      customerId: profile.customerId,
      creditLimit: profile.creditLimit,
      currentExposure: profile.currentExposure,
      overdueAmount: profile.overdueAmount,
      availableCredit: profile.availableCredit,
      utilizationPercent: profile.utilizationPercent
    };
  }
}

module.exports = new SapCreditService();
