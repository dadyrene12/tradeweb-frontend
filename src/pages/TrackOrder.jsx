import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const TrackOrder = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-gray-600 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-[#1e73be]">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Track Order</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <p className="text-gray-600 mb-6">Enter your order ID and billing email to track your order status</p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Order ID</label>
                <input type="text" placeholder="Found in your order confirmation email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e73be]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Billing Email</label>
                <input type="email" placeholder="Email used for the order" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e73be]" />
              </div>
              <button className="w-full bg-[#1e73be] text-white py-3 rounded-lg hover:bg-[#1a5f9e] transition-colors flex items-center justify-center gap-2">
                <FiSearch className="w-5 h-5" /> Track Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
