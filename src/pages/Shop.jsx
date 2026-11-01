import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { CURRENCY, formatMoney } from '../lib/currency';
import { toStoreProduct } from '../lib/productMapper';
import {
  FiGrid, FiList, FiChevronRight, FiChevronLeft, FiSearch, FiX, FiStar,
  FiShoppingCart, FiSliders, FiCheck,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { PackageSearch } from 'lucide-react';
import { useCart } from '../context/CartContext';
import fallbackProducts from '../data/products';

/* ---------- helpers ---------- */
// Currency: Rwandan franc. Amounts are shown exactly as stored in your product data.
const CATEGORY_LABELS = { audio: 'TVs & Audio', appliances: 'Home Appliances' };
const labelFor = (key) =>
  CATEGORY_LABELS[key] || key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const normalize = (v) => String(v ?? '').trim().toLowerCase();

const SORTS = [
  { value: 'default', label: 'Default sorting' },
  { value: 'popularity', label: 'Most popular' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
];

const discountPct = (p) =>
  p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

const Stars = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
    {[...Array(5)].map((_, i) => (
      <FiStar key={i} className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-current text-[#FFB020]' : 'text-gray-300'}`} />
    ))}
  </div>
);

/* ---------- product card (grid + list) ---------- */
const ShopCard = ({ product, view, onAdd, onWhatsapp }) => {
  const pct = discountPct(product);
  const isList = view === 'list';
  const badge =
    product.badge === 'BESTSELLER' ? { label: 'Bestseller', cls: 'bg-[#0B1B33]' }
    : product.badge === 'HOT' ? { label: 'Hot', cls: 'bg-red-500' }
    : product.badge === 'NEW' ? { label: 'New', cls: 'bg-emerald-500' }
    : null;

  return (
    <article
      className={`group rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-orange-200 hover:shadow-[0_14px_34px_-14px_rgba(11,27,51,0.2)] sm:p-3.5 ${isList ? 'flex flex-col gap-4 sm:flex-row sm:gap-5' : 'flex flex-col'}`}
    >
      <Link
        to={`/product/${product.id}`}
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F7F9] ${isList ? 'h-44 w-full sm:h-48 sm:w-56' : 'mb-3 h-44 sm:h-48'}`}
      >
        {badge && <span className={`absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white ${badge.cls}`}>{badge.label}</span>}
        {pct > 0 && <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white px-2 py-1 text-[10.5px] font-bold text-red-600 shadow-sm">-{pct}%</span>}
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {product.category && (
          <span className="mb-1 text-[11.5px] font-semibold text-[#FF6C00]">{labelFor(normalize(product.category))}</span>
        )}
        <Link to={`/product/${product.id}`} className={`font-semibold leading-snug text-[#0B1B33] transition-colors hover:text-[#FF6C00] ${isList ? 'text-[16px]' : 'line-clamp-2 min-h-[2.5rem] text-[14px]'}`}>
          {product.name}
        </Link>

        {isList && product.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-gray-500">{product.description}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <Stars rating={product.rating} />
          {product.rating ? <span className="text-[11.5px] text-gray-400">{product.rating}</span> : null}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[19px] font-extrabold text-[#0B1B33]">{formatMoney(product.price)}</span>
          {pct > 0 && <span className="text-[12.5px] text-gray-400 line-through">{formatMoney(product.oldPrice)}</span>}
        </div>

        <div className={`mt-3 flex gap-2 ${isList ? 'max-w-[360px]' : ''} ${isList ? '' : 'mt-auto pt-1'}`}>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B1B33] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#FF6C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00]"
          >
            <FiShoppingCart className="h-4 w-4" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add to cart</span>
          </button>
          <button
            type="button"
            onClick={() => onWhatsapp(product)}
            aria-label="Order on WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#1DA851] transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <FaWhatsapp className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
};

/* ---------- page ---------- */
const Shop = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(fallbackProducts);
  const [categories, setCategories] = useState([]);

  const category = normalize(searchParams.get('category'));
  const urlSearch = searchParams.get('search') || '';

  useEffect(() => {
    let active = true;

    api
      .get('/products', { params: { limit: 200 } })
      .then(({ data }) => {
        if (active && data.products?.length) {
          setProducts(data.products.map(toStoreProduct));
        }
      })
      .catch(() => {});

    api
      .get('/settings/categories')
      .then(({ data }) => {
        if (active) setCategories(data.categories || []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Slider range + step adapt to the size of your prices (FRW amounts are large).
  const { maxPrice, priceStep } = useMemo(() => {
    const highest = Math.max(0, ...products.map((p) => Number(p.price) || 0));
    const step = highest >= 100000 ? 1000 : highest >= 10000 ? 100 : 10;
    return { maxPrice: Math.max(step * 10, Math.ceil(highest / step) * step), priceStep: step };
  }, [products]);

  const [searchText, setSearchText] = useState(urlSearch);
  const [price, setPrice] = useState([0, maxPrice]);
  const [brandsSel, setBrandsSel] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sort, setSort] = useState('default');
  const [view, setView] = useState('grid');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setPrice([0, maxPrice]);
  }, [maxPrice]);

  useEffect(() => setSearchText(urlSearch), [urlSearch]);

  /* derived option lists */
  const categoryOptions = useMemo(() => {
    if (categories.length) {
      const counts = products.reduce((acc, p) => {
        const key = normalize(p.category);
        if (key) acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      return categories.map((cat) => ({
        key: cat.slug,
        count: counts[cat.slug] || 0,
        label: cat.name,
      }));
    }

    const map = new Map();
    products.forEach((p) => {
      const key = normalize(p.category);
      if (key) map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([key, count]) => ({ key, count, label: labelFor(key) }));
  }, [products, categories]);

  const brandOptions = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.brand) map.set(p.brand, (map.get(p.brand) || 0) + 1);
    });
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [products]);

  /* filtering + sorting */
  const filtered = useMemo(() => {
    const q = normalize(urlSearch);
    let list = products.filter((p) => {
      if (category && normalize(p.category) !== category) return false;
      if (q && !normalize(`${p.name} ${p.brand ?? ''} ${p.category ?? ''}`).includes(q)) return false;
      const pr = Number(p.price) || 0;
      if (pr < price[0] || pr > price[1]) return false;
      if (brandsSel.length && !brandsSel.includes(p.brand)) return false;
      if (minRating && (p.rating || 0) < minRating) return false;
      if (onlyDeals && discountPct(p) === 0) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === 'popularity') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'newest') sorted.sort((a, b) => b.id - a.id);
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'discount') sorted.sort((a, b) => discountPct(b) - discountPct(a));
    return sorted;
  }, [products, category, urlSearch, price, brandsSel, minRating, onlyDeals, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  useEffect(() => setPage(1), [category, urlSearch, price, brandsSel, minRating, onlyDeals, sort, pageSize]);

  /* handlers */
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setParam('search', searchText.trim());
  };

  const toggleBrand = (name) =>
    setBrandsSel((prev) => (prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]));

  const clearAll = () => {
    setSearchParams({}, { replace: true });
    setSearchText('');
    setPrice([0, maxPrice]);
    setBrandsSel([]);
    setMinRating(0);
    setOnlyDeals(false);
  };

  const handleWhatsapp = (product) => {
    const url = `${window.location.origin}/product/${product.id}`;
    const msg = `Hi! I'm interested in: ${product.name} - Price: ${formatMoney(product.price)}. Please provide more details. ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const activeChips = [
    category && { key: 'category', label: labelFor(category), clear: () => setParam('category', '') },
    urlSearch && { key: 'search', label: `"${urlSearch}"`, clear: () => setParam('search', '') },
    (price[0] > 0 || price[1] < maxPrice) && { key: 'price', label: `${formatMoney(price[0])} – ${formatMoney(price[1])}`, clear: () => setPrice([0, maxPrice]) },
    ...brandsSel.map((b) => ({ key: `brand-${b}`, label: b, clear: () => toggleBrand(b) })),
    minRating > 0 && { key: 'rating', label: `${minRating}★ & up`, clear: () => setMinRating(0) },
    onlyDeals && { key: 'deals', label: 'On sale', clear: () => setOnlyDeals(false) },
  ].filter(Boolean);

  /* ---------- filter panel (used in sidebar + mobile drawer) ---------- */
  const renderFilters = () => (
    <div className="space-y-4">
      {/* Categories */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-[14px] font-extrabold text-[#0B1B33]">Categories</h3>
        <ul className="p-2">
          {[{ key: '', label: 'All products', count: products.length }, ...categoryOptions].map((c) => {
            const active = category === c.key;
            return (
              <li key={c.key || 'all'}>
                <button
                  type="button"
                  onClick={() => setParam('category', c.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors ${active ? 'bg-orange-50 text-[#FF6C00]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#FF6C00]'}`}
                >
                  <span>{c.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-[#FF6C00] text-white' : 'bg-gray-100 text-gray-500'}`}>{c.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Price */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-[14px] font-extrabold text-[#0B1B33]">Price range</h3>
        <div className="p-4">
          <input
            type="range"
            min="0"
            max={maxPrice}
            step={priceStep}
            value={price[1]}
            onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value), price[0])])}
            aria-label="Maximum price"
            className="w-full accent-[#FF6C00]"
          />
          <div className="mt-3 flex items-center gap-2">
            <label className="flex-1">
              <span className="sr-only">Minimum price</span>
              <div className="flex items-center rounded-lg border-2 border-gray-200 px-3 focus-within:border-[#FF6C00]">
                <span className="text-[12px] font-semibold text-gray-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  value={price[0]}
                  onChange={(e) => setPrice([Math.min(Number(e.target.value) || 0, price[1]), price[1]])}
                  className="w-full bg-transparent py-2 pl-1 text-[13.5px] font-semibold text-[#0B1B33] focus:outline-none"
                />
              </div>
            </label>
            <span className="text-gray-300">–</span>
            <label className="flex-1">
              <span className="sr-only">Maximum price</span>
              <div className="flex items-center rounded-lg border-2 border-gray-200 px-3 focus-within:border-[#FF6C00]">
                <span className="text-[12px] font-semibold text-gray-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  value={price[1]}
                  onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value) || 0, price[0])])}
                  className="w-full bg-transparent py-2 pl-1 text-[13.5px] font-semibold text-[#0B1B33] focus:outline-none"
                />
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Brands (only if data has brands) */}
      {brandOptions.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-[14px] font-extrabold text-[#0B1B33]">Brands</h3>
          <ul className="max-h-60 space-y-0.5 overflow-y-auto p-2">
            {brandOptions.map((b) => (
              <li key={b.name}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={brandsSel.includes(b.name)}
                    onChange={() => toggleBrand(b.name)}
                    className="h-[18px] w-[18px] rounded border-gray-300 text-[#FF6C00] focus:ring-[#FF6C00]"
                  />
                  <span className="flex-1 text-[13.5px] font-medium text-gray-700">{b.name}</span>
                  <span className="text-[11.5px] text-gray-400">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Rating + deals */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-[14px] font-extrabold text-[#0B1B33]">Customer rating</h3>
        <ul className="p-2">
          {[4, 3, 0].map((r) => (
            <li key={r}>
              <button
                type="button"
                onClick={() => setMinRating(r)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${minRating === r ? 'bg-orange-50 text-[#FF6C00]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {r > 0 ? (
                  <>
                    <Stars rating={r} />
                    <span>& up</span>
                  </>
                ) : (
                  <span>Any rating</span>
                )}
                {minRating === r && <FiCheck className="ml-auto h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
        <label className="flex cursor-pointer items-center justify-between border-t border-gray-100 px-4 py-3">
          <span className="text-[13.5px] font-semibold text-[#0B1B33]">On sale only</span>
          <span className="relative inline-flex h-6 w-11 items-center">
            <input type="checkbox" checked={onlyDeals} onChange={(e) => setOnlyDeals(e.target.checked)} className="peer sr-only" />
            <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#FF6C00] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6C00]/40" />
            <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </section>

      {activeChips.length > 0 && (
        <button type="button" onClick={clearAll} className="w-full rounded-xl border-2 border-[#FF6C00] py-2.5 text-[13.5px] font-bold text-[#FF6C00] transition-colors hover:bg-[#FF6C00] hover:text-white">
          Clear all filters
        </button>
      )}
    </div>
  );

  /* pagination numbers */
  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '…') pages.push('…');
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F4F6]" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ---------- Page banner ---------- */}
      <div className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <FiChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-white">Shop</span>
            {category && (
              <>
                <FiChevronRight className="h-3.5 w-3.5" />
                <span className="font-semibold text-[#FF9A4D]">{labelFor(category)}</span>
              </>
            )}
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-extrabold tracking-tight text-white sm:text-[36px]">
                {category ? labelFor(category) : 'Shop all products'}
              </h1>
              <p className="mt-1 text-[14px] text-white/65">
                Genuine electronics and home appliances with warranty and fast delivery.
              </p>
            </div>
            <form onSubmit={submitSearch} role="search" className="flex h-11 w-full max-w-[380px] items-center overflow-hidden rounded-xl bg-white">
              <FiSearch className="ml-4 h-[18px] w-[18px] shrink-0 text-[#FF6C00]" />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search in shop"
                aria-label="Search in shop"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[#0B1B33] placeholder-gray-400 focus:outline-none"
              />
              <button type="submit" className="h-full bg-[#FF6C00] px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-[#E65C00]">Search</button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* ---------- Sidebar (desktop) ---------- */}
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <div className="sticky top-[170px]">{renderFilters()}</div>
          </aside>

          {/* ---------- Main ---------- */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#0B1B33] px-4 py-2.5 text-[13px] font-bold text-white lg:hidden"
                >
                  <FiSliders className="h-4 w-4" /> Filters
                  {activeChips.length > 0 && <span className="rounded-full bg-[#FF6C00] px-1.5 text-[11px]">{activeChips.length}</span>}
                </button>
                <p className="text-[13.5px] text-gray-600">
                  {filtered.length === 0 ? (
                    'No results'
                  ) : (
                    <>
                      Showing <b className="text-[#0B1B33]">{start + 1}–{Math.min(start + pageSize, filtered.length)}</b> of{' '}
                      <b className="text-[#0B1B33]">{filtered.length}</b> products
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                  className="h-10 rounded-xl border-2 border-gray-200 bg-white px-3 text-[13px] font-semibold text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
                >
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Products per page"
                  className="hidden h-10 rounded-xl border-2 border-gray-200 bg-white px-3 text-[13px] font-semibold text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none sm:block"
                >
                  {[12, 24, 48].map((n) => <option key={n} value={n}>Show {n}</option>)}
                </select>
                <div className="flex rounded-xl bg-gray-100 p-1" role="group" aria-label="View mode">
                  {[{ v: 'grid', icon: FiGrid, label: 'Grid view' }, { v: 'list', icon: FiList, label: 'List view' }].map(({ v, icon: Icon, label }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-label={label}
                      aria-pressed={view === v}
                      className={`flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${view === v ? 'bg-[#FF6C00] text-white shadow' : 'text-gray-500 hover:text-[#FF6C00]'}`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="group flex items-center gap-1.5 rounded-full bg-orange-50 py-1.5 pl-3 pr-2 text-[12.5px] font-semibold text-[#C74F00] ring-1 ring-orange-200 transition-colors hover:bg-[#FF6C00] hover:text-white"
                  >
                    {chip.label}
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-1 text-[12.5px] font-semibold text-gray-500 underline-offset-2 hover:text-[#FF6C00] hover:underline">
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {visible.length > 0 ? (
              <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'flex flex-col gap-4'}>
                {visible.map((product) => (
                  <ShopCard key={product.id} product={product} view={view} onAdd={addToCart} onWhatsapp={handleWhatsapp} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00]">
                  <PackageSearch className="h-8 w-8" strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 text-[18px] font-extrabold text-[#0B1B33]">No products found</h3>
                <p className="mt-1 max-w-[340px] text-[14px] text-gray-500">Try removing a filter or searching for something else.</p>
                <button type="button" onClick={clearAll} className="mt-5 rounded-xl bg-[#FF6C00] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#E65C00]">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                {pageNumbers.map((n, i) =>
                  n === '…' ? (
                    <span key={`dots-${i}`} className="px-1 text-gray-400">…</span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === currentPage ? 'page' : undefined}
                      className={`h-10 min-w-[40px] rounded-xl px-3 text-[13.5px] font-bold transition-colors ${n === currentPage ? 'bg-[#FF6C00] text-white shadow-md shadow-orange-500/30' : 'border border-gray-200 bg-white text-gray-700 hover:border-[#FF6C00] hover:text-[#FF6C00]'}`}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Mobile filter drawer ---------- */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-[#0B1B33]/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-[360px] flex-col bg-[#F3F4F6] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <h2 className="text-[17px] font-extrabold text-[#0B1B33]">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{renderFilters()}</div>
            <div className="border-t border-gray-200 bg-white p-4">
              <button type="button" onClick={() => setFiltersOpen(false)} className="w-full rounded-xl bg-[#FF6C00] py-3 text-[14px] font-bold text-white">
                Show {filtered.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;