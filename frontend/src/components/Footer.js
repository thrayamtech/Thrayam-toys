import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart,
  FaLeaf, FaTruck, FaUndo, FaShieldAlt,
} from 'react-icons/fa';

/* ── Palette (mirrors Home.js) ─────────────────────────────── */
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

const QUICK_LINKS = [
  { to: '/',           label: 'Home'        },
  { to: '/products',   label: 'All Toys'    },
  { to: '/categories', label: 'Categories'  },
  { to: '/about',      label: 'About Us'    },
  { to: '/blogs',      label: 'Blog'        },
  { to: '/contact',    label: 'Contact Us'  },
];

const POLICY_LINKS = [
  { to: '/shipping-policy',  label: 'Shipping Policy'  },
  { to: '/refund-policy',    label: 'Returns & Refunds' },
  { to: '/privacy-policy',   label: 'Privacy Policy'   },
  { to: '/terms-conditions', label: 'Terms & Conditions'},
];

const AGE_LINKS = [
  { label: '0–3 Months',    param: '0-3 months'   },
  { label: '3–6 Months',    param: '3-6 months'   },
  { label: '6–12 Months',   param: '6-12 months'  },
  { label: '12–18 Months',  param: '12-18 months' },
  { label: '18–24 Months',  param: '18-24 months' },
  { label: '2–3 Years',     param: '2-3 years'    },
  { label: '3+ Years',      param: '3+ years'     },
];

const SOCIALS = [
  { href: 'https://facebook.com',           icon: <FaFacebook />,  label: 'Facebook'  },
  { href: 'https://instagram.com',          icon: <FaInstagram />, label: 'Instagram' },
  { href: 'https://twitter.com',            icon: <FaTwitter />,   label: 'Twitter'   },
  { href: 'https://youtube.com',            icon: <FaYoutube />,   label: 'YouTube'   },
  { href: 'https://wa.me/918807259471',     icon: <FaWhatsapp />,  label: 'WhatsApp'  },
];

const TRUST = [
  { icon: <FaLeaf />,      title: 'Safe & Non-Toxic',  sub: 'Certified quality',       color: C.sage  },
  { icon: <FaTruck />,     title: 'Free Shipping',      sub: 'Orders above ₹499',       color: C.gold  },
  { icon: <FaUndo />,      title: 'Easy Returns',       sub: '7-day return policy',     color: C.terra },
  { icon: <FaShieldAlt />, title: 'Secure Payment',     sub: '100% safe checkout',      color: C.skinMid },
];

/* ── Column heading ──────────────────────────────────────────── */
const ColHead = ({ children }) => (
  <h4 className="font-serif mb-5" style={{ color: C.skin, fontSize: '1.05rem' }}>
    {children}
  </h4>
);

/* ── Link row ─────────────────────────────────────────────────── */
const FootLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="font-sans text-sm transition-colors duration-200"
      style={{ color: `${C.skinMid}CC` }}
      onMouseEnter={e => e.currentTarget.style.color = C.gold}
      onMouseLeave={e => e.currentTarget.style.color = `${C.skinMid}CC`}
    >
      {children}
    </Link>
  </li>
);

