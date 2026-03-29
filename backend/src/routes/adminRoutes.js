const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} = require('../controllers/adminController');
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/users/:id/toggle-active', protect, authorize('admin'), toggleUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Coupon management routes
router.route('/coupons')
  .get(protect, authorize('admin'), getCoupons)
  .post(protect, authorize('admin'), createCoupon);

router.route('/coupons/:id')
  .put(protect, authorize('admin'), updateCoupon)
  .delete(protect, authorize('admin'), deleteCoupon);

// Category management routes
router.get('/categories', protect, authorize('admin'), getCategories);
router.post('/categories', protect, authorize('admin'), upload.single('image'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), upload.single('image'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
