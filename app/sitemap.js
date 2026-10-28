// app/sitemap.js - served as /sitemap.xml
// The homepage plus each insight article (articles open as an overlay on the
// homepage; /insights/<slug> redirects there - see next.config.mjs).
import { client } from '@/lib/sanity'

const SITE = 'https://www.templetonresearch.com'

export default async function sitemap() {
  let articles = []
  try {
    articles = await client.fetch(
      `*[_type == "insightArticle" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    )
  } catch {
    // Sanity unreachable at build time - still publish the homepage
  }
  return [
    { url: SITE, changeFrequency: 'monthly', priority: 1 },
    ...articles.map((a) => ({
      url: `${SITE}/insights/${a.slug}`,
      lastModified: a._updatedAt,
      changeFrequency: 'yearly',
      priority: 0.6,
    })),
  ]
}
