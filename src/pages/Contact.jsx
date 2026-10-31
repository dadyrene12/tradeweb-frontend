import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiMail, FiPhone, FiMapPin, FiChevronRight, FiUser, FiSend,
  FiAlertCircle, FiCheckCircle, FiArrowUpRight,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_NUMBER = '250722189516';
const EMAIL = 'rnsmartelectronics@gmail.com';

const contactCards = [
  {
    icon: FiPhone,
    title: 'Call us',
    lines: [
      { text: '0789 015 289', href: 'tel:0789015289' },
      { text: '+250 722 189 516', href: 'tel:+250722189516' },
    ],
    action: { label: 'Call now', href: 'tel:+250722189516' },
  },
  {
    icon: FiMail,
    title: 'Email us',
    lines: [{ text: EMAIL, href: `mailto:${EMAIL}` }],
    action: { label: 'Send an email', href: `mailto:${EMAIL}` },
  },
  {
    icon: FiMapPin,
    title: 'Visit us',
    lines: [{ text: 'Kigali - Nyarugenge, Rwanda' }],
    action: { label: 'Get directions', href: 'https://www.google.com/maps/search/?api=1&query=Nyarugenge+Kigali+Rwanda', external: true },
  },
];

const faqs = [
  { q: 'Do you deliver outside Kigali?', a: 'Yes. We deliver across Rwanda. Message us on WhatsApp with your location and we will confirm the delivery time and cost.' },
  { q: 'Is delivery free?', a: 'Orders over $99 qualify for free shipping. For smaller orders, delivery is charged by location.' },
  { q: 'Can I return a product?', a: 'Yes. Returns are accepted within 30 days if the product is unused and in its original packaging.' },
  { q: 'How quickly will you reply?', a: 'WhatsApp is the fastest way to reach us. Emails and form messages are answered as soon as possible.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
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
      `New message from the website`,
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      form.subject.trim() && `Subject: ${form.subject.trim()}`,
      ``,
      form.message.trim(),
    ].filter((line) => line !== false && line !== '').join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    toast.success('Your message is ready to send on WhatsApp.');
  };

  const inputClass = (field) =>
    `h-[52px] w-full rounded-xl border-2 bg-white px-4 text-[15px] text-[#0B1B33] placeholder-gray-400 transition-colors focus:outline-none ${
      errors[field] ? 'border-red-300 focus:border-red-500' : 'border-gray-200 hover:border-gray-300 focus:border-[#FF6C00]'
    }`;

  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-600">
        <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-[#F3F4F6]" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ---------- Banner ---------- */}
      <div className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-[#FF6C00]/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-[1400px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <FiChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-white">Contact</span>
          </nav>
          <h1 className="max-w-[560px] text-[32px] font-extrabold leading-tight tracking-tight text-white sm:text-[40px]">
            We&apos;re here to help you choose the right product
          </h1>
          <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-white/70">
            Questions about an order, a price or delivery? Reach out by phone, WhatsApp or the form below.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-green-500/25 transition-colors hover:bg-[#1DA851]"
          >
            <FaWhatsapp className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">

        {/* ---------- Contact cards (overlap banner) ---------- */}
        <div className="-mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {contactCards.map(({ icon: Icon, title, lines, action }) => (
            <div key={title} className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_12px_30px_-14px_rgba(11,27,51,0.2)] transition-all hover:-translate-y-0.5 hover:border-orange-200">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6C00] ring-1 ring-orange-100 transition-colors group-hover:bg-[#FF6C00] group-hover:text-white">
                <Icon className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-[17px] font-extrabold text-[#0B1B33]">{title}</h3>
              <div className="mt-1.5 space-y-0.5">
                {lines.map((l) =>
                  l.href ? (
                    <a key={l.text} href={l.href} className="block break-all text-[14.5px] font-medium text-gray-600 transition-colors hover:text-[#FF6C00]">
                      {l.text}
                    </a>
                  ) : (
                    <p key={l.text} className="text-[14.5px] font-medium text-gray-600">{l.text}</p>
                  )
                )}
              </div>
              <a
                href={action.href}
                {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="mt-4 inline-flex w-fit items-center gap-1 text-[13.5px] font-bold text-[#FF6C00] hover:underline"
              >
                {action.label}
                <FiArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        {/* ---------- Form + map ---------- */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
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
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 rounded-xl border-2 border-[#FF6C00] px-6 py-2.5 text-[14px] font-bold text-[#FF6C00] transition-colors hover:bg-[#FF6C00] hover:text-white"
                >
                  Write another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-[24px] font-extrabold tracking-tight text-[#0B1B33]">Send us a message</h2>
                <p className="mt-1 text-[14px] text-gray-500">Fill in the form and we will get back to you.</p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-2 block text-[13px] font-bold text-[#0B1B33]">Full name</label>
                      <input id="contact-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" autoComplete="name" aria-invalid={Boolean(errors.name)} className={inputClass('name')} />
                      <FieldError name="name" />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-2 block text-[13px] font-bold text-[#0B1B33]">Email address</label>
                      <input id="contact-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} className={inputClass('email')} />
                      <FieldError name="email" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="mb-2 block text-[13px] font-bold text-[#0B1B33]">Subject <span className="font-medium text-gray-400">(optional)</span></label>
                    <input id="contact-subject" type="text" value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="How can we help?" className={inputClass('subject')} />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-2 block text-[13px] font-bold text-[#0B1B33]">Message</label>
                    <textarea id="contact-message" rows={6} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Tell us about the product or question you have" aria-invalid={Boolean(errors.message)}
                      className={`w-full resize-y rounded-xl border-2 bg-white px-4 py-3.5 text-[15px] text-[#0B1B33] placeholder-gray-400 transition-colors focus:outline-none ${errors.message ? 'border-red-300 focus:border-red-500' : 'border-gray-200 hover:border-gray-300 focus:border-[#FF6C00]'}`}
                    />
                    <FieldError name="message" />
                  </div>

                  <button
                    type="submit"
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF6C00] text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-[#E65C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00] sm:w-auto sm:px-10"
                  >
                    <FiSend className="h-5 w-5" />
                    Send message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <iframe
                title="Our location in Nyarugenge, Kigali"
                src="https://www.google.com/maps?q=Nyarugenge,Kigali,Rwanda&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[260px] w-full border-0"
              />
              <div className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
                  <FiMapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#0B1B33]">RN Smart Electronics</p>
                  <p className="text-[13px] text-gray-500">Kigali - Nyarugenge, Rwanda</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#0B1B33] p-6 text-white">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FF6C00]/30 blur-2xl" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366]">
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
        <section className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
              <FiUser className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[22px] font-extrabold leading-tight text-[#0B1B33] sm:text-[26px]">Common questions</h2>
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
      </div>
    </div>
  );
};

export default Contact;