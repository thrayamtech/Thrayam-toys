const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/session/init', analyticsController.initSession);
router.post('/session/end', analyticsController.endSession);
router.post('/track/page', analyticsController.trackPageView);
router.post('/track/product', analyticsController.trackProductView);
router.post('/track/action', analyticsController.trackAction);

// Public - Get location-based products
router.get('/popular/location', analyticsController.getPopularByLocation);
router.get('/trending', analyticsController.getTrendingProducts);

// Protected routes (requires authentication)
router.get('/user/interests', protect, analyticsController.getUserInterests);

// Admin only routes
router.get('/dashboard', protect, authorize('admin'), analyticsController.getDashboardData);

module.exports = router;
