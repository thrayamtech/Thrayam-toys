import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaHeart, FaPhone, FaEnvelope, FaWhatsapp,
  FaChevronDown, FaWallet, FaGift, FaLeaf,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import { trackSearch } from '../utils/metaPixel';

// ─── Color constants ──────────────────────────────────────────────
const C = {
  skin:    '#F7EFE5',
  skinMid: '#EDD8C0',
  skinCard:'#FDFAF6',
  wood:    '#6B4226',
  dark:    '#2F1E14',
  sage:    '#8FAF9D',
  sageMid: '#D6E8DE',
  gold:    '#DDBB72',
  goldMid: '#F4EAC8',
  terra:   '#C96A4A',
  terraMid:'#F5D8CC',
};

const AGE_GROUPS = [
  { label: '0–6 Months',  param: '0-6 months',  emoji: '👶' },
  { label: '6–12 Months', param: '6-12 months',  emoji: '🍼' },
  { label: '1–2 Years',   param: '1-2 years',    emoji: '🧸' },
  { label: '2–3 Years',   param: '2-3 years',    emoji: '🎨' },
  { label: '3–5 Years',   param: '3-5 years',    emoji: '🚂' },
  { label: '5–8 Years',   param: '5-8 years',    emoji: '🔧' },
  { label: '8–12 Years',  param: '8-12 years',   emoji: '🔬' },
  { label: '12+ Years',   param: '12+ years',    emoji: '🎯' },
];

