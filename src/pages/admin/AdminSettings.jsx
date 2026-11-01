import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiSave, FiLoader, FiHome, FiPhone, FiTruck, FiShare2, FiImage,
  FiAlertCircle, FiSearch, FiLock, FiCreditCard, FiCheckCircle,
  FiSettings, FiAlertTriangle,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';

/*
  Orange-based theme
  primary  #FF6C00   light  #FFA45C   deep  #E65A00   ink  #0B1B33
*/

const Field = ({ label, hint, children }) => (
  <div>
    <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">{label}</label>
    {children}
    {hint && <p className="mt-1 text-[11.5px] text-gray-500">{hint}</p>}
  </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <label
    className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3 transition ${
      checked ? 'border-orange-200 bg-orange-50/60' : 'border-gray-200 bg-white hover:border-orange-200'
    }`}
  >
    <span>
      <span className="block text-[13px] font-bold text-[#0B1B33]">{label}</span>
      {description && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-gray-500">{description}</span>}
    </span>
    <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-[#FF6C00] peer-checked:to-[#FF8A2B] peer-focus-visible:ring-4 peer-focus-visible:ring-orange-200" />
      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </span>
  </label>
);

const Section = ({ icon: Icon, title, description, children }) => (
  <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_2px_12px_-4px_rgba(255,108,0,0.12)]">
    <div className="flex items-start gap-3.5 border-b border-orange-100 bg-gradient-to-r from-orange-50/80 to-white px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6C00] to-[#FFA45C] text-white shadow-md shadow-orange-300/50">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-[15px] font-extrabold leading-tight text-[#0B1B33]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>
      </div>
    </div>
    <div className="space-y-4 p-5">{children}</div>
  </section>
);

const inputClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-[13.5px] text-[#0B1B33] placeholder:text-gray-400 transition focus:border-[#FF6C00] focus:outline-none focus:ring-4 focus:ring-orange-100';

const textareaClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13.5px] text-[#0B1B33] placeholder:text-gray-400 transition focus:border-[#FF6C00] focus:outline-none focus:ring-4 focus:ring-orange-100';

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-28 animate-pulse rounded-3xl bg-orange-100/60" />
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-orange-100/50" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/settings')
      .then(({ data }) => setSettings(data.settings))
      .catch((loadError) => setError(getApiError(loadError).message))
      .finally(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setSettings((prev) => {
      const next = { ...prev };
      let cursor = next;
      const keys = path.split('.');
      keys.slice(0, -1).forEach((key) => {
        cursor[key] = { ...cursor[key] };
        cursor = cursor[key];
      });
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data.settings);
      toast.success('Settings saved');
    } catch (saveError) {
      const parsed = getApiError(saveError);
      setError(parsed.message);
      toast.error(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  if (!settings) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-orange-200 bg-orange-50 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#FF6C00] shadow-sm">
          <FiAlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-[16px] font-extrabold text-[#0B1B33]">Couldn't load settings</h2>
        <p className="mt-1 text-[13.5px] text-gray-600">{error || 'Unable to load settings.'}</p>
      </div>
    );
  }

  const colorField = (label, key) => (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={settings.branding[key]}
          onChange={(event) => set(`branding.${key}`, event.target.value)}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
          aria-label={label}
        />
        <input
          value={settings.branding[key]}
          onChange={(event) => set(`branding.${key}`, event.target.value)}
          className={`${inputClass} font-mono uppercase`}
        />
      </div>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E65A00] via-[#FF6C00] to-[#FFA45C] p-6 text-white shadow-xl shadow-orange-300/40 sm:p-7">
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
              <FiSettings className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-[22px] font-extrabold leading-tight sm:text-[26px]">Store settings</h2>
              <p className="mt-0.5 text-[13.5px] text-orange-50">
                Configure store details, checkout and site-wide options.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-bold text-[#E65A00] shadow-md shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-orange-50 disabled:translate-y-0 disabled:opacity-60"
          >
            {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <FiAlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Section icon={FiHome} title="Store details" description="Public brand name, tagline and contact information.">
            <Field label="Store name">
              <input value={settings.storeName} onChange={(event) => set('storeName', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Tagline">
              <input value={settings.tagline} onChange={(event) => set('tagline', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Address">
              <input value={settings.address} onChange={(event) => set('address', event.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section icon={FiPhone} title="Contact" description="How customers can reach your team.">
            <Field label="Support email">
              <input type="email" value={settings.supportEmail} onChange={(event) => set('supportEmail', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Support phone">
              <input value={settings.supportPhone} onChange={(event) => set('supportPhone', event.target.value)} className={inputClass} />
            </Field>
            <Field label="WhatsApp number" hint="Digits only, including country code. Example: 250722189516">
              <input value={settings.whatsappNumber} onChange={(event) => set('whatsappNumber', event.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section icon={FiTruck} title="Currency & shipping" description="Used across the storefront and checkout.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Currency code">
                <input value={settings.currency} onChange={(event) => set('currency', event.target.value)} className={inputClass} />
              </Field>
              <Field label="Shipping fee">
                <input type="number" min="0" value={settings.shippingFee} onChange={(event) => set('shippingFee', Number(event.target.value))} className={inputClass} />
              </Field>
            </div>
            <Field label="Free shipping threshold" hint="Orders at or above this amount ship for free.">
              <input type="number" min="0" value={settings.freeShippingThreshold} onChange={(event) => set('freeShippingThreshold', Number(event.target.value))} className={inputClass} />
            </Field>
          </Section>

          <Section icon={FiShare2} title="Social links" description="Leave a field empty to hide the link.">
            {['facebook', 'twitter', 'instagram', 'youtube', 'tiktok'].map((network) => (
              <Field key={network} label={`${network.charAt(0).toUpperCase()}${network.slice(1)} URL`}>
                <input value={settings.social[network] || ''} onChange={(event) => set(`social.${network}`, event.target.value)} className={inputClass} placeholder="https://" />
              </Field>
            ))}
          </Section>
        </div>

        <div className="space-y-6">
          <Section icon={FiImage} title="Branding" description="Logo and accent colours used on the website.">
            <Field label="Logo URL" hint="Leave empty to use the default RN badge.">
              <input value={settings.branding.logoUrl} onChange={(event) => set('branding.logoUrl', event.target.value)} className={inputClass} placeholder="https://" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {colorField('Primary color', 'primaryColor')}
              {colorField('Accent color', 'accentColor')}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-3">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-gray-500">Preview</span>
              <span
                className="rounded-lg px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm"
                style={{ backgroundColor: settings.branding.primaryColor }}
              >
                Primary
              </span>
              <span
                className="rounded-lg px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm"
                style={{ backgroundColor: settings.branding.accentColor }}
              >
                Accent
              </span>
            </div>
          </Section>

          <Section icon={FiAlertCircle} title="Announcement bar" description="Display a message at the top of the storefront.">
            <Toggle
              checked={settings.announcement.enabled}
              onChange={(value) => set('announcement.enabled', value)}
              label="Show announcement bar"
              description="Great for promotions and delivery notices."
            />
            <Field label="Announcement text">
              <input value={settings.announcement.text} onChange={(event) => set('announcement.text', event.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section icon={FiLock} title="Site availability" description="Control registration and maintenance mode.">
            <Toggle
              checked={settings.maintenance.enabled}
              onChange={(value) => set('maintenance.enabled', value)}
              label="Maintenance mode"
              description="Shows a notice to visitors while you work on the store."
            />
            <Field label="Maintenance message">
              <textarea
                rows={2}
                value={settings.maintenance.message}
                onChange={(event) => set('maintenance.message', event.target.value)}
                className={textareaClass}
              />
            </Field>
            <Toggle
              checked={settings.features.allowRegistration}
              onChange={(value) => set('features.allowRegistration', value)}
              label="Allow new registrations"
              description="Turn off to temporarily stop new customers from signing up."
            />
            <Toggle
              checked={settings.features.requireEmailVerification}
              onChange={(value) => set('features.requireEmailVerification', value)}
              label="Require email verification"
              description="New accounts must verify their email before signing in."
            />
          </Section>

          <Section icon={FiCreditCard} title="Payment methods" description="Choose the options customers can use at checkout.">
            <Toggle
              checked={settings.payments.cashOnDelivery}
              onChange={(value) => set('payments.cashOnDelivery', value)}
              label="Cash on delivery"
            />
            <Toggle
              checked={settings.payments.mobileMoney}
              onChange={(value) => set('payments.mobileMoney', value)}
              label="Mobile money"
            />
            <Toggle
              checked={settings.payments.card}
              onChange={(value) => set('payments.card', value)}
              label="Card payment"
            />
          </Section>

          <Section icon={FiSearch} title="SEO" description="Search engine title and description for the homepage.">
            <Field label="Meta title">
              <input value={settings.seo.metaTitle} onChange={(event) => set('seo.metaTitle', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Meta description">
              <textarea
                rows={3}
                value={settings.seo.metaDescription}
                onChange={(event) => set('seo.metaDescription', event.target.value)}
                className={textareaClass}
              />
            </Field>
          </Section>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(255,108,0,0.12)]">
        <p className="flex items-center gap-2 text-[12.5px] text-emerald-700">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          Changes are saved to the database and apply to every visitor.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] px-6 py-2.5 text-[13px] font-bold text-white shadow-md shadow-orange-300/50 transition hover:from-[#E65A00] hover:to-[#FF6C00] disabled:opacity-60"
        >
          {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  );
};

export default AdminSettings;