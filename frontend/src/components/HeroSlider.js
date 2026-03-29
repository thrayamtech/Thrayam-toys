import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { getSliderImage } from '../utils/imageHelper';

const C = {
  skin:    '#F7EFE5',
  skinMid: '#EDD8C0',
  wood:    '#6B4226',
  dark:    '#2F1E14',
  sage:    '#8FAF9D',
  gold:    '#DDBB72',
  terra:   '#C96A4A',
};

const defaultSlides = [
  {
    _id: '1',
    eyebrow: 'Safe · Natural · Joyful',
    title: 'Handcrafted\nWooden Toys',
    description: 'Premium wooden toys that spark creativity and support your child\'s natural development — crafted with love.',
    cta: 'Shop Collection',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    blobColor: '#EDD8C0',
    accentColor: '#DDBB72',
    badge: '🪵 100% Natural Wood',
  },
  {
    _id: '2',
    eyebrow: 'Developmentally Designed',
    title: 'Learn While\nThey Play',
    description: 'Every toy chosen to build motor skills, creativity, and cognitive growth — perfectly matched to your child\'s age.',
    cta: 'Shop by Age',
    link: '/products?ageGroup=3-5%20years',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=700&q=80',
    blobColor: '#D6E8DE',
    accentColor: '#8FAF9D',
    badge: '🌱 Eco Friendly',
  },
  {
    _id: '3',
    eyebrow: 'For Every Milestone',
    title: 'Gifts They\'ll\nTreasure Forever',
    description: 'Beautifully crafted toys that make unforgettable gifts — for birthdays, newborns, and every special moment.',
    cta: 'See Featured',
    link: '/products?featured=true',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&q=80',
    blobColor: '#F5D8CC',
    accentColor: '#C96A4A',
    badge: '🎁 Gift Wrapping Available',
  },
];

/* Floating decorative dot */
const Dot = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

