/**
 * SEO Utility for Thrayam Toys
 * Manages dynamic meta tags, structured data, and page titles
 */

const SITE_NAME    = 'Thrayam Toys';
const SITE_URL     = 'https://thrayamtoys.com';
const SITE_PHONE   = '+918807259471';
const SITE_EMAIL   = 'info@thrayamtoys.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const TWITTER_HANDLE = '@thrayamtoys';

/* ── Title ──────────────────────────────────────────────────────── */
export const setPageTitle = (title) => {
  document.title = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} – Buy Safe Wooden & Educational Toys Online India`;
};

/* ── Meta description ───────────────────────────────────────────── */
export const setMetaDescription = (description) => {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.appendChild(tag);
  }
  tag.content = description;
};

/* ── Meta keywords ──────────────────────────────────────────────── */
export const setMetaKeywords = (keywords) => {
  let tag = document.querySelector('meta[name="keywords"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'keywords';
    document.head.appendChild(tag);
  }
  tag.content = Array.isArray(keywords) ? keywords.join(', ') : keywords;
};

/* ── Canonical URL ──────────────────────────────────────────────── */
export const setCanonicalUrl = (url) => {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  tag.href = url.startsWith('http') ? url : `${SITE_URL}${url}`;
};

/* ── Open Graph ─────────────────────────────────────────────────── */
export const setOpenGraphTags = (og) => {
  const ogTags = {
    'og:site_name':  SITE_NAME,
    'og:locale':     'en_IN',
    'og:title':      og.title || document.title,
    'og:description':og.description || '',
    'og:image':      og.image || DEFAULT_IMAGE,
    'og:image:secure_url': og.image || DEFAULT_IMAGE,
    'og:image:width': '1200',
    'og:image:height':'630',
    'og:url':        og.url ? (og.url.startsWith('http') ? og.url : `${SITE_URL}${og.url}`) : window.location.href,
    'og:type':       og.type || 'website',
  };
  Object.entries(ogTags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  });
};

/* ── Twitter Card ───────────────────────────────────────────────── */
export const setTwitterTags = (twitter) => {
  const twitterTags = {
    'twitter:card':        'summary_large_image',
    'twitter:site':        TWITTER_HANDLE,
    'twitter:creator':     TWITTER_HANDLE,
    'twitter:title':       twitter.title || document.title,
    'twitter:description': twitter.description || '',
    'twitter:image':       twitter.image || DEFAULT_IMAGE,
    'twitter:image:alt':   twitter.imageAlt || `${SITE_NAME} - Safe Wooden Toys for Kids`,
  };
  Object.entries(twitterTags).forEach(([name, content]) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  });
};

/* ── Structured Data ────────────────────────────────────────────── */
export const setStructuredData = (data, id = 'page-structured-data') => {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

/* ── Product Schema ─────────────────────────────────────────────── */
export const generateProductSchema = (product) => {
  const price = product.discountPrice || product.price;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/<[^>]+>/g, '').slice(0, 300),
    image: (product.images || []).map(img =>
      (typeof img === 'string' ? img : img.url || '').startsWith('http')
        ? (typeof img === 'string' ? img : img.url)
        : `${SITE_URL}/uploads/${typeof img === 'string' ? img : img.url}`
    ).filter(Boolean),
    sku: product._id?.slice(-8).toUpperCase(),
    mpn: product._id,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.category?.name || 'Wooden Toys',
    material: product.material || 'Wood',
    audience: {
      '@type': 'PeopleAudience',
      suggestedMinAge: 0,
      suggestedMaxAge: 12,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product._id}`,
      priceCurrency: 'INR',
      price: price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: price >= 499 ? 0 : 49,
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime:  { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
  if (product.numReviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating || 4.5,
      bestRating: 5,
      worstRating: 1,
      reviewCount: product.numReviews,
    };
  }
  return schema;
};

/* ── Breadcrumb Schema ──────────────────────────────────────────── */
export const generateBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
  })),
});

