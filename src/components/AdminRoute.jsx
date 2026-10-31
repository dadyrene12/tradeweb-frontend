import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] text-gray-500">
        <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Checking access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
