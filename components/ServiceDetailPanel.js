// components/ServiceDetailPanel.js
// Corner-anchored slide-up panel for a service. Pinned bottom-right, 67vh tall.
// Renders the service's title + its text cards. Shares the house open/close/slide
// logic (see AboutModal). Backdrop is wired in but invisible — flip BACKDROP_COLOR.

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PortableText } from '@portabletext/react'
import Arrow from '@/components/Arrow'

// ── Backdrop toggle ──────────────────────────────────────────────
// Set to 'var(--color-overlay)' to activate the dim later. 'transparent' = no backdrop.
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
          // Answers in the body font (was Minion) - to switch back, use
          // fontFamily 'var(--font-heading)' and fontSize 'var(--text-service-title-size)'
          color: 'rgba(245, 245, 240, 0.85)', // softened cream
          fontFamily: 'var(--font-body), var(--font-fallback)',
          fontSize: 'var(--step-0)',
          fontWeight: 400,
          lineHeight: 1.425,
          marginBottom: '1rem',
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
          color: 'rgba(245, 245, 240, 0.85)',
          fontFamily: 'var(--font-body), var(--font-fallback)',
          fontSize: 'var(--step-0)', // matches the answer paragraphs
          lineHeight: 1.472,
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

export default function ServiceDetailPanel({ isOpen, onClose, item, number, total, nextNumber, nextTitle, onNext }) {
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
            strokeWidth="1"
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

          {/* Mirrors the "Next" block at the bottom: red "Service  01" label,
              cream title underneath, same sizes and spacing */}
          {title && (
            <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: 'var(--text-preheader-size)',
                  fontWeight: 'var(--text-preheader-weight)',
                  letterSpacing: 'var(--tracking-bold)',
                  color: 'var(--color-red)',
                }}
              >
                {number}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: 'var(--text-service-heading-size)', // same size as in the services list
                  fontWeight: 600, // bold once the service is open
                  letterSpacing: 'var(--tracking-bold)', // a touch tighter for the bold weight
                  color: 'var(--color-cream)',
                }}
              >
                {title}
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
              letterSpacing: 'var(--tracking-bold)',
              color: 'var(--color-red)',
              marginBottom: '6px',
            }}
          >
            What we do
          </span>

          <div className="sd-toggle-list">
          {cards.map((card, i) => {
            const key = card._key || i
            const isExpanded = !!expanded[key]
            // While one toggle is open, the others fade back (hover brings them up)
            const isDimmed = Object.keys(expanded).length > 0 && !isExpanded
            return (
              <div key={key} className="sd-card">
                {/* Sub-header toggle */}
                <div
                  className="sd-toggle-header"
                  onClick={() => toggleCard(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    fontSize: 'var(--step-0)',
                    padding: '0.25rem 0',
                    opacity: isDimmed ? 0.55 : 1, // closed items stay readable on the green
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  {/* Thin plus that morphs into a minus when open (vertical stroke rotates flat) */}
                  <span
                    aria-hidden="true"
                    style={{
                      width: '0.55em', // scales with the toggle text
                      height: '0.55em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isExpanded ? 'var(--color-red)' : 'var(--color-cream)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ overflow: 'visible' }}>
                      <line x1="1" y1="6" x2="11" y2="6" vectorEffect="non-scaling-stroke" />
                      <line
                        x1="6" y1="1" x2="6" y2="11"
                        vectorEffect="non-scaling-stroke"
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
                        fontSize: 'var(--step-0)', // a step below the service title for clearer contrast
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
                  {/* maxWidth keeps the answer to a comfortable ~65 characters a line */}
                  <div style={{ padding: '0.5rem 0 0.75rem 1.125rem', maxWidth: '34em' }}>
                    {card.body && <PortableText value={card.body} components={bodyComponents} />}
                  </div>
                </div>
              </div>
            )
          })}

          </div>

          {/* Enquire - sits straight under the list */}
          <button
            type="button"
            className="btn-primary" /* shared button style (globals.css) */
            onClick={enquire}
            style={{ marginTop: '2rem' }}
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
              <span className="sd-next-label">
                Next
                {nextNumber && <span style={{ marginLeft: '0.75em' }}>{nextNumber}</span>}
              </span>
              <span className="u-link">
                {/* Last word + arrow kept together so the arrow never drops onto a line on its own */}
                {(() => {
                  const words = String(nextTitle).split(' ')
                  const last = words.pop()
                  return (
                    <>
                      {words.length ? words.join(' ') + ' ' : ''}
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {last}
                        <span aria-hidden="true" className="sd-next-arrow"><Arrow direction="right" /></span>
                      </span>
                    </>
                  )
                })()}
              </span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Hovering the list: the other items fade back (like the services list);
           the one you're on - and its open text - stays at full strength */
        .sd-toggle-list:hover .sd-card:not(:hover) .sd-toggle-header {
          opacity: 0.45 !important;
        }
        .sd-toggle-list .sd-card:hover .sd-toggle-header {
          opacity: 1 !important;
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
          letter-spacing: var(--tracking-bold);
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
        /* Phones: the panel sits in the page flow under the service's own text
           (instead of covering it), and lines up with the section's margins */
        @media (max-width: 768px) {
          .service-detail-overlay {
            position: relative !important;
            inset: auto !important;
            padding: 0 !important;
            background-color: transparent !important;
          }
          .service-detail-panel {
            width: 100% !important;
            height: auto !important;
          }
          .service-detail-content {
            overflow: visible !important;
            padding: 1.5rem 0 1.5rem !important;
          }
          .sd-next-wrap {
            padding: 0 0 1.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}