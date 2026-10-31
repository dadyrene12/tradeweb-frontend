import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMapPin, FiPhone, FiMail, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-[#151515] text-gray-400 mt-10">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6C00] to-[#E65C00] text-[13px] font-black text-white shadow-md shadow-orange-500/20">RN</span>
              <div>
                <h3 className="text-white text-lg font-semibold leading-tight">RN SMART ELECTRONICS</h3>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Smart Choice &middot; Better Life</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              RN Smart Electronics Company Ltd supplies quality electronics for the modern home in Kigali and across Rwanda. Shop smart TVs, washing machines, fridges and freezers, cooking machines, radios and speakers, blenders, kettles, jiko and more at great prices with reliable service and secure payment.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>Kigali - Nyarugenge, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 flex-shrink-0 text-primary" />
                <span>0789 015 289 / +250 722 189 516</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-5 h-5 flex-shrink-0 text-primary" />
                <span>rnsmartelectronics@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> About Us</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Contact Us</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Store Locations</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Order Tracking</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Returns & Exchanges</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Information</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> My Account</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Shopping Cart</Link></li>
              <li><Link to="/account?tab=wishlist" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Wishlist</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Privacy Policy</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop?category=audio" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Smart TVs & Audio</Link></li>
              <li><Link to="/shop?category=appliances" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Washing Machines</Link></li>
              <li><Link to="/shop?category=appliances" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Fridges & Freezers</Link></li>
              <li><Link to="/shop?category=appliances" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Cooking Machines</Link></li>
              <li><Link to="/shop?category=appliances" className="hover:text-primary transition-colors flex items-center gap-1.5"><FiArrowRight className="w-3 h-3" /> Blenders, Kettles & Jiko</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a]">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">Copyright &copy; 2026 <span className="text-primary">RN SMART ELECTRONICS COMPANY LTD</span>. All Rights Reserved by ITECHCORE.RW.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
             
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><FiFacebook className="w-4 h-4" /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><FiTwitter className="w-4 h-4" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><FiInstagram className="w-4 h-4" /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><FiYoutube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;