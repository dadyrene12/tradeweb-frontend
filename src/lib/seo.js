export const SITE_URL = (
  process.env.REACT_APP_SITE_URL || 'https://www.rnsmartelectronic.rw'
).replace(/\/+$/, '');

export const SITE_NAME = 'RN Smart Electronics';
export const SITE_LEGAL_NAME = 'RN Smart Electronics Company Ltd';
export const STORE_WHATSAPP = '+250787015289';
export const STORE_EMAIL = 'rnsmartelectronics@gmail.com';
export const STORE_ADDRESS = 'Kigali - Nyarugenge, Rwanda';
export const STORE_FACEBOOK = 'https://www.facebook.com/nduwumukiza.romainrens';
export const STORE_INSTAGRAM = 'https://www.instagram.com/nduwumukizaromain_97';
export const STORE_TIKTOK =
  'https://www.tiktok.com/@rn.smart.electron?_r=1&_t=ZS-9B63q1HmoQG';

export const DEFAULT_TITLE =
  'RN Smart Electronics | Buy TVs, Fridges & Home Appliances in Rwanda';
export const DEFAULT_DESCRIPTION =
  'Shop smart TVs, fridges, washing machines, cookers, speakers and home appliances at RN Smart Electronics in Kigali, Rwanda. Genuine products, fast delivery and secure WhatsApp ordering.';
export const DEFAULT_KEYWORDS =
  'RN Smart Electronics, electronics Rwanda, home appliances Kigali, buy TV Rwanda, fridge Rwanda, washing machine Kigali, speakers Rwanda, electronics shop Kigali, smart home Rwanda';
export const DEFAULT_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const DEFAULT_IMAGE = `${SITE_URL}/images/products/product-26.jpg`;

export const absoluteUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const absoluteImage = (image) => {
  if (!image) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;
};

export const truncate = (value, maxLength = 160) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

export const organizationSchema = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_LEGAL_NAME,
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: DEFAULT_IMAGE,
  description: DEFAULT_DESCRIPTION,
  email: STORE_EMAIL,
  telephone: STORE_WHATSAPP,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Nyarugenge',
    addressLocality: 'Kigali',
    addressRegion: 'Kigali City',
    addressCountry: 'RW',
  },
  sameAs: [STORE_FACEBOOK, STORE_INSTAGRAM, STORE_TIKTOK],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: STORE_WHATSAPP,
      contactType: 'customer service',
      areaServed: 'RW',
      availableLanguage: ['en', 'rw'],
    },
  ],
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-RW',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const electronicsStoreSchema = {
  '@type': 'ElectronicsStore',
  '@id': `${SITE_URL}/#store`,
  name: SITE_LEGAL_NAME,
  image: DEFAULT_IMAGE,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  url: SITE_URL,
  telephone: STORE_WHATSAPP,
  email: STORE_EMAIL,
  description: DEFAULT_DESCRIPTION,
  priceRange: 'RWF 10,000 - RWF 2,000,000',
  currenciesAccepted: 'RWF',
  paymentAccepted: 'Cash, Mobile Money, Bank transfer',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Nyarugenge',
    addressLocality: 'Kigali',
    addressRegion: 'Kigali City',
    addressCountry: 'RW',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -1.9441,
    longitude: 30.0619,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Rwanda',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '09:00',
      closes: '17:00',
    },
  ],
  sameAs: [STORE_FACEBOOK, STORE_INSTAGRAM, STORE_TIKTOK],
};

export const breadcrumbSchema = (items = []) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});
