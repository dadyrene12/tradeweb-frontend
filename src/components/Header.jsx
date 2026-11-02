import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiUser, FiShoppingCart, FiSearch, FiMenu, FiX, FiGrid,
  FiChevronDown, FiChevronRight, FiHeart, FiRepeat, FiTruck,
  FiMapPin, FiLogOut, FiPhone,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Tv, WashingMachine, Refrigerator, CookingPot, Speaker, Blend, Flame, House } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/currency';

const PHONE_DISPLAY = '+250 722 189 516';
const WHATSAPP_LINK = 'https://wa.me/250722189516';

const categories = [
  { name: 'Smart TVs', link: '/shop?category=audio', icon: Tv },
  { name: 'Washing Machines', link: '/shop?category=appliances', icon: WashingMachine },
  { name: 'Fridges & Freezers', link: '/shop?category=appliances', icon: Refrigerator },
  { name: 'Cooking Machines', link: '/shop?category=appliances', icon: CookingPot },
  { name: 'Radio & Speakers', link: '/shop?category=audio', icon: Speaker },
  { name: 'Blenders', link: '/shop?category=appliances', icon: Blend },
  { name: 'Kettles & Jiko', link: '/shop?category=appliances', icon: Flame },
  { name: 'Home Essentials', link: '/shop', icon: House },
];

const navLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'Shop', to: '/shop', end: true },
  { label: 'Smart TVs', to: '/shop?category=audio', secondary: true },
  { label: 'Home Appliances', to: '/shop?category=appliances', secondary: true },
  { label: 'Audio', to: '/shop?category=audio', secondary: true },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

