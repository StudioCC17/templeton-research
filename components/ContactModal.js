// components/ContactModal.js
// Contact form modal with modern styling matching the site design

'use client'

import { useState, useEffect } from 'react'

export default function ContactModal({ isOpen, onClose }) {
  const [shouldMount, setShouldMount] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')

  useEffect(() => {
    if (isOpen) {
      setShouldMount(true)
      setIsVisible(false)
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else if (shouldMount) {
      setIsVisible(false)
      setTimeout(() => {
        setShouldMount(false)
        document.body.style.overflow = 'unset'
      }, 200)
    }
  }, [isOpen, shouldMount])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('')

    try {
      // Replace this with your actual form submission logic
      // This could be a POST request to your API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', company: '', subject: '', message: '' })
        setTimeout(() => {
          onClose()
          setSubmitStatus('')
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldMount) return null

  return (
    <div 
      className={`contact-modal-overlay ${isVisible ? 'contact-modal-overlay--visible' : ''}`}
      onClick={onClose}
    >
      <div 
        className={`contact-modal-content ${isVisible ? 'contact-modal-content--visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="contact-modal-close-button"
        >
          ×
        </button>

        {/* Modal header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 
            style={{
              fontFamily: 'var(--font-heading), serif',
              fontSize: '2.5rem',
              fontWeight: 300,
              color: '#245148',
              margin: '0 0 1rem 0',
              lineHeight: 1.2
            }}
          >
            Get in Touch
          </h2>
          <p className="contact-modal-description">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Name and Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label 
                  htmlFor="name"
                  className="contact-modal-label"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="contact-modal-input"
                />
              </div>

              <div>
                <label 
                  htmlFor="email"
                  className="contact-modal-label"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="contact-modal-input"
                />
              </div>
            </div>

            {/* Company and Subject row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label 
                  htmlFor="company"
                  className="contact-modal-label"
                >
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="contact-modal-input"
                />
              </div>

              <div>
                <label 
                  htmlFor="subject"
                  className="contact-modal-label"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-modal-input"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label 
                htmlFor="message"
                className="contact-modal-label"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #245148',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#245148',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
            </div>

            {/* Submit status */}
            {submitStatus === 'success' && (
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  color: '#155724',
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: '0.9rem'
                }}
              >
                Thank you! Your message has been sent successfully.
              </div>
            )}

            {submitStatus === 'error' && (
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24',
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: '0.9rem'
                }}
              >
                Sorry, there was an error sending your message. Please try again.
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="contact-modal-submit-button"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .contact-modal-content input:focus,
        .contact-modal-content textarea:focus {
          outline: none;
          border-color: #BB7860;
          box-shadow: 0 0 0 2px rgba(187, 120, 96, 0.2);
        }

        .contact-modal-content button[type="submit"]:hover:not(:disabled) {
          background-color: #A66850;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .contact-modal-content {
            padding: 2rem !important;
            margin: 1rem !important;
          }

          .contact-modal-content > div:nth-child(3) > div:first-child,
          .contact-modal-content > div:nth-child(3) > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}