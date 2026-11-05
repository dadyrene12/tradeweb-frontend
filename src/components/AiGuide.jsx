import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaWhatsapp } from 'react-icons/fa';
import { FiArrowRight, FiSend, FiUser, FiX } from 'react-icons/fi';

const STORE = {
  whatsapp: 'https://wa.me/250787015289',
  phone: '0787 015 289',
  email: 'rnsmartelectronics@gmail.com',
  freeShipping: 100000,
};

const TOPICS = [
  {
    id: 'tracking',
    keywords: ['track', 'order status', 'where is my order', 'my order', 'parcel', 'shipment', 'order id'],
    text:
      'You can follow your order on the Track Order page. Enter the order ID from your confirmation message together with the email used for the order.',
    actions: [
      { label: 'Track my order', to: '/track' },
      { label: 'Open my account', to: '/account' },
    ],
  },
  {
    id: 'shipping',
    keywords: ['delivery', 'deliver', 'shipping', 'ship', 'free shipping', 'how long', 'arrive', 'transport', 'outside kigali', 'kigali'],
    text:
      'We deliver across Rwanda. Orders over FRW 100,000 qualify for free shipping, and smaller orders are charged by location. Message us on WhatsApp with your area and we will confirm the time and cost.',
    actions: [
      { label: 'Start shopping', to: '/shop' },
      { label: 'Chat on WhatsApp', href: STORE.whatsapp, external: true },
    ],
  },
  {
    id: 'payment',
    keywords: ['pay', 'payment', 'mpesa', 'momo', 'mobile money', 'cash', 'card', 'bank', 'installment', 'deposit'],
    text:
      'Nothing is charged online. Send your order and our team confirms availability, the final price and the payment option that works for you, such as Mobile Money or cash on delivery.',
    actions: [
      { label: 'Chat on WhatsApp', href: STORE.whatsapp, external: true },
      { label: 'Contact options', to: '/contact' },
    ],
  },
  {
    id: 'returns',
    keywords: ['return', 'refund', 'exchange', 'warranty', 'defect', 'damaged', 'broken', 'wrong item', 'faulty'],
    text:
      'Returns are accepted within 30 days if the product is unused and in its original packaging. If something arrives damaged or faulty, contact us and we will help with a replacement or repair.',
    actions: [
      { label: 'Chat on WhatsApp', href: STORE.whatsapp, external: true },
      { label: 'Contact support', to: '/contact' },
    ],
  },
  {
    id: 'products',
    keywords: ['product', 'television', 'tv', 'fridge', 'refrigerator', 'freezer', 'washing machine', 'blender', 'kettle', 'speaker', 'radio', 'cooker', 'appliance', 'audio', 'recommend', 'which', 'best', 'buy', 'shop', 'store'],
    text:
      'We stock TVs and audio, fridges and freezers, washing machines, cooking machines, blenders, kettles and other home essentials. Tell me what you want to use it for and your budget, or browse the shop to compare models.',
    actions: [
      { label: 'Browse all products', to: '/shop' },
      { label: 'TVs & audio', to: '/shop?category=audio' },
      { label: 'Home appliances', to: '/shop?category=appliances' },
    ],
  },
  {
    id: 'cart',
    keywords: ['cart', 'basket', 'checkout', 'add to cart', 'order online', 'place an order'],
    text:
      'Add products to your cart, open the cart page, fill in your delivery details and send the order by WhatsApp or email. We then confirm stock, payment and delivery with you.',
    actions: [
      { label: 'Open my cart', to: '/cart' },
      { label: 'Continue shopping', to: '/shop' },
    ],
  },
  {
    id: 'coupons',
    keywords: ['coupon', 'promo', 'discount', 'voucher', 'code', 'offer'],
    text:
      'You can try these promo codes in the cart: WELCOME10 for 10% off, or SAVE5 for a fixed discount. Enter the code in the “Promo code” box on the cart page before sending your order.',
    actions: [{ label: 'Go to cart', to: '/cart' }],
  },
  {
    id: 'account',
    keywords: ['account', 'sign in', 'login', 'register', 'create account', 'password', 'forgot password', 'reset password', 'profile'],
    text:
      'Use Sign in at the top of the site, or create a new account in a few seconds. If you forgot your password, choose “Forgot password” on the sign-in page to get a reset link. Your account page shows your orders and details.',
    actions: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'Reset password', to: '/forgot-password' },
    ],
  },
  {
    id: 'compare',
    keywords: ['compare', 'comparison', 'difference between', 'versus', 'vs'],
    text:
      'Use the Compare page to place products side by side and check their prices and specifications before you decide.',
    actions: [
      { label: 'Compare products', to: '/compare' },
      { label: 'Browse products', to: '/shop' },
    ],
  },
  {
    id: 'wishlist',
    keywords: ['wishlist', 'wish list', 'save', 'saved', 'favorite', 'favourite', 'favorites'],
    text:
      'Tap the heart on a product to save it. Your saved items are kept on the Wishlist page so you can come back to them later.',
    actions: [
      { label: 'Open wishlist', to: '/wishlist' },
      { label: 'Find products', to: '/shop' },
    ],
  },
  {
    id: 'contact',
    keywords: ['contact', 'human', 'agent', 'support', 'whatsapp', 'phone', 'call', 'email', 'location', 'address', 'hours', 'open'],
    text:
      `We are in Kigali, Nyarugenge. Call or WhatsApp ${STORE.phone}, or email ${STORE.email}. Monday to Friday 8:00 am – 6:00 pm, Saturday 9:00 am – 5:00 pm, and WhatsApp only on Sunday.`,
    actions: [
      { label: 'Chat on WhatsApp', href: STORE.whatsapp, external: true },
      { label: 'Contact page', to: '/contact' },
    ],
  },
  {
    id: 'admin',
    keywords: ['admin', 'manage products', 'manage orders', 'dashboard'],
    text:
      'Store administrators can open the dashboard from the Admin link after signing in. There you can manage products, categories, orders, users and settings.',
    actions: [{ label: 'Open admin', to: '/admin' }],
  },
];

