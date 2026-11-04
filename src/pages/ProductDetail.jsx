import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo';
import {
  FiShoppingCart, FiHeart, FiShare2, FiX, FiMinus, FiPlus, FiCheck,
  FiTruck, FiShield, FiRefreshCw, FiCopy, FiMail, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaStar, FaRegStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { formatMoney } from '../lib/currency';
import { toStoreProduct } from '../lib/productMapper';
import { sendQuickOrder } from '../lib/orders';
import { SITE_NAME, STORE_INSTAGRAM, absoluteImage, absoluteUrl, breadcrumbSchema, truncate } from '../lib/seo';
import {
  buildProductCaption,
  buildProductShareUrl,
  prepareInstagramPost,
  shareToWhatsApp,
  shareResultMessage,
} from '../lib/share';
import fallbackProducts, { getProductById } from '../data/products';

const STORE_WHATSAPP_NUMBER = '250789015289';

/* ---------- small helpers ---------- */

const Stars = ({ value = 0, size = 'w-4 h-4' }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) =>
      n <= Math.round(value) ? <FaStar key={n} className={size} /> : <FaRegStar key={n} className={size} />
    )}
  </span>
);

const Toast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div role="status" className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl">
      <FiCheck className="w-4 h-4 text-green-400" />
      {message}
    </div>
  );
};

const isObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value || ''));

