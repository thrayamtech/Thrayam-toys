const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  // Toy-specific: age group
  ageGroup: {
    type: String,
    enum: ['0-6 months', '6-12 months', '1-2 years', '2-3 years', '3-5 years', '5-8 years', '8-12 years', '12+ years', 'All Ages'],
    default: 'All Ages'
  },
  // Toy material type
  material: {
    type: String,
    enum: ['Wood', 'Plastic', 'Fabric', 'Metal', 'Rubber', 'Foam', 'Electronic', 'Paper/Cardboard', 'Mixed', 'Other'],
    default: 'Other'
  },
  // Skills the toy develops
  skills: [{
    type: String,
    enum: ['Motor Skills', 'Cognitive Development', 'Creative Play', 'Social Skills', 'Language Development', 'STEM', 'Emotional Development', 'Sensory Play', 'Physical Activity']
  }],
  // Color variants
  colors: [{
    name: String,
    hexCode: String
  }],
  images: [{
    url: String,
    alt: String,
    key: String  // S3 key for image deletion
  }],
  mainImageIndex: {
    type: Number,
    default: 0,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reviews: [reviewSchema],
  numReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sold: {
    type: Number,
    default: 0
  },
  tags: [String],
  specifications: {
    weight: String,
    dimensions: String,
    numPieces: Number,
    batteryRequired: {
      type: Boolean,
      default: false
    },
    batteryType: String,
    playType: [String],   // Indoor, Outdoor, Bath, Sensory, etc.
    safetyWarning: String // e.g. "Not suitable for children under 3 years"
  },
  brand: {
    type: String,
    trim: true
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 80
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  seoKeywords: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = (sum / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

// Create indexes for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ ageGroup: 1 });
productSchema.index({ material: 1 });

module.exports = mongoose.model('Product', productSchema);
