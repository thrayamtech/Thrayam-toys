import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaHeart, FaShieldAlt, FaTruck, FaStar, FaArrowRight } from 'react-icons/fa';

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

const VALUES = [
  {
    icon: <FaLeaf />,
    title: 'Safe & Non-Toxic',
    desc: 'Every toy is made from natural wood, finished with child-safe, non-toxic paints and sealants — certified for peace of mind.',
    bg: C.sageMid, color: C.sageDark,
  },
  {
    icon: <FaHeart />,
    title: 'Handcrafted with Love',
    desc: 'Each toy is shaped, sanded, and painted by skilled artisans. No two pieces are exactly alike — that\'s the beauty of handmade.',
    bg: C.terraMid, color: C.terra,
  },
  {
    icon: <FaStar />,
    title: 'Developmental Play',
    desc: 'Our toys are thoughtfully designed for each age stage — supporting motor skills, creativity, and cognitive growth through play.',
    bg: C.goldMid, color: C.wood,
  },
  {
    icon: <FaShieldAlt />,
    title: 'Quality Guaranteed',
    desc: 'Rigorous quality checks ensure every toy that reaches your child is durable, splinter-free, and built to last.',
    bg: C.sageMid, color: C.sageDark,
  },
];

const STATS = [
  { value: '1,000+', label: 'Happy Families' },
  { value: '50+',    label: 'Toy Designs'    },
  { value: '100%',   label: 'Non-Toxic'      },
  { value: '4.9★',   label: 'Avg. Rating'    },
];