const SUGGESTIONS = [
  { label: 'Track order', prompt: 'How do I track my order?' },
  { label: 'Delivery', prompt: 'What are the delivery and shipping options?' },
  { label: 'Returns', prompt: 'What is your return and refund policy?' },
  { label: 'Payment', prompt: 'How do I pay for my order?' },
  { label: 'Products', prompt: 'Help me choose a product' },
  { label: 'Human', prompt: 'I want to talk to a human' },
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const matches = (text, topic) =>
  topic.keywords.reduce((score, keyword) => {
    if (!text.includes(keyword)) return score;
    return score + keyword.split(' ').length;
  }, 0);

const getReply = (input) => {
  const text = normalize(input);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)) {
    return {
      text: 'Hello! I can help you find products, check delivery and payment options, track an order, or handle returns. What would you like to do?',
      actions: [
        { label: 'Browse products', to: '/shop' },
        { label: 'Track my order', to: '/track' },
      ],
    };
  }

  if (/\b(thanks|thank you|thankyou|great|awesome|perfect)\b/.test(text)) {
    return {
      text: 'You are welcome. If you need anything else, I am right here.',
      actions: [{ label: 'Chat on WhatsApp', href: STORE.whatsapp, external: true }],
    };
  }

  if (['help', 'options', 'guide', 'what can you do'].includes(text) || text.startsWith('what can you do')) {
    return {
      text:
        'I can guide you around the store: finding products, comparing models, the cart and checkout, delivery fees, payment options, returns, order tracking and account help. Pick a topic or just ask in your own words.',
      actions: [
        { label: 'Shop products', to: '/shop' },
        { label: 'Contact us', to: '/contact' },
      ],
    };
  }

  let best = null;
  let bestScore = 0;

  TOPICS.forEach((topic) => {
    const score = matches(text, topic);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  });

  if (best) return { text: best.text, actions: best.actions };

  return {
    text:
      'I am not sure about that one yet. I can help with products, delivery, payments, returns, order tracking and your account. For an exact answer, our team is one WhatsApp message away.',
    actions: [
      { label: 'Chat on WhatsApp', href: STORE.whatsapp, external: true },
      { label: 'Browse products', to: '/shop' },
      { label: 'Contact page', to: '/contact' },
    ],
  };
};

