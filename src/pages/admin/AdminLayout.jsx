import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut,
  FiMenu, FiExternalLink, FiChevronRight, FiHome, FiLayers,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/categories', label: 'Categories', icon: FiLayers },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Customers', icon: FiUsers },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
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

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0B1B33] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A1A] to-[#E65C00] text-[15px] font-black text-white">
          RN
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold leading-tight">Admin panel</p>
          <p className="truncate text-[11.5px] text-white/50">Smart Electronics</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13.5px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#FF6C00] text-white shadow-lg shadow-orange-900/20'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{label}</span>
            <FiChevronRight className="h-4 w-4 opacity-50" />
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <FiHome className="h-[18px] w-[18px]" />
          View storefront
          <FiExternalLink className="ml-auto h-3.5 w-3.5 opacity-50" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-semibold text-red-200 transition-colors hover:bg-red-500/20 hover:text-white"
        >
          <FiLogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85%] shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-[#0B1B33] lg:hidden"
              aria-label="Open admin menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[18px] font-extrabold text-[#0B1B33]">
                {titles[location.pathname] || 'Admin'}
              </h1>
              <p className="hidden text-[11.5px] text-gray-500 sm:block">
                Manage your store, orders and customers
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-[13px] font-bold text-[#0B1B33]">{user?.name}</p>
                <p className="text-[11px] text-gray-500">Administrator</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1B33] text-[14px] font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
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