/* ── Collection / ItemList Schema ───────────────────────────────── */
export const generateCollectionSchema = (category, products = []) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: category.name || 'Wooden Toys Collection',
  description: category.description || `Shop ${category.name || 'wooden toys'} at ${SITE_NAME} — safe, educational & handcrafted.`,
  url: `${SITE_URL}/products${category._id && category._id !== 'all' ? `?category=${category._id}` : ''}`,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 12).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: `${SITE_URL}/products/${product._id}`,
        image: product.images?.[0]
          ? (product.images[0].startsWith?.('http') ? product.images[0] : `${SITE_URL}/uploads/${product.images[0]}`)
          : DEFAULT_IMAGE,
        offers: {
          '@type': 'Offer',
          price: product.discountPrice || product.price,
          priceCurrency: 'INR',
          availability: product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
        aggregateRating: product.numReviews > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating || 4.5,
          reviewCount: product.numReviews,
        } : undefined,
      },
    })),
  },
});

/* ── FAQ Schema ─────────────────────────────────────────────────── */
export const generateFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});

export const DEFAULT_FAQ = [
  {
    question: 'Are Thrayam Toys wooden toys safe for babies and infants?',
    answer: 'Yes. All Thrayam Toys wooden toys are made from non-toxic, child-safe materials. They are sanded smooth, free from harmful chemicals, and designed to meet child safety standards for infants and toddlers.',
  },
  {
    question: 'What types of wood are used in Thrayam Toys products?',
    answer: 'We use premium quality natural wood that is sustainably sourced, smooth-finished, and child-safe. Each toy is crafted to be durable and gentle on small hands.',
  },
  {
    question: 'Do you offer free shipping on wooden toys in India?',
    answer: 'Yes! Thrayam Toys offers free shipping on all orders above ₹499 across India. Orders below ₹499 attract a nominal shipping fee.',
  },
  {
    question: 'What is the return policy for Thrayam Toys?',
    answer: 'We offer a 7-day hassle-free return policy. If you are not satisfied with your purchase, you can return it within 7 days of delivery for a full refund.',
  },
  {
    question: 'Which wooden toys are best for 6 month old babies in India?',
    answer: 'For 6 month old babies, we recommend sensory rattles, soft-grip wooden rings, and high-contrast visual toys. These support motor skill development and sensory exploration at this age.',
  },
  {
    question: 'What are Montessori wooden toys and why are they better?',
    answer: 'Montessori wooden toys are open-ended, natural toys that encourage independent play, problem-solving, and creativity. Unlike plastic toys, they are durable, safe, and support every stage of a child\'s cognitive and physical development.',
  },
  {
    question: 'Do Thrayam Toys have age-appropriate toy recommendations?',
    answer: 'Yes! We categorise all our toys by age group — from 0–3 months all the way up to 24+ months — so you can easily find the most developmentally appropriate toy for your child.',
  },
  {
    question: 'Can I buy Thrayam Toys wooden toys as a gift?',
    answer: 'Absolutely! We offer gift wrapping and have curated gift sets for occasions like birthdays, baby showers, Diwali, and Christmas. Our toys make thoughtful, lasting gifts that parents love.',
  },
];

/* ── Local Business Schema ──────────────────────────────────────── */
export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['Store', 'OnlineStore'],
  '@id': `${SITE_URL}/#store`,
  name: SITE_NAME,
  alternateName: 'Thrayam Toys – Safe Wooden Toys India',
  description: 'Premium handcrafted wooden toys for babies, toddlers and kids. Safe, non-toxic, educational toys shop online in India with free shipping above ₹499.',
  url: SITE_URL,
  telephone: SITE_PHONE,
  email: SITE_EMAIL,
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking, Wallets',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'Tamil Nadu',
  },
  logo: `${SITE_URL}/logo.jpg`,
  image: DEFAULT_IMAGE,
  sameAs: [
    'https://www.facebook.com/thrayamtoys',
    'https://www.instagram.com/thrayamtoys',
    'https://www.youtube.com/@thrayamtoys',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Wooden & Educational Toys',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Wooden Toys for Babies' },
      { '@type': 'OfferCatalog', name: 'Montessori Toys for Toddlers' },
      { '@type': 'OfferCatalog', name: 'Educational STEM Toys' },
      { '@type': 'OfferCatalog', name: 'Gift Sets for Kids' },
    ],
  },
});

