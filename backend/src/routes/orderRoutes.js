const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrderIdParam } = require('../middleware/validation');

// GET /api/orders
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));

// GET /api/orders/:id
router.get('/:id', validateOrderIdParam, (req, res, next) => orderController.getOrderById(req, res, next));

// GET /api/orders/:id/risk
router.get('/:id/risk', validateOrderIdParam, (req, res, next) => orderController.getOrderRisk(req, res, next));

// POST /api/orders/:id/ai-assessment
router.post('/:id/ai-assessment', validateOrderIdParam, (req, res, next) => orderController.getAiAssessment(req, res, next));

// POST /api/orders/:id/release
router.post('/:id/release', validateOrderIdParam, (req, res, next) => orderController.releaseOrder(req, res, next));

// POST /api/orders/:id/hold
router.post('/:id/hold', validateOrderIdParam, (req, res, next) => orderController.holdOrder(req, res, next));

// POST /api/orders/:id/escalate
router.post('/:id/escalate', validateOrderIdParam, (req, res, next) => orderController.escalateOrder(req, res, next));

module.exports = router;
