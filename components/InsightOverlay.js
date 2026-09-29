// components/InsightOverlay.js
// Full-screen overlay that loads an article when ?article=slug is in the URL.
// Handles: data fetching, scroll lock, focus management, ESC to close,
// click outside to close, prev/next navigation.

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { client } from '@/lib/sanity'
import InsightArticle from './InsightArticle'
import styles from './InsightOverlay.module.css'

// GROQ query for a single article by slug + navigation context (all slugs in order).
// Returns the article AND a flat list of slugs so we can compute prev/next.
const ARTICLE_QUERY = `{
  "article": *[_type == "insightArticle" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishDate,
    category,
    tags,
    excerpt,
    featuredImage {
      asset,
      alt,
      caption
    },
    authorType,
    teamAuthor->{
      _id,
      name,
      jobTitle,
      profileImage {
        asset,
        alt
      }
    },
    externalAuthor,
    body[]{
      ...,
      _type == "inlineImage" => {
        _key,
        _type,
        asset,
        alt,
        caption,
        width
      },
      _type == "pullQuote" => {
        _key,
        _type,
        quote,
        attribution
      },
      _type == "videoEmbed" => {
        _key,
        _type,
        url,
        caption
      }
    },
    originalPublication,
    "relatedArticles": relatedArticles[]->{
      _id,
      title,
      slug,
      category,
      featuredImage {
        asset,
        alt
      }
    }
  },
  "navigation": *[_type == "insightArticle"] | order(publishDate desc) {
    "slug": slug.current,
    title
  }
}`

