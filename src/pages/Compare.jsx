import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiX } from 'react-icons/fi';

const Compare = () => {
  const compareItems = [
    { id: 11, name: 'Hisense 55" 4K Smart TV', price: 549, image: '/images/products/product-11.jpg', brand: 'Hisense', rating: 4.8 },
    { id: 16, name: 'SPJ Washing Machine', price: 449, image: '/images/products/product-16.jpg', brand: 'SPJ', rating: 4.6 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-gray-600 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Compare</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Comparison</h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 bg-gray-50 w-48">Product</th>
                  {compareItems.map((item) => (
                    <th key={item.id} className="py-4 px-6 text-center">
                      <button className="text-red-500 hover:text-red-600 mb-2">
                        <FiX className="w-5 h-5 mx-auto" />
                      </button>
                      <img src={item.image} alt={item.name} className="w-32 h-32 object-contain mx-auto mb-3 bg-gray-50 rounded-lg" />
                      <Link to={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-[#1e73be] block">
                        {item.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 font-semibold bg-gray-50">Price</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="py-4 px-6 text-center text-xl font-bold text-[#1e73be]">${item.price}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 font-semibold bg-gray-50">Brand</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="py-4 px-6 text-center text-gray-700">{item.brand}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 font-semibold bg-gray-50">Rating</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="py-4 px-6 text-center text-gray-700">{item.rating}/5</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold bg-gray-50">Action</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="py-4 px-6 text-center">
                      <button className="flex items-center gap-2 bg-[#1e73be] text-white px-4 py-2 rounded-lg hover:bg-[#1a5f9e] transition-colors mx-auto">
                        <FiShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;

