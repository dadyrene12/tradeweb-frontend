import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiBox, FiAlertTriangle,
  FiArrowUpRight, FiRefreshCw, FiClock, FiPlus, FiPackage, FiInbox, FiAward,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';
import { formatMoney as money } from '../../lib/currency';

/*
  Orange-based theme
  primary  #FF6C00   light  #FFA45C   deep  #E65A00   ink  #0B1B33
*/

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-orange-50 text-orange-700 ring-orange-200',
  shipped: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

const statusDots = {
  pending: 'bg-amber-500',
  processing: 'bg-orange-500',
  shipped: 'bg-sky-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

const avatarTones = [
  'bg-gradient-to-br from-[#FF6C00] to-[#FFA45C]',
  'bg-gradient-to-br from-[#E65A00] to-[#FF6C00]',
  'bg-gradient-to-br from-[#FF8A2B] to-[#FFB066]',
  'bg-gradient-to-br from-[#C2410C] to-[#FB923C]',
  'bg-gradient-to-br from-[#0B1B33] to-[#2a4470]',
];

const monthLabel = (item) => {
  if (!item?._id) return '';
  const date = new Date(item._id.year, item._id.month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

const toneFor = (text = '') =>
  avatarTones[[...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % avatarTones.length];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Card = ({ className = '', children }) => (
  <div className={`rounded-2xl border border-orange-100 bg-white shadow-[0_2px_12px_-4px_rgba(255,108,0,0.12)] ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle, to, linkLabel = 'View all', icon: Icon }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-white shadow-sm shadow-orange-300/50">
        {Icon ? <Icon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <div>
        <h2 className="text-[15px] font-extrabold leading-tight text-[#0B1B33]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
    {to && (
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-3 py-1.5 text-[12.5px] font-semibold text-[#E65A00] transition hover:bg-[#FF6C00] hover:text-white"
      >
        {linkLabel} <FiArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    )}
  </div>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-10 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#FFA45C] shadow-sm ring-1 ring-orange-100">
      <Icon className="h-5 w-5" />
    </span>
    <p className="mt-3 text-[13px] text-gray-500">{text}</p>
  </div>
);

const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-2xl bg-orange-100/60 ${className}`} />;

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-32" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Skeleton className="h-80 xl:col-span-2" />
      <Skeleton className="h-80" />
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Skeleton className="h-80 xl:col-span-2" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const statsResponse = await api.get('/admin/stats');
      setData(statsResponse.data);
    } catch (loadError) {
      setError(getApiError(loadError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const monthlySales = data?.monthlySales || [];

  const salesSummary = useMemo(() => {
    if (monthlySales.length === 0) return null;
    const total = monthlySales.reduce((sum, item) => sum + item.revenue, 0);
    const orders = monthlySales.reduce((sum, item) => sum + (item.orders || 0), 0);
    const best = monthlySales.reduce((top, item) => (item.revenue > top.revenue ? item : top), monthlySales[0]);
    return { total, orders, average: total / monthlySales.length, best };
  }, [monthlySales]);

  if (loading) return <DashboardSkeleton />;

  if (error && !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-orange-200 bg-orange-50 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#FF6C00] shadow-sm">
          <FiAlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-[16px] font-extrabold text-[#0B1B33]">Couldn't load the dashboard</h2>
        <p className="mt-1 text-[13.5px] text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => load()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-orange-300/50 transition hover:bg-[#E65A00]"
        >
          <FiRefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }

  const { totals, recentOrders, lowStock, recentUsers } = data;
  const maxRevenue = Math.max(1, ...monthlySales.map((item) => item.revenue));
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const cards = [
    {
      label: 'Total revenue', value: money(totals.revenue), note: 'All paid orders',
      icon: FiTrendingUp, featured: true,
    },
    {
      label: 'Orders', value: totals.orders, note: `${totals.pendingOrders} pending`,
      icon: FiShoppingBag,
    },
    {
      label: 'Customers', value: totals.users, note: 'Registered accounts',
      icon: FiUsers,
    },
    {
      label: 'Products', value: totals.products, note: `${lowStock.length} low on stock`,
      icon: FiBox,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E65A00] via-[#FF6C00] to-[#FFA45C] p-6 text-white shadow-xl shadow-orange-300/40 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-10 top-10 h-24 w-24 rounded-full border-[14px] border-white/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11.5px] font-semibold tracking-wide backdrop-blur">
              {today}
            </span>
            <h1 className="mt-3 text-[26px] font-extrabold leading-tight sm:text-[32px]">{greeting()}, Admin 👋</h1>
            <p className="mt-1.5 max-w-xl text-[14px] text-orange-50">
              {totals.pendingOrders > 0
                ? `You have ${totals.pendingOrders} pending ${totals.pendingOrders === 1 ? 'order' : 'orders'} waiting for review.`
                : 'All caught up — no pending orders right now.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-[#E65A00] shadow-md shadow-orange-900/10 transition hover:bg-orange-50"
            >
              <FiPlus className="h-4 w-4" /> Add product
            </Link>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1B33] px-4 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-orange-900/20 transition hover:bg-[#12284a]"
            >
              <FiPackage className="h-4 w-4" /> Manage orders
            </Link>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/30 disabled:opacity-60"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Couldn't refresh the latest data: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, featured }) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5 ${
              featured
                ? 'bg-gradient-to-br from-[#0B1B33] to-[#1b3a68] text-white shadow-lg shadow-slate-300'
                : 'border border-orange-100 bg-white shadow-[0_2px_12px_-4px_rgba(255,108,0,0.12)] hover:shadow-lg hover:shadow-orange-200/60'
            }`}
          >
            {!featured && <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#FF6C00] to-[#FFA45C]" />}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FF6C00]/10 transition group-hover:scale-125" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-[11.5px] font-semibold uppercase tracking-wider ${featured ? 'text-orange-300' : 'text-gray-500'}`}>
                  {label}
                </p>
                <p className={`mt-2.5 truncate text-[28px] font-extrabold leading-none tracking-tight ${featured ? 'text-white' : 'text-[#0B1B33]'}`}>
                  {value}
                </p>
                <p className={`mt-2.5 text-[12px] font-medium ${featured ? 'text-blue-100/80' : 'text-[#E65A00]'}`}>{note}</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-white shadow-md shadow-orange-400/40 transition group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + low stock */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <SectionHeader
            title="Revenue overview"
            subtitle="Last six months of paid orders"
            to="/admin/orders"
            linkLabel="All orders"
            icon={FiTrendingUp}
          />

          {salesSummary && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Period total', value: money(salesSummary.total) },
                { label: 'Monthly average', value: money(salesSummary.average) },
                { label: 'Best month', value: monthLabel(salesSummary.best), sub: money(salesSummary.best.revenue), icon: FiAward },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/60 px-4 py-3 ring-1 ring-orange-100">
                  <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#E65A00]">
                    {stat.icon && <stat.icon className="h-3 w-3" />} {stat.label}
                  </p>
                  <p className="mt-1 truncate text-[16px] font-extrabold text-[#0B1B33]">{stat.value}</p>
                  {stat.sub && <p className="truncate text-[11px] text-gray-500">{stat.sub}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            {monthlySales.length === 0 ? (
              <EmptyState icon={FiClock} text="No sales data yet." />
            ) : (
              <div className="relative h-60 pl-1">
                {/* gridlines */}
                <div className="pointer-events-none absolute inset-x-0 bottom-7 top-2 flex flex-col justify-between">
                  {[100, 75, 50, 25, 0].map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-right text-[10px] font-medium text-gray-400">
                        {money((maxRevenue * p) / 100)}
                      </span>
                      <div className={`h-px flex-1 ${p === 0 ? 'bg-orange-200' : 'border-t border-dashed border-orange-100'}`} />
                    </div>
                  ))}
                </div>

                {/* bars */}
                <div className="absolute inset-x-0 bottom-0 top-2 flex items-end gap-2 pl-16 sm:gap-4">
                  {monthlySales.map((item, index) => {
                    const isLatest = index === monthlySales.length - 1;
                    const isBest = item === salesSummary?.best;
                    return (
                      <div
                        key={`${item._id.year}-${item._id.month}`}
                        className="group relative flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <div className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-[#0B1B33] px-2.5 py-1.5 text-center opacity-0 shadow-lg transition group-hover:opacity-100">
                          <p className="text-[11px] font-bold text-white">{money(item.revenue)}</p>
                          <p className="text-[10px] text-orange-300">{item.orders} orders</p>
                        </div>
                        <div className="flex w-full flex-1 items-end justify-center pb-7">
                          <div
                            className={`w-full max-w-[52px] rounded-t-xl transition-all duration-300 group-hover:brightness-110 ${
                              isLatest || isBest
                                ? 'bg-gradient-to-t from-[#E65A00] via-[#FF6C00] to-[#FFA45C] shadow-[0_8px_18px_-6px_rgba(255,108,0,0.7)]'
                                : 'bg-gradient-to-t from-[#FFB57A] to-[#FFD9B8]'
                            }`}
                            style={{ height: `${Math.max(4, (item.revenue / maxRevenue) * 100)}%` }}
                            title={`${monthLabel(item)}: ${money(item.revenue)} (${item.orders} orders)`}
                          />
                        </div>
                        <span className={`absolute bottom-0 text-[11.5px] font-semibold ${isLatest ? 'text-[#FF6C00]' : 'text-gray-500'}`}>
                          {monthLabel(item)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <SectionHeader
            title="Low stock"
            subtitle={lowStock.length ? `${lowStock.length} ${lowStock.length === 1 ? 'product needs' : 'products need'} attention` : 'Inventory health'}
            icon={FiAlertTriangle}
          />
          <div className="mt-5 flex-1">
            {lowStock.length === 0 ? (
              <EmptyState icon={FiBox} text="All products are well stocked." />
            ) : (
              <ul className="space-y-4">
                {lowStock.map((product) => {
                  const out = product.stock === 0;
                  return (
                    <li key={product._id} className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-orange-50 ring-1 ring-orange-100">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-orange-300">
                            <FiBox className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-semibold text-[#0B1B33]">{product.name}</p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ring-inset ${
                              out ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-orange-50 text-[#E65A00] ring-orange-200'
                            }`}
                          >
                            {out ? 'Out of stock' : `${product.stock} left`}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-gray-500">{product.category}</p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-orange-100">
                          <div
                            className={`h-full rounded-full ${out ? 'bg-red-500' : 'bg-gradient-to-r from-[#FF6C00] to-[#FFA45C]'}`}
                            style={{ width: `${Math.min(100, Math.max(out ? 4 : 8, (product.stock / 10) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Link
            to="/admin/products"
            className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-orange-300/50 transition hover:from-[#E65A00] hover:to-[#FF6C00]"
          >
            Manage products <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Orders + customers */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="border-b border-orange-100 px-5 py-4 sm:px-6">
            <SectionHeader title="Recent orders" subtitle="Latest activity across your store" to="/admin/orders" icon={FiShoppingBag} />
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={FiInbox} text="No orders yet." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead className="bg-orange-50/70 text-[11px] uppercase tracking-wider text-[#E65A00]">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold sm:pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {recentOrders.map((order) => {
                    const customer = order.user?.name || order.shippingAddress?.fullName || 'Guest';
                    return (
                      <tr key={order._id} className="text-[13px] transition hover:bg-orange-50/50">
                        <td className="px-5 py-3.5 sm:px-6">
                          <span className="rounded-md bg-orange-50 px-2 py-1 font-mono text-[12px] font-bold text-[#E65A00] ring-1 ring-orange-100">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${toneFor(customer)}`}>
                              {customer.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#0B1B33]">{customer}</p>
                              {order.user?.email && <p className="truncate text-[11.5px] text-gray-500">{order.user.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#0B1B33]">{money(order.totalAmount)}</td>
                        <td className="px-5 py-3.5 sm:pr-6">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset ${
                              statusStyles[order.status] || 'bg-gray-50 text-gray-600 ring-gray-200'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDots[order.status] || 'bg-gray-400'}`} />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeader title="New customers" subtitle="Latest sign-ups" to="/admin/users" icon={FiUsers} />
          <div className="mt-5">
            {recentUsers.length === 0 ? (
              <EmptyState icon={FiUsers} text="No customers yet." />
            ) : (
              <ul className="space-y-1">
                {recentUsers.map((user) => (
                  <li key={user._id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-orange-50/60">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-sm ${toneFor(user.name)}`}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0B1B33]">{user.name}</p>
                      <p className="truncate text-[11.5px] text-gray-500">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <span className="rounded-full bg-gradient-to-r from-[#FF6C00] to-[#FFA45C] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                        ADMIN
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;