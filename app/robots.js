// app/robots.js - served as /robots.txt
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://www.templetonresearch.com/sitemap.xml',
  }
}
