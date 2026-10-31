import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiLoader, FiChevronLeft,
  FiChevronRight, FiStar, FiPackage, FiUpload, FiImage,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';

const emptyForm = {
  name: '',
  description: '',
  category: '',
  subcategory: '',
  price: '',
  oldPrice: '',
  stock: '0',
  brand: '',
  images: '',
  rating: '0',
  featured: false,
  isBestseller: false,
  isHot: false,
  isNewArrival: false,
  dealOfTheDay: false,
  dealSold: '',
  dealAvailable: '',
  homepageOrder: '0',
  showOnHomepage: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('FRW');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const money = (value) => `${currency} ${Math.round(Number(value) || 0).toLocaleString('en-US')}`;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/products', {
        params: { search: query || undefined, category: category || undefined, page, limit: 10 },
      });
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (loadError) {
      setError(getApiError(loadError).message);
    } finally {
      setLoading(false);
    }
  }, [query, category, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => setCurrency(data.settings.currency || 'FRW'))
      .catch(() => {});
    api
      .get('/admin/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?.slug || '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'appliances',
      subcategory: product.subcategory || '',
      price: product.price ?? '',
      oldPrice: product.oldPrice ?? '',
      stock: product.stock ?? '0',
      brand: product.brand || '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      rating: product.rating ?? '0',
      featured: Boolean(product.featured),
      isBestseller: Boolean(product.isBestseller),
      isHot: Boolean(product.isHot),
      isNewArrival: Boolean(product.isNewArrival),
      dealOfTheDay: Boolean(product.dealOfTheDay),
      dealSold: product.dealSold ?? '',
      dealAvailable: product.dealAvailable ?? '',
      homepageOrder: product.homepageOrder ?? '0',
      showOnHomepage: product.showOnHomepage !== false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

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
        setForm((prev) => ({
          ...prev,
          images: [...new Set([...(prev.images ? prev.images.split(',').map((item) => item.trim()).filter(Boolean) : []), ...urls])].join(', '),
        }));
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

    if (!form.name.trim() || !form.description.trim()) {
      setFormError('Name and description are required.');
      return;
    }
    if (!form.category) {
      setFormError('Select a category.');
      return;
    }
    if (form.price === '' || Number(form.price) < 0) {
      setFormError('Enter a valid price.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory.trim(),
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      brand: form.brand.trim(),
      images: form.images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      rating: Number(form.rating) || 0,
      featured: Boolean(form.featured),
      isBestseller: Boolean(form.isBestseller),
      isHot: Boolean(form.isHot),
      isNewArrival: Boolean(form.isNewArrival),
      dealOfTheDay: Boolean(form.dealOfTheDay),
      showOnHomepage: Boolean(form.showOnHomepage),
      homepageOrder: Number(form.homepageOrder) || 0,
      dealSold: form.dealSold !== '' ? Number(form.dealSold) : 0,
      dealAvailable: form.dealAvailable !== '' ? Number(form.dealAvailable) : 0,
      oldPrice: form.oldPrice !== '' && Number(form.oldPrice) > 0 ? Number(form.oldPrice) : null,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/products/${editing._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      loadProducts();
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
      await api.delete(`/admin/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      if (products.length === 1 && page > 1) setPage(page - 1);
      else loadProducts();
    } catch (deleteError) {
      toast.error(getApiError(deleteError).message);
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold text-[#0B1B33]">Product catalog</h2>
          <p className="text-[12.5px] text-gray-500">{total} product{total === 1 ? '' : 's'} in your store</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#E65C00]"
        >
          <FiPlus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, brand or description"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className={`${inputClass} w-auto`}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00]">
              <FiPackage className="h-7 w-7" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#0B1B33]">No products found</p>
            <p className="mt-1 text-[13px] text-gray-500">Add your first product to start selling.</p>
            <button type="button" onClick={openCreate} className="mt-4 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white">
              Add product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="align-middle text-[13px]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-gray-400">
                              <FiPackage className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-semibold text-[#0B1B33]">{product.name}</p>
                          <p className="text-[11.5px] text-gray-500">{product.brand || 'No brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#0B1B33]">{money(product.price)}</p>
                      {product.oldPrice > product.price && (
                        <p className="text-[11px] text-gray-400 line-through">{money(product.oldPrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${product.stock <= 0 ? 'border-red-200 bg-red-50 text-red-600' : product.stock <= 5 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.featured ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#FF6C00]">
                          <FiStar className="h-3.5 w-3.5 fill-current" /> Featured
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Delete ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-red-400 hover:text-red-600"
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
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-[12px] font-semibold text-gray-600 disabled:opacity-40"
              >
                <FiChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-[12px] font-semibold text-gray-600 disabled:opacity-40"
              >
                Next <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-[17px] font-extrabold text-[#0B1B33]">{editing ? 'Edit product' : 'New product'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{formError}</div>
              )}

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Product name</label>
                <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} placeholder="e.g. 55-inch 4K Smart TV" />
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
                  placeholder="Describe the product"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Category</label>
                  <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className={inputClass}>
                    <option value="">Select category</option>
                    {categories
                      .filter((item) => item.active !== false)
                      .map((item) => (
                        <option key={item._id} value={item.slug}>{item.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Brand</label>
                  <input value={form.brand} onChange={(event) => updateField('brand', event.target.value)} className={inputClass} placeholder="e.g. Hisense" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Price ({currency})</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Compare-at price</label>
                  <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(event) => updateField('oldPrice', event.target.value)} className={inputClass} placeholder="Optional" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Stock quantity</label>
                  <input type="number" min="0" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => updateField('rating', event.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Product images</label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-[12.5px] font-semibold text-gray-700 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00] ${uploading ? 'opacity-60' : ''}`}>
                    {uploading ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiUpload className="h-4 w-4" />}
                    {uploading ? 'Uploading...' : 'Upload images'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  {form.images && (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-500">
                      <FiImage className="h-3.5 w-3.5" />
                      {(form.images.split(',').filter(Boolean)).length} image(s)
                    </span>
                  )}
                </div>
                <textarea
                  value={form.images}
                  onChange={(event) => updateField('images', event.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-[12.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
                  placeholder="/uploads/image.jpg, https://..."
                />
                <p className="mt-1 text-[11.5px] text-gray-500">Upload from device or paste image URLs.</p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => updateField('featured', event.target.checked)}
                  className="h-[18px] w-[18px] rounded border-gray-300 text-[#FF6C00] focus:ring-[#FF6C00]"
                />
                <span className="text-[13px] font-semibold text-[#0B1B33]">Show as featured product</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65C00] disabled:opacity-60">
                  {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                  {editing ? 'Save changes' : 'Create product'}
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
            <h3 className="text-[17px] font-extrabold text-[#0B1B33]">Delete product?</h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-gray-600">
              <b>{deleteTarget.name}</b> will be permanently removed from your catalog.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting && <FiLoader className="h-4 w-4 animate-spin" />}
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
