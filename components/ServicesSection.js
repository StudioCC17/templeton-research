// components/ServicesSection.js
// 50/50 split — sticky header left, service list right (Noord-style).
// Click a service → left crossfades to that service's prose + ServiceDetailPanel
// slides up (fills the right half) with that service's text cards.

'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { PortableText } from '@portabletext/react'
import ServiceDetailPanel from '@/components/ServiceDetailPanel'
import Arrow from '@/components/Arrow'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

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
        fontSize: 'var(--step-0)',
        color: 'var(--color-cream)',
        marginBottom: '0.6rem',
        lineHeight: 1.472,
      }}>
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li style={{
        fontFamily: 'var(--font-body), var(--font-fallback)',
        fontSize: 'var(--step-0)',
        color: 'var(--color-cream)',
        marginBottom: '0.6rem',
        lineHeight: 1.472,
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

  const sectionRef = useRef(null)

  // Opening a service: glide the section up so its top sits right under the
  // sticky header (the header turns green to match while a service is open).
  const scrollSectionToTop = () => {
    const section = sectionRef.current
    if (!section) return
    const header = document.querySelector('nav.navigation--scrolled')
    const headerH = header ? header.offsetHeight : 0
    const target = Math.round(section.getBoundingClientRect().top + window.scrollY - headerH)
    if (Math.abs(window.scrollY - target) < 2) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Same 0.7s / power3.inOut as the section + header colour change, so they move together
    gsap.to(window, { scrollTo: { y: target, autoKill: true }, duration: reduce ? 0 : 0.7, ease: 'power3.inOut' })
  }

  // Let the header know a service is open (it switches to green with cream text)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('services-detail', { detail: { open: isDetailOpen } }))
  }, [isDetailOpen])
  useEffect(() => () => window.dispatchEvent(new CustomEvent('services-detail', { detail: { open: false } })), [])

  // ── Hover: the row under the cursor opens up a little, the arrow slides in
  // and the other rows fade back. Done purely with GPU transforms (no layout
  // changes), so it stays perfectly smooth: the hovered row's text eases down a
  // touch and every row below it eases down twice that, opening space above and
  // below. The active row only changes when the cursor enters another row.
  const listRef = useRef(null)
  const hoverIndexRef = useRef(null)
  const HOVER_SPACE_REM = 0.6 // extra space above and below the hovered row

  const layoutRows = (hovered) => {
    const items = Array.from(listRef.current?.children || [])
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const e = HOVER_SPACE_REM * rem
    const tween = { duration: 0.9, ease: 'expo.out', overwrite: 'auto', force3D: true }
    items.forEach((item, j) => {
      const content = item.querySelector('.service-header > div')
      const isHovered = hovered === j
      item.classList.toggle('is-hovered', isHovered)
      gsap.to(item, { ...tween, y: hovered !== null && j > hovered ? 2 * e : 0 })
      if (content) gsap.to(content, { ...tween, y: isHovered ? e : 0 })
    })
  }

  const hoverRow = (index) => {
    if (!window.matchMedia('(hover: hover)').matches) return
    if (hoverIndexRef.current === index) return
    hoverIndexRef.current = index
    listRef.current?.classList.add('has-hover')
    layoutRows(index)
  }

  const leaveList = () => {
    if (hoverIndexRef.current === null) return
    hoverIndexRef.current = null
    listRef.current?.classList.remove('has-hover')
    layoutRows(null)
  }

  // ── Scroll-in: the service list builds in row by row as it comes into view.
  // In each row the number fades up, the title rises out of a mask, then the
  // summary follows - one long, soft expo ease. Runs once.
  // (Layout effect so the hidden start state is set before the first paint - no flash.)
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.children)
    const parts = (row) => [
      row.querySelector('.service-count'),
      row.querySelector('.service-title'),
      row.querySelector('.service-summary'),
    ]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      rows.forEach((row) => {
        const [num, title, summary] = parts(row)
        gsap.set([num, summary], { autoAlpha: 0, y: 16 })
        gsap.set(title, { autoAlpha: 0, y: 28, clipPath: 'inset(0% 0% 100% 0%)' })
      })

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'expo.out' },
      })
      rows.forEach((row, i) => {
        const [num, title, summary] = parts(row)
        const at = i * 0.16 // each row a beat after the last
        tl.to(num, { autoAlpha: 1, y: 0, duration: 1.1 }, at)
          .to(title, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% -10% 0%)', duration: 1.5 }, at + 0.08)
          .to(summary, { autoAlpha: 1, y: 0, duration: 1.3 }, at + 0.2)
      })
      tl.eventCallback('onComplete', () => {
        gsap.set(rows.flatMap(parts), { clearProps: 'transform,clipPath,visibility,opacity' })
      })

      ScrollTrigger.create({
        trigger: list,
        start: 'top 82%',
        once: true,
        onEnter: () => tl.play(),
      })
    }, list)

    return () => ctx.revert()
  }, [])

  const openDetail = (service, index) => {
    if (!isDetailOpen) scrollSectionToTop()
    const cards = (service.description || []).filter((b) => b._type === 'textCard')
    setDetailItem({ title: service.title, cards })
    setActiveIndex(index)
    setIsDetailOpen(true)
  }
  // Leave activeIndex set so the left prose stays in place while it fades back out.
  const closeDetail = () => setIsDetailOpen(false)

  // "Next service" link inside the detail panel (wraps round to the first).
  const services = servicesData?.services || []
  const nextIndex = activeIndex === null || services.length < 2 ? null : (activeIndex + 1) % services.length
  const nextService = nextIndex === null ? null : services[nextIndex]
  // Smooth hand-off between services: fade the current left prose and panel
  // content out, swap, then each side animates back in (left via the SplitText
  // letter fade, right via the panel's own fade-up on item change).
  const switchingRef = useRef(false)
  const openNext = async () => {
    if (!nextService || switchingRef.current) return
    switchingRef.current = true
    const done = () => {
      openDetail(nextService, nextIndex)
      switchingRef.current = false
    }
    try {
      const gsap = window.gsap || (await import('gsap')).default
      const targets = [proseRef.current, document.querySelector('.sd-inner'), document.querySelector('.sd-next-wrap')].filter(Boolean)
      if (!targets.length) return done()
      gsap.to(targets, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in', onComplete: done })
    } catch (e) {
      done()
    }
  }

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
      ref={sectionRef}
      id="services"
      className="services-section"
      style={{
        backgroundColor: isDetailOpen ? 'var(--color-green)' : 'var(--color-cream)',
        padding: '1rem 1.5%',
        paddingBottom: '1rem',
        minHeight: '80vh',
        position: 'relative',
        opacity: mounted ? 1 : 0,
        // Opening: colour change runs with the scroll (and header). Closing: the original quick fade.
        transition: isDetailOpen ? 'opacity 0.4s ease, background-color 0.5s cubic-bezier(0.65, 0, 0.35, 1)' : 'opacity 0.4s ease, background-color 0.4s ease',
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
                      fontSize: 'var(--step-0)',
                      lineHeight: 1.52,
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
                <span className="footnote-question">Have a question?</span>{' '}
                Get in touch<Arrow /></p>

            </div>
          </div>

          {/* ── Right: service list ── */}
          <div className="services-split-right">
            <div className="services-list" ref={listRef} onMouseLeave={leaveList}>
              {servicesData.services.map((service, index) => {
                return (
                  <div
                    key={service._key || index}
                    className="service-item"
                    onMouseEnter={() => hoverRow(index)}
                  >
                    <div
                      onClick={() => openDetail(service, index)}
                      className="service-header"
                      style={{
                        cursor: 'pointer',
                        opacity: isDetailOpen && activeIndex !== index ? 0.3 : 1,
                        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          {/* Small "01" preheader above each title */}
                          <span
                            className="service-count"
                            style={{
                              display: 'block',
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: 'var(--text-preheader-size)',
                              fontWeight: 'var(--text-preheader-weight)',
                              letterSpacing: '0.03em',
                              color: 'var(--color-red)',
                              marginBottom: 0, // number sits close to its title
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3
                            className="service-title"
                            style={{
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: 'var(--text-service-heading-size)',
                              fontWeight: 600, // bold, matching the open service panel
                              letterSpacing: '-0.01em', // a touch tighter for the bold weight
                              lineHeight: 1.4,
                              color: 'var(--color-red)',
                              margin: 0,
                              borderBottom: '0px solid',
                              width: 'fit-content',
                            }}
                          >
                            {service.title}<Arrow
                              direction="right"
                              className="service-arrow"
                              style={{ width: 'calc(0.6em * 19 / 16)', height: '0.6em', marginLeft: '0.5em', verticalAlign: '0em', strokeWidth: 1.75 }} // smaller, kept centred on the line
                            />
                          </h3>
                          <p
                            className="service-summary"
                            style={{
                              marginTop: '0.25rem',
                              marginBottom: 0, // global p adds 1rem here, which doubled the space under each service
                              paddingRight: '25%',
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: 'var(--step--1)',
                              fontWeight: 400,
                              lineHeight: 1.4,
                              color: 'var(--color-text-secondary)',
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
        number={activeIndex === null ? null : String(activeIndex + 1).padStart(2, '0')}
        total={String(services.length).padStart(2, '0')}
        nextNumber={nextIndex === null ? null : String(nextIndex + 1).padStart(2, '0')}
        nextTitle={nextService?.title}
        onNext={openNext}
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
          background-color: var(--color-border);
          transform: translateX(-50%);
          transition: background-color 0.4s ease;
        }

        /* On the green panel, match the rule above the "Next" link */
        .services-has-expanded .services-split::after {
          background-color: rgba(245, 245, 240, 0.25);
          transition: background-color 0.5s cubic-bezier(0.65, 0, 0.35, 1);
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
          font-size: var(--step--1); /* small - a quiet secondary prompt */
          font-weight: 600;
          color: var(--color-red);
          margin-bottom: 0;
          margin-top: auto;
          line-height: 1.4;
          max-width: 50%;
        }

        /* "Have a question?" in the softer green; "Get in touch" stays red as the link */
        .footnote-question {
          color: var(--color-text-secondary);
          font-weight: 400;
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

        /* ── Service rows: plain, with subtle dividers between them ── */
        .service-item {
          position: relative;
        }

        .service-header {
          padding: 1rem 0;
        }

        /* Hover movement is transform-only (see layoutRows) - keep it on the GPU */
        @media (hover: hover) {
          .service-item,
          .service-header > div {
            will-change: transform;
          }
        }

        /* Hovered row (set by hoverRow): arrow slides in after the title, other rows fade back */
        .service-header :global(.service-arrow) {
          opacity: 0;
          transform: translateX(-0.4em);
          transition:
            opacity 0.35s ease,
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .is-hovered .service-header :global(.service-arrow) {
          opacity: 1;
          transform: translateX(0);
        }

        .service-header > div {
          transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .has-hover .service-item:not(.is-hovered) .service-header > div {
          opacity: 0.6;
        }

        /* Touch screens and phones: no hover arrow. !important beats the arrow's own
           inline display, otherwise the invisible arrow wraps onto its own line
           under long titles and leaves a gap */
        @media (hover: none), (max-width: 768px) {
          .service-header :global(.service-arrow) { display: none !important; }
          .has-hover .service-item:not(.is-hovered) .service-header > div { opacity: 1; }
        }

        .service-header .service-summary {
          transition: color 0.3s ease;
        }

        .is-hovered .service-header .service-summary {
          color: var(--color-green) !important;
        }

        /* Desktop: calm the expanded prose down to the same size as the section headline. */
        @media (min-width: 1025px) {
          .services-left-crossfade > div:last-child .hero-text {
            font-size: var(--step-4) !important;
          }
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
            padding: 1.5rem 1.25rem !important; /* same side margins as every other section */
            min-height: 0 !important;
          }

          /* Summaries use the full width on phones */
          .service-header .service-summary {
            padding-right: 0 !important;
          }

          /* With a service open, the list makes way for the service text + panel */
          .services-has-expanded .services-split-right {
            display: none;
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
            font-size: var(--step-3) !important;
            line-height: 1.2 !important;
          }

          .service-header h3,
          .service-header .service-number,
          .service-header .service-summary { font-size: var(--step-1) !important; }

          .service-header { padding: 1.1rem 0; }
        }

        /* ── Wide ── */
        @media (min-width: 1800px) {
          .service-item h3.service-title { font-size: var(--text-service-heading-size) !important; }
        }
      `}</style>
    </section>
  )
}