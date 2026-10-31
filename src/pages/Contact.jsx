import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiMail, FiPhone, FiMapPin, FiChevronRight, FiSend, FiClock, FiCopy,
  FiAlertCircle, FiCheckCircle, FiArrowUpRight, FiHelpCircle,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

/* -------------------------------------------------------------------------- */
/*  Settings: edit these to match your shop                                    */
/* -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = '250722189516';
const EMAIL = 'rnsmartelectronics@gmail.com';
const MAP_QUERY = 'Nyarugenge,Kigali,Rwanda';

// Placeholder opening hours. Replace with your real hours.
const HOURS = [
  { day: 'Monday to Friday', time: '8:00 am - 6:00 pm' },
  { day: 'Saturday', time: '9:00 am - 5:00 pm' },
  { day: 'Sunday', time: 'WhatsApp only' },
];

const TOPICS = ['Place an order', 'Product question', 'Delivery', 'Returns', 'Other'];

const contactCards = [
  {
    icon: FaWhatsapp,
    title: 'WhatsApp',
    note: 'Fastest way to reach us',
    lines: [{ text: '+250 722 189 516', href: `https://wa.me/${WHATSAPP_NUMBER}` }],
    action: { label: 'Chat now', href: `https://wa.me/${WHATSAPP_NUMBER}`, external: true },
    tone: 'bg-[#25D366]/10 text-[#1DA851] ring-[#25D366]/20 group-hover:bg-[#25D366] group-hover:text-white',
  },
  {
    icon: FiPhone,
    title: 'Call us',
    note: 'Speak to our team',
    lines: [
      { text: '0789 015 289', href: 'tel:+250789015289' },
      { text: '+250 722 189 516', href: 'tel:+250722189516' },
    ],
    action: { label: 'Call now', href: 'tel:+250722189516' },
    tone: 'bg-orange-50 text-[#FF6C00] ring-orange-100 group-hover:bg-[#FF6C00] group-hover:text-white',
  },
  {
    icon: FiMail,
    title: 'Email us',
    note: 'For quotes and details',
    lines: [{ text: EMAIL, href: `mailto:${EMAIL}` }],
    action: { label: 'Send an email', href: `mailto:${EMAIL}` },
    tone: 'bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white',
  },
  {
    icon: FiMapPin,
    title: 'Visit us',
    note: 'Come see the products',
    lines: [{ text: 'Kigali - Nyarugenge, Rwanda' }],
    action: { label: 'Get directions', href: `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`, external: true },
    tone: 'bg-purple-50 text-purple-600 ring-purple-100 group-hover:bg-purple-600 group-hover:text-white',
  },
];

const faqs = [
  { q: 'Do you deliver outside Kigali?', a: 'Yes. We deliver across Rwanda. Message us on WhatsApp with your location and we will confirm the delivery time and cost.' },
  { q: 'Is delivery free?', a: 'Orders over FRW 100,000 qualify for free shipping. For smaller orders, delivery is charged by location.' },
  { q: 'Can I return a product?', a: 'Yes. Returns are accepted within 30 days if the product is unused and in its original packaging.' },
  { q: 'How quickly will you reply?', a: 'WhatsApp is the fastest way to reach us. Emails and form messages are answered as soon as possible.' },
];

const MAX_MESSAGE = 600;

/* -------------------------------------------------------------------------- */
/*  Small pieces (defined outside so inputs keep focus while typing)           */
/* -------------------------------------------------------------------------- */
const Field = ({ id, label, optional, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-[13px] font-bold text-[#0B1B33]">
      {label} {optional && <span className="font-medium text-gray-400">(optional)</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-600" role="alert">
        <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError) =>
  `w-full rounded-xl border-2 bg-white px-4 text-[15px] text-[#0B1B33] placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-orange-100 ${
    hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 hover:border-gray-300 focus:border-[#FF6C00]'
  }`;

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
const Contact = () => {
  const emptyForm = { name: '', email: '', subject: '', message: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // No contact API is connected yet, so the message is delivered through WhatsApp.
    // To use your backend instead, replace this block with: await api.post('/contact', form)
    const text = [
      'New message from the website',
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      form.subject.trim() && `Topic: ${form.subject.trim()}`,
      '',
      form.message.trim(),
    ].filter((line) => line !== false).join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setSent(true);
    toast.success('Your message is ready to send on WhatsApp.');
  };

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Could not copy. Please copy it manually.');
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F4F6] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-72 w-72 rounded-full bg-[#1E73BE]/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-4 pb-24 pt-8 sm:px-6 sm:pb-28 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[12.5px] text-white/60">
              <Link to="/" className="transition-colors hover:text-white">Home</Link>
              <FiChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-white">Contact</span>
            </nav>
            <h1 className="max-w-[600px] text-[32px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[44px]">
              Let&apos;s help you find the right product
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/70 sm:text-[16px]">
              Questions about an order, a price or delivery? Message us on WhatsApp, call, or use the form below.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-green-500/25 transition-colors hover:bg-[#1DA851]"
              >
                <FaWhatsapp className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <a
                href="tel:+250722189516"
                className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-6 py-3.5 text-[14px] font-bold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
              >
                <FiPhone className="h-5 w-5" />
                Call us
              </a>
            </div>
          </div>

          {/* Hours card */}
          <aside className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur sm:p-6" aria-label="Opening hours">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6C00] text-white shadow-lg shadow-orange-500/30">
                <FiClock className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <h2 className="text-[17px] font-extrabold text-white">Opening hours</h2>
                <p className="text-[12.5px] text-white/70">Kigali time</p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-white/10">
              {HOURS.map(({ day, time }) => (
                <li key={day} className="flex items-center justify-between gap-4 py-2.5 text-[13.5px]">
                  <span className="text-white/75">{day}</span>
                  <span className="font-semibold text-white">{time}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">

        {/* ---------- Contact cards (overlap the hero) ---------- */}
        <section aria-label="Ways to reach us" className="-mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map(({ icon: Icon, title, note, lines, action, tone }) => (
            <div key={title} className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_12px_30px_-14px_rgba(11,27,51,0.2)] transition-all hover:-translate-y-0.5 hover:border-orange-200 sm:p-6">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-colors ${tone}`}>
                <Icon className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-[17px] font-extrabold text-[#0B1B33]">{title}</h3>
              <p className="text-[12.5px] text-gray-500">{note}</p>
              <div className="mt-3 space-y-0.5">
                {lines.map((l) =>
                  l.href ? (
                    <a key={l.text} href={l.href} className="block break-words text-[14.5px] font-semibold text-[#0B1B33] transition-colors hover:text-[#FF6C00]">
                      {l.text}
                    </a>
                  ) : (
                    <p key={l.text} className="text-[14.5px] font-semibold text-[#0B1B33]">{l.text}</p>
                  )
                )}
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <a
                  href={action.href}
                  {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="inline-flex items-center gap-1 text-[13.5px] font-bold text-[#FF6C00] hover:underline"
                >
                  {action.label}
                  <FiArrowUpRight className="h-4 w-4" />
                </a>
                {title === 'Email us' && (
                  <button type="button" onClick={() => copy(EMAIL, 'Email')} aria-label="Copy email address" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#FF6C00]">
                    <FiCopy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* ---------- Form + side column ---------- */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Form */}
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:col-span-3" aria-labelledby="form-title">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
                  <FiCheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-[22px] font-extrabold text-[#0B1B33]">Almost done</h2>
                <p className="mt-2 max-w-[360px] text-[14px] leading-relaxed text-gray-600">
                  WhatsApp opened with your message. Press send there and we will reply as soon as we can.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setForm(emptyForm); }}
                  className="mt-6 rounded-xl border-2 border-[#FF6C00] px-6 py-2.5 text-[14px] font-bold text-[#FF6C00] transition-colors hover:bg-[#FF6C00] hover:text-white"
                >
                  Write another message
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
                    <FiSend className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="form-title" className="text-[22px] font-extrabold leading-tight tracking-tight text-[#0B1B33] sm:text-[24px]">Send us a message</h2>
                    <p className="text-[13px] text-gray-500">Tell us what you need and we will get back to you.</p>
                  </div>
                </div>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                  <div>
                    <p className="mb-2 text-[13px] font-bold text-[#0B1B33]">What is this about?</p>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Topic">
                      {TOPICS.map((t) => {
                        const active = form.subject === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={active}
                            onClick={() => update('subject', active ? '' : t)}
                            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                              active ? 'border-[#FF6C00] bg-[#FF6C00] text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-[#FF6C00]'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field id="contact-name" label="Full name" error={errors.name}>
                      <input id="contact-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" autoComplete="name" aria-invalid={Boolean(errors.name)} className={`h-[52px] ${inputClass(errors.name)}`} />
                    </Field>
                    <Field id="contact-email" label="Email address" error={errors.email}>
                      <input id="contact-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} className={`h-[52px] ${inputClass(errors.email)}`} />
                    </Field>
                  </div>

                  <Field id="contact-message" label="Message" error={errors.message}>
                    <textarea
                      id="contact-message"
                      rows={6}
                      maxLength={MAX_MESSAGE}
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      placeholder="Tell us about the product or question you have"
                      aria-invalid={Boolean(errors.message)}
                      className={`resize-y py-3.5 ${inputClass(errors.message)}`}
                    />
                    <p className="mt-1 text-right text-[11.5px] text-gray-400">{form.message.length}/{MAX_MESSAGE}</p>
                  </Field>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12.5px] text-gray-500">Your message opens in WhatsApp so you can send it to us.</p>
                    <button
                      type="submit"
                      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00] sm:w-auto sm:px-10"
                    >
                      <FiSend className="h-5 w-5" />
                      Send message
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>

          {/* Side column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <iframe
                title="Our location in Nyarugenge, Kigali"
                src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[240px] w-full border-0 sm:h-[280px]"
              />
              <div className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
                  <FiMapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-[#0B1B33]">RN Smart Electronics</p>
                  <p className="text-[13px] text-gray-500">Kigali - Nyarugenge, Rwanda</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#0B1B33] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#FF6C00]"
                >
                  Directions
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#0B1B33] p-6 text-white">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF6C00]/30 blur-2xl" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] shadow-lg shadow-green-500/30">
                <FaWhatsapp className="h-7 w-7" />
              </span>
              <h3 className="relative mt-4 text-[19px] font-extrabold">Need an answer fast?</h3>
              <p className="relative mt-1.5 text-[13.5px] leading-relaxed text-white/70">
                Send us a WhatsApp message with the product you like and we will share details and the best price.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-bold text-[#0B1B33] transition-colors hover:bg-[#FF6C00] hover:text-white"
              >
                Start a chat
                <FiArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ---------- FAQ ---------- */}
        <section className="mt-12" aria-labelledby="faq-title">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
              <FiHelpCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 id="faq-title" className="text-[22px] font-extrabold leading-tight text-[#0B1B33] sm:text-[26px]">Common questions</h2>
              <p className="text-[13px] text-gray-500">Quick answers before you contact us</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors open:border-orange-200 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-[#0B1B33] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#FF6C00] transition-transform group-open:rotate-90">
                    <FiChevronRight className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;