/* Star/leaf shape */
const Shape = ({ style, type = 'circle' }) => {
  if (type === 'ring') {
    return (
      <div className="absolute rounded-full border-2 pointer-events-none" style={style} />
    );
  }
  return <div className="absolute pointer-events-none" style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', ...style }} />;
};

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  const fetchSliders = useCallback(async () => {
    try {
      const { data } = await API.get('/sliders/active');
      setSlides(data.sliders?.length > 0 ? data.sliders : defaultSlides);
    } catch {
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSliders(); }, [fetchSliders]);

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(p => (p + 1) % slides.length);
        setAnimating(false);
      }, 300);
    }, 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  const goTo = (idx) => {
    if (idx === current) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 250);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 520, background: C.skin }}>
        <div className="spinner" />
      </div>
    );
  }

  const slide = slides[current];
  const imgUrl = getSliderImage(slide);
  const blob = slide.blobColor || C.skinMid;
  const accent = slide.accentColor || C.gold;

  return (
    <div className="relative overflow-hidden" style={{ background: C.skin, minHeight: '620px' }}>

      {/* ── Floating decorative elements ── */}
      <Dot style={{ width: 120, height: 120, background: accent + '22', top: '-2%', left: '-1%', borderRadius: '50%' }} />
      <Dot style={{ width: 60, height: 60, background: C.sage + '30', top: '15%', left: '8%', borderRadius: '50%' }} />
      <Dot style={{ width: 18, height: 18, background: accent + '70', top: '45%', left: '3%', borderRadius: '50%' }} />
      <Dot style={{ width: 10, height: 10, background: C.terra + '60', bottom: '25%', left: '15%', borderRadius: '50%' }} />
      <Dot style={{ width: 14, height: 14, background: accent, top: '12%', left: '42%', borderRadius: '50%', animation: 'float 3s ease-in-out infinite' }} />
      <Shape type="ring" style={{ width: 80, height: 80, borderColor: accent + '40', top: '8%', right: '45%' }} />
      <Dot style={{ width: 10, height: 10, background: C.sage, bottom: '30%', right: '44%', borderRadius: '50%' }} />

      {/* ── Large organic blob — right side background ── */}
      <div
        className="absolute hidden md:block"
        style={{
          top: '-10%', right: '-5%',
          width: '60%', height: '120%',
          background: blob,
          borderRadius: '50% 0 0 55% / 45% 0 0 50%',
          transition: 'background 0.6s ease',
        }}
      />

      {/* ── Mobile blob — top area ── */}
      <div
        className="absolute block md:hidden"
        style={{
          top: '-5%', right: '-10%',
          width: '70%', height: '55%',
          background: blob,
          borderRadius: '0 0 60% 60% / 0 0 50% 50%',
          transition: 'background 0.6s ease',
        }}
      />

      {/* ── Slide Content ── */}
      <div
        className="relative container-custom flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0"
        style={{
          minHeight: '620px',
          paddingTop: '60px', paddingBottom: '80px',
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Left: Text Content */}
        <div className="w-full md:w-[42%] flex flex-col items-start text-left z-10 order-2 md:order-1">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8" style={{ background: accent }} />
            <span className="font-sans font-semibold text-xs tracking-widest uppercase" style={{ color: C.wood }}>
              {slide.eyebrow || slide.subtitle}
            </span>
          </div>

          {/* Badge */}
          {slide.badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans font-medium text-xs mb-4"
              style={{ background: accent + '22', color: C.dark, border: `1px solid ${accent}55` }}>
              {slide.badge}
            </span>
          )}

          {/* Headline */}
          <h1 className="font-serif mb-4" style={{
            color: C.dark,
            fontSize: 'clamp(2rem, 4.5vw, 3.8rem)',
            lineHeight: 1.12,
            whiteSpace: 'pre-line',
          }}>
            {slide.title}
          </h1>

          {/* Description */}
          <p className="font-sans mb-7 max-w-md" style={{
            color: C.wood,
            fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
            lineHeight: 1.7,
          }}>
            {slide.description}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link to={slide.link}
              className="inline-flex items-center gap-2 font-sans font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: C.terra,
                color: '#fff',
                padding: '12px 28px',
                fontSize: '0.9rem',
                boxShadow: '0 6px 24px rgba(201,106,74,0.35)',
              }}>
              {slide.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/products"
              className="inline-flex items-center gap-1.5 font-sans font-medium text-sm transition-all"
              style={{ color: C.wood, textDecoration: 'none' }}>
              <span>View All Toys</span>
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex items-center gap-4 mt-7">
            {['🌿 Non-toxic', '🪵 Handcrafted', '🚚 Free Shipping'].map(tag => (
              <span key={tag} className="font-sans text-xs" style={{ color: C.wood + 'cc' }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Right: Image in organic blob frame */}
        <div className="w-full md:w-[55%] flex justify-center items-center z-10 order-1 md:order-2">
          <div className="relative">
            {/* Outer decorative ring */}
            <div className="absolute inset-0 rounded-full border-2 scale-110"
              style={{ borderColor: accent + '40' }} />

            {/* Image blob container */}
            <div
              className="relative overflow-hidden"
              style={{
                width: 'clamp(280px, 50vw, 580px)',
                height: 'clamp(280px, 50vw, 580px)',
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                background: blob + '80',
                boxShadow: `0 32px 80px rgba(47,30,20,0.20)`,
              }}
            >
              <img
                src={imgUrl}
                alt={slide.title}
                className="w-full h-full object-cover transition-all duration-700"
                style={{ opacity: animating ? 0.5 : 1, transform: animating ? 'scale(1.04)' : 'scale(1)' }}
              />
            </div>

            {/* Floating accent dot (top-right of image) */}
            <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center shadow-medium"
              style={{ background: accent, fontSize: '1.5rem' }}>
              🪵
            </div>

            {/* Floating badge (bottom-left of image) */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl px-4 py-2.5 shadow-strong"
              style={{ background: '#FDFAF6', border: `1px solid ${C.skinMid}` }}>
              <p className="font-sans text-[10px] font-medium mb-0.5" style={{ color: C.wood }}>Trusted by</p>
              <p className="font-serif text-lg" style={{ color: C.dark }}>1000+ Families</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide dots ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '32px' : '8px',
              height: '8px',
              background: i === current ? C.terra : C.wood + '40',
            }} />
        ))}
      </div>

      {/* ── Wave divider at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 leading-none">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="#FDFAF6" />
        </svg>
      </div>
    </div>
  );
};

export default HeroSlider;
