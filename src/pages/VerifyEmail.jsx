import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import api, { getApiError } from '../lib/api';

const verificationRequests = new Map();

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verifying your email address...' : 'This verification link is missing its token.'
  );
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let active = true;

    if (!token) return undefined;

    if (!verificationRequests.has(token)) {
      verificationRequests.set(token, api.post('/auth/verify-email', { token }));
    }

    verificationRequests
      .get(token)
      .then(({ data }) => {
        if (!active) return;
        setStatus('success');
        setMessage(data.message || 'Email verified successfully.');
      })
      .catch((error) => {
        if (!active) return;
        setStatus('error');
        setMessage(getApiError(error).message);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      toast.error('We do not have an email address for this link. Sign in and request a new one.');
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent. Check your inbox.');
    } catch (error) {
      toast.error(getApiError(error).message);
    } finally {
      setIsResending(false);
    }
  };

  const content = {
    verifying: (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
        <FiLoader className="w-8 h-8 text-[#1e73be] animate-spin mx-auto mb-3" />
        <h3 className="text-[16px] font-bold text-blue-900 mb-1">Verifying your email</h3>
        <p className="text-[13px] text-blue-800">{message}</p>
      </div>
    ),
    success: (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <FiCheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-[16px] font-bold text-green-900 mb-1">Email verified</h3>
        <p className="text-[13px] text-green-800 leading-relaxed">{message}</p>
        <Link
          to="/login"
          state={{ verified: true, email }}
          className="mt-5 inline-flex items-center justify-center w-full bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white font-semibold text-[15px] py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          Continue to sign in
        </Link>
      </div>
    ),
    error: (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-[16px] font-bold text-red-900 mb-1">Verification failed</h3>
        <p className="text-[13px] text-red-800 leading-relaxed">{message}</p>
        <div className="mt-5 space-y-2">
          {email && (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e73be] to-[#1a5f9e] text-white font-semibold text-[14px] py-3 rounded-lg disabled:opacity-70"
            >
              {isResending && <FiLoader className="w-4 h-4 animate-spin" />}
              {isResending ? 'Sending...' : 'Send a new verification link'}
            </button>
          )}
          <Link to="/login" className="block text-[13px] font-semibold text-gray-600 hover:text-[#1e73be]">
            Back to sign in
          </Link>
        </div>
      </div>
    ),
  }[status];

  return (
    <AuthLayout
      eyebrow="Account security"
      sideTitle="One click away"
      sideText="Verifying your email protects your account and ensures important order updates reach the right inbox."
      sidePoints={[
        'Secure account recovery',
        'Order and shipping notifications',
        'Member-only offers and updates',
      ]}
      title="Email Verification"
      subtitle="We are confirming that this email address belongs to you."
      footer={
        <p className="text-[14px] text-gray-600">
          Need help?{' '}
          <Link to="/contact" className="font-bold text-[#1e73be] hover:underline">
            Contact support
          </Link>
        </p>
      }
    >
      {content}
    </AuthLayout>
  );
};

export default VerifyEmail;
