import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheck,
  FiCopy,
  FiLock,
  FiMail,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShoppingCart,
  FiTag,
  FiTrash2,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/currency'; // single import: do NOT declare formatMoney again below

/* -------------------------------------------------------------------------- */
/*  Store settings – edit these to match your business                         */
/* -------------------------------------------------------------------------- */
const STORE = {
  whatsappNumber: '15551234567', // international format, digits only (no + or spaces)
  email: 'orders@yourstore.com',
  freeShippingThreshold: 100000, // order value that unlocks free shipping
  shippingFee: 0, // set to 0 to make shipping always free
  maxQuantity: 99,
};

// NOTE: client-side only. Re-validate real discounts on your server.
const COUPONS = {
  WELCOME10: { type: 'percent', value: 10, label: '10% off' },
  SAVE5: { type: 'fixed', value: 5, label: 'FRW 5 off' },
};

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', hint: 'Chat with us instantly', Icon: FaWhatsapp, iconClass: 'text-green-600' },
  { id: 'email', label: 'Email', hint: 'Send a written order', Icon: FiMail, iconClass: 'text-[#1e73be]' },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const STORAGE_KEY = 'cart_checkout_prefs_v1';

const makeOrderRef = () => `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`;

const loadPrefs = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const validate = (customer) => {
  const errors = {};
  if (!customer.name.trim()) errors.name = 'Please enter your name.';
  if (customer.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a valid phone number.';
  if (!customer.address.trim()) errors.address = "Please enter a delivery address (or write 'Pickup').";
  return errors;
};

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
      : 'border-gray-300 focus:border-[#1e73be] focus:ring-blue-200'
  }`;

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */
const QuantityStepper = ({ quantity, name, onChange }) => (
  <div
    className="inline-flex items-center rounded-lg border border-gray-300 bg-white"
    role="group"
    aria-label={`Quantity for ${name}`}
  >
    <button
      type="button"
      onClick={() => onChange(quantity - 1)}
      disabled={quantity <= 1}
      aria-label={`Decrease quantity of ${name}`}
      className="rounded-l-lg p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FiMinus className="h-4 w-4" />
    </button>
    <span className="w-10 text-center text-sm font-semibold text-gray-900" aria-live="polite">
      {quantity}
    </span>
    <button
      type="button"
      onClick={() => onChange(quantity + 1)}
      disabled={quantity >= STORE.maxQuantity}
      aria-label={`Increase quantity of ${name}`}
      className="rounded-r-lg p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FiPlus className="h-4 w-4" />
    </button>
  </div>
);

const FieldError = ({ id, message }) =>
  message ? (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  ) : null;

const EmptyCart = () => (
  <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
      <FiShoppingCart className="h-9 w-9 text-[#1e73be]" />
    </div>
    <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
    <p className="mb-8 text-gray-600">Looks like you haven't added anything yet. Browse our products and find something you love.</p>
    <Link
      to="/shop"
      className="inline-flex items-center gap-2 rounded-lg bg-[#1e73be] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1a5f9e] hover:shadow-md"
    >
      <FiPackage className="h-5 w-5" />
      Start shopping
    </Link>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Cart page                                                                  */
/* -------------------------------------------------------------------------- */
const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const prefs = useMemo(loadPrefs, []);
  const [channel, setChannel] = useState(prefs.channel === 'email' ? 'email' : 'whatsapp');
  const [customer, setCustomer] = useState({
    name: prefs.name || '',
    phone: prefs.phone || '',
    address: prefs.address || '',
  });
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState({});
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [orderRef] = useState(makeOrderRef);
  const toastTimer = useRef(null);

  /* ---- toast ---- */
  const showToast = useCallback((message, type = 'success') => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /* ---- remember customer details & preferred channel ---- */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ channel, ...customer }));
    } catch (e) {
      /* storage unavailable – ignore */
    }
  }, [channel, customer]);

  /* ---- close the confirm dialog with Escape ---- */
  useEffect(() => {
    if (!confirmClear) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setConfirmClear(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmClear]);

  /* ---- totals ---- */
  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const subtotal = Number(getCartTotal()) || 0;
  const coupon = appliedCoupon ? COUPONS[appliedCoupon] : null;
  const discount = coupon
    ? Math.min(subtotal, coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value)
    : 0;
  const discounted = subtotal - discount;
  const hasFreeShipping = STORE.shippingFee === 0 || discounted >= STORE.freeShippingThreshold;
  const shipping = hasFreeShipping ? 0 : STORE.shippingFee;
  const total = discounted + shipping;
  const amountToFreeShipping = Math.max(0, STORE.freeShippingThreshold - discounted);
  const shippingProgress = Math.min(100, (discounted / STORE.freeShippingThreshold) * 100);

  const errors = useMemo(() => validate(customer), [customer]);

  /* ---- handlers ---- */
  const updateField = (field) => (e) => setCustomer((prev) => ({ ...prev, [field]: e.target.value }));
  const markTouched = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const applyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError('');
      setCouponInput('');
      showToast(`Coupon ${code} applied`);
    } else {
      setCouponError("That code isn't valid.");
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    showToast(`${item.name} removed from cart`);
  };

  const handleClear = () => {
    clearCart();
    setAppliedCoupon(null);
    setConfirmClear(false);
    showToast('Cart cleared');
  };

  const buildOrderText = (format) => {
    const bold = (text) => (format === 'whatsapp' ? `*${text}*` : text);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const lines = ["Hi! I'd like to place an order.", '', `${bold('Order ref:')} ${orderRef}`, '', bold('ITEMS')];

    cartItems.forEach((item, index) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      lines.push(`${index + 1}. ${item.name}`);
      lines.push(`   ${qty} × ${formatMoney(price)} = ${formatMoney(price * qty)}`);
      if (origin) lines.push(`   ${origin}/product/${item.id}`);
    });

    lines.push('', `Subtotal: ${formatMoney(subtotal)}`);
    if (discount > 0) lines.push(`Discount (${appliedCoupon}): -${formatMoney(discount)}`);
    lines.push(`Shipping: ${shipping === 0 ? 'Free' : formatMoney(shipping)}`);
    lines.push(`${bold('Total:')} ${bold(formatMoney(total))}`);

    const hasCustomer = customer.name.trim() || customer.phone.trim() || customer.address.trim() || note.trim();
    if (hasCustomer) {
      lines.push('', bold('CUSTOMER'));
      if (customer.name.trim()) lines.push(`Name: ${customer.name.trim()}`);
      if (customer.phone.trim()) lines.push(`Phone: ${customer.phone.trim()}`);
      if (customer.address.trim()) lines.push(`Address: ${customer.address.trim()}`);
      if (note.trim()) lines.push(`Note: ${note.trim()}`);
    }

    lines.push('', 'Please confirm availability, payment options and delivery time. Thank you!');
    return lines.join('\n');
  };

  const handleSend = () => {
    if (cartItems.length === 0) return;

    if (Object.keys(errors).length > 0) {
      setTouched({ name: true, phone: true, address: true });
      const firstInvalid = ['name', 'phone', 'address'].find((key) => errors[key]);
      const el = document.getElementById(`field-${firstInvalid}`);
      if (el) el.focus();
      showToast('Please complete your delivery details first.', 'error');
      return;
    }

    const text = buildOrderText(channel);

    if (channel === 'whatsapp') {
      window.open(
        `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener,noreferrer'
      );
      showToast('Opening WhatsApp with your order…');
    } else {
      const subject = `New order ${orderRef} - ${customer.name.trim()}`;
      const body = text.replace(/\n/g, '\r\n');
      window.location.href = `mailto:${STORE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast('Opening your email app…');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildOrderText('email'));
      showToast('Order summary copied');
    } catch (e) {
      showToast("Couldn't copy the summary. Please try again.", 'error');
    }
  };

  /* ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-900" aria-current="page">Shopping Cart</span>
        </nav>

        {/* Title */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
            {cartItems.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            )}
          </div>
          {cartItems.length > 0 && (
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e73be] hover:underline"
            >
              <FiArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* ------------------------------ Left column ------------------------------ */}
            <div className="space-y-6 lg:col-span-2">
              {/* Free shipping progress */}
              {STORE.shippingFee > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        hasFreeShipping ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-[#1e73be]'
                      }`}
                    >
                      {hasFreeShipping ? <FiCheck className="h-5 w-5" /> : <FiTruck className="h-5 w-5" />}
                    </span>
                    <p className="text-sm text-gray-700">
                      {hasFreeShipping ? (
                        <span className="font-semibold text-green-700">You've unlocked free shipping!</span>
                      ) : (
                        <>
                          Add <span className="font-semibold text-gray-900">{formatMoney(amountToFreeShipping)}</span> more
                          to get <span className="font-semibold text-gray-900">free shipping</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuenow={Math.round(shippingProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progress towards free shipping"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hasFreeShipping ? 'bg-green-500' : 'bg-[#1e73be]'
                      }`}
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items */}
              <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm" aria-label="Cart items">
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const qty = Number(item.quantity) || 0;
                    return (
                      <li key={item.id} className="flex gap-4 p-4 sm:p-6">
                        <Link to={`/product/${item.id}`} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded-xl border border-gray-100 bg-gray-50 object-contain p-1 sm:h-24 sm:w-24"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.id}`}
                              className="block break-words font-semibold text-gray-900 hover:text-[#1e73be]"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-sm text-gray-500">{formatMoney(item.price)} each</p>
                            <button
                              type="button"
                              onClick={() => handleRemove(item)}
                              className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-red-600"
                            >
                              <FiTrash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-6 sm:justify-end">
                            <QuantityStepper
                              quantity={qty}
                              name={item.name}
                              onChange={(next) => updateQuantity(item.id, next)}
                            />
                            <p className="w-24 text-right text-base font-bold text-gray-900">
                              {formatMoney((Number(item.price) || 0) * qty)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
                  <Link to="/shop" className="text-sm font-semibold text-[#1e73be] hover:underline">
                    Add more products
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 hover:underline"
                  >
                    Clear cart
                  </button>
                </div>
              </section>

              {/* Delivery details */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6" aria-label="Delivery details">
                <h2 className="text-lg font-bold text-gray-900">Delivery details</h2>
                <p className="mb-5 mt-1 text-sm text-gray-500">
                  We include these in your order message so we can confirm quickly. They're saved on this device for next time.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="field-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="field-name"
                      type="text"
                      autoComplete="name"
                      value={customer.name}
                      onChange={updateField('name')}
                      onBlur={markTouched('name')}
                      placeholder="Jane Doe"
                      aria-invalid={Boolean(touched.name && errors.name)}
                      aria-describedby={touched.name && errors.name ? 'err-name' : undefined}
                      className={inputClass(touched.name && errors.name)}
                    />
                    <FieldError id="err-name" message={touched.name && errors.name} />
                  </div>

                  <div>
                    <label htmlFor="field-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="field-phone"
                      type="tel"
                      autoComplete="tel"
                      value={customer.phone}
                      onChange={updateField('phone')}
                      onBlur={markTouched('phone')}
                      placeholder="+1 555 123 4567"
                      aria-invalid={Boolean(touched.phone && errors.phone)}
                      aria-describedby={touched.phone && errors.phone ? 'err-phone' : undefined}
                      className={inputClass(touched.phone && errors.phone)}
                    />
                    <FieldError id="err-phone" message={touched.phone && errors.phone} />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="field-address" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Delivery address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="field-address"
                      rows={2}
                      autoComplete="street-address"
                      value={customer.address}
                      onChange={updateField('address')}
                      onBlur={markTouched('address')}
                      placeholder="Street, area, city"
                      aria-invalid={Boolean(touched.address && errors.address)}
                      aria-describedby={touched.address && errors.address ? 'err-address' : undefined}
                      className={inputClass(touched.address && errors.address)}
                    />
                    <FieldError id="err-address" message={touched.address && errors.address} />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="field-note" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Order note <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="field-note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Colour preference, delivery time, gift message…"
                      className={inputClass(false)}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ------------------------------ Right column ----------------------------- */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{orderRef}</span>
                </div>

                {/* Coupon */}
                {coupon ? (
                  <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-green-800">
                      <FiTag className="h-4 w-4" />
                      {appliedCoupon} · {coupon.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      aria-label="Remove coupon"
                      className="rounded p-1 text-green-700 hover:bg-green-100"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyCoupon} className="mb-5">
                    <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Promo code
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="coupon"
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="Enter code"
                        aria-invalid={Boolean(couponError)}
                        className={`${inputClass(couponError)} uppercase`}
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700"
                      >
                        Apply
                      </button>
                    </div>
                    <FieldError message={couponError} />
                  </form>
                )}

                {/* Totals */}
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-semibold text-gray-900">{formatMoney(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Discount</dt>
                      <dd className="font-semibold text-green-600">-{formatMoney(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'Free' : formatMoney(shipping)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-gray-100 pt-4">
                    <dt className="text-base font-bold text-gray-900">Total</dt>
                    <dd className="text-2xl font-bold text-[#1e73be]">{formatMoney(total)}</dd>
                  </div>
                </dl>

                {/* Channel selector */}
                <fieldset className="mt-6">
                  <legend className="mb-2 text-sm font-medium text-gray-700">How would you like to order?</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {CHANNELS.map(({ id, label, hint, Icon, iconClass }) => {
                      const selected = channel === id;
                      return (
                        <label
                          key={id}
                          className={`relative flex cursor-pointer flex-col items-center rounded-xl border-2 p-3 text-center transition focus-within:ring-2 focus-within:ring-blue-200 ${
                            selected ? 'border-[#1e73be] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="order-channel"
                            value={id}
                            checked={selected}
                            onChange={() => setChannel(id)}
                            className="sr-only"
                          />
                          {selected && (
                            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e73be] text-white">
                              <FiCheck className="h-3 w-3" />
                            </span>
                          )}
                          <Icon className={`mb-1.5 h-6 w-6 ${iconClass}`} />
                          <span className="text-sm font-semibold text-gray-900">{label}</span>
                          <span className="mt-0.5 text-xs text-gray-500">{hint}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Primary action */}
                <button
                  type="button"
                  onClick={handleSend}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-sm transition hover:shadow-md ${
                    channel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#1e73be] hover:bg-[#1a5f9e]'
                  }`}
                >
                  {channel === 'whatsapp' ? <FaWhatsapp className="h-5 w-5" /> : <FiMail className="h-5 w-5" />}
                  {channel === 'whatsapp' ? 'Send order on WhatsApp' : 'Send order by email'}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <FiCopy className="h-4 w-4" />
                  Copy order summary
                </button>

                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
                  <FiLock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    Your order opens pre-filled in {channel === 'whatsapp' ? 'WhatsApp' : 'your email app'}. Nothing is
                    charged online; we confirm availability and payment with you directly.
                  </span>
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Clear-cart confirmation */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4"
          onClick={() => setConfirmClear(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            aria-describedby="clear-desc"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiTrash2 className="h-6 w-6" />
            </div>
            <h3 id="clear-title" className="text-lg font-bold text-gray-900">Clear your cart?</h3>
            <p id="clear-desc" className="mt-1 text-sm text-gray-600">
              This removes all {itemCount} {itemCount === 1 ? 'item' : 'items'} from your cart. This can't be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep items
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && (
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
            }`}
          >
            {toast.type === 'error' ? <FiAlertTriangle className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;