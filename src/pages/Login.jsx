import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
  FiMail,
  FiArrowRight,
} from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [notVerifiedEmail, setNotVerifiedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verifiedMessage = location.state?.verified
    ? 'Your email is verified. Sign in to continue.'
    : '';

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotVerifiedEmail('');
    setFieldErrors({});

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(form.email.trim(), form.password, form.rememberMe);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/', { replace: true });
    } catch (loginError) {
      const parsed = getApiError(loginError);
      setError(parsed.message);
      setFieldErrors(
        parsed.fields.reduce((acc, item) => ({ ...acc, [item.field]: item.message }), {})
      );
      if (parsed.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerifiedEmail(form.email.trim());
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const email = notVerifiedEmail || form.email.trim();
    if (!email) {
      setError('Enter your email address so we can resend the verification link.');
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent. Check your inbox.');
    } catch (resendError) {
      toast.error(getApiError(resendError).message);
    } finally {
      setIsResending(false);
    }
  };

  const inputClass = (field) =>
    `h-[52px] w-full rounded-xl border-2 bg-white pl-12 pr-4 text-[15px] text-[#0B1B33] placeholder-gray-400 transition-colors focus:outline-none ${
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-500'
        : 'border-gray-200 hover:border-gray-300 focus:border-[#FF6C00]'
    }`;

  return (
    <AuthLayout
      eyebrow="Welcome back"
      sideTitle="Good to see you again"
      sideText="Sign in to track your orders, manage your wishlist and get member-only deals on TVs, appliances and audio."
      sidePoints={[
        'Track every order in real time',
        'Save products to your wishlist',
        'Checkout faster with saved details',
      ]}
      title="Sign in to your account"
      subtitle="Enter your email and password to continue."
      footer={
        <p className="text-[14px] text-gray-600">
          New to Smart Electronics?{' '}
          <Link to="/register" className="font-bold text-[#FF6C00] hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {verifiedMessage && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-800">
            <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{verifiedMessage}</span>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p>{error}</p>
                {notVerifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[#FF6C00] hover:underline disabled:opacity-60"
                  >
                    {isResending && <FiLoader className="h-3.5 w-3.5 animate-spin" />}
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="mb-2 block text-[13px] font-bold text-[#0B1B33]">
            Email address
          </label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FF6C00]" />
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              className={inputClass('email')}
            />
          </div>
          {fieldErrors.email && <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="block text-[13px] font-bold text-[#0B1B33]">
              Password
            </label>
            <Link to="/forgot-password" className="text-[12.5px] font-semibold text-[#FF6C00] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FF6C00]" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              className={`${inputClass('password')} !pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0B1B33]"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.password}</p>}
        </div>

        <label className="flex w-fit cursor-pointer select-none items-center gap-2.5">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(event) => updateField('rememberMe', event.target.checked)}
            className="h-[18px] w-[18px] rounded border-gray-300 text-[#FF6C00] focus:ring-[#FF6C00]"
          />
          <span className="text-[13.5px] text-gray-600">Keep me signed in for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF6C00] text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <FiArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="text-center text-[12px] leading-relaxed text-gray-500">
          By signing in you agree to our{' '}
          <Link to="/contact" className="font-medium text-gray-700 hover:text-[#FF6C00] hover:underline">Terms</Link>{' '}
          and{' '}
          <Link to="/contact" className="font-medium text-gray-700 hover:text-[#FF6C00] hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;