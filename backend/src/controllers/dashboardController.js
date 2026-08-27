const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * GET /api/dashboard/kpis
   */
  async getKpis(req, res, next) {
    try {
      const kpis = await dashboardService.getDashboardKpis();
      res.json({
        success: true,
        data: kpis
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
