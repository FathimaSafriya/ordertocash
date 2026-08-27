const config = require('../../config/environment');
const sapClient = require('./sapClient');
const { mapSapSalesOrderToCanonical } = require('./sapMapper');

/**
 * SAP S/4HANA Real Sales Order Service
 * Connects to official SAP S/4HANA API_SALES_ORDER_SRV
 */
class SapSalesOrderService {
  constructor() {
    this.endpoint = config.sap.salesOrderEndpoint;
  }

  /**
   * Retrieves sales orders from SAP S/4HANA OData service
   * Uses standard OData $expand for items and $filter
   */
  async getSalesOrders(filter = {}) {
    const url = `${this.endpoint}/A_SalesOrder`;
    const params = {
      '$expand': 'to_Item',
      '$top': 50,
      '$inlinecount': 'allpages'
    };

    if (filter.status === 'BLOCKED') {
      // In SAP S/4HANA, blocked orders often match CreditBlockReason or OverallTotalDeliveryStatus
      params['$filter'] = "OverallSDProcessStatus ne 'C'";
    }

    const response = await sapClient.request({
      method: 'get',
      url,
      params
    });

    const rawList = response.data?.d?.results || response.data?.value || [];
    return rawList.map(order => mapSapSalesOrderToCanonical(order));
  }

  /**
   * Retrieves a single sales order by ID with line items
   */
  async getSalesOrderById(orderId) {
    // Standard SAP S/4HANA key format: A_SalesOrder('SO1001')
    const key = orderId.startsWith("'") ? orderId : `'${orderId}'`;
    const url = `${this.endpoint}/A_SalesOrder(${key})`;
    const params = {
      '$expand': 'to_Item'
    };

    const response = await sapClient.request({
      method: 'get',
      url,
      params
    });

    const rawOrder = response.data?.d || response.data;
    if (!rawOrder) return null;

    return mapSapSalesOrderToCanonical(rawOrder);
  }

  /**
   * Releases or updates sales order status in SAP S/4HANA
   * In standard SAP S/4HANA, credit release is performed via function import or PATCH on the header
   */
  async updateOrderStatus(orderId, newStatus, auditDetails = {}) {
    const key = orderId.startsWith("'") ? orderId : `'${orderId}'`;
    
    // Depending on the target SAP release (OData v2 vs v4), standard credit release is done via:
    // 1. Function Import: /ReleaseCreditBlockedSalesOrder?SalesOrder='...'
    // 2. PATCH to /A_SalesOrder('...') with TotalBlockStatus / CreditStatus
    
    let url = `${this.endpoint}/A_SalesOrder(${key})`;
    let method = 'patch';
    let payload = {};

    if (newStatus === 'RELEASED') {
      payload = {
        // Standard SAP S/4HANA OData field to lift block
        OverallCreditStatus: 'D', // Approved
        CreditBlockReason: ''
      };
    } else if (newStatus === 'HOLD') {
      payload = {
        OverallCreditStatus: 'B', // Held/Blocked
        CreditBlockReason: '01'   // Credit limit check
      };
    } else if (newStatus === 'ESCALATED') {
      payload = {
        OverallCreditStatus: 'B',
        CreditBlockReason: '99'   // Special approval / escalation required
      };
    }

    await sapClient.request({
      method,
      url,
      data: payload
    });

    // Re-fetch updated order to return canonical model
    return await this.getSalesOrderById(orderId);
  }
}

module.exports = new SapSalesOrderService();
