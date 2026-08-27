/**
 * Workflow and State Transition Service
 * Enforces SAP Order-to-Cash credit release state machine and business validation rules.
 */

const ALLOWED_TRANSITIONS = {
  'BLOCKED': ['UNDER_REVIEW', 'RELEASED', 'HOLD', 'ESCALATED'],
  'UNDER_REVIEW': ['RELEASED', 'HOLD', 'ESCALATED', 'BLOCKED'],
  'HOLD': ['UNDER_REVIEW', 'RELEASED', 'ESCALATED'],
  'ESCALATED': ['UNDER_REVIEW', 'RELEASED', 'HOLD'],
  'RELEASED': [] // Terminal state in credit cockpit
};

/**
 * Validates whether a status transition is permitted
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTransition(currentStatus, targetStatus) {
  const current = (currentStatus || '').toUpperCase();
  const target = (targetStatus || '').toUpperCase();

  if (current === target) {
    return {
      valid: false,
      error: `Order is already in '${target}' status.`
    };
  }

  if (current === 'RELEASED') {
    return {
      valid: false,
      error: `Order is already in terminal 'RELEASED' state and cannot be modified.`
    };
  }

  const allowedTargets = ALLOWED_TRANSITIONS[current];
  if (!allowedTargets || !allowedTargets.includes(target)) {
    return {
      valid: false,
      error: `Invalid status transition from '${current}' to '${target}'. Allowed transitions: ${allowedTargets ? allowedTargets.join(', ') : 'none'}.`
    };
  }

  return { valid: true };
}

/**
 * Validates business rules prior to executing an action
 * @param {Object} order
 * @param {Object} customer
 * @param {string} action 'RELEASE' | 'HOLD' | 'ESCALATE'
 * @param {Object} options { riskLevel, reason, decisionMaker }
 */
function validateBusinessRules(order, customer, action, options = {}) {
  const actionName = action.toUpperCase();

  // Rule 3: Reject non-positive order values
  if (!order.orderValue || order.orderValue <= 0) {
    throw new Error('Transaction rejected: Sales order value must be greater than zero.');
  }

  // Rule 4: Reject missing customer
  if (!customer) {
    throw new Error('Transaction rejected: Valid customer record not found for sales order.');
  }

  // Rule 5: If risk is HIGH, release requires explicit justification
  if (actionName === 'RELEASE') {
    const riskLevel = options.riskLevel || 'LOW';
    if (riskLevel === 'HIGH' && (!options.reason || options.reason.trim().length < 5)) {
      throw new Error(
        'High-Risk Override Block: High-risk orders cannot be released without an explicit credit justification comment.'
      );
    }
  }

  return true;
}

module.exports = {
  validateTransition,
  validateBusinessRules,
  ALLOWED_TRANSITIONS
};
