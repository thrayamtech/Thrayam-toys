const Analytics = require('../models/Analytics');
const ProductView = require('../models/ProductView');
const GeolocationService = require('../services/geolocationService');
const { v4: uuidv4 } = require('uuid');

/**
 * Initialize or resume a user session
 */
exports.initSession = async (req, res) => {
  try {
    const { sessionId, referrer } = req.body;
    const userId = req.user?._id || null;

    // Get visitor info
    const visitorInfo = await GeolocationService.getVisitorInfo(req);

    let session;

    // Check if session exists and is active
    if (sessionId) {
      session = await Analytics.findOne({ sessionId, isActive: true });
    }

    // Create new session if doesn't exist or inactive
    if (!session) {
      const newSessionId = sessionId || uuidv4();

      session = new Analytics({
        sessionId: newSessionId,
        user: userId,
        geolocation: visitorInfo.geolocation,
        deviceInfo: visitorInfo.deviceInfo,
        referrer: referrer || {},
        sessionStart: new Date(),
        lastActivity: new Date(),
        isActive: true
      });

      await session.save();
    } else {
      // Update existing session
      session.lastActivity = new Date();
      if (userId && !session.user) {
        session.user = userId; // User logged in during session
      }
      await session.save();
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      location: {
        country: session.geolocation.country,
        city: session.geolocation.city
      }
    });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize session' });
  }
};

/**
 * Track page view
 */
exports.trackPageView = async (req, res) => {
  try {
    const { sessionId, path, title, duration } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    const session = await Analytics.findOne({ sessionId });

    if (session) {
      await session.addPageView({ path, title, duration });

      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ success: false, message: 'Failed to track page view' });
  }
};

/**
 * Track product view
 */
exports.trackProductView = async (req, res) => {
  try {
    const { sessionId, productId, duration, source, interacted } = req.body;
    const userId = req.user?._id || null;

    if (!sessionId || !productId) {
      return res.status(400).json({ success: false, message: 'Session ID and Product ID required' });
    }

    // Update Analytics session
    const session = await Analytics.findOne({ sessionId });

    if (session) {
      await session.addProductView(productId, duration);

      // Get product category to update interests
      const Product = require('../models/Product');
      const product = await Product.findById(productId);

      if (product && product.category) {
        await session.updateInterests(product.category);
      }
    }

    // Create ProductView record
    const visitorInfo = await GeolocationService.getVisitorInfo(req);

    const productView = new ProductView({
      product: productId,
      user: userId,
      sessionId,
      location: {
        country: visitorInfo.geolocation.country,
        countryCode: visitorInfo.geolocation.countryCode,
        region: visitorInfo.geolocation.regionName,
        city: visitorInfo.geolocation.city,
        lat: visitorInfo.geolocation.lat,
        lon: visitorInfo.geolocation.lon
      },
      duration: duration || 0,
      deviceType: visitorInfo.deviceInfo.isMobile ? 'mobile' :
                  visitorInfo.deviceInfo.isTablet ? 'tablet' : 'desktop',
      source: source || 'direct',
      interacted: interacted || false
    });

    await productView.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking product view:', error);
    res.status(500).json({ success: false, message: 'Failed to track product view' });
  }
};

/**
 * Track user action
 */
exports.trackAction = async (req, res) => {
  try {
    const { sessionId, actionType, target, metadata } = req.body;

    if (!sessionId || !actionType) {
      return res.status(400).json({ success: false, message: 'Session ID and action type required' });
    }

    const session = await Analytics.findOne({ sessionId });

    if (session) {
      await session.trackAction(actionType, target, metadata);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error tracking action:', error);
    res.status(500).json({ success: false, message: 'Failed to track action' });
  }
};

/**
 * End session
 */
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    const session = await Analytics.findOne({ sessionId, isActive: true });

    if (session) {
      await session.endSession();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Active session not found' });
    }
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ success: false, message: 'Failed to end session' });
  }
};

/**
 * Get popular products by location
 */
exports.getPopularByLocation = async (req, res) => {
  try {
    const { country, city, limit } = req.query;

    const popularProducts = await ProductView.getPopularByLocation(
      country,
      city,
      parseInt(limit) || 10
    );

    res.json({
      success: true,
      products: popularProducts
    });
  } catch (error) {
    console.error('Error getting popular products:', error);
    res.status(500).json({ success: false, message: 'Failed to get popular products' });
  }
};

/**
 * Get trending products
 */
exports.getTrendingProducts = async (req, res) => {
  try {
    const { hours, limit } = req.query;

    const trendingProducts = await ProductView.getTrendingProducts(
      parseInt(hours) || 24,
      parseInt(limit) || 10
    );

    res.json({
      success: true,
      products: trendingProducts
    });
  } catch (error) {
    console.error('Error getting trending products:', error);
    res.status(500).json({ success: false, message: 'Failed to get trending products' });
  }
};

/**
 * Get analytics dashboard data (Admin only)
 */
exports.getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Total sessions
    const totalSessions = await Analytics.countDocuments({
      sessionStart: { $gte: start, $lte: end }
    });

    // Daily visitors
    const today = new Date();
    const dailyVisitors = await Analytics.getDailyVisitors(today);

    // Location statistics
    const locationStats = await Analytics.getLocationStats(start, end);

    // Top products
    const topProducts = await ProductView.aggregate([
      {
        $match: {
          viewedAt: { $gte: start, $lte: end }
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
        $sort: { viewCount: -1 }
      },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' }
    ]);

    // Average session duration
    const avgSessionStats = await Analytics.aggregate([
      {
        $match: {
          sessionStart: { $gte: start, $lte: end },
          sessionDuration: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$sessionDuration' },
          totalPageViews: { $sum: { $size: '$pageViews' } }
        }
      }
    ]);

    // Device breakdown
    const deviceStats = await Analytics.aggregate([
      {
        $match: {
          sessionStart: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$deviceInfo.device',
          count: { $sum: 1 }
        }
      }
    ]);

    // Location-based demand
    const locationDemand = await ProductView.getLocationDemand(start, end);

    res.json({
      success: true,
      data: {
        totalSessions,
        dailyVisitors,
        locationStats,
        topProducts,
        avgSessionDuration: avgSessionStats[0]?.avgDuration || 0,
        totalPageViews: avgSessionStats[0]?.totalPageViews || 0,
        deviceStats,
        locationDemand: locationDemand.slice(0, 20) // Top 20 location-product combinations
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
  }
};

/**
 * Get user interests (for logged-in users)
 */
exports.getUserInterests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get recent sessions for this user
    const sessions = await Analytics.find({ user: userId })
      .sort({ sessionStart: -1 })
      .limit(10);

    // Aggregate interests
    const interestsMap = new Map();

    sessions.forEach(session => {
      session.interests.forEach(interest => {
        if (interestsMap.has(interest.category)) {
          const existing = interestsMap.get(interest.category);
          existing.viewCount += interest.viewCount;
          existing.lastViewed = interest.lastViewed > existing.lastViewed ?
                                interest.lastViewed : existing.lastViewed;
        } else {
          interestsMap.set(interest.category, {
            category: interest.category,
            viewCount: interest.viewCount,
            lastViewed: interest.lastViewed
          });
        }
      });
    });

    const interests = Array.from(interestsMap.values())
      .sort((a, b) => b.viewCount - a.viewCount);

    res.json({
      success: true,
      interests
    });
  } catch (error) {
    console.error('Error getting user interests:', error);
    res.status(500).json({ success: false, message: 'Failed to get user interests' });
  }
};
