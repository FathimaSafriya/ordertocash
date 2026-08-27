const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', (req, res) => authController.login(req, res));

// GET /api/auth/demo-credentials
router.get('/demo-credentials', (req, res) => authController.getDemoCredentials(req, res));

module.exports = router;
