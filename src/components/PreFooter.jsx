import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles, Globe2, ShieldCheck, BadgeCheck, MessageCircle, Smartphone,
  ChevronDown, Mail, Send, Phone, ArrowRight
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';

const PreFooter = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const features = [
    {
      icon: Sparkles,
      title: 'Great Value',
      desc: 'Quality electronics at great prices, with continuous promotions and personalized offers.',
    },
    {
      icon: Globe2,
      title: 'Fast Delivery',
      desc: 'Fast delivery in Kigali and across Rwanda. Register to get FRW 10 coupons.',
    },
    {
      icon: ShieldCheck,
      title: 'Safe Payment',
      desc: 'Pay with popular and secure payment methods.',
    },
    {
      icon: BadgeCheck,
      title: 'Shop with Confidence',
      desc: 'Buyer protection with easy returns and secure checkout.',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      desc: 'Convenient online consultation and messaging to solve your problem.',
    },
    {
      icon: Smartphone,
      title: 'Shop On-The-Go',
      desc: 'Download the app and get the world of RN Smart Electronics at your fingertips.',
    },
  ];

  const faqs = [
    {
      q: 'How do I create an account?',
      a: 'Click "Create Account" in the header, enter your details and verify your email. You can then track orders, save wishlists and check out faster.',
    },
    {
      q: 'How can I place an order?',
      a: 'Browse the shop, add products to your cart and proceed to checkout. Choose your delivery address and preferred secure payment method.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept major credit and debit cards, PayPal and other popular secure payment methods. All transactions are encrypted.',
    },
    {
      q: 'What is the return policy?',
      a: 'Eligible items can be returned within 30 days of delivery. Products must be unused and in their original packaging.',
    },
    {
      q: 'How do I contact customer service?',
      a: 'Use Live Chat, email rnsmartelectronics@gmail.com or call 0787 015 289. We are available to help with orders and product questions.',
    },
  ];

  const linkGroups = [
    {
      title: 'Sell on RN Smart Electronics',
      links: [
        { label: 'Join us', to: '/register' },
        { label: 'Seller Center', to: '/account' },
        { label: 'Partnership', to: '/contact' },
        { label: 'Advertise', to: '/contact' },
      ],
    },
    {
      title: 'Shopping Guide',
      links: [
        { label: 'How To Register', to: '/register' },
        { label: 'How To Place An Order', to: '/shop' },
        { label: 'How To Pay', to: '/cart' },
        { label: 'Shipping & Delivery', to: '/track' },
      ],
    },
    {
      title: 'Help Center',
      links: [
        { label: 'FAQs', to: '/#faqs' },
        { label: 'After Sale Policy', to: '/contact' },
        { label: 'Payment Methods', to: '/contact' },
        { label: 'Privacy Policy', to: '/privacy' },
      ],
    },
  ];

  const handleSubscribe = (event) => {
    event.preventDefault();
    toast.success('You are subscribed. Watch your inbox for deals.');
    event.target.reset();
  };

  return (
    <section className="mt-14 bg-[#FFF8F3]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-4 border-b border-orange-100 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group rounded-xl bg-white p-5 ring-1 ring-orange-100/70 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00] transition-colors group-hover:bg-[#FF6C00] group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-3 text-[13px] font-bold text-[#0A192F]">{feature.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Newsletter */}
        <div className="relative my-10 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6C00] to-[#D95500] px-6 py-7 shadow-sm sm:px-10">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <Mail className="h-3.5 w-3.5" />
                Newsletter
              </span>
              <h3 className="mt-3 text-[22px] font-black leading-tight text-white sm:text-[26px]">
                Register now to get updates on promotions and coupons.
              </h3>
              <p className="mt-1 text-[12px] text-white/80">
                Please enter your email and never miss a great deal.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md items-center overflow-hidden rounded-xl bg-white p-1.5 shadow-lg">
              <Mail className="ml-3 hidden h-5 w-5 shrink-0 text-gray-400 sm:block" />
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#0A192F] placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#E65C00]"
              >
                Subscribe
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" className="grid grid-cols-1 gap-8 border-b border-orange-100 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF6C00]">Support</span>
            <h3 className="mt-1 text-[22px] font-bold leading-tight text-[#0A192F]">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-gray-500">
              Everything you need to know about ordering, payment, delivery and returns. Still need help? Our team is available 24/7.
            </p>
            <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#FF6C00] transition-colors hover:text-[#E65C00]">
              Visit help center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:col-span-8">
            {faqs.map((faq, idx) => (
              <div key={idx} className="h-max overflow-hidden rounded-xl border border-orange-100 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[12.5px] font-semibold text-[#0A192F]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#FF6C00] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="px-4 pb-3 text-[11.5px] leading-relaxed text-gray-500">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Links + stay connected */}
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0A192F]">{group.title}</h4>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[12px] text-gray-500 transition-colors hover:text-[#FF6C00]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0A192F]">Stay Connected</h4>
            <p className="mt-2 text-[11.5px] leading-relaxed text-gray-500">
              Follow us for new arrivals, deals and product tips.
            </p>
            <div className="mt-3 flex items-center gap-2">
              {[
                { icon: FaFacebook, href: 'https://www.facebook.com/nduwumukiza.romainrens', label: 'Facebook', handle: 'nduwumukiza.romainrens' },
                { icon: FaInstagram, href: 'https://www.instagram.com/nduwumukizaromain_97', label: 'Instagram', handle: 'nduwumukizaromain_97' },
                { icon: FaTiktok, href: 'https://www.tiktok.com/@rn.smart.electron?_r=1&_t=ZS-9B63q1HmoQG', label: 'TikTok', handle: 'rn.smart.electron' },
                { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.handle ? `${social.label}: ${social.handle}` : social.label}
                    title={social.handle ? `@${social.handle}` : social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#FF6C00] ring-1 ring-orange-100 transition-colors hover:bg-[#FF6C00] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-gray-400">
              <a href="https://www.facebook.com/nduwumukiza.romainrens" target="_blank" rel="noreferrer" className="transition-colors hover:text-[#FF6C00]">
                Facebook: nduwumukiza.romainrens
              </a>
              <a href="https://www.instagram.com/nduwumukizaromain_97" target="_blank" rel="noreferrer" className="transition-colors hover:text-[#FF6C00]">
                Instagram: @nduwumukizaromain_97
              </a>
              <a href="https://www.tiktok.com/@rn.smart.electron?_r=1&_t=ZS-9B63q1HmoQG" target="_blank" rel="noreferrer" className="transition-colors hover:text-[#FF6C00]">
                TikTok: @rn.smart.electron
              </a>
            </p>
            <a href="tel:+250787015289" className="mt-4 inline-flex items-center gap-2 text-[12px] font-medium text-gray-500 transition-colors hover:text-[#FF6C00]">
              <Phone className="h-4 w-4 text-[#FF6C00]" />
              0787 015 289
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter;
