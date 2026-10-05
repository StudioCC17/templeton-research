// components/AboutModal.js
// Controlled slide-up modal for the "About us" nav item.
// API mirrors ContactModal (isOpen / onClose); visual language mirrors the
// TeamSection member modal (slide-up panel, backdrop fade, Esc + scroll lock).

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'

// Body rendering for PortableText content (matches the TeamSection careers styles).
const bodyComponents = {
  block: {
    normal: ({ children }) => (
      <p
        style={{
          color: '#245148',
          fontSize: 'var(--step-1)',
          fontWeight: 400,
          lineHeight: 1.55,
          marginBottom: '1.5rem',
        }}
      >
        {children}
      </p>
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

export default function AboutModal({ isOpen, onClose, aboutData }) {
  // isRendered keeps the node mounted through the exit transition;
  // isVisible drives the slide/fade.
  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const closeTimer = useRef(null)

  // Open: mount + lock scroll. The visibility flip happens in the effect
  // below, once the panel is actually in the DOM and painted at its start
  // position, so the slide-up transition has something to animate from.
  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      setIsRendered(true)
      document.body.style.overflow = 'hidden'
    } else if (isRendered) {
      // Close: play exit transition, then unmount + restore scroll.
      setIsVisible(false)
      closeTimer.current = setTimeout(() => {
        setIsRendered(false)
        document.body.style.overflow = ''
      }, 600)
    }
  }, [isOpen, isRendered])

  // After mount, flip to visible on a later frame (double rAF guarantees the
  // browser has painted the translateY(100vh) start state first).
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

  // Esc to close.
  const handleClose = useCallback(() => onClose?.(), [onClose])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  // Safety: always restore scroll on unmount.
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      document.body.style.overflow = ''
    }
  }, [])

  if (!isRendered) return null

  const headline = aboutData?.headline
  const copy = aboutData?.copy
  const cta = aboutData?.callToAction
  const image = aboutData?.image

  // copy may be PortableText (array) or a plain newline-separated string.
  const isPortableText = Array.isArray(copy)

  return (
    <div
      className="about-modal-overlay"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: isVisible ? '#245148a3' : '#24514800',
        transition: 'background-color 0.4s ease',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div
        className="about-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="About us"
        style={{
          backgroundColor: '#f5f5f0',
          width: '50%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '10vh',
          transform: isVisible ? 'translateY(0)' : 'translateY(100vh)',
          transition: 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
            color: '#245148',
          }}
          aria-label="Close modal"
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

        {/* Content */}
        <div
          className="about-modal-content"
          style={{ padding: '1.5rem', maxWidth: '100%', margin: '0 auto' }}
        >
          {headline && (
            <div style={{ marginBottom: '2rem' }}>
              <span className="preheader-label">About us</span>
              <h2
                className="hero-text"
                style={{
                  color: '#245148',
                  fontFamily: 'var(--font-heading), var(--font-fallback)',
                  fontSize: 'var(--step-4)',
                  marginTop: '0.5rem',
                  lineHeight: 1.1,
                  width: '84%',
                }}
              >
                {headline}
              </h2>
            </div>
          )}

          {/* Optional image */}
          {image?.asset && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '6 / 4.025',
                overflow: 'hidden',
                backgroundColor: '#e8e8e3',
                marginBottom: '2rem',
              }}
            >
              <Image
                src={urlFor(image).url()}
                alt={image.alt || headline || 'About us'}
                fill
                style={{ objectFit: 'cover' }}
                sizes="50vw"
              />
            </div>
          )}

          {/* Body copy */}
          {copy && (
            <div style={{ maxWidth: '100%' }}>
              {isPortableText ? (
                <PortableText value={copy} components={bodyComponents} />
              ) : (
                String(copy)
                  .split('\n')
                  .filter((p) => p.trim())
                  .map((paragraph, i) => (
                    <p
                      key={i}
                      style={{
                        color: '#245148',
                        fontSize: 'var(--step-1)',
                        fontWeight: 400,
                        lineHeight: 1.55,
                        marginTop: i === 0 ? 0 : '1rem',
                        marginBottom: 0,
                      }}
                    >
                      {paragraph}
                    </p>
                  ))
              )}
            </div>
          )}

          {/* Optional call to action */}
          {cta?.text && cta?.link && (
            <a
              href={cta.link}
              className="text-link"
              style={{
                display: 'inline-block',
                marginTop: '1.5rem',
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: 'var(--step-0)',
                fontWeight: 600,
                color: 'var(--color-red)',
                textDecoration: 'none',
              }}
            >
              {cta.text}
            </a>
          )}
        </div>
      </div>

      <style jsx>{`
        .about-modal-overlay::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          .about-modal {
            width: 75% !important;
          }
          .about-modal-content {
            padding: 2rem !important;
          }
        }
        @media (max-width: 768px) {
          .about-modal {
            width: 100% !important;
          }
          .about-modal-content {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}