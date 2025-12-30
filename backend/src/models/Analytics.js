const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Session tracking
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // User identification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for non-logged-in users
  },

  // Geolocation data
  geolocation: {
    ip: String,
    country: String,
    countryCode: String,
    region: String,
    regionName: String,
    city: String,
    zip: String,
    lat: Number,
    lon: Number,
    timezone: String,
    isp: String
  },

  // Device & Browser info
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    device: String,
    isMobile: Boolean,
    isTablet: Boolean,
    isDesktop: Boolean
  },

  // Session data
  sessionStart: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionEnd: {
    type: Date
  },
  sessionDuration: {
    type: Number, // in seconds
    default: 0
  },

  // Page views
  pageViews: [{
    path: String,
    title: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    duration: Number // time spent on page in seconds
  }],

  // Products viewed
  productsViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    duration: Number // time spent viewing product
  }],

  // User interests (product categories)
  interests: [{
    category: String,
    viewCount: {
      type: Number,
      default: 1
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  }],

  // Actions performed
  actions: [{
    type: {
      type: String,
      enum: ['click', 'add_to_cart', 'remove_from_cart', 'search', 'filter', 'checkout', 'purchase']
    },
    target: String, // what was clicked/interacted with
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Referrer information
  referrer: {
    source: String,
    medium: String,
    campaign: String,
    url: String
  },

  // Last activity timestamp
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Session status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ sessionStart: -1 });
analyticsSchema.index({ 'geolocation.country': 1 });
analyticsSchema.index({ 'geolocation.city': 1 });
analyticsSchema.index({ user: 1, sessionStart: -1 });
analyticsSchema.index({ isActive: 1, lastActivity: -1 });

// Method to end session
analyticsSchema.methods.endSession = function() {
  this.sessionEnd = new Date();
  this.sessionDuration = Math.floor((this.sessionEnd - this.sessionStart) / 1000);
  this.isActive = false;
  return this.save();
};

// Method to add page view
analyticsSchema.methods.addPageView = function(pageData) {
  this.pageViews.push(pageData);
  this.lastActivity = new Date();
  return this.save();
};

// Method to add product view
analyticsSchema.methods.addProductView = function(productId, duration = 0) {
  this.productsViewed.push({
    product: productId,
    viewedAt: new Date(),
    duration
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to update interests
analyticsSchema.methods.updateInterests = function(category) {
  const existingInterest = this.interests.find(i => i.category === category);

  if (existingInterest) {
    existingInterest.viewCount += 1;
    existingInterest.lastViewed = new Date();
  } else {
    this.interests.push({
      category,
      viewCount: 1,
      lastViewed: new Date()
    });
  }

  this.lastActivity = new Date();
  return this.save();
};

// Method to track action
analyticsSchema.methods.trackAction = function(actionType, target, metadata = {}) {
  this.actions.push({
    type: actionType,
    target,
    metadata,
    timestamp: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Static method to get daily visitor count
analyticsSchema.statics.getDailyVisitors = async function(date = new Date()) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  return this.countDocuments({
    sessionStart: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

// Static method to get location-based statistics
analyticsSchema.statics.getLocationStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        sessionStart: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          country: '$geolocation.country',
          city: '$geolocation.city'
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$sessionDuration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Auto-expire inactive sessions after 30 minutes
analyticsSchema.pre('save', function(next) {
  if (this.isActive) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (this.lastActivity < thirtyMinutesAgo) {
      this.isActive = false;
      this.sessionEnd = this.lastActivity;
      this.sessionDuration = Math.floor((this.sessionEnd - this.sessionStart) / 1000);
    }
  }
  next();
});

module.exports = mongoose.model('Analytics', analyticsSchema);
