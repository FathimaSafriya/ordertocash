/**
 * Deterministic Risk Scoring Engine
 * Evaluates credit exposure, overdue debt, transaction size, and historical payment performance.
 * Produces an explainable, auditable 0-100 risk score and categorized factors.
 */

const config = require('../config/environment');

/**
 * Calculates risk score and factors for an order and customer credit profile
 * @param {Object} order Canonical SalesOrder
 * @param {Object} customer Canonical Customer with CreditProfile
 * @returns {Object} { score: number, level: 'LOW'|'MEDIUM'|'HIGH', factors: string[], breakdown: Object }
 */
function calculateRisk(order, customer) {
  if (!order || !customer) {
    throw new Error('Both order and customer profiles are required for risk calculation.');
  }

  const creditLimit = Math.max(0, customer.creditLimit || 0);
  const currentExposure = Math.max(0, customer.currentExposure || 0);
  const overdueAmount = Math.max(0, customer.overdueAmount || 0);
  const orderValue = Math.max(0, order.orderValue || 0);

  const factors = [];
  let score = 0;

  // -------------------------------------------------------------
  // Factor 1: Credit Exposure & Limit Utilization (Weight: 0-35 points)
  // -------------------------------------------------------------
  let exposureScore = 0;
  if (creditLimit > 0) {
    const totalPotentialExposure = currentExposure + orderValue;
    const utilizationRatio = totalPotentialExposure / creditLimit;

    if (utilizationRatio > 1.5) {
      exposureScore = 35;
      factors.push(`Severe credit breach: Potential exposure (${formatINR(totalPotentialExposure)}) exceeds limit (${formatINR(creditLimit)}) by ${Math.round((utilizationRatio - 1) * 100)}%.`);
    } else if (utilizationRatio > 1.0) {
      exposureScore = 30;
      factors.push(`Credit limit breach: Order increases total exposure to ${formatINR(totalPotentialExposure)}, exceeding the ${formatINR(creditLimit)} limit.`);
    } else if (utilizationRatio > 0.85) {
      exposureScore = 20;
      factors.push(`High credit utilization: Total exposure will reach ${Math.round(utilizationRatio * 100)}% of limit.`);
    } else if (utilizationRatio > 0.60) {
      exposureScore = 10;
    } else {
      exposureScore = 5;
    }
  } else {
    // No credit limit established
    exposureScore = 35;
    factors.push('Unrated/Zero credit limit customer account.');
  }
  score += exposureScore;

  // -------------------------------------------------------------
  // Factor 2: Overdue Amounts & Delinquency (Weight: 0-30 points)
  // -------------------------------------------------------------
  let overdueScore = 0;
  const overdueThreshold = config.rules.overdueRiskThreshold;

  if (overdueAmount > 0) {
    if (overdueAmount >= overdueThreshold * 2) {
      overdueScore = 30;
      factors.push(`Critical overdue liabilities: Outstanding past-due balance of ${formatINR(overdueAmount)}.`);
    } else if (overdueAmount >= overdueThreshold) {
      overdueScore = 22;
      factors.push(`Significant overdue liabilities: Outstanding past-due balance of ${formatINR(overdueAmount)}.`);
    } else {
      overdueScore = 12;
      factors.push(`Minor overdue balance detected: ${formatINR(overdueAmount)} pending settlement.`);
    }
  } else {
    overdueScore = 0;
  }
  score += overdueScore;

  // -------------------------------------------------------------
  // Factor 3: Order Size Relative to Available Credit (Weight: 0-20 points)
  // -------------------------------------------------------------
  let sizeScore = 0;
  const availableCredit = Math.max(0, creditLimit - currentExposure);

  if (availableCredit === 0 && orderValue > 0) {
    sizeScore = 20;
    factors.push('Customer has zero available credit remaining.');
  } else if (orderValue > availableCredit) {
    sizeScore = 18;
    factors.push(`Order value (${formatINR(orderValue)}) exceeds remaining available credit (${formatINR(availableCredit)}).`);
  } else if (orderValue > availableCredit * 0.7) {
    sizeScore = 12;
    factors.push(`Order consumes majority (${Math.round((orderValue / availableCredit) * 100)}%) of remaining credit buffer.`);
  } else {
    sizeScore = 4;
  }
  score += sizeScore;

  // -------------------------------------------------------------
  // Factor 4: Payment History & Risk Rating (Weight: 0-15 points)
  // -------------------------------------------------------------
  let historyScore = 0;
  const riskClass = (customer.riskClass || '').toUpperCase();
  const paymentHistory = (customer.paymentHistory || '').toLowerCase();

  if (riskClass.startsWith('D') || paymentHistory.includes('delinquent') || paymentHistory.includes('restructuring')) {
    historyScore = 15;
    factors.push('Adverse payment history: Documented delinquencies or active debt workout.');
  } else if (riskClass.startsWith('C') || paymentHistory.includes('delay') || paymentHistory.includes('overdue')) {
    historyScore = 10;
    factors.push('Moderate payment risk: Past payment delays and erratic settlement timing.');
  } else if (riskClass.startsWith('B')) {
    historyScore = 5;
  } else {
    historyScore = 1;
  }
  score += historyScore;

  // Ensure bounded score 0 - 100
  score = Math.min(100, Math.max(0, Math.round(score)));

  // Determine Risk Tier
  let level = 'LOW';
  if (score >= 61) {
    level = 'HIGH';
  } else if (score >= 31) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  // Recommended action based on deterministic rules
  let recommendation = 'RELEASE';
  if (level === 'HIGH') {
    recommendation = overdueAmount > overdueThreshold ? 'ESCALATE' : 'HOLD';
  } else if (level === 'MEDIUM') {
    recommendation = 'HOLD';
  } else {
    recommendation = 'RELEASE';
  }

  return {
    score,
    level,
    factors: factors.length > 0 ? factors : ['Healthy credit profile with low exposure and no overdue balances.'],
    recommendation,
    breakdown: {
      exposureScore,
      overdueScore,
      sizeScore,
      historyScore
    }
  };
}

function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

module.exports = {
  calculateRisk,
  formatINR
};
