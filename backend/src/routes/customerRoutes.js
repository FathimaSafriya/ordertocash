const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateCustomerIdParam } = require('../middleware/validation');

// GET /api/customers
router.get('/', (req, res, next) => customerController.getCustomers(req, res, next));

// GET /api/customers/:id
router.get('/:id', validateCustomerIdParam, (req, res, next) => customerController.getCustomerById(req, res, next));

module.exports = router;