/* ── Unified setSEO ─────────────────────────────────────────────── */
export const setSEO = (config) => {
  const { title, description, keywords, url, image, imageAlt, type = 'website', structuredData } = config;

  setPageTitle(title);
  if (description) setMetaDescription(description);
  if (keywords)    setMetaKeywords(keywords);
  if (url)         setCanonicalUrl(url);

  const fullTitle = title ? `${title} | ${SITE_NAME}` : undefined;
  setOpenGraphTags({ title: fullTitle, description, url, image, type });
  setTwitterTags({ title: fullTitle, description, image, imageAlt });

  if (structuredData) setStructuredData(structuredData);
};

/* ── Page-level SEO configs ─────────────────────────────────────── */
export const PAGE_SEO = {
  home: {
    title: 'Buy Safe Wooden & Educational Toys Online India',
    description: 'Shop handcrafted wooden toys for babies and toddlers at Thrayam Toys. Age-appropriate, non-toxic, Montessori-inspired toys with free shipping above ₹499 across India.',
    keywords: ['wooden toys India', 'educational toys for babies', 'Montessori toys', 'buy wooden toys online', 'safe toys for infants', 'toddler toys India', 'non-toxic wooden toys', 'Thrayam Toys', 'wooden toys for 6 month baby', 'best toys for toddlers India'],
    url: '/',
  },
  products: {
    title: 'Shop All Wooden & Educational Toys',
    description: 'Browse 100+ safe, handcrafted wooden toys for every age. Filter by age group, category, and price. Free shipping above ₹499 across India.',
    keywords: ['buy wooden toys online India', 'educational toys', 'toys for babies', 'Montessori toys India', 'wooden toys shop', 'kids toys online'],
    url: '/products',
  },
  about: {
    title: 'About Thrayam Toys – Our Story',
    description: 'Learn about Thrayam Toys — India\'s trusted wooden toy brand. Discover our commitment to safe, non-toxic, handcrafted educational toys for babies and toddlers.',
    url: '/about',
  },
  contact: {
    title: 'Contact Us – Thrayam Toys',
    description: 'Get in touch with Thrayam Toys. We are here to help with toy queries, orders, and gifting advice. Call, email, or WhatsApp us.',
    url: '/contact',
  },
  blogs: {
    title: 'Toy Guides & Child Development Blog',
    description: 'Expert toy guides, age-based recommendations, and child development tips from Thrayam Toys. Learn which toys are best for your baby\'s growth stage.',
    url: '/blogs',
  },
};

/* ── Product alt text ───────────────────────────────────────────── */
export const generateProductAltText = (product, index = 0) => {
  const parts = [product.name];
  if (product.material)          parts.push(product.material);
  if (product.category?.name)    parts.push(product.category.name);
  if (product.ageGroup)          parts.push(`for ${product.ageGroup}`);
  const suffix = index > 0 ? ` – Image ${index + 1}` : '';
  return `${parts.join(' – ')}${suffix} | ${SITE_NAME}`;
};

const seoUtils = {
  setSEO, setPageTitle, setMetaDescription, setMetaKeywords,
  setCanonicalUrl, setOpenGraphTags, setTwitterTags,
  setStructuredData, generateProductSchema, generateBreadcrumbSchema,
  generateCollectionSchema, generateFAQSchema, generateLocalBusinessSchema,
  generateProductAltText, DEFAULT_FAQ, PAGE_SEO,
};

export default seoUtils;
