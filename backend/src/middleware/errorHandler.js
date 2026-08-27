/**
 * Centralized Enterprise Error Handling Middleware
 * Ensures uniform JSON error format across all endpoints and protects internal traces.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || (err.isSapError ? 'SAP_INTEGRATION_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred during processing.';

  // Log error internally for auditability
  console.error(`[API Error] ${req.method} ${req.originalUrl} - ${code} (${status}): ${message}`);
  if (err.isSapError && err.sapResponse) {
    console.error('[SAP Response Detail]', JSON.stringify(err.sapResponse));
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && !err.isSapError ? { details: err.details } : {})
    }
  });
}

module.exports = errorHandler;
