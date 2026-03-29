import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTruck, FaUndo, FaShieldAlt, FaLeaf,
  FaStar, FaChevronLeft, FaChevronRight, FaArrowRight, FaEnvelope,
} from 'react-icons/fa';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import ProductReels from '../components/ProductReels';
import API from '../utils/api';
import { setStructuredData, generateCollectionSchema, generateFAQSchema, DEFAULT_FAQ, setSEO, PAGE_SEO } from '../utils/seo';
import { getCategoryImage, handleImageError } from '../utils/imageHelper';

/* ── Palette ──────────────────────────────────────────────────── */
const C = {
  skin:     '#F7EFE5',
  skinLight:'#FDFAF6',
  skinMid:  '#EDD8C0',
  skinBorder:'#DFC09A',
  wood:    '#6B4226',
  dark:    '#2F1E14',
  sage:    '#8FAF9D',
  sageMid: '#D6E8DE',
  sageDark:'#4F7A65',
  gold:    '#DDBB72',
  goldMid: '#F4EAC8',
  terra:   '#C96A4A',
  terraMid:'#F5D8CC',
};

/* ── Data ─────────────────────────────────────────────────────── */
const AGE_GROUPS = [
  { label: '0–3 Months',   param: '0-3 months',   emoji: '🍼', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359762.png',  bg: '#FFF5F8' },
  { label: '3–6 Months',   param: '3-6 months',   emoji: '👶', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359784.png',  bg: '#FFF5F8' },
  { label: '6–9 Months',   param: '6-9 months',   emoji: '🙌', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359796.png',  bg: '#FFF5F8' },
  { label: '9–12 Months',  param: '9-12 months',  emoji: '🐾', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359800.png',  bg: '#FFF5F8' },
  { label: '12–15 Months', param: '12-15 months', emoji: '🛴', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359812.png',  bg: '#FFF5F8' },
  { label: '15–18 Months', param: '15-18 months', emoji: '🚶', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359820.png',  bg: '#FFF5F8' },
  { label: '18–21 Months', param: '18-21 months', emoji: '🧗', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359830.png',  bg: '#FFF5F8' },
  { label: '21–24 Months', param: '21-24 months', emoji: '🎨', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359836.png',  bg: '#FFF5F8' },
  { label: '24–30 Months+',param: '24-30 months', emoji: '⚽', img: 'https://cdn-icons-png.flaticon.com/512/4359/4359846.png',  bg: '#FFF5F8' },
];


const SKILLS = [
  { emoji: '🖐️', label: 'Motor Skills',      desc: 'Fine & gross motor development through hands-on play' },
  { emoji: '🧠', label: 'Cognitive Dev.',    desc: 'Problem solving, memory, and logical thinking' },
  { emoji: '🎨', label: 'Creative Play',     desc: 'Open-ended imagination and artistic expression' },
  { emoji: '👫', label: 'Social Skills',     desc: 'Turn-taking, sharing, and communication' },
  { emoji: '🔬', label: 'STEM Learning',     desc: 'Science, technology, engineering and maths' },
  { emoji: '💬', label: 'Language Dev.',     desc: 'Vocabulary building and storytelling skills' },
];

const WHY_US = [
  { icon: <FaLeaf />,      title: 'Safe & Non-Toxic',  desc: 'Every toy is child-safe and quality certified',  color: C.sage,  bg: C.sageMid },
  { icon: <FaTruck />,     title: 'Free Shipping',     desc: 'Complimentary delivery on orders above ₹499',    color: C.gold,  bg: C.goldMid },
  { icon: <FaUndo />,      title: 'Easy Returns',      desc: '7-day no-questions hassle-free return policy',   color: C.terra, bg: C.terraMid },
  { icon: <FaShieldAlt />, title: 'Secure Payment',    desc: '100% encrypted and safe checkout guaranteed',    color: C.wood,  bg: C.skinMid },
];

/* ── Age Card ─────────────────────────────────────────────────── */
const AGE_CARD_COLORS = [
  { bg: '#FDE8D8', accent: '#C96A4A', text: '#7A2E10' },
  { bg: '#D6E8DE', accent: '#4F7A65', text: '#1E4D3A' },
  { bg: '#F4EAC8', accent: '#B07F2A', text: '#4A3000' },
  { bg: '#EDD8C0', accent: '#9C7248', text: '#3E2206' },
  { bg: '#E0E8F8', accent: '#4A6FA8', text: '#1A3560' },
  { bg: '#F0D6E8', accent: '#9C4A7A', text: '#5C1A48' },
  { bg: '#D6E8DE', accent: '#4F7A65', text: '#1E4D3A' },
  { bg: '#FDE8D8', accent: '#C96A4A', text: '#7A2E10' },
  { bg: '#F4EAC8', accent: '#B07F2A', text: '#4A3000' },
];

const AgeCard = ({ age, index }) => {
  const { bg, accent, text } = AGE_CARD_COLORS[index % AGE_CARD_COLORS.length];
  return (
    <Link
      to={`/products?ageGroup=${encodeURIComponent(age.param)}`}
      className="group flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-300 hover:-translate-y-1.5"
      style={{ width: 100 }}
    >
      <div
        className="transition-transform duration-300 group-hover:scale-110"
        style={{
          width: 76, height: 76,
          borderRadius: '50%',
          background: bg,
          border: `2px solid ${accent}35`,
          boxShadow: `0 4px 16px ${accent}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
        }}
      >
        {age.emoji}
      </div>
      <span className="font-sans font-semibold text-[11px] text-center leading-tight"
        style={{ color: C.dark, maxWidth: 96 }}>
        {age.label}
      </span>
    </Link>
  );
};

/* ── Round Category Circle (for the slider) ───────────────────── */
const CAT_GRADIENTS = [
  ['#D6E8DE', '#8FAF9D'],
  ['#F4EAC8', '#DDBB72'],
  ['#F5D8CC', '#C96A4A'],
  ['#EDD8C0', '#9C7248'],
  ['#D6E8DE', '#4F7A65'],
  ['#F4EAC8', '#B07F2A'],
];
const NO_IMG = 'default-category.jpg';

const RoundCategoryCircle = ({ cat, index, selected }) => {
  const [bg1, bg2] = CAT_GRADIENTS[index % CAT_GRADIENTS.length];
  const hasImg = cat.image && cat.image !== NO_IMG;

  return (
    <div
      className="transition-all duration-250 group-hover:scale-105"
      style={{
        width: 96, height: 96,
        borderRadius: '50%',
        overflow: 'hidden',
        border: selected
          ? `3px solid ${C.dark}`
          : `2px solid ${bg2}60`,
        boxShadow: selected
          ? `0 6px 20px rgba(47,30,20,0.28)`
          : '0 2px 10px rgba(47,30,20,0.08)',
        flexShrink: 0,
        background: hasImg ? C.skinMid : `linear-gradient(140deg, ${bg1}, ${bg2}88)`,
      }}
    >
      {hasImg ? (
        <img
          src={getCategoryImage(cat)}
          alt={cat.name}
          className="w-full h-full object-cover"
          onError={e => handleImageError(e, 'category')}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(140deg, ${bg1}, ${bg2}88)` }}>
          <span className="font-serif select-none"
            style={{ fontSize: '1.6rem', color: bg2, opacity: 0.85, lineHeight: 1 }}>
            {cat.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

/* ── Reusable: Section Header ─────────────────────────────────── */
const SectionHeader = ({ eyebrow, title, subtitle, center = true, light = false }) => (
  <div className={`mb-10 ${center ? 'text-center' : ''}`}>
    {eyebrow && (
      <div className={`inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-xs font-sans font-semibold tracking-widest uppercase`}
        style={{ background: light ? 'rgba(255,255,255,0.12)' : C.sageMid, color: light ? C.sage : C.sageDark, border: `1px solid ${light ? 'rgba(143,175,157,0.3)' : C.sage + '50'}` }}>
        {eyebrow}
      </div>
    )}
    <h2 className="font-serif mb-2" style={{ color: light ? C.skin : C.dark, fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
      {title}
    </h2>
    {subtitle && (
      <p className="font-sans text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: light ? C.skinMid : C.wood }}>
        {subtitle}
      </p>
    )}
  </div>
);

/* ── Reusable: Skeleton ───────────────────────────────────────── */
const SkeletonCard = ({ wide = false }) => (
  <div className="animate-pulse flex-shrink-0" style={{ width: wide ? '220px' : '180px' }}>
    <div className="aspect-square rounded-2xl mb-3" style={{ background: C.skinMid }} />
    <div className="h-3 rounded-full w-3/4 mb-2" style={{ background: C.skinMid }} />
    <div className="h-3 rounded-full w-1/2" style={{ background: C.skinMid }} />
  </div>
);

/* ── Main Component ───────────────────────────────────────────── */
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [reels, setReels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryHasMore, setCategoryHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [reelsEnabled, setReelsEnabled] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle | loading | success | error
  const featuredScrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const prevCategoryRef = useRef(selectedCategory);

  useEffect(() => {
    fetchData();
    fetchSettings();
    setSEO(PAGE_SEO.home);
    setStructuredData(generateFAQSchema(DEFAULT_FAQ), 'homepage-faq-data');
  }, []); // eslint-disable-line

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings/public');
      const v = data.settings?.reels_enabled;
      setReelsEnabled(v === undefined ? true : v);
    } catch { setReelsEnabled(true); }
  };

  const fetchData = async () => {
    try {
      const [catRes, prodRes, reelsRes] = await Promise.all([
        API.get('/categories'),
        API.get('/products?featured=true&limit=12'),
        API.get('/reels/active'),
      ]);
      setCategories(catRes.data.categories || []);
      setFeaturedProducts(prodRes.data.products || []);
      setReels(reelsRes.data.reels || []);
      if (prodRes.data.products?.length > 0) {
        setStructuredData(
          generateCollectionSchema(
            { name: 'Featured Toys Collection', description: 'Handpicked premium wooden toys' },
            prodRes.data.products
          ),
          'homepage-collection-data'
        );
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCategoryProducts = async (page = 1, append = false) => {
    if (page === 1) setCategoryLoading(true);
    else setLoadingMore(true);
    try {
      const url = selectedCategory === 'all'
        ? `/products?limit=12&page=${page}`
        : `/products?category=${selectedCategory}&limit=12&page=${page}`;
      const { data } = await API.get(url);
      const items = data.products || [];
      setCategoryProducts(prev => append ? [...prev, ...items] : items);
      setCategoryHasMore(page < (data.pages || 1));
    } catch (e) { console.error(e); }
    finally { setCategoryLoading(false); setLoadingMore(false); }
  };

  useEffect(() => {
    const isNew = prevCategoryRef.current !== selectedCategory;
    prevCategoryRef.current = selectedCategory;
    if (isNew) {
      setCategoryProducts([]); setCategoryHasMore(true); setCategoryPage(1);
      fetchCategoryProducts(1, false);
    } else {
      fetchCategoryProducts(categoryPage, categoryPage > 1);
    }
  }, [selectedCategory, categoryPage]); // eslint-disable-line

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && categoryHasMore && !loadingMore && !categoryLoading)
        setCategoryPage(p => p + 1);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [categoryHasMore, loadingMore, categoryLoading]);

  const checkScroll = () => {
    const el = featuredScrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = featuredScrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    return () => el.removeEventListener('scroll', checkScroll);
  }, [featuredProducts]);

  const scrollFeatured = (dir) => {
    featuredScrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    try {
      await API.post('/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch {
      // Still show success — no hard failure UX for newsletter
      setNewsletterStatus('success');
      setNewsletterEmail('');
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{ background: C.skin }} className="min-h-screen">

      {/* ════════════════════════════════════════════════════════
          1. HERO — custom-shaped, organic
      ════════════════════════════════════════════════════════ */}
      <HeroSlider />

      {/* ════════════════════════════════════════════════════════
          2. PROMO STRIP
      ════════════════════════════════════════════════════════ */}
      <div style={{ background: C.wood }} className="py-2.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[0, 1].map(d => (
            <div key={d} className="flex items-center gap-14 px-10 flex-shrink-0">
              {[
                '🚚  Free Shipping on Orders Above ₹499',
                '🌿  100% Safe & Non-Toxic Materials',
                '🎁  Gift Wrapping Available',
                '⭐  Trusted by 1000+ Families',
                '🪵  Handcrafted Wooden Toys',
                '🔄  7-Day Easy Returns',
              ].map(item => (
                <span key={item} className="font-sans font-medium text-xs tracking-wide whitespace-nowrap"
                  style={{ color: C.goldMid }}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          3. SHOP BY CATEGORY (formerly 4)
      ════════════════════════════════════════════════════════ */}
      <section className="pt-4 pb-14 md:pt-6 md:pb-20" style={{ background: C.skinLight }}>
        <div className="container-custom">

          <div className="text-center mb-8">
            <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3"
              style={{ background: C.sageMid, color: C.sageDark }}>
              Browse Range
            </span>
            <h2 className="font-serif mb-2" style={{ color: C.dark, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              Shop by Category
            </h2>
            <p className="font-sans text-sm" style={{ color: C.wood }}>
              Find the perfect toy for every interest
            </p>
          </div>

          {/* ── Category chip selector ── */}
          {categories.length > 0 && (
            <div className="relative mb-12">
              {/* Edge fades */}
              <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
                style={{ background: `linear-gradient(to right, ${C.skinLight} 20%, transparent)` }} />
              <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
                style={{ background: `linear-gradient(to left, ${C.skinLight} 20%, transparent)` }} />

              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide px-6 py-3 md:px-2 md:flex-wrap md:justify-center">
                {/* All chip */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="flex-shrink-0 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    padding: '7px 18px',
                    borderRadius: 999,
                    background: selectedCategory === 'all' ? C.dark : '#fff',
                    border: selectedCategory === 'all'
                      ? `2px solid ${C.dark}`
                      : `1.5px solid ${C.skinBorder}`,
                    boxShadow: selectedCategory === 'all'
                      ? '0 4px 14px rgba(47,30,20,0.22)'
                      : '0 1px 6px rgba(47,30,20,0.07)',
                    height: 50,
                  }}
                >
                  <span className="font-sans font-semibold text-[13px] whitespace-nowrap"
                    style={{ color: selectedCategory === 'all' ? '#fff' : C.dark }}>
                    All Toys
                  </span>
                </button>

                {categories.map((cat, i) => {
                  const [bg1, bg2] = CAT_GRADIENTS[i % CAT_GRADIENTS.length];
                  const hasImg = cat.image && cat.image !== NO_IMG;
                  const isSel = selectedCategory === cat._id;
                  return (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className="flex-shrink-0 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        padding: '7px 16px 7px 8px',
                        borderRadius: 999,
                        height: 50,
                        background: isSel ? C.dark : '#fff',
                        border: isSel
                          ? `2px solid ${C.dark}`
                          : `1.5px solid ${C.skinBorder}`,
                        boxShadow: isSel
                          ? '0 4px 14px rgba(47,30,20,0.22)'
                          : '0 1px 6px rgba(47,30,20,0.07)',
                      }}
                    >
                      {/* Mini avatar */}
                      <span style={{
                        width: 34, height: 34, borderRadius: '50%',
                        overflow: 'hidden', flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: hasImg ? C.skinMid : `linear-gradient(135deg, ${bg1}, ${bg2}99)`,
                      }}>
                        {hasImg ? (
                          <img
                            src={getCategoryImage(cat)}
                            alt={cat.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => handleImageError(e, 'category')}
                          />
                        ) : (
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: bg2, fontFamily: 'serif' }}>
                            {cat.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="font-sans font-semibold text-[13px] whitespace-nowrap"
                        style={{ color: isSel ? '#fff' : C.dark }}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Products grid ── */}
          {categoryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl mb-3" style={{ background: C.skinMid }} />
                  <div className="h-3 rounded-full w-3/4 mb-2" style={{ background: C.skinMid }} />
                  <div className="h-3 rounded-full w-1/2" style={{ background: C.skinMid }} />
                </div>
              ))}
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🧸</span>
              <p className="font-serif text-xl mb-2" style={{ color: C.dark }}>No toys in this category</p>
              <button onClick={() => setSelectedCategory('all')} className="mt-3 btn btn-terra">
                Browse All Toys
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {categoryProducts.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <div ref={sentinelRef} className="h-4" />
              {loadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square rounded-2xl mb-3" style={{ background: C.skinMid }} />
                      <div className="h-3 rounded-full w-3/4 mb-2" style={{ background: C.skinMid }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. SHOP BY AGE
      ════════════════════════════════════════════════════════ */}
      <section className="pt-10 pb-12 overflow-hidden" style={{ background: C.skinLight }}>
        <div className="container-custom">

          <div className="text-center mb-8">
            <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3"
              style={{ background: C.terraMid, color: C.terra }}>
              Age-Appropriate
            </span>
            <h2 className="font-serif mb-2" style={{ color: C.dark, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              Shop by Age
            </h2>
            <p className="font-sans text-sm" style={{ color: C.wood }}>
              Toys matched to every stage of your child's growth
            </p>
          </div>

          {/* Single horizontal scroll row */}
          <div className="relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
              style={{ background: `linear-gradient(to right, ${C.skinLight} 20%, transparent)` }} />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
              style={{ background: `linear-gradient(to left, ${C.skinLight} 20%, transparent)` }} />
            <div
              className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-4"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {AGE_GROUPS.map((age, i) => (
                <div key={age.param} style={{ scrollSnapAlign: 'start' }}>
                  <AgeCard age={age} index={i} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          6. FEATURED PRODUCTS — horizontal carousel
      ════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-18" style={{ background: C.skin }}>
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans font-semibold tracking-widest uppercase mb-3"
              style={{ background: C.goldMid, color: C.wood, border: `1px solid ${C.gold}60` }}>
              <FaStar className="text-[10px]" style={{ color: C.gold }} />
              Handpicked
            </div>
            <h2 className="font-serif mb-2" style={{ color: C.dark, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              Featured Toys
            </h2>
            <p className="font-sans text-sm" style={{ color: C.wood }}>
              Our bestsellers — loved by kids, trusted by parents
            </p>
            <Link to="/products?featured=true"
              className="inline-flex items-center gap-1.5 font-sans font-medium text-sm mt-3 transition-colors"
              style={{ color: C.terra }}>
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => <SkeletonCard key={i} wide />)}
            </div>
          ) : (
            <div className="relative group/carousel">
              {showLeftArrow && (
                <button onClick={() => scrollFeatured('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-medium transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 -translate-x-1/2"
                  style={{ background: C.skinLight, border: `1px solid ${C.skinMid}`, color: C.dark }}>
                  <FaChevronLeft className="text-sm" />
                </button>
              )}
              {showRightArrow && (
                <button onClick={() => scrollFeatured('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-medium transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 translate-x-1/2"
                  style={{ background: C.skinLight, border: `1px solid ${C.skinMid}`, color: C.dark }}>
                  <FaChevronRight className="text-sm" />
                </button>
              )}
              <div ref={featuredScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
                {featuredProducts.map(p => (
                  <div key={p._id} className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[220px]">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY US — 4-column strip
      ════════════════════════════════════════════════════════ */}
      <div style={{ background: C.dark }} className="py-10">
        <div className="container-custom">
          <p className="font-sans text-center text-[11px] font-semibold tracking-widest uppercase mb-7"
            style={{ color: `${C.gold}90` }}>
            Why Parents Love Us
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {WHY_US.map(({ icon, title, desc, color }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}22`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm leading-tight mb-1" style={{ color: C.skin }}>{title}</p>
                  <p className="font-sans text-[11px] leading-snug" style={{ color: `${C.skinMid}80` }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          7. PRODUCT REELS
      ════════════════════════════════════════════════════════ */}
      {reelsEnabled && reels.length > 0 && (
        <div style={{ background: C.skin }}>
          <ProductReels reels={reels} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          8. EDUCATIONAL VALUE
      ════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: C.skinLight }}>
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3"
              style={{ background: C.sageMid, color: C.sageDark }}>
              Educational Value
            </span>
            <h2 className="font-serif" style={{ color: C.dark, fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}>
              Toys That Teach &amp; Inspire
            </h2>
            <p className="font-sans text-sm mt-2 max-w-lg mx-auto leading-relaxed" style={{ color: C.wood }}>
              Every toy chosen to support your child's natural development — mind, body, and soul.
            </p>
          </div>

          {/* Skill cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 mb-10">
            {SKILLS.map(({ emoji, label, desc }, i) => {
              const cardColors = [
                { bg: C.sageMid, icon: C.sageDark },
                { bg: C.goldMid, icon: C.wood },
                { bg: C.terraMid, icon: C.terra },
                { bg: C.sageMid, icon: C.sageDark },
                { bg: C.goldMid, icon: C.wood },
                { bg: C.terraMid, icon: C.terra },
              ];
              const cc = cardColors[i % cardColors.length];
              return (
                <div key={label}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-default"
                  style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 12px rgba(47,30,20,0.06)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: cc.bg }}>
                    {emoji}
                  </div>
                  <p className="font-sans font-semibold text-xs mb-1 leading-tight" style={{ color: C.dark }}>{label}</p>
                  <p className="font-sans text-[10px] leading-snug" style={{ color: C.wood }}>{desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/products" className="btn btn-terra">
              Explore All Toys <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          9. GIFT GUIDE
      ════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: C.skin }}>
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3"
              style={{ background: C.goldMid, color: C.wood, border: `1px solid ${C.gold}50` }}>
              Gift Ideas
            </span>
            <h2 className="font-serif mb-2" style={{ color: C.dark, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              Find the Perfect Gift
            </h2>
            <p className="font-sans text-sm" style={{ color: C.wood }}>
              Curated toy collections for every occasion and milestone
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { emoji: '🎂', label: 'Birthday',      desc: 'Make their day special',     link: '/products?featured=true',           bg: '#FDE8D8', accent: '#C96A4A' },
              { emoji: '👶', label: 'Baby Shower',   desc: 'For the new arrival',        link: '/products?ageGroup=0-6%20months',   bg: '#D6E8DE', accent: '#4F7A65' },
              { emoji: '🪔', label: 'Diwali',        desc: 'Festive season picks',       link: '/products?featured=true',           bg: '#F4EAC8', accent: '#B07F2A' },
              { emoji: '🎄', label: 'Christmas',     desc: 'Holiday toy magic',          link: '/products?featured=true',           bg: '#D6E8DE', accent: '#4F7A65' },
              { emoji: '🏫', label: 'Back to School',desc: 'Learning through play',      link: '/products?ageGroup=3-5%20years',    bg: '#EDD8C0', accent: '#9C7248' },
              { emoji: '🎁', label: 'Just Because',  desc: 'Surprise them anytime',      link: '/products',                         bg: '#F5D8CC', accent: '#C96A4A' },
            ].map(({ emoji, label, desc, link, bg, accent }) => (
              <Link
                key={label}
                to={link}
                className="group flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 12px rgba(47,30,20,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px rgba(47,30,20,0.13)`; e.currentTarget.style.borderColor = accent + '60'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(47,30,20,0.06)'; e.currentTarget.style.borderColor = C.skinMid; }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: bg }}>
                  {emoji}
                </div>
                <p className="font-sans font-bold text-sm mb-1" style={{ color: C.dark }}>{label}</p>
                <p className="font-sans text-[11px] leading-snug" style={{ color: C.wood }}>{desc}</p>
                <span className="mt-3 font-sans text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
                  style={{ color: accent }}>
                  Shop <FaArrowRight className="text-[9px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          10. NEWSLETTER
      ════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-16" style={{ background: C.dark }}>
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: `${C.gold}20`, border: `1px solid ${C.gold}40` }}>
              <FaEnvelope style={{ color: C.gold, fontSize: '1.3rem' }} />
            </div>
            <h2 className="font-serif mb-3" style={{ color: C.skin, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              Get Toy Tips & Exclusive Deals
            </h2>
            <p className="font-sans text-sm mb-7 leading-relaxed" style={{ color: `${C.skinMid}BB` }}>
              Join 1,000+ parents who get weekly toy guides, age-based recommendations, and members-only discounts straight to their inbox.
            </p>

            {newsletterStatus === 'success' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: C.sageMid }}>
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path d="M2 8L8 14L18 2" stroke={C.sageDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-sans font-semibold text-base" style={{ color: C.skin }}>You're in! Check your inbox soon 🎉</p>
                <p className="font-sans text-sm" style={{ color: `${C.skinMid}99` }}>We'll send you our best toy picks this week.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-5 py-3.5 rounded-xl font-sans text-sm focus:outline-none"
                  style={{
                    background: 'rgba(253,250,246,0.08)',
                    border: `1.5px solid rgba(253,250,246,0.15)`,
                    color: C.skin,
                  }}
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="px-7 py-3.5 rounded-xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
                  style={{ background: C.terra, color: '#fff', boxShadow: '0 4px 16px rgba(201,106,74,0.4)' }}>
                  {newsletterStatus === 'loading' ? 'Subscribing…' : 'Subscribe Free'}
                </button>
              </form>
            )}

            <p className="font-sans text-[11px] mt-4" style={{ color: `${C.skinMid}60` }}>
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          11. HANDCRAFTED WITH LOVE — CTA Banner
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: C.dark }}>
        {/* Subtle texture blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: C.wood, opacity: 0.25, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: C.sage, opacity: 0.10, transform: 'translate(-30%, 30%)' }} />

        <div className="container-custom relative py-14 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ background: `${C.gold}20`, color: C.gold, border: `1px solid ${C.gold}40` }}>
                Handcrafted with Love
              </span>
              <h2 className="font-serif mb-4 leading-tight"
                style={{ color: C.skin, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                Your Child's Next<br />Favourite Toy is Here
              </h2>
              <p className="font-sans text-sm md:text-base mb-8 leading-relaxed max-w-md lg:mx-0 mx-auto"
                style={{ color: C.skinMid }}>
                Safe, eco-friendly wooden toys that spark creativity, build skills, and create memories that last a lifetime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/products" className="btn btn-terra" style={{ fontSize: '0.9rem', padding: '13px 30px' }}>
                  Shop All Toys <FaArrowRight className="text-xs" />
                </Link>
                <Link to="/products?featured=true" className="btn"
                  style={{ background: 'rgba(247,239,229,0.08)', color: C.skin, border: `1.5px solid rgba(247,239,229,0.20)`, fontSize: '0.9rem', padding: '13px 30px' }}>
                  <FaStar className="text-xs" style={{ color: C.gold }} /> Featured Picks
                </Link>
              </div>
            </div>

            {/* Right — stats + badge */}
            <div className="flex-shrink-0 flex flex-col items-center gap-6">
              {/* Stats row */}
              <div className="flex gap-6 md:gap-10">
                {[
                  { stat: '1,000+', label: 'Happy Families' },
                  { stat: '100%',   label: 'Non-Toxic'       },
                  { stat: '4.9★',   label: 'Avg. Rating'     },
                ].map(({ stat, label }) => (
                  <div key={label} className="text-center px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(221,187,114,0.08)', border: '1px solid rgba(221,187,114,0.15)' }}>
                    <p className="font-serif text-3xl md:text-4xl leading-none font-bold" style={{ color: C.gold }}>{stat}</p>
                    <p className="font-sans text-[11px] mt-1.5 font-medium" style={{ color: `${C.skinMid}BB` }}>{label}</p>
                  </div>
                ))}
              </div>
              {/* Ornament badge */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}35` }}>
                <span className="text-2xl">🪵</span>
                <div>
                  <p className="font-sans font-semibold text-xs leading-tight" style={{ color: C.skin }}>Premium Wood Quality</p>
                  <p className="font-sans text-[10px]" style={{ color: C.skinMid }}>Sanded smooth, child-safe finish</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
