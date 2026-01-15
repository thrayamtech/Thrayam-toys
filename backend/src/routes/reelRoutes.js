const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/active', reelController.getActiveReels);

// Admin routes
router.get('/', protect, admin, reelController.getAllReels);
router.get('/:id', protect, admin, reelController.getReel);
router.post('/', protect, admin, reelController.createReel);
router.put('/order', protect, admin, reelController.updateReelOrder);
router.put('/:id', protect, admin, reelController.updateReel);
router.put('/:id/toggle', protect, admin, reelController.toggleReelStatus);
router.delete('/:id', protect, admin, reelController.deleteReel);

module.exports = router;
