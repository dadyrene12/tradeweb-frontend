import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { FiChevronRight, FiSearch, FiClock, FiCalendar, FiArrowRight, FiX, FiTrendingUp, FiGrid } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { FileSearch } from 'lucide-react';
import { SITE_NAME, absoluteUrl, breadcrumbSchema } from '../lib/seo';

/* -------------------------------------------------------------------------- */
/*  Edit your articles here. These are sample posts: replace with your own.    */
/*  `popular: true` shows an article in the "Popular reads" list.              */
/* -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = '250722189516';
const PAGE_SIZE = 6;

const posts = [
  { id: 1, title: 'Top 10 Gadgets to Buy in 2024', excerpt: 'The latest tech worth your money this year, from smart TVs to compact speakers and home essentials.', date: 'Oct 28, 2024', category: 'Tech news', readTime: '6 min read', image: '/images/products/product-13.jpg', popular: true },
  { id: 2, title: 'How to Choose the Perfect Laptop', excerpt: 'What to look for in performance, battery life, screen quality and warranty before you pay.', date: 'Oct 25, 2024', category: 'Buying guides', readTime: '8 min read', image: '/images/products/product-23.jpg', popular: true },
  { id: 3, title: 'Smart Home Setup Guide', excerpt: 'Where to start, what to connect first and how to keep your smart home simple to use.', date: 'Oct 22, 2024', category: 'Smart home', readTime: '5 min read', image: '/images/products/product-16.jpg' },
  { id: 4, title: 'Which Washing Machine Fits Your Family?', excerpt: 'Front load or top load, capacity and spin speed explained in plain words so you buy the right size.', date: 'Oct 18, 2024', category: 'Buying guides', readTime: '7 min read', image: '/images/products/product-16.jpg', popular: true },
  { id: 5, title: '5 Ways to Make Your Fridge Last Longer', excerpt: 'Simple habits for cleaning, spacing and temperature that save power and extend the life of your fridge.', date: 'Oct 14, 2024', category: 'Care and tips', readTime: '4 min read', image: '/images/products/product-23.jpg' },
  { id: 6, title: 'Smart TV or Android Box: What Is Better?', excerpt: 'A quick comparison of picture quality, apps and price to help you decide how to stream at home.', date: 'Oct 10, 2024', category: 'Tech news', readTime: '5 min read', image: '/images/products/product-11.jpg' },
  { id: 7, title: 'How to Get the Best Sound From Your Speaker', excerpt: 'Placement, settings and small fixes that make any speaker or sound system sound clearer and fuller.', date: 'Oct 6, 2024', category: 'Care and tips', readTime: '4 min read', image: '/images/products/product-03.jpg', popular: true },
  { id: 8, title: 'Understanding Warranty Before You Buy', excerpt: 'What a warranty really covers, what voids it, and the questions to ask the seller at checkout.', date: 'Oct 2, 2024', category: 'Buying guides', readTime: '5 min read', image: '/images/products/product-13.jpg' },
  { id: 9, title: 'Save Electricity With Smart Plugs and Timers', excerpt: 'Low-cost ways to cut your power bill by controlling when your appliances run.', date: 'Sep 28, 2024', category: 'Smart home', readTime: '5 min read', image: '/images/products/product-11.jpg' },
];

const ts = (p) => Date.parse(p.date) || 0;

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */
const Tag = ({ children, solid = false }) => (
  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${solid ? 'bg-[#FF6C00] text-white' : 'bg-orange-50 text-[#C74F00]'}`}>
    {children}
  </span>
);

const Meta = ({ post }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-gray-500">
    <span className="flex items-center gap-1"><FiCalendar className="h-3 w-3 text-[#FF6C00]" />{post.date}</span>
    <span className="flex items-center gap-1"><FiClock className="h-3 w-3 text-[#FF6C00]" />{post.readTime}</span>
  </div>
);

const PostCard = ({ post }) => (
  <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_14px_32px_-16px_rgba(11,27,51,0.28)]">
    <Link to={`/blog/${post.id}`} className="relative block h-36 overflow-hidden bg-gray-100 sm:h-40" aria-label={post.title}>
      <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute left-3 top-3"><Tag solid>{post.category}</Tag></span>
    </Link>
    <div className="flex flex-1 flex-col p-4">
      <Meta post={post} />
      <h3 className="mt-2 line-clamp-2 text-[15.5px] font-extrabold leading-snug text-[#0B1B33]">
        <Link to={`/blog/${post.id}`} className="transition-colors hover:text-[#FF6C00]">{post.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-600">{post.excerpt}</p>
      <Link to={`/blog/${post.id}`} className="mt-auto inline-flex w-fit items-center gap-1 pt-3 text-[13px] font-bold text-[#FF6C00]">
        Read more
        <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  </article>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useMemo(() => ['All', ...new Set(posts.map((p) => p.category))], []);
  const counts = useMemo(() => {
    const c = { All: posts.length };
    posts.forEach((p) => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, []);
  const popular = useMemo(() => posts.filter((p) => p.popular).slice(0, 4), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => (activeCategory === 'All' || p.category === activeCategory) && (!q || `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q)))
      .sort((a, b) => (sort === 'new' ? ts(b) - ts(a) : ts(a) - ts(b)));
  }, [activeCategory, query, sort]);

  const resetPaging = () => setVisible(PAGE_SIZE);
  const pickCategory = (cat) => { setActiveCategory(cat); resetPaging(); };

  // the featured story is the first result when there is more than one
  const featured = filtered.length > 1 && !query ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;
  const shown = rest.slice(0, visible);

  const blogStructuredData = [
    {
      '@type': 'Blog',
      name: 'RN Smart Electronics Blog',
      description:
        'Buying guides, care tips and smart home advice for TVs, fridges, washing machines and home appliances in Rwanda.',
      url: absoluteUrl('/blog'),
      inLanguage: 'en-RW',
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F4F6] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <Seo
        title="Electronics Buying Guides & Home Appliance Tips | RN Smart Electronics"
        description="Practical buying guides, care tips and smart home advice from RN Smart Electronics in Rwanda. Learn how to choose TVs, fridges, washing machines and more."
        path="/blog"
        noindex={Boolean(query.trim())}
        structuredData={blogStructuredData}
      />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      {/* ---------- Compact banner ---------- */}
      <header className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-[12px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <FiChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-white">Blog</span>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-white sm:text-[30px]">Tech tips and buying guides</h1>
              <p className="mt-1 max-w-[460px] text-[13.5px] text-white/70">Practical advice to pick the right TV, appliance or gadget.</p>
            </div>
            <div role="search" className="flex h-11 w-full max-w-[340px] items-center overflow-hidden rounded-xl bg-white">
              <FiSearch className="ml-3.5 h-[17px] w-[17px] shrink-0 text-[#FF6C00]" />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); resetPaging(); }}
                placeholder="Search articles"
                aria-label="Search articles"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[#0B1B33] placeholder-gray-400 focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ---------- Filters row ---------- */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Article categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => pickCategory(cat)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  activeCategory === cat ? 'bg-[#0B1B33] text-white shadow-md' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:text-[#FF6C00] hover:ring-orange-200'
                }`}
              >
                {cat} <span className={activeCategory === cat ? 'text-white/60' : 'text-gray-400'}>{counts[cat]}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[13px] text-gray-500">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
            >
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ---------- Main column ---------- */}
          <main className="lg:col-span-8">
            {featured && (
              <article className="group mb-5 grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-[0_16px_36px_-16px_rgba(11,27,51,0.28)] sm:grid-cols-[0.9fr_1.1fr]">
                <Link to={`/blog/${featured.id}`} className="relative block h-48 overflow-hidden bg-[#0B1B33] sm:h-full sm:min-h-[220px]" aria-label={featured.title}>
                  <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B33]/40 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#FF6C00] shadow">Featured</span>
                </Link>
                <div className="flex flex-col justify-center p-5">
                  <Tag>{featured.category}</Tag>
                  <h2 className="mt-2.5 text-[20px] font-extrabold leading-tight tracking-tight text-[#0B1B33] sm:text-[22px]">
                    <Link to={`/blog/${featured.id}`} className="transition-colors hover:text-[#FF6C00]">{featured.title}</Link>
                  </h2>
                  <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-gray-600">{featured.excerpt}</p>
                  <div className="mt-3"><Meta post={featured} /></div>
                  <Link to={`/blog/${featured.id}`} className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-orange-500/30 transition-colors hover:bg-[#E65C00]">
                    Read article
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )}

            {shown.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {shown.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {rest.length > visible && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-xl border-2 border-[#FF6C00] px-7 py-2.5 text-[13.5px] font-bold text-[#FF6C00] transition-colors hover:bg-[#FF6C00] hover:text-white"
                >
                  Show more articles
                </button>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00]">
                  <FileSearch className="h-7 w-7" strokeWidth={1.7} />
                </span>
                <h3 className="mt-3 text-[17px] font-extrabold text-[#0B1B33]">No articles found</h3>
                <p className="mt-1 text-[13.5px] text-gray-500">Try another word or choose a different category.</p>
                <button type="button" onClick={() => { setQuery(''); pickCategory('All'); }} className="mt-4 rounded-xl bg-[#FF6C00] px-6 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-[#E65C00]">
                  Show all articles
                </button>
              </div>
            )}
          </main>

          {/* ---------- Sidebar ---------- */}
          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-4 lg:self-start">
            <section className="rounded-2xl border border-gray-200 bg-white p-4" aria-labelledby="popular-title">
              <h2 id="popular-title" className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-[#0B1B33]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6C00]"><FiTrendingUp className="h-4 w-4" /></span>
                Popular reads
              </h2>
              <ul className="divide-y divide-gray-100">
                {popular.map((p) => (
                  <li key={p.id}>
                    <Link to={`/blog/${p.id}`} className="group flex items-center gap-3 py-2.5">
                      <img src={p.image} alt="" loading="lazy" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="line-clamp-2 block text-[13px] font-bold leading-snug text-[#0B1B33] transition-colors group-hover:text-[#FF6C00]">{p.title}</span>
                        <span className="mt-0.5 block text-[11.5px] text-gray-500">{p.readTime}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4" aria-labelledby="topics-title">
              <h2 id="topics-title" className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-[#0B1B33]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6C00]"><FiGrid className="h-4 w-4" /></span>
                Topics
              </h2>
              <ul className="space-y-1">
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => pickCategory(cat)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${activeCategory === cat ? 'bg-orange-50 text-[#FF6C00]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#FF6C00]'}`}
                    >
                      {cat}
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">{counts[cat]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="relative overflow-hidden rounded-2xl bg-[#0B1B33] p-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FF6C00]/30 blur-2xl" />
              <h2 className="relative text-[17px] font-extrabold text-white">Not sure what to buy?</h2>
              <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/70">Tell us what you need and your budget. We will suggest the right product.</p>
              <div className="relative mt-4 flex flex-wrap gap-2">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1DA851]">
                  <FaWhatsapp className="h-4 w-4" />
                  Ask on WhatsApp
                </a>
                <Link to="/shop" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-[13px] font-bold text-[#0B1B33] transition-colors hover:bg-[#FF6C00] hover:text-white">
                  Shop
                  <FiArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Blog;