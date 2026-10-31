import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiSave, FiLoader, FiHome, FiPhone, FiTruck, FiShare2, FiImage,
  FiAlertCircle, FiSearch, FiLock, FiCreditCard, FiCheckCircle,
} from 'react-icons/fi';
import api, { getApiError } from '../../lib/api';

const Field = ({ label, hint, children }) => (
  <div>
    <label className="mb-1.5 block text-[12.5px] font-bold text-[#0B1B33]">{label}</label>
    {children}
    {hint && <p className="mt-1 text-[11.5px] text-gray-500">{hint}</p>}
  </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
    <span>
      <span className="block text-[13px] font-bold text-[#0B1B33]">{label}</span>
      {description && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-gray-500">{description}</span>}
    </span>
    <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#FF6C00]" />
      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </span>
  </label>
);

const Section = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white">
    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-[15px] font-extrabold text-[#0B1B33]">{title}</h2>
        <p className="text-[12px] text-gray-500">{description}</p>
      </div>
    </div>
    <div className="space-y-4 p-5">{children}</div>
  </section>
);

const inputClass =
  'h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading settings...
      </div>
    );
  }

  if (!settings) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-[14px] text-red-700">{error || 'Unable to load settings.'}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold text-[#0B1B33]">Store settings</h2>
          <p className="text-[12.5px] text-gray-500">Configure store details, checkout and site-wide options.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#E65C00] disabled:opacity-60"
        >
          {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary color">
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.branding.primaryColor} onChange={(event) => set('branding.primaryColor', event.target.value)} className="h-11 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" />
                  <input value={settings.branding.primaryColor} onChange={(event) => set('branding.primaryColor', event.target.value)} className={inputClass} />
                </div>
              </Field>
              <Field label="Accent color">
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.branding.accentColor} onChange={(event) => set('branding.accentColor', event.target.value)} className="h-11 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" />
                  <input value={settings.branding.accentColor} onChange={(event) => set('branding.accentColor', event.target.value)} className={inputClass} />
                </div>
              </Field>
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
                className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
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
                className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-[13.5px] text-[#0B1B33] focus:border-[#FF6C00] focus:outline-none"
              />
            </Field>
          </Section>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12.5px] text-emerald-700">
        <FiCheckCircle className="h-4 w-4 shrink-0" />
        Changes are saved to the database and apply to every visitor.
      </div>
    </form>
  );
};

export default AdminSettings;
