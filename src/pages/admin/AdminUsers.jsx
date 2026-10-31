import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiSearch, FiEdit2, FiTrash2, FiX, FiLoader, FiChevronLeft, FiChevronRight,
  FiUsers, FiCheckCircle, FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api, { getApiError } from '../../lib/api';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('FRW');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'user', isEmailVerified: false });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const money = (value) => `${currency} ${Math.round(Number(value) || 0).toLocaleString('en-US')}`;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/users', {
        params: { search: query || undefined, role: role || undefined, page, limit: 10 },
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (loadError) {
      setError(getApiError(loadError).message);
    } finally {
      setLoading(false);
    }
  }, [query, role, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => setCurrency(data.settings.currency || 'FRW'))
      .catch(() => {});
  }, []);

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || '',
      role: user.role || 'user',
      isEmailVerified: Boolean(user.isEmailVerified),
    });
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.patch(`/admin/users/${editing._id}`, form);
      toast.success('Customer updated');
      setEditing(null);
      loadUsers();
    } catch (saveError) {
      setFormError(getApiError(saveError).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else loadUsers();
    } catch (deleteError) {
      toast.error(getApiError(deleteError).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-extrabold text-[#0B1B33]">Customers</h2>
        <p className="text-[12.5px] text-gray-500">{total} registered account{total === 1 ? '' : 's'}</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="h-11 w-full rounded-xl border-2 border-gray-200 bg-white pl-9 pr-3 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(event) => { setRole(event.target.value); setPage(1); }}
          className="h-11 rounded-xl border-2 border-gray-200 bg-white px-3 text-[13px] font-semibold text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
        >
          <option value="">All roles</option>
          <option value="admin">Administrators</option>
          <option value="user">Customers</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading customers...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FiUsers className="h-7 w-7" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#0B1B33]">No customers found</p>
            <p className="mt-1 text-[13px] text-gray-500">New accounts will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Verified</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Spent</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="text-[13px]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B1B33] text-[12px] font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0B1B33]">
                            {user.name}
                            {String(user._id) === String(currentUser?._id || currentUser?.id) && (
                              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">YOU</span>
                            )}
                          </p>
                          <p className="truncate text-[11.5px] text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${user.role === 'admin' ? 'border-orange-200 bg-orange-50 text-[#FF6C00]' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                        {user.role === 'admin' && <FiShield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
                          <FiCheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0B1B33]">{user.orderCount}</td>
                    <td className="px-4 py-3 font-bold text-[#0B1B33]">{money(user.totalSpent)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          aria-label={`Edit ${user.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          disabled={String(user._id) === String(currentUser?._id || currentUser?.id)}
                          aria-label={`Delete ${user.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-[17px] font-extrabold text-[#0B1B33]">Edit customer</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{formError}</div>
              )}

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Full name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-[13.5px] focus:border-[#FF6C00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Email</label>
                <input value={editing.email} disabled className="h-11 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 text-[13.5px] text-gray-500" />
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Role</label>
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  className="h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-[13.5px] font-semibold focus:border-[#FF6C00] focus:outline-none"
                >
                  <option value="user">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.isEmailVerified}
                  onChange={(event) => setForm((prev) => ({ ...prev, isEmailVerified: event.target.checked }))}
                  className="h-[18px] w-[18px] rounded border-gray-300 text-[#FF6C00] focus:ring-[#FF6C00]"
                />
                <span className="text-[13px] font-semibold text-[#0B1B33]">Email verified</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65C00] disabled:opacity-60">
                  {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FiTrash2 className="h-6 w-6" />
            </div>
            <h3 className="text-[17px] font-extrabold text-[#0B1B33]">Delete customer?</h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-gray-600">
              <b>{deleteTarget.name}</b> ({deleteTarget.email}) will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting && <FiLoader className="h-4 w-4 animate-spin" />}
                Delete customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
