import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaThLarge, FaTh, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';
import { setSEO, generateCollectionSchema, setStructuredData, PAGE_SEO } from '../utils/seo';

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

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    ageGroup: true,
    price: false,
    material: false,
    status: false,
  });

  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    ageGroup: '',
    material: '',
    inStock: false,
    featured: false,
    sale: false,
    search: '',
  });

  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid-4');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const ageGroups = [
    { label: '👶 0–6 Months',  value: '0-6 months' },
    { label: '🍼 6–12 Months', value: '6-12 months' },
    { label: '🧸 1–2 Years',   value: '1-2 years' },
    { label: '🎨 2–3 Years',   value: '2-3 years' },
    { label: '🚂 3–5 Years',   value: '3-5 years' },
    { label: '🎮 5–8 Years',   value: '5-8 years' },
    { label: '🔬 8–12 Years',  value: '8-12 years' },
    { label: '🎯 12+ Years',   value: '12+ years' },
    { label: '🌟 All Ages',    value: 'All Ages' },
  ];

  const materialTypes = ['Wood', 'Plastic', 'Fabric', 'Metal', 'Rubber', 'Foam', 'Electronic', 'Paper/Cardboard', 'Mixed'];

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      category:  params.get('category') || '',
      minPrice:  params.get('minPrice') || '',
      maxPrice:  params.get('maxPrice') || '',
      ageGroup:  params.get('ageGroup') || '',
      material:  params.get('material') || '',
      inStock:   params.get('inStock') === 'true',
      featured:  params.get('featured') === 'true',
      sale:      params.get('sale') === 'true',
      search:    params.get('search') || '',
    };
    setFilters(newFilters);
    setSortBy(params.get('sort') || 'default');
    setCurrentPage(parseInt(params.get('page')) || 1);
    if (params.get('minPrice') || params.get('maxPrice')) {
      setPriceRange([parseInt(params.get('minPrice')) || 0, parseInt(params.get('maxPrice')) || 10000]);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    const categoryName = categories.find(c => c._id === filters.category)?.name;
    let title = PAGE_SEO.products.title;
    let description = PAGE_SEO.products.description;
    let keywords = PAGE_SEO.products.keywords;
    let url = '/products';
    if (categoryName) {
      title = `Buy ${categoryName} Wooden Toys Online India`;
      description = `Shop ${categoryName} at Thrayam Toys — safe, non-toxic, handcrafted wooden toys with free shipping across India.`;
      keywords = [`${categoryName} wooden toys`, `buy ${categoryName} India`, 'wooden toys India', 'educational toys'];
      url = `/products?category=${filters.category}`;
    } else if (filters.ageGroup) {
      title = `Best Wooden Toys for ${filters.ageGroup} – Buy Online India`;
      description = `Explore age-appropriate wooden toys for ${filters.ageGroup}. Safe, non-toxic, Montessori-inspired toys at Thrayam Toys. Free shipping above ₹499.`;
      keywords = [`toys for ${filters.ageGroup}`, `wooden toys ${filters.ageGroup}`, 'age appropriate toys India', 'safe toys for babies'];
      url = `/products?ageGroup=${filters.ageGroup}`;
    } else if (filters.search) {
      title = `${filters.search} Toys – Shop Online India`;
      description = `Search results for "${filters.search}" at Thrayam Toys. Find safe, educational wooden toys for kids.`;
      url = `/products?search=${filters.search}`;
    } else if (filters.sale) {
      title = 'Wooden Toys on Sale – Best Deals Online India';
      description = 'Shop discounted wooden and educational toys at Thrayam Toys. Limited-time deals on safe, handcrafted toys for babies and toddlers.';
      keywords = ['wooden toys sale India', 'discounted toys', 'buy toys cheap India', 'toy deals'];
      url = '/products?sale=true';
    } else if (filters.featured) {
      title = 'Featured Wooden Toys – Bestsellers India';
      description = 'Explore our handpicked bestselling wooden toys. Premium quality, non-toxic, Montessori-inspired toys loved by 1000+ families.';
      keywords = ['best wooden toys India', 'bestseller toys', 'top rated wooden toys', 'Montessori toys bestseller'];
      url = '/products?featured=true';
    }
    setSEO({ title, description, keywords, url });
    if (products.length > 0) {
      setStructuredData(generateCollectionSchema({ name: categoryName || 'All Toys', description, _id: filters.category || 'all' }, products), 'products-collection-data');
    }
  }, [filters, categories, products]);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', limit);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);
      if (filters.material) params.append('material', filters.material);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.featured) params.append('featured', 'true');
      if (filters.search) params.append('search', filters.search);
      if (sortBy === 'price-asc') params.append('sort', 'price');
      else if (sortBy === 'price-desc') params.append('sort', '-price');
      else if (sortBy === 'newest') params.append('sort', '-createdAt');
      else if (sortBy === 'name') params.append('sort', 'name');
      if (filters.sale) {
        const { data } = await API.get(`/products?${params.toString()}`);
        const saleProducts = data.products.filter(p => p.discountPrice);
        setProducts(saleProducts);
        setTotalProducts(saleProducts.length);
      } else {
        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateURLParams = (newFilters, newSort, newPage) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.minPrice) params.append('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.append('maxPrice', newFilters.maxPrice);
    if (newFilters.ageGroup) params.append('ageGroup', newFilters.ageGroup);
    if (newFilters.material) params.append('material', newFilters.material);
    if (newFilters.inStock) params.append('inStock', 'true');
    if (newFilters.featured) params.append('featured', 'true');
    if (newFilters.sale) params.append('sale', 'true');
    if (newFilters.search) params.append('search', newFilters.search);
    if (newSort !== 'default') params.append('sort', newSort);
    if (newPage > 1) params.append('page', newPage);
    navigate(`/products?${params.toString()}`);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURLParams(newFilters, sortBy, 1);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
    const newFilters = { ...filters, minPrice: min > 0 ? min.toString() : '', maxPrice: max < 10000 ? max.toString() : '' };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURLParams(newFilters, sortBy, 1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    updateURLParams(filters, value, currentPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams(filters, sortBy, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const clearedFilters = { category: '', minPrice: '', maxPrice: '', ageGroup: '', material: '', inStock: false, featured: false, sale: false, search: '' };
    setFilters(clearedFilters);
    setPriceRange([0, 10000]);
    setSortBy('default');
    setCurrentPage(1);
    navigate('/products');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const totalPages = Math.ceil(totalProducts / limit);

  const gridClasses = {
    'grid-3': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
    'grid-4': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    'grid-5': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  const hasActiveFilters = filters.category || filters.ageGroup || filters.material || filters.minPrice || filters.maxPrice || filters.search || filters.inStock || filters.featured || filters.sale;

  /* ── Filter Section accordion ── */
  const FilterSection = ({ title, section, children }) => (
    <div style={{ borderBottom: `1px solid ${C.skinMid}` }}>
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 px-3 transition-colors"
        style={{ background: 'transparent' }}
      >
        <span className="font-sans font-semibold text-sm" style={{ color: C.dark }}>{title}</span>
        {expandedSections[section]
          ? <FaChevronUp style={{ color: C.wood, fontSize: 11 }} />
          : <FaChevronDown style={{ color: C.wood, fontSize: 11 }} />}
      </button>
      {expandedSections[section] && (
        <div className="pb-4 px-3">{children}</div>
      )}
    </div>
  );

  /* ── Sidebar filter content (shared desktop + mobile) ── */
  const FilterContent = () => (
    <div style={{ borderTop: `1px solid ${C.skinMid}` }}>
      {/* Age Group */}
      <FilterSection title="👶 Shop by Age" section="ageGroup">
        <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.skinBorder} transparent` }}>
          {ageGroups.map(age => (
            <button
              key={age.value}
              onClick={() => handleFilterChange('ageGroup', filters.ageGroup === age.value ? '' : age.value)}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-sans font-semibold transition-all duration-200"
              style={{
                background: filters.ageGroup === age.value ? C.terraMid : 'transparent',
                color: filters.ageGroup === age.value ? C.terra : C.wood,
              }}
              onMouseEnter={e => { if (filters.ageGroup !== age.value) e.currentTarget.style.background = C.skinMid; }}
              onMouseLeave={e => { if (filters.ageGroup !== age.value) e.currentTarget.style.background = 'transparent'; }}
            >
              {age.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="🧩 Categories" section="categories">
        <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.skinBorder} transparent` }}>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-sans font-semibold transition-all duration-200"
              style={{
                background: filters.category === cat._id ? C.terraMid : 'transparent',
                color: filters.category === cat._id ? C.terra : C.wood,
              }}
              onMouseEnter={e => { if (filters.category !== cat._id) e.currentTarget.style.background = C.skinMid; }}
              onMouseLeave={e => { if (filters.category !== cat._id) e.currentTarget.style.background = 'transparent'; }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="💰 Price Range" section="price">
        <div className="space-y-3">
          <input
            type="range" min="0" max="10000" step="100"
            value={priceRange[1]}
            onChange={e => handlePriceRangeChange(priceRange[0], parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: C.terra, background: C.skinMid }}
          />
          <div className="flex justify-between text-xs font-sans font-semibold" style={{ color: C.wood }}>
            <span>₹0</span><span>₹10,000</span>
          </div>
          <div className="text-center text-sm font-sans font-bold py-2 rounded-xl"
            style={{ background: C.terraMid, color: C.terra }}>
            ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { placeholder: 'Min', val: priceRange[0], onChange: e => handlePriceRangeChange(parseInt(e.target.value) || 0, priceRange[1]) },
              { placeholder: 'Max', val: priceRange[1], onChange: e => handlePriceRangeChange(priceRange[0], parseInt(e.target.value) || 10000) },
            ].map(({ placeholder, val, onChange }) => (
              <input
                key={placeholder}
                type="number" value={val} onChange={onChange} placeholder={placeholder}
                className="px-3 py-2 rounded-xl text-sm font-sans font-semibold focus:outline-none"
                style={{ background: C.skinLight, border: `1.5px solid ${C.skinBorder}`, color: C.dark }}
              />
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Material */}
      <FilterSection title="🪵 Material" section="material">
        <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.skinBorder} transparent` }}>
          {materialTypes.map(mat => (
            <button
              key={mat}
              onClick={() => handleFilterChange('material', filters.material === mat ? '' : mat)}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-sans font-semibold transition-all duration-200"
              style={{
                background: filters.material === mat ? C.sageMid : 'transparent',
                color: filters.material === mat ? C.sageDark : C.wood,
              }}
              onMouseEnter={e => { if (filters.material !== mat) e.currentTarget.style.background = C.skinMid; }}
              onMouseLeave={e => { if (filters.material !== mat) e.currentTarget.style.background = 'transparent'; }}
            >
              {mat}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Status */}
      <FilterSection title="✨ Status" section="status">
        <div className="space-y-2">
          {[
            { key: 'inStock',  label: '✅ In Stock' },
            { key: 'featured', label: '⭐ Featured' },
            { key: 'sale',     label: '🏷️ On Sale' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: filters[key] ? C.terra : C.skinLight,
                  border: `1.5px solid ${filters[key] ? C.terra : C.skinBorder}`,
                }}
                onClick={() => handleFilterChange(key, !filters[key])}
              >
                {filters[key] && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="font-sans text-sm font-semibold" style={{ color: C.wood }}
                onClick={() => handleFilterChange(key, !filters[key])}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: C.skin }}>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{ background: C.dark }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: C.wood, opacity: 0.3, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: C.sage, opacity: 0.08, transform: 'translate(-30%, 30%)' }} />

        <div className="relative container-custom py-10 md:py-14 text-center z-10">
          <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ background: `${C.gold}20`, color: C.gold, border: `1px solid ${C.gold}40` }}>
            Thrayam Toys Collection
          </span>
          <h1 className="font-serif mb-2" style={{ color: C.skin, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Shop All Toys
          </h1>
          <p className="font-sans text-sm" style={{ color: `${C.skinMid}CC` }}>
            Safe, fun &amp; educational toys for every age
          </p>
          {(filters.ageGroup || filters.category) && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-sans font-semibold text-sm"
              style={{ background: `${C.terra}22`, color: C.terraMid, border: `1px solid ${C.terra}40` }}>
              Browsing: {filters.ageGroup || categories.find(c => c._id === filters.category)?.name}
            </div>
          )}
        </div>

        {/* Wave divider */}
        <div className="leading-none">
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: 40 }}>
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill={C.skin} />
          </svg>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">

          {/* ── Desktop Sidebar ── */}
          <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${showDesktopFilters ? 'w-68' : 'w-0 overflow-hidden'}`}
            style={{ width: showDesktopFilters ? 264 : 0 }}>
            <div className="sticky top-24 rounded-2xl overflow-hidden"
              style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}`, boxShadow: '0 4px 20px rgba(47,30,20,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-3.5"
                style={{ background: C.skinMid, borderBottom: `1px solid ${C.skinBorder}` }}>
                <h2 className="font-sans font-bold text-sm flex items-center gap-2" style={{ color: C.dark }}>
                  <FaFilter style={{ fontSize: 11, color: C.wood }} /> Filters
                </h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1 font-sans font-semibold text-xs transition-colors"
                    style={{ color: C.terra }}>
                    <FaTimes style={{ fontSize: 10 }} /> Clear All
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-2xl"
              style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 10px rgba(47,30,20,0.06)' }}>

              <div className="flex items-center gap-3">
                {/* Desktop Filter Toggle */}
                <button
                  onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all duration-200"
                  style={{
                    background: showDesktopFilters ? C.dark : C.skinMid,
                    color: showDesktopFilters ? C.skin : C.dark,
                    border: `1.5px solid ${showDesktopFilters ? C.dark : C.skinBorder}`,
                  }}>
                  <FaFilter style={{ fontSize: 11 }} />
                  {showDesktopFilters ? 'Hide' : 'Filters'}
                </button>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all"
                  style={{ background: C.skinMid, color: C.dark, border: `1.5px solid ${C.skinBorder}` }}>
                  <FaFilter style={{ fontSize: 11 }} /> Filters
                </button>

                <div className="hidden sm:block w-px h-5" style={{ background: C.skinBorder }} />

                <p className="font-sans text-sm font-semibold" style={{ color: C.wood }}>
                  <span className="font-bold" style={{ color: C.terra }}>{totalProducts}</span>
                  <span className="hidden sm:inline"> toys found</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Grid view toggles */}
                <div className="hidden md:flex items-center gap-0.5 p-1 rounded-xl"
                  style={{ background: C.skinMid }}>
                  {[
                    { mode: 'grid-3', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/></svg>, title: '3 columns' },
                    { mode: 'grid-4', icon: <FaThLarge />, title: '4 columns' },
                    { mode: 'grid-5', icon: <FaTh />, title: '5 columns' },
                  ].map(({ mode, icon, title }) => (
                    <button key={mode} onClick={() => setViewMode(mode)} title={title}
                      className="p-2 rounded-lg transition-all duration-150"
                      style={{
                        background: viewMode === mode ? C.skinLight : 'transparent',
                        color: viewMode === mode ? C.terra : C.wood,
                        boxShadow: viewMode === mode ? '0 1px 4px rgba(47,30,20,0.10)' : 'none',
                      }}>
                      {icon}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => handleSortChange(e.target.value)}
                  className="px-4 py-2 rounded-xl font-sans font-semibold text-sm focus:outline-none cursor-pointer transition-colors"
                  style={{ background: C.skinLight, border: `1.5px solid ${C.skinBorder}`, color: C.dark }}>
                  <option value="default">Default sorting</option>
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-2xl"
                style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}` }}>
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest" style={{ color: C.wood }}>Active:</span>
                {[
                  filters.search    && { label: `🔍 ${filters.search}`,    onRemove: () => handleFilterChange('search', '') },
                  filters.ageGroup  && { label: `👶 ${filters.ageGroup}`,  onRemove: () => handleFilterChange('ageGroup', '') },
                  filters.category  && { label: `🧩 ${categories.find(c => c._id === filters.category)?.name}`, onRemove: () => handleFilterChange('category', '') },
                  filters.material  && { label: `🪵 ${filters.material}`,  onRemove: () => handleFilterChange('material', '') },
                  (filters.minPrice || filters.maxPrice) && { label: `💰 ₹${filters.minPrice || 0} – ₹${filters.maxPrice || '10,000'}`, onRemove: () => handlePriceRangeChange(0, 10000) },
                  filters.inStock   && { label: '✅ In Stock',              onRemove: () => handleFilterChange('inStock', false) },
                  filters.featured  && { label: '⭐ Featured',              onRemove: () => handleFilterChange('featured', false) },
                  filters.sale      && { label: '🏷️ On Sale',               onRemove: () => handleFilterChange('sale', false) },
                ].filter(Boolean).map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-semibold"
                    style={{ background: C.terraMid, color: C.terra, border: `1px solid ${C.terra}30` }}>
                    {f.label}
                    <button onClick={f.onRemove} className="transition-opacity hover:opacity-70">
                      <FaTimes style={{ fontSize: 9 }} />
                    </button>
                  </span>
                ))}
                <button onClick={clearFilters}
                  className="font-sans text-xs font-bold transition-colors ml-auto"
                  style={{ color: C.wood }}>
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className={`grid ${gridClasses[viewMode]} gap-4`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-2xl mb-3" style={{ background: C.skinMid }} />
                    <div className="h-3 rounded-full w-3/4 mb-2" style={{ background: C.skinMid }} />
                    <div className="h-3 rounded-full w-1/2" style={{ background: C.skinMid }} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid ${gridClasses[viewMode]} gap-4`}>
                  {products.map(product => <ProductCard key={product._id} product={product} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ color: C.wood }}
                      onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.background = C.skinMid; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Previous
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button key={i} onClick={() => handlePageChange(pageNum)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl font-sans font-bold text-sm transition-all duration-200"
                          style={{
                            background: currentPage === pageNum ? C.dark : 'transparent',
                            color: currentPage === pageNum ? C.skin : C.wood,
                            border: currentPage === pageNum ? `1.5px solid ${C.dark}` : `1.5px solid transparent`,
                          }}
                          onMouseEnter={e => { if (currentPage !== pageNum) e.currentTarget.style.background = C.skinMid; }}
                          onMouseLeave={e => { if (currentPage !== pageNum) e.currentTarget.style.background = 'transparent'; }}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl font-sans font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ color: C.wood }}
                      onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.background = C.skinMid; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 rounded-3xl"
                style={{ background: C.skinLight, border: `1.5px solid ${C.skinMid}` }}>
                <span className="text-6xl block mb-4">🧸</span>
                <h3 className="font-serif text-xl mb-2" style={{ color: C.dark }}>No toys found</h3>
                <p className="font-sans text-sm mb-6" style={{ color: C.wood }}>Try adjusting your filters or explore all toys</p>
                <button onClick={clearFilters}
                  className="font-sans font-bold px-8 py-3 rounded-xl transition-all duration-200"
                  style={{ background: C.terra, color: '#fff', boxShadow: '0 4px 16px rgba(201,106,74,0.35)' }}>
                  Browse All Toys
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(47,30,20,0.5)' }}
            onClick={() => setShowMobileFilters(false)} />
          <div className="fixed top-0 left-0 h-full w-80 max-w-full z-50 lg:hidden overflow-y-auto"
            style={{ background: C.skinLight }}>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
              style={{ background: C.dark, borderBottom: `1px solid ${C.wood}` }}>
              <h2 className="font-sans font-bold text-base flex items-center gap-2" style={{ color: C.skin }}>
                <FaFilter style={{ fontSize: 12, color: C.gold }} /> Filter Toys
              </h2>
              <button onClick={() => setShowMobileFilters(false)} style={{ color: C.skinMid }}>
                <FaTimes style={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="p-4">
              <FilterContent />
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 flex gap-3 p-4"
              style={{ background: C.skinLight, borderTop: `1px solid ${C.skinMid}` }}>
              <button onClick={clearFilters}
                className="flex-1 px-4 py-3 rounded-xl font-sans font-bold text-sm transition-all"
                style={{ background: C.skinMid, color: C.dark, border: `1.5px solid ${C.skinBorder}` }}>
                Clear All
              </button>
              <button onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-3 rounded-xl font-sans font-bold text-sm transition-all"
                style={{ background: C.terra, color: '#fff', boxShadow: '0 4px 14px rgba(201,106,74,0.35)' }}>
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
