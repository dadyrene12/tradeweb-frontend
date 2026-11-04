import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMapPin, FiPhone, FiMail,
  FiChevronRight, FiArrowUp,
} from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Settings: edit these to match your shop                                    */
/* -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = '250789015289';
const EMAIL = 'rnsmartelectronics@gmail.com';
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Nyarugenge+Kigali+Rwanda';

// Real social pages for RN Smart Electronics.
const SOCIALS = [
  { label: 'Facebook', handle: 'nduwumukiza.romainrens', icon: FiFacebook, href: 'https://www.facebook.com/nduwumukiza.romainrens' },
  { label: 'Instagram', handle: 'nduwumukizaromain_97', icon: FiInstagram, href: 'https://www.instagram.com/nduwumukizaromain_97' },
  { label: 'TikTok', handle: 'rn.smart.electron', icon: FaTiktok, href: 'https://www.tiktok.com/@rn.smart.electron?_r=1&_t=ZS-9B63q1HmoQG' },
  { label: 'Twitter', icon: FiTwitter, href: 'https://twitter.com' },
  { label: 'YouTube', icon: FiYoutube, href: 'https://youtube.com' },
];

// Check these routes exist in your router. Pages that do not exist yet can point to /contact.
const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Smart TVs & Audio', to: '/shop?category=audio' },
      { label: 'Washing Machines', to: '/shop?category=appliances' },
      { label: 'Fridges & Freezers', to: '/shop?category=appliances' },
      { label: 'Cooking Machines', to: '/shop?category=appliances' },
      { label: 'Blenders, Kettles & Jiko', to: '/shop?category=appliances' },
    ],
  },
  {
    title: 'Customer care',
    links: [
      { label: 'Contact us', to: '/contact' },
      { label: 'Order tracking', to: '/contact' },
      { label: 'Returns & exchanges', to: '/contact' },
      { label: 'Store location', to: '/contact' },
      { label: 'Blog & guides', to: '/blog' },
    ],
  },
  {
    title: 'My account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Shopping cart', to: '/cart' },
      { label: 'Wishlist', to: '/account?tab=wishlist' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms & conditions', to: '/terms' },
    ],
  },
];

const PERKS = [
  { icon: Truck, title: 'Fast delivery', text: 'Across Kigali and Rwanda' },
  { icon: ShieldCheck, title: 'Secure payment', text: '100% safe and encrypted' },
  { icon: RotateCcw, title: 'Easy returns', text: '30-day money back' },
  { icon: Headphones, title: 'Friendly support', text: 'Expert help on WhatsApp' },
];

const FooterLink = ({ to, children }) => (
  <Link to={to} className="group inline-flex items-center gap-1 text-[14px] text-white/65 transition-colors hover:text-white">
    <FiChevronRight className="h-3.5 w-3.5 -ml-1 text-[#FF6C00] opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
    <span className="transition-transform group-hover:translate-x-0.5">{children}</span>
  </Link>
);

const Footer = () => {
  const year = new Date().getFullYear();
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative mt-10 bg-[#0B1B33] text-white/70" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6C00] via-[#FF9A4D] to-[#FF6C00]" />

      {/* ---------- Perks strip ---------- */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#FF6C00]/15 text-[#FF9A4D] ring-1 ring-[#FF6C00]/25">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-white">{title}</p>
                <p className="text-[12px] leading-snug text-white/55">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Main ---------- */}
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="RN Smart Electronics home">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6C00] to-[#E65C00] text-[15px] font-black text-white shadow-lg shadow-orange-500/25">RN</span>
              <span className="leading-tight">
                <span className="block text-[18px] font-extrabold tracking-tight text-white">RN Smart Electronics</span>
                <span className="block text-[12px] font-medium text-[#FF9A4D]">Smart choice, better life</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/60">
              Quality electronics for the modern home in Kigali and across Rwanda: smart TVs, washing machines, fridges, cooking machines, speakers and more, with reliable service and secure payment.
            </p>

            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <a href={MAP_URL} target="_blank" rel="noreferrer" className="flex items-start gap-3 transition-colors hover:text-white">
                  <FiMapPin className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-[#FF6C00]" />
                  Kigali - Nyarugenge, Rwanda
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiPhone className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-[#FF6C00]" />
                <span>
                  <a href="tel:+250789015289" className="transition-colors hover:text-white">0789 015 289</a>
                </span>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 break-all transition-colors hover:text-white">
                  <FiMail className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-[#FF6C00]" />
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col, i) => (
            <nav key={col.title} aria-label={col.title} className={`lg:col-span-2 ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <h3 className="mb-4 text-[15px] font-extrabold text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}><FooterLink to={l.to}>{l.label}</FooterLink></li>
                ))}
              </ul>
            </nav>
          ))}

          {/* WhatsApp card */}
          <div className="col-span-2 lg:col-span-2">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-lg shadow-green-500/25">
                <FaWhatsapp className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-[15px] font-extrabold text-white">Need help?</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">Ask about a product or price. We reply fast.</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1DA851]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Bottom bar ---------- */}
      <div className="border-t border-white/10 bg-[#081426]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-4 py-5 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <p className="text-center text-[12.5px] leading-relaxed text-white/55 md:text-left">
            &copy; {year} <span className="font-semibold text-[#FF9A4D]">RN Smart Electronics Company Ltd</span>. All rights reserved. Built by ITECHCORE.RW.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2" aria-label="Accepted payments">
              {[
                ['https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg', 'Mastercard'],
                ['https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg', 'American Express'],
                ['https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', 'PayPal'],
              ].map(([src, alt]) => (
                <span key={alt} className="flex h-8 w-12 items-center justify-center rounded-md bg-white px-1.5">
                  <img src={src} alt={alt} loading="lazy" className="max-h-5 w-auto" />
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, handle, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={handle ? `${label}: ${handle}` : label}
                  title={handle ? `@${handle}` : label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:-translate-y-0.5 hover:bg-[#FF6C00] hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={toTop}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6C00] text-white shadow-md shadow-orange-500/30 transition-transform hover:-translate-y-0.5"
            >
              <FiArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;