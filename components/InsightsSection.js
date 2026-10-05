// components/InsightsSection.js
// Homepage tile grid for Insight Articles.
// Styling is in InsightsSection.module.css — only dynamic values stay inline.

'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import styles from './InsightsSection.module.css'
import Arrow from '@/components/Arrow'

const CATEGORY_LABELS = {
  'industry-analysis': 'Industry analysis',
  'case-study': 'Case study',
  commentary: 'Commentary',
  'market-briefing': 'Market briefing',
  press: 'Press',
  'firm-update': 'Firm update',
}

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

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function InsightsSection({ insightsData, articles = [] }) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Tiles rise in one after another once the section is on screen (GSAP).
  // Doing this in GSAP rather than CSS means no transition-delay is left on
  // the tiles afterwards, so hover responds instantly.
  useEffect(() => {
    if (!isVisible || !sectionRef.current) return
    const tiles = sectionRef.current.querySelectorAll('[data-insight-tile]')
    if (!tiles.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(tiles, { autoAlpha: 1 })
      return
    }
    const tween = gsap.fromTo(
      tiles,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.1, clearProps: 'transform' }
    )
    return () => tween.kill()
  }, [isVisible])

  if (!insightsData || insightsData.enabled === false) return null
  if (!articles.length) return null

  const headline = insightsData.headline || 'Insights'
  const intro = insightsData.introduction
  const cta = insightsData.callToAction

  return (
    <section
      ref={sectionRef}
      id="insights"
      className={cx(styles.section, isVisible && styles.isVisible)}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.headline}>{headline}</h2>
          </div>

          {intro && (
            <div className={styles.intro}>
              <PortableText
                value={intro}
                components={{
                  block: {
                    normal: ({ children }) => <p>{children}</p>,
                  },
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.grid}>
          {articles.map((article, index) => (
            <InsightTile
              key={article._id || article.slug?.current || index}
              article={article}
              index={index}
            />
          ))}
        </div>

        {cta?.text && cta?.link && (
          <div className={styles.ctaRow}>
            <Link href={cta.link} className={`${styles.ctaLink} u-link`}>
              {cta.text}
              <span aria-hidden="true" className={styles.ctaArrow}>
                <Arrow direction="right" style={{ marginLeft: 0 }} />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================================
// Individual tile
// ============================================================

function InsightTile({ article, index }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const slug = article.slug?.current
  const hasImage = !!article.featuredImage?.asset
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category || ''
  const dateLabel = formatDate(article.publishDate)

  // Tiles update the URL with history.pushState rather than router.push.
  // Next.js keeps useSearchParams in sync with pushState, but skips the server
  // re-render (and Sanity re-fetch) that router.push triggers - so the overlay
  // opens the instant you click.
  const handleClick = (e) => {
    if (!slug) return
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    params.set('article', slug)
    window.history.pushState(null, '', `${pathname}?${params.toString()}`)
  }

  // Fallback href so cmd-click / right-click "open in new tab" still works —
  // points to the dedicated /insights/[slug] page (built in Phase 4).
  const href = slug ? `/insights/${slug}` : '#'

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={styles.tile}
      data-insight-tile
      aria-label={`Read article: ${article.title}`}
    >
      {hasImage ? (
        <div className={styles.tileImage}>
          <Image
            src={urlFor(article.featuredImage).width(800).height(534).url()}
            alt={article.featuredImage.alt || article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div aria-hidden="true" className={styles.tileSpacer} />
      )}

      <div className={styles.tileMeta}>
        {categoryLabel && <span className={styles.tileCategory}>{categoryLabel}</span>}
        {categoryLabel && dateLabel && (
          <span aria-hidden="true" className={styles.tileMetaDot} />
        )}
        {dateLabel && (
          <time dateTime={article.publishDate} className={styles.tileDate}>
            {dateLabel}
          </time>
        )}
      </div>

      <h3 className={cx(styles.tileTitle, !hasImage && styles.tileTitleLarge)}>
        {article.title}
      </h3>

      {article.excerpt && (
        <p className={cx(styles.tileExcerpt, !hasImage && styles.tileExcerptLong)}>
          {article.excerpt}
        </p>
      )}

      <div className={styles.tileReadMore}>
        Read article
        <span aria-hidden="true" className={styles.tileReadMoreArrow}>
          <Arrow direction="right" style={{ marginLeft: 0 }} />
        </span>
      </div>
    </Link>
  )
}
