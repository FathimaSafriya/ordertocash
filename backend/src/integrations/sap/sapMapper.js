/**
 * SAP Canonical Data Mapper
 * Isolates raw SAP S/4HANA OData / REST structures from the core business application.
 * Ensures the Frontend and Domain Services interact only with clean canonical entities.
 */

/**
 * Maps raw SAP S/4HANA Sales Order OData entity to canonical SalesOrder
 * @param {Object} sapOrder - Raw SAP SalesOrder entity (from API_SALES_ORDER_SRV)
 * @param {Object} [customer] - Optional matching customer details
 * @returns {Object} Canonical SalesOrder
 */
function mapSapSalesOrderToCanonical(sapOrder, customer = null) {
  if (!sapOrder) return null;

  // Handle both flat SAP responses and OData v2 d/results wrapping
  const raw = sapOrder.d || sapOrder;

  const orderId = raw.SalesOrder || raw.orderId;
  const customerId = raw.SoldToParty || raw.Customer || raw.customerId;
  const customerName = customer ? customer.name : (raw.CustomerName || raw.customerName || `Customer ${customerId}`);
  
  // Format order date
  let orderDate = raw.SalesOrderDate || raw.CreationDate || raw.orderDate;
  if (orderDate && orderDate.startsWith('/Date(')) {
    // Handle SAP OData v2 JSON timestamp: /Date(1724578500000)/
    const match = /\/Date\((\d+)\)\//.exec(orderDate);
    if (match) {
      orderDate = new Date(parseInt(match[1], 10)).toISOString();
    }
  }

  const orderValue = parseFloat(raw.TotalNetAmount || raw.NetAmount || raw.orderValue || 0);
  const currency = raw.TransactionCurrency || raw.Currency || raw.currency || 'INR';

  // Map SAP Credit Status to canonical status
  // SAP fields often include: CreditBlockReason, OverallCreditStatus, OverallSDProcessStatus
  let status = raw.status || 'BLOCKED';
  let creditStatus = raw.creditStatus || raw.OverallCreditStatus || 'CREDIT_LIMIT_EXCEEDED';

  if (raw.OverallCreditStatus === 'B' || raw.CreditBlockReason) {
    status = 'BLOCKED';
  } else if (raw.OverallCreditStatus === 'D') {
    status = 'RELEASED';
  }

  // Map line items
  let items = [];
  const rawItems = raw.to_Item?.results || raw.to_Item || raw.items || [];
  if (Array.isArray(rawItems)) {
    items = rawItems.map(item => mapSapOrderItemToCanonical(item));
  }

  return {
    orderId,
    customerId,
    customerName,
    orderDate: orderDate || new Date().toISOString(),
    orderValue,
    currency,
    status,
    creditStatus,
    salesOrganization: raw.SalesOrganization || raw.salesOrganization || '1010',
    distributionChannel: raw.DistributionChannel || raw.distributionChannel || '10',
    division: raw.Division || raw.division || '00',
    items,
    auditTrail: raw.auditTrail || []
  };
}

/**
 * Maps raw SAP Sales Order Item to canonical OrderItem
 * @param {Object} sapItem
 * @returns {Object} Canonical OrderItem
 */
function mapSapOrderItemToCanonical(sapItem) {
  if (!sapItem) return null;
  const raw = sapItem.d || sapItem;

  const quantity = parseFloat(raw.OrderQuantity || raw.RequestedQuantity || raw.quantity || 1);
  const unitPrice = parseFloat(raw.NetPriceAmount || raw.unitPrice || 0);
  const totalPrice = parseFloat(raw.NetAmount || raw.totalPrice || (quantity * unitPrice));

  return {
    itemId: String(raw.SalesOrderItem || raw.itemId || '10'),
    materialId: raw.Material || raw.materialId || 'UNKNOWN_MAT',
    materialName: raw.SalesOrderItemText || raw.materialName || raw.Material || 'Standard Material',
    quantity,
    unitPrice,
    totalPrice
  };
}

/**
 * Maps raw SAP Credit Management Account entity to canonical CreditProfile / Customer
 * @param {Object} sapCredit - Raw SAP entity (e.g. from API_CR_CREDIT_ACCOUNT_SRV)
 * @param {Object} [baseCustomer] - Base customer master data
 * @returns {Object} Canonical Customer with CreditProfile
 */
function mapSapCreditAccountToCanonical(sapCredit, baseCustomer = null) {
  if (!sapCredit) return null;
  const raw = sapCredit.d || sapCredit;

  const customerId = raw.BusinessPartner || raw.CreditAccount || raw.customerId;
  const creditLimit = parseFloat(raw.CreditLimitAmount || raw.TotalCreditLimit || raw.creditLimit || 0);
  const currentExposure = parseFloat(raw.CreditExposureAmount || raw.TotalExposure || raw.currentExposure || 0);
  const overdueAmount = parseFloat(raw.OverdueAmount || raw.AmountOverdue || raw.overdueAmount || 0);
  const availableCredit = Math.max(0, creditLimit - currentExposure);

  return {
    customerId,
    name: baseCustomer?.name || raw.BusinessPartnerName || `Account ${customerId}`,
    industry: baseCustomer?.industry || raw.Industry || 'Enterprise Client',
    country: baseCustomer?.country || raw.Country || 'IN',
    creditLimit,
    currentExposure,
    overdueAmount,
    availableCredit,
    utilizationPercent: creditLimit > 0 ? Math.round((currentExposure / creditLimit) * 100) : 0,
    paymentHistory: baseCustomer?.paymentHistory || raw.PaymentHistory || 'Standard payment terms, net 30 days.',
    creditSegment: raw.CreditSegment || '1000',
    riskClass: raw.CreditRiskClass || baseCustomer?.riskClass || 'B - Moderate',
    lastCreditReviewDate: raw.LastReviewDate || baseCustomer?.lastCreditReviewDate || new Date().toISOString()
  };
}

module.exports = {
  mapSapSalesOrderToCanonical,
  mapSapOrderItemToCanonical,
  mapSapCreditAccountToCanonical
};
