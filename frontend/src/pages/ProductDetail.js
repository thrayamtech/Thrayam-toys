import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart, FaCheck, FaMinus, FaPlus, FaWhatsapp, FaBolt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
// useAuth removed - cart now works for both logged in and guest users
import { toast } from 'react-toastify';
import API from '../utils/api';
import analytics from '../utils/analytics';
import { trackViewContent, trackAddToCart as trackPixelAddToCart } from '../utils/metaPixel';
import { getProductImage, handleImageError } from '../utils/imageHelper';
import { setSEO, generateProductSchema, generateBreadcrumbSchema } from '../utils/seo';
import WhatsAppChat from '../components/WhatsAppChat';
import ProductCard from '../components/ProductCard';
import ProductReelFloat from '../components/ProductReelFloat';

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showLightbox, setShowLightbox] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [productReels, setProductReels] = useState([]);
  const { addToCart } = useCart();

  // Social proof — stable random values per product page load
  const [socialProof] = useState(() => {
    const rawRating = (Math.floor(Math.random() * 11) + 40) / 10; // 4.0–5.0 in 0.1 steps
    return {
      sold: Math.floor(Math.random() * 8) + 3,      // 3–10
      hours: Math.floor(Math.random() * 16) + 5,    // 5–20
      viewing: Math.floor(Math.random() * 16) + 20, // 20–35
      rating: rawRating,
      reviews: Math.floor(Math.random() * 3) + 8,   // 8–10
    };
  });

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Track product view and set SEO
  useEffect(() => {
    if (product) {
      const searchParams = new URLSearchParams(location.search);
      const source = searchParams.get('source') || 'direct';
      analytics.trackProductView(product._id, source);
      // Meta Pixel: Track ViewContent
      trackViewContent(product);

      // SEO: Set page title, meta tags, and structured data
      const categoryName = product.category?.name || 'Sarees';
      const priceText = product.discountPrice
        ? `₹${product.discountPrice.toLocaleString()}`
        : `₹${product.price?.toLocaleString()}`;

      setSEO({
        title: `${product.name} - ${categoryName}`,
        description: `Buy ${product.name} online at Thrayam Threads. ${product.fabric ? `Made with premium ${product.fabric}.` : ''} ${categoryName}. Price: ${priceText}. Free shipping across India. ${product.description?.slice(0, 100) || ''}`,
        url: `/products/${product._id}`,
        image: getProductImage(product),
        type: 'product',
        structuredData: generateProductSchema(product)
      });

      // Add Breadcrumb structured data
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: product.name, url: `/products/${product._id}` }
      ];
      const breadcrumbScript = document.getElementById('breadcrumb-structured-data');
      if (breadcrumbScript) {
        breadcrumbScript.textContent = JSON.stringify(generateBreadcrumbSchema(breadcrumbs));
      } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'breadcrumb-structured-data';
        script.textContent = JSON.stringify(generateBreadcrumbSchema(breadcrumbs));
        document.head.appendChild(script);
      }
    }
  }, [product, location]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      // Set default selections
      if (data.product.sizes && data.product.sizes.length > 0) {
        setSelectedSize(data.product.sizes[0]);
      }
      if (data.product.colors && data.product.colors.length > 0) {
        setSelectedColor(data.product.colors[0].name);
      }
      // Fetch reels linked to this product only
      try {
        const reelRes = await API.get(`/reels/active?product=${data.product._id}`);
        const filtered = (reelRes.data.reels || []).filter(
          r => r.product?._id === data.product._id || r.product === data.product._id
        );
        setProductReels(filtered);
      } catch (_) {}

      // Fetch similar products from same category, fill with recent if < 7
      try {
        let similar = [];
        if (data.product.category?._id) {
          const simRes = await API.get(`/products?category=${data.product.category._id}&limit=8`);
          similar = (simRes.data.products || []).filter(p => p._id !== data.product._id).slice(0, 7);
        }
        if (similar.length < 7) {
          const recentRes = await API.get('/products?limit=20&sort=-createdAt');
          const existingIds = new Set([data.product._id, ...similar.map(p => p._id)]);
          const recent = (recentRes.data.products || []).filter(p => !existingIds.has(p._id));
          similar = [...similar, ...recent].slice(0, 7);
        }
        setSimilarProducts(similar);
      } catch (_) {}
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Check if product is out of stock
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    const hasOptions = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);
    if (hasOptions && (!selectedSize || !selectedColor)) {
      toast.error('Please select size and color');
      return;
    }

    // Check if requested quantity exceeds available stock
    let quantityToAdd = quantity;
    if (quantity > product.stock) {
      quantityToAdd = product.stock;
      toast.info(`Only ${product.stock} items available. Adding maximum quantity.`);
    }

    try {
      await addToCart(product._id, quantityToAdd, selectedSize || 'Free Size', selectedColor || 'Default');

      // Track add to cart action
      analytics.trackAddToCart(product._id, product.name, quantityToAdd);
      // Meta Pixel: Track AddToCart
      trackPixelAddToCart(product, quantityToAdd);

      toast.success('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      toast.error(errorMessage);
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) { toast.error('Product is out of stock'); return; }
    const hasOptions = (product.sizes?.length > 0) || (product.colors?.length > 0);
    if (hasOptions && (!selectedSize || !selectedColor)) {
      toast.error('Please select size and color'); return;
    }
    try {
      await addToCart(product._id, quantity, selectedSize || 'Free Size', selectedColor || 'Default');
      navigate('/checkout');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to proceed');
    }
  };

  const handleWhatsAppShare = () => {
    const price = product.discountPrice || product.price;
    const text = `🛍️ Check out this beautiful saree!\n\n*${product.name}*\n💰 ₹${price.toLocaleString()}\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const discountPercent = product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5A0F1B]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/products" className="text-[#5A0F1B] hover:text-[#7A1525]">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-[1600px] mx-auto px-3 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
          <Link to="/" className="hover:text-[#5A0F1B]">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#5A0F1B]">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-lg shadow-sm p-4">
          {/* Left Side - Images */}
          <div className="flex gap-3">
            {/* Thumbnail Images - Left Side */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index
                        ? 'border-[#5A0F1B] ring-2 ring-[#5A0F1B]/20'
                        : 'border-gray-200 hover:border-[#5A0F1B]/50'
                    }`}
                  >
                    <img
                      src={getProductImage(product, index)}
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => handleImageError(e, 'product')}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1">
              <div
                className="relative bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in group"
                style={{ maxHeight: '70vh' }}
                onClick={() => setShowLightbox(true)}
              >
                <img
                  src={getProductImage(product, selectedImage)}
                  alt={product.name}
                  onError={(e) => handleImageError(e, 'product')}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: '70vh' }}
                />
                {product.discountPrice && (
                  <div className="absolute top-4 left-0 z-10">
                    <div className="bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] text-white pl-4 pr-5 py-2 rounded-r-full shadow-lg">
                      <span className="text-sm font-bold">-{discountPercent}% OFF</span>
                    </div>
                  </div>
                )}
                {/* Click to zoom indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium text-gray-800">Click to view full size</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div>
            {/* Brand */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#5A0F1B] uppercase tracking-widest">🏷️ Brand:</span>
              <span className="text-xs font-bold text-gray-800">Thrayam</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex text-[#8A1F35]">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.floor(socialProof.rating) ? 'text-[#8A1F35]' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#8A1F35]">{socialProof.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({socialProof.reviews} reviews)</span>
            </div>

            {/* Happy Customers */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-gray-500">😊</span>
              <span className="text-xs font-semibold text-green-700">500+ happy customers</span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-gray-500">Trusted by families across India</span>
            </div>

            {/* Viewers Now */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs text-gray-600">
                👀 <span className="font-bold text-gray-800">{socialProof.viewing} people</span> are viewing this right now
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                    Save ₹{(product.price - product.discountPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div
              className="text-sm text-gray-700 mb-3 leading-relaxed product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Social Proof — Sold Badge */}
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg animate-pulse-slow">
              <span className="text-lg">🔥</span>
              <p className="text-xs font-semibold text-orange-700">
                <span className="text-red-600 font-bold">{socialProof.sold} pieces</span> sold in the last{' '}
                <span className="text-red-600 font-bold">{socialProof.hours} hours</span> — grab yours before it's gone! ⚡
              </p>
            </div>

            {/* Stock Progress Bar */}
            {product.stock > 0 && (() => {
              const maxDisplay = 50;
              const pct = Math.min((product.stock / maxDisplay) * 100, 100);
              const isLow = product.stock <= 5;
              const isMed = product.stock <= 15;
              const barColor = isLow
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : isMed
                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                : 'bg-gradient-to-r from-[#5A0F1B] to-[#7A1525]';
              const textColor = isLow ? 'text-red-600' : isMed ? 'text-orange-600' : 'text-[#5A0F1B]';
              return (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-600">Availability</span>
                    <span className={`text-xs font-bold ${textColor}`}>
                      {isLow ? `⚠️ Only ${product.stock} left!` : isMed ? `⏳ ${product.stock} left — selling fast` : `✅ ${product.stock} in stock`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Free Shipping + Secure Checkout Strip */}
            <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-700 flex items-center gap-1">🚚 <span className="font-semibold">Free shipping</span> above ₹999</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-700 flex items-center gap-1">🔒 <span className="font-semibold">Secure</span> checkout</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-700 flex items-center gap-1">↩️ <span className="font-semibold">7-day</span> returns</span>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  Select Size
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`relative py-3 px-4 border-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedSize === size
                          ? 'border-[#5A0F1B] bg-[#5A0F1B]/10 text-[#7A1525]'
                          : 'border-gray-200 hover:border-[#5A0F1B]/50 text-gray-700'
                      }`}
                    >
                      {size}
                      {selectedSize === size && (
                        <div className="absolute -top-1 -right-1 bg-[#5A0F1B] text-white rounded-full p-1">
                          <FaCheck className="text-[10px]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative flex items-center gap-3 py-2 px-4 border-2 rounded-lg transition-all ${
                        selectedColor === color.name
                          ? 'border-[#5A0F1B] bg-[#5A0F1B]/10'
                          : 'border-gray-200 hover:border-[#5A0F1B]/50'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md ring-2 ring-gray-200"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="font-semibold text-sm text-gray-800">{color.name}</span>
                      {selectedColor === color.name && (
                        <FaCheck className="text-[#5A0F1B] ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <FaMinus className="text-gray-600" />
                  </button>
                  <span className="px-6 py-3 font-bold text-lg border-x-2 border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <FaPlus className="text-gray-600" />
                  </button>
                </div>
                {product.stock === 0 && (
                  <span className="text-sm font-semibold text-red-600">Out of stock</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FaShoppingCart />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FaBolt />
                Buy Now
              </button>
              <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg transition-all">
                <FaHeart className="text-xl" />
              </button>
            </div>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-4 bg-[#25D366] hover:bg-[#20bc5a] text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaWhatsapp className="text-lg" />
              Share on WhatsApp
            </button>

            {/* Product Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600 font-medium">Category:</span>
                  <span className="ml-2 text-gray-900">{product.category?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Fabric:</span>
                  <span className="ml-2 text-gray-900">{product.fabric}</span>
                </div>
                {product.specifications?.length && (
                  <div>
                    <span className="text-gray-600 font-medium">Length:</span>
                    <span className="ml-2 text-gray-900">{product.specifications.length}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 font-medium">SKU:</span>
                  <span className="ml-2 text-gray-900">{product._id?.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications.length && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Length:</span>
                  <span className="text-gray-900">{product.specifications.length}</span>
                </div>
              )}
              {product.specifications.width && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Width:</span>
                  <span className="text-gray-900">{product.specifications.width}</span>
                </div>
              )}
              {product.specifications.blousePiece !== undefined && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Blouse Piece:</span>
                  <span className="text-gray-900">{product.specifications.blousePiece ? 'Included' : 'Not Included'}</span>
                </div>
              )}
              {product.specifications.washCare && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Wash Care:</span>
                  <span className="text-gray-900">{product.specifications.washCare}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#5A0F1B] font-semibold uppercase tracking-widest mb-0.5">You May Also Like</p>
              <h2 className="text-lg md:text-xl font-serif font-bold text-gray-900">Similar Products</h2>
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#5A0F1B] to-transparent"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {similarProducts.map(p => (
              <div key={p._id} className="flex-shrink-0 w-[160px] sm:w-[185px] md:w-[210px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-light z-10"
          >
            ×
          </button>

          {/* Navigation Arrows */}
          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all z-10"
              >
                <span className="text-2xl">←</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all z-10"
              >
                <span className="text-2xl">→</span>
              </button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative flex items-center justify-center"
            style={{ maxHeight: '85vh', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getProductImage(product, selectedImage)}
              alt={product.name}
              onError={(e) => handleImageError(e, 'product')}
              className="object-contain"
              style={{ maxHeight: '85vh', maxWidth: '90vw' }}
            />
          </div>

          {/* Image Counter and Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              {/* Image Counter */}
              <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {selectedImage + 1} / {product.images.length}
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 bg-black/60 p-2 rounded-lg max-w-[90vw] overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-[#5A0F1B] ring-2 ring-[#5A0F1B]/30'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={getProductImage(product, index)}
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => handleImageError(e, 'product')}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Mobile Bottom Bar */}
      {product.stock > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 transition-transform"
          >
            <FaShoppingCart className="text-base" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 transition-transform"
          >
            <FaBolt className="text-base" />
            Buy Now
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform flex-shrink-0"
            title="Share on WhatsApp"
          >
            <FaWhatsapp className="text-xl" />
          </button>
        </div>
      )}

      {/* WhatsApp Chat — product enquiry (global one is hidden on this route) */}
      <WhatsAppChat product={product} />

      {/* Floating reel stamp — only shown when reels exist for this product */}
      <ProductReelFloat reels={productReels} />
    </div>
  );
};

export default ProductDetail;