const Navbar = ({ onCartOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showAgeMenu, setShowAgeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const catRef = useRef(null);
  const ageRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch { /* silent */ }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackSearch(searchQuery);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const dropdownStyle = {
    background: C.skinCard,
    border: `1px solid ${C.skinMid}`,
    borderRadius: '1rem',
    boxShadow: '0 8px 40px rgba(47,30,20,0.12)',
  };

  const navLinkStyle = {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: C.dark,
    transition: 'color 0.15s',
  };

  return (
    <>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div style={{ background: C.dark }} className="py-2">
        <div className="container-custom">
          <div className="flex justify-between items-center text-xs font-sans font-medium" style={{ color: C.skinMid }}>
            <div className="flex items-center gap-5">
              <a href="mailto:info@thrayamtoys.com" className="flex items-center gap-1.5 hover:opacity-100 opacity-80 transition-opacity">
                <FaEnvelope className="text-[10px]" />
                <span className="hidden sm:inline">info@thrayamtoys.com</span>
              </a>
              <a href="tel:+918807259471" className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <FaPhone className="text-[10px]" />
                +91 88072 59471
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:flex items-center gap-1.5 opacity-80">
                <FaLeaf className="text-[10px]" style={{ color: C.sage }} />
                Safe &amp; Non-Toxic Wooden Toys
              </span>
              <a href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <FaWhatsapp style={{ color: C.sage }} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50"
        style={{ background: C.skin, borderBottom: `1px solid ${C.skinMid}`, boxShadow: '0 2px 12px rgba(47,30,20,0.06)' }}>
        <div className="container-custom">
          <div className="flex items-center justify-between py-3.5">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <img src="/logo.jpg" alt="Thrayam Toys"
                className="w-11 h-11 object-contain group-hover:scale-105 transition-transform duration-200"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center hidden"
                style={{ background: C.wood }}>
                <span className="font-sans font-bold text-base" style={{ color: C.skin }}>T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg" style={{ color: C.dark }}>Thrayam</span>
                <span className="font-sans font-medium text-[10px] tracking-[0.18em] uppercase" style={{ color: C.wood }}>
                  Wooden Toys
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-7">
              <Link to="/" style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = C.terra}
                onMouseLeave={e => e.target.style.color = C.dark}>Home</Link>
              <Link to="/products" style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = C.terra}
                onMouseLeave={e => e.target.style.color = C.dark}>All Toys</Link>

              {/* Shop by Age */}
              <div className="relative" ref={ageRef}
                onMouseEnter={() => setShowAgeMenu(true)}
                onMouseLeave={() => setShowAgeMenu(false)}>
                <button className="flex items-center gap-1 transition-colors duration-150"
                  style={{ ...navLinkStyle, color: showAgeMenu ? C.terra : C.dark }}>
                  Shop by Age
                  <FaChevronDown className={`text-[9px] transition-transform duration-200 ${showAgeMenu ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute left-0 mt-2 w-72 transition-all duration-200 ${showAgeMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                  style={{ ...dropdownStyle, top: '100%' }}>
                  <div className="p-3 grid grid-cols-2 gap-1.5">
                    {AGE_GROUPS.map((age) => (
                      <Link key={age.param}
                        to={`/products?ageGroup=${encodeURIComponent(age.param)}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-colors"
                        style={{ color: C.dark }}
                        onMouseEnter={e => e.currentTarget.style.background = C.sageMid}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => setShowAgeMenu(false)}>
                        <span>{age.emoji}</span> {age.label}
                      </Link>
                    ))}
                  </div>
                  <div style={{ borderTop: `1px solid ${C.skinMid}`, padding: '8px 12px' }}>
                    <Link to="/products"
                      className="block text-center text-xs font-sans font-semibold py-1.5 rounded-lg transition-colors"
                      style={{ color: C.terra }}
                      onClick={() => setShowAgeMenu(false)}>
                      View All Toys →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="relative" ref={catRef}
                onMouseEnter={() => setShowCatMenu(true)}
                onMouseLeave={() => setShowCatMenu(false)}>
                <button className="flex items-center gap-1 transition-colors duration-150"
                  style={{ ...navLinkStyle, color: showCatMenu ? C.terra : C.dark }}>
                  Categories
                  <FaChevronDown className={`text-[9px] transition-transform duration-200 ${showCatMenu ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute left-0 mt-2 w-52 transition-all duration-200 ${showCatMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                  style={{ ...dropdownStyle, top: '100%' }}>
                  <div className="py-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {categories.length > 0 ? categories.map(cat => (
                      <Link key={cat._id} to={`/products?category=${cat._id}`}
                        className="block px-4 py-2.5 text-sm font-sans transition-colors"
                        style={{ color: C.dark }}
                        onMouseEnter={e => e.currentTarget.style.background = C.goldMid}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => setShowCatMenu(false)}>
                        {cat.name}
                      </Link>
                    )) : (
                      <p className="px-4 py-3 text-sm font-sans" style={{ color: C.wood }}>No categories</p>
                    )}
                  </div>
                </div>
              </div>

              <Link to="/about" style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = C.terra}
                onMouseLeave={e => e.target.style.color = C.dark}>About</Link>
              <Link to="/contact" style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = C.terra}
                onMouseLeave={e => e.target.style.color = C.dark}>Contact</Link>
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearch} className="relative">
                  <input type="text" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search wooden toys..."
                    className="input w-52 py-2 text-sm"
                    autoFocus onBlur={() => !searchQuery && setShowSearch(false)} />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: C.wood }}>
                    <FaSearch />
                  </button>
                </form>
              ) : (
                <button onClick={() => setShowSearch(true)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: C.wood }}
                  onMouseEnter={e => e.currentTarget.style.background = C.goldMid}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FaSearch className="text-base" />
                </button>
              )}

              {isAuthenticated && (
                <Link to="/wishlist" className="p-2 rounded-lg transition-colors" style={{ color: C.wood }}
                  onMouseEnter={e => e.currentTarget.style.background = C.goldMid}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FaHeart className="text-base" />
                </Link>
              )}

              {isAuthenticated && (
                <Link to="/wallet" className="p-2 rounded-lg transition-colors" style={{ color: C.wood }}
                  onMouseEnter={e => e.currentTarget.style.background = C.goldMid}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FaWallet className="text-base" />
                </Link>
              )}

              {/* Refer & Earn */}
              <Link to="/refer-friend"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans font-medium text-xs transition-all"
                style={{ background: C.goldMid, color: C.wood, border: `1px solid ${C.gold}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.gold}
                onMouseLeave={e => e.currentTarget.style.background = C.goldMid}>
                <FaGift style={{ color: C.wood }} /> Refer & Earn
              </Link>

              {/* Cart */}
              <button onClick={onCartOpen}
                className="relative p-2 rounded-lg transition-colors" style={{ color: C.wood }}
                onMouseEnter={e => e.currentTarget.style.background = C.goldMid}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <FaShoppingCart className="text-base" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5"
                    style={{ background: C.terra, color: C.skin }}>
                    {getCartCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={userRef}
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}>
                {isAuthenticated ? (
                  <button className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-semibold"
                      style={{ background: C.sage, color: C.dark }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <FaChevronDown className={`text-[9px] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                      style={{ color: C.wood }} />
                  </button>
                ) : (
                  <button onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all"
                    style={{ background: C.dark, color: C.skin }}
                    onMouseEnter={e => e.currentTarget.style.background = C.wood}
                    onMouseLeave={e => e.currentTarget.style.background = C.dark}>
                    <FaUser className="text-xs" /> Sign In
                  </button>
                )}

                <div className={`absolute right-0 mt-2 w-56 transition-all duration-200 overflow-hidden ${showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                  style={{ ...dropdownStyle, top: '100%' }}>
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3" style={{ background: C.dark }}>
                        <p className="font-sans font-semibold text-sm" style={{ color: C.skin }}>{user?.name}</p>
                        <p className="text-xs opacity-70 mt-0.5 font-sans" style={{ color: C.skin }}>{user?.email}</p>
                      </div>
                      <div className="py-1.5">
                        {[
                          { to: '/profile', label: 'My Profile' },
                          { to: '/orders', label: 'My Orders' },
                          { to: '/wishlist', label: 'My Wishlist' },
                          { to: '/wallet', label: 'Wallet & Rewards' },
                        ].map(({ to, label }) => (
                          <Link key={to} to={to}
                            className="block px-4 py-2.5 text-sm font-sans transition-colors"
                            style={{ color: C.dark }}
                            onMouseEnter={e => e.currentTarget.style.background = C.sageMid}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link to="/admin"
                            className="block px-4 py-2.5 text-sm font-sans transition-colors"
                            style={{ color: C.dark }}
                            onMouseEnter={e => e.currentTarget.style.background = C.sageMid}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div style={{ borderTop: `1px solid ${C.skinMid}` }}>
                        <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-sans transition-colors"
                          style={{ color: C.terra }}
                          onMouseEnter={e => e.currentTarget.style.background = C.terraMid}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="font-sans font-medium text-sm mb-1" style={{ color: C.dark }}>Welcome to Thrayam Toys</p>
                      <p className="text-xs mb-3 font-sans" style={{ color: C.wood }}>Sign in for a better experience</p>
                      <Link to="/login"
                        className="block text-center py-2.5 text-sm font-sans font-semibold rounded-xl transition-colors"
                        style={{ background: C.dark, color: C.skin }}>
                        Sign In / Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <button onClick={onCartOpen} className="relative p-2" style={{ color: C.wood }}>
                <FaShoppingCart className="text-lg" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5"
                    style={{ background: C.terra, color: C.skin }}>
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2" style={{ color: C.wood }}>
                {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────── */}
        {isOpen && (
          <div className="lg:hidden pb-4" style={{ borderTop: `1px solid ${C.skinMid}`, background: C.skin }}>
            <div className="container-custom pt-3 space-y-0.5">
              <form onSubmit={handleSearch} className="relative mb-3">
                <input type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search wooden toys..."
                  className="input w-full py-2.5 text-sm" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.wood }}>
                  <FaSearch className="text-sm" />
                </button>
              </form>

              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Toys' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 text-sm font-sans font-medium rounded-xl transition-colors"
                  style={{ color: C.dark }}
                  onMouseEnter={e => e.currentTarget.style.background = C.goldMid}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {label}
                </Link>
              ))}

              <div className="px-3 py-2">
                <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-2" style={{ color: C.wood }}>
                  Shop by Age
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {AGE_GROUPS.map((age) => (
                    <Link key={age.param}
                      to={`/products?ageGroup=${encodeURIComponent(age.param)}`}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-sans font-medium"
                      style={{ background: C.sageMid, color: '#274336' }}
                      onClick={() => setIsOpen(false)}>
                      {age.emoji} {age.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: C.skinMid, margin: '4px 0' }} />

              <Link to="/refer-friend" onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-sans font-semibold rounded-xl"
                style={{ background: C.goldMid, color: C.wood }}>
                <FaGift style={{ color: C.gold }} /> Refer & Earn
              </Link>

              {isAuthenticated ? (
                <>
                  {['/profile', '/orders', '/wishlist', '/wallet'].map((path) => (
                    <Link key={path} to={path} onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 text-sm font-sans font-medium rounded-xl transition-colors"
                      style={{ color: C.dark }}>
                      {{'/profile':'My Profile','/orders':'My Orders','/wishlist':'My Wishlist','/wallet':'Wallet & Rewards'}[path]}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 text-sm font-sans font-medium rounded-xl"
                      style={{ color: C.dark }}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); navigate('/'); }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-sans font-medium rounded-xl"
                    style={{ color: C.terra }}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className="block text-center px-3 py-2.5 text-sm font-sans font-semibold rounded-xl"
                  style={{ background: C.dark, color: C.skin }}>
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
