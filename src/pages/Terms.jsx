import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { SITE_LEGAL_NAME, STORE_EMAIL, absoluteUrl, breadcrumbSchema } from '../lib/seo';

const SECTIONS = [
  {
    title: 'Using our website',
    body: 'By browsing or shopping on this website you agree to these terms. You must provide accurate information when creating an account or placing an order and use the website only for lawful purposes.',
  },
  {
    title: 'Products and pricing',
    body: 'We aim to keep product descriptions, images and prices accurate and up to date. Prices are shown in Rwandan francs (RWF) and may change without notice. If a product is listed at an incorrect price, we may contact you before fulfilling the order.',
  },
  {
    title: 'Orders and payment',
    body: 'An order is confirmed once payment terms are agreed and stock is available. We may cancel an order if the product is unavailable, if payment cannot be verified or if we suspect fraudulent activity. You will be contacted using the details you provide.',
  },
  {
    title: 'Delivery',
    body: 'We deliver within Kigali and across Rwanda. Delivery times are estimates and may vary due to location, stock or events outside our control. Please check your order carefully when it arrives.',
  },
  {
    title: 'Returns, warranty and exchanges',
    body: 'Products may be eligible for return or exchange in line with the warranty and conditions provided at purchase. Items must be unused, complete and in their original packaging. Faulty products are handled according to the manufacturer warranty.',
  },
  {
    title: 'Intellectual property',
    body: 'The content, branding, images and text on this website belong to ' + SITE_LEGAL_NAME + ' or their respective owners and may not be copied or reused without permission.',
  },
  {
    title: 'Limitation of liability',
    body: 'We work hard to provide reliable service, but we are not liable for indirect or consequential losses arising from use of this website, to the extent permitted by law.',
  },
  {
    title: 'Changes to these terms',
    body: 'We may update these terms from time to time. The latest version will always be published on this page.',
  },
];

const Terms = () => {
  const structuredData = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Terms & conditions', path: '/terms' },
  ]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <Seo
        title="Terms & Conditions | RN Smart Electronics"
        description="Read the terms and conditions for shopping with RN Smart Electronics Company Ltd in Rwanda, including orders, pricing, delivery, returns and warranty information."
        path="/terms"
        structuredData={structuredData}
      />

      <header className="bg-[#0B1B33]">
        <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="font-semibold text-white">Terms &amp; conditions</span>
          </nav>
          <h1 className="text-[30px] font-extrabold tracking-tight text-white sm:text-[36px]">Terms &amp; Conditions</h1>
          <p className="mt-2 text-[13.5px] text-white/60">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <p className="text-[14.5px] leading-relaxed text-gray-600">
            These terms apply to your use of {absoluteUrl('/')} and to purchases made from{' '}
            {SITE_LEGAL_NAME}. Please read them carefully before placing an order.
          </p>

          <div className="mt-6 space-y-6">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-[18px] font-bold text-[#0B1B33]">{section.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-[18px] font-bold text-[#0B1B33]">Contact us</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
              If you have questions about these terms, email{' '}
              <a href={`mailto:${STORE_EMAIL}`} className="font-semibold text-[#FF6C00] hover:underline">
                {STORE_EMAIL}
              </a>{' '}
              or visit our <Link to="/contact" className="font-semibold text-[#FF6C00] hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
