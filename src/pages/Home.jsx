import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { FiShoppingCart, FiStar, FiShare2, FiX, FiCheck, FiMoreHorizontal } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaTelegram } from 'react-icons/fa';
import {
  Tv, WashingMachine, Refrigerator, CookingPot, Speaker, Blend, Flame, House,
  ChevronRight, ChevronLeft, LayoutGrid, ArrowRight, Truck, ShieldCheck,
  Gift, Sparkles, Search, Store, Zap, RotateCcw, Headphones, BadgeCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { formatMoney } from '../lib/currency';
import { toStoreProduct } from '../lib/productMapper';
import { sendQuickOrder } from '../lib/orders';
import { absoluteUrl } from '../lib/seo';
import fallbackProducts, { getDiscountedProducts } from '../data/products';

/* -------------------------------------------------------------------------- */
/*  Settings                                                                   */
/* -------------------------------------------------------------------------- */
// Optional: your store's WhatsApp number (digits only, with country code, e.g. 250788000000).
const WHATSAPP_NUMBER = '250722189516';
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

const CART_ROUTE = '/cart';
const FREE_SHIPPING_THRESHOLD = 100000; // keep in sync with the cart page
const HERO_INTERVAL = 6000;

/* -------------------------------------------------------------------------- */
/*  Static data                                                                */
/* -------------------------------------------------------------------------- */
const CATEGORIES = [
  { name: 'Smart TVs', hint: '4K, QLED & streaming', link: '/shop?category=audio', icon: Tv },
  { name: 'Washing Machines', hint: 'Front & top load', link: '/shop?category=appliances', icon: WashingMachine },
  { name: 'Fridges & Freezers', hint: 'Cooling for every home', link: '/shop?category=appliances', icon: Refrigerator },
  { name: 'Cooking Machines', hint: 'Cookers, ovens & more', link: '/shop?category=appliances', icon: CookingPot },
  { name: 'Radio & Speakers', hint: 'Sound systems & audio', link: '/shop?category=audio', icon: Speaker },
  { name: 'Blenders', hint: 'Smoothies & kitchen prep', link: '/shop?category=appliances', icon: Blend },
  { name: 'Kettles & Jiko', hint: 'Heat & boil, fast', link: '/shop?category=appliances', icon: Flame },
  { name: 'Home Essentials', hint: 'Everyday home needs', link: '/shop', icon: House },
];

const QUICK_LINKS = [
  { id: 'deals', label: 'Deals of the day', icon: Flame },
  { id: 'flash', label: 'Super deal', icon: Zap },
  { id: 'featured', label: 'Featured', icon: Gift },
  { id: 'new', label: 'New arrivals', icon: Sparkles },
];

const BRANDS = ['Hisense', 'LG', 'Samsung', 'Haier', 'SPJ', 'Sayona', 'KING'];

// `bg` = soft slide background, `glow` = colour of the halo behind the product
// Each slide picks a product by `id` (demo data) or, for live data, by matching `match`
// against the product name/category, so the copy always fits the product shown.
// If nothing matches, neutral `HERO_FALLBACK_COPY` is used instead of wrong text.
const HERO_CONFIG = [
  { id: 13, match: /\b(tv|tvs|television|oled|qled)\b/i, tag: 'Limited offer', highlight: 'Cinema-sized 4K for your living room', cta: 'Shop this TV', thumbLabel: 'TV deals', bg: 'from-[#FFF4EA] via-[#FFE9D6] to-[#FFDDBE]', glow: 'bg-[#FF9A4D]/35' },
  { id: 23, match: /fridge|refrigerator|freezer|cooler/i, tag: 'New arrival', highlight: 'Premium cooling for a modern kitchen', cta: 'Shop refrigerators', thumbLabel: 'Fridges', bg: 'from-[#EFF6FF] via-[#E3EEFF] to-[#D3E4FF]', glow: 'bg-[#5B9BFF]/30' },
  { id: 3, match: /speaker|audio|sound|radio|soundbar|home theat|subwoofer/i, tag: 'Audio week', highlight: 'Immersive sound, zero compromise', cta: 'Shop audio', thumbLabel: 'Audio', bg: 'from-[#F5F0FF] via-[#EBE2FF] to-[#DDD0FF]', glow: 'bg-[#9B7BFF]/30' },
];
const HERO_FALLBACK_COPY = { tag: 'Featured', highlight: 'Hand-picked for your home', cta: 'Shop now', thumbLabel: 'Featured' };

const BANNER_CONFIG = [
  { id: 11, match: /\b(tv|tvs|television|oled|qled)\b/i, tag: 'Up to 40% off', title: 'Smart TV deals', sub: 'Big screens, sharper picture', cta: 'Shop TVs', bg: 'from-[#FFF1E4] to-[#FFE0C6]', chip: 'bg-[#FF6C00] text-white' },
  { id: 16, match: /washing|cooker|oven|blender|kettle|microwave|jiko|fridge|refrigerator/i, tag: 'Free delivery', title: 'Home appliances', sub: 'Upgrade your kitchen today', cta: 'Shop now', bg: 'from-[#EAF2FF] to-[#D8E7FF]', chip: 'bg-[#1E73BE] text-white' },
];
const BANNER_FALLBACK_COPY = { tag: 'Top pick', title: 'Hand-picked for you', sub: 'Great value this week', cta: 'Shop now' };

const productText = (p) =>
  [p.name, typeof p.category === 'string' ? p.category : p.category?.name, p.subcategory].filter(Boolean).join(' ');

/** Pick a distinct product per config so no product is ever shown twice. */
const pickDistinct = (products, configs, used) =>
  configs.map((config) => {
    const free = products.filter((p) => !used.has(String(p.id)));
    let product = free.find((p) => String(p.id) === String(config.id));
    if (!product && config.match) product = free.find((p) => config.match.test(productText(p)));
    const matched = Boolean(product);
    if (!product) product = free[0] || products[0];
    used.add(String(product.id));
    return { config, product, matched };
  });

const PROMO_BANNERS = [
  { title: 'Home appliance deals', sub: 'New arrivals', img: '/images/products/product-16.jpg', bg: 'from-[#1E73BE] to-[#154F85]' },
  { title: 'Entertainment mega sale', sub: 'Up to 50% off', img: '/images/products/product-13.jpg', bg: 'from-[#FF7A1A] to-[#D94F00]' },
  { title: 'Audio & speakers', sub: 'Free shipping', img: '/images/products/product-03.jpg', bg: 'from-[#1F2A44] to-[#0B1B33]' },
  { title: 'Smart TVs', sub: 'Limited time', img: '/images/products/product-11.jpg', bg: 'from-[#6D3BD8] to-[#4A22A8]' },
];

/* -------------------------------------------------------------------------- */
/*  Countdown to the end of today (local time), so it is always real           */
/* -------------------------------------------------------------------------- */
const useEndOfDayCountdown = () => {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const total = Math.max(0, Math.floor((end - now) / 1000));
    return {
      hours: Math.floor(total / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

/* -------------------------------------------------------------------------- */
/*  Super deal of the day                                                      */
/* -------------------------------------------------------------------------- */
const SuperDeal = ({ id = 'flash', product, onAdd, onWhatsapp, onShare, formatMoney }) => {
  const time = useEndOfDayCountdown();
  if (!product) return null;

  const sold = Number(product.sold) || 0;
  const left = Number(product.available) || 0;
  const soldPct = sold + left > 0 ? Math.min(100, Math.round((sold / (sold + left)) * 100)) : 0;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const savings = hasDiscount ? product.oldPrice - product.price : 0;
  const pct = hasDiscount ? Math.round((savings / product.oldPrice) * 100) : 0;
  const almostGone = left > 0 && left <= 50;

  return (
    <section id={id} className="mb-10 scroll-mt-4 sm:mb-12" aria-labelledby="super-deal-title">
      <style>{`
        @keyframes dealFloat { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-7px) } }
        @keyframes dealShadow { 0%,100% { transform:scaleX(1); opacity:.35 } 50% { transform:scaleX(.82); opacity:.22 } }
        @keyframes dealShine { from { transform:translateX(-100%) } to { transform:translateX(300%) } }
        @keyframes dealPing { 0% { transform:scale(1); opacity:.55 } 100% { transform:scale(1.9); opacity:0 } }
        @media (prefers-reduced-motion: reduce) { .deal-anim { animation: none !important; } }
      `}</style>

      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_16px_40px_-22px_rgba(255,108,0,0.4)]">
        {/* Slim header bar */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-orange-100 bg-gradient-to-r from-[#FFF7F0] to-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6C00] to-[#FF9A4D] text-white shadow-md shadow-orange-500/30">
              <span className="deal-anim absolute inset-0 rounded-xl bg-[#FF6C00] [animation:dealPing_2s_ease-out_infinite]" />
              <Zap className="relative h-[18px] w-[18px]" fill="currentColor" />
            </span>
            <div className="leading-tight">
              <h2 id="super-deal-title" className="text-[16px] font-extrabold tracking-tight text-[#0B1B33] sm:text-[21px]">Super deal of the day</h2>
              <p className="text-[11.5px] text-gray-500 sm:text-[12px]">One product, one price, today only</p>
            </div>
          </div>

          <div className="flex items-center gap-1" role="timer" aria-label="Time left on this deal">
            <span className="mr-1 text-[12px] font-semibold text-[#D94F00]">Ends in</span>
            {[
              ['h', time.hours],
              ['m', time.minutes],
              ['s', time.seconds],
            ].map(([unit, value], i) => (
              <React.Fragment key={unit}>
                {i > 0 && <span className="text-[14px] font-bold text-[#FF6C00]">:</span>}
                <div className="flex min-w-[40px] items-baseline justify-center gap-0.5 rounded-lg bg-[#0B1B33] px-2 py-1.5 text-white">
                  <span className="text-[15px] font-extrabold tabular-nums leading-none sm:text-[17px]">{String(value).padStart(2, '0')}</span>
                  <span className="text-[9.5px] text-white/60">{unit}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          {/* ---------- Image stage ---------- */}
          <div className="relative flex h-[240px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF3E6] via-[#FFE9D4] to-[#FFD9B8] sm:h-[290px] lg:h-auto lg:min-h-[320px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.55)_32%,transparent_62%)]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ backgroundImage: 'radial-gradient(rgba(255,108,0,0.14) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#FF9A4D]/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-[#FF6C00]/20 blur-2xl" />

            <div className="relative flex h-full w-full items-center justify-center px-6 pb-7 pt-5 sm:px-10 lg:py-6">
              <img
                src={product.image}
                alt={product.name}
                className="deal-anim relative z-10 h-full max-h-[220px] w-auto max-w-full object-contain mix-blend-multiply drop-shadow-[0_18px_18px_rgba(11,27,51,0.25)] [animation:dealFloat_5s_ease-in-out_infinite] sm:max-h-[260px] lg:max-h-[290px]"
              />
              <span className="deal-anim pointer-events-none absolute bottom-4 left-1/2 h-3 w-[46%] -translate-x-1/2 rounded-[50%] bg-[#0B1B33] blur-md [animation:dealShadow_5s_ease-in-out_infinite] sm:bottom-5" />
            </div>

            {pct > 0 && (
              <div className="absolute left-3 top-3 z-20 flex h-[62px] w-[62px] -rotate-6 flex-col items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 ring-4 ring-white sm:left-4 sm:top-4 sm:h-[72px] sm:w-[72px]">
                <span className="text-[9.5px] font-semibold leading-none">Save</span>
                <span className="text-[20px] font-black leading-none sm:text-[24px]">{pct}%</span>
              </div>
            )}

            <span className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#0B1B33] shadow-md ring-1 ring-orange-100 sm:bottom-4 sm:right-4">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              Warranty included
            </span>
          </div>

          {/* ---------- Details ---------- */}
          <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8">
            <Link
              to={`/product/${product.id}`}
              className="line-clamp-2 text-[19px] font-extrabold leading-tight tracking-tight text-[#0B1B33] transition-colors hover:text-[#FF6C00] sm:text-[24px]"
            >
              {product.name}
            </Link>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">{product.description}</p>

            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-[26px] font-black leading-none text-[#D94F00] sm:text-[34px]">{formatMoney(product.price)}</span>
              {hasDiscount && <span className="pb-0.5 text-[14px] text-gray-400 line-through sm:text-[16px]">{formatMoney(product.oldPrice)}</span>}
              {hasDiscount && (
                <span className="mb-0.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11.5px] font-bold text-emerald-700">
                  Save {formatMoney(savings)}
                </span>
              )}
            </div>

            <div className="mt-3.5">
              <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
                <span className="text-gray-600">
                  Sold <b className="text-[#0B1B33]">{sold}</b>
                </span>
                <span className={`inline-flex items-center gap-1 font-bold ${almostGone ? 'text-[#D94F00]' : 'text-emerald-600'}`}>
                  {almostGone && <Flame className="h-3.5 w-3.5" fill="currentColor" />}
                  {almostGone ? `Selling fast, only ${left} left` : `${left} left`}
                </span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-orange-100"
                role="progressbar"
                aria-valuenow={soldPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${soldPct}% sold`}
              >
                <div className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#FF9A4D] to-[#FF6C00]" style={{ width: `${soldPct}%` }}>
                  <span className="deal-anim absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent [animation:dealShine_2.4s_linear_infinite]" />
                </div>
              </div>
            </div>

            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] font-medium text-gray-600">
              {[
                [Truck, 'Free delivery'],
                [ShieldCheck, 'Secure checkout'],
                [RotateCcw, '30-day returns'],
              ].map(([Icon, label]) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-[#FF6C00]" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => onAdd(product)}
                className="relative flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-4 py-3 text-[14px] font-extrabold text-white shadow-md shadow-orange-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00]"
              >
                <span className="deal-anim absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent [animation:dealShine_3s_linear_infinite]" />
                <FiShoppingCart className="relative h-[18px] w-[18px] flex-shrink-0" />
                <span className="relative truncate">Grab this deal</span>
              </button>
              <button
                type="button"
                onClick={() => onWhatsapp(product)}
                aria-label="Order on WhatsApp"
                className="flex h-[46px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-[#1DA851] sm:px-4"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => onShare(product)}
                aria-label="Share this deal"
                className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF6C00]"
              >
                <FiShare2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Service features: 2x2 on phones with wrapping text, 4 across on desktop    */
/* -------------------------------------------------------------------------- */
const ServiceFeatures = ({ freeShippingText }) => {
  const items = [
    { icon: Truck, title: 'Free shipping', desc: freeShippingText, tone: 'bg-orange-50 text-[#FF6C00] ring-orange-100' },
    { icon: RotateCcw, title: 'Easy returns', desc: '30-day money back', tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
    { icon: ShieldCheck, title: 'Secure payment', desc: '100% safe and encrypted', tone: 'bg-blue-50 text-blue-600 ring-blue-100' },
    { icon: Headphones, title: '24/7 support', desc: 'Expert help anytime', tone: 'bg-purple-50 text-purple-600 ring-purple-100' },
  ];

  return (
    <div className="mb-10 grid grid-cols-2 gap-2.5 sm:mb-12 sm:gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map(({ icon: Icon, title, desc, tone }) => (
        <div
          key={title}
          className="flex flex-col items-start gap-2.5 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-3 sm:p-4"
        >
          <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1 sm:h-11 sm:w-11 ${tone}`}>
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h4 className="text-[13px] font-bold leading-tight text-[#0B1B33] sm:text-[13.5px]">{title}</h4>
            <p className="mt-0.5 text-[11.5px] leading-snug text-gray-500 sm:text-[12px]">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Small reusable pieces                                                      */
/* -------------------------------------------------------------------------- */
const SectionHeader = ({ icon: Icon, title, subtitle, action, children }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-6">
    <div className="flex min-w-0 items-center gap-3">
      {Icon && (
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00] sm:h-11 sm:w-11">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[19px] font-extrabold leading-tight tracking-tight text-[#0B1B33] sm:text-[26px]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-gray-500 sm:text-[13px]">{subtitle}</p>}
      </div>
    </div>
    {children}
    {action && (
      <Link to={action.to} className="group inline-flex flex-shrink-0 items-center gap-1 text-[13px] font-semibold text-[#FF6C00] hover:text-[#E65C00]">
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
    <article className="group flex h-full w-full flex-col rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-[0_12px_32px_-12px_rgba(11,27,51,0.18)] sm:p-3.5">
      <div className="relative mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#F6F7F9] sm:h-44">
        {badge && <span className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${badge.cls}`}>{badge.label}</span>}
        {hasDiscount && <span className="absolute right-2 top-2 z-10 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-red-600 shadow-sm">-{pct}%</span>}
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
        <button
          type="button"
          onClick={() => onShare(product)}
          aria-label={`Share ${product.name}`}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition-all hover:text-[#FF6C00] focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <FiShare2 className="h-4 w-4" />
        </button>
      </div>

      <Link to={`/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-[#0B1B33] transition-colors hover:text-[#FF6C00] sm:text-[13.5px]">
        {product.name}
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <Stars rating={product.rating} />
        {product.rating && <span className="text-[11px] text-gray-400">{product.rating}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[15px] font-extrabold text-[#0B1B33] sm:text-[18px]">{formatMoney(product.price)}</span>
        {hasDiscount && <span className="text-[12px] text-gray-400 line-through">{formatMoney(product.oldPrice)}</span>}
      </div>

      <div className="mt-auto flex gap-2 pt-3">
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0B1B33] py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#FF6C00] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00]"
        >
          <FiShoppingCart className="h-4 w-4 flex-shrink-0" />
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add to cart</span>
        </button>
        <button
          type="button"
          onClick={() => onWhatsapp(product)}
          aria-label="Order on WhatsApp"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#1DA851] transition-colors hover:bg-[#25D366] hover:text-white active:scale-95"
        >
          <FaWhatsapp className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/*  Side navigation                                                            */
/* -------------------------------------------------------------------------- */
const CategoryList = ({ items, variant = 'sidebar', onNavigate }) => {
  const isDrawer = variant === 'drawer';
  return (
    <ul className={isDrawer ? 'space-y-1' : 'flex flex-1 flex-col gap-0.5 px-2 py-1'}>
      {items.map((cat) => (
        <li key={cat.name} className={isDrawer ? '' : 'flex flex-1'}>
          <Link
            to={cat.link}
            onClick={onNavigate}
            className={`group flex w-full items-center gap-3 transition-colors hover:bg-orange-50 active:bg-orange-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6C00] ${isDrawer ? 'rounded-xl px-2.5 py-2' : 'rounded-xl px-2.5 py-1'}`}
          >
            <span className={`flex flex-shrink-0 items-center justify-center transition-all ${isDrawer ? 'h-11 w-11 rounded-xl bg-gray-50 text-gray-500 group-hover:bg-[#FF6C00] group-hover:text-white' : 'h-9 w-9 rounded-lg bg-[#F4F6FA] text-[#0B1B33] ring-1 ring-gray-100 group-hover:bg-[#FF6C00] group-hover:text-white group-hover:ring-[#FF6C00] group-hover:shadow-sm'}`}>
              <cat.icon className={isDrawer ? 'h-[22px] w-[22px]' : 'h-[19px] w-[19px]'} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block truncate font-semibold text-[#1F2937] group-hover:text-[#FF6C00] ${isDrawer ? 'text-[15px]' : 'text-[13px]'}`}>{cat.name}</span>
              <span className={`block truncate text-gray-400 ${isDrawer ? 'text-[12px]' : 'mt-px text-[10.5px]'}`}>{cat.hint}</span>
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#FF6C00]" />
          </Link>
        </li>
      ))}
    </ul>
  );
};

const DrawerLabel = ({ children, first }) => (
  <p className={`mb-2 px-2.5 text-[11.5px] font-bold text-gray-400 ${first ? '' : 'mt-6'}`}>{children}</p>
);

/** Slide-out side navigation for phones and tablets. */
const CategoryDrawer = ({ open, onClose, onJump }) => {
  const [query, setQuery] = useState('');
  const closeRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) => c.name.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    else setQuery('');
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${open ? 'visible' : 'pointer-events-none invisible [transition:visibility_0s_linear_0.3s]'}`}
      aria-hidden={!open}
    >
      <div onClick={onClose} className={`absolute inset-0 bg-[#0B1B33]/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
        className={`absolute inset-y-0 left-0 flex w-[88%] max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-shrink-0 bg-gradient-to-br from-[#FF6C00] to-[#FF8A2B] px-4 pb-4 pt-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <LayoutGrid className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <h2 className="text-[17px] font-extrabold">Shop menu</h2>
                <p className="text-[12px] text-white/80">Find what you need</p>
              </div>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories"
              aria-label="Search categories"
              className="w-full rounded-xl border-0 bg-white py-2.5 pl-9 pr-3 text-[14px] text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60"
            />
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <DrawerLabel first>Categories</DrawerLabel>
          {filtered.length > 0 ? (
            <CategoryList items={filtered} variant="drawer" onNavigate={onClose} />
          ) : (
            <p className="rounded-xl bg-gray-50 px-3 py-6 text-center text-[13px] text-gray-500">No categories match &ldquo;{query}&rdquo;. Try a shorter word.</p>
          )}

          {!query && (
            <>
              <DrawerLabel>Explore</DrawerLabel>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onJump(id)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-[13px] font-semibold text-[#0B1B33] transition-colors hover:border-orange-200 hover:bg-orange-50 active:bg-orange-100"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-[#FF6C00]" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>

              <DrawerLabel>Top brands</DrawerLabel>
              <div className="flex flex-wrap gap-2 px-1">
                {BRANDS.map((name) => (
                  <Link key={name} to="/shop" onClick={onClose} className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[12.5px] font-bold text-gray-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]">
                    {name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-shrink-0 space-y-2 border-t border-gray-100 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          <Link to="/shop" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl bg-[#0B1B33] py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#FF6C00]">
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
          <a href={waLink()} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 py-3 text-[14px] font-bold text-[#1DA851] transition-colors hover:bg-[#25D366] hover:text-white">
            <FaWhatsapp className="h-5 w-5" /> Chat with us
          </a>
        </div>
      </aside>
    </div>
  );
};

/** App-style bottom tab bar (phones and tablets only). */
const MobileTabBar = ({ cartCount, drawerOpen, onHome, onCategories }) => {
  const tab = (active) =>
    `relative flex w-full flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold transition-colors ${active ? 'text-[#FF6C00]' : 'text-gray-500 active:text-[#FF6C00]'}`;
  const indicator = (active) => (active ? <span className="absolute inset-x-6 top-0 h-0.5 rounded-b bg-[#FF6C00]" /> : null);

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-12px_rgba(11,27,51,0.18)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        <li>
          <button type="button" onClick={onHome} className={tab(!drawerOpen)} aria-current={!drawerOpen ? 'page' : undefined}>
            {indicator(!drawerOpen)}
            <House className="h-[22px] w-[22px]" strokeWidth={1.9} />
            Home
          </button>
        </li>
        <li>
          <button type="button" onClick={onCategories} className={tab(drawerOpen)} aria-haspopup="dialog" aria-expanded={drawerOpen}>
            {indicator(drawerOpen)}
            <LayoutGrid className="h-[22px] w-[22px]" strokeWidth={1.9} />
            Categories
          </button>
        </li>
        <li>
          <Link to="/shop" className={tab(false)}>
            <Store className="h-[22px] w-[22px]" strokeWidth={1.9} />
            Shop
          </Link>
        </li>
        <li>
          <Link to={CART_ROUTE} className={tab(false)} aria-label={`Cart, ${cartCount} items`}>
            <span className="relative">
              <FiShoppingCart className="h-[22px] w-[22px]" />
              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF6C00] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>
            Cart
          </Link>
        </li>
        <li>
          <a href={waLink()} target="_blank" rel="noreferrer" className={tab(false)}>
            <FaWhatsapp className="h-[22px] w-[22px] text-[#25D366]" />
            Chat
          </a>
        </li>
      </ul>
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
const Home = () => {
  const [activeTab, setActiveTab] = useState('BESTSELLERS');
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareProduct, setShareProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const touchStartX = useRef(null);
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState(fallbackProducts);
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/settings/homepage').then(({ data }) => active && setHomeData(data)).catch(() => {});
    api
      .get('/products', { params: { limit: 200 } })
      .then(({ data }) => {
        if (active && data.products?.length) setProducts(data.products.map(toStoreProduct));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const cartCount = (cartItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  /* --- Toast --- */
  const showToast = useCallback((message) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /* --- Handlers --- */
  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} added to cart`);
  };

  const handleBuyOnWhatsapp = async (product) => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const message = `Hi! I'm interested in: ${product.name} - Price: ${formatMoney(product.price)}. Please provide more details. ${productUrl}`;
    window.open(waLink(message), '_blank', 'noopener,noreferrer');

    try {
      await sendQuickOrder({
        channel: 'whatsapp',
        items: [
          {
            product: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          },
        ],
        note: `WhatsApp order request for ${product.name}`,
        customer: { name: 'WhatsApp customer' },
      });
      showToast('Order received — we will reply shortly.');
    } catch (error) {
      showToast('Could not save the order. Please send the WhatsApp message.');
    }
  };

  const handleShareProduct = (product) => {
    setShareProduct(product);
    setCopied(false);
    setShowShareModal(true);
  };

  const getProductUrl = () => (shareProduct ? `${window.location.origin}/product/${shareProduct.id}` : '');
  const openShare = (url) => window.open(url, '_blank', 'noopener,noreferrer');
  const shareLabel = () => `Check out ${shareProduct?.name ?? ''}`;
  const enc = encodeURIComponent;

  const shareNative = async () => {
    try {
      await navigator.share({ title: shareProduct.name, text: shareLabel(), url: getProductUrl() });
      setShowShareModal(false);
    } catch (e) {
      /* dismissed by the user */
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard unavailable */
    }
  };

  const shareTargets = [
    { label: 'WhatsApp', icon: FaWhatsapp, color: 'text-[#25D366]', onClick: () => { openShare(`https://wa.me/?text=${enc(`${shareLabel()} ${getProductUrl()}`)}`); setShowShareModal(false); } },
    { label: 'Facebook', icon: FaFacebook, color: 'text-[#1877F2]', onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${enc(getProductUrl())}`) },
    { label: 'Twitter', icon: FaTwitter, color: 'text-[#1DA1F2]', onClick: () => openShare(`https://twitter.com/intent/tweet?url=${enc(getProductUrl())}&text=${enc(shareLabel())}`) },
    { label: 'LinkedIn', icon: FaLinkedin, color: 'text-[#0A66C2]', onClick: () => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(getProductUrl())}`) },
    { label: 'Telegram', icon: FaTelegram, color: 'text-[#229ED9]', onClick: () => openShare(`https://t.me/share/url?url=${enc(getProductUrl())}&text=${enc(shareLabel())}`) },
    { label: copied ? 'Copied' : 'Copy link', icon: copied ? FiCheck : FiShare2, color: copied ? 'text-emerald-600' : 'text-gray-600', onClick: copyLink },
    ...(canNativeShare ? [{ label: 'More…', icon: FiMoreHorizontal, color: 'text-gray-600', onClick: shareNative }] : []),
  ];

  const jumpTo = (id) => {
    setDrawerOpen(false);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
  };

  /* --- Overlays: lock scroll, close on Escape, close drawer on desktop resize --- */
  useEffect(() => {
    if (!drawerOpen && !showShareModal) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setShowShareModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen, showShareModal]);

  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setDrawerOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* --- Data (rebuilt when products arrive from the API) --- */
  const { heroSlides, heroBanners } = useMemo(() => {
    const used = new Set();
    const slides = pickDistinct(products, HERO_CONFIG, used).map(({ config, product: p, matched }) => {
      const pct = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
      return {
        ...config,
        ...(matched ? {} : HERO_FALLBACK_COPY),
        title: p.name,
        price: formatMoney(p.price),
        oldPrice: p.oldPrice ? formatMoney(p.oldPrice) : null,
        pct,
        link: `/product/${p.id}`,
        image: p.image,
      };
    });
    const banners = pickDistinct(products, BANNER_CONFIG, used).map(({ config, product: p, matched }) => ({
      ...config,
      ...(matched ? {} : BANNER_FALLBACK_COPY),
      link: `/product/${p.id}`,
      image: p.image,
    }));
    return { heroSlides: slides, heroBanners: banners };
  }, [products]);

  // Auto-paginate. Restarts after any manual change and pauses while hovering.
  useEffect(() => {
    if (heroPaused) return undefined;
    const slider = setInterval(() => setHeroSlide((p) => (p + 1) % heroSlides.length), HERO_INTERVAL);
    return () => clearInterval(slider);
  }, [heroSlide, heroSlides.length, heroPaused]);

  const onHeroTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onHeroTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    setHeroSlide((p) => (p + (dx < 0 ? 1 : -1) + heroSlides.length) % heroSlides.length);
  };

  const featuredSource = useMemo(
    () => (homeData?.featured?.length ? homeData.featured.map(toStoreProduct) : products.filter((item) => item.featured)),
    [homeData, products]
  );

  const tabbedProducts = useMemo(() => {
    let list = featuredSource;
    if (activeTab === 'BESTSELLERS') list = featuredSource.filter((p) => p.isBestseller || p.badge === 'BESTSELLER');
    if (activeTab === 'TRENDING') list = featuredSource.filter((p) => p.isHot || p.badge === 'HOT' || p.badge === 'SALE');
    if (list.length < 4) list = featuredSource;
    return list.slice(0, 10);
  }, [activeTab, featuredSource]);

  const badgeFor = (p) => {
    if (p.isBestseller || p.badge === 'BESTSELLER') return { label: 'Bestseller', cls: 'bg-[#0B1B33]' };
    if (p.isHot || p.badge === 'HOT') return { label: 'Hot', cls: 'bg-red-500' };
    if (p.isNewArrival || p.isNew || p.badge === 'NEW' || p.badge === 'SALE') return { label: 'New', cls: 'bg-emerald-500' };
    return null;
  };

  const dealSource = homeData?.deal
    ? toStoreProduct(homeData.deal)
    : products.find((item) => item.dealOfTheDay) || products.find((item) => item.id === 24) || products[0];
  const dealOfTheDay = {
    ...dealSource,
    sold: dealSource.dealSold !== undefined ? dealSource.dealSold : 156,
    available: dealSource.dealAvailable !== undefined ? dealSource.dealAvailable : 44,
  };
  const dealsOfTheDay = homeData?.flash?.length ? homeData.flash.map(toStoreProduct) : getDiscountedProducts().slice(0, 4);
  const newArrivals = homeData?.newArrivals?.length ? homeData.newArrivals.map(toStoreProduct) : products.slice(-6);

  const homeStructuredData = {
    '@type': 'ItemList',
    name: 'Featured electronics and home appliances in Rwanda',
    itemListElement: newArrivals.slice(0, 10).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/product/${product.id}`),
    })),
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#F5F6FA] pb-24 text-gray-900 antialiased lg:pb-0"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      <Seo
        title="RN Smart Electronics Rwanda | TVs, Fridges, Washing Machines & Home Appliances"
        description="Buy smart TVs, fridges, washing machines, cookers, speakers and home appliances in Kigali, Rwanda. Genuine products, free delivery over FRW 100,000 and easy WhatsApp ordering from RN Smart Electronics."
        path="/"
        structuredData={[homeStructuredData]}
      />
      <h1 className="sr-only">
        Buy TVs, fridges, washing machines and home appliances in Rwanda - RN Smart Electronics
      </h1>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes heroProgress { from { width: 0 } to { width: 100% } }
        @keyframes heroIn { from { opacity: 0; transform: translateY(14px) scale(.97) } to { opacity: 1; transform: none } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: none } }
        @media (prefers-reduced-motion: reduce) {
          [class*="heroProgress"], [class*="heroIn"] { animation: none !important; width: 100%; }
          [class*="sheetUp"] { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:pt-0">

        {/* ================= MOBILE CATEGORY STRIP ================= */}
        <nav aria-label="Categories" className="no-scrollbar -mx-4 mb-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 lg:hidden">
          <button type="button" onClick={() => setDrawerOpen(true)} className="flex w-[64px] flex-shrink-0 snap-start flex-col items-center gap-1.5 active:scale-95">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6C00] to-[#FF8A2B] text-white shadow-md shadow-orange-500/30">
              <LayoutGrid className="h-6 w-6" strokeWidth={2} />
            </span>
            <span className="text-[11px] font-bold text-[#0B1B33]">All</span>
          </button>
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} to={cat.link} className="flex w-[64px] flex-shrink-0 snap-start flex-col items-center gap-1.5 active:scale-95">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white text-[#FF6C00] shadow-sm ring-1 ring-gray-100">
                <cat.icon className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <span className="line-clamp-2 w-full text-center text-[11px] font-semibold leading-tight text-[#1F2937]">{cat.name}</span>
            </Link>
          ))}
        </nav>

        {/* ================= HERO: sidebar | big carousel | banners ================= */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:mb-10 sm:gap-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_290px]">

          {/* ---- Left: desktop sidebar ---- */}
          <aside aria-label="Shop by category" className="hidden h-[600px] w-full flex-col overflow-hidden rounded-b-3xl rounded-t-none border border-t-0 border-gray-100 bg-white shadow-[0_8px_30px_-14px_rgba(11,27,51,0.15)] lg:flex">
            <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#0B1B33] via-[#122543] to-[#1F2A44] px-4 py-4 text-white">
              <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#FF6C00]/25 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-12 -left-6 h-24 w-24 rounded-full bg-[#FF6C00]/10 blur-2xl" />
              <div className="relative flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A1A] to-[#E65C00] text-white shadow-md shadow-orange-500/30">
                  <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <h2 className="truncate text-[15px] font-extrabold tracking-tight">Shop by category</h2>
                  <p className="mt-0.5 text-[11px] text-white/60">Everything for your home</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-bold text-white/80 ring-1 ring-white/10">
                  {CATEGORIES.length}
                </span>
              </div>
            </div>

            <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto py-1.5">
              <CategoryList items={CATEGORIES} variant="sidebar" />
            </div>

            <div className="flex-shrink-0 space-y-2 border-t border-gray-100 bg-gray-50/70 p-2.5">
              <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 ring-orange-100">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF6C00]">
                  <Truck className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[11.5px] font-bold text-[#0B1B33]">Free delivery</p>
                  <p className="text-[10.5px] text-gray-500">On orders over FRW 100,000</p>
                </div>
              </div>
              <Link to="/shop" className="group flex items-center justify-between gap-2 rounded-xl bg-[#0B1B33] px-3.5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#FF6C00]">
                <span className="flex items-center gap-2"><Store className="h-4 w-4" /> All products</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </aside>

          {/* ---- Middle: big auto-paginating carousel (product image ~80%) ---- */}
          <section
            className="relative min-h-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_-14px_rgba(11,27,51,0.2)] sm:min-h-[460px] lg:h-[600px] lg:min-h-0 lg:rounded-t-none"
            aria-roledescription="carousel"
            aria-label="Featured deals"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={onHeroTouchStart}
            onTouchEnd={onHeroTouchEnd}
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
          >
            {heroSlides.map((s, idx) => {
              const active = idx === heroSlide;
              return (
                <div
                  key={idx}
                  aria-hidden={!active}
                  className={`absolute inset-0 transition-opacity duration-700 ${active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.bg}`} />
                  <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(rgba(11,27,51,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                  <div className="relative flex h-full flex-col sm:block">
                    {/* Product: ~56% of the height on phones, ~66% of the width on larger screens */}
                    <div className="relative flex h-1/2 items-center justify-center px-4 pb-1 pt-4 sm:absolute sm:inset-y-4 sm:bottom-12 sm:right-[78px] sm:left-auto sm:h-auto sm:w-[66%] sm:p-0">
                      <span className={`absolute aspect-square h-[92%] rounded-full blur-2xl ${s.glow}`} />
                      <span className="absolute aspect-square h-[88%] rounded-full bg-white/60 ring-1 ring-white" />
                      <img
                        key={`${idx}-${active}`}
                        src={s.image}
                        alt={s.title}
                        className={`relative h-full max-h-full w-auto max-w-full object-contain mix-blend-multiply drop-shadow-[0_28px_28px_rgba(11,27,51,0.28)] ${active ? '[animation:heroIn_0.7s_ease-out_both]' : ''}`}
                      />
                      {s.pct > 0 && (
                        <div className="absolute right-3 top-3 flex h-[60px] w-[60px] -rotate-6 flex-col items-center justify-center rounded-full bg-[#FF6C00] text-white shadow-lg shadow-orange-500/40 ring-4 ring-white sm:right-0 sm:top-0 sm:h-[72px] sm:w-[72px]">
                          <span className="text-[10px] font-semibold leading-none">Save</span>
                          <span className="text-[19px] font-black leading-none sm:text-[22px]">{s.pct}%</span>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-14 sm:h-full sm:justify-center sm:px-8 sm:pb-12">
                      <div className="max-w-full sm:max-w-[250px] lg:max-w-[230px] xl:max-w-[290px]">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1B33] px-3 py-1 text-[11.5px] font-bold text-white">
                          <Sparkles className="h-3 w-3 text-[#FF9A4D]" />
                          {s.tag}
                        </span>
                        <h2 className="mt-2.5 line-clamp-2 text-[20px] font-extrabold leading-[1.15] tracking-tight text-[#0B1B33] sm:mt-3 sm:line-clamp-3 sm:text-[22px] xl:text-[28px]">{s.title}</h2>
                        <p className="mt-1.5 line-clamp-1 text-[12.5px] font-medium leading-snug text-gray-600 sm:line-clamp-2 sm:text-[13px]">{s.highlight}</p>

                        <div className="mt-2.5 flex flex-wrap items-end gap-x-2.5">
                          <span className="text-[24px] font-extrabold leading-none text-[#D94F00] sm:text-[27px]">{s.price}</span>
                          {s.oldPrice && <span className="pb-0.5 text-[13px] text-gray-400 line-through">{s.oldPrice}</span>}
                        </div>

                        <Link to={s.link} className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00]">
                          {s.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <div className="mt-3.5 hidden flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-medium text-gray-600 xl:flex">
                          <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-[#FF6C00]" /> Free delivery</span>
                          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#FF6C00]" /> Warranty included</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thumbnail rail */}
            <div className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2.5 sm:flex">
              {heroSlides.map((s, dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setHeroSlide(dot)}
                  aria-label={`Show ${s.thumbLabel}`}
                  className={`relative flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm transition-all ${dot === heroSlide ? 'scale-105 ring-2 ring-[#FF6C00]' : 'opacity-70 ring-1 ring-gray-200 hover:opacity-100'}`}
                >
                  <img src={s.image} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  {dot === heroSlide && !heroPaused && <span key={heroSlide} className="absolute bottom-0 left-0 h-[3px] bg-[#FF6C00] [animation:heroProgress_6s_linear_forwards]" />}
                </button>
              ))}
            </div>

            {/* Bottom controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-5 pb-3.5 sm:px-8">
              <span className="text-[12px] font-bold tabular-nums text-[#0B1B33]">
                {String(heroSlide + 1).padStart(2, '0')}
                <span className="text-gray-400"> / {String(heroSlides.length).padStart(2, '0')}</span>
              </span>

              <div className="flex items-center gap-1.5 sm:hidden" role="tablist" aria-label="Choose slide">
                {heroSlides.map((s, dot) => (
                  <button
                    key={dot}
                    type="button"
                    role="tab"
                    aria-selected={dot === heroSlide}
                    aria-label={`Slide ${dot + 1}`}
                    onClick={() => setHeroSlide(dot)}
                    className={`h-1.5 rounded-full transition-all ${dot === heroSlide ? 'w-5 bg-[#FF6C00]' : 'w-1.5 bg-[#0B1B33]/25'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 sm:mr-[68px]">
                <button type="button" aria-label="Previous slide" onClick={() => setHeroSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0B1B33] shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-[#FF6C00] hover:text-white hover:ring-[#FF6C00]">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Next slide" onClick={() => setHeroSlide((p) => (p + 1) % heroSlides.length)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0B1B33] shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-[#FF6C00] hover:text-white hover:ring-[#FF6C00]">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* ---- Right: product banners (swipe row on phones, grid on tablets, stacked on desktop) ---- */}
          <div className="grid grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-2 lg:gap-4 xl:col-span-1 xl:h-[600px] xl:grid-cols-1 xl:grid-rows-2">
            {heroBanners.map((b) => (
              <Link key={b.title} to={b.link} className={`group relative flex min-h-[165px] w-full overflow-hidden rounded-3xl bg-gradient-to-br ${b.bg} shadow-[0_8px_30px_-14px_rgba(11,27,51,0.2)] sm:min-h-[190px] lg:min-h-[200px] xl:min-h-0`}>
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/50" />
                <div className="absolute -bottom-1 -right-1 flex h-[78%] w-[44%] items-center justify-center sm:h-[80%] sm:w-[52%]">
                  <img src={b.image} alt={b.title} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-[0_14px_14px_rgba(11,27,51,0.25)] transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="relative z-10 flex w-full flex-col p-4 sm:p-5">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${b.chip}`}>{b.tag}</span>
                  <h3 className="mt-2 max-w-[62%] text-[16px] font-extrabold leading-tight text-[#0B1B33] sm:max-w-[56%] sm:text-[18px]">{b.title}</h3>
                  <p className="mt-0.5 max-w-[58%] text-[11.5px] leading-snug text-gray-600 sm:max-w-[52%] sm:text-[12px]">{b.sub}</p>
                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2.5 text-[12px] font-bold text-[#0B1B33] underline decoration-[#FF6C00] decoration-2 underline-offset-4 transition-colors group-hover:text-[#FF6C00] sm:pt-3 sm:text-[12.5px]">
                    {b.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ================= SERVICE FEATURES ================= */}
        <ServiceFeatures freeShippingText={`On orders over ${formatMoney(FREE_SHIPPING_THRESHOLD)}`} />

        {/* ================= DEALS OF THE DAY ================= */}
        <section id="deals" className="mb-10 scroll-mt-4 sm:mb-12">
          <SectionHeader icon={Flame} title="Deals of the day" subtitle="Up to 30% off selected items" action={{ to: '/shop', label: 'View all deals' }} />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
            {dealsOfTheDay.map((product) => (
              <ProductCard key={product.id} product={product} badge={{ label: 'Deal', cls: 'bg-red-500' }} onAdd={handleAddToCart} onWhatsapp={handleBuyOnWhatsapp} onShare={handleShareProduct} />
            ))}
          </div>
        </section>

        {/* ================= PROMO BANNERS ================= */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:mb-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {PROMO_BANNERS.map((b) => (
            <Link key={b.title} to="/shop" className={`group relative flex min-h-[150px] w-full items-center overflow-hidden rounded-3xl bg-gradient-to-br ${b.bg} p-4 transition-shadow hover:shadow-xl sm:min-h-[170px] sm:p-5`}>
              <div className="relative z-10 min-w-0 max-w-[62%] pr-2">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-semibold text-white sm:text-[11px]">{b.sub}</span>
                <h3 className="text-[15px] font-bold leading-snug text-white sm:text-[16px] lg:text-[17px]">{b.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-white/90 group-hover:text-white sm:text-[12.5px]">
                  Shop now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="absolute -right-1 bottom-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 p-1.5 shadow-lg transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 sm:-right-2 sm:bottom-3 sm:h-24 sm:w-24 sm:p-2">
                <img src={b.img} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
            </Link>
          ))}
        </div>

        {/* ================= SUPER DEAL OF THE DAY ================= */}
        <SuperDeal
          id="flash"
          product={dealOfTheDay}
          onAdd={handleAddToCart}
          onWhatsapp={handleBuyOnWhatsapp}
          onShare={handleShareProduct}
          formatMoney={formatMoney}
        />

        {/* ================= BRANDS ================= */}
        <div className="no-scrollbar mb-10 flex items-center gap-x-8 overflow-x-auto rounded-3xl border border-gray-100 bg-white px-6 py-5 shadow-sm sm:mb-12 md:flex-wrap md:justify-between md:gap-y-4 md:overflow-visible md:px-8 md:py-6">
          <span className="flex-shrink-0 text-[13px] font-semibold text-gray-500">Top brands</span>
          {BRANDS.map((name) => (
            <Link key={name} to="/shop" className="flex-shrink-0 text-[18px] font-black tracking-tight text-gray-300 transition-colors hover:text-[#FF6C00]">
              {name}
            </Link>
          ))}
        </div>

        {/* ================= FEATURED PRODUCTS ================= */}
        <section id="featured" className="mb-10 scroll-mt-4 sm:mb-12">
          <SectionHeader icon={Gift} title="Featured products" subtitle="Hand-picked by our team">
            <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-gray-200" role="tablist">
              {['BESTSELLERS', 'FEATURED', 'TRENDING'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12.5px] font-semibold capitalize transition-colors sm:px-4 ${activeTab === tab ? 'bg-[#0B1B33] text-white' : 'text-gray-600 hover:text-[#FF6C00]'}`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>
          </SectionHeader>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tabbedProducts.map((product) => (
              <ProductCard key={product.id} product={product} badge={badgeFor(product)} onAdd={handleAddToCart} onWhatsapp={handleBuyOnWhatsapp} onShare={handleShareProduct} />
            ))}
          </div>
        </section>

        {/* ================= NEW ARRIVALS ================= */}
        <section id="new" className="mb-4 scroll-mt-4">
          <SectionHeader icon={Sparkles} title="New arrivals" subtitle="Just landed in store" action={{ to: '/shop', label: 'View all' }} />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
            {newArrivals.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group w-full rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-orange-200 hover:shadow-lg">
                  <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[#F6F7F9]">
                    <span className="absolute left-2 top-2 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">New</span>
                    <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="line-clamp-2 min-h-[2.25rem] text-[12.5px] font-semibold leading-snug text-[#0B1B33]">{product.name}</h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[14px] font-extrabold text-[#0B1B33] sm:text-[15px]">{formatMoney(product.price)}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                      aria-label={`Add ${product.name} to cart`}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-[#FF6C00] hover:text-white active:scale-95"
                    >
                      <FiShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ================= SIDE NAV DRAWER + TAB BAR (phones & tablets) ================= */}
      <CategoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onJump={jumpTo} />
      <MobileTabBar
        cartCount={cartCount}
        drawerOpen={drawerOpen}
        onHome={() => {
          setDrawerOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCategories={() => setDrawerOpen(true)}
      />

      {/* ================= SHARE SHEET ================= */}
      {showShareModal && shareProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0B1B33]/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setShowShareModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Share product"
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl [animation:sheetUp_0.25s_ease-out] sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
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
              {shareTargets.map(({ label, icon: Icon, color, onClick }) => (
                <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-3.5 transition-colors hover:border-orange-200 hover:bg-orange-50 active:bg-orange-100">
                  <Icon className={`h-7 w-7 ${color}`} />
                  <span className="text-[12px] font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 lg:bottom-6">
        {toast && (
          <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-[#0B1B33] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg">
            <FiCheck className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate">{toast}</span>
          </div>
        )}
      </div>

      {/* ================= FLOATING WHATSAPP (desktop; phones use the tab bar) ================= */}
      <a
        href={waLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105 lg:flex"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
};

export default Home;