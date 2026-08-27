/**
 * API Request Validation Middleware
 */

function validateOrderIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ORDER_ID',
        message: 'A valid Sales Order ID parameter is required.'
      }
    });
  }
  req.params.id = id.trim().toUpperCase();
  next();
}

function validateCustomerIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CUSTOMER_ID',
        message: 'A valid Customer ID parameter is required.'
      }
    });
  }
  req.params.id = id.trim().toUpperCase();
  next();
}

module.exports = {
  validateOrderIdParam,
  validateCustomerIdParam
};
