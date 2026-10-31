import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaTelegram } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import products, { getProductById } from '../data/products';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [showShareModal, setShowShareModal] = useState(false);

  const product = getProductById(id) || products[0];

  const productUrl = window.location.href;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyOnWhatsapp = () => {
    const message = `Hi! I'm interested in: ${product.name} - Price: $${product.price}. Please provide more details. ${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `Check out ${product.name} - $${product.price}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Check out ${product.name} - $${product.price} ${productUrl}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Check out ${product.name}`;
    const body = `I found this product you might like: ${product.name} - Price: $${product.price}\n\n${productUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-gray-600 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1e73be]">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={product.image} alt={product.name} className="w-full rounded-lg bg-gray-50" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-[#1e73be]">${product.price}</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">${product.oldPrice}</span>
                )}
                {product.oldPrice && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    Save ${product.oldPrice - product.price}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
              <div className="flex flex-col gap-3 mb-6">
                <button onClick={handleAddToCart} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold">
                  <FiShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button onClick={handleBuyOnWhatsapp} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold">
                  <FaWhatsapp className="w-5 h-5" />
                  Buy on WhatsApp
                </button>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiHeart className="w-5 h-5" />
                  Add to Wishlist
                </button>
                <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiShare2 className="w-5 h-5" />
                  Share
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
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <button onClick={handleBuyOnWhatsapp} className="flex flex-col items-center gap-2 p-4 hover:bg-green-50 rounded-lg transition-colors">
                        <FaWhatsapp className="w-8 h-8 text-green-500" />
                        <span className="text-xs text-gray-700">WhatsApp</span>
                      </button>
                      <button onClick={shareOnFacebook} className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaFacebook className="w-8 h-8 text-blue-600" />
                        <span className="text-xs text-gray-700">Facebook</span>
                      </button>
                      <button onClick={shareOnTwitter} className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaTwitter className="w-8 h-8 text-blue-400" />
                        <span className="text-xs text-gray-700">Twitter</span>
                      </button>
                      <button onClick={shareOnLinkedIn} className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaLinkedin className="w-8 h-8 text-blue-700" />
                        <span className="text-xs text-gray-700">LinkedIn</span>
                      </button>
                      <button onClick={shareOnTelegram} className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaTelegram className="w-8 h-8 text-blue-500" />
                        <span className="text-xs text-gray-700">Telegram</span>
                      </button>
                      <button onClick={shareViaEmail} className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <FiShare2 className="w-8 h-8 text-gray-600" />
                        <span className="text-xs text-gray-700">Email</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={productUrl} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      <button onClick={copyLink} className="px-4 py-2 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5f9e] transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
