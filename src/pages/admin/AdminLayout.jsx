import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut,
  FiMenu, FiExternalLink, FiHome, FiLayers, FiX, FiCalendar,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/*
  Orange-based theme
  primary  #FF6C00   light  #FFA45C   deep  #E65A00   ink  #0B1B33
*/

const navigationGroups = [
  {
    heading: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: FiGrid, end: true }],
  },
  {
    heading: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: FiBox },
      { to: '/admin/categories', label: 'Categories', icon: FiLayers },
    ],
  },
  {
    heading: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
      { to: '/admin/users', label: 'Customers', icon: FiUsers },
    ],
  },
  {
    heading: 'System',
    items: [{ to: '/admin/settings', label: 'Settings', icon: FiSettings }],
  },
];

const titles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/users': 'Customers',
  '/admin/settings': 'Store settings',
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close the mobile drawer with Escape and lock page scroll while it is open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const pageTitle = titles[location.pathname] || 'Admin';
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  /*
    Sidebar: never scrolls. It is a fixed-height flex column where the nav
    area takes the leftover space and spreads its groups evenly. On short
    screens the group headings and the user card are hidden so everything fits.
  */
  const sidebar = (showClose) => (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#0B1B33] via-[#0d2040] to-[#0B1B33] text-white">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#FF6C00]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-[#FF6C00]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      {/* Brand */}
      <div className="relative flex shrink-0 items-center gap-3 px-5 pb-4 pt-5 [@media(max-height:640px)]:py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFA45C] via-[#FF6C00] to-[#E65A00] text-[15px] font-black text-white shadow-lg shadow-orange-900/40 ring-1 ring-white/25">
          RN
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight">Admin panel</p>
          <p className="truncate text-[11.5px] text-orange-200/70">Smart Electronics</p>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="relative mx-5 h-px shrink-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Navigation – no scrolling, groups share the available height */}
      <nav className="relative flex min-h-0 flex-1 flex-col justify-evenly overflow-hidden px-3 py-2">
        {navigationGroups.map((group) => (
          <div key={group.heading}>
            <p className="mb-1 px-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200/40 [@media(max-height:700px)]:hidden">
              {group.heading}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-all [@media(max-height:640px)]:py-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] text-white shadow-lg shadow-orange-900/40 ring-1 ring-white/20'
                        : 'text-white/65 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#FFA45C]" />
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                          isActive
                            ? 'bg-white/20'
                            : 'bg-white/5 group-hover:bg-[#FF6C00]/25 group-hover:text-orange-200'
                        }`}
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white shadow shadow-white/50" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative shrink-0 space-y-1 border-t border-white/10 bg-black/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 [@media(max-height:700px)]:hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-[13px] font-bold text-white shadow-md shadow-orange-900/30">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-orange-200/70">Administrator</p>
          </div>
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow shadow-emerald-400/60" title="Online" />
        </div>

        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <FiHome className="h-[18px] w-[18px]" />
          View storefront
          <FiExternalLink className="ml-auto h-3.5 w-3.5 opacity-50" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-red-200 transition hover:bg-red-500/20 hover:text-white"
        >
          <FiLogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#FFF8F2] via-[#F7F8FA] to-[#F3F4F6]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] shadow-xl shadow-slate-900/10 lg:block">
        {sidebar(false)}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-[#0B1B33]/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[290px] max-w-[88%] shadow-2xl">{sidebar(true)}</div>
        </div>
      )}

      <div className="lg:pl-[264px]">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/85 backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#E65A00] via-[#FF6C00] to-[#FFA45C]" />
          <div className="flex h-[68px] items-center gap-3 px-4 pt-[3px] sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#E65A00] transition hover:bg-[#FF6C00] hover:text-white lg:hidden"
              aria-label="Open admin menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-[11.5px] text-gray-500 sm:flex">
                <Link to="/admin" className="font-semibold text-[#E65A00] hover:underline">Admin</Link>
                <span aria-hidden="true">/</span>
                <span>{pageTitle}</span>
              </nav>
              <h1 className="truncate text-[19px] font-extrabold leading-tight text-[#0B1B33]">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="hidden items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[12px] font-semibold text-[#E65A00] ring-1 ring-orange-100 md:inline-flex">
                <FiCalendar className="h-3.5 w-3.5" />
                {today}
              </span>

              <Link
                to="/"
                className="hidden items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#E65A00] transition hover:bg-[#FF6C00] hover:text-white sm:inline-flex"
              >
                View store <FiExternalLink className="h-3.5 w-3.5" />
              </Link>

              <div className="flex items-center gap-3 rounded-full bg-white py-1 pl-1 pr-1 ring-1 ring-orange-100 sm:pl-4">
                <div className="hidden text-right sm:block">
                  <p className="text-[13px] font-bold leading-tight text-[#0B1B33]">{user?.name}</p>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#FF6C00]">Administrator</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-[14px] font-bold text-white shadow-md shadow-orange-300/50">
                  {initial}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;