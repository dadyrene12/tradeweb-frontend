import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleBuyAllOnWhatsapp = () => {
    if (cartItems.length === 0) return;
    let message = "Hi! I'm interested in purchasing:\n\n";
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - Qty: ${item.quantity} - Price: $${item.price * item.quantity}\n`;
    });
    message += `\nTotal: $${getCartTotal().toFixed(2)}\n\nPlease provide payment and delivery details.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-gray-600 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Shopping Cart</span>
        </nav>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-12">
            <FiShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link to="/shop" className="inline-block bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Product</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Price</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Quantity</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Subtotal</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                              <Link to={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-[#1e73be]">
                                {item.name}
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-900 font-semibold">${item.price}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-semibold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[#1e73be] font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                          <td className="py-4 px-6">
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600">
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 flex justify-between">
                  <Link to="/shop" className="text-[#1e73be] hover:underline font-semibold">Continue Shopping</Link>
                  <button onClick={clearCart} className="text-red-500 hover:underline font-semibold">Clear Cart</button>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cart Summary</h2>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <hr className="mb-4" />
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-[#1e73be]">${getCartTotal().toFixed(2)}</span>
                </div>
                <button onClick={handleBuyAllOnWhatsapp} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 mb-3">
                  <FaWhatsapp className="w-5 h-5" />
                  Order via WhatsApp
                </button>
                <button className="w-full bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;