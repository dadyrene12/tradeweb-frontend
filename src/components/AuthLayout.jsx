import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';

const AuthLayout = ({
  eyebrow = 'Welcome',
  sideTitle,
  sideText,
  sidePoints = [],
  title,
  subtitle,
  children,
  footer,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#FF6C00]/20 to-gray-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-10 w-72 h-72 bg-[#FF6C00]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-10 w-72 h-72 bg-[#00C853]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[1040px] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden md:min-h-[640px]">
        <div className="w-full md:w-[45%] bg-gradient-to-br from-[#FF6C00] to-[#C24A00] p-8 md:p-10 flex flex-col relative text-white">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Close and return home"
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>

          <div className="mt-10 md:mt-12">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[13px] font-black text-[#FF6C00] shadow-lg">RN</span>
              <span className="text-[22px] font-extrabold tracking-tight">Smart Electronics</span>
            </Link>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 mb-3">
              {eyebrow}
            </p>
            <h2 className="text-[32px] md:text-[36px] font-bold mb-4 tracking-tight leading-tight">
              {sideTitle}
            </h2>
            <p className="text-[14px] text-white/85 leading-relaxed max-w-[320px]">
              {sideText}
            </p>
          </div>

          {sidePoints.length > 0 && (
            <ul className="mt-8 space-y-3">
              {sidePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[13px] text-white/90">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00C853]/20 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-3.5 h-3.5 text-[#00C853]" />
                  </span>
                  <span className="leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-3">
                {['JD', 'AK', 'MR', 'SL'].map((initials) => (
                  <div
                    key={initials}
                    className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/80 flex items-center justify-center text-[10px] font-bold"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[12px] text-white/85">Trusted by 50,000+ customers</span>
            </div>
            <div className="pt-6 border-t border-white/20">
              <p className="text-[11px] text-white/60">&copy; 2026 RN Smart Electronics Company Ltd. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[55%] bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="mb-7">
              <h2 className="text-[30px] font-bold text-gray-900 mb-2 tracking-tight">{title}</h2>
              <p className="text-[14px] text-gray-600">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="text-center mt-7">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
