import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiEye, FiRefreshCw, FiShare2, FiX } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/currency';
import { STORE_INSTAGRAM, STORE_WHATSAPP_DIGITS } from '../lib/seo';
import {
  buildProductCaption,
  buildProductShareUrl,
  prepareInstagramPost,
  shareToWhatsApp,
  shareResultMessage,
} from '../lib/share';

const ProductCard = ({ product }) => {
  const { id, name, price, oldPrice, image, rating = 5 } = product;
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const { addToCart } = useCart();
  const [showShareModal, setShowShareModal] = useState(false);

  const productUrl = `${window.location.origin}/product/${id}`;
  const productShareUrl = buildProductShareUrl(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleBuyOnWhatsapp = (e) => {
    e.preventDefault();
    const message = `Hi! I'm interested in: ${name} - Price: ${formatMoney(price)}. Please provide more details. ${productUrl}`;
    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = (e) => {
    e.preventDefault();
    setShowShareModal(true);
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productShareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `Check out ${name} - ${formatMoney(price)}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productShareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productShareUrl)}`, '_blank');
  };

  const shareOnInstagram = async () => {
    const result = await prepareInstagramPost({
      title: name,
      caption: buildProductCaption(product, productShareUrl),
      imageUrl: image,
      profileUrl: STORE_INSTAGRAM,
    });
    if (result.status === 'cancelled') {
      setShowShareModal(false);
      return;
    }
    toast.success(shareResultMessage(result.status));
    setShowShareModal(false);
  };

  const shareOnWhatsApp = () => {
    shareToWhatsApp({
      text: buildProductCaption(product, ''),
      url: productShareUrl,
    });
    toast.success(shareResultMessage('whatsapp'));
    setShowShareModal(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-white border border-gray-200 group hover:shadow-xl hover:border-[#1e73be]/30 transition-all duration-300 relative overflow-hidden h-full flex flex-col rounded-xl hover:-translate-y-1">
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={`/product/${id}`} className="block">
          <img src={image} alt={name} className="w-full h-48 object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
        </Link>
        {discount > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md">
              -{discount}%
            </span>
          </div>
        )}
        {discount === 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-[#00C853] to-green-600 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md">
              NEW
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-[#1e73be] hover:border-[#1e73be] hover:text-white transition-colors" title="Add to Wishlist">
            <FiHeart className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-[#1e73be] hover:border-[#1e73be] hover:text-white transition-colors" title="Compare">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-[#1e73be] hover:border-[#1e73be] hover:text-white transition-colors" title="Quick View">
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-4 pb-4 flex-1 flex flex-col">
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <AiFillStar key={i} className={`w-3 h-3 ${i < rating ? 'text-[#FFB800]' : 'text-gray-300'}`} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({Math.floor(Math.random() * 100) + 10})</span>
        </div>
        <Link to={`/product/${id}`} className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 hover:text-[#1e73be] transition-colors line-clamp-2 leading-snug h-10">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-[#1e73be]">{formatMoney(price)}</span>
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">{formatMoney(oldPrice)}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={handleAddToCart} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white py-2 hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs font-semibold rounded-lg">
            <FiShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button onClick={handleBuyOnWhatsapp} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs font-semibold rounded-lg">
            <FaWhatsapp className="w-4 h-4" />
            <span>Buy on WhatsApp</span>
          </button>
          <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 hover:bg-gray-200 transition-all duration-300 text-xs font-semibold rounded-lg">
            <FiShare2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Share Product</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button onClick={(e) => { e.preventDefault(); shareOnWhatsApp(); }} className="flex flex-col items-center gap-2 p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <FaWhatsapp className="w-7 h-7 text-green-500" />
                  <span className="text-xs text-gray-700">WhatsApp</span>
                </button>
                <button onClick={(e) => { e.preventDefault(); shareOnFacebook(); }} className="flex flex-col items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <FaFacebook className="w-7 h-7 text-blue-600" />
                  <span className="text-xs text-gray-700">Facebook</span>
                </button>
                <button onClick={(e) => { e.preventDefault(); shareOnTwitter(); }} className="flex flex-col items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <FaTwitter className="w-7 h-7 text-blue-400" />
                  <span className="text-xs text-gray-700">Twitter</span>
                </button>
                <button onClick={(e) => { e.preventDefault(); shareOnLinkedIn(); }} className="flex flex-col items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <FaLinkedin className="w-7 h-7 text-blue-700" />
                  <span className="text-xs text-gray-700">LinkedIn</span>
                </button>
                <button onClick={(e) => { e.preventDefault(); shareOnInstagram(); }} className="flex flex-col items-center gap-2 p-3 hover:bg-pink-50 rounded-lg transition-colors">
                  <FaInstagram className="w-7 h-7 text-[#E1306C]" />
                  <span className="text-xs text-gray-700">Instagram</span>
                </button>
                <button onClick={(e) => { e.preventDefault(); copyLink(); }} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <FiShare2 className="w-7 h-7 text-gray-600" />
                  <span className="text-xs text-gray-700">Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;