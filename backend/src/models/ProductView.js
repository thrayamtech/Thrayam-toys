const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },

  // User (null if not logged in)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Session identifier for non-logged-in users
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Geolocation
  location: {
    country: String,
    countryCode: String,
    region: String,
    city: String,
    lat: Number,
    lon: Number
  },

  // View details
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  duration: {
    type: Number, // in seconds
    default: 0
  },

  // Device info
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'desktop'
  },

  // Source
  source: {
    type: String, // 'search', 'category', 'home', 'recommendation', 'direct'
    default: 'direct'
  },

  // Interaction
  interacted: {
    type: Boolean,
    default: false
  },

  // Actions performed
  actions: {
    addedToCart: {
      type: Boolean,
      default: false
    },
    addedToWishlist: {
      type: Boolean,
      default: false
    },
    shared: {
      type: Boolean,
      default: false
    },
    imageViewed: [{
      imageIndex: Number,
      viewedAt: Date
    }]
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
productViewSchema.index({ product: 1, viewedAt: -1 });
productViewSchema.index({ 'location.country': 1, product: 1 });
productViewSchema.index({ 'location.city': 1, product: 1 });
productViewSchema.index({ user: 1, viewedAt: -1 });

// Static method to get popular products by location
productViewSchema.statics.getPopularByLocation = async function(country, city, limit = 10) {
  const matchQuery = {};

  if (country) {
    matchQuery['location.country'] = country;
  }

  if (city) {
    matchQuery['location.city'] = city;
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$product',
        viewCount: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        uniqueUsers: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        product: '$_id',
        viewCount: 1,
        avgDuration: 1,
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { viewCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' }
  ]);
};

// Static method to get trending products (high views in last 24 hours)
productViewSchema.statics.getTrendingProducts = async function(hours = 24, limit = 10) {
  const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        viewedAt: { $gte: timeThreshold }
      }
    },
    {
      $group: {
        _id: '$product',
        viewCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        product: '$_id',
        viewCount: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        trendScore: {
          $multiply: ['$viewCount', { $size: '$uniqueUsers' }]
        }
      }
    },
    { $sort: { trendScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' }
  ]);
};

// Static method to get location-based demand
productViewSchema.statics.getLocationDemand = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        viewedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          country: '$location.country',
          city: '$location.city',
          product: '$product'
        },
        viewCount: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        addedToCartCount: {
          $sum: { $cond: ['$actions.addedToCart', 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $sort: { viewCount: -1 }
    }
  ]);
};

module.exports = mongoose.model('ProductView', productViewSchema);
