const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

const SITE_URL = process.env.SITE_URL || 'https://thrayamtoys.com';
const SITE_NAME = 'Thrayam Toys';

/**
 * @route   GET /api/seo/sitemap.xml
 * @desc    Generate dynamic XML sitemap
 * @access  Public
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .select('_id updatedAt')
      .lean();

    // Fetch all categories
    const categories = await Category.find({ isActive: true })
      .select('_id slug updatedAt')
      .lean();

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/blogs', priority: '0.6', changefreq: 'weekly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
      { url: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/shipping-policy', priority: '0.3', changefreq: 'yearly' },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add category pages
    categories.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/products?category=${category._id}</loc>\n`;
      xml += `    <lastmod>${new Date(category.updatedAt).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add product pages
    products.forEach(product => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/products/${product._id}</loc>\n`;
      xml += `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += `\n  <!-- Google Shopping Feed: ${SITE_URL}/api/seo/feed/google.xml -->\n`;
    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ message: 'Error generating sitemap' });
  }
});

/**
 * @route   GET /api/seo/feed/google.xml
 * @desc    Google Merchant Center product feed (RSS 2.0 + Google namespace)
 * @access  Public
 */
router.get('/feed/google.xml', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .populate('category', 'name')
      .lean();

    // Age group → Google age_group mapping
    const toGoogleAge = (ag) => {
      if (!ag) return 'kids';
      if (ag.includes('month')) return 'infant';
      if (ag === '1-2 years' || ag === '2-3 years') return 'toddler';
      if (ag === '3-5 years' || ag === '5-8 years') return 'kids';
      if (ag === '8-12 years' || ag === '12+ years') return 'kids';
      return 'kids';
    };

    // Escape XML special characters
    const esc = (str = '') => String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    // Strip HTML tags from description
    const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += `    <title>${esc(SITE_NAME)}</title>\n`;
    xml += `    <link>${SITE_URL}</link>\n`;
    xml += `    <description>Safe handcrafted wooden toys for babies and toddlers — ${SITE_NAME}</description>\n\n`;

    products.forEach(product => {
      const price = product.discountPrice || product.price;
      const originalPrice = product.price;
      const imageUrl = product.images?.[0]?.url || '';
      const additionalImages = (product.images || []).slice(1, 5).map(img => img.url).filter(Boolean);
      const description = stripHtml(product.description).slice(0, 500) || product.name;
      const productUrl = `${SITE_URL}/products/${product._id}`;
      const mpn = `THR-${product._id.toString().slice(-8).toUpperCase()}`;
      const categoryName = product.category?.name || 'Wooden Toys';

      xml += '    <item>\n';
      xml += `      <g:id>${esc(product._id.toString())}</g:id>\n`;
      xml += `      <g:title>${esc(product.name)}</g:title>\n`;
      xml += `      <g:description>${esc(description)}</g:description>\n`;
      xml += `      <g:link>${esc(productUrl)}</g:link>\n`;
      if (imageUrl) {
        xml += `      <g:image_link>${esc(imageUrl)}</g:image_link>\n`;
      }
      additionalImages.forEach(imgUrl => {
        xml += `      <g:additional_image_link>${esc(imgUrl)}</g:additional_image_link>\n`;
      });
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>in stock</g:availability>\n`;
      xml += `      <g:price>${price.toFixed(2)} INR</g:price>\n`;
      if (product.discountPrice && product.discountPrice < originalPrice) {
        xml += `      <g:sale_price>${product.discountPrice.toFixed(2)} INR</g:sale_price>\n`;
      }
      xml += `      <g:brand>${esc(product.brand || SITE_NAME)}</g:brand>\n`;
      xml += `      <g:mpn>${esc(mpn)}</g:mpn>\n`;
      xml += `      <g:product_type>${esc(`Toys &amp; Games > ${categoryName}`)}</g:product_type>\n`;
      xml += `      <g:google_product_category>1239</g:google_product_category>\n`;
      xml += `      <g:age_group>${toGoogleAge(product.ageGroup)}</g:age_group>\n`;
      if (product.material) {
        xml += `      <g:material>${esc(product.material)}</g:material>\n`;
      }
      if (product.ageGroup) {
        xml += `      <g:custom_label_0>${esc(product.ageGroup)}</g:custom_label_0>\n`;
      }
      xml += `      <g:shipping>\n`;
      xml += `        <g:country>IN</g:country>\n`;
      xml += `        <g:service>Standard</g:service>\n`;
      xml += `        <g:price>${price >= 499 ? '0.00' : '49.00'} INR</g:price>\n`;
      xml += `      </g:shipping>\n`;
      xml += `      <g:identifier_exists>yes</g:identifier_exists>\n`;
      xml += '    </item>\n';
    });

    xml += '  </channel>\n';
    xml += '</rss>';

    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=3600'); // cache 1 hour
    res.send(xml);
  } catch (error) {
    console.error('Google feed generation error:', error);
    res.status(500).json({ message: 'Error generating product feed' });
  }
});

/**
 * @route   GET /api/seo/robots.txt
 * @desc    Serve robots.txt
 * @access  Public
 */
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `# Robots.txt for ${SITE_NAME}
# ${SITE_URL}

User-agent: *
Allow: /
Allow: /products
Allow: /products/*
Allow: /about
Allow: /contact
Allow: /blogs

Disallow: /admin
Disallow: /admin/*
Disallow: /profile
Disallow: /orders
Disallow: /cart
Disallow: /checkout
Disallow: /login
Disallow: /register
Disallow: /wallet
Disallow: /wishlist

Sitemap: ${SITE_URL}/api/seo/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

module.exports = router;
