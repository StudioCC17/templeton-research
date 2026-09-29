// components/ServicesSection.js
// 50/50 split — sticky header left, service list right (Noord-style).
// Click a service → left crossfades to that service's prose + ServiceDetailPanel
// slides up (fills the right half) with that service's text cards.

'use client'

import { useState, useRef, useEffect } from 'react'
import { PortableText } from '@portabletext/react'
import ServiceDetailPanel from '@/components/ServiceDetailPanel'

// Placeholder supporting line — swap for a real Sanity field (e.g. `summary`) later.
const SERVICE_FILL =
  'Rigorous, discreet analysis that turns complex information into clear, decision-ready intelligence.'

// Per-service supporting lines, keyed by title. Used until a Sanity `summary`
// field exists; falls back to SERVICE_FILL for any unmatched title.
const SERVICE_SUMMARIES = {
  'Investment intelligence & strategic advisory':
    'Independent intelligence and counsel for investors navigating high-stakes, uncertain markets.',
  'Financial crime & integrity risk':
    'Thorough checks that protect your reputation, capital and compliance standing.',
  'Complex investigations & disputes support':
    'Rigorous investigation when misconduct, litigation or recovery is on the line.',
}

const PROSE_COMPONENTS = {
  block: {
    normal: ({ children }) => (
      <p className="hero-text" style={{
        color: 'var(--color-cream)',
        lineHeight: '1.265',
        marginBottom: '1rem',
        marginTop: '0px',
      }}>
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="hero-text" style={{
        color: 'var(--color-cream)',
        lineHeight: '1.265',
        marginBottom: '1rem',
        marginTop: '0px',
      }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{
        fontFamily: 'var(--font-body), var(--font-fallback)',
        fontSize: 'var(--text-preheader-size)',
        fontWeight: 600,
        color: 'var(--color-red)',
        marginBottom: 0,
        marginTop: '1.5rem',
        lineHeight: 1,
      }}>
        {children}
      </h4>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ marginLeft: '1.25rem', marginBottom: '1.25rem' }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ marginLeft: '1.25rem', marginBottom: '1.25rem' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li style={{
        fontFamily: 'var(--font-body), var(--font-fallback)',
        fontSize: '1.05rem',
        color: 'var(--color-cream)',
        marginBottom: '0.6rem',
        lineHeight: 1.55,
      }}>
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li style={{
        fontFamily: 'var(--font-body), var(--font-fallback)',
        fontSize: '1.05rem',
        color: 'var(--color-cream)',
        marginBottom: '0.6rem',
        lineHeight: 1.55,
      }}>
        {children}
      </li>
    ),
  },
  types: {
    expandableItem: () => null,
    textCard: () => null,
  },
}

