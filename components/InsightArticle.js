// components/InsightArticle.js
// Shared article renderer used by the overlay (Phase 3) and the dedicated
// /insights/[slug] page (Phase 4). Single source of truth for article styling.

import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import styles from './InsightArticle.module.css'

// Category value → display label (shared with InsightsSection)
const CATEGORY_LABELS = {
  'industry-analysis': 'Industry analysis',
  'case-study': 'Case study',
  commentary: 'Commentary',
  'market-briefing': 'Market briefing',
  press: 'Press',
  'firm-update': 'Firm update',
}

// Format YYYY-MM-DD → "12 May 2026"
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Extract YouTube or Vimeo embed URL from a video URL
function getEmbedUrl(url) {
  if (!url) return null

  // YouTube — handles youtu.be, youtube.com/watch, youtube.com/embed
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  )
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo — handles vimeo.com/{id} and player.vimeo.com/video/{id}
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

// ============================================================
// Portable Text custom serialisers
// ============================================================

const portableTextComponents = {
  types: {
    inlineImage: ({ value }) => {
      if (!value?.asset) return null
      const width = value.width || 'inset'
      const widthClass =
        width === 'wide'
          ? styles.inlineImageWide
          : width === 'full'
            ? styles.inlineImageFull
            : styles.inlineImageInset

      // Pick a sensible image width based on display mode
      const imageWidth = width === 'full' ? 1600 : width === 'wide' ? 1200 : 800

      return (
        <figure className={cx(styles.inlineImage, widthClass)}>
          <div className={styles.inlineImageInner}>
            <Image
              src={urlFor(value).width(imageWidth).url()}
              alt={value.alt || ''}
              width={imageWidth}
              height={Math.round(imageWidth * 0.66)}
              sizes={
                width === 'full'
                  ? '100vw'
                  : width === 'wide'
                    ? '(max-width: 768px) 100vw, 900px'
                    : '(max-width: 768px) 100vw, 700px'
              }
            />
          </div>
          {value.caption && (
            <figcaption className={styles.inlineImageCaption}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    pullQuote: ({ value }) => {
      if (!value?.quote) return null
      return (
        <blockquote className={styles.pullQuote}>
          <p className={styles.pullQuoteText}>{value.quote}</p>
          {value.attribution && (
            <cite className={styles.pullQuoteAttribution}>{value.attribution}</cite>
          )}
        </blockquote>
      )
    },

    videoEmbed: ({ value }) => {
      const embedUrl = getEmbedUrl(value?.url)
      if (!embedUrl) return null

      return (
        <figure className={styles.videoEmbed}>
          <div className={styles.videoEmbedInner}>
            <iframe
              src={embedUrl}
              title={value.caption || 'Embedded video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {value.caption && (
            <figcaption className={styles.videoEmbedCaption}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },

  marks: {
    link: ({ value, children }) => {
      const href = value?.href || '#'
      const isExternal = href.startsWith('http')
      const newTab = value?.blank ?? isExternal
      return (
        <a
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
}

// ============================================================
// Author display logic
// ============================================================

function ArticleAuthor({ article }) {
  const { authorType, teamAuthor, externalAuthor } = article

  if (authorType === 'team' && teamAuthor) {
    return (
      <div className={styles.heroAuthor}>
        {teamAuthor.profileImage?.asset && (
          <div className={styles.heroAuthorImage}>
            <Image
              src={urlFor(teamAuthor.profileImage).width(96).height(96).url()}
              alt={teamAuthor.profileImage.alt || teamAuthor.name}
              fill
              sizes="48px"
            />
          </div>
        )}
        <div className={styles.heroAuthorText}>
          <span className={styles.heroAuthorName}>{teamAuthor.name}</span>
          {teamAuthor.jobTitle && (
            <span className={styles.heroAuthorRole}>{teamAuthor.jobTitle}</span>
          )}
        </div>
      </div>
    )
  }

  if (authorType === 'external' && externalAuthor?.name) {
    return (
      <div className={styles.heroAuthor}>
        <div className={styles.heroAuthorText}>
          <span className={styles.heroAuthorName}>{externalAuthor.name}</span>
          {externalAuthor.role && (
            <span className={styles.heroAuthorRole}>{externalAuthor.role}</span>
          )}
        </div>
      </div>
    )
  }

  // Firm byline (default) — keep it minimal, just the firm name
  if (authorType === 'firm' || !authorType) {
    return (
      <div className={styles.heroAuthor}>
        <div className={styles.heroAuthorText}>
          <span className={styles.heroAuthorName}>Templeton Research</span>
        </div>
      </div>
    )
  }

  return null
}

// ============================================================
// Main component
// ============================================================

export default function InsightArticle({ article }) {
  if (!article) return null

  const hasImage = !!article.featuredImage?.asset
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category || ''
  const dateLabel = formatDate(article.publishDate)

  return (
    <article className={styles.article}>
      {/* ====== HERO ====== */}
      <header
        className={cx(
          styles.articleInner,
          styles.hero,
          !hasImage && styles.heroTypographic
        )}
      >
        <h1 className={styles.heroTitle}>{article.title}</h1>

        {article.excerpt && <p className={styles.heroExcerpt}>{article.excerpt}</p>}

        <ArticleAuthor article={article} />
      </header>

      {/* ====== FEATURED IMAGE ====== */}
      {hasImage && (
        <figure className={styles.featuredImage}>
          <div className={styles.featuredImageInner}>
            <Image
              src={urlFor(article.featuredImage).width(1600).height(900).url()}
              alt={article.featuredImage.alt || article.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
          {article.featuredImage.caption && (
            <figcaption className={styles.featuredImageCaption}>
              {article.featuredImage.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* ====== BODY ====== */}
      <div className={cx(styles.articleInner, styles.body)}>
        {article.body && (
          <PortableText value={article.body} components={portableTextComponents} />
        )}
      </div>

      {/* ====== FOOTER — meta, original publication, tags ====== */}
      {(categoryLabel ||
        dateLabel ||
        article.originalPublication?.url ||
        article.tags?.length > 0) && (
        <footer className={cx(styles.articleInner, styles.footer)}>
          {(categoryLabel || dateLabel) && (
            <div className={styles.footerMeta}>
              {categoryLabel && (
                <span className={styles.footerCategory}>{categoryLabel}</span>
              )}
              {categoryLabel && dateLabel && (
                <span aria-hidden="true" className={styles.footerDot} />
              )}
              {dateLabel && (
                <time dateTime={article.publishDate} className={styles.footerDate}>
                  {dateLabel}
                </time>
              )}
            </div>
          )}

          {article.originalPublication?.url && (
            <p className={styles.originalPub}>
              Originally published on{' '}
              <a
                href={article.originalPublication.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.originalPubLink}
              >
                {article.originalPublication.outlet || 'external site'}
              </a>
            </p>
          )}

          {article.tags?.length > 0 && (
            <div className={styles.tags}>
              {article.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      )}

      {/* ====== RELATED ARTICLES ====== */}
      {article.relatedArticles?.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedHeading}>Related insights</h2>
            <div className={styles.relatedGrid}>
              {article.relatedArticles.map((related) => (
                <RelatedCard key={related._id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

// ============================================================
// Related article card
// ============================================================

function RelatedCard({ article }) {
  const slug = article.slug?.current
  const href = slug ? `/?article=${slug}` : '#'
  const hasImage = !!article.featuredImage?.asset
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category || ''

  return (
    <Link href={href} className={styles.relatedCard}>
      {hasImage && (
        <div className={styles.relatedCardImage}>
          <Image
            src={urlFor(article.featuredImage).width(600).height(400).url()}
            alt={article.featuredImage.alt || article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      {categoryLabel && <div className={styles.relatedCardMeta}>{categoryLabel}</div>}
      <h3 className={styles.relatedCardTitle}>{article.title}</h3>
    </Link>
  )
}