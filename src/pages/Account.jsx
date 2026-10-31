import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiLogOut, FiPackage, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="py-16">
        <div className="container">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16">
        <div className="container max-w-lg text-center">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <FiUser className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
            <p className="text-gray-600 text-sm mb-6">
              View your orders, manage your wishlist and update your details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="bg-primary text-white font-semibold px-6 py-2.5 rounded hover:bg-secondary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded hover:bg-gray-50 transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/track" className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 hover:border-primary hover:bg-blue-50/40 transition-colors">
                <FiPackage className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Track an order</p>
                  <p className="text-xs text-gray-500">See the latest delivery status</p>
                </div>
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 hover:border-primary hover:bg-blue-50/40 transition-colors">
                <FiUser className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Your wishlist</p>
                  <p className="text-xs text-gray-500">Products you saved for later</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Account</h3>
            <button
              type="button"
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiLogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
