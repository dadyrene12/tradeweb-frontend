import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
  FiMail,
  FiUser,
} from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../lib/api';

const Field = ({ id, label, icon: Icon, error, right, hint, ...inputProps }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-[13px] font-bold text-[#0B1B33]">
      {label}
    </label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FF6C00]" />
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={`h-[52px] w-full rounded-xl border-2 bg-white pl-12 text-[15px] text-[#0B1B33] placeholder-gray-400 transition-colors focus:outline-none ${
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-gray-200 hover:border-gray-300 focus:border-[#FF6C00]'
        } ${right ? 'pr-12' : 'pr-4'}`}
        {...inputProps}
      />
      {right}
    </div>
    {error ? (
      <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-600">
        <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p>
    )}
  </div>
);

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '', text: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const normalized = Math.max(1, Math.min(4, score));
  const map = {
    1: { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' },
    2: { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
    3: { label: 'Good', color: 'bg-lime-500', text: 'text-lime-600' },
    4: { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
  };

  return { score: normalized, ...map[normalized] };
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const rules = useMemo(
    () => [
      { label: '8+ characters', ok: form.password.length >= 8 },
      { label: 'A letter', ok: /[A-Za-z]/.test(form.password) },
      { label: 'A number', ok: /\d/.test(form.password) },
    ],
    [form.password]
  );

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      errors.password = 'Password must include at least one letter and one number.';
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!form.acceptTerms) {
      errors.acceptTerms = 'Please accept the terms and privacy policy.';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);

    try {
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        acceptTerms: true,
      });

      if (data.requiresVerification === false) {
        toast.success('Account created. You can sign in now.');
        navigate('/login', { replace: true, state: { email: form.email.trim(), verified: true } });
        return;
      }

      setSuccess({ email: form.email.trim(), emailSent: data.emailSent });
      if (data.emailSent) {
        toast.success('Account created. Check your email to verify it.');
      } else {
        toast.error('Account created, but the verification email could not be sent. Use the resend button below.');
      }
    } catch (registerError) {
      const parsed = getApiError(registerError);
      setError(parsed.message);
      setFieldErrors(
        parsed.fields.reduce((acc, item) => ({ ...acc, [item.field]: item.message }), {})
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!success?.email) return;

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email: success.email });
      toast.success('Verification email sent. Check your inbox.');
    } catch (resendError) {
      toast.error(getApiError(resendError).message);
    } finally {
      setIsResending(false);
    }
  };

  const eyeButton = (visible, toggle, label) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0B1B33]"
    >
      {visible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
    </button>
  );

  /* ---------- Success / verify email screen ---------- */
  if (success) {
    return (
      <AuthLayout
        eyebrow="Almost there"
        sideTitle="Check your inbox"
        sideText="Email verification keeps your account secure and makes sure we can reach you about orders and updates."
        sidePoints={[
          'One quick click activates your account',
          'Verification links stay valid for 24 hours',
          'You can request a new link any time',
        ]}
        title="Verify your email"
        subtitle="We sent a verification link to your inbox."
        footer={
          <p className="text-[14px] text-gray-600">
            Already verified?{' '}
            <Link to="/login" state={{ email: success.email }} className="font-bold text-[#FF6C00] hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
            <FiCheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="text-[18px] font-extrabold text-emerald-900">Account created</h3>
          <p className="mt-1 break-all text-[14px] font-semibold text-emerald-800">{success.email}</p>
          <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-relaxed text-emerald-800/90">
            {success.emailSent
              ? 'Open the email and click the verification button to activate your account.'
              : 'We could not send the email automatically. Use the resend button below.'}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF6C00] text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isResending && <FiLoader className="h-5 w-5 animate-spin" />}
            {isResending ? 'Sending...' : 'Resend verification email'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setForm((prev) => ({ ...prev, email: '', password: '', confirmPassword: '' }));
            }}
            className="w-full py-1 text-[13.5px] font-semibold text-gray-600 transition-colors hover:text-[#FF6C00]"
          >
            Use a different email address
          </button>
        </div>
      </AuthLayout>
    );
  }

  /* ---------- Registration form ---------- */
  return (
    <AuthLayout
      eyebrow="Join RN Smart Electronics"
      sideTitle="Create your account"
      sideText="Get faster checkout, order tracking and member-only offers on the latest TVs, appliances and audio."
      sidePoints={[
        'Exclusive deals and early access',
        'Save products to your wishlist',
        'Order updates delivered to your inbox',
      ]}
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <p className="text-[14px] text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#FF6C00] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p>{error}</p>
              {error.toLowerCase().includes('already exists') && (
                <Link to="/login" state={{ email: form.email.trim() }} className="mt-1 inline-block font-semibold text-[#FF6C00] hover:underline">
                  Sign in instead
                </Link>
              )}
            </div>
          </div>
        )}

        <Field
          id="register-name"
          label="Full name"
          icon={FiUser}
          type="text"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="John Doe"
          autoComplete="name"
          error={fieldErrors.name}
        />

        <Field
          id="register-email"
          label="Email address"
          icon={FiMail}
          type="email"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors.email}
        />

        <div>
          <Field
            id="register-password"
            label="Password"
            icon={FiLock}
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            error={fieldErrors.password}
            right={eyeButton(showPassword, () => setShowPassword((prev) => !prev), showPassword ? 'Hide password' : 'Show password')}
          />

          {form.password && (
            <div className="mt-3 rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${strength.score >= level ? strength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <span className={`text-[12px] font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {rules.map((rule) => (
                  <li key={rule.label} className={`flex items-center gap-1.5 text-[12px] font-medium ${rule.ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Field
          id="register-confirm-password"
          label="Confirm password"
          icon={FiLock}
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          right={eyeButton(showConfirm, () => setShowConfirm((prev) => !prev), showConfirm ? 'Hide password' : 'Show password')}
        />

        <div>
          <label className="flex cursor-pointer select-none items-start gap-2.5">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(event) => updateField('acceptTerms', event.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] rounded border-gray-300 text-[#FF6C00] focus:ring-[#FF6C00]"
            />
            <span className="text-[13px] leading-relaxed text-gray-600">
              I agree to the{' '}
              <Link to="/contact" className="font-semibold text-[#FF6C00] hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/contact" className="font-semibold text-[#FF6C00] hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {fieldErrors.acceptTerms && (
            <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-600">
              <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
              {fieldErrors.acceptTerms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF6C00] text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <FiArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;