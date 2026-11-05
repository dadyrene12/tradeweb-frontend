import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiMapPin, FiPhone, FiMail, FiTruck, FiShield, FiClock } from 'react-icons/fi';
import Seo from '../components/Seo';
import {
  SITE_LEGAL_NAME,
  SITE_NAME,
  STORE_ADDRESS,
  STORE_EMAIL,
  STORE_WHATSAPP,
  absoluteUrl,
  breadcrumbSchema,
} from '../lib/seo';

const VALUES = [
  {
    icon: FiShield,
    title: 'Genuine products',
    text: 'Every TV, fridge, washing machine and appliance we sell is sourced from trusted suppliers and backed by a warranty.',
  },
  {
    icon: FiTruck,
    title: 'Fast delivery in Rwanda',
    text: 'We deliver across Kigali and upcountry Rwanda, with free delivery on qualifying orders.',
  },
  {
    icon: FiPhone,
    title: 'Real human support',
    text: 'Message us on WhatsApp or call our team for product advice, delivery updates and after-sales help.',
  },
];

const About = () => {
  const structuredData = [
    {
      '@type': 'AboutPage',
      name: `About ${SITE_LEGAL_NAME}`,
      description: `Learn about ${SITE_NAME}, an electronics and home appliance store in Kigali, Rwanda.`,
      url: absoluteUrl('/about'),
      inLanguage: 'en-RW',
      mainEntity: {
        '@type': 'ElectronicsStore',
        name: SITE_LEGAL_NAME,
        alternateName: SITE_NAME,
        url: absoluteUrl('/'),
        telephone: STORE_WHATSAPP,
        email: STORE_EMAIL,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Nyarugenge',
          addressLocality: 'Kigali',
          addressCountry: 'RW',
        },
      },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About us', path: '/about' },
    ]),
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <Seo
        title="About RN Smart Electronics | Home Appliance Store in Kigali, Rwanda"
        description="Learn about RN Smart Electronics Company Ltd, a trusted electronics and home appliance store in Kigali, Rwanda. Genuine products, warranty, fast delivery and friendly WhatsApp support."
        path="/about"
        structuredData={structuredData}
      />

      <header className="relative overflow-hidden bg-[#0B1B33]">
        <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[#FF6C00]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="font-semibold text-white">About us</span>
          </nav>
          <h1 className="max-w-3xl text-[30px] font-extrabold tracking-tight text-white sm:text-[40px] sm:leading-tight">
            Your trusted electronics and home appliance store in Kigali, Rwanda
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">
            {SITE_LEGAL_NAME} helps families, businesses and homeowners across Rwanda buy genuine
            smart TVs, fridges, washing machines, cookers, speakers and everyday home appliances at
            fair prices.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-[22px] font-extrabold text-[#0B1B33]">Who we are</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-gray-600">
            Based in Nyarugenge, Kigali, {SITE_NAME} is an electronics retailer focused on quality,
            honest pricing and reliable service. We work with trusted brands and suppliers so our
            customers can shop with confidence, whether they are furnishing a new home, upgrading a
            kitchen or equipping a business.
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-gray-600">
            From your first question to delivery and after-sales support, our team is available on
            WhatsApp and by phone to help you choose the right product for your needs and budget.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[22px] font-extrabold text-[#0B1B33]">Why customers choose us</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF6C00]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-[15px] font-bold text-[#0B1B33]">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-[22px] font-extrabold text-[#0B1B33]">What we sell</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              'Smart TVs, soundbars and speakers',
              'Fridges, freezers and coolers',
              'Washing machines and dryers',
              'Cookers, microwaves and kitchen appliances',
              'Blenders, kettles and small appliances',
              'Home and office electronics accessories',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[14px] text-gray-600">
                <FiCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF6C00]" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#FF6C00] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#E65C00]"
          >
            Browse the shop
          </Link>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <FiMapPin className="h-5 w-5 text-[#FF6C00]" />
            <h2 className="mt-3 text-[15px] font-bold text-[#0B1B33]">Visit our store</h2>
            <p className="mt-1 text-[13.5px] text-gray-600">{STORE_ADDRESS}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <FiPhone className="h-5 w-5 text-[#FF6C00]" />
            <h2 className="mt-3 text-[15px] font-bold text-[#0B1B33]">Call or WhatsApp</h2>
            <a href={`tel:${STORE_WHATSAPP}`} className="mt-1 block text-[13.5px] text-gray-600 hover:text-[#FF6C00]">
              0787 015 289
            </a>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <FiClock className="h-5 w-5 text-[#FF6C00]" />
            <h2 className="mt-3 text-[15px] font-bold text-[#0B1B33]">Opening hours</h2>
            <p className="mt-1 text-[13.5px] text-gray-600">Mon - Fri: 08:00 - 18:00</p>
            <p className="text-[13.5px] text-gray-600">Saturday: 09:00 - 17:00</p>
          </div>
        </section>

        <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#0B1B33] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-[20px] font-extrabold text-white">Need help choosing a product?</h2>
            <p className="mt-1 text-[13.5px] text-white/60">Our team is ready to help you find the right appliance.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-xl bg-[#FF6C00] px-5 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#E65C00]">
              Contact us
            </Link>
            <a href={`mailto:${STORE_EMAIL}`} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-white/10">
              <FiMail className="h-4 w-4" />
              Email us
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