const AboutUs = () => (
  <div className="min-h-screen" style={{ background: C.skin }}>

    {/* ── Hero ── */}
    <section className="relative overflow-hidden py-20 md:py-28" style={{ background: C.dark }}>
      {/* Blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: C.wood, opacity: 0.3, transform: 'translate(20%,-20%)' }} />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: C.sage, opacity: 0.12 }} />

      <div className="container-custom relative text-center">
        <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
          style={{ background: `${C.gold}20`, color: C.gold, border: `1px solid ${C.gold}40` }}>
          Our Story
        </span>
        <h1 className="font-serif mb-5 leading-tight"
          style={{ color: C.skin, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          Crafted for Curious Minds,<br />Built for Little Hands
        </h1>
        <p className="font-sans text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: `${C.skinMid}CC` }}>
          Thrayam Toys was born from a simple belief — that the best toys are ones that are safe,
          beautiful, and genuinely nurture a child's development.
        </p>
      </div>
    </section>

    {/* ── Stats strip ── */}
    <div style={{ background: C.wood }}>
      <div className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-serif text-2xl md:text-3xl leading-none mb-1" style={{ color: C.gold }}>{value}</p>
              <p className="font-sans text-xs" style={{ color: `${C.skinMid}AA` }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Our Story ── */}
    <section className="py-16 md:py-24" style={{ background: C.skinLight }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              style={{ background: C.sageMid, color: C.sageDark }}>
              Who We Are
            </span>
            <h2 className="font-serif mb-6" style={{ color: C.dark, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
              From a Family Workshop<br />to Families Across India
            </h2>
            <div className="space-y-4 font-sans text-base leading-relaxed" style={{ color: C.wood }}>
              <p>
                <span className="font-bold" style={{ color: C.dark }}>Thrayam Toys</span> started
                as a small workshop in Kanyakumari, Tamil Nadu, where our founders — passionate
                parents themselves — believed that wooden toys were disappearing from children's lives,
                replaced by plastic and screens.
              </p>
              <p>
                We began crafting simple wooden shapes, teethers, and stackers for our own children.
                Friends and family noticed. Orders started coming in. Today, we ship handcrafted wooden
                toys to families across India — each piece made with the same care as that very first toy.
              </p>
              <p>
                Every toy in our collection is a promise: that your child will play with something
                safe, beautiful, and made to last far beyond childhood.
              </p>
            </div>
          </div>

          {/* Decorative wood SVG */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="rounded-3xl overflow-hidden aspect-square flex items-center justify-center"
                style={{ background: C.skinMid, border: `2px solid ${C.skinBorder}` }}>
                <svg viewBox="0 0 400 400" className="w-4/5 h-4/5 opacity-70">
                  {/* Wood grain rings */}
                  <ellipse cx="200" cy="200" rx="160" ry="155" fill="none" stroke={C.wood} strokeWidth="2" opacity="0.25" />
                  <ellipse cx="200" cy="200" rx="130" ry="125" fill="none" stroke={C.wood} strokeWidth="2" opacity="0.3" />
                  <ellipse cx="200" cy="200" rx="100" ry="96" fill="none" stroke={C.wood} strokeWidth="2" opacity="0.35" />
                  <ellipse cx="200" cy="200" rx="70" ry="67" fill="none" stroke={C.wood} strokeWidth="2" opacity="0.4" />
                  <ellipse cx="200" cy="200" rx="40" ry="38" fill="none" stroke={C.wood} strokeWidth="2" opacity="0.5" />
                  {/* Center dot */}
                  <circle cx="200" cy="200" r="10" fill={C.wood} opacity="0.5" />
                  {/* Grain lines */}
                  <path d="M 80 200 Q 140 180, 200 200 Q 260 220, 320 200" stroke={C.wood} strokeWidth="1.5" fill="none" opacity="0.2" />
                  <path d="M 80 215 Q 140 195, 200 215 Q 260 235, 320 215" stroke={C.wood} strokeWidth="1" fill="none" opacity="0.15" />
                  {/* Toy icons */}
                  <text x="200" y="215" textAnchor="middle" fontSize="64" style={{ fontFamily: 'serif' }}>🪵</text>
                </svg>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 px-4 py-3 rounded-2xl shadow-lg"
                style={{ background: C.dark, border: `1.5px solid ${C.gold}40` }}>
                <p className="font-serif text-lg leading-none" style={{ color: C.gold }}>Since</p>
                <p className="font-serif text-2xl font-bold leading-none" style={{ color: C.skin }}>2022</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Our Values ── */}
    <section className="py-16 md:py-20" style={{ background: C.skin }}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ background: C.goldMid, color: C.wood }}>
            What We Stand For
          </span>
          <h2 className="font-serif" style={{ color: C.dark, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            Our Promise to Every Parent
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map(({ icon, title, desc, bg, color }) => (
            <div key={title}
              className="group flex flex-col p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 14px rgba(47,30,20,0.06)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: bg, color }}>
                {icon}
              </div>
              <h3 className="font-serif mb-2 text-lg leading-tight" style={{ color: C.dark }}>{title}</h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: C.wood }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Philosophy ── */}
    <section className="py-16 md:py-20" style={{ background: C.skinLight }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left — Philosophy points */}
          <div>
            <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              style={{ background: C.terraMid, color: C.terra }}>
              Our Philosophy
            </span>
            <h2 className="font-serif mb-6" style={{ color: C.dark, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
              Play is How Children Learn Best
            </h2>
            <div className="space-y-5">
              {[
                { title: 'Open-Ended Play',  desc: 'We design toys without a single "right" answer. A wooden block can be a car, a house, or a rocket — limited only by imagination.' },
                { title: 'Age-Appropriate',  desc: 'Every toy is mapped to a developmental stage, from sensory teethers for newborns to strategy games for older children.' },
                { title: 'Eco-Conscious',    desc: 'We use sustainably sourced wood and water-based, non-toxic finishes — good for children and the planet.' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: C.terra, minHeight: 16 }} />
                  <div>
                    <h3 className="font-sans font-bold text-sm mb-1" style={{ color: C.dark }}>{title}</h3>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: C.wood }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — quote card */}
          <div className="flex items-center justify-center">
            <div className="rounded-3xl p-8 md:p-10 text-center max-w-sm"
              style={{ background: C.dark, border: `1.5px solid ${C.gold}30` }}>
              <span className="font-serif block mb-4" style={{ color: C.gold, fontSize: '3rem', lineHeight: 1 }}>"</span>
              <p className="font-serif italic leading-relaxed mb-6"
                style={{ color: C.skin, fontSize: '1.1rem' }}>
                The best toy a child can have is one that fires the imagination — and then gets out of the way.
              </p>
              <div className="w-12 h-0.5 mx-auto mb-4" style={{ background: `${C.gold}60` }} />
              <p className="font-sans text-xs font-semibold tracking-wide" style={{ color: `${C.skinMid}99` }}>
                — Our guiding principle
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Delivery Promise ── */}
    <section className="py-10" style={{ background: C.skinMid }}>
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { icon: <FaTruck />, text: 'Free Shipping above ₹499', color: C.wood },
            { icon: <FaShieldAlt />, text: '7-Day Easy Returns', color: C.sageDark },
            { icon: <FaLeaf />, text: '100% Non-Toxic Materials', color: C.sageDark },
            { icon: <FaHeart />, text: 'Made with Love in India', color: C.terra },
          ].map(({ icon, text, color }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span style={{ color, fontSize: '1.1rem' }}>{icon}</span>
              <span className="font-sans font-semibold text-sm" style={{ color: C.dark }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="py-16 md:py-20 relative overflow-hidden" style={{ background: C.dark }}>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: C.wood, opacity: 0.25 }} />
      <div className="container-custom relative text-center">
        <h2 className="font-serif mb-4" style={{ color: C.skin, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          Ready to Find the Perfect Toy?
        </h2>
        <p className="font-sans text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed"
          style={{ color: `${C.skinMid}BB` }}>
          Browse our collection of handcrafted wooden toys — each one carefully made for your child's age and stage.
        </p>
        <Link to="/products"
          className="inline-flex items-center gap-2 font-sans font-bold px-8 py-3.5 rounded-2xl transition-all duration-200"
          style={{ background: C.terra, color: '#fff', boxShadow: '0 4px 18px rgba(201,106,74,0.35)' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Shop All Toys <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </section>

  </div>
);

export default AboutUs;
