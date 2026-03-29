const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToS3, deleteFromS3, extractS3Key } = require('../utils/s3Upload');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Age group filter
    if (req.query.ageGroup) {
      query.ageGroup = req.query.ageGroup;
    }

    // Material filter
    if (req.query.material) {
      query.material = req.query.material;
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sort options
    let sortOption = {};
    switch (req.query.sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'popular':
        sortOption = { sold: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Uploaded files:', req.files);

    // Parse FormData fields
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : undefined,
      category: req.body.category,
      stock: parseInt(req.body.stock) || 0,
      ageGroup: req.body.ageGroup || 'All Ages',
      material: req.body.material || 'Other',
      skills: req.body.skills ? JSON.parse(req.body.skills) : [],
      brand: req.body.brand || '',
      isFeatured: req.body.isFeatured === 'true',
      colors: req.body.colors ? JSON.parse(req.body.colors) : [],
      mainImageIndex: parseInt(req.body.mainImageIndex) || 0,
      seoTitle: req.body.seoTitle || '',
      seoDescription: req.body.seoDescription || '',
      seoKeywords: req.body.seoKeywords || '',
    };

    // Add specifications if provided
    if (req.body.weight || req.body.dimensions || req.body.numPieces || req.body.safetyWarning) {
      productData.specifications = {
        weight: req.body.weight || '',
        dimensions: req.body.dimensions || '',
        numPieces: req.body.numPieces ? parseInt(req.body.numPieces) : undefined,
        batteryRequired: req.body.batteryRequired === 'true',
        batteryType: req.body.batteryType || '',
        safetyWarning: req.body.safetyWarning || ''
      };
    }

    // Handle uploaded images - Upload to S3
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, index) => {
        const uploadResult = await uploadToS3(file);
        return {
          url: uploadResult.url,
          key: uploadResult.key,
          alt: `${req.body.name} - Image ${index + 1}`
        };
      });

      productData.images = await Promise.all(uploadPromises);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);

    // Handle validation errors more specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('Updating product with data:', req.body);
    console.log('Uploaded files:', req.files);

    // Parse the update data
    const updateData = { ...req.body };

    // Parse JSON fields if they exist
    if (updateData.colors && typeof updateData.colors === 'string') {
      updateData.colors = JSON.parse(updateData.colors);
    }
    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = JSON.parse(updateData.skills);
    }
    // Convert boolean fields
    if (updateData.isFeatured) updateData.isFeatured = updateData.isFeatured === 'true';
    if (updateData.batteryRequired) updateData.batteryRequired = updateData.batteryRequired === 'true';
    // Build specifications from flat fields
    if (updateData.weight || updateData.dimensions || updateData.numPieces || updateData.safetyWarning) {
      updateData.specifications = {
        weight: updateData.weight || '',
        dimensions: updateData.dimensions || '',
        numPieces: updateData.numPieces ? parseInt(updateData.numPieces) : undefined,
        batteryRequired: updateData.batteryRequired === 'true',
        batteryType: updateData.batteryType || '',
        safetyWarning: updateData.safetyWarning || ''
      };
    }

    // Handle existing images from request
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = typeof req.body.existingImages === 'string'
        ? JSON.parse(req.body.existingImages)
        : req.body.existingImages;
    }

    // Find images to delete (images in DB but not in existingImages)
    const imagesToDelete = product.images.filter(
      img => !existingImages.some(existing => existing.url === img.url)
    );

    // Delete removed images from S3
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(async (img) => {
        const key = extractS3Key(img.url);
        if (key) {
          try {
            await deleteFromS3(key);
            console.log(`Deleted image from S3: ${key}`);
          } catch (error) {
            console.error(`Error deleting image from S3: ${key}`, error);
          }
        }
      });
      await Promise.all(deletePromises);
    }

    // Upload new images to S3
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, index) => {
        const uploadResult = await uploadToS3(file);
        return {
          url: uploadResult.url,
          key: uploadResult.key,
          alt: `${updateData.name || product.name} - Image ${existingImages.length + index + 1}`
        };
      });
      newImages = await Promise.all(uploadPromises);
    }

    // Combine existing and new images
    updateData.images = [...existingImages, ...newImages];

    // Update the product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all product images from S3
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (img) => {
        const key = extractS3Key(img.url);
        if (key) {
          try {
            await deleteFromS3(key);
            console.log(`Deleted image from S3: ${key}`);
          } catch (error) {
            console.error(`Error deleting image from S3: ${key}`, error);
          }
        }
      });
      await Promise.all(deletePromises);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.calculateAverageRating();

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
      .limit(4)
      .select('name price discountPrice images averageRating slug');

    res.status(200).json({
      success: true,
      products: relatedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
