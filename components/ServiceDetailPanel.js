// components/ServiceDetailPanel.js
// Corner-anchored slide-up panel for a service. Pinned bottom-right, 67vh tall.
// Renders the service's title + its text cards. Shares the house open/close/slide
// logic (see AboutModal). Backdrop is wired in but invisible — flip BACKDROP_COLOR.

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PortableText } from '@portabletext/react'

// ── Backdrop toggle ──────────────────────────────────────────────
// Set to '#245148a3' to activate the dim later. 'transparent' = no backdrop.
// (The backdrop layer is always rendered so click-outside + scroll-lock work;
//  only its colour changes.)
const BACKDROP_COLOR = 'transparent'
// Corner gap from the viewport edges.
const CORNER_GAP = '0rem'

const bodyComponents = {
  block: {
    normal: ({ children }) => (
      <p
        style={{
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-heading), var(--font-fallback)',
          fontSize: '1.4rem',
          fontWeight: 400,
          lineHeight: 1.55,
          marginBottom: '1.1rem',
        }}
      >
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-heading), serif',
          fontSize: '1.4rem',
          fontWeight: 400,
          lineHeight: 1.25,
          margin: '0 0 0.75rem',
        }}
      >
        {children}
      </h3>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ margin: '0 0 1.1rem 1.25rem', listStyleType: 'disc' }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ margin: '0 0 1.1rem 1.25rem' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li
        style={{
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-body), var(--font-fallback)',
          fontSize: '1.2rem',
          lineHeight: 1.55,
          marginBottom: '0.4rem',
        }}
      >
        {children}
      </li>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || ''
      const newTab = value?.blank
      return (
        <a
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
          className="text-link"
          style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit' }}
        >
          {children}
        </a>
      )
    },
  },
}

export default function ServiceDetailPanel({ isOpen, onClose, item }) {
  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [expanded, setExpanded] = useState({})
  const closeTimer = useRef(null)

  // Open: mount + lock scroll. (Visibility flip happens below once mounted.)
  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      setIsRendered(true)
    } else if (isRendered) {
      setIsVisible(false)
      closeTimer.current = setTimeout(() => {
        setIsRendered(false)
      }, 750)
    }
  }, [isOpen, isRendered])

  // After mount, flip to visible on a later frame (double rAF) so the browser
  // paints the start position first and the slide-up actually runs.
  useEffect(() => {
    if (!isRendered || !isOpen) return
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsVisible(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [isRendered, isOpen])

  const handleClose = useCallback(() => onClose?.(), [onClose])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  // Collapse all cards each time a different service is opened.
  useEffect(() => {
    setExpanded({})
  }, [item])

  const toggleCard = (key) =>
  setExpanded((prev) => (prev[key] ? {} : { [key]: true }))

  if (!isRendered) return null

  const title = item?.title
  const cards = item?.cards || []

  return (
    <div
      className="service-detail-overlay"
      onClick={handleClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: CORNER_GAP,
        backgroundColor: isVisible ? BACKDROP_COLOR : 'transparent',
        transition: 'background-color 0.4s ease',
      }}
    >
      <div
        className="service-detail-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Service detail'}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '50%',
          height: '100%',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 2,
            padding: 0,
            color: 'var(--color-cream)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div
          className="service-detail-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem 2rem 2rem',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            transition:
              'opacity 0.5s ease 0.12s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.12s',
          }}
        >
          {/* Title now shown on the left, above the prose (see ServicesSection).
             Kept on the dialog's aria-label above for accessibility. */}

          {cards.map((card, i) => {
            const key = card._key || i
            const isExpanded = !!expanded[key]
            return (
              <div key={key}>
                {/* Sub-header toggle */}
                <div
                  className="sd-toggle-header"
                  onClick={() => toggleCard(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.35rem 0',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '0.625rem',
                      height: '0.625rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" style={{ fill: 'var(--color-cream)' }}>
                      <polygon points="0,0 8,5 0,10" />
                    </svg>
                  </span>
                  {card.title && (
                    <h3
                      style={{
                        color: isExpanded ? 'var(--color-red)' : 'var(--color-cream)',
                        fontWeight: 400,
                        lineHeight: 1.55,
                        margin: '0px',
                        borderBottom: isExpanded ? '0px solid' : '0.5px solid transparent',
                      }}
                    >
                      {card.title}
                    </h3>
                  )}
                </div>

                {/* Collapsible supporting text */}
                <div
                  style={{
                    maxHeight: isExpanded ? '1500px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    paddingRight: '15%',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                  }}
                >
                  <div style={{ padding: '0.5rem 0 0.75rem 1.125rem' }}>
                    {card.body && <PortableText value={card.body} components={bodyComponents} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .service-detail-content::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        @media (max-width: 1024px) {
          .service-detail-panel {
            width: 60% !important;
            background-color: var(--color-green) !important;
          }
        }
        @media (max-width: 768px) {
          .service-detail-panel {
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}