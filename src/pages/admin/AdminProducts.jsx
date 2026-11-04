import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiLoader, FiChevronLeft,
  FiChevronRight, FiStar, FiPackage, FiUpload, FiImage, FiAlertTriangle,
  FiTag, FiDollarSign, FiLayers, FiCopy, FiExternalLink,
} from 'react-icons/fi';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import api, { getApiError } from '../../lib/api';
import { CURRENCY, formatMoney as money } from '../../lib/currency';
import { SITE_NAME, SITE_URL, STORE_INSTAGRAM } from '../../lib/seo';
import {
  buildProductShareUrl,
  shareToWhatsApp,
  shareResultMessage,
} from '../../lib/share';

/*
  Orange-based theme
  primary  #FF6C00   light  #FFA45C   deep  #E65A00   ink  #0B1B33
*/

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

const parseImages = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const stockBadge = (stock) => {
  if (stock <= 0) return { label: 'Out of stock', style: 'bg-red-50 text-red-600 ring-red-200', dot: 'bg-red-500' };
  if (stock <= 5) return { label: `${stock} left`, style: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' };
  return { label: `${stock} in stock`, style: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' };
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">{label}</label>
    {children}
    {hint && <p className="mt-1 text-[11.5px] text-gray-500">{hint}</p>}
  </div>
);

const FormSection = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4 sm:p-5">
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-white shadow-sm shadow-orange-300/50">
        <Icon className="h-4 w-4" />
      </span>
      <h4 className="text-[14px] font-extrabold text-[#0B1B33]">{title}</h4>
    </div>
    {children}
  </section>
);

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [promoProduct, setPromoProduct] = useState(null);
  const [promoCaption, setPromoCaption] = useState('');
  const [instagramProfile, setInstagramProfile] = useState(STORE_INSTAGRAM);
  const [postingInstagram, setPostingInstagram] = useState(false);

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
      .get('/admin/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => {
        const url = data?.settings?.social?.instagram;
        if (url) setInstagramProfile(url);
      })
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

  const removeImage = (url) =>
    updateField('images', parseImages(form.images).filter((item) => item !== url).join(', '));

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

  const buildInstagramCaption = (product) => {
    const productUrl = buildProductShareUrl(product);
    const brand = product.brand ? ` by ${product.brand}` : '';
    const category = product.category ? product.category.replace(/[-_]/g, ' ') : 'electronics';
    const description = String(product.description || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
    const hasDiscount = Number(product.oldPrice) > Number(product.price);
    const discount = hasDiscount
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
    const priceLine = hasDiscount
      ? `🔥 LIMITED OFFER: Was ${money(product.oldPrice)} — now ${money(product.price)} (save ${discount}%)!`
      : `💥 Special price: ${money(product.price)}`;
    const stockLine = Number(product.stock) > 0
      ? '✅ In stock — ready for fast delivery.'
      : '📩 Message us today to reserve yours.';
    const brandTag = String(product.brand || '').replace(/[^a-z0-9]/gi, '');
    const categoryTag = category.replace(/[^a-z0-9]/gi, '');

    return [
      '✨ NEW ARRIVAL AT RN SMART ELECTRONICS ✨',
      '',
      `👉 ${product.name}${brand}`,
      description,
      '',
      priceLine,
      stockLine,
      '🚚 Fast delivery in Kigali & across Rwanda.',
      '💳 Order on WhatsApp: +250 789 015 289',
      `🛒 Shop now: ${productUrl}`,
      '',
      `#${SITE_NAME.replace(/[^a-z0-9]/gi, '')} #${categoryTag} ${brandTag ? `#${brandTag} ` : ''}#Kigali #Rwanda #HomeAppliances #Electronics #Deals #ShopLocal`,
    ]
      .filter((line, index, lines) => line !== '' || (index > 0 && lines[index - 1] !== ''))
      .join('\n');
  };

  const openPromo = (product) => {
    setPromoProduct(product);
    setPromoCaption(buildInstagramCaption(product));
  };

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (error) {
      toast.error('Could not copy to clipboard');
    }
  };

  const sendPromoWhatsApp = () => {
    if (!promoProduct) return;
    const url = buildProductShareUrl(promoProduct);
    shareToWhatsApp({ text: promoCaption, url: promoCaption.includes(url) ? '' : url });
    toast.success(shareResultMessage('whatsapp'));
  };

  const postPromoInstagram = async () => {
    if (!promoProduct || postingInstagram) return;
    setPostingInstagram(true);
    try {
      const { data } = await api.post(`/admin/products/${promoProduct._id}/instagram`, {
        caption: promoCaption,
      });
      toast.success(data?.message || 'Product posted to Instagram.');
    } catch (error) {
      toast.error(getApiError(error).message);
    } finally {
      setPostingInstagram(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-[13.5px] text-[#0B1B33] placeholder:text-gray-400 transition focus:border-[#FF6C00] focus:outline-none focus:ring-4 focus:ring-orange-100';

  const textareaClass =
    'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13.5px] text-[#0B1B33] placeholder:text-gray-400 transition focus:border-[#FF6C00] focus:outline-none focus:ring-4 focus:ring-orange-100';

  const imageList = parseImages(form.images);
  const rangeStart = total === 0 ? 0 : (page - 1) * 10 + 1;
  const rangeEnd = Math.min(page * 10, total);

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E65A00] via-[#FF6C00] to-[#FFA45C] p-6 text-white shadow-xl shadow-orange-300/40 sm:p-7">
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
              <FiPackage className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-[22px] font-extrabold leading-tight sm:text-[26px]">Product catalog</h2>
              <p className="mt-0.5 text-[13.5px] text-orange-50">
                {total} product{total === 1 ? '' : 's'} in your store
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-bold text-[#E65A00] shadow-md shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            <FiPlus className="h-4 w-4" /> Add product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-[0_2px_12px_-4px_rgba(255,108,0,0.12)]">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF6C00]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, brand or description"
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          value={category}
          onChange={(event) => { setCategory(event.target.value); setPage(1); }}
          className={`${inputClass} w-full cursor-pointer sm:w-56`}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item.slug}>{item.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <FiAlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_2px_12px_-4px_rgba(255,108,0,0.12)]">
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100/70" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-orange-100/70" />
                  <div className="h-3 w-1/5 rounded bg-gray-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-white shadow-lg shadow-orange-300/50">
              <FiPackage className="h-8 w-8" />
            </span>
            <p className="mt-4 text-[16px] font-extrabold text-[#0B1B33]">No products found</p>
            <p className="mt-1 text-[13px] text-gray-500">
              {query || category ? 'Try a different search or category.' : 'Add your first product to start selling.'}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-orange-300/50 transition hover:from-[#E65A00] hover:to-[#FF6C00]"
            >
              <FiPlus className="h-4 w-4" /> Add product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-orange-50/70 text-[11px] uppercase tracking-wider text-[#E65A00]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-4 py-3.5 font-semibold">Category</th>
                  <th className="px-4 py-3.5 font-semibold">Price</th>
                  <th className="px-4 py-3.5 font-semibold">Stock</th>
                  <th className="px-4 py-3.5 font-semibold">Featured</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {products.map((product) => {
                  const badge = stockBadge(product.stock);
                  const hasDiscount = product.oldPrice > product.price;
                  return (
                    <tr key={product._id} className="align-middle text-[13px] transition hover:bg-orange-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-orange-50 ring-1 ring-orange-100">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-orange-300">
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
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-[12px] font-semibold capitalize text-gray-600">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-[#0B1B33]">{money(product.price)}</p>
                          {hasDiscount && (
                            <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-[#E65A00]">
                              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <p className="text-[11px] text-gray-400 line-through">{money(product.oldPrice)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${badge.style}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {product.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6C00] to-[#FFA45C] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm shadow-orange-300/50">
                            <FiStar className="h-3 w-3 fill-current" /> Featured
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openPromo(product)}
                            aria-label={`Share ${product.name} on Instagram`}
                            title="Share on Instagram"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white transition hover:opacity-90"
                          >
                            <FaInstagram className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#E65A00] transition hover:bg-[#FF6C00] hover:text-white"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`Delete ${product.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-600 hover:text-white"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 bg-orange-50/30 px-5 py-3.5">
            <p className="text-[12.5px] text-gray-500">
              Showing <b className="text-[#0B1B33]">{rangeStart}–{rangeEnd}</b> of <b className="text-[#0B1B33]">{total}</b>
              <span className="ml-2 text-gray-400">· Page {page} of {totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex h-9 items-center gap-1 rounded-xl border border-orange-200 bg-white px-3.5 text-[12px] font-semibold text-[#E65A00] transition hover:bg-[#FF6C00] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#E65A00]"
              >
                <FiChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-9 items-center gap-1 rounded-xl border border-orange-200 bg-white px-3.5 text-[12px] font-semibold text-[#E65A00] transition hover:bg-[#FF6C00] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#E65A00]"
              >
                Next <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#0B1B33]/60 p-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#E65A00] via-[#FF6C00] to-[#FFA45C] px-6 py-5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[18px] font-extrabold">{editing ? 'Edit product' : 'New product'}</h3>
                  <p className="text-[12.5px] text-orange-50">
                    {editing ? 'Update the details of this product.' : 'Fill in the details to add it to your catalog.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  <FiAlertTriangle className="h-4 w-4 shrink-0" /> {formError}
                </div>
              )}

              <FormSection icon={FiTag} title="Basic information">
                <div className="space-y-4">
                  <Field label="Product name">
                    <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} placeholder="e.g. 55-inch 4K Smart TV" />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                      rows={3}
                      className={textareaClass}
                      placeholder="Describe the product"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Category">
                      <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className={inputClass}>
                        <option value="">Select category</option>
                        {categories
                          .filter((item) => item.active !== false)
                          .map((item) => (
                            <option key={item._id} value={item.slug}>{item.name}</option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Brand">
                      <input value={form.brand} onChange={(event) => updateField('brand', event.target.value)} className={inputClass} placeholder="e.g. Hisense" />
                    </Field>
                  </div>
                </div>
              </FormSection>

              <FormSection icon={FiDollarSign} title="Pricing & inventory">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label={`Price (${CURRENCY})`}>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} className={inputClass} placeholder="0" />
                  </Field>
                  <Field label="Compare-at price" hint="Shown crossed out to highlight a discount.">
                    <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(event) => updateField('oldPrice', event.target.value)} className={inputClass} placeholder="Optional" />
                  </Field>
                  <Field label="Stock quantity">
                    <input type="number" min="0" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Rating (0-5)">
                    <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => updateField('rating', event.target.value)} className={inputClass} />
                  </Field>
                </div>
              </FormSection>

              <FormSection icon={FiImage} title="Product images">
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-orange-300 bg-white px-4 py-2.5 text-[12.5px] font-bold text-[#E65A00] transition hover:border-[#FF6C00] hover:bg-orange-50 ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    {uploading ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiUpload className="h-4 w-4" />}
                    {uploading ? 'Uploading...' : 'Upload images'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  {imageList.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold text-gray-600 ring-1 ring-orange-100">
                      <FiImage className="h-3.5 w-3.5 text-[#FF6C00]" />
                      {imageList.length} image{imageList.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {imageList.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                    {imageList.map((url, index) => (
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-orange-100">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 rounded-md bg-[#FF6C00] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          aria-label="Remove image"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B1B33]/80 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  value={form.images}
                  onChange={(event) => updateField('images', event.target.value)}
                  rows={2}
                  className={`${textareaClass} mt-3 text-[12.5px]`}
                  placeholder="/uploads/image.jpg, https://..."
                />
                <p className="mt-1 text-[11.5px] text-gray-500">Upload from device or paste image URLs. The first image is the main one.</p>
              </FormSection>

              <FormSection icon={FiLayers} title="Visibility">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3 transition hover:border-[#FF6C00]">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6C00]">
                      <FiStar className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-[#0B1B33]">Show as featured product</span>
                      <span className="block text-[11.5px] text-gray-500">Highlight this item in featured sections.</span>
                    </span>
                  </span>
                  <span className="relative inline-flex shrink-0 items-center">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) => updateField('featured', event.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-[#FF6C00] peer-focus-visible:ring-4 peer-focus-visible:ring-orange-200" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </FormSection>

              <div className="flex justify-end gap-2.5 border-t border-orange-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-6 py-2.5 text-[13px] font-bold text-white shadow-md shadow-orange-300/50 transition hover:from-[#E65A00] hover:to-[#FF6C00] disabled:opacity-60"
                >
                  {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                  {editing ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instagram promo modal */}
      {promoProduct && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#0B1B33]/60 p-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] px-6 py-5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                    <FaInstagram className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-[18px] font-extrabold">Promote on Instagram</h3>
                    <p className="text-[12.5px] text-white/85">Ready-made ad caption for your Instagram profile.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoProduct(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                {promoProduct.images?.[0] ? (
                  <img src={promoProduct.images[0]} alt="" className="h-16 w-16 rounded-xl bg-white object-cover ring-1 ring-orange-100" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-orange-300 ring-1 ring-orange-100">
                    <FiPackage className="h-6 w-6" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-extrabold text-[#0B1B33]">{promoProduct.name}</p>
                  <p className="text-[12px] text-gray-500">
                    {promoProduct.brand || 'No brand'} · {money(promoProduct.price)}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">Promo caption</label>
                <textarea
                  value={promoCaption}
                  onChange={(event) => setPromoCaption(event.target.value)}
                  rows={10}
                  className={`${textareaClass} text-[13px] leading-relaxed`}
                />
                <p className="mt-1 text-[11.5px] text-gray-500">
                  Edit the words to match your campaign. Emojis and hashtags are already included.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => copyText(promoCaption, 'Instagram caption copied')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1B33] px-3 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-[#1a2f52]"
                >
                  <FiCopy className="h-4 w-4" /> Copy caption
                </button>
                <button
                  type="button"
                  onClick={() => copyText(`${SITE_URL}/product/${promoProduct._id}`, 'Product link copied')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-[12.5px] font-bold text-[#E65A00] transition hover:bg-orange-100"
                >
                  <FiCopy className="h-4 w-4" /> Copy link
                </button>
                <a
                  href={promoProduct.images?.[0] || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-[12.5px] font-bold text-[#E65A00] transition hover:bg-orange-100"
                >
                  <FiExternalLink className="h-4 w-4" /> Open image
                </a>
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 transition hover:bg-gray-200"
                >
                  <FaInstagram className="h-4 w-4" /> Profile
                </a>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={sendPromoWhatsApp}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-[13px] font-bold text-white shadow-md shadow-green-200 transition hover:bg-[#1DA851]"
                >
                  <FaWhatsapp className="h-4 w-4" /> Send on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={postPromoInstagram}
                  disabled={postingInstagram}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] px-3 py-3 text-[13px] font-bold text-white shadow-md shadow-pink-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {postingInstagram ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FaInstagram className="h-4 w-4" />
                  )}
                  {postingInstagram ? 'Posting...' : 'Auto post to Instagram'}
                </button>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 text-[11.5px] leading-relaxed text-gray-600">
                <b className="text-[#0B1B33]">How to post:</b> <b>Send on WhatsApp</b> opens WhatsApp directly with the caption and product link (the product image appears in the link preview). <b>Auto post to Instagram</b> publishes the product image and caption straight to your Instagram Business account. It needs Instagram API credentials on the server.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0B1B33]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/60">
              <FiTrash2 className="h-6 w-6" />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#0B1B33]">Delete product?</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-gray-600">
              <b className="text-[#0B1B33]">{deleteTarget.name}</b> will be permanently removed from your catalog. This action can't be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-700 disabled:opacity-60"
              >
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