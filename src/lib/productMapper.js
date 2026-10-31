const FALLBACK_IMAGE = '/images/products/product-01.jpg';

export const toStoreProduct = (product) => ({
  id: product._id,
  image: product.images?.[0] || FALLBACK_IMAGE,
  images: product.images?.length ? product.images : [FALLBACK_IMAGE],
  name: product.name,
  description: product.description,
  shortDescription: product.shortDescription,
  price: product.price,
  oldPrice: product.oldPrice,
  category: product.category,
  subcategory: product.subcategory,
  brand: product.brand,
  rating: product.rating,
  stock: product.stock,
  featured: product.featured,
  badge: product.featured ? 'FEATURED' : '',
});

export default toStoreProduct;
