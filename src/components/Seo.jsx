import { useEffect } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_KEYWORDS,
  DEFAULT_ROBOTS,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteImage,
  absoluteUrl,
} from '../lib/seo';

const upsertMeta = (attribute, key, content) => {
  if (!content) return;
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertAlternate = (hreflang, href) => {
  if (!href) return;
  const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'alternate');
    element.setAttribute('hreflang', hreflang);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const applyDefaults = () => {
  document.title = DEFAULT_TITLE;
  upsertMeta('name', 'description', DEFAULT_DESCRIPTION);
  upsertMeta('name', 'keywords', DEFAULT_KEYWORDS);
  upsertMeta('name', 'robots', DEFAULT_ROBOTS);
  upsertLink('canonical', `${SITE_URL}/`);
  upsertAlternate('en-RW', `${SITE_URL}/`);
  upsertAlternate('x-default', `${SITE_URL}/`);
  upsertMeta('property', 'og:title', DEFAULT_TITLE);
  upsertMeta('property', 'og:description', DEFAULT_DESCRIPTION);
  upsertMeta('property', 'og:url', `${SITE_URL}/`);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:image', DEFAULT_IMAGE);
  upsertMeta('property', 'og:image:secure_url', DEFAULT_IMAGE);
  upsertMeta('property', 'og:image:alt', DEFAULT_TITLE);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:locale', 'en_RW');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', DEFAULT_TITLE);
  upsertMeta('name', 'twitter:description', DEFAULT_DESCRIPTION);
  upsertMeta('name', 'twitter:image', DEFAULT_IMAGE);
};

const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  structuredData = [],
}) => {
  const url = absoluteUrl(path);
  const imageUrl = absoluteImage(image);
  const schemas = (Array.isArray(structuredData) ? structuredData : [structuredData]).filter(Boolean);
  const schemaJson = schemas.length
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': schemas,
      })
    : '';

  useEffect(() => {
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : DEFAULT_ROBOTS);
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'publisher', SITE_NAME);

    upsertLink('canonical', url);
    upsertAlternate('en-RW', url);
    upsertAlternate('x-default', url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:secure_url', imageUrl);
    upsertMeta('property', 'og:image:alt', title);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_RW');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('name', 'twitter:image:alt', title);

    const existing = document.getElementById('seo-structured-data');
    if (existing) existing.remove();

    if (schemaJson) {
      const script = document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      script.text = schemaJson;
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById('seo-structured-data');
      if (script) script.remove();
      applyDefaults();
    };
  }, [title, description, keywords, url, imageUrl, type, noindex, schemaJson]);

  return null;
};

export default Seo;