/* ---------- main component ---------- */

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const initialProduct = useMemo(() => getProductById(id) || fallbackProducts[0], [id]);
  const [product, setProduct] = useState(initialProduct);
  const [related, setRelated] = useState([]);
  const productUrl = window.location.href;
  const productShareUrl = buildProductShareUrl(product);

  useEffect(() => {
    let active = true;

    setProduct(getProductById(id) || fallbackProducts[0]);

    if (isObjectId(id)) {
      api
        .get(`/products/${id}`)
        .then(({ data }) => {
          if (active && data && data._id) {
            setProduct(toStoreProduct(data));
          }
        })
        .catch(() => {});
    }

    api
      .get('/products', { params: { limit: 100 } })
      .then(({ data }) => {
        if (active && data.products?.length) {
          setRelated(data.products.map(toStoreProduct));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [id]);

  // Optional fields: supply them in your data to unlock more UI
  // images[], colors[], sizes[], rating, reviewCount, reviews[], specs{}, stock, sku, category, brand, features[]
  const images = useMemo(
    () => (product.images && product.images.length ? product.images : [product.image]),
    [product]
  );
  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const stock = typeof product.stock === 'number' ? product.stock : null;
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock > 0 && stock <= 5;
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(colors[0] || null);
  const [size, setSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState('description');
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState('');
  const buyBoxRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // reset state when navigating between products
  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setColor(colors[0] || null);
    setSize(null);
    setSizeError(false);
    setTab('description');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // show the mobile sticky bar once the main buy box scrolls out of view
  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const relatedProducts = useMemo(
    () =>
      related
        .filter((p) => p.id !== product.id && (!product.category || p.category === product.category))
        .slice(0, 4),
    [product, related]
  );

  /* ---------- actions ---------- */

  const validate = () => {
    if (sizes.length && !size) {
      setSizeError(true);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validate()) return;
    for (let i = 0; i < qty; i += 1) addToCart({ ...product, selectedColor: color, selectedSize: size });
    setToast(`${qty} × ${product.name} added to your cart`);
  };

  const handleBuyOnWhatsapp = async () => {
    if (!validate()) return;
    const options = [color && `Color: ${color}`, size && `Size: ${size}`].filter(Boolean).join(', ');
    const message =
      `Hi! I'd like to order:\n${product.name}\nQuantity: ${qty}\n` +
      (options ? `${options}\n` : '') +
      `Total: ${formatMoney(product.price * qty)}\n${productUrl}`;
    window.open(`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    try {
      await sendQuickOrder({
        channel: 'whatsapp',
        items: [
          {
            product: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image || product.images?.[0],
          },
        ],
        note: [`WhatsApp order request for ${product.name}`, options, `Product link: ${productUrl}`]
          .filter(Boolean)
          .join(' · '),
        customer: { name: 'WhatsApp customer' },
      });
      setToast('Order received — we will reply shortly.');
    } catch (error) {
      setToast('Could not save the order. Please send the WhatsApp message.');
    }
  };

  const toggleWishlist = () => {
    setWishlisted((w) => !w);
    setToast(wishlisted ? 'Removed from your wishlist' : 'Saved to your wishlist');
  };

  const openShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `${product.name} - ${formatMoney(product.price)}`, url: productUrl });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    setShowShare(true);
  };

  const open = (url) => window.open(url, '_blank', 'noopener,noreferrer');
  const shareText = `Check out ${product.name} - ${formatMoney(product.price)}`;

  const shareToInstagram = async () => {
    const result = await prepareInstagramPost({
      title: product.name,
      caption: buildProductCaption(product, productShareUrl),
      imageUrl: product.image || product.images?.[0],
      profileUrl: STORE_INSTAGRAM,
    });
    if (result.status === 'cancelled') {
      setShowShare(false);
      return;
    }
    setToast(shareResultMessage(result.status));
    setShowShare(false);
  };

  const shareOnWhatsApp = () => {
    shareToWhatsApp({
      text: buildProductCaption(product, ''),
      url: productShareUrl,
    });
    setToast(shareResultMessage('whatsapp'));
    setShowShare(false);
  };

  const shareTargets = [
    { label: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-500', run: shareOnWhatsApp },
    { label: 'Facebook', icon: FaFacebook, color: 'text-blue-600', run: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productShareUrl)}`) },
    { label: 'Twitter', icon: FaTwitter, color: 'text-sky-500', run: () => open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productShareUrl)}&text=${encodeURIComponent(shareText)}`) },
    { label: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700', run: () => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productShareUrl)}`) },
    { label: 'Instagram', icon: FaInstagram, color: 'text-[#E1306C]', run: shareToInstagram },
    { label: 'Email', icon: FiMail, color: 'text-gray-600', run: () => (window.location.href = `mailto:?subject=${encodeURIComponent(`Check out ${product.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${productUrl}`)}`) },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setShowShare(false);
      setToast('Link copied');
    } catch {
      setToast('Could not copy the link');
    }
  };

  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const step = (dir) => setActiveImg((i) => (i + dir + images.length) % images.length);

  /* ---------- tab content ---------- */

  const specs = product.specs ? Object.entries(product.specs) : [];
  const reviews = product.reviews || [];
  const tabs = [
    { key: 'description', label: 'Description' },
    ...(specs.length ? [{ key: 'specs', label: 'Specifications' }] : []),
    { key: 'reviews', label: `Reviews${reviews.length ? ` (${reviews.length})` : ''}` },
    { key: 'shipping', label: 'Shipping & returns' },
  ];

  const canonicalPath = `/product/${id}`;
  const seoTitle = `${product.name} | ${SITE_NAME}`;
  const seoDescription = truncate(
    product.description ||
      `Buy ${product.name} at ${SITE_NAME} in Kigali, Rwanda. Genuine product, fast delivery and easy WhatsApp ordering.`,
    160
  );
  const schemaImages = [...new Set([...(product.images || []), product.image].filter(Boolean).map(absoluteImage))];
  if (!schemaImages.length) schemaImages.push(absoluteImage());
  const productCategory = String(product.category || 'Electronics')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
  const reviewCount = Number(product.reviewCount || product.numReviews || reviews.length) || 0;
  const productRating = Number(product.rating) || 0;
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const productStructuredData = [
    {
      '@type': 'Product',
      name: product.name,
      description: seoDescription,
      image: schemaImages,
      sku: String(product.id || id),
      mpn: String(product.id || id),
      brand: {
        '@type': 'Brand',
        name: product.brand || SITE_NAME,
      },
      category: productCategory,
      url: absoluteUrl(canonicalPath),
      ...(productRating > 0 && reviewCount > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: Number(productRating.toFixed(1)),
              reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
      offers: {
        '@type': 'Offer',
        url: absoluteUrl(canonicalPath),
        priceCurrency: 'RWF',
        price: Number(product.price) || 0,
        priceValidUntil,
        availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: absoluteUrl('/'),
        },
      },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      ...(product.category
        ? [{ name: productCategory, path: `/shop?category=${encodeURIComponent(product.category)}` }]
        : []),
      { name: product.name, path: canonicalPath },
    ]),
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={canonicalPath}
        image={product.image || schemaImages[0]}
        type="product"
        structuredData={productStructuredData}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 flex items-center gap-2 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1e73be]">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1e73be]">{product.category}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* ---------- Gallery ---------- */}
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {images.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[560px] pb-1">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-gray-50 transition-colors ${
                        i === activeImg ? 'border-[#1e73be]' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative flex-1">
                <div
                  className="relative aspect-square rounded-xl bg-gray-50 overflow-hidden cursor-zoom-in"
                  onMouseMove={onMouseMove}
                  onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
                >
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={zoom.on ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                  />
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                      -{discount}%
                    </span>
                  )}
                  {outOfStock && (
                    <span className="absolute top-4 right-4 bg-gray-900 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Sold out
                    </span>
                  )}
                </div>
                {images.length > 1 && (
                  <>
                    <button onClick={() => step(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full p-2">
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => step(1)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full p-2">
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ---------- Buy box ---------- */}
            <div>
              {product.brand && <p className="text-sm font-medium text-[#1e73be] mb-1">{product.brand}</p>}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                {product.rating ? (
                  <button onClick={() => setTab('reviews')} className="inline-flex items-center gap-2 hover:text-gray-800">
                    <Stars value={product.rating} />
                    <span className="font-medium text-gray-800">{product.rating.toFixed(1)}</span>
                    {product.reviewCount || reviews.length ? <span>({product.reviewCount || reviews.length} reviews)</span> : null}
                  </button>
                ) : null}
                {product.sku && <span>SKU: {product.sku}</span>}
              </div>

              <div className="flex items-end gap-3 mt-5">
                <span className="text-4xl font-bold text-gray-900">{formatMoney(product.price)}</span>
                {product.oldPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through mb-0.5">{formatMoney(product.oldPrice)}</span>
                    <span className="mb-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-sm font-semibold">
                      You save {formatMoney(product.oldPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${outOfStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span className={outOfStock ? 'text-red-600' : lowStock ? 'text-amber-600' : 'text-green-700'}>
                  {outOfStock ? 'Out of stock' : lowStock ? `Only ${stock} left` : 'In stock'}
                </span>
              </div>

              <p className="text-gray-600 mt-5 leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {product.features && product.features.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {product.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <FiCheck className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <hr className="my-6 border-gray-200" />

              {/* Colors */}
              {colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-900 mb-2">Color: <span className="font-normal text-gray-600">{color}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          c === color ? 'border-[#1e73be] bg-blue-50 text-[#1e73be] font-medium' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-900 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSize(s); setSizeError(false); }}
                        className={`min-w-[3rem] px-3 py-2 rounded-lg border text-sm transition-colors ${
                          s === size ? 'border-[#1e73be] bg-blue-50 text-[#1e73be] font-medium' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {sizeError && <p className="text-sm text-red-600 mt-2">Choose a size to continue.</p>}
                </div>
              )}

              {/* Quantity + actions */}
              <div ref={buyBoxRef}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="inline-flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="p-3 hover:bg-gray-50 rounded-l-lg disabled:opacity-40" disabled={qty <= 1}>
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium" aria-live="polite">{qty}</span>
                    <button onClick={() => setQty((q) => (stock ? Math.min(stock, q + 1) : q + 1))} aria-label="Increase quantity" className="p-3 hover:bg-gray-50 rounded-r-lg disabled:opacity-40" disabled={stock !== null && qty >= stock}>
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">{formatMoney(product.price * qty)}</span></p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1e73be] hover:bg-[#1a5f9e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1e73be]"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    {outOfStock ? 'Out of stock' : 'Add to cart'}
                  </button>
                  <button
                    onClick={handleBuyOnWhatsapp}
                    disabled={outOfStock}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Order on WhatsApp
                  </button>
                </div>

                <div className="flex gap-3 mt-3">
                  <button onClick={toggleWishlist} aria-pressed={wishlisted} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    {wishlisted ? 'Saved' : 'Save to wishlist'}
                  </button>
                  <button onClick={openShare} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <FiShare2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { icon: FiTruck, title: 'Fast delivery', sub: 'Tracked shipping' },
                  { icon: FiRefreshCw, title: 'Easy returns', sub: '7-day returns' },
                  { icon: FiShield, title: 'Secure order', sub: 'Protected checkout' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50">
                    <Icon className="w-5 h-5 text-[#1e73be] mb-1.5" />
                    <span className="text-xs font-semibold text-gray-900">{title}</span>
                    <span className="text-xs text-gray-500">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Tabs ---------- */}
        <div className="bg-white rounded-2xl border border-gray-200 mt-6">
          <div role="tablist" className="flex gap-6 px-4 sm:px-8 border-b border-gray-200 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`py-4 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  tab === t.key ? 'border-[#1e73be] text-[#1e73be]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="p-4 sm:p-8">
            {tab === 'description' && (
              <p className="text-gray-700 leading-relaxed max-w-3xl whitespace-pre-line">{product.description}</p>
            )}

            {tab === 'specs' && (
              <dl className="max-w-2xl divide-y divide-gray-100 border border-gray-100 rounded-lg">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm even:bg-gray-50">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="col-span-2 text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {tab === 'reviews' && (
              <div className="max-w-3xl">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Buy this product and be the first to share your experience.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl font-bold text-gray-900">{(product.rating || 0).toFixed(1)}</span>
                      <div>
                        <Stars value={product.rating} size="w-5 h-5" />
                        <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
                      </div>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {reviews.map((r, i) => (
                        <li key={i} className="py-5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-full bg-blue-100 text-[#1e73be] flex items-center justify-center font-semibold">
                                {(r.name || 'A').charAt(0)}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                                {r.date && <p className="text-xs text-gray-500">{r.date}</p>}
                              </div>
                            </div>
                            <Stars value={r.rating} />
                          </div>
                          <p className="text-sm text-gray-700 mt-3 leading-relaxed">{r.comment}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {tab === 'shipping' && (
              <div className="max-w-3xl space-y-4 text-sm text-gray-700 leading-relaxed">
                <p><span className="font-semibold text-gray-900">Delivery.</span> Orders are packed within 1–2 business days. You will get a message with tracking details once your order ships.</p>
                <p><span className="font-semibold text-gray-900">Returns.</span> If something is not right, contact us within 7 days of delivery. Items must be unused and in their original packaging.</p>
                <p><span className="font-semibold text-gray-900">Questions.</span> Use the WhatsApp button above and we will reply with sizing, availability and delivery times.</p>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Related ---------- */}
        {relatedProducts.length > 0 && (
          <section className="mt-10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-4">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-900 font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-[#1e73be]">{formatMoney(p.price)}</span>
                      {p.oldPrice && <span className="text-xs text-gray-400 line-through">{formatMoney(p.oldPrice)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------- Mobile sticky bar ---------- */}
      <div className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 truncate">{product.name}</p>
          <p className="font-bold text-gray-900">{formatMoney(product.price * qty)}</p>
        </div>
        <button onClick={handleAddToCart} disabled={outOfStock} className="ml-auto flex items-center gap-2 bg-[#1e73be] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg font-semibold">
          <FiShoppingCart className="w-4 h-4" />
          Add to cart
        </button>
      </div>

      {/* ---------- Share modal ---------- */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShare(false)}>
          <div role="dialog" aria-modal="true" aria-label="Share product" className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Share this product</h3>
              <button onClick={() => setShowShare(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {shareTargets.map(({ label, icon: Icon, color: c, run }) => (
                <button key={label} onClick={run} className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <Icon className={`w-8 h-8 ${c}`} />
                  <span className="text-xs text-gray-700">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={productUrl} readOnly aria-label="Product link" className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
              <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5f9e] transition-colors text-sm font-medium">
                <FiCopy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
};

export default ProductDetail;