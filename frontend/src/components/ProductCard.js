import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { getProductImage, handleImageError } from '../utils/imageHelper';
import { generateProductAltText } from '../utils/seo';

const C = {
  skin:    '#F7EFE5',
  skinMid: '#EDD8C0',
  skinLight: '#FDFAF6',
  wood:    '#6B4226',
  dark:    '#2F1E14',
  sage:    '#8FAF9D',
  sageMid: '#D6E8DE',
  gold:    '#DDBB72',
  goldMid: '#F4EAC8',
  terra:   '#C96A4A',
  terraMid:'#F5D8CC',
};

// Age badge colors using palette
const AGE_STYLE = {
  '0-6 months':  { bg: '#D6E8DE', color: '#274336' },
  '6-12 months': { bg: '#F4EAC8', color: '#4A2D18' },
  '1-2 years':   { bg: '#F5D8CC', color: '#4A2D18' },
  '2-3 years':   { bg: '#EDD8C0', color: '#2F1E14' },
  '3-5 years':   { bg: '#D6E8DE', color: '#274336' },
  '5-8 years':   { bg: '#F4EAC8', color: '#4A2D18' },
  '8-12 years':  { bg: '#F5D8CC', color: '#4A2D18' },
  '12+ years':   { bg: '#EDD8C0', color: '#2F1E14' },
  'All Ages':    { bg: '#EDD8C0', color: '#6B4226' },
};

const AGE_EMOJI = {
  '0-6 months': '👶', '6-12 months': '🍼', '1-2 years': '🧸',
  '2-3 years': '🎨', '3-5 years': '🚂', '5-8 years': '🔧',
  '8-12 years': '🔬', '12+ years': '🎯', 'All Ages': '🌟',
};

const ProductCard = ({ product }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCart();

  const hasMulti = product.images?.length > 1;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product._id, 1, '', product.colors?.[0]?.name || 'Default');
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const ageGroup = product.ageGroup || 'All Ages';
  const ageStyle = AGE_STYLE[ageGroup] || AGE_STYLE['All Ages'];
  const ageEmoji = AGE_EMOJI[ageGroup] || '🌟';

  return (
    <div
      className="group relative flex flex-col transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: C.skinLight,
        borderRadius: '1.25rem',
        border: `1px solid ${C.skinMid}`,
        boxShadow: '0 2px 12px rgba(47,30,20,0.07)',
        overflow: 'hidden',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(47,30,20,0.14)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(47,30,20,0.07)'}>

      {/* ── Image Area ── */}
      <div className="relative overflow-hidden"
        style={{ aspectRatio: '1/1', background: C.skin }}
        onMouseEnter={() => hasMulti && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}>

        <Link to={`/products/${product._id}`} className="block w-full h-full">
          <img
            src={getProductImage(product, imgIdx)}
            alt={generateProductAltText(product, imgIdx)}
            onError={e => handleImageError(e, 'product')}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Discount badge — top left */}
        {discount > 0 && (
          <div className="absolute top-0 left-0 z-10">
            <div className="font-sans font-extrabold text-[12px] leading-none px-2.5 py-2 flex flex-col items-center"
              style={{
                background: C.terra,
                color: '#fff',
                borderBottomRightRadius: '14px',
                minWidth: 44,
                boxShadow: '2px 2px 10px rgba(201,106,74,0.35)',
              }}>
              <span style={{ fontSize: 13 }}>{discount}%</span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', opacity: 0.9 }}>OFF</span>
            </div>
          </div>
        )}

        {/* Low stock — only show if no discount badge occupying that corner */}
        {product.stock < 10 && product.stock > 0 && discount === 0 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-1 rounded-lg font-sans font-bold text-[9px]"
              style={{ background: C.gold, color: C.dark, boxShadow: '0 2px 6px rgba(221,187,114,0.4)' }}>
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: 'rgba(47,30,20,0.45)' }}>
            <span className="px-3 py-1.5 rounded-xl font-sans font-semibold text-sm"
              style={{ background: C.skinLight, color: C.dark }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist icon */}
        <button
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ background: wishlisted ? C.terra : C.skinLight, color: wishlisted ? '#fff' : C.wood, boxShadow: '0 2px 8px rgba(47,30,20,0.15)' }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); setWishlisted(w => !w); }}
          title="Wishlist">
          <FaHeart className="text-xs" />
        </button>

        {/* Add to cart — bottom slide-up on hover */}
        {product.stock > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-3 z-10 transition-all duration-300 translate-y-full group-hover:translate-y-0"
            style={{ background: 'linear-gradient(to top, rgba(47,30,20,0.65), transparent)' }}>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-2 font-sans font-semibold text-xs px-5 py-2 rounded-xl transition-all duration-150 disabled:opacity-70"
              style={{ background: C.terra, color: '#fff', boxShadow: '0 4px 16px rgba(201,106,74,0.45)' }}>
              <FaShoppingCart className="text-[10px]" />
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* ── Info Area ── */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Age + Material badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans font-medium text-[10px]"
            style={{ background: ageStyle.bg, color: ageStyle.color }}>
            {ageEmoji} {ageGroup}
          </span>
          {product.material && product.material !== 'Other' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sans font-medium text-[10px]"
              style={{ background: C.skinMid, color: C.wood }}>
              {product.material}
            </span>
          )}
        </div>

        {/* Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-sans font-semibold text-base leading-snug line-clamp-2 transition-colors"
            style={{ color: C.dark }}
            onMouseEnter={e => e.currentTarget.style.color = C.terra}
            onMouseLeave={e => e.currentTarget.style.color = C.dark}>
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex" style={{ color: C.gold }}>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[10px]"
                  style={{ color: i < Math.floor(product.averageRating) ? C.gold : C.skinMid }} />
              ))}
            </div>
            <span className="font-sans text-[10px]" style={{ color: C.wood }}>({product.numReviews})</span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-1.5">
          {product.discountPrice ? (
            <div className="flex flex-col gap-0.5">
              {/* Original price — struck out */}
              <span className="font-sans text-xs line-through leading-none" style={{ color: `${C.wood}90` }}>
                MRP ₹{product.price.toLocaleString()}
              </span>
              {/* Sale price + save badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans font-extrabold text-[22px] leading-none" style={{ color: C.terra }}>
                  ₹{product.discountPrice.toLocaleString()}
                </span>
                <span className="font-sans font-semibold text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: C.terraMid, color: C.terra }}>
                  Save ₹{(product.price - product.discountPrice).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <span className="font-sans font-bold text-[22px] leading-none" style={{ color: C.dark }}>
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