const IconAction = ({ to, icon: Icon, label, className = '' }) => (
  <Link
    to={to}
    className={`group flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[#0B1B33] transition-colors hover:text-[#FF6C00] ${className}`}
  >
    <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
    <span className="text-[11px] font-semibold text-gray-500 group-hover:text-[#FF6C00]">{label}</span>
  </Link>
);

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchCat, setSearchCat] = useState('');
  const { getCartCount, getCartTotal } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setCatMenuOpen(false);
  }, [location.pathname, location.search]);

  // lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (searchCat) params.set('category', searchCat);
    navigate(`/shop${params.toString() ? `?${params}` : ''}`);
    setMobileMenuOpen(false);
  };

  const cartCount = getCartCount();
  const firstName = user?.name?.split(' ')[0];

  const SearchForm = ({ compact = false }) => (
    <form
      onSubmit={handleSearch}
      role="search"
      className={`flex w-full items-center overflow-hidden rounded-xl border-2 border-[#E5E7EB] bg-white transition-colors focus-within:border-[#FF6C00] ${compact ? 'h-11' : 'h-12'}`}
    >
      {!compact && (
        <div className="relative hidden h-full items-center border-r border-[#E5E7EB] bg-[#F8FAFC] sm:flex">
          <select
            value={searchCat}
            onChange={(e) => setSearchCat(e.target.value)}
            aria-label="Search category"
            className="h-full cursor-pointer appearance-none bg-transparent py-0 pl-4 pr-9 text-[13px] font-semibold text-[#0B1B33] focus:outline-none"
          >
            <option value="">All</option>
            <option value="audio">TVs & Audio</option>
            <option value="appliances">Appliances</option>
          </select>
          <FiChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
        </div>
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands and categories"
        aria-label="Search products"
        className="h-full min-w-0 flex-1 bg-transparent px-4 text-[14px] text-[#0B1B33] placeholder-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-full items-center gap-2 bg-[#FF6C00] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#E65C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      >
        <FiSearch className="h-[18px] w-[18px]" />
        <span className="hidden md:inline">Search</span>
      </button>
    </form>
  );

  const linkClass = ({ isActive }) =>
    `relative block px-3 py-4 text-[14px] font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition-all xl:px-4 xl:after:inset-x-4 ${
      isActive
        ? 'text-[#FF6C00] after:bg-[#FF6C00]'
        : 'text-[#0B1B33] after:bg-transparent hover:text-[#FF6C00] hover:after:bg-[#FF6C00]/40'
    }`;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white shadow-[0_2px_12px_rgba(11,27,51,0.06)]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ============ Top utility bar ============ */}
      <div className="hidden bg-[#0B1B33] text-white lg:block">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-4 text-[12px] sm:px-6 lg:px-8">
          <div className="flex items-center gap-5 text-white/80">
            <span className="flex items-center gap-2">
              <FiTruck className="h-4 w-4 text-[#FF6C00]" />
              Free shipping on orders over FRW 100,000
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4 text-[#FF6C00]" />
              Delivery across Rwanda
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/track" className="text-white/80 transition-colors hover:text-white">Track order</Link>
            <Link to="/contact" className="text-white/80 transition-colors hover:text-white">Help center</Link>
            <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`} className="flex items-center gap-1.5 font-semibold text-white">
              <FiPhone className="h-3.5 w-3.5 text-[#FF6C00]" />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      {/* ============ Main row ============ */}
      <div className="border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3 sm:gap-4 lg:gap-6 lg:py-4">

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00] lg:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="Smart Electronics home">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A1A] to-[#E65C00] text-[16px] font-black tracking-tight text-white shadow-md shadow-orange-500/30 transition-transform group-hover:scale-105 lg:h-12 lg:w-12">
                RN
              </span>
              <span className="hidden flex-col leading-none sm:flex">
                <span className="text-[20px] font-extrabold tracking-tight text-[#0B1B33] lg:text-[22px]">Smart Electronics</span>
                <span className="mt-1.5 text-[11px] font-medium text-gray-500">Smart choice, better life</span>
              </span>
            </Link>

            {/* Search (desktop) */}
            <div className="hidden max-w-[720px] flex-1 lg:block">
              <SearchForm />
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="group mr-2 hidden items-center gap-2.5 rounded-xl bg-[#25D366]/10 py-1.5 pl-1.5 pr-4 transition-colors hover:bg-[#25D366] xl:flex"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366] text-white transition-colors group-hover:bg-white group-hover:text-[#25D366]">
                  <FaWhatsapp className="h-6 w-6" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-[11px] font-semibold text-[#128C7E] group-hover:text-white/85">Chat with us</span>
                  <span className="block text-[13.5px] font-bold text-[#0B1B33] group-hover:text-white">WhatsApp</span>
                </span>
              </a>

              <IconAction to="/compare" icon={FiRepeat} label="Compare" className="hidden md:flex" />
              <IconAction to="/wishlist" icon={FiHeart} label="Wishlist" className="hidden md:flex" />

              {user ? (
                <IconAction to="/account" icon={FiUser} label={firstName || 'Account'} className="hidden sm:flex" />
              ) : (
                <IconAction to="/login" icon={FiUser} label="Sign in" className="hidden sm:flex" />
              )}

              {/* Cart */}
              <Link
                to="/cart"
                aria-label={`Cart, ${cartCount} items`}
                className="group ml-1 flex items-center gap-3 rounded-xl bg-[#0B1B33] py-2 pl-3 pr-4 text-white transition-colors hover:bg-[#FF6C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00]"
              >
                <span className="relative">
                  <FiShoppingCart className="h-[22px] w-[22px]" />
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF6C00] px-1 text-[10px] font-bold text-white ring-2 ring-[#0B1B33] transition-colors group-hover:bg-[#0B1B33] group-hover:ring-[#FF6C00]">
                    {cartCount}
                  </span>
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-[11px] text-white/65 group-hover:text-white/85">My cart</span>
                  <span className="block text-[14px] font-bold">{formatMoney(getCartTotal())}</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Search (mobile / tablet) */}
          <div className="pb-3 lg:hidden">
            <SearchForm compact />
          </div>
        </div>
      </div>

      {/* ============ Navigation bar (desktop) ============ */}
      <nav className="hidden border-b border-[#E5E7EB] bg-white lg:block" aria-label="Main">
        <div className="mx-auto flex max-w-[1400px] items-stretch justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-stretch">
            {/* Categories dropdown */}
            <div
              className="relative mr-3 flex xl:mr-4"
              onMouseEnter={() => setCatMenuOpen(true)}
              onMouseLeave={() => setCatMenuOpen(false)}
            >
              <button
                type="button"
                aria-expanded={catMenuOpen}
                aria-haspopup="true"
                onClick={() => setCatMenuOpen((o) => !o)}
                className="my-2 flex w-[250px] items-center gap-3 rounded-xl bg-[#FF6C00] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#E65C00]"
              >
                <FiGrid className="h-5 w-5" />
                <span className="flex-1 text-left">All categories</span>
                <FiChevronDown className={`h-4 w-4 transition-transform duration-200 ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {catMenuOpen && (
                <div className="absolute left-0 top-full z-50 w-[250px] pt-0">
                  <ul className="overflow-hidden rounded-b-2xl border border-t-0 border-[#E5E7EB] bg-white p-2 shadow-[0_20px_40px_-12px_rgba(11,27,51,0.25)]">
                    {categories.map((cat) => (
                      <li key={cat.name}>
                        <Link
                          to={cat.link}
                          className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-orange-50"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF6C00] transition-colors group-hover:bg-[#FF6C00] group-hover:text-white">
                            <cat.icon className="h-5 w-5" strokeWidth={1.9} />
                          </span>
                          <span className="flex-1 text-[13.5px] font-semibold text-[#1F2937] group-hover:text-[#FF6C00]">{cat.name}</span>
                          <FiChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6C00]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Links */}
            <ul className="flex items-stretch">
              {navLinks.map((l) => (
                <li key={l.label} className={l.secondary ? 'hidden xl:block' : ''}>
                  <NavLink to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 text-[13px] font-semibold xl:gap-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="rounded-lg bg-orange-50 px-3 py-1.5 font-bold text-[#FF6C00] transition-colors hover:bg-[#FF6C00] hover:text-white">
                    Admin
                  </Link>
                )}
                <Link to="/account" className="text-[#0B1B33] transition-colors hover:text-[#FF6C00]">My account</Link>
                <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-red-500">
                  <FiLogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[#0B1B33] transition-colors hover:text-[#FF6C00]">Sign in</Link>
                <Link to="/register" className="rounded-lg border-2 border-[#FF6C00] px-4 py-1.5 text-[#FF6C00] transition-colors hover:bg-[#FF6C00] hover:text-white">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ============ Mobile drawer ============ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-[#0B1B33]/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[360px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <Link to="/" className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A1A] to-[#E65C00] text-[14px] font-black text-white">RN</span>
                <span className="text-[17px] font-extrabold text-[#0B1B33]">Smart Electronics</span>
              </Link>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-0.5">
                {navLinks.map((l) => (
                  <li key={l.label}>
                    <NavLink
                      to={l.to}
                      end={l.end}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold ${isActive ? 'bg-orange-50 text-[#FF6C00]' : 'text-[#0B1B33] hover:bg-gray-50'}`
                      }
                    >
                      {l.label}
                      <FiChevronRight className="h-4 w-4 text-gray-300" />
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Categories accordion */}
              <button
                type="button"
                onClick={() => setMobileCatsOpen((o) => !o)}
                aria-expanded={mobileCatsOpen}
                className="mt-3 flex w-full items-center gap-3 rounded-xl bg-[#FF6C00] px-4 py-3 text-[15px] font-bold text-white"
              >
                <FiGrid className="h-5 w-5" />
                <span className="flex-1 text-left">All categories</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${mobileCatsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCatsOpen && (
                <ul className="mt-2 grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <li key={cat.name}>
                      <Link to={cat.link} className="flex h-full flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] p-3 text-center hover:border-[#FF6C00] hover:bg-orange-50">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
                          <cat.icon className="h-6 w-6" strokeWidth={1.8} />
                        </span>
                        <span className="text-[12.5px] font-semibold leading-tight text-[#0B1B33]">{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { to: '/compare', icon: FiRepeat, label: 'Compare' },
                  { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
                  { to: '/track', icon: FiTruck, label: 'Track' },
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={label} to={to} className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 py-3 text-[12px] font-semibold text-[#0B1B33] hover:bg-orange-50 hover:text-[#FF6C00]">
                    <Icon className="h-5 w-5 text-[#FF6C00]" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-[#E5E7EB] p-4">
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-[14px] font-bold text-white">
                <FaWhatsapp className="h-5 w-5" /> Chat on WhatsApp
              </a>
              {user ? (
                <div className="space-y-2">
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block rounded-xl bg-orange-50 py-3 text-center text-[14px] font-bold text-[#FF6C00]">
                      Admin dashboard
                    </Link>
                  )}
                  <div className="flex gap-2">
                    <Link to="/account" className="flex-1 rounded-xl bg-[#0B1B33] py-3 text-center text-[14px] font-bold text-white">
                      My account ({firstName})
                    </Link>
                    <button type="button" onClick={handleLogout} aria-label="Sign out" className="flex w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <FiLogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1 rounded-xl bg-[#0B1B33] py-3 text-center text-[14px] font-bold text-white">Sign in</Link>
                  <Link to="/register" className="flex-1 rounded-xl border-2 border-[#FF6C00] py-3 text-center text-[14px] font-bold text-[#FF6C00]">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;