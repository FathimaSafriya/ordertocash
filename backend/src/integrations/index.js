const config = require('../config/environment');

const mockSalesOrderService = require('./mock/mockSalesOrderService');
const mockCreditService = require('./mock/mockCreditService');

const sapSalesOrderService = require('./sap/sapSalesOrderService');
const sapCreditService = require('./sap/sapCreditService');

const isSapMode = config.sap.mode === 'sap';

console.log(`[Adapter] Initializing integration layer: ${isSapMode ? 'REAL SAP S/4HANA MODE' : 'MOCK / DEMO DATA MODE'}`);

module.exports = {
  isSapMode,
  salesOrderService: isSapMode ? sapSalesOrderService : mockSalesOrderService,
  creditService: isSapMode ? sapCreditService : mockCreditService,
  // Direct access for testing or fallback
  mockSalesOrderService,
  mockCreditService,
  sapSalesOrderService,
  sapCreditService
};
