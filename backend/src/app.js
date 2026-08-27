const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');

const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json());

// Request logging for auditability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api/')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'UP',
      service: 'AI-Powered Credit Release Cockpit',
      process: 'SAP Order-to-Cash (O2C)',
      sapMode: config.sap.mode,
      aiMode: config.ai.mode,
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);

// Unmatched API 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Serve frontend static assets (Single Deployable Unit)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA Client-side Routing Fallback (Any non-API path serves index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Please run "npm run build" in the frontend directory.');
    }
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
