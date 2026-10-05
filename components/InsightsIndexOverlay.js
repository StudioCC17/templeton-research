// components/InsightsIndexOverlay.js
// Full-screen overlay listing every Insight article, opened by "View all
// Insights" (?insights=all in the URL). Category chips filter the grid.
// Clicking a tile opens the article in InsightOverlay, which sits on top;
// closing the article drops you back here. Motion matches the article reader.

'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import gsap from 'gsap'
import { client } from '@/lib/sanity'
import { InsightTile, CATEGORY_LABELS } from './InsightsSection'
import styles from './InsightsIndexOverlay.module.css'

const ALL_QUERY = `*[_type == "insightArticle" && defined(slug.current)] | order(publishDate desc){
  _id,
  title,
  slug,
  publishDate,
  category,
  excerpt,
  featuredImage { asset, alt }
}`

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function InsightsIndexOverlay() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const isOpen = searchParams.get('insights') === 'all'
  const articleOpen = !!searchParams.get('article')

  const [articles, setArticles] = useState(null) // null = not loaded yet
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('all')

  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const gridRef = useRef(null)
  const openTlRef = useRef(null)
  const closingRef = useRef(false)

  // ---------- Data (fetched once, the first time it opens) ----------
  useEffect(() => {
    if (!isOpen || articles) return
    let cancelled = false
    client
      .fetch(ALL_QUERY)
      .then((data) => !cancelled && setArticles(data || []))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [isOpen, articles])

  // ---------- Body scroll lock ----------
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  // ---------- GSAP open ----------
  useLayoutEffect(() => {
    if (!isOpen) return
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return
    closingRef.current = false
    const fast = reduceMotion()
    const tl = gsap.timeline({ defaults: { overwrite: true } })
    openTlRef.current = tl
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: fast ? 0.15 : 0.35, ease: 'power2.out' }, 0)
    tl.fromTo(
      panel,
      { autoAlpha: 0, yPercent: fast ? 0 : 4 },
      { autoAlpha: 1, yPercent: 0, duration: fast ? 0.15 : 0.6, ease: 'expo.out', force3D: true },
      0
    )
    return () => {
      tl.kill()
      openTlRef.current = null
    }
  }, [isOpen])

  // ---------- Filtering ----------
  const categories = useMemo(() => {
    if (!articles) return []
    const seen = []
    articles.forEach((a) => a.category && !seen.includes(a.category) && seen.push(a.category))
    return seen
  }, [articles])

  const visible = useMemo(
    () => (articles || []).filter((a) => filter === 'all' || a.category === filter),
    [articles, filter]
  )

  // Tiles rise in one after another whenever the list appears or the filter changes
  useLayoutEffect(() => {
    if (!isOpen || !gridRef.current) return
    const tiles = gridRef.current.querySelectorAll('[data-insight-tile]')
    if (!tiles.length) return
    if (reduceMotion()) {
      gsap.set(tiles, { autoAlpha: 1 })
      return
    }
    const tween = gsap.fromTo(
      tiles,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.1, clearProps: 'transform' }
    )
    return () => tween.kill()
  }, [isOpen, visible])

  // ---------- Close (quick soft fade, same as the article reader) ----------
  const handleClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    const finish = () => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('insights')
      params.delete('article')
      const qs = params.toString()
      window.history.pushState(null, '', qs ? `${pathname}?${qs}` : pathname)
    }
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return finish()
    if (openTlRef.current) openTlRef.current.kill()
    gsap
      .timeline({ onComplete: finish, defaults: { overwrite: true } })
      .to(panel, { autoAlpha: 0, yPercent: 1, duration: 0.25, ease: 'power1.inOut', force3D: true }, 0)
      .to(backdrop, { autoAlpha: 0, duration: 0.25, ease: 'power1.inOut' }, 0)
  }, [pathname, searchParams])

  // Esc closes this overlay - but only when no article is open on top of it
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !articleOpen) handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, articleOpen, handleClose])

  if (!isOpen) return null

  return (
    <>
      <div ref={backdropRef} className={styles.backdrop} onClick={handleClose} aria-hidden="true" />

      <div ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-label="All insights">
        <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Close insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 36, height: 36, display: 'block' }}>
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.inner}>
          <header className={styles.header}>
            <span className={styles.preheader}>Insights</span>
            <h2 className={`hero-text ${styles.headline}`}>All articles, commentary and analysis</h2>

            {categories.length > 1 && (
              <div className={styles.filters} role="group" aria-label="Filter by category">
                {['all', ...categories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.chip} ${filter === cat ? styles.chipActive : ''}`}
                    aria-pressed={filter === cat}
                    onClick={() => setFilter(cat)}
                  >
                    {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>
            )}
          </header>

          {error && <p className={styles.status}>Insights could not be loaded. Please try again.</p>}
          {!error && !articles && <p className={styles.status}>Loading…</p>}
          {articles && !visible.length && <p className={styles.status}>No articles in this category yet.</p>}

          {visible.length > 0 && (
            <div ref={gridRef} className={styles.grid}>
              {visible.map((article, index) => (
                <InsightTile key={article._id} article={article} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
