import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiZap, FiShare2, FiX, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaTelegram } from 'react-icons/fa';
import {
  Tv, WashingMachine, Refrigerator, CookingPot, Speaker, Blend, Flame, House,
  Headphones, ChevronRight, ChevronLeft, LayoutGrid, ArrowRight,
  Truck, RotateCcw, ShieldCheck, Gift, Sparkles, MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import products, { formatPrice, getDiscountedProducts } from '../data/products';

/* ---------- Design tokens ---------- */
const BRAND = '#FF6C00';
const BRAND_DARK = '#E65C00';
const INK = '#0B1B33';

/* ---------- Small reusable pieces ---------- */
const SectionHeader = ({ icon: Icon, title, subtitle, action, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      )}
      <div>
        <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-[#0B1B33] sm:text-[26px]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
    {children}
    {action && (
      <Link to={action.to} className="group inline-flex items-center gap-1 text-[13px] font-semibold text-[#FF6C00] hover:text-[#E65C00]">
        {action.label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

const Stars = ({ rating = 0, size = 'h-3.5 w-3.5' }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <FiStar key={i} className={`${size} ${i < Math.floor(rating) ? 'fill-current text-[#FFB020]' : 'text-gray-300'}`} />
    ))}
  </div>
);

const ProductCard = ({ product, onAdd, onWhatsapp, onShare, badge }) => {
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const pct = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  return (
    <article className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-3.5 transition-all duration-200 hover:border-orange-200 hover:shadow-[0_12px_32px_-12px_rgba(11,27,51,0.18)]">
      <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[#F6F7F9]">
        {badge && (
          <span className={`absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${badge.cls}`}>{badge.label}</span>
        )}
        {hasDiscount && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-red-600 shadow-sm">-{pct}%</span>
        )}
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
        <button
          type="button"
          onClick={() => onShare(product)}
          aria-label={`Share ${product.name}`}
          className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 opacity-0 shadow-md transition-all hover:text-[#FF6C00] group-hover:opacity-100 focus:opacity-100"
        >
          <FiShare2 className="h-4 w-4" />
        </button>
      </div>

      <Link to={`/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-[13.5px] font-semibold leading-snug text-[#0B1B33] transition-colors hover:text-[#FF6C00]">
        {product.name}
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <Stars rating={product.rating} />
        {product.rating && <span className="text-[11px] text-gray-400">{product.rating}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[18px] font-extrabold text-[#0B1B33]">${Number(product.price).toFixed(2)}</span>
        {hasDiscount && <span className="text-[12px] text-gray-400 line-through">${Number(product.oldPrice).toFixed(2)}</span>}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B1B33] py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#FF6C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00]"
        >
          <FiShoppingCart className="h-4 w-4" /> Add to cart
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
    </article>
  );
};

/* ---------- Page ---------- */
const Home = () => {
  const [activeTab, setActiveTab] = useState('BESTSELLERS');
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });
  const [heroSlide, setHeroSlide] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareProduct, setShareProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useCart();

  /* --- Handlers --- */
  const handleAddToCart = (product) => addToCart(product);

  const handleBuyOnWhatsapp = (product) => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const message = `Hi! I'm interested in: ${product.name} - Price: $${product.price}. Please provide more details. ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareProduct = (product) => {
    setShareProduct(product);
    setCopied(false);
    setShowShareModal(true);
  };

  const getProductUrl = () => (shareProduct ? `${window.location.origin}/product/${shareProduct.id}` : '');
  const shareText = () => encodeURIComponent(`Check out ${shareProduct?.name ?? ''}`);
  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductUrl())}`, '_blank');
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getProductUrl())}&text=${shareText()}`, '_blank');
  const shareOnLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getProductUrl())}`, '_blank');
  const shareOnTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(getProductUrl())}&text=${shareText()}`, '_blank');
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  /* --- Countdown --- */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* --- Data --- */
  const sidebarCategories = [
    { name: 'Smart TVs', link: '/shop?category=audio', icon: Tv },
    { name: 'Washing Machines', link: '/shop?category=appliances', icon: WashingMachine },
    { name: 'Fridges & Freezers', link: '/shop?category=appliances', icon: Refrigerator },
    { name: 'Cooking Machines', link: '/shop?category=appliances', icon: CookingPot },
    { name: 'Radio & Speakers', link: '/shop?category=audio', icon: Speaker },
    { name: 'Blenders', link: '/shop?category=appliances', icon: Blend },
    { name: 'Kettles & Jiko', link: '/shop?category=appliances', icon: Flame },
    { name: 'Home Essentials', link: '/shop', icon: House },
  ];

  const heroSlides = useMemo(() => {
    const pick = (id) => products.find((p) => p.id === id) || products[0];
    const pctOf = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
    const tv = pick(13);
    const fridge = pick(23);
    const speaker = pick(3);
    return [
      {
        tag: 'Limited offer',
        title: tv.name,
        highlight: 'Cinema-sized 4K for your living room',
        desc: tv.description,
        rating: tv.rating,
        reviews: '2,480 reviews',
        price: formatPrice(tv.price),
        oldPrice: tv.oldPrice ? formatPrice(tv.oldPrice) : null,
        pct: pctOf(tv),
        cta: 'Shop this TV',
        link: `/product/${tv.id}`,
        image: tv.image,
        bg: 'from-[#FFF3E6] via-[#FFE6D0] to-[#FFD5B0]',
        thumbLabel: 'TV deals',
      },
      {
        tag: 'New arrival',
        title: fridge.name,
        highlight: 'Premium cooling for a modern kitchen',
        desc: fridge.description,
        rating: fridge.rating,
        reviews: '1,920 reviews',
        price: formatPrice(fridge.price),
        oldPrice: fridge.oldPrice ? formatPrice(fridge.oldPrice) : null,
        pct: pctOf(fridge),
        cta: 'Shop refrigerators',
        link: `/product/${fridge.id}`,
        image: fridge.image,
        bg: 'from-[#EEF5FF] via-[#DFEBFF] to-[#CBDDFF]',
        thumbLabel: 'Home appliances',
      },
      {
        tag: 'Audio week',
        title: speaker.name,
        highlight: 'Immersive sound, zero compromise',
        desc: speaker.description,
        rating: speaker.rating,
        reviews: '3,110 reviews',
        price: formatPrice(speaker.price),
        oldPrice: speaker.oldPrice ? formatPrice(speaker.oldPrice) : null,
        pct: pctOf(speaker),
        cta: 'Shop audio',
        link: `/product/${speaker.id}`,
        image: speaker.image,
        bg: 'from-[#F4F0FF] via-[#E9E2FF] to-[#D9CEFF]',
        thumbLabel: 'Audio',
      },
    ];
  }, []);

  useEffect(() => {
    const slider = setInterval(() => setHeroSlide((p) => (p + 1) % heroSlides.length), 7000);
    return () => clearInterval(slider);
  }, [heroSlide, heroSlides.length]);

  const brands = ['Hisense', 'LG', 'Samsung', 'Haier', 'SPJ', 'Sayona', 'KING'];

  const featured = products.filter((item) => item.featured);
  const tabbedProducts = useMemo(() => {
    let list = featured;
    if (activeTab === 'BESTSELLERS') list = featured.filter((p) => p.badge === 'BESTSELLER');
    if (activeTab === 'TRENDING') list = featured.filter((p) => p.badge === 'HOT' || p.badge === 'SALE');
    if (list.length < 4) list = featured; // fall back so the grid is never empty
    return list.slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const badgeFor = (p) => {
    if (p.badge === 'BESTSELLER') return { label: 'Bestseller', cls: 'bg-[#0B1B33]' };
    if (p.badge === 'HOT') return { label: 'Hot', cls: 'bg-red-500' };
    if (p.badge === 'NEW' || p.badge === 'SALE') return { label: 'New', cls: 'bg-emerald-500' };
    return null;
  };

  const dealOfTheDay = {
    ...(products.find((item) => item.id === 24) || products[0]),
    sold: 156,
    available: 44,
  };
  const dealPct = dealOfTheDay.oldPrice
    ? Math.round(((dealOfTheDay.oldPrice - dealOfTheDay.price) / dealOfTheDay.oldPrice) * 100)
    : 0;
  const flashSaleProducts = getDiscountedProducts().slice(0, 4);
  const newArrivals = products.slice(-6);

  const heroBanners = useMemo(() => {
    const pick = (id) => products.find((p) => p.id === id) || products[0];
    const a = pick(11);
    const b = pick(16);
    return [
      { tag: 'Up to 40% off', title: 'Smart TV deals', sub: 'Big screens, sharper picture', cta: 'Shop TVs', link: `/product/${a.id}`, image: a.image, overlay: 'from-[#FF7A1A]/95 via-[#E85D04]/85 to-[#B84500]/70' },
      { tag: 'Free delivery', title: 'Home appliances', sub: 'Upgrade your kitchen today', cta: 'Shop now', link: `/product/${b.id}`, image: b.image, overlay: 'from-[#0B1B33]/95 via-[#16315C]/85 to-[#1E4F8F]/70' },
    ];
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ================= HERO ================= */}
        <div className="mb-8 grid grid-cols-1 gap-3 lg:h-[460px] lg:grid-cols-12">

          {/* ---- Sidebar ---- */}
          <aside className="hidden flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_20px_-8px_rgba(11,27,51,0.12)] lg:col-span-3 lg:flex">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-4 py-3.5 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <LayoutGrid className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <h3 className="text-[15px] font-extrabold">All categories</h3>
                <p className="text-[11px] text-white/80">Find what you need</p>
              </div>
            </div>

            <ul className="flex flex-1 flex-col px-2 py-1.5">
              {sidebarCategories.map((cat) => (
                <li key={cat.name} className="flex flex-1">
                  <Link
                    to={cat.link}
                    className="group flex w-full items-center gap-3 rounded-lg px-2 transition-colors hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6C00]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF6C00] ring-1 ring-orange-100 transition-colors group-hover:bg-[#FF6C00] group-hover:text-white group-hover:ring-[#FF6C00]">
                      <cat.icon className="h-[21px] w-[21px]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#1F2937] group-hover:text-[#FF6C00]">{cat.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#FF6C00]" />
                  </Link>
                </li>
              ))}
            </ul>

            <Link to="/shop" className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-[13px] font-bold text-[#0B1B33] transition-colors hover:bg-[#0B1B33] hover:text-white">
              Browse all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>

          {/* ---- Middle: carousel ---- */}
          <section className="relative min-h-[500px] overflow-hidden rounded-2xl bg-[#0B1B33] shadow-[0_4px_20px_-8px_rgba(11,27,51,0.25)] lg:col-span-6 lg:min-h-0" aria-roledescription="carousel" aria-label="Featured deals">
            {heroSlides.map((s, idx) => (
              <div
                key={idx}
                aria-hidden={idx !== heroSlide}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === heroSlide ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'}`}
              >
                <img src={s.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-150 object-cover blur-3xl brightness-95 saturate-150" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B33] via-[#0B1B33]/75 to-[#0B1B33]/20" />
                <div
                  className="absolute inset-0 opacity-40"
                  style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                <div className="absolute -bottom-24 right-[8%] h-64 w-64 rounded-full bg-[#FF6C00]/40 blur-3xl" />

                {/* Product */}
                <div className="absolute inset-x-4 top-3 flex h-[44%] items-center justify-center sm:inset-x-auto sm:bottom-12 sm:right-[76px] sm:top-4 sm:h-auto sm:w-[52%]">
                  <div className="absolute aspect-square h-[98%] rounded-full bg-gradient-to-br from-white/25 to-white/5 ring-1 ring-white/25" />
                  <img
                    src={s.image}
                    alt={s.title}
                    className={`relative max-h-full max-w-full object-contain drop-shadow-[0_32px_36px_rgba(0,0,0,0.55)] transition-transform duration-[7000ms] ease-out ${idx === heroSlide ? 'scale-110' : 'scale-100'}`}
                  />
                  {s.pct > 0 && (
                    <div className="absolute -right-1 top-0 flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full bg-[#FF6C00] text-white shadow-xl shadow-orange-500/40 ring-4 ring-white/20">
                      <span className="text-[10px] font-semibold leading-none">Save</span>
                      <span className="text-[21px] font-black leading-none">{s.pct}%</span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-14 sm:justify-center sm:px-8 sm:pb-10">
                  <div className="max-w-[320px] sm:max-w-[240px] lg:max-w-[250px]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6C00] px-3 py-1 text-[11.5px] font-bold text-white shadow-md shadow-orange-500/30">
                      <Sparkles className="h-3 w-3" />
                      {s.tag}
                    </span>
                    <h1 className="mt-3 line-clamp-3 text-[22px] font-extrabold leading-[1.15] tracking-tight text-white lg:text-[26px]">{s.title}</h1>
                    <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-white/70">{s.highlight}</p>

                    <div className="mt-3 flex items-end gap-2.5">
                      <span className="text-[28px] font-extrabold leading-none text-white">{s.price}</span>
                      {s.oldPrice && <span className="pb-0.5 text-[13px] text-white/45 line-through">{s.oldPrice}</span>}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        to={s.link}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        {s.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-medium text-white/70">
                      <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-[#FF9A4D]" /> Free delivery</span>
                      <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#FF9A4D]" /> Warranty included</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Thumbnail rail */}
            <div className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2.5 sm:flex">
              {heroSlides.map((s, dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setHeroSlide(dot)}
                  aria-label={`Show ${s.thumbLabel}`}
                  className={`relative flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 transition-all ${dot === heroSlide ? 'scale-105 ring-2 ring-[#FF6C00]' : 'opacity-70 ring-1 ring-white/40 hover:opacity-100'}`}
                >
                  <img src={s.image} alt="" className="max-h-full max-w-full object-contain" />
                  {dot === heroSlide && (
                    <span key={heroSlide} className="absolute bottom-0 left-0 h-[3px] bg-[#FF6C00] [animation:heroProgress_7s_linear_forwards]" />
                  )}
                </button>
              ))}
            </div>

            {/* Bottom controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-5 pb-3.5 sm:px-8">
              <span className="text-[12px] font-bold tabular-nums text-white">
                {String(heroSlide + 1).padStart(2, '0')}
                <span className="text-white/40"> / {String(heroSlides.length).padStart(2, '0')}</span>
              </span>
              <div className="flex items-center gap-1.5 sm:mr-[68px]">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => setHeroSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-[#FF6C00]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => setHeroSlide((p) => (p + 1) % heroSlides.length)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-[#FF6C00]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <style>{`
              @keyframes heroProgress { from { width: 0 } to { width: 100% } }
              @media (prefers-reduced-motion: reduce) { [class*="heroProgress"] { animation: none !important; width: 100%; } }
            `}</style>
          </section>

          {/* ---- Right: banners ---- */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1 lg:grid-rows-2">
            {heroBanners.map((b) => (
              <Link key={b.title} to={b.link} className="group relative flex min-h-[180px] overflow-hidden rounded-2xl bg-[#0B1B33] shadow-[0_4px_20px_-8px_rgba(11,27,51,0.25)] lg:min-h-0">
                <img src={b.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover blur-xl brightness-90 saturate-125" />
                <div className={`absolute inset-0 bg-gradient-to-br ${b.overlay}`} />
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-2 -right-1 flex h-[76%] w-[50%] items-center justify-center">
                  <img src={b.image} alt={b.title} className="max-h-full max-w-full object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="relative z-10 flex flex-col p-4">
                  <span className="w-fit rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-bold text-[#D94F00]">{b.tag}</span>
                  <h3 className="mt-2 max-w-[62%] text-[18px] font-extrabold leading-tight text-white">{b.title}</h3>
                  <p className="mt-0.5 max-w-[58%] text-[12px] text-white/80">{b.sub}</p>
                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#0B1B33] transition-colors group-hover:bg-[#FF6C00] group-hover:text-white">
                    {b.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ================= SERVICE FEATURES ================= */}
        <div className="mb-10 grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm lg:grid-cols-4">
          {[
            { icon: Truck, title: 'Free shipping', desc: 'On orders over $99', color: 'bg-orange-50 text-[#FF6C00]' },
            { icon: RotateCcw, title: 'Easy returns', desc: '30-day money back', color: 'bg-emerald-50 text-emerald-600' },
            { icon: ShieldCheck, title: 'Secure payment', desc: '100% safe and encrypted', color: 'bg-blue-50 text-blue-600' },
            { icon: Headphones, title: '24/7 support', desc: 'Expert help anytime', color: 'bg-purple-50 text-purple-600' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3 rounded-xl p-3 sm:p-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h4 className="truncate text-[13.5px] font-bold text-[#0B1B33]">{title}</h4>
                <p className="truncate text-[12px] text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= DEALS OF THE DAY ================= */}
        <section className="mb-12">
          <SectionHeader icon={Flame} title="Deals of the day" subtitle="Up to 30% off selected items" action={{ to: '/shop', label: 'View all deals' }} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {flashSaleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={{ label: 'Deal', cls: 'bg-red-500' }}
                onAdd={handleAddToCart}
                onWhatsapp={handleBuyOnWhatsapp}
                onShare={handleShareProduct}
              />
            ))}
          </div>
        </section>

        {/* ================= PROMO BANNERS ================= */}
        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Home appliance deals', sub: 'New arrivals', img: '/images/products/product-16.jpg', bg: 'from-[#1E73BE] to-[#154F85]' },
            { title: 'Entertainment mega sale', sub: 'Up to 50% off', img: '/images/products/product-13.jpg', bg: 'from-[#FF7A1A] to-[#D94F00]' },
            { title: 'Audio & speakers', sub: 'Free shipping', img: '/images/products/product-03.jpg', bg: 'from-[#1F2A44] to-[#0B1B33]' },
            { title: 'Smart TVs', sub: 'Limited time', img: '/images/products/product-11.jpg', bg: 'from-[#6D3BD8] to-[#4A22A8]' },
          ].map((b) => (
            <Link key={b.title} to="/shop" className={`group relative flex h-[170px] items-center overflow-hidden rounded-2xl bg-gradient-to-br ${b.bg} p-6 transition-shadow hover:shadow-xl`}>
              <div className="relative z-10 max-w-[58%]">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white">{b.sub}</span>
                <h3 className="text-[17px] font-bold leading-snug text-white">{b.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-white/90 group-hover:text-white">
                  Shop now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="absolute -right-2 bottom-3 flex h-28 w-28 items-center justify-center rounded-2xl bg-white/90 p-2 shadow-lg transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
                <img src={b.img} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
            </Link>
          ))}
        </div>

        {/* ================= DEAL SPOTLIGHT ================= */}
        <section className="mb-12">
          <SectionHeader icon={FiZap} title="Flash sale spotlight" subtitle="Limited stock, today only">
            <div className="flex items-center gap-2" role="timer" aria-label="Time left on this deal">
              <span className="mr-1 text-[13px] font-medium text-gray-500">Ends in</span>
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="min-w-[54px] rounded-xl bg-[#0B1B33] px-3 py-2 text-center text-white">
                  <div className="text-[18px] font-bold tabular-nums leading-none">{String(value).padStart(2, '0')}</div>
                  <div className="mt-1 text-[10px] capitalize text-white/60">{unit}</div>
                </div>
              ))}
            </div>
          </SectionHeader>

          <div className="grid items-stretch overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
            <div className="flex items-center justify-center bg-gradient-to-br from-[#FFF1E6] to-[#FFE0C7] p-8">
              <div className="relative flex h-[300px] w-full max-w-[360px] items-center justify-center rounded-3xl bg-white/80 p-6">
                {dealPct > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-[12px] font-bold text-white">Save {dealPct}%</span>
                )}
                <img src={dealOfTheDay.image} alt={dealOfTheDay.name} className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-xl" />
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <Link to={`/product/${dealOfTheDay.id}`} className="text-[24px] font-extrabold leading-tight text-[#0B1B33] hover:text-[#FF6C00]">
                {dealOfTheDay.name}
              </Link>
              <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-gray-600">{dealOfTheDay.description}</p>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-[38px] font-black leading-none text-[#D94F00]">${dealOfTheDay.price}</span>
                {dealOfTheDay.oldPrice && <span className="text-[20px] text-gray-400 line-through">${dealOfTheDay.oldPrice}</span>}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-[13px] text-gray-600">
                  <span>Sold <b className="text-[#0B1B33]">{dealOfTheDay.sold}</b></span>
                  <span>Left <b className="text-emerald-600">{dealOfTheDay.available}</b></span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF9A4D] to-[#FF6C00]"
                    style={{ width: `${(dealOfTheDay.sold / (dealOfTheDay.sold + dealOfTheDay.available)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(dealOfTheDay)}
                  className="flex min-w-[200px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF6C00] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#E65C00]"
                >
                  <FiShoppingCart /> Add to cart
                  {dealOfTheDay.oldPrice ? ` · save $${dealOfTheDay.oldPrice - dealOfTheDay.price}` : ''}
                </button>
                <button type="button" onClick={() => handleBuyOnWhatsapp(dealOfTheDay)} className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-[14px] font-bold text-white hover:bg-[#1DA851]">
                  <FaWhatsapp className="h-5 w-5" /> WhatsApp
                </button>
                <button type="button" onClick={() => handleShareProduct(dealOfTheDay)} aria-label="Share this deal" className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <FiShare2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BRANDS ================= */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
          <span className="text-[13px] font-semibold text-gray-500">Top brands</span>
          {brands.map((name) => (
            <Link key={name} to="/shop" className="text-[18px] font-black tracking-tight text-gray-300 transition-colors hover:text-[#FF6C00]">
              {name}
            </Link>
          ))}
        </div>

        {/* ================= FEATURED PRODUCTS ================= */}
        <section className="mb-12">
          <SectionHeader icon={Gift} title="Featured products" subtitle="Hand-picked by our team">
            <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-gray-200" role="tablist">
              {['BESTSELLERS', 'FEATURED', 'TRENDING'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-[12.5px] font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-[#0B1B33] text-white' : 'text-gray-600 hover:text-[#FF6C00]'}`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>
          </SectionHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tabbedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={badgeFor(product)}
                onAdd={handleAddToCart}
                onWhatsapp={handleBuyOnWhatsapp}
                onShare={handleShareProduct}
              />
            ))}
          </div>
        </section>

        {/* ================= NEW ARRIVALS ================= */}
        <section className="mb-4">
          <SectionHeader icon={Sparkles} title="New arrivals" subtitle="Just landed in store" action={{ to: '/shop', label: 'View all' }} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group rounded-2xl border border-gray-200 bg-white p-3 transition-all hover:border-orange-200 hover:shadow-lg"
              >
                <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[#F6F7F9]">
                  <span className="absolute left-2 top-2 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">New</span>
                  <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="line-clamp-2 min-h-[2.25rem] text-[12.5px] font-semibold leading-snug text-[#0B1B33]">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[15px] font-extrabold text-[#0B1B33]">${product.price}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                    aria-label={`Add ${product.name} to cart`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-[#FF6C00] hover:text-white"
                  >
                    <FiShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ================= SHARE MODAL ================= */}
      {showShareModal && shareProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1B33]/60 p-4 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Share product"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#0B1B33]">Share this product</h3>
              <button type="button" onClick={() => setShowShareModal(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-5 mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <img src={shareProduct.image} alt="" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
              <p className="line-clamp-2 text-[13px] font-medium text-gray-700">{shareProduct.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'WhatsApp', icon: FaWhatsapp, color: 'text-[#25D366]', onClick: () => { handleBuyOnWhatsapp(shareProduct); setShowShareModal(false); } },
                { label: 'Facebook', icon: FaFacebook, color: 'text-[#1877F2]', onClick: shareOnFacebook },
                { label: 'Twitter', icon: FaTwitter, color: 'text-[#1DA1F2]', onClick: shareOnTwitter },
                { label: 'LinkedIn', icon: FaLinkedin, color: 'text-[#0A66C2]', onClick: shareOnLinkedIn },
                { label: 'Telegram', icon: FaTelegram, color: 'text-[#229ED9]', onClick: shareOnTelegram },
                { label: copied ? 'Copied' : 'Copy link', icon: copied ? FiCheck : FiShare2, color: copied ? 'text-emerald-600' : 'text-gray-600', onClick: copyLink },
              ].map(({ label, icon: Icon, color, onClick }) => (
                <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-3.5 transition-colors hover:border-orange-200 hover:bg-orange-50">
                  <Icon className={`h-7 w-7 ${color}`} />
                  <span className="text-[12px] font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING WHATSAPP ================= */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
};

export default Home;