const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToS3, deleteFromS3, extractS3Key } = require('../utils/s3Upload');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    console.log('Create category - Request body:', req.body);

    const { name, description } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Upload image to S3 if provided
    let imageUrl = undefined;
    if (req.file) {
      const uploadResult = await uploadToS3(req.file, 'categories');
      imageUrl = uploadResult.url;
    }

    // Create category
    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      ...(imageUrl && { image: imageUrl }),
    });

    console.log('Category created successfully:', category._id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    console.log('Update category - Request body:', req.body);
    console.log('Update category - ID:', req.params.id);

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description } = req.body;

    // Check if name is being changed and if it already exists
    if (name && name.trim() !== '' && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name && name.trim() !== '') updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : '';

    // Handle image upload
    if (req.file) {
      // Delete old image from S3 if it's an S3 URL
      if (category.image && category.image.startsWith('http')) {
        const oldKey = extractS3Key(category.image);
        if (oldKey) {
          try { await deleteFromS3(oldKey); } catch (e) { console.warn('Old image delete failed:', e.message); }
        }
      }
      const uploadResult = await uploadToS3(req.file, 'categories');
      updateData.image = uploadResult.url;
    }

    console.log('Update data:', updateData);

    category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    console.log('Category updated successfully:', category._id);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: req.params.id });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productsCount} associated products`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category'
    });
  }
};
