// components/LegalOverlay.js
// Slide-up overlay for the static legal documents. Opens when ?legal=<slug>
// is present in the URL (privacy-policy | cookie-policy | terms-of-use).
//
// Mirrors InsightOverlay's open/close mechanics exactly — reflow-then-reveal,
// body scroll lock, ESC + click-outside to close, animated fade-out on close,
// focus management — but with no data fetch and no prev/next navigation, since
// the content is local and static.
//
// Reuses InsightOverlay.module.css for the shell so the animation stays in
// sync with the article overlay. Its own text styling lives in
// LegalContent.module.css.

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import LegalContent, { LEGAL_SLUGS, LEGAL_TITLES } from './LegalContent'
import styles from './InsightOverlay.module.css'

export default function LegalOverlay() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawSlug = searchParams.get('legal')
  const activeSlug = LEGAL_SLUGS.includes(rawSlug) ? rawSlug : null

  const [isMounted, setIsMounted] = useState(false)

  const overlayRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  const isOpen = !!activeSlug

  // Remember what was focused before opening, to restore on close
  useEffect(() => {
    if (isOpen && !previousFocusRef.current) {
      previousFocusRef.current = document.activeElement
    }
  }, [isOpen])

  // Reflow-then-reveal: commit the hidden starting state before flipping to the
  // visible class so the transition fires but the open feels instant.
  useEffect(() => {
    if (!isOpen) {
      setIsMounted(false)
      return
    }
    if (overlayRef.current) void overlayRef.current.offsetHeight
    setIsMounted(true)

    // Start at the top of the document each time one opens
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [isOpen, activeSlug])

  // Body scroll lock (with scrollbar-width compensation so the page doesn't jump)
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

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

  // Close — fade out first, then drop the ?legal param once the opacity
  // transition finishes, so the overlay animates out instead of vanishing.
  const handleClose = useCallback(() => {
    setIsMounted(false)

    const finish = () => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('legal')
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })

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
    // Guard in case transitionend never fires — must exceed the CSS close
    // duration (640ms) so it never chops the animation short.
    setTimeout(complete, 820)
  }, [pathname, router, searchParams])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Move focus to the close button on open
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen, activeSlug])

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
        aria-label={LEGAL_TITLES[activeSlug] || 'Legal document'}
      >
        {/* ====== CLOSE ====== */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Close"
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
            strokeWidth="0.75"
            style={{ width: '36px', height: '36px', display: 'block' }}
          >
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        {/* ====== SCROLLABLE CONTENT ====== */}
        <div ref={scrollContainerRef} className={styles.scrollContainer}>
          <LegalContent slug={activeSlug} />
        </div>
      </div>
    </>
  )
}