const ActionButton = ({ action, onNavigate }) => {
  const className =
    'flex w-full items-center justify-between gap-2 rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2 text-left text-[13px] font-bold text-[#B24A00] transition-colors hover:border-[#FF6C00] hover:bg-[#FF6C00] hover:text-white';

  if (action.href) {
    return (
      <a href={action.href} target="_blank" rel="noreferrer" className={className} onClick={onNavigate}>
        {action.label}
        <FiArrowRight className="h-4 w-4 shrink-0" />
      </a>
    );
  }

  return (
    <Link to={action.to} className={className} onClick={onNavigate}>
      {action.label}
      <FiArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
};

const AiGuide = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Hi! I am the RN Smart guide. Ask me about products, delivery, payments, returns or your order. How can I help today?',
      actions: [],
    },
  ]);

  const idRef = useRef(0);
  const timers = useRef([]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
      timers.current.push(timer);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = useCallback((raw) => {
    const text = String(raw || '').trim();
    if (!text) return;

    idRef.current += 1;
    setMessages((prev) => [...prev, { id: `m-${idRef.current}`, role: 'user', text, actions: [] }]);
    setInput('');
    setTyping(true);

    const timer = window.setTimeout(() => {
      const reply = getReply(text);
      idRef.current += 1;
      setMessages((prev) => [...prev, { id: `m-${idRef.current}`, role: 'assistant', ...reply }]);
      setTyping(false);
    }, 650);
    timers.current.push(timer);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  const closeOnNavigate = () => setOpen(false);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI shopping guide"
          className="group fixed bottom-20 right-3 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6C00] to-[#FF8A2B] text-white shadow-[0_14px_34px_-10px_rgba(255,108,0,0.7)] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6C00] sm:bottom-24 sm:right-5 sm:h-auto sm:w-auto sm:gap-2.5 sm:py-2.5 sm:pl-2.5 sm:pr-4"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 sm:h-10 sm:w-10">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
            <FaRobot className="relative h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/75">Need help?</span>
            <span className="block text-[13.5px] font-extrabold">AI Guide</span>
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="AI shopping guide"
          className="fixed inset-x-2 bottom-2 z-[70] flex h-[70dvh] max-h-[560px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_70px_-18px_rgba(11,27,51,0.45)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[390px] sm:rounded-3xl"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
        >
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

          <header className="relative shrink-0 overflow-hidden bg-[#0B1B33] px-3.5 py-3 text-white sm:px-4 sm:py-4">
            <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#FF6C00]/35 blur-2xl" />
            <div className="relative flex items-center gap-2.5 sm:gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A1A] to-[#E65C00] shadow-lg shadow-orange-900/30 sm:h-11 sm:w-11 sm:rounded-2xl">
                <FaRobot className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1B33] bg-emerald-400 sm:h-3 sm:w-3" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <h2 className="text-[14.5px] font-extrabold tracking-tight sm:text-[16px]">RN Smart AI Guide</h2>
                <p className="text-[10.5px] font-medium text-white/65 sm:text-[11.5px]">Online · replies instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI guide"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white sm:h-9 sm:w-9"
              >
                <FiX className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-[#F8FAFC] px-3 py-3 sm:space-y-3 sm:px-4 sm:py-4">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                      isUser ? 'bg-[#0B1B33] text-white' : 'bg-orange-100 text-[#E65C00]'
                    }`}
                  >
                    {isUser ? <FiUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <FaRobot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </span>
                  <div className={`min-w-0 max-w-[86%] sm:max-w-[82%] ${isUser ? 'items-end' : ''}`}>
                    <div
                      className={`whitespace-pre-line rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed sm:px-3.5 sm:py-2.5 sm:text-[13.5px] ${
                        isUser
                          ? 'rounded-tr-sm bg-[#FF6C00] font-semibold text-white'
                          : 'rounded-tl-sm border border-gray-200 bg-white text-[#1F2937] shadow-sm'
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.actions?.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {message.actions.map((action) => (
                          <ActionButton key={action.label} action={action} onNavigate={closeOnNavigate} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#E65C00]">
                  <FaRobot className="h-4 w-4" />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:pb-3">
            <div className="mb-2">
              <p className="mb-1 px-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gray-400">Quick questions</p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-2">
                {SUGGESTIONS.map(({ label, prompt }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => send(prompt)}
                    className="truncate rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:border-[#FF6C00] hover:bg-orange-50 hover:text-[#E65C00] sm:text-[11.5px]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-1.5 sm:gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about products, delivery, orders…"
                aria-label="Ask the AI guide"
                className="h-10 min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 text-[13px] text-[#0B1B33] placeholder-gray-400 transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-4 focus:ring-orange-100 sm:h-11 sm:px-3.5 sm:text-[13.5px]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6C00] text-white transition-colors hover:bg-[#E65C00] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
              >
                <FiSend className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between gap-2 px-0.5 sm:mt-2">
              <p className="truncate text-[9.5px] text-gray-400 sm:text-[10.5px]">Answers are a guide. Our team confirms final details.</p>
              <a
                href={STORE.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#1DA851] hover:underline sm:text-[10.5px]"
              >
                <FaWhatsapp className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiGuide;
