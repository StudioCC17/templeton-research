// components/ServiceDetailPanel.js
// Corner-anchored slide-up panel for a service. Pinned bottom-right, 67vh tall.
// Renders the service's title + its text cards. Shares the house open/close/slide
// logic (see AboutModal). Backdrop is wired in but invisible — flip BACKDROP_COLOR.

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PortableText } from '@portabletext/react'
import Arrow from '@/components/Arrow'

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
          fontSize: 'var(--step-2)',
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
          fontSize: 'var(--step-2)',
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
          fontSize: 'var(--step-1)',
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

export default function ServiceDetailPanel({ isOpen, onClose, item, number, nextNumber, nextTitle, onNext }) {
  const [isRendered, setIsRendered] = useState(false)
  const contentRef = useRef(null)
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

  // Collapse all cards and scroll back to the top each time a different service is opened.
  // If the panel is already showing (i.e. switching via "Next"), fade the new content up.
  const isVisibleRef = useRef(false)
  useEffect(() => { isVisibleRef.current = isVisible }, [isVisible])
  const innerRef = useRef(null)
  const nextRef = useRef(null)
  useEffect(() => {
    setExpanded({})
    if (contentRef.current) contentRef.current.scrollTop = 0
    if (!isVisibleRef.current || !innerRef.current) return
    let cancelled = false
    ;(async () => {
      const gsap = window.gsap || (await import('gsap')).default
      if (cancelled || !innerRef.current) return
      gsap.fromTo(
        [innerRef.current, nextRef.current].filter(Boolean),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.05, overwrite: true }
      )
    })()
    return () => { cancelled = true }
  }, [item])

  // Opens the contact modal with this service pre-filled (listened for in Navigation).
  const enquire = () =>
    window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { service: item?.title } }))

  // GSAP open/close for the toggles: animates to the content's real height
  // (height: 'auto') so it's smooth whatever the length, unlike a max-height hack.
  const bodyRefs = useRef({})
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const gsap = window.gsap || (await import('gsap')).default
      if (cancelled) return
      Object.entries(bodyRefs.current).forEach(([k, el]) => {
        if (!el) return
        const open = !!expanded[k]
        gsap.to(el, {
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
          duration: open ? 0.6 : 0.45,
          ease: open ? 'power3.out' : 'power3.inOut',
          overwrite: true,
        })
      })
    }
    run()
    return () => { cancelled = true }
  }, [expanded])

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
          ref={contentRef}
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
          <div ref={innerRef} className="sd-inner">
          {/* Title now shown on the left, above the prose (see ServicesSection).
             Kept on the dialog's aria-label above for accessibility. */}

          {/* Service label + numbered title - mirrors the "Next" block at the bottom */}
          {title && (
            <div style={{ marginBottom: '1.75rem' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: 'var(--text-preheader-size)',
                  fontWeight: 'var(--text-preheader-weight)',
                  letterSpacing: '0.03em',
                  color: 'var(--color-red)',
                  marginBottom: '0.25rem',
                }}
              >
                Service
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: 'var(--step-1)',
                  color: 'var(--color-cream)',
                }}
              >
                {number ? `${number}. ` : ''}{title}
              </span>
            </div>
          )}

          {/* Preheader for the toggle list */}
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-body), var(--font-fallback)',
              fontSize: 'var(--text-preheader-size)',
              fontWeight: 'var(--text-preheader-weight)',
              lineHeight: '1.4',
              letterSpacing: '0.03em',
              color: 'var(--color-red)',
              marginBottom: '6px',
            }}
          >
            What we do
          </span>

          {cards.map((card, i) => {
            const key = card._key || i
            const isExpanded = !!expanded[key]
            // While one toggle is open, the others fade back (hover brings them up)
            const isDimmed = Object.keys(expanded).length > 0 && !isExpanded
            return (
              <div key={key}>
                {/* Sub-header toggle */}
                <div
                  className="sd-toggle-header"
                  onClick={() => toggleCard(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0',
                    opacity: isDimmed ? 0.4 : 1,
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  {/* Thin plus that morphs into a minus when open (vertical stroke rotates flat) */}
                  <span
                    aria-hidden="true"
                    style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isExpanded ? 'var(--color-red)' : 'var(--color-cream)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
                      <line x1="1" y1="6" x2="11" y2="6" />
                      <line
                        x1="6" y1="1" x2="6" y2="11"
                        style={{
                          transformOrigin: '6px 6px',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </svg>
                  </span>
                  {card.title && (
                    <h3
                      style={{
                        color: isExpanded ? 'var(--color-red)' : 'var(--color-cream)',
                        fontWeight: 400,
                        fontFamily: 'var(--font-body), var(--font-fallback)',
                        fontSize: 'var(--step-1)', // matches the service titles ("01. ...", "Next")
                        lineHeight: 1.55,
                        margin: '0px',
                        borderBottom: isExpanded ? '0px solid' : '0.5px solid transparent',
                      }}
                    >
                      {card.title}
                    </h3>
                  )}
                </div>

                {/* Collapsible supporting text - height/opacity animated by GSAP (see effect above) */}
                <div
                  ref={(el) => {
                    if (el) bodyRefs.current[key] = el
                    else delete bodyRefs.current[key]
                  }}
                  style={{
                    height: 0,
                    opacity: 0,
                    paddingRight: '15%',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '0.5rem 0 0.75rem 1.125rem', fontStyle: 'italic' /* Minion italic */ }}>
                    {card.body && <PortableText value={card.body} components={bodyComponents} />}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Enquire - sits straight under the list */}
          <button
            type="button"
            className="sd-enquire"
            onClick={enquire}
            style={{
              marginTop: '2rem',
              backgroundColor: 'var(--color-red)',
              color: 'var(--color-cream)',
              border: 'none',
              borderRadius: '2px',
              padding: '0.35rem 1rem 0.4em',
              fontFamily: 'var(--font-body), var(--font-fallback)',
              fontSize: 'var(--step-0)',
              fontWeight: 400,
              textTransform: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Enquire
            <Arrow />
          </button>
          </div>
        </div>

        {/* Next service - keeps people moving through the services without closing the panel */}
        {nextTitle && (
          <div ref={nextRef} className="sd-next-wrap" style={{ padding: '0 2rem 2rem' }}>
            <button type="button" className="sd-next" onClick={onNext}>
              <span className="sd-next-label">Next</span>
              <span>
                {nextNumber}. {nextTitle}
                <span aria-hidden="true" className="sd-next-arrow"><Arrow direction="right" /></span>
              </span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .sd-toggle-header:hover {
          opacity: 1 !important;
        }
        .sd-enquire:hover {
          background-color: #A66850 !important;
        }
        .sd-next {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          width: 100%;
          background: none;
          border: none;
          border-top: 1px solid rgba(245, 245, 240, 0.25);
          padding: 1.25rem 0 0;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-body), var(--font-fallback);
          font-size: var(--step-1);
          color: var(--color-cream);
        }
        .sd-next-label {
          font-size: var(--text-preheader-size);
          font-weight: var(--text-preheader-weight);
          letter-spacing: 0.03em;
          color: var(--color-red);
        }
        .sd-next-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }
        .sd-next:hover .sd-next-arrow {
          transform: translateX(4px);
        }
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