// components/ApplyModal.js
// Careers form: name, email, CV upload and an optional note. Two versions,
// chosen by the `type` prop: 'cv' (general CV) and 'internship'.
// Same slide-up modal as the contact form (ContactModal.js). Posts to
// /api/apply, which emails the application (CV attached) and saves it in Sanity.

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Arrow from '@/components/Arrow'

const INITIAL_FORM = {
  name: '',
  email: '',
  message: '',
  website: '', // honeypot - hidden from people, bots fill it in
}

const MAX_CV_BYTES = 4 * 1024 * 1024 // 4MB (Vercel caps uploads at ~4.5MB)
const CV_TYPES = ['.pdf', '.doc', '.docx']

const COPY = {
  cv: {
    heading: 'Submit your CV',
    intro: "We're not hiring for specific roles right now, but we hire opportunistically. Send us your CV and a short note about what you'd bring.",
    success: "Thanks - your CV is on its way. We'll keep it on file and be in touch if a suitable role comes up.",
  },
  internship: {
    heading: 'Apply for an internship',
    intro: 'Send us your CV and a short note. Internships typically run 3-6 months and we recruit on a rolling basis.',
    success: "Thanks - your application is on its way. We review every application and will be in touch if there's a fit.",
  },
}

export default function ApplyModal({ isOpen, onClose, type = 'internship' }) {
  const copy = COPY[type] || COPY.internship
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [cvFile, setCvFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

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

  // Slide out, then tell the parent to unmount once the transition ends.
  const handleClose = useCallback(() => {
    setIsVisible(false)
    document.body.style.overflow = ''
    setTimeout(() => {
      onClose()
      setForm(INITIAL_FORM)
      setCvFile(null)
      setErrorMsg('')
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

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null
    setErrorMsg('')
    if (file) {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      if (!CV_TYPES.includes(ext)) {
        setErrorMsg('Please upload your CV as a PDF or Word document.')
        e.target.value = ''
        return setCvFile(null)
      }
      if (file.size > MAX_CV_BYTES) {
        setErrorMsg('Your CV is over 4MB. Please upload a smaller file.')
        e.target.value = ''
        return setCvFile(null)
      }
    }
    setCvFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg('Please add your name and email.')
      return setStatus('error')
    }
    if (!cvFile) {
      setErrorMsg('Please attach your CV.')
      return setStatus('error')
    }
    setStatus('submitting')
    setErrorMsg('')

    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      data.append('cv', cvFile)
      data.append('type', type)
      const res = await fetch('/api/apply', { method: 'POST', body: data })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Request failed')
      }
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message && err.message !== 'Request failed' ? err.message : '')
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
              {copy.heading}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: 'var(--step--1)',
                lineHeight: 1.5,
                color: 'var(--color-text-secondary)', // supporting text
                margin: '0.75rem 0 0',
                paddingRight: '15%',
              }}
            >
              {copy.intro}
            </p>
          </div>

          {status === 'success' ? (
            <div style={{ paddingTop: '1rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: 'var(--step-1)',
                  lineHeight: 1.55,
                  color: 'var(--color-green)',
                  margin: 0,
                }}
              >
                {copy.success}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="apply-name" style={labelStyle}>Name</label>
                <input
                  id="apply-name"
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
                <label htmlFor="apply-email" style={labelStyle}>Email</label>
                <input
                  id="apply-email"
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
                <span style={labelStyle}>CV <span style={{ color: 'var(--color-red-muted)', fontWeight: 400 }}>(PDF or Word, max 4MB)</span></span>
                <label
                  htmlFor="apply-cv"
                  className="u-link file-pick"
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step-0)',
                    fontWeight: 400,
                    cursor: 'pointer',
                  }}
                >
                  {cvFile ? 'Change file' : 'Choose file'}<Arrow />
                </label>
                <input
                  id="apply-cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFile}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                />
                {cvFile && (
                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.35rem',
                      fontFamily: 'var(--font-body), var(--font-fallback)',
                      fontSize: 'var(--step--1)',
                      color: 'var(--color-green)',
                    }}
                  >
                    {cvFile.name}
                  </span>
                )}
              </div>

              {/* Honeypot: hidden from people; bots tend to fill it in */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange}
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />

              <div style={{ marginBottom: '2.25rem' }}>
                <label htmlFor="apply-message" style={labelStyle}>A short note <span style={{ color: 'var(--color-red-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  id="apply-message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="form-field"
                  style={{ ...fieldStyle, resize: 'vertical', minHeight: '90px' }}
                />
              </div>

              {(status === 'error' || errorMsg) && (
                <p
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step--1)',
                    color: 'var(--color-red)',
                    marginTop: 0,
                    marginBottom: '1.25rem',
                  }}
                >
                  {errorMsg || 'Something went wrong sending your application. Please try again.'}
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
                {status === 'submitting' ? 'Sending...' : 'Send application'}
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
            padding: 1.5rem 1.5rem 2rem !important;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modal, document.body)
}