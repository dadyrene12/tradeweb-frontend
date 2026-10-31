import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiSearch, FiClock, FiCalendar, FiArrowRight, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { FileSearch } from 'lucide-react';

/* Edit your articles here. `category` and `readTime` power the filters and meta line. */
const posts = [
  {
    id: 1,
    title: 'Top 10 Gadgets to Buy in 2024',
    excerpt: 'Discover the latest tech innovations that are worth your money this year, from smart TVs to compact speakers and home essentials.',
    date: 'Oct 28, 2024',
    category: 'Tech news',
    readTime: '6 min read',
    image: '/images/products/product-13.jpg',
  },
  {
    id: 2,
    title: 'How to Choose the Perfect Laptop',
    excerpt: 'A comprehensive guide for buyers: what to look for in performance, battery life, screen quality and warranty before you pay.',
    date: 'Oct 25, 2024',
    category: 'Buying guides',
    readTime: '8 min read',
    image: '/images/products/product-23.jpg',
  },
  {
    id: 3,
    title: 'Smart Home Setup Guide',
    excerpt: 'Transform your home with smart devices. Learn where to start, what to connect first and how to keep everything simple to use.',
    date: 'Oct 22, 2024',
    category: 'Smart home',
    readTime: '5 min read',
    image: '/images/products/product-16.jpg',
  },
];

const CategoryTag = ({ children, onDark = false }) => (
  <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-bold ${onDark ? 'bg-[#FF6C00] text-white' : 'bg-orange-50 text-[#C74F00]'}`}>
    {children}
  </span>
);

const Meta = ({ post, light = false }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] ${light ? 'text-white/70' : 'text-gray-500'}`}>
    <span className="flex items-center gap-1.5"><FiCalendar className="h-3.5 w-3.5 text-[#FF6C00]" />{post.date}</span>
    <span className="flex items-center gap-1.5"><FiClock className="h-3.5 w-3.5 text-[#FF6C00]" />{post.readTime}</span>
  </div>
);

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => ['All', ...new Set(posts.map((p) => p.category))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (q && !`${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeCategory, query]);

  // the featured story is the first result when not searching a narrow list
  const showFeatured = filtered.length > 1;
  const featured = showFeatured ? filtered[0] : null;
  const rest = showFeatured ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen bg-[#F3F4F6]" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ---------- Banner ---------- */}
      <div className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <FiChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-white">Blog</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-white sm:text-[40px]">Tech tips and buying guides</h1>
              <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-white/70">
                Practical advice to help you pick the right TV, appliance or gadget for your home.
              </p>
            </div>
            <div role="search" className="flex h-12 w-full max-w-[380px] items-center overflow-hidden rounded-xl bg-white">
              <FiSearch className="ml-4 h-[18px] w-[18px] shrink-0 text-[#FF6C00]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles"
                aria-label="Search articles"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[#0B1B33] placeholder-gray-400 focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">

        {/* ---------- Category filters ---------- */}
        <div className="mb-8 flex flex-wrap items-center gap-2" role="tablist" aria-label="Article categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-[#0B1B33] text-white shadow-md'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:text-[#FF6C00] hover:ring-orange-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ---------- Featured article ---------- */}
        {featured && (
          <article className="group mb-8 grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-[0_20px_44px_-18px_rgba(11,27,51,0.25)] lg:grid-cols-2">
            <Link to={`/blog/${featured.id}`} className="relative block h-64 overflow-hidden bg-[#0B1B33] sm:h-80 lg:h-full lg:min-h-[380px]" aria-label={featured.title}>
              <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B33]/50 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#FF6C00] shadow-md">Featured</span>
            </Link>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <CategoryTag>{featured.category}</CategoryTag>
              <h2 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight text-[#0B1B33] sm:text-[32px]">
                <Link to={`/blog/${featured.id}`} className="transition-colors hover:text-[#FF6C00]">{featured.title}</Link>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{featured.excerpt}</p>
              <div className="mt-5"><Meta post={featured} /></div>
              <Link
                to={`/blog/${featured.id}`}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-[#FF6C00] px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00]"
              >
                Read article
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        )}

        {/* ---------- Article grid ---------- */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <article key={post.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_40px_-18px_rgba(11,27,51,0.25)]">
                <Link to={`/blog/${post.id}`} className="relative block h-52 overflow-hidden bg-gray-100" aria-label={post.title}>
                  <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4"><CategoryTag onDark>{post.category}</CategoryTag></span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <Meta post={post} />
                  <h2 className="mt-3 text-[19px] font-extrabold leading-snug text-[#0B1B33]">
                    <Link to={`/blog/${post.id}`} className="transition-colors hover:text-[#FF6C00]">{post.title}</Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-gray-600">{post.excerpt}</p>
                  <Link to={`/blog/${post.id}`} className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-[14px] font-bold text-[#FF6C00]">
                    Read more
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ---------- Empty state ---------- */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00]">
              <FileSearch className="h-8 w-8" strokeWidth={1.7} />
            </span>
            <h3 className="mt-4 text-[18px] font-extrabold text-[#0B1B33]">No articles found</h3>
            <p className="mt-1 text-[14px] text-gray-500">Try another word or choose a different category.</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setActiveCategory('All'); }}
              className="mt-5 rounded-xl bg-[#FF6C00] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#E65C00]"
            >
              Show all articles
            </button>
          </div>
        )}

        {/* ---------- CTA ---------- */}
        <section className="relative mt-12 overflow-hidden rounded-3xl bg-[#0B1B33] px-6 py-10 sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#FF6C00]/30 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-[560px]">
              <h2 className="text-[24px] font-extrabold tracking-tight text-white sm:text-[28px]">Not sure what to buy?</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/70">
                Tell us what you need and your budget. Our team will suggest the right product for you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/250722189516"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#1DA851]"
              >
                <FaWhatsapp className="h-5 w-5" />
                Ask on WhatsApp
              </a>
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[#0B1B33] transition-colors hover:bg-[#FF6C00] hover:text-white">
                Browse the shop
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blog;