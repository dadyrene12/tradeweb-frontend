import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';

const Wishlist = () => {
  const wishlistItems = [
    { id: 11, name: 'Hisense 55" 4K Smart TV', price: 549, image: '/images/products/product-11.jpg' },
    { id: 16, name: 'SPJ Washing Machine', price: 449, image: '/images/products/product-16.jpg' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-gray-600 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Wishlist</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Add items you love to your wishlist</p>
            <Link to="/shop" className="bg-[#1e73be] text-white px-6 py-3 rounded-lg hover:bg-[#1a5f9e] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Action</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                          <Link to={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-[#1e73be]">
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-lg font-bold text-[#1e73be]">${item.price}</td>
                      <td className="py-4 px-6">
                        <button className="flex items-center gap-2 bg-[#1e73be] text-white px-4 py-2 rounded-lg hover:bg-[#1a5f9e] transition-colors">
                          <FiShoppingCart className="w-4 h-4" /> Add to Cart
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-red-500 hover:text-red-600">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

