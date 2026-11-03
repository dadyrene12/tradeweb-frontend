import { formatMoney } from './currency';
import { SITE_URL } from './seo';

const shareBaseUrl = (process.env.REACT_APP_SHARE_URL || process.env.REACT_APP_API_URL || '')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export const buildProductShareUrl = (product = {}) => {
  const id = product.id || product._id;
  if (!id) return SITE_URL;
  if (!/^https?:\/\//i.test(shareBaseUrl)) return `${SITE_URL}/product/${id}`;
  return `${shareBaseUrl}/share/product/${id}`;
};

const canNativeShare = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

const slugify = (value) =>
  String(value || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'product';

const fetchImageFile = async (imageUrl, title) => {
  if (!imageUrl || typeof fetch !== 'function') return null;

  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) return null;

    const extension = (blob.type.split('/')[1] || 'jpg').split('+')[0];
    return new File([blob], `${slugify(title)}.${extension}`, { type: blob.type });
  } catch (error) {
    return null;
  }
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

export const buildProductCaption = (product = {}, url = '') => {
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) || 0;
  const hasDiscount = oldPrice > price && price > 0;
  const discount = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const brand = product.brand ? ` by ${product.brand}` : '';
  const category = String(product.category || 'electronics').replace(/[-_]/g, ' ');
  const description = String(product.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 170);

  const brandTag = String(product.brand || '').replace(/[^a-z0-9]/gi, '');
  const categoryTag = category.replace(/[^a-z0-9]/gi, '');

  return [
    '🔥 HOT DEAL AT RN SMART ELECTRONICS 🔥',
    '',
    `✨ ${product.name || 'This product'}${brand}`,
    description ? `${description}${description.length >= 170 ? '…' : ''}` : '',
    '',
    hasDiscount
      ? `💰 Was ${formatMoney(oldPrice)} — NOW ${formatMoney(price)} (save ${discount}%)!`
      : `💰 Special price: ${formatMoney(price)}`,
    '✅ Genuine product with warranty.',
    '🚚 Fast delivery in Kigali & across Rwanda.',
    '💬 Order now on WhatsApp: +250 722 189 516',
    url ? `🛒 Shop now: ${url}` : '',
    '',
    `#RNSmartElectronics #${categoryTag} ${brandTag ? `#${brandTag} ` : ''}#Kigali #Rwanda #HomeAppliances #Electronics #Deals #ShopLocal`,
  ]
    .filter((line) => line !== '')
    .join('\n');
};

export const shareToWhatsApp = ({ text, url, phone }) => {
  const message = [text, url].filter(Boolean).join('\n');
  const target = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  window.open(`${target}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  return { status: 'whatsapp' };
};

export const prepareInstagramPost = async ({ caption, profileUrl }) => {
  const copied = await copyText(caption);
  if (profileUrl) window.open(profileUrl, '_blank', 'noopener,noreferrer');

  return { status: 'instagram', opened: Boolean(profileUrl), copied };
};

export const shareProduct = async ({ title, text, url, imageUrl }) => {
  const message = [text, url].filter(Boolean).join('\n');

  if (canNativeShare()) {
    const file = await fetchImageFile(imageUrl, title);

    if (file) {
      try {
        await navigator.share({ title, text: message, files: [file] });
        return { status: 'shared' };
      } catch (error) {
        if (error?.name === 'AbortError') return { status: 'cancelled' };
      }
    }

    try {
      await navigator.share({ title, text: message, ...(url ? { url } : {}) });
      return { status: 'shared' };
    } catch (error) {
      if (error?.name === 'AbortError') return { status: 'cancelled' };
    }
  }

  try {
    await navigator.clipboard.writeText(message);
    return { status: 'copied' };
  } catch (error) {
    return { status: 'failed' };
  }
};

export const shareResultMessage = (status) => {
  if (status === 'shared') return 'Product shared';
  if (status === 'whatsapp') return 'WhatsApp opened with the product details';
  if (status === 'instagram') return 'Instagram opened and caption copied. Add the product image from our page.';
  if (status === 'copied') return 'Product link copied';
  if (status === 'failed') return 'Could not share this product. Copy the link and try again.';
  return '';
};
