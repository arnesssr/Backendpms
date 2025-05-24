export const CDN_CONFIG = {
  endpoints: {
    products: process.env.R2_PUBLIC_URL + '/product-images',
    sections: process.env.R2_PUBLIC_URL + '/section-banners',
    categories: process.env.R2_PUBLIC_URL + '/category-images'
  },
  options: {
    defaultQuality: 80,
    imageSizes: [256, 512, 1024],
    formats: ['webp', 'jpeg'],
    cacheMaxAge: 31536000 // 1 year in seconds
  }
}
