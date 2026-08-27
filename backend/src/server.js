const app = require('./app');
const config = require('./config/environment');

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` AI-POWERED CREDIT RELEASE COCKPIT - BACKEND SERVICE   `);
  console.log(` Process: SAP Order-to-Cash (O2C) Credit Management    `);
  console.log(` Server running on http://localhost:${config.port}           `);
  console.log(` Mode: SAP_MODE=${config.sap.mode.toUpperCase()} | AI_MODE=${config.ai.mode.toUpperCase()}     `);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Server] Received SIGTERM, gracefully terminating...');
  server.close(() => {
    console.log('[Server] Closed remaining connections.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] Received SIGINT, gracefully terminating...');
  server.close(() => {
    console.log('[Server] Closed remaining connections.');
    process.exit(0);
  });
});
