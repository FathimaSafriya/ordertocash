const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // SAP Integration Configuration
  sap: {
    mode: (process.env.SAP_MODE || 'mock').toLowerCase(), // 'mock' or 'sap'
    baseUrl: process.env.SAP_BASE_URL || '',
    client: process.env.SAP_CLIENT || '100',
    destination: process.env.SAP_DESTINATION || '',
    username: process.env.SAP_USERNAME || '',
    password: process.env.SAP_PASSWORD || '',
    authType: process.env.SAP_AUTH_TYPE || 'basic', // 'basic', 'oauth', 'apiKey'
    apiKey: process.env.SAP_API_KEY || '',
    salesOrderEndpoint: process.env.SAP_SALES_ORDER_ENDPOINT || '/sap/opu/odata/sap/API_SALES_ORDER_SRV',
    creditEndpoint: process.env.SAP_CREDIT_ENDPOINT || '/sap/opu/odata/sap/API_CR_CREDIT_ACCOUNT_SRV',
    timeoutMs: parseInt(process.env.SAP_TIMEOUT_MS || '10000', 10),
  },

  // AI Configuration
  ai: {
    mode: (process.env.AI_MODE || 'mock').toLowerCase(), // 'mock', 'gemini', 'openai'
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
  },

  // Business Rules
  rules: {
    overdueRiskThreshold: parseFloat(process.env.OVERDUE_RISK_THRESHOLD || '100000'),
    exposureWarningThresholdPercent: 85, // Flag warning when exposure > 85%
  }
};

// Safe configuration log (Never log passwords or secret keys)
console.log(`[Config] Operating Mode: SAP_MODE=${config.sap.mode.toUpperCase()}, AI_MODE=${config.ai.mode.toUpperCase()}`);
if (config.sap.mode === 'sap') {
  console.log(`[Config] Target SAP Host: ${config.sap.baseUrl || 'NOT SPECIFIED (Check .env)'}`);
}

module.exports = config;
