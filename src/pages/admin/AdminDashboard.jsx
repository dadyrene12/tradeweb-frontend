import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiAlertTriangle,
  FiArrowUpRight, FiLoader, FiClock,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const monthLabel = (item) => {
  if (!item?._id) return '';
  const date = new Date(item._id.year, item._id.month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [currency, setCurrency] = useState('FRW');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [statsResponse, settingsResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/settings'),
        ]);
        if (!active) return;
        setData(statsResponse.data);
        setCurrency(settingsResponse.data.settings.currency || 'FRW');
      } catch (loadError) {
        if (active) setError(getApiError(loadError).message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const money = (value) => `${currency} ${Math.round(Number(value) || 0).toLocaleString('en-US')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-[14px] text-red-700">
        {error}
      </div>
    );
  }

  const { totals, recentOrders, lowStock, recentUsers, monthlySales } = data;
  const maxRevenue = Math.max(1, ...monthlySales.map((item) => item.revenue));

  const cards = [
    { label: 'Total revenue', value: money(totals.revenue), icon: FiDollarSign, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: totals.orders, note: `${totals.pendingOrders} pending`, icon: FiShoppingBag, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Customers', value: totals.users, icon: FiUsers, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Products', value: totals.products, icon: FiBox, tone: 'bg-orange-50 text-[#FF6C00]' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                <p className="mt-2 text-[26px] font-extrabold leading-none text-[#0B1B33]">{value}</p>
                {note && <p className="mt-2 text-[12px] font-medium text-amber-600">{note}</p>}
              </div>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0B1B33]">Revenue this year</h2>
              <p className="text-[12px] text-gray-500">Last six months of paid orders</p>
            </div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#FF6C00] hover:underline">
              All orders <FiArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {monthlySales.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
              <FiClock className="h-7 w-7 text-gray-300" />
              <p className="mt-2 text-[13px] text-gray-500">No sales data yet.</p>
            </div>
          ) : (
            <div className="flex h-52 items-end gap-3">
              {monthlySales.map((item) => (
                <div key={`${item._id.year}-${item._id.month}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold text-gray-500">{money(item.revenue)}</span>
                  <div
                    className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-t from-[#FF6C00] to-[#FFA45C]"
                    style={{ height: `${Math.max(6, (item.revenue / maxRevenue) * 100)}%` }}
                    title={`${monthLabel(item)}: ${money(item.revenue)} (${item.orders} orders)`}
                  />
                  <span className="text-[11px] font-semibold text-gray-500">{monthLabel(item)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiAlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-[16px] font-extrabold text-[#0B1B33]">Low stock</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-gray-500">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((product) => (
                <li key={product._id} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#0B1B33]">{product.name}</p>
                    <p className="text-[11.5px] text-gray-500">{product.category}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${product.stock === 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/products" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#FF6C00] hover:underline">
            Manage products <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-[16px] font-extrabold text-[#0B1B33]">Recent orders</h2>
            <Link to="/admin/orders" className="text-[12.5px] font-semibold text-[#FF6C00] hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-gray-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="text-[13px]">
                      <td className="px-5 py-3 font-semibold text-[#0B1B33]">
                        #{order._id.slice(-6).toUpperCase()}
                        <p className="text-[11px] font-normal text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#0B1B33]">{order.user?.name || order.shippingAddress?.fullName}</p>
                        <p className="text-[11.5px] text-gray-500">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-3 font-bold text-[#0B1B33]">{money(order.totalAmount)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[order.status] || 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-[#0B1B33]">New customers</h2>
            <Link to="/admin/users" className="text-[12.5px] font-semibold text-[#FF6C00] hover:underline">View all</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-gray-500">No customers yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((user) => (
                <li key={user._id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1B33] text-[12px] font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#0B1B33]">{user.name}</p>
                    <p className="truncate text-[11.5px] text-gray-500">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6C00]">ADMIN</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
