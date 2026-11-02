import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiSearch, FiEye, FiX, FiLoader, FiChevronLeft, FiChevronRight,
  FiTrash2, FiShoppingBag, FiTruck, FiMapPin, FiPhone,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';
import { formatMoney as money } from '../../lib/currency';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/orders', {
        params: { search: query || undefined, status: status || undefined, page, limit: 10 },
      });
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (loadError) {
      setError(getApiError(loadError).message);
    } finally {
      setLoading(false);
    }
  }, [query, status, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openOrder = async (order) => {
    setLoadingOrder(true);
    setSelected(order);
    try {
      const { data } = await api.get(`/admin/orders/${order._id}`);
      setSelected(data.order);
    } catch (loadError) {
      toast.error(getApiError(loadError).message);
    } finally {
      setLoadingOrder(false);
    }
  };

  const changeStatus = async (nextStatus) => {
    if (!selected) return;
    setSavingStatus(true);
    try {
      const { data } = await api.patch(`/admin/orders/${selected._id}/status`, { status: nextStatus });
      setSelected((prev) => ({ ...prev, status: data.order.status }));
      setOrders((prev) => prev.map((item) => (item._id === selected._id ? { ...item, status: data.order.status } : item)));
      toast.success('Order status updated');
    } catch (saveError) {
      toast.error(getApiError(saveError).message);
    } finally {
      setSavingStatus(false);
    }
  };

  const deleteOrder = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${selected._id}`);
      toast.success('Order deleted');
      setSelected(null);
      loadOrders();
    } catch (deleteError) {
      toast.error(getApiError(deleteError).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-extrabold text-[#0B1B33]">Orders</h2>
        <p className="text-[12.5px] text-gray-500">{total} order{total === 1 ? '' : 's'} received</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer or phone"
            className="h-11 w-full rounded-xl border-2 border-gray-200 bg-white pl-9 pr-3 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          className="h-11 rounded-xl border-2 border-gray-200 bg-white px-3 text-[13px] font-semibold text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FiShoppingBag className="h-7 w-7" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#0B1B33]">No orders found</p>
            <p className="mt-1 text-[13px] text-gray-500">Orders will appear here when customers check out.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="text-[13px]">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#0B1B33]">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[11px] text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0B1B33]">{order.user?.name || order.shippingAddress?.fullName}</p>
                      <p className="text-[11.5px] text-gray-500">{order.contactEmail || order.user?.email || order.shippingAddress?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 font-bold text-[#0B1B33]">{money(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-gray-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]"
                      >
                        <FiEye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-[12px] text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-[12px] font-semibold text-gray-600 disabled:opacity-40">
                <FiChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-[12px] font-semibold text-gray-600 disabled:opacity-40">
                Next <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#0B1B33]">Order #{selected._id.slice(-6).toUpperCase()}</h3>
                <p className="text-[12px] text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {loadingOrder ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading order...
              </div>
            ) : (
              <div className="space-y-5 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                      <FiMapPin className="h-3.5 w-3.5" /> Shipping address
                    </div>
                    <p className="text-[13.5px] font-bold text-[#0B1B33]">{selected.shippingAddress?.fullName}</p>
                    <p className="text-[13px] leading-relaxed text-gray-600">
                      {selected.shippingAddress?.address}, {selected.shippingAddress?.city}, {selected.shippingAddress?.postalCode}, {selected.shippingAddress?.country}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-gray-600">
                      <FiPhone className="h-3.5 w-3.5" /> {selected.shippingAddress?.phone}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                      <FiTruck className="h-3.5 w-3.5" /> Delivery & payment
                    </div>
                    <p className="text-[13px] text-gray-600">Payment: <b className="text-[#0B1B33]">{selected.paymentMethod}</b></p>
                    <p className="text-[13px] text-gray-600">Customer: <b className="text-[#0B1B33]">{selected.user?.name || selected.shippingAddress?.fullName || 'Guest'}</b></p>
                    <p className="text-[13px] text-gray-600">Email: <b className="text-[#0B1B33]">{selected.contactEmail || selected.user?.email || '-'}</b></p>
                    <p className="text-[13px] text-gray-600">Source: <b className="text-[#0B1B33] capitalize">{selected.source || 'web'}</b></p>
                    {selected.orderRef && (
                      <p className="text-[13px] text-gray-600">Order ref: <b className="text-[#0B1B33]">{selected.orderRef}</b></p>
                    )}
                    {selected.note && (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-[12.5px] text-gray-600">{selected.note}</p>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Product</th>
                        <th className="px-4 py-2.5 font-semibold">Price</th>
                        <th className="px-4 py-2.5 font-semibold">Qty</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selected.items || []).map((item, index) => (
                        <tr key={item._id || index} className="text-[13px]">
                          <td className="px-4 py-3 font-semibold text-[#0B1B33]">{item.name}</td>
                          <td className="px-4 py-3 text-gray-600">{money(item.price)}</td>
                          <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#0B1B33]">{money(Number(item.price) * Number(item.quantity))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-gray-500">Total</td>
                        <td className="px-4 py-3 text-right text-[15px] font-extrabold text-[#0B1B33]">{money(selected.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-bold text-[#0B1B33]">Status</span>
                    <select
                      value={selected.status}
                      onChange={(event) => changeStatus(event.target.value)}
                      disabled={savingStatus}
                      className="h-10 rounded-xl border-2 border-gray-200 bg-white px-3 text-[13px] font-semibold capitalize text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none disabled:opacity-60"
                    >
                      {statuses.map((item) => (
                        <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>
                      ))}
                    </select>
                    {savingStatus && <FiLoader className="h-4 w-4 animate-spin text-gray-500" />}
                  </div>

                  <button
                    type="button"
                    onClick={deleteOrder}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-[12.5px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {deleting ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
                    Delete order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
