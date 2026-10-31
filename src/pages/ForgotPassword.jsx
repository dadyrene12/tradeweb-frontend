import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiLoader, FiMail } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import api, { getApiError } from '../lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        eyebrow="Check your inbox"
        sideTitle="Reset link sent"
        sideText="For your security, reset links expire after one hour. If you do not see the email, check your spam folder."
        title="Email Sent"
        subtitle="If an account exists for that address, a reset link is on its way."
        footer={
          <p className="text-[14px] text-gray-600">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-[#1e73be] hover:underline">
              Back to sign in
            </Link>
          </p>
        }
      >
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-[16px] font-bold text-green-900 mb-1">Check your email</h3>
          <p className="text-[13px] text-green-800 break-all">{email.trim()}</p>
          <p className="mt-3 text-[13px] text-green-800">
            Open the link in the email to choose a new password.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 w-full text-[13px] font-semibold text-gray-600 hover:text-[#1e73be]"
        >
          Use a different email
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      sideTitle="Forgot your password?"
      sideText="No problem. Enter the email linked to your account and we will send you a secure reset link."
      sidePoints={[
        'Secure, single-use reset links',
        'Links expire after one hour',
        'All active sessions are signed out after reset',
      ]}
      title="Reset Password"
      subtitle="We will email you a link to reset your password."
      footer={
        <p className="text-[14px] text-gray-600">
          Remembered it?{' '}
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
          <label htmlFor="forgot-email" className="block text-[13px] font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError('');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-lg pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white font-semibold text-[15px] py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isSubmitting && <FiLoader className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
