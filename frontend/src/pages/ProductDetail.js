import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart, FaCheck, FaMinus, FaPlus, FaWhatsapp, FaBolt, FaChevronUp, FaChevronDown, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import API from '../utils/api';
import analytics from '../utils/analytics';
import { trackViewContent, trackAddToCart as trackPixelAddToCart } from '../utils/metaPixel';
import { getProductImage, handleImageError } from '../utils/imageHelper';
import { setSEO, generateProductSchema, generateBreadcrumbSchema } from '../utils/seo';
import WhatsAppChat from '../components/WhatsAppChat';
import ProductCard from '../components/ProductCard';
import ProductReelFloat from '../components/ProductReelFloat';

/* ── Palette ──────────────────────────────────────────────────── */
const C = {
  skin:      '#F7EFE5',
  skinLight: '#FDFAF6',
  skinMid:   '#EDD8C0',
  skinBorder:'#DFC09A',
  wood:      '#6B4226',
  dark:      '#2F1E14',
  sage:      '#8FAF9D',
  sageMid:   '#D6E8DE',
  sageDark:  '#4F7A65',
  gold:      '#DDBB72',
  goldMid:   '#F4EAC8',
  terra:     '#C96A4A',
  terraMid:  '#F5D8CC',
};

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
  const [wishlisted, setWishlisted] = useState(false);
  const [bundleSelected, setBundleSelected] = useState([]);
  const [addingBundle, setAddingBundle] = useState(false);
  const thumbStripRef = useRef(null);
  const { addToCart } = useCart();

  const [socialProof] = useState(() => ({
    sold:    Math.floor(Math.random() * 8) + 3,
    hours:   Math.floor(Math.random() * 16) + 5,
    viewing: Math.floor(Math.random() * 16) + 20,
    rating:  (Math.floor(Math.random() * 11) + 40) / 10,
    reviews: Math.floor(Math.random() * 3) + 8,
  }));

  useEffect(() => { fetchProduct(); }, [id]); // eslint-disable-line

  useEffect(() => {
    if (!product) return;
    const source = new URLSearchParams(location.search).get('source') || 'direct';
    analytics.trackProductView(product._id, source);
    trackViewContent(product);
    const categoryName = product.category?.name || 'Toys';
    const priceText = product.discountPrice ? `₹${product.discountPrice.toLocaleString()}` : `₹${product.price?.toLocaleString()}`;
    setSEO({
      title: product.seoTitle || `${product.name} - ${categoryName}`,
      description: product.seoDescription || `Buy ${product.name} at Thrayam Toys. ${categoryName}. Price: ${priceText}. ${product.description?.slice(0, 100) || ''}`,
      keywords: product.seoKeywords ? product.seoKeywords.split(',').map(k => k.trim()) : undefined,
      url: `/products/${product._id}`,
      image: getProductImage(product),
      type: 'product',
      structuredData: generateProductSchema(product),
    });
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: product.name, url: `/products/${product._id}` },
    ];
    const existing = document.getElementById('breadcrumb-structured-data');
    if (existing) { existing.textContent = JSON.stringify(generateBreadcrumbSchema(breadcrumbs)); }
    else {
      const s = document.createElement('script');
      s.type = 'application/ld+json'; s.id = 'breadcrumb-structured-data';
      s.textContent = JSON.stringify(generateBreadcrumbSchema(breadcrumbs));
      document.head.appendChild(s);
    }
  }, [product, location]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
      if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0].name);
      try {
        let similar = [];
        if (data.product.category?._id) {
          const simRes = await API.get(`/products?category=${data.product.category._id}&limit=8`);
          similar = (simRes.data.products || []).filter(p => p._id !== data.product._id).slice(0, 7);
        }
        if (similar.length < 7) {
          const recentRes = await API.get('/products?limit=20&sort=-createdAt');
          const ids = new Set([data.product._id, ...similar.map(p => p._id)]);
          similar = [...similar, ...(recentRes.data.products || []).filter(p => !ids.has(p._id))].slice(0, 7);
        }
        setSimilarProducts(similar);
        setBundleSelected(similar.slice(0, 2).map(p => p._id));
      } catch (_) {}
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) { toast.error('Product is out of stock'); return; }
    const hasOptions = (product.sizes?.length > 0) || (product.colors?.length > 0);
    if (hasOptions && (!selectedSize || !selectedColor)) { toast.error('Please select size and color'); return; }
    const qty = Math.min(quantity, product.stock);
    try {
      await addToCart(product._id, qty, selectedSize || 'Free Size', selectedColor || 'Default');
      analytics.trackAddToCart(product._id, product.name, qty);
      trackPixelAddToCart(product, qty);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) { toast.error('Product is out of stock'); return; }
    const hasOptions = (product.sizes?.length > 0) || (product.colors?.length > 0);
    if (hasOptions && (!selectedSize || !selectedColor)) { toast.error('Please select size and color'); return; }
    try {
      await addToCart(product._id, quantity, selectedSize || 'Free Size', selectedColor || 'Default');
      navigate('/checkout');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to proceed');
    }
  };

  const handleAddBundleToCart = async () => {
    setAddingBundle(true);
    try {
      await addToCart(product._id, 1, selectedSize || 'Free Size', selectedColor || 'Default');
      for (const p of similarProducts.slice(0, 2).filter(p => bundleSelected.includes(p._id))) {
        await addToCart(p._id, 1, '', p.colors?.[0]?.name || 'Default');
      }
      toast.success('Bundle added to cart!');
    } catch (e) {
      toast.error('Failed to add bundle');
    } finally {
      setAddingBundle(false);
    }
  };

  const handleWhatsAppShare = () => {
    const price = product.discountPrice || product.price;
    const text = `🪵 Check out this wooden toy!\n\n*${product.name}*\n💰 ₹${price.toLocaleString()}\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const discountPercent = product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.skin }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${C.skinMid} ${C.skinMid} ${C.skinMid} transparent` }} />
        <p className="font-sans text-sm" style={{ color: C.wood }}>Loading product…</p>
      </div>
    </div>
  );

  /* ── Not Found ── */
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.skin }}>
      <div className="text-center">
        <p className="text-5xl mb-4">🪵</p>
        <h2 className="font-serif text-2xl mb-2" style={{ color: C.dark }}>Product not found</h2>
        <Link to="/products" className="font-sans text-sm font-semibold" style={{ color: C.terra }}>← Back to Products</Link>
      </div>
    </div>
  );

  const stockMax = 50;
  const stockPct = Math.min((product.stock / stockMax) * 100, 100);
  const isLow = product.stock > 0 && product.stock <= 5;
  const isMed = product.stock > 5 && product.stock <= 15;

  return (
    <div className="min-h-screen pb-24 lg:pb-0" style={{ background: C.skin }}>
      <div className="container-custom py-6">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Link to="/" className="font-sans text-xs transition-colors" style={{ color: C.wood }}
            onMouseEnter={e => e.currentTarget.style.color = C.terra}
            onMouseLeave={e => e.currentTarget.style.color = C.wood}>Home</Link>
          <span style={{ color: C.skinBorder }}>/</span>
          <Link to="/products" className="font-sans text-xs transition-colors" style={{ color: C.wood }}
            onMouseEnter={e => e.currentTarget.style.color = C.terra}
            onMouseLeave={e => e.currentTarget.style.color = C.wood}>Products</Link>
          <span style={{ color: C.skinBorder }}>/</span>
          {product.category?.name && (
            <>
              <Link to={`/products?category=${product.category._id}`} className="font-sans text-xs transition-colors" style={{ color: C.wood }}
                onMouseEnter={e => e.currentTarget.style.color = C.terra}
                onMouseLeave={e => e.currentTarget.style.color = C.wood}>{product.category.name}</Link>
              <span style={{ color: C.skinBorder }}>/</span>
            </>
          )}
          <span className="font-sans text-xs" style={{ color: C.dark }}>{product.name}</span>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* ════ LEFT — Images ════ */}
          <div className="flex gap-3">
            {/* Vertical thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex flex-col items-center gap-1.5 w-[72px] flex-shrink-0">
                {product.images.length > 5 && (
                  <button onClick={() => thumbStripRef.current?.scrollBy({ top: -88, behavior: 'smooth' })}
                    className="w-full flex items-center justify-center py-1.5 rounded-lg transition-colors"
                    style={{ color: C.wood }}
                    onMouseEnter={e => e.currentTarget.style.color = C.terra}
                    onMouseLeave={e => e.currentTarget.style.color = C.wood}>
                    <FaChevronUp className="text-xs" />
                  </button>
                )}
                <div ref={thumbStripRef} className="flex flex-col gap-2 overflow-y-auto scrollbar-hide"
                  style={{ maxHeight: product.images.length > 5 ? '420px' : 'none' }}>
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className="flex-shrink-0 aspect-square rounded-xl overflow-hidden transition-all duration-200 hover:scale-105"
                      style={{
                        width: 68,
                        border: selectedImage === i ? `2.5px solid ${C.dark}` : `2px solid ${C.skinMid}`,
                        boxShadow: selectedImage === i ? `0 0 0 3px ${C.gold}55` : 'none',
                      }}>
                      <img src={getProductImage(product, i)} alt={`${product.name} ${i + 1}`}
                        onError={e => handleImageError(e, 'product')}
                        className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {product.images.length > 5 && (
                  <button onClick={() => thumbStripRef.current?.scrollBy({ top: 88, behavior: 'smooth' })}
                    className="w-full flex items-center justify-center py-1.5 rounded-lg transition-colors"
                    style={{ color: C.wood }}
                    onMouseEnter={e => e.currentTarget.style.color = C.terra}
                    onMouseLeave={e => e.currentTarget.style.color = C.wood}>
                    <FaChevronDown className="text-xs" />
                  </button>
                )}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative rounded-2xl overflow-hidden cursor-zoom-in group"
              style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}`, aspectRatio: '1/1' }}
              onClick={() => setShowLightbox(true)}>
              <img src={getProductImage(product, selectedImage)} alt={product.name}
                onError={e => handleImageError(e, 'product')}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />

              {/* Discount badge */}
              {discountPercent > 0 && (
                <div className="absolute top-0 left-0 z-10">
                  <div className="font-sans font-extrabold text-white flex flex-col items-center px-3 py-2.5"
                    style={{ background: C.terra, borderBottomRightRadius: 16, minWidth: 52, boxShadow: '2px 2px 12px rgba(201,106,74,0.4)' }}>
                    <span style={{ fontSize: 15 }}>{discountPercent}%</span>
                    <span style={{ fontSize: 9, letterSpacing: '0.06em', opacity: 0.9 }}>OFF</span>
                  </div>
                </div>
              )}

              {/* Out of stock overlay */}
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10"
                  style={{ background: 'rgba(47,30,20,0.5)' }}>
                  <span className="font-sans font-semibold px-5 py-2.5 rounded-xl text-sm"
                    style={{ background: C.skinLight, color: C.dark }}>Out of Stock</span>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ background: 'rgba(47,30,20,0.12)' }}>
                <span className="font-sans text-xs font-semibold px-4 py-2 rounded-full"
                  style={{ background: 'rgba(253,250,246,0.92)', color: C.dark }}>
                  Click to zoom
                </span>
              </div>
            </div>
          </div>

          {/* ════ RIGHT — Details ════ */}
          <div className="flex flex-col gap-4">

            {/* Brand pill */}
            <div>
              <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: C.goldMid, color: C.wood }}>
                🪵 Thrayam Wooden Toys
              </span>
            </div>

            {/* Name */}
            <h1 className="font-serif leading-tight" style={{ color: C.dark, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              {product.name}
            </h1>

            {/* Rating + social proof */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-sm"
                      style={{ color: i < Math.floor(socialProof.rating) ? C.gold : C.skinMid }} />
                  ))}
                </div>
                <span className="font-sans font-bold text-sm" style={{ color: C.gold }}>{socialProof.rating.toFixed(1)}</span>
                <span className="font-sans text-xs" style={{ color: C.wood }}>({socialProof.reviews} reviews)</span>
              </div>
              <span style={{ color: C.skinBorder }}>·</span>
              <span className="font-sans text-xs font-semibold" style={{ color: C.sageDark }}>
                😊 500+ happy families
              </span>
            </div>

            {/* Live viewers */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.sage }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.sageDark }} />
              </span>
              <p className="font-sans text-xs" style={{ color: C.wood }}>
                <span className="font-bold" style={{ color: C.dark }}>{socialProof.viewing} people</span> viewing this right now
              </p>
            </div>

            {/* ── Price block ── */}
            <div className="rounded-2xl p-4" style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}` }}>
              {product.discountPrice ? (
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-sm line-through" style={{ color: `${C.wood}90` }}>
                    MRP ₹{product.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-serif font-bold" style={{ color: C.terra, fontSize: '2rem' }}>
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    <span className="font-sans font-semibold text-xs px-2.5 py-1 rounded-full"
                      style={{ background: C.terraMid, color: C.terra }}>
                      Save ₹{(product.price - product.discountPrice).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-sans text-[11px]" style={{ color: C.sageDark }}>Inclusive of all taxes</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="font-serif font-bold" style={{ color: C.dark, fontSize: '2rem' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                  <p className="font-sans text-[11px]" style={{ color: C.wood }}>Inclusive of all taxes</p>
                </div>
              )}
            </div>

            {/* Sold badge */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: C.goldMid, border: `1px solid ${C.gold}60` }}>
              <span className="text-lg">🔥</span>
              <p className="font-sans text-xs font-semibold" style={{ color: C.wood }}>
                <span className="font-bold" style={{ color: C.terra }}>{socialProof.sold} pieces</span> sold in the last{' '}
                <span className="font-bold" style={{ color: C.terra }}>{socialProof.hours} hours</span> — grab yours!
              </p>
            </div>

            {/* Stock bar */}
            {product.stock > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-sans text-xs font-semibold" style={{ color: C.wood }}>Availability</span>
                  <span className="font-sans text-xs font-bold"
                    style={{ color: isLow ? C.terra : isMed ? '#D97706' : C.sageDark }}>
                    {isLow ? `⚠️ Only ${product.stock} left!` : isMed ? `⏳ ${product.stock} left` : `✅ ${product.stock} in stock`}
                  </span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: C.skinMid }}>
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(stockPct, 8)}%`,
                      background: isLow ? C.terra : isMed ? '#F59E0B' : C.sageDark,
                    }} />
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.dark }}>Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, i) => (
                    <button key={i} onClick={() => setSelectedSize(size)}
                      className="relative px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all duration-200"
                      style={{
                        border: selectedSize === size ? `2px solid ${C.dark}` : `2px solid ${C.skinMid}`,
                        background: selectedSize === size ? C.dark : '#fff',
                        color: selectedSize === size ? C.skin : C.dark,
                      }}>
                      {size}
                      {selectedSize === size && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: C.gold }}>
                          <FaCheck className="text-[8px]" style={{ color: C.dark }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection */}
            {product.colors?.length > 0 && (
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.dark }}>Select Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, i) => (
                    <button key={i} onClick={() => setSelectedColor(color.name)}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all duration-200"
                      style={{
                        border: selectedColor === color.name ? `2px solid ${C.dark}` : `2px solid ${C.skinMid}`,
                        background: selectedColor === color.name ? C.skinMid : '#fff',
                        color: C.dark,
                      }}>
                      <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: color.hexCode, borderColor: C.skinBorder }} />
                      {color.name}
                      {selectedColor === color.name && <FaCheck className="text-[10px]" style={{ color: C.sageDark }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.dark }}>Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `2px solid ${C.skinMid}` }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                    className="px-4 py-2.5 transition-colors disabled:opacity-40"
                    style={{ color: C.dark }}
                    onMouseEnter={e => e.currentTarget.style.background = C.skinMid}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="px-5 py-2.5 font-sans font-bold text-base" style={{ borderLeft: `1px solid ${C.skinMid}`, borderRight: `1px solid ${C.skinMid}`, color: C.dark }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}
                    className="px-4 py-2.5 transition-colors disabled:opacity-40"
                    style={{ color: C.dark }}
                    onMouseEnter={e => e.currentTarget.style.background = C.skinMid}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FaPlus className="text-xs" />
                  </button>
                </div>
                {product.stock === 0 && (
                  <span className="font-sans text-sm font-semibold" style={{ color: C.terra }}>Out of stock</span>
                )}
              </div>
            </div>

            {/* Action buttons — desktop */}
            <div className="hidden lg:flex gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: C.dark, color: C.skin, boxShadow: `0 4px 18px rgba(47,30,20,0.25)` }}
                onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.background = C.wood; }}
                onMouseLeave={e => e.currentTarget.style.background = C.dark}>
                <FaShoppingCart className="text-sm" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: C.terra, color: '#fff', boxShadow: `0 4px 18px rgba(201,106,74,0.35)` }}
                onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <FaBolt className="text-sm" />
                Buy Now
              </button>
              <button onClick={() => setWishlisted(w => !w)}
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
                style={{
                  background: wishlisted ? C.terra : '#fff',
                  color: wishlisted ? '#fff' : C.terra,
                  border: `2px solid ${wishlisted ? C.terra : C.skinMid}`,
                }}>
                <FaHeart />
              </button>
            </div>

            {/* WhatsApp share */}
            <button onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-sans font-semibold text-sm transition-all duration-200"
              style={{ background: '#25D36620', color: '#15803D', border: '1.5px solid #25D36640' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#25D36620'; e.currentTarget.style.color = '#15803D'; }}>
              <FaWhatsapp className="text-base" /> Share on WhatsApp
            </button>

            {/* Trust strip */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl flex-wrap gap-2"
              style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}` }}>
              {[
                { icon: '🚚', text: 'Free shipping', sub: 'above ₹499' },
                { icon: '🔒', text: 'Secure', sub: 'checkout' },
                { icon: '↩️', text: '7-day', sub: 'returns' },
                { icon: '🌿', text: 'Non-toxic', sub: 'certified' },
              ].map(({ icon, text, sub }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="font-sans font-semibold text-[11px] leading-none" style={{ color: C.dark }}>{text}</p>
                    <p className="font-sans text-[10px]" style={{ color: C.wood }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Product meta */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.skinMid}` }}>
              {[
                product.category?.name && { label: 'Category',   value: product.category.name },
                product.ageGroup       && { label: 'Age Group',   value: product.ageGroup },
                product.material       && { label: 'Material',    value: product.material },
                product.fabric         && { label: 'Fabric',      value: product.fabric },
                                          { label: 'SKU',         value: product._id?.slice(-8).toUpperCase() },
              ].filter(Boolean).map(({ label, value }, i, arr) => (
                <div key={label} className="flex items-center px-4 py-2.5"
                  style={{
                    borderBottom: i < arr.length - 1 ? `1px solid ${C.skinMid}` : 'none',
                    background: i % 2 === 0 ? '#fff' : C.skinLight,
                  }}>
                  <span className="font-sans text-xs font-semibold w-28 flex-shrink-0" style={{ color: C.wood }}>{label}</span>
                  <span className="font-sans text-xs" style={{ color: C.dark }}>{value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Description ── */}
        {product.description && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#fff', border: `1.5px solid ${C.skinMid}` }}>
            <h2 className="font-serif mb-4" style={{ color: C.dark, fontSize: '1.3rem' }}>Product Description</h2>
            <div className="font-sans text-sm leading-relaxed product-description"
              style={{ color: C.wood }}
              dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {/* ── Specifications ── */}
        {product.specifications && Object.keys(product.specifications).some(k => product.specifications[k]) && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#fff', border: `1.5px solid ${C.skinMid}` }}>
            <h2 className="font-serif mb-4" style={{ color: C.dark, fontSize: '1.3rem' }}>Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-xl overflow-hidden" style={{ border: `1px solid ${C.skinMid}` }}>
              {[
                product.specifications.length   && { label: 'Length',      value: product.specifications.length },
                product.specifications.width    && { label: 'Width',       value: product.specifications.width },
                product.specifications.washCare && { label: 'Wash Care',   value: product.specifications.washCare },
                product.specifications.blousePiece !== undefined && { label: 'Blouse Piece', value: product.specifications.blousePiece ? 'Included' : 'Not Included' },
              ].filter(Boolean).map(({ label, value }, i) => (
                <div key={label} className="flex justify-between px-4 py-3"
                  style={{ borderBottom: `1px solid ${C.skinMid}`, background: i % 2 === 0 ? '#fff' : C.skinLight }}>
                  <span className="font-sans text-xs font-semibold" style={{ color: C.wood }}>{label}</span>
                  <span className="font-sans text-xs" style={{ color: C.dark }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bundle / Frequently Bought Together ── */}
        {similarProducts.length >= 2 && product && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#fff', border: `1.5px solid ${C.skinMid}` }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-sans text-[11px] font-semibold tracking-widest uppercase" style={{ color: C.sageDark }}>
                  Save More
                </span>
                <h2 className="font-serif mt-0.5" style={{ color: C.dark, fontSize: '1.3rem' }}>Frequently Bought Together</h2>
              </div>
              <span className="font-sans text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: C.sageMid, color: C.sageDark }}>
                Bundle & Save 5%
              </span>
            </div>

            {/* Products row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Main product — always included */}
              {[product, ...similarProducts.slice(0, 2)].map((p, idx) => {
                const isMain = idx === 0;
                const isSelected = isMain || bundleSelected.includes(p._id);
                const price = p.discountPrice || p.price;
                return (
                  <React.Fragment key={p._id}>
                    {idx > 0 && (
                      <span className="font-bold text-lg" style={{ color: C.skinBorder }}>+</span>
                    )}
                    <div
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 cursor-pointer"
                      style={{
                        border: `2px solid ${isSelected ? C.terra : C.skinMid}`,
                        background: isSelected ? C.terraMid + '40' : C.skinLight,
                        width: 110, opacity: isMain ? 1 : isSelected ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (isMain) return;
                        setBundleSelected(prev =>
                          prev.includes(p._id) ? prev.filter(id => id !== p._id) : [...prev, p._id]
                        );
                      }}
                    >
                      <div className="relative w-full">
                        <img
                          src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}/uploads/${p.images[0]}`) : ''}
                          alt={p.name}
                          className="w-full aspect-square object-cover rounded-xl"
                          style={{ background: C.skinMid }}
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                        {!isMain && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: isSelected ? C.terra : C.skinMid, border: `1.5px solid ${isSelected ? C.terra : C.skinBorder}` }}>
                            {isSelected && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        )}
                        {isMain && (
                          <span className="absolute top-1.5 left-1.5 font-sans text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: C.dark, color: C.skin }}>This</span>
                        )}
                      </div>
                      <p className="font-sans text-[10px] font-semibold text-center leading-tight line-clamp-2"
                        style={{ color: C.dark }}>{p.name}</p>
                      <p className="font-sans text-xs font-bold" style={{ color: C.terra }}>₹{price?.toLocaleString()}</p>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Total + CTA */}
              <div className="flex flex-col gap-2 ml-auto pl-4" style={{ borderLeft: `2px solid ${C.skinMid}` }}>
                {(() => {
                  const items = [product, ...similarProducts.slice(0, 2).filter(p => bundleSelected.includes(p._id))];
                  const total = items.reduce((s, p) => s + (p.discountPrice || p.price || 0), 0);
                  const saving = Math.round(total * 0.05);
                  return (
                    <>
                      <div>
                        <p className="font-sans text-xs" style={{ color: C.wood }}>Total price</p>
                        <p className="font-serif text-2xl font-bold" style={{ color: C.dark }}>₹{total.toLocaleString()}</p>
                        <p className="font-sans text-xs font-semibold" style={{ color: C.sageDark }}>You save ₹{saving.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleAddBundleToCart}
                        disabled={addingBundle}
                        className="px-5 py-2.5 rounded-xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-60"
                        style={{ background: C.dark, color: C.skin, boxShadow: '0 4px 14px rgba(47,30,20,0.20)' }}>
                        {addingBundle ? 'Adding…' : 'Add Bundle to Cart'}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── Similar Products ── */}
        {similarProducts.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: '#fff', border: `1.5px solid ${C.skinMid}` }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-sans text-[11px] font-semibold tracking-widest uppercase" style={{ color: C.terra }}>
                  You May Also Like
                </span>
                <h2 className="font-serif mt-0.5" style={{ color: C.dark, fontSize: '1.3rem' }}>Similar Products</h2>
              </div>
              <Link to="/products" className="font-sans text-sm font-semibold transition-colors" style={{ color: C.terra }}
                onMouseEnter={e => e.currentTarget.style.color = C.wood}
                onMouseLeave={e => e.currentTarget.style.color = C.terra}>
                View All →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
              {similarProducts.map(p => (
                <div key={p._id} className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[220px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Mobile sticky bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-4 py-3"
        style={{ background: C.skinLight, borderTop: `1.5px solid ${C.skinMid}`, boxShadow: '0 -4px 20px rgba(47,30,20,0.10)' }}>
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-50"
            style={{ background: C.dark, color: C.skin }}>
            <FaShoppingCart className="text-sm" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button onClick={handleBuyNow} disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-50"
            style={{ background: C.terra, color: '#fff' }}>
            <FaBolt className="text-sm" /> Buy Now
          </button>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(47,30,20,0.96)' }}
          onClick={() => setShowLightbox(false)}>
          <button onClick={() => setShowLightbox(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl z-10"
            style={{ background: 'rgba(247,239,229,0.15)', color: C.skin }}>×</button>

          {product.images?.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setSelectedImage(p => p === 0 ? product.images.length - 1 : p - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center z-10 transition-colors"
                style={{ background: 'rgba(247,239,229,0.15)', color: C.skin }}
                onMouseEnter={e => e.currentTarget.style.background = C.terra}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(247,239,229,0.15)'}>
                ←
              </button>
              <button onClick={e => { e.stopPropagation(); setSelectedImage(p => p === product.images.length - 1 ? 0 : p + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center z-10 transition-colors"
                style={{ background: 'rgba(247,239,229,0.15)', color: C.skin }}
                onMouseEnter={e => e.currentTarget.style.background = C.terra}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(247,239,229,0.15)'}>
                →
              </button>
            </>
          )}

          <div className="relative" style={{ maxHeight: '85vh', maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <img src={getProductImage(product, selectedImage)} alt={product.name}
              onError={e => handleImageError(e, 'product')}
              className="object-contain rounded-xl"
              style={{ maxHeight: '85vh', maxWidth: '90vw' }} />
          </div>

          {product.images?.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <div className="font-sans text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(247,239,229,0.15)', color: C.skin }}>
                {selectedImage + 1} / {product.images.length}
              </div>
              <div className="flex gap-2 p-2 rounded-xl max-w-[90vw] overflow-x-auto" style={{ background: 'rgba(47,30,20,0.6)' }}>
                {product.images.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setSelectedImage(i); }}
                    className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all"
                    style={{ border: selectedImage === i ? `2px solid ${C.gold}` : '2px solid rgba(255,255,255,0.2)' }}>
                    <img src={getProductImage(product, i)} alt={`Thumbnail ${i + 1}`}
                      onError={e => handleImageError(e, 'product')}
                      className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <WhatsAppChat />
      <ProductReelFloat />
    </div>
  );
};

export default ProductDetail;
