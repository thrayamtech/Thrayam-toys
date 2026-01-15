const Reel = require('../models/Reel');

// Get all active reels (public)
exports.getActiveReels = async (req, res) => {
  try {
    const reels = await Reel.find({ isActive: true })
      .sort({ order: 1 })
      .populate('product', 'name slug images price salePrice');
    res.json({
      success: true,
      reels
    });
  } catch (error) {
    console.error('Error fetching active reels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reels'
    });
  }
};

// Get all reels (admin)
exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .sort({ order: 1 })
      .populate('product', 'name slug images price salePrice');
    res.json({
      success: true,
      reels
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reels'
    });
  }
};

// Get single reel
exports.getReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('product', 'name slug images price salePrice');
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    res.json({
      success: true,
      reel
    });
  } catch (error) {
    console.error('Error fetching reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reel'
    });
  }
};

// Create reel
exports.createReel = async (req, res) => {
  try {
    const { title, instagramUrl, thumbnailUrl, product, order, isActive } = req.body;

    if (!instagramUrl) {
      return res.status(400).json({
        success: false,
        message: 'Instagram URL is required'
      });
    }

    const reel = new Reel({
      title: title || '',
      instagramUrl,
      thumbnailUrl: thumbnailUrl || '',
      product: product || null,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await reel.save();

    // Populate product before sending response
    await reel.populate('product', 'name slug images price salePrice');

    res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      reel
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reel'
    });
  }
};

// Update reel
exports.updateReel = async (req, res) => {
  try {
    const { title, instagramUrl, thumbnailUrl, product, order, isActive } = req.body;

    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Update fields
    if (title !== undefined) reel.title = title;
    if (instagramUrl) reel.instagramUrl = instagramUrl;
    if (thumbnailUrl !== undefined) reel.thumbnailUrl = thumbnailUrl;
    if (product !== undefined) reel.product = product || null;
    if (order !== undefined) reel.order = order;
    if (isActive !== undefined) reel.isActive = isActive;

    await reel.save();

    // Populate product before sending response
    await reel.populate('product', 'name slug images price salePrice');

    res.json({
      success: true,
      message: 'Reel updated successfully',
      reel
    });
  } catch (error) {
    console.error('Error updating reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reel'
    });
  }
};

// Delete reel
exports.deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    await reel.deleteOne();

    res.json({
      success: true,
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reel'
    });
  }
};

// Update reel order (bulk update)
exports.updateReelOrder = async (req, res) => {
  try {
    const { reels } = req.body;

    if (!Array.isArray(reels)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format'
      });
    }

    // Update each reel's order
    const updatePromises = reels.map((item, index) =>
      Reel.findByIdAndUpdate(item.id || item._id, { order: index })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Reel order updated successfully'
    });
  } catch (error) {
    console.error('Error updating reel order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reel order'
    });
  }
};

// Toggle reel active status
exports.toggleReelStatus = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    reel.isActive = !reel.isActive;
    await reel.save();

    res.json({
      success: true,
      message: `Reel ${reel.isActive ? 'activated' : 'deactivated'} successfully`,
      reel
    });
  } catch (error) {
    console.error('Error toggling reel status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle reel status'
    });
  }
};
