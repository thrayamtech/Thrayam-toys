const axios = require('axios');

/**
 * Geolocation Service
 * Uses multiple free IP geolocation APIs with fallback options
 */
class GeolocationService {
  /**
   * Get geolocation from IP using ip-api.com (free, no API key needed)
   * Limit: 45 requests per minute from an IP address
   */
  static async getLocationFromIP(ip) {
    try {
      // Skip local IPs
      if (this.isLocalIP(ip)) {
        return this.getDefaultLocation();
      }

      // Try primary API: ip-api.com (free, reliable)
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 5000
      });

      if (response.data && response.data.status === 'success') {
        return {
          ip: ip,
          country: response.data.country,
          countryCode: response.data.countryCode,
          region: response.data.region,
          regionName: response.data.regionName,
          city: response.data.city,
          zip: response.data.zip,
          lat: response.data.lat,
          lon: response.data.lon,
          timezone: response.data.timezone,
          isp: response.data.isp
        };
      }

      // Fallback to default if API fails
      return this.getDefaultLocation();
    } catch (error) {
      console.error('Error fetching geolocation:', error.message);

      // Try fallback API
      try {
        return await this.getFallbackLocation(ip);
      } catch (fallbackError) {
        console.error('Fallback geolocation also failed:', fallbackError.message);
        return this.getDefaultLocation();
      }
    }
  }

  /**
   * Fallback geolocation API: ipapi.co (free, 1000 requests/day)
   */
  static async getFallbackLocation(ip) {
    try {
      if (this.isLocalIP(ip)) {
        return this.getDefaultLocation();
      }

      const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 5000
      });

      if (response.data) {
        return {
          ip: ip,
          country: response.data.country_name,
          countryCode: response.data.country_code,
          region: response.data.region_code,
          regionName: response.data.region,
          city: response.data.city,
          zip: response.data.postal,
          lat: response.data.latitude,
          lon: response.data.longitude,
          timezone: response.data.timezone,
          isp: response.data.org
        };
      }

      return this.getDefaultLocation();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if IP is local/private
   */
  static isLocalIP(ip) {
    if (!ip) return true;

    // Common local IP patterns
    const localPatterns = [
      /^127\./,           // localhost
      /^10\./,            // private network
      /^192\.168\./,      // private network
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // private network
      /^::1$/,            // IPv6 localhost
      /^fe80:/,           // IPv6 link-local
      /^::ffff:127\./,    // IPv4-mapped IPv6 localhost
    ];

    return localPatterns.some(pattern => pattern.test(ip)) ||
           ip === 'localhost' ||
           ip === '::1';
  }

  /**
   * Extract IP from request
   */
  static getClientIP(req) {
    // Check various headers for the real IP (handles proxies)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // x-forwarded-for can be a comma-separated list
      return forwarded.split(',')[0].trim();
    }

    return req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.connection.socket?.remoteAddress ||
           req.ip;
  }

  /**
   * Default location for local/unknown IPs
   */
  static getDefaultLocation() {
    return {
      ip: 'unknown',
      country: 'Unknown',
      countryCode: 'XX',
      region: '',
      regionName: 'Unknown',
      city: 'Unknown',
      zip: '',
      lat: 0,
      lon: 0,
      timezone: 'UTC',
      isp: 'Unknown'
    };
  }

  /**
   * Parse user agent to extract device info
   */
  static parseUserAgent(userAgentString) {
    const ua = userAgentString || '';

    // Detect device type
    const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua);
    const isDesktop = !isMobile && !isTablet;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'IE';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows NT 10')) os = 'Windows 10';
    else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
    else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // Device name
    let device = 'Unknown';
    if (isMobile) device = 'Mobile';
    else if (isTablet) device = 'Tablet';
    else if (isDesktop) device = 'Desktop';

    return {
      userAgent: ua,
      browser,
      os,
      device,
      isMobile,
      isTablet,
      isDesktop
    };
  }

  /**
   * Get complete visitor info from request
   */
  static async getVisitorInfo(req) {
    const ip = this.getClientIP(req);
    const geolocation = await this.getLocationFromIP(ip);
    const deviceInfo = this.parseUserAgent(req.headers['user-agent']);

    return {
      geolocation,
      deviceInfo,
      ip
    };
  }
}

module.exports = GeolocationService;
