import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { SITE_LEGAL_NAME, STORE_EMAIL, absoluteUrl, breadcrumbSchema } from '../lib/seo';

const SECTIONS = [
  {
    title: 'Information we collect',
    body: 'We collect the information you provide when you create an account, place an order, contact us or subscribe to updates. This may include your name, email address, phone number, delivery address and order details.',
  },
  {
    title: 'How we use your information',
    body: 'We use your information to process orders, arrange delivery, respond to enquiries, provide customer support, prevent fraud and improve our products and services. We may also send service messages about your orders.',
  },
  {
    title: 'Cookies and analytics',
    body: 'Our website may use cookies and similar technologies to keep your cart working, remember your preferences and understand how visitors use the site. You can control cookies through your browser settings.',
  },
  {
    title: 'Sharing your information',
    body: 'We do not sell your personal information. We may share order details with delivery partners and payment providers only to the extent needed to fulfil your order, or where required by law.',
  },
  {
    title: 'Data security and retention',
    body: 'We take reasonable steps to protect your information and keep it only for as long as needed for orders, support, legal and accounting purposes.',
  },
  {
    title: 'Your rights',
    body: 'You may ask to access, correct or delete your personal information by contacting us. We will respond in line with applicable Rwandan data protection law.',
  },
];

const Privacy = () => {
  const structuredData = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Privacy policy', path: '/privacy' },
  ]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <Seo
        title="Privacy Policy | RN Smart Electronics"
        description="Read the privacy policy for RN Smart Electronics Company Ltd, including how we collect, use and protect your personal information when you shop with us in Rwanda."
        path="/privacy"
        structuredData={structuredData}
      />

      <header className="bg-[#0B1B33]">
        <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <span className="font-semibold text-white">Privacy policy</span>
          </nav>
          <h1 className="text-[30px] font-extrabold tracking-tight text-white sm:text-[36px]">Privacy Policy</h1>
          <p className="mt-2 text-[13.5px] text-white/60">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <p className="text-[14.5px] leading-relaxed text-gray-600">
            {SITE_LEGAL_NAME} respects your privacy. This policy explains what information we collect
            when you use {absoluteUrl('/')} and how we use it.
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
              For privacy questions, contact us at{' '}
              <a href={`mailto:${STORE_EMAIL}`} className="font-semibold text-[#FF6C00] hover:underline">
                {STORE_EMAIL}
              </a>{' '}
              or through our <Link to="/contact" className="font-semibold text-[#FF6C00] hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