export default function ServicesSection({ servicesData }) {
  const [detailItem, setDetailItem] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null) // drives the left crossfade
  const [mounted, setMounted] = useState(false)
  const headlineRef = useRef(null)
  const proseRef = useRef(null)

  const openDetail = (service, index) => {
    const cards = (service.description || []).filter((b) => b._type === 'textCard')
    setDetailItem({ title: service.title, cards })
    setActiveIndex(index)
    setIsDetailOpen(true)
  }
  // Leave activeIndex set so the left prose stays in place while it fades back out.
  const closeDetail = () => setIsDetailOpen(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll-triggered SplitText animation on headline
  useEffect(() => {
    if (!headlineRef.current) return
    let ctx = null
    let splitInstance = null

    const initAnimation = async () => {
      try {
        // Use CDN globals if available (production), fall back to npm imports (local dev)
        const gsap = window.gsap || (await import('gsap')).default
        const SplitText = window.SplitText || (await import('gsap/SplitText')).SplitText
        const ScrollTrigger = window.ScrollTrigger || (await import('gsap/ScrollTrigger')).ScrollTrigger
        gsap.registerPlugin(SplitText, ScrollTrigger)

        splitInstance = new SplitText(headlineRef.current, {
          type: 'chars',
          charsClass: 'services-split-char',
          tag: 'span'
        })

        // Make parent visible, chars start at 0.2
        gsap.set(headlineRef.current, { opacity: 1 })
        gsap.set(splitInstance.chars, { display: 'inline', opacity: 0.2 })

        ctx = gsap.context(() => {
          gsap.to(splitInstance.chars, {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            stagger: 0.01,
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 80%',
              once: true,
            }
          })
        })
      } catch (e) {
        if (headlineRef.current) { headlineRef.current.style.opacity = '1' }
      }
    }

    initAnimation()
    return () => {
      if (ctx) ctx.revert()
      if (splitInstance) splitInstance.revert()
    }
  }, [])

  // Letter-by-letter fade on the left prose each time a service is selected.
  // Mirrors the headline SplitText, but triggered by selection (no ScrollTrigger)
  // and re-run whenever activeIndex changes. The keyed wrapper (see JSX) remounts
  // the prose on each switch so SplitText's injected spans never fight React.
  useEffect(() => {
    if (!isDetailOpen || activeIndex === null || !proseRef.current) return
    let ctx = null
    let splitInstance = null
    let cancelled = false

    const initAnimation = async () => {
      try {
        const gsap = window.gsap || (await import('gsap')).default
        const SplitText = window.SplitText || (await import('gsap/SplitText')).SplitText
        gsap.registerPlugin(SplitText)
        if (cancelled || !proseRef.current) return

        // Split the actual text elements (mirrors how the headline splits its
        // <h3> directly). Splitting the wrapper <div> instead makes SplitText
        // build per-line structure that inflates the line box.
        const targets = proseRef.current.querySelectorAll('p, h2, h3, h4, li')
        splitInstance = new SplitText(targets.length ? targets : proseRef.current, {
          type: 'chars',
          charsClass: 'services-split-char',
          tag: 'span',
        })

        // Reveal the wrapper (it starts at opacity 0 to avoid a flash of
        // full-opacity text) and dim the chars before staggering them in.
        gsap.set(proseRef.current, { opacity: 1 })
        gsap.set(splitInstance.chars, { display: 'inline', opacity: 0.2 })

        ctx = gsap.context(() => {
          gsap.to(splitInstance.chars, {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            stagger: 0.01,
          })
        })
      } catch (e) {
        if (proseRef.current) proseRef.current.style.opacity = '1'
      }
    }

    initAnimation()
    return () => {
      cancelled = true
      if (ctx) ctx.revert()
      if (splitInstance) splitInstance.revert()
    }
  }, [activeIndex, isDetailOpen])

  if (!servicesData?.services || servicesData.services.length === 0) return null

  return (
    <section
      id="services"
      className="services-section"
      style={{
        backgroundColor: isDetailOpen ? 'var(--color-green)' : 'var(--color-cream)',
        padding: '1rem 1.5%',
        paddingBottom: '1rem',
        minHeight: '80vh',
        position: 'relative',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease, background-color 0.4s ease',
      }}
    >
      <div className={`services-container${isDetailOpen ? ' services-has-expanded' : ''}`} style={{ margin: '0 auto' }}>
        <div className="services-split">

          {/* ── Left: sticky section header with crossfade ── */}
          <div className="services-split-left">
            <div className="services-split-left-inner">
              <div className="services-left-crossfade">

                {/* Default headline */}
                <div style={{
                  opacity: isDetailOpen ? 0 : 1,
                  transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  pointerEvents: isDetailOpen ? 'none' : 'auto',
                }}>
                  <h3 ref={headlineRef} className="hero-text" style={{ color: 'var(--color-green)', lineHeight: '1.265', opacity: 0 }}>
                    {servicesData.headline || 'Tailored investigative and research services that provide clarity and confidence for high-stakes decisions.'}
                  </h3>
                  {servicesData.introduction && (
                    <p style={{
                      marginTop: '1.5rem',
                      fontFamily: 'var(--font-body), var(--font-fallback)',
                      fontSize: '1.05rem',
                      lineHeight: 1.6,
                      color: 'var(--color-green)',
                    }}>
                      {servicesData.introduction}
                    </p>
                  )}
                </div>

                {/* Active service prose */}
                <div style={{
                  opacity: isDetailOpen ? 1 : 0,
                  transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  pointerEvents: isDetailOpen ? 'auto' : 'none',
                }}>
                  {(() => {
                    if (activeIndex === null) return null
                    const activeService = servicesData.services[activeIndex]
                    const prose = activeService?.description?.filter(b => b._type !== 'expandableItem' && b._type !== 'textCard') || []
                    return (
                      <div key={activeIndex} ref={proseRef} style={{ opacity: 0 }}>

                        
                        {prose.length > 0 && activeService?.title && (

                          
                          <span
                            style={{
                              display: 'block',
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: 'var(--text-preheader-size)',
                              fontWeight: 'var(--text-preheader-weight)',
                              lineHeight: '1.4',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              color: 'var(--color-red)',
                              marginBottom: '1rem',
                              textTransform: 'none',
                              marginBottom: '6px',
                              letterSpacing: '0.03em',
                              display: 'inline-block'
                            }}
                          >
                            {activeService.title}
                          </span>
                        )}
                        {prose.length > 0 ? (
                          <PortableText value={prose} components={PROSE_COMPONENTS} />
                        ) : (
                          <h2 className="hero-text" style={{ color: 'var(--color-cream)', lineHeight: '1.265' }}>
                            {activeService?.title}
                          </h2>
                        )}
                      </div>
                    )
                  })()}
                </div>

              </div>{/* end services-left-crossfade */}

              <p
                className="services-split-footnote"
                onClick={() => window.dispatchEvent(new Event('open-contact-modal'))}
                style={{
                  opacity: isDetailOpen ? 0 : 1,
                  transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Have a question?  Get in touch <svg 
                  style={{
                    position: 'absolute',
                    marginTop: '2px',
                    marginLeft: '1px'
                  }}
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg></p>

            </div>
          </div>

          {/* ── Right: service list ── */}
          <div className="services-split-right">
            <div className="services-list">
              {servicesData.services.map((service, index) => {
                const number = String(index + 1).padStart(2, '0')
                return (
                  <div
                    key={service._key || index}
                    className="service-item"
                    style={{ borderTop: index === 0 ? 'none' : '1px solid rgb(224 224 224)' }}
                  >
                    <div
                      onClick={() => openDetail(service, index)}
                      className="service-header"
                      style={{
                        padding: '1.5rem 0',
                        cursor: 'pointer',
                        opacity: isDetailOpen && activeIndex !== index ? 0.3 : 1,
                        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                        <span
                          className="service-number"
                          style={{
                            fontFamily: 'var(--font-body), var(--font-fallback)',
                            fontSize: '1.3rem',
                            fontWeight: 400,
                            lineHeight: 1.4,
                            color: 'var(--color-red)',
                            margin: 0,
                            flexShrink: 0,
                          }}
                        >
                          {number}.
                        </span>
                        <div style={{ flex: 1 }}>
                          <h3
                            className="service-title"
                            style={{
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: '1.3rem',
                              fontWeight: 400,
                              lineHeight: 1.4,
                              color: 'var(--color-red)',
                              margin: 0,
                              borderBottom: '0px solid',
                              width: 'fit-content',
                            }}
                          >
                            {service.title}
                          </h3>
                          <p
                            className="service-summary"
                            style={{
                              marginTop: '0.25rem',
                              paddingRight: '25%',
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: '0.956rem',
                              fontWeight: 400,
                              lineHeight: 1.4,
                              color: '#24514882',
                            }}
                          >
                            {service.summary || SERVICE_SUMMARIES[service.title] || SERVICE_FILL}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Service detail panel (corner slide-up, fills right half) ── */}
      <ServiceDetailPanel
        isOpen={isDetailOpen}
        onClose={closeDetail}
        item={detailItem}
      />

      <style jsx global>{`

        .services-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3%;
          align-items: start;
          min-height: calc(80vh - 2rem);
          position: relative;
        }

        .services-split::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background-color: rgb(224, 224, 224);
          transform: translateX(-50%);
        }

        .services-left-crossfade {
          position: relative;
          min-height: 40vh;
        }

        .services-split-left {
          position: relative;
        }

        .services-split-left-inner {
          padding-right: 12%;
          padding-top: 0.5rem;
          padding-bottom: 0rem;
          display: flex;
          flex-direction: column;
          min-height: calc(80vh - 3rem);
        }

        .services-split-footnote {
          font-family: var(--font-body), var(--font-fallback);

          font-weight: 600;
          color: var(--color-red);
          margin-bottom: 0;
          margin-top: auto;
          line-height: 1.4;
          max-width: 50%;
        }

        .services-split-right {
          padding-top: 0rem;
          padding-bottom: 5rem;
          transition: opacity 0.4s ease;
        }

        .services-has-expanded .services-split-right {
          opacity: 0;
          pointer-events: none;
        }

        .service-item:last-child {
          border-bottom: 1px solid rgb(224 224 224);
        }

        :global(.services-split-char) {
          display: inline !important;
          line-height: inherit !important;
          vertical-align: baseline !important;
        }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .services-split { gap: 4%; }
          .services-split-left-inner { padding-right: 4%; }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .services-section {
            padding: 1.5rem 5% !important;
            min-height: 0 !important;
          }

          .services-split {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            min-height: 0;
          }

          .services-split::after {
            display: none;
          }

          .services-left-crossfade {
            position: relative;
            min-height: 180px;
          }

          .services-split-left {
            position: static;
          }

          .services-split-left-inner {
            padding-right: 0;
            padding-bottom: 2rem;
            min-height: 0;
          }

          .services-split-footnote {
            display: none;
          }

          .services-split-right {
            padding-bottom: 1rem;
            padding-top: 0;
          }

          /* On mobile, drop absolute positioning so crossfade layers don't overlap;
             show only the relevant one. */
          .services-left-crossfade > div {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
          }

          .services-left-crossfade > div:first-child {
            display: block;
          }

          .services-left-crossfade > div:last-child {
            display: none;
          }

          .services-has-expanded .services-left-crossfade > div:first-child {
            display: none;
          }

          .services-has-expanded .services-left-crossfade > div:last-child {
            display: block;
          }

          .services-has-expanded .services-left-crossfade h2,
          .services-has-expanded .services-left-crossfade h3,
          .services-has-expanded .services-left-crossfade p {
            font-size: 1.625rem !important;
            line-height: 1.2 !important;
          }

          .service-header h3,
          .service-header .service-number,
          .service-header .service-summary { font-size: 1.15rem !important; }
        }

        /* ── Wide ── */
        @media (min-width: 1800px) {
          .service-item h3.service-title { font-size: 1.4rem !important; }
        }
      `}</style>
    </section>
  )
}