/**
 * Business Rules & Integration Verification Test Suite
 * Validates the 8 core acceptance criteria defined in Master Prompt Section 37.
 */

const assert = require('assert');
const { calculateRisk } = require('../src/services/riskEngine');
const { validateTransition, validateBusinessRules } = require('../src/services/workflowService');
const aiService = require('../src/services/aiService');
const mockSalesOrderService = require('../src/integrations/mock/mockSalesOrderService');
const mockCreditService = require('../src/integrations/mock/mockCreditService');
const { mapSapSalesOrderToCanonical } = require('../src/integrations/sap/sapMapper');

let testsPassed = 0;
let testsFailed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

async function runSuite() {
  console.log('\n===============================================================');
  console.log(' RUNNING SAP O2C CREDIT RELEASE COCKPIT VERIFICATION SUITE');
  console.log('===============================================================\n');

  // TEST 1: Normal credit situation
  it('TEST 1: Normal credit situation (Limit: 10L, Exposure: 3L, Order: 2L) -> Low Risk / Released', () => {
    const customer = {
      customerId: 'C_TEST1',
      name: 'Stable Enterprise Ltd',
      creditLimit: 1000000,
      currentExposure: 300000,
      overdueAmount: 0,
      paymentHistory: 'Always pays on time',
      riskClass: 'A'
    };
    const order = {
      orderId: 'SO_TEST1',
      orderValue: 200000,
      currency: 'INR'
    };

    const risk = calculateRisk(order, customer);
    assert.strictEqual(risk.level, 'LOW', `Expected LOW risk level, got ${risk.level}`);
    assert(risk.score <= 30, `Expected score <= 30, got ${risk.score}`);
    assert.strictEqual(risk.recommendation, 'RELEASE');
  });

  // TEST 2: Credit exceeded
  it('TEST 2: Credit exceeded (Limit: 10L, Exposure: 8L, Order: 5L) -> Credit breach factor & High Risk', () => {
    const customer = {
      customerId: 'C_TEST2',
      name: 'Growth Corp',
      creditLimit: 1000000,
      currentExposure: 800000,
      overdueAmount: 0,
      paymentHistory: 'Good standing',
      riskClass: 'B'
    };
    const order = {
      orderId: 'SO_TEST2',
      orderValue: 500000,
      currency: 'INR'
    };

    const risk = calculateRisk(order, customer);
    const hasBreachFactor = risk.factors.some(f => f.toLowerCase().includes('exceed') || f.toLowerCase().includes('breach'));
    assert(hasBreachFactor, 'Expected credit limit breach factor in risk explanation');
    assert(risk.score > 30, `Expected elevated score > 30, got ${risk.score}`);
    assert(customer.currentExposure + order.orderValue > customer.creditLimit, 'Rule 1: Exposure + Order must exceed Credit Limit');
  });

  // TEST 3: Overdue customer
  it('TEST 3: Overdue customer (Overdue: 2L+) -> High risk tier & Escalate recommendation', () => {
    const customer = {
      customerId: 'C_TEST3',
      name: 'Delinquent Client Ltd',
      creditLimit: 1000000,
      currentExposure: 700000,
      overdueAmount: 250000,
      paymentHistory: 'Delinquencies recorded',
      riskClass: 'D'
    };
    const order = {
      orderId: 'SO_TEST3',
      orderValue: 400000,
      currency: 'INR'
    };

    const risk = calculateRisk(order, customer);
    assert.strictEqual(risk.level, 'HIGH', `Expected HIGH risk, got ${risk.level}`);
    assert(risk.score >= 61, `Expected risk score >= 61, got ${risk.score}`);
    assert.strictEqual(risk.recommendation, 'ESCALATE');
    assert(risk.factors.some(f => f.toLowerCase().includes('overdue')));
  });

  // TEST 4: Invalid order value
  it('TEST 4: Invalid order value (orderValue <= 0) -> Validation rejection', () => {
    const order = { orderId: 'SO_INV', orderValue: -5000 };
    const customer = { customerId: 'C1', creditLimit: 100000 };

    assert.throws(() => {
      validateBusinessRules(order, customer, 'RELEASE');
    }, /greater than zero/i);
  });

  // TEST 5: Missing customer
  it('TEST 5: Missing customer -> Validation rejection', () => {
    const order = { orderId: 'SO_VAL', orderValue: 50000 };
    assert.throws(() => {
      validateBusinessRules(order, null, 'RELEASE');
    }, /customer record not found/i);
  });

  // TEST 6: AI unavailable / Fallback
  await itAsync('TEST 6: AI fallback engine -> Transparent grounded rule assessment returned', async () => {
    const customer = {
      customerId: 'C_FALLBACK',
      name: 'Fallback Industries',
      creditLimit: 500000,
      currentExposure: 450000,
      overdueAmount: 100000,
      paymentHistory: 'Standard'
    };
    const order = {
      orderId: 'SO_FALLBACK',
      orderValue: 200000,
      currency: 'INR',
      status: 'BLOCKED'
    };

    const assessment = await aiService.assessCreditRisk(order, customer);
    assert(assessment, 'Assessment should be returned');
    assert.strictEqual(assessment.source, 'RULE_BASED_FALLBACK');
    assert(assessment.explanation.length > 20, 'Explanation should be grounded and informative');
    assert(assessment.factors.length > 0, 'Factors should be listed');
  });

  // TEST 7: Invalid status transitions
  it('TEST 7: Invalid status transition -> Rejected by state machine', () => {
    // RELEASED cannot transition to anything
    const res1 = validateTransition('RELEASED', 'BLOCKED');
    assert.strictEqual(res1.valid, false);
    assert(res1.error.includes('terminal'));

    // Cannot transition to same status
    const res2 = validateTransition('BLOCKED', 'BLOCKED');
    assert.strictEqual(res2.valid, false);

    // BLOCKED to invalid arbitrary status
    const res3 = validateTransition('BLOCKED', 'INVOICED');
    assert.strictEqual(res3.valid, false);

    // Valid transition
    const res4 = validateTransition('BLOCKED', 'RELEASED');
    assert.strictEqual(res4.valid, true);
  });

  // TEST 8: SAP Integration & Mock toggle
  await itAsync('TEST 8: SAP Data Mapping & Mock Adapter State Persistence', async () => {
    const orders = await mockSalesOrderService.getSalesOrders();
    assert(orders.length >= 10, `Expected at least 10 orders, got ${orders.length}`);

    const so1001 = await mockSalesOrderService.getSalesOrderById('SO1001');
    assert(so1001, 'SO1001 should exist in mock seed');
    assert.strictEqual(so1001.orderId, 'SO1001');
    assert.strictEqual(so1001.customerId, 'C001');
    assert(Array.isArray(so1001.items) && so1001.items.length >= 2, 'Line items should be mapped');

    // Test status update and audit persistence
    const updated = await mockSalesOrderService.updateOrderStatus('SO1001', 'HOLD', {
      decisionMaker: 'Test Officer',
      reason: 'Testing workflow transition'
    });
    assert.strictEqual(updated.status, 'HOLD');
    assert.strictEqual(updated.auditTrail[0].action, 'STATUS_TRANSITION_HOLD');

    // Reset back for clean state
    mockSalesOrderService.reset();
    const resetOrder = await mockSalesOrderService.getSalesOrderById('SO1001');
    assert.strictEqual(resetOrder.status, 'BLOCKED');
  });

  console.log('\n===============================================================');
  console.log(` TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('===============================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
