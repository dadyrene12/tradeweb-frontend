import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
} from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import api, { getApiError } from '../lib/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const errors = {};

    if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      errors.password = 'Password must include at least one letter and one number.';
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      toast.success('Password updated. Please sign in.');
      setSuccess(true);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-gray-50 border text-gray-900 text-[14px] rounded-lg pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 transition-all ${
      fieldErrors[field]
        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
        : 'border-gray-200 focus:ring-[#1e73be]/20 focus:border-[#1e73be]'
    }`;

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Account recovery"
        sideTitle="Invalid reset link"
        sideText="Password reset links are single-use and expire after one hour for your security."
        title="Invalid Link"
        subtitle="This password reset link is missing or incomplete."
        footer={
          <p className="text-[14px] text-gray-600">
            <Link to="/forgot-password" className="font-bold text-[#1e73be] hover:underline">
              Request a new reset link
            </Link>
          </p>
        }
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-[13px] text-red-800">
            Request a fresh reset link using the email linked to your account.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        eyebrow="All set"
        sideTitle="Password updated"
        sideText="Your account is secure. Sign in with your new password to continue shopping."
        title="Password Updated"
        subtitle="Your password has been changed successfully."
      >
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-[13px] text-green-800">
            For your security, all other sessions have been signed out.
          </p>
          <Link
            to="/login"
            state={{ email }}
            className="mt-5 inline-flex items-center justify-center w-full bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white font-semibold text-[15px] py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Choose a strong password"
      sideTitle="Set a new password"
      sideText="Use at least 8 characters with a mix of letters, numbers and symbols for the best protection."
      sidePoints={[
        'Never reuse a password from another site',
        'All active sessions will be signed out',
        'Your new password takes effect immediately',
      ]}
      title="New Password"
      subtitle="Choose a strong password for your account."
      footer={
        <p className="text-[14px] text-gray-600">
          <Link to="/login" className="font-bold text-[#1e73be] hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="reset-password" className="block text-[13px] font-semibold text-gray-900 mb-2">
            New Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={inputClass('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="reset-confirm" className="block text-[13px] font-semibold text-gray-900 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="reset-confirm"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              className={inputClass('confirmPassword')}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white font-semibold text-[15px] py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isSubmitting && <FiLoader className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
