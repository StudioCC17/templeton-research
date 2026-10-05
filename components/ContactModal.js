// components/ContactModal.js
// Slide-up contact modal that mirrors the team member modal.
// Rendered through a portal into document.body so that the smooth-scroll
// wrapper's transform cannot break position: fixed (which was leaving the
// modal positioned off-screen). Class names are unique to avoid any CSS
// collisions with old styles in globals.css.

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Arrow from '@/components/Arrow'
import FormSuccess from '@/components/FormSuccess'
import { fadeOut } from '@/lib/motion'

const INITIAL_FORM = {
  name: '',
  email: '',
  company: '',
  message: '',
}

export default function ContactModal({ isOpen, onClose, service }) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const formRef = useRef(null)


  // Portals need the DOM, which only exists in the browser.
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animate in: double rAF so the off-screen start state paints before
  // we flip to visible, guaranteeing the slide/fade actually plays.
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsVisible(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [isOpen])

  // Opened from a service panel: start the message off with the service name.
  useEffect(() => {
    if (isOpen && service) {
      setForm((prev) => (prev.message ? prev : { ...prev, message: `I'd like to find out more about ${service}.` }))
    }
  }, [isOpen, service])

  // Slide out, then tell the parent to unmount once the transition ends.
  const handleClose = useCallback(() => {
    setIsVisible(false)
    document.body.style.overflow = ''
    setTimeout(() => {
      onClose()
      setForm(INITIAL_FORM)
      setStatus('idle')
    }, 600)
  }, [onClose])

  // Restore scroll lock if the component unmounts mid-animation.
  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      await fadeOut(formRef.current) // form fades away before the thank-you appears
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  if (!isOpen || !mounted) return null

  const fieldStyle = {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-line-field)', // pale line at rest; red focus line drawn over it by .form-field (globals.css)
    borderRadius: 0,
    padding: '0.35rem 0',
    fontFamily: 'var(--font-body), var(--font-fallback)',
    fontSize: 'var(--step-0)',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'var(--color-green)',
    outline: 'none',
    appearance: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-body), var(--font-fallback)',
    fontSize: 'var(--step--2)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-red)', // red labels, like the preheaders elsewhere

  }

  const modal = (
    <div
      className="tr-contact-overlay"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: isVisible ? 'var(--color-overlay)' : '#24514800',
        transition: 'background-color 0.4s ease',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div
        className="tr-contact-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-cream)',
          width: '40%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '10vh',
          height: '100%',
          transform: isVisible ? 'translateY(0)' : 'translateY(100vh)',
          transition: 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
            color: 'var(--color-green)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="tr-contact-content" style={{ padding: '1.5rem 1.5rem 2rem' }}>
          {/* Heading */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontSize: 'var(--step-3)',
                fontWeight: 300,
                lineHeight: 1.1,
                color: 'var(--color-green)',
                margin: 0,
              }}
            >
              Have a question? Get in touch
            </h2>
          </div>

          {status === 'success' ? (
            <FormSuccess>
              <p
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: 'var(--step-1)',
                  lineHeight: 1.472,
                  color: 'var(--color-green)',
                  margin: 0,
                }}
              >
                Thanks - your message is on its way. We will be in touch shortly.
              </p>
            </FormSuccess>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="contact-name" style={labelStyle}>Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="form-field"
                  style={fieldStyle}
                />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="contact-email" style={labelStyle}>Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="form-field"
                  style={fieldStyle}
                />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="contact-company" style={labelStyle}>Company <span style={{ color: 'var(--color-red-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  className="form-field"
                  style={fieldStyle}
                />
              </div>

              <div style={{ marginBottom: '2.25rem' }}>
                <label htmlFor="contact-message" style={labelStyle}>Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="form-field"
                  style={{ ...fieldStyle, resize: 'vertical', minHeight: '90px' }}
                />
              </div>

              {status === 'error' && (
                <p
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step--1)',
                    color: 'var(--color-red)',
                    marginTop: 0,
                    marginBottom: '1.25rem',
                  }}
                >
                  Something went wrong sending your message. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary" /* same as Enquire / View all insights (globals.css) */
                style={{
                  cursor: status === 'submitting' ? 'default' : 'pointer',
                  opacity: status === 'submitting' ? 0.6 : 1,
                }}
              >
                {status === 'submitting' ? 'Sending...' : 'Send message'}
                {status !== 'submitting' && <Arrow />}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .tr-contact-overlay::-webkit-scrollbar {
          display: none;
        }

        .tr-contact-box textarea::placeholder,
        .tr-contact-box input::placeholder {
          color: rgba(36, 81, 72, 0.4);
        }

        @media (max-width: 1024px) {
          .tr-contact-box {
            width: 75% !important;
          }
        }

        @media (max-width: 768px) {
          .tr-contact-box {
            width: 100% !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            min-height: 100vh;
          }

          .tr-contact-content {
            padding: 1.25rem 1.25rem 2rem !important; /* same side margins as the page */
          }

          /* keep the heading clear of the close button */
          .tr-contact-content h2 {
            padding-right: 2.5rem;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modal, document.body)
}