export default function InsightOverlay() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSlug = searchParams.get('article')

  const [article, setArticle] = useState(null)
  const [navigation, setNavigation] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [isMounted, setIsMounted] = useState(false)

  const overlayRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  // ---------- Open/close lifecycle ----------

  const isOpen = !!activeSlug

  // Track the element that was focused before the overlay opened, so we can
  // restore focus to it on close. Important for keyboard users.
  useEffect(() => {
    if (isOpen && !previousFocusRef.current) {
      previousFocusRef.current = document.activeElement
    }
  }, [isOpen])

  // Mount/unmount visibility states. Forcing a synchronous reflow (reading
  // offsetHeight) flushes the initial hidden state to the browser, so when we
  // immediately flip to the visible class the transition still fires — but
  // without waiting the ~2 frames a double-rAF costs, so the open feels instant.
  useEffect(() => {
    if (!isOpen) {
      setIsMounted(false)
      return
    }
    // Read layout to commit the hidden starting state, then reveal.
    if (overlayRef.current) void overlayRef.current.offsetHeight
    setIsMounted(true)
  }, [isOpen])

  // ---------- Body scroll lock ----------

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Compensate for the scrollbar disappearing so the page doesn't jump
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen])

  // ---------- Data fetching ----------

  useEffect(() => {
    if (!activeSlug) {
      setArticle(null)
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')

    client
      .fetch(ARTICLE_QUERY, { slug: activeSlug })
      .then((data) => {
        if (cancelled) return
        if (!data?.article) {
          setStatus('error')
          return
        }
        setArticle(data.article)
        setNavigation(data.navigation || [])
        setStatus('ready')

        // Reset scroll to top of the overlay when a new article loads
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [activeSlug])

  // ---------- Close handler ----------

  const handleClose = useCallback(() => {
    // Trigger the fade-out (drops the *Visible classes), then remove the
    // ?article param only once the opacity transition has finished, so the
    // overlay animates out instead of disappearing instantly.
    setIsMounted(false)

    const finish = () => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('article')
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })

      // Restore focus to whatever was focused before we opened
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus()
      }
      previousFocusRef.current = null
    }

    const node = overlayRef.current
    if (!node) {
      finish()
      return
    }

    let done = false
    const complete = () => {
      if (done) return
      done = true
      node.removeEventListener('transitionend', onEnd)
      finish()
    }
    const onEnd = (e) => {
      if (e.target === node && e.propertyName === 'opacity') complete()
    }
    node.addEventListener('transitionend', onEnd)
    // Fallback in case transitionend never fires (e.g. reduced motion).
    // Must exceed the CSS close duration (640ms) so it never chops the
    // animation short — transitionend is the real trigger; this is just a guard.
    setTimeout(complete, 820)
  }, [pathname, router, searchParams])

  // ---------- Navigate to another article ----------

  const navigateTo = useCallback(
    (slug) => {
      if (!slug) return
      const params = new URLSearchParams(searchParams.toString())
      params.set('article', slug)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  // ---------- Prev / next computation ----------

  // Navigation is ordered newest-first. "Previous" article = the next one in
  // the chronological-reverse direction (i.e. older). "Next" = newer.
  // From a reader's perspective: previous = older article you haven't read,
  // next = newer article. Tweak this logic later if a different mental model
  // feels better in practice.
  const currentIndex = navigation.findIndex((n) => n.slug === activeSlug)
  const newer = currentIndex > 0 ? navigation[currentIndex - 1] : null
  const older =
    currentIndex >= 0 && currentIndex < navigation.length - 1
      ? navigation[currentIndex + 1]
      : null

  // ---------- Keyboard handling ----------

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      } else if (e.key === 'ArrowLeft' && older) {
        e.preventDefault()
        navigateTo(older.slug)
      } else if (e.key === 'ArrowRight' && newer) {
        e.preventDefault()
        navigateTo(newer.slug)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose, navigateTo, newer, older])

  // ---------- Focus management ----------

  useEffect(() => {
    if (status === 'ready' && closeButtonRef.current) {
      // Move focus to the close button so keyboard users have a clear anchor
      closeButtonRef.current.focus()
    }
  }, [status])

  // ---------- Render ----------

  if (!isOpen) return null

  return (
    <>
      <div
        className={`${styles.backdrop} ${isMounted ? styles.backdropVisible : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={overlayRef}
        className={`${styles.overlay} ${isMounted ? styles.overlayVisible : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={article?.title || 'Article'}
      >
        {/* ====== CLOSE ====== */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Close article"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 10,
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            color: '#245148',
            lineHeight: 0,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ width: '36px', height: '36px', display: 'block' }}
          >
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        {/* ====== SCROLLABLE CONTENT ====== */}
        <div ref={scrollContainerRef} className={styles.scrollContainer}>
          {status === 'loading' && (
            <div className={styles.statusWrapper}>
              <div className={styles.loadingDot} aria-label="Loading article" />
            </div>
          )}

          {status === 'error' && (
            <div className={styles.statusWrapper}>
              <p className={styles.errorText}>
                Article could not be loaded. It may have been removed or the link is broken.
              </p>
            </div>
          )}

          {status === 'ready' && article && (
            <>
              <InsightArticle article={article} />

              {/* Footer prev/next cards */}
              {(older || newer) && (
                <nav className={styles.footerNav} aria-label="Article navigation">
                  <div className={styles.footerNavInner}>
                    <button
                      type="button"
                      className={styles.footerNavCard}
                      onClick={() => navigateTo(older?.slug)}
                      disabled={!older}
                    >
                      <span className={styles.footerNavLabel}>
                        <span aria-hidden="true">←</span> Previous
                      </span>
                      <h3 className={styles.footerNavTitle}>
                        {older?.title || 'No older article'}
                      </h3>
                    </button>

                    <button
                      type="button"
                      className={`${styles.footerNavCard} ${styles.footerNavCardNext}`}
                      onClick={() => navigateTo(newer?.slug)}
                      disabled={!newer}
                    >
                      <span className={styles.footerNavLabel}>
                        Next <span aria-hidden="true">→</span>
                      </span>
                      <h3 className={styles.footerNavTitle}>
                        {newer?.title || 'No newer article'}
                      </h3>
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}