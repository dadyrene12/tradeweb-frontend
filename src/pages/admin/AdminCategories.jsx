import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiLoader, FiLayers, FiImage, FiUpload,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  image: '',
  order: 0,
  active: true,
};

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.categories || []);
    } catch (loadError) {
      setError(getApiError(loadError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      order: category.order || 0,
      active: category.active !== false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !editing && !prev.slug) next.slug = slugify(value);
      return next;
    });
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const urls = data.urls || [];
      if (urls.length) {
        setForm((prev) => ({ ...prev, image: urls[0] }));
        toast.success('Image uploaded');
      }
    } catch (uploadError) {
      toast.error(getApiError(uploadError).message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
      image: form.image.trim(),
      order: Number(form.order) || 0,
      active: Boolean(form.active),
    };

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing._id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created');
      }
      setModalOpen(false);
      loadCategories();
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
      await api.delete(`/admin/categories/${deleteTarget._id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      loadCategories();
    } catch (deleteError) {
      toast.error(getApiError(deleteError).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold text-[#0B1B33]">Categories</h2>
          <p className="text-[12.5px] text-gray-500">Manage product categories shown on the store.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#E65C00]"
        >
          <FiPlus className="h-4 w-4" /> Add category
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00]">
              <FiLayers className="h-7 w-7" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#0B1B33]">No categories yet</p>
            <p className="mt-1 text-[13px] text-gray-500">Create categories to organize your products.</p>
            <button type="button" onClick={openCreate} className="mt-4 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white">
              Add category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category._id} className="text-[13px]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                          {category.image ? (
                            <img src={category.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-gray-400">
                              <FiImage className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0B1B33]">{category.name}</p>
                          {category.description && <p className="text-[11.5px] text-gray-500">{category.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">/{category.slug}</td>
                    <td className="px-4 py-3 text-gray-600">{category.order}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${category.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {category.active !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(category)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#FF6C00] hover:text-[#FF6C00]">
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(category)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600">
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
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-[17px] font-extrabold text-[#0B1B33]">{editing ? 'Edit category' : 'New category'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{formError}</div>}

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Name</label>
                <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-[13.5px] focus:border-[#FF6C00] focus:outline-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Slug</label>
                <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-[13.5px] focus:border-[#FF6C00] focus:outline-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Description</label>
                <input value={form.description} onChange={(event) => updateField('description', event.target.value)} className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-[13.5px] focus:border-[#FF6C00] focus:outline-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Category image</label>
                <div className="flex items-center gap-2">
                  <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-[12.5px] font-semibold text-gray-700 hover:border-[#FF6C00] hover:text-[#FF6C00] ${uploading ? 'opacity-60' : ''}`}>
                    {uploading ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiUpload className="h-4 w-4" />}
                    {uploading ? 'Uploading...' : 'Upload image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  {form.image && <img src={form.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                </div>
                <input value={form.image} onChange={(event) => updateField('image', event.target.value)} className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-[13.5px] focus:border-[#FF6C00] focus:outline-none" placeholder="Image URL" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Sort order</label>
                  <input type="number" value={form.order} onChange={(event) => updateField('order', event.target.value)} className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-[13.5px] focus:border-[#FF6C00] focus:outline-none" />
                </div>
                <label className="mt-6 flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={form.active} onChange={(event) => updateField('active', event.target.checked)} className="h-[18px] w-[18px] rounded border-gray-300 text-[#FF6C00] focus:ring-[#FF6C00]" />
                  <span className="text-[13px] font-semibold text-[#0B1B33]">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65C00] disabled:opacity-60">
                  {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                  {editing ? 'Save changes' : 'Create category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-[17px] font-extrabold text-[#0B1B33]">Delete category?</h3>
            <p className="mt-1 text-[13.5px] text-gray-600"><b>{deleteTarget.name}</b> will be removed if no products use it.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting && <FiLoader className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