const Footer = () => (
  <footer style={{ background: C.dark }}>

    {/* ── Gold top divider ───────────────────────────────────── */}
    <div style={{ height: 3, background: `linear-gradient(to right, ${C.wood}, ${C.gold}, ${C.terra}, ${C.sage}, ${C.wood})` }} />

    {/* ── Main content ──────────────────────────────────────── */}
    <div className="container-custom py-14 md:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* 1 — Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-5 group">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: C.wood, border: `2px solid ${C.gold}40` }}>
              <img src="/logo.jpg" alt="Thrayam Toys"
                className="w-full h-full object-cover"
                onError={e => e.target.style.display = 'none'} />
            </div>
            <div>
              <span className="block font-serif leading-tight" style={{ color: C.skin, fontSize: '1.1rem' }}>Thrayam</span>
              <span className="block font-sans text-xs font-semibold tracking-widest uppercase" style={{ color: C.gold }}>Wooden Toys</span>
            </div>
          </Link>
          <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: `${C.skinMid}BB` }}>
            Premium handcrafted wooden toys that spark imagination, inspire creativity, and support every stage of your child's growth.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {SOCIALS.map(({ href, icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-200"
                style={{ background: `${C.skin}10`, color: `${C.skin}99`, border: `1px solid ${C.skin}15` }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.dark; e.currentTarget.style.border = `1px solid ${C.gold}`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${C.skin}10`; e.currentTarget.style.color = `${C.skin}99`; e.currentTarget.style.border = `1px solid ${C.skin}15`; }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* 2 — Quick Links + Policies */}
        <div>
          <ColHead>Quick Links</ColHead>
          <ul className="space-y-2.5 mb-7">
            {QUICK_LINKS.map(({ to, label }) => (
              <FootLink key={to} to={to}>{label}</FootLink>
            ))}
          </ul>
          <ColHead>Policies</ColHead>
          <ul className="space-y-2.5">
            {POLICY_LINKS.map(({ to, label }) => (
              <FootLink key={to} to={to}>{label}</FootLink>
            ))}
          </ul>
        </div>

        {/* 3 — Shop by Age */}
        <div>
          <ColHead>Shop by Age</ColHead>
          <ul className="space-y-2.5">
            {AGE_LINKS.map(({ label, param }) => (
              <FootLink key={param} to={`/products?ageGroup=${encodeURIComponent(param)}`}>
                {label}
              </FootLink>
            ))}
          </ul>
        </div>

        {/* 4 — Contact */}
        <div>
          <ColHead>Get In Touch</ColHead>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-sm" style={{ color: C.gold }} />
              <span className="font-sans text-sm leading-relaxed" style={{ color: `${C.skinMid}BB` }}>
                11/109/2, Edavattam, Thirunanthikarai,<br />
                Kulasekharam, Kanyakumari Dist,<br />
                629161, Tamilnadu
              </span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="flex-shrink-0 text-sm" style={{ color: C.gold }} />
              <a href="tel:+918807259471" className="font-sans text-sm transition-colors duration-200"
                style={{ color: `${C.skinMid}BB` }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = `${C.skinMid}BB`}>
                +91 88072 59471
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="flex-shrink-0 text-sm" style={{ color: C.gold }} />
              <a href="mailto:info@thrayamtoys.com" className="font-sans text-sm transition-colors duration-200"
                style={{ color: `${C.skinMid}BB` }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = `${C.skinMid}BB`}>
                info@thrayamtoys.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaWhatsapp className="flex-shrink-0 text-sm" style={{ color: '#25D366' }} />
              <a href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer"
                className="font-sans text-sm transition-colors duration-200"
                style={{ color: `${C.skinMid}BB` }}
                onMouseEnter={e => e.currentTarget.style.color = '#25D366'}
                onMouseLeave={e => e.currentTarget.style.color = `${C.skinMid}BB`}>
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>

    {/* ── Trust badges strip ─────────────────────────────────── */}
    <div style={{ borderTop: `1px solid ${C.skin}12`, borderBottom: `1px solid ${C.skin}12` }}
      className="py-6">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {TRUST.map(({ icon, title, sub, color }, i) => (
            <React.Fragment key={title}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: `${color}20`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="font-sans font-semibold text-xs leading-tight" style={{ color: C.skin }}>{title}</p>
                  <p className="font-sans text-[10px]" style={{ color: `${C.skinMid}88` }}>{sub}</p>
                </div>
              </div>
              {i < TRUST.length - 1 && (
                <div className="hidden md:block w-px h-8" style={{ background: `${C.skin}15` }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>

    {/* ── Copyright bar ──────────────────────────────────────── */}
    <div className="py-5" style={{ background: `${C.wood}30` }}>
      <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-sans text-xs" style={{ color: `${C.skinMid}88` }}>
          © 2025 Thrayam Toys. All rights reserved.
        </p>
        <p className="font-sans text-xs flex items-center gap-1.5" style={{ color: `${C.skinMid}88` }}>
          Made with <FaHeart className="text-[10px]" style={{ color: C.terra }} /> for little ones in India
        </p>
        <div className="flex items-center gap-4">
          {[
            { to: '/privacy-policy',   label: 'Privacy' },
            { to: '/terms-conditions', label: 'Terms'   },
            { to: '/refund-policy',    label: 'Refunds' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="font-sans text-xs transition-colors duration-200"
              style={{ color: `${C.skinMid}88` }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = `${C.skinMid}88`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>

  </footer>
);

export default Footer;
