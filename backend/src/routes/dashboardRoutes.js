const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/kpis
router.get('/kpis', (req, res, next) => dashboardController.getKpis(req, res, next));

module.exports = router;
