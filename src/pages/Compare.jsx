import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiX, FiChevronRight, FiPlus, FiStar, FiTrash2, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/currency';

/* -------------------------------------------------------------------------- */
/*  Settings                                                                   */
/* -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = '250722189516';
const MAX_ITEMS = 4;

// Sample products. Replace with your compare list (from a context or the API).
// Optional fields: oldPrice, category, specs: { Label: 'Value' } (extra rows appear automatically).
const INITIAL_ITEMS = [
  { id: 11, name: 'Hisense 55" 4K Smart TV', price: 549, oldPrice: 649, image: '/images/products/product-11.jpg', brand: 'Hisense', rating: 4.8, category: 'Smart TVs' },
  { id: 16, name: 'SPJ Washing Machine', price: 449, oldPrice: 499, image: '/images/products/product-16.jpg', brand: 'SPJ', rating: 4.6, category: 'Washing machines' },
];

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */
const Stars = ({ value = 0 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar key={n} className={`h-3.5 w-3.5 ${n <= Math.round(value) ? 'fill-current text-[#FFB020]' : 'text-gray-300'}`} />
    ))}
  </span>
);

const Pill = ({ children, tone = 'green' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tone === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-[#C74F00]'}`}>
    <FiCheck className="h-3 w-3" />
    {children}
  </span>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
const Compare = () => {
  const { addToCart } = useCart();
  const [items, setItems] = useState(INITIAL_ITEMS);

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const handleAdd = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  const handleWhatsapp = (item) => {
    const url = `${window.location.origin}/product/${item.id}`;
    const text = `Hi! I'd like to order: ${item.name} - ${formatMoney(item.price)}. ${url}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // highlights: lowest price and top rating (only when comparing 2 or more)
  const best = useMemo(() => {
    if (items.length < 2) return {};
    const lowest = Math.min(...items.map((p) => p.price));
    const top = Math.max(...items.map((p) => p.rating || 0));
    return { lowest, top };
  }, [items]);

  // extra spec rows from optional `specs`
  const specKeys = useMemo(() => [...new Set(items.flatMap((p) => Object.keys(p.specs || {})))], [items]);

  const rows = [
    {
      label: 'Price',
      render: (p) => (
        <div>
          <p className="text-[22px] font-black leading-none text-[#D94F00]">{formatMoney(p.price)}</p>
          {p.oldPrice > p.price && <p className="mt-1 text-[12.5px] text-gray-400 line-through">{formatMoney(p.oldPrice)}</p>}
          {best.lowest === p.price && <div className="mt-2"><Pill>Best price</Pill></div>}
        </div>
      ),
    },
    { label: 'Brand', render: (p) => <span className="font-semibold text-[#0B1B33]">{p.brand || '-'}</span> },
    { label: 'Category', render: (p) => <span className="text-gray-700">{p.category || '-'}</span> },
    {
      label: 'Rating',
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <Stars value={p.rating} />
          <span className="text-[13px] font-semibold text-[#0B1B33]">{p.rating ? `${p.rating} / 5` : '-'}</span>
          {best.top && p.rating === best.top && <Pill tone="orange">Top rated</Pill>}
        </div>
      ),
    },
    {
      label: 'You save',
      render: (p) =>
        p.oldPrice > p.price ? (
          <span className="font-bold text-emerald-600">{formatMoney(p.oldPrice - p.price)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    ...specKeys.map((k) => ({ label: k, render: (p) => <span className="text-gray-700">{p.specs?.[k] ?? '-'}</span> })),
  ];

  const emptySlots = Math.max(0, Math.min(MAX_ITEMS, 2) - items.length) || (items.length < MAX_ITEMS ? 1 : 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F4F6] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ---------- Banner ---------- */}
      <header className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <FiChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-white">Compare</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6C00] text-white shadow-lg shadow-orange-500/30">
                <Scale className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <div>
                <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white sm:text-[32px]">Compare products</h1>
                <p className="text-[13.5px] text-white/70">Put up to {MAX_ITEMS} products side by side and pick the best one.</p>
              </div>
            </div>
            {items.length > 0 && (
              <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20">
                <FiTrash2 className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00]">
              <Scale className="h-8 w-8" strokeWidth={1.7} />
            </span>
            <h2 className="mt-4 text-[20px] font-extrabold text-[#0B1B33]">Nothing to compare yet</h2>
            <p className="mt-1 max-w-sm text-[14px] text-gray-500">Add two or more products from the shop to see their price, rating and details side by side.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00]">
              Browse the shop
              <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <p className="border-b border-gray-100 bg-orange-50/60 px-5 py-2.5 text-[12.5px] text-gray-600 sm:hidden">Swipe sideways to see all products.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-[110px] bg-gray-50 p-3 text-left align-bottom text-[12.5px] font-bold text-gray-500 sm:w-[170px] sm:p-5">
                      {items.length} {items.length === 1 ? 'product' : 'products'}
                    </th>
                    {items.map((p) => (
                      <th key={p.id} className="relative min-w-[190px] border-l border-gray-100 p-4 align-top font-normal sm:p-5">
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          aria-label={`Remove ${p.name}`}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                        <Link to={`/product/${p.id}`} className="block">
                          <div className="mx-auto flex h-36 w-full max-w-[180px] items-center justify-center rounded-2xl bg-[#F6F7F9] p-3 sm:h-40">
                            <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          </div>
                          <span className="mt-3 block text-center text-[14.5px] font-extrabold leading-snug text-[#0B1B33] transition-colors hover:text-[#FF6C00]">{p.name}</span>
                        </Link>
                      </th>
                    ))}
                    {emptySlots > 0 &&
                      [...Array(emptySlots)].map((_, i) => (
                        <th key={`empty-${i}`} className="hidden min-w-[190px] border-l border-gray-100 p-5 align-middle font-normal md:table-cell">
                          <Link to="/shop" className="mx-auto flex h-40 w-full max-w-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]">
                            <FiPlus className="h-6 w-6" />
                            <span className="text-[13px] font-semibold">Add a product</span>
                          </Link>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <th scope="row" className="sticky left-0 z-10 border-t border-gray-100 bg-gray-50 p-3 text-left text-[13px] font-bold text-[#0B1B33] sm:p-5">{row.label}</th>
                      {items.map((p) => (
                        <td key={p.id} className="border-l border-t border-gray-100 p-3 text-center text-[14px] sm:p-5">{row.render(p)}</td>
                      ))}
                      {emptySlots > 0 && [...Array(emptySlots)].map((_, i) => <td key={`e-${i}`} className="hidden border-l border-t border-gray-100 md:table-cell" />)}
                    </tr>
                  ))}
                  <tr className="bg-white">
                    <th scope="row" className="sticky left-0 z-10 border-t border-gray-100 bg-gray-50 p-3 text-left text-[13px] font-bold text-[#0B1B33] sm:p-5">Buy</th>
                    {items.map((p) => (
                      <td key={p.id} className="border-l border-t border-gray-100 p-3 sm:p-5">
                        <div className="mx-auto flex max-w-[190px] flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdd(p)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-4 py-3 text-[13.5px] font-bold text-white shadow-md shadow-orange-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <FiShoppingCart className="h-4 w-4" />
                            Add to cart
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWhatsapp(p)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-2.5 text-[13px] font-bold text-[#1DA851] transition-colors hover:bg-[#25D366] hover:text-white"
                          >
                            <FaWhatsapp className="h-4 w-4" />
                            Order on WhatsApp
                          </button>
                        </div>
                      </td>
                    ))}
                    {emptySlots > 0 && [...Array(emptySlots)].map((_, i) => <td key={`e-${i}`} className="hidden border-l border-t border-gray-100 md:table-cell" />)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {items.length === 1 && (
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-center text-[13.5px] text-gray-600 ring-1 ring-gray-200">
            Add at least one more product to see which has the best price and rating.{' '}
            <Link to="/shop" className="font-bold text-[#FF6C00] hover:underline">Browse the shop</Link>
          </p>
        )}
      </main>
    </div>
  );
};

export default Compare;