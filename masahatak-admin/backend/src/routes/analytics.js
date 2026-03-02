const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/dashboard-stats', analyticsController.getDashboardStats);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/bookings', analyticsController.getBookingAnalytics);
router.get('/popular-workspaces', analyticsController.getPopularWorkspaces);

module.exports = router;
