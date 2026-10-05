// components/TeamSection.js
// Updated: Click team member to open slide-up modal with full bio

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Arrow from '@/components/Arrow'

// Careers section feature image (full-bleed, left). Sanity CDN domain is already
// configured for next/image via the profile images.
const CAREERS_IMAGE =
  'https://cdn.sanity.io/images/jzefrw3z/production/2016cb46e5ff54fadf204e6fc1a178ccc34ca5ad-2880x2880.heif?fm=jpg&fit=max&w=2000&q=85'

export default function TeamSection({ teamData, careersData }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const headlineRef = useRef(null)

  const openModal = (member) => {
    setSelectedMember(member)
    requestAnimationFrame(() => {
      setIsModalVisible(true)
    })
    document.body.style.overflow = 'hidden'
  }

  const closeModal = useCallback(() => {
    setIsModalVisible(false)
    setTimeout(() => {
      setSelectedMember(null)
      document.body.style.overflow = ''
    }, 400)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedMember) closeModal()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMember, closeModal])

  useEffect(() => {
    return () => { document.body.style.overflow = '' }
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

        gsap.set(headlineRef.current, { opacity: 1 })

        splitInstance = new SplitText(headlineRef.current, {
          type: 'chars',
          charsClass: 'team-split-char',
          tag: 'span'
        })

        gsap.set(splitInstance.chars, { opacity: 0.2 })

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
        if (headlineRef.current) headlineRef.current.style.opacity = '1'
      }
    }

    initAnimation()
    return () => {
      if (ctx) ctx.revert()
      if (splitInstance) splitInstance.revert()
    }
  }, [])

  if (!teamData?.teamMembers || teamData.teamMembers.length === 0) {
    return null
  }

  const getUniqueKey = (member, index) => {
    if (member._id) return `${member._id}-${index}`
    if (member.name && member.jobTitle) return `${member.name}-${member.jobTitle}-${index}`
    if (member.name) return `${member.name}-${index}`
    return `team-member-${index}`
  }

  // Initials fallback while client profile images are pending.
  // First letter of the first two name parts, e.g. "Marko Smith" -> "MS".
  const getInitials = (name) => {
    if (!name) return ''
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const careers = {
    headline: teamData?.headline,
    content: teamData?.introduction
  }

  const careersComponents = {
    block: {
      normal: ({children}) => (
        <p style={{ 
          fontFamily: 'var(--font-body), var(--font-fallback)',
          fontSize: 'var(--step-0)',
          fontWeight: 400,
          lineHeight: 1.55,
          marginBottom: '1.5rem'
        }}>
          {children}
        </p>
      )
    },
    marks: {
      link: ({children, value}) => {
        const href = value?.href || ''
        return (
          <a 
            href={href}
            target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
            rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
            className="text-link"
            style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit' }}
          >
            {children}
          </a>
        )
      }
    }
  }

  return (
    <section id="team" className="team-section" style={{
      backgroundColor: '#f5f5f0',
      padding: '1rem 1.5%',
      paddingBottom: '0rem'
    }}>
      <div className="team-container" style={{ position: 'relative' }}>
        {/* Header Section */}
        <div 
          className="team-header"
          style={{
            maxWidth: '67%',
            paddingBottom: '5.5rem',
            borderBottom: '0px solid rgb(196, 210, 207)',
            marginBottom: '2rem'
          }}
        >
       
          <h2 
            ref={headlineRef}
            className="hero-text"
            style={{ color: '#245148', opacity: 0 }}
          >
            Our experienced team brings together diverse expertise to deliver clarity and actionable intelligence.
          </h2>
        </div>

        {/* Team Members Grid - 4 columns */}
        <div 
          className="team-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            paddingTop: '0',
            paddingBottom: '2rem'
          }}
        >
          {teamData.teamMembers.map((member, index) => (
            <div 
              key={getUniqueKey(member, index)} 
              className="team-member"
              onClick={() => openModal(member)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'transparent',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {/* Profile Image (or initials monogram while images are pending) */}
              <div 
                className="team-member-image-wrapper"
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '6 / 4.025',
                  marginBottom: '0',
                  overflow: 'hidden',
                  backgroundColor: '#e8e8e3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                   display: 'none'
                }}
              >
                {member.profileImage ? (
                  <Image
                    src={urlFor(member.profileImage).url()}
                    alt={member.profileImage.alt || member.name}
                    fill
                    className="team-member-image"
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ) : (
                  <span
                    className="team-member-initials"
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--text-display-font)',
                      fontSize: 'var(--step-4)',
                      fontWeight: 300,
                      lineHeight: 1,
                      letterSpacing: '0.02em',
                      color: 'var(--color-green)',
                      opacity: 0.45,
                      userSelect: 'none'
                    }}
                  >
                    {getInitials(member.name)}
                  </span>
                )}
              </div>
              
              {/* Member Info */}
              <div 
                className="team-member-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  padding: '0.75rem 0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <h3 
                    className="text-body-lg team-member-name"
                    style={{ lineHeight: 1.35, fontSize: 'var(--step-2)', fontFamily: 'var(--font-heading), serif' }}
                  >
                    {member.name}
                  </h3>
                  {member.location && (
                    <span 
                      className="team-member-location"
                      style={{
                     
                        fontSize: 'var(--step--2)',
                        fontWeight: '600',
                        lineHeight: 'var(--text-body-lg-line-height)',
                 
                        color: 'var(--color-red)'
                      }}
                    >
                      {member.location}
                    </span>
                  )}
                </div>
                {member.jobTitle && (
                  <p 
                    className="text-body-lg team-member-job-title"
                    style={{ 
                      marginTop: '0',
                      lineHeight: 1.3,
                      fontSize: 'var(--step--1)',
                      fontFamily: 'var(--font-body), var(--font-fallback)',
                      opacity: 0.5
                    }}
                  >
                    {member.jobTitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Careers Section */}
        {careers.content && (
          <div 
            id="careers"
            className="careers-section"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              minHeight: '75vh',
              marginTop: '50px',
              backgroundColor: '#f5f5f0',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              borderTop: '1px solid rgb(224, 224, 224)',
              borderBottom: '1px solid rgb(224, 224, 224)'
            }}
          >
            {/* Full-bleed image (left). Absolutely positioned so it fills the
               section's full height and bleeds past the section's 1.5% padding
               to the viewport's left edge, without affecting the text flow. */}
            <div
              className="careers-image"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '-1.5vw',
                width: 'calc(60% + 1.5vw)',
                overflow: 'hidden',
                backgroundColor: '#e8e8e3'
              }}
            >
              <Image
                src={CAREERS_IMAGE}
                alt=""
                fill
                style={{ objectFit: 'cover' }}
                sizes="50vw"
              />
            </div>

            <div 
              className="careers-content"
              style={{
                maxWidth: '36.75%',  
                marginLeft: 'auto',
                paddingRight: '0%'
              }}
            >
              <span className="preheader-label">
                {careers.headline}
              </span>
              
              <div 
                className="careers-rich-text"
                style={{ marginTop: '0.5rem' }}
              >
                <PortableText 
                  value={careers.content} 
                  components={careersComponents}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Member Modal */}
      {selectedMember && (
        <div
          className="team-modal-overlay"
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: isModalVisible ? '#245148a3' : '#24514800',
            transition: 'background-color 0.4s ease',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
             
          }}
        >
          <div
            className="team-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#f5f5f0',
              width: '40%',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '10vh',
              transform: isModalVisible ? 'translateY(0)' : 'translateY(100vh)',
              transition: 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
              position: 'relative',
                  height: '100%'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 10,
                padding: '0rem',
                color: '#245148'
              }}
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Content */}
            <div
              className="team-modal-content"
              style={{
                padding: '1.5rem',
                maxWidth: '100%',
                margin: '0 auto'
              }}
            >
              {/* Name and Job Title */}
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                  <h3
                    className="text-body-lg"
                    style={{
                      lineHeight: 1.1,
                      fontSize: 'var(--step-2)',
                      fontFamily: 'var(--font-heading), serif',
                      color: '#245148',
                      margin: 0
                    }}
                  >
                    {selectedMember.name}
                  </h3>
                </div>

                {selectedMember.jobTitle && (
                  <p
                    className="text-body-lg"
                    style={{
                      marginTop: '5px',
                      lineHeight: 1.1,
                      fontSize: 'var(--step-0)',
                      fontFamily: 'var(--font-body), var(--font-fallback)',
                      opacity: 0.5
                    }}
                  >
                    {selectedMember.jobTitle}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div style={{ marginTop: '50px', marginBottom: '20px' }}>
               
                <a
                  href="tel:+442071234567"
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step-0)',
                    fontWeight: 400,
                    color: '#245148',
                    textDecoration: 'none',
                    display: 'block',
                    lineHeight: 1.55
                  }}
                >
                
                </a>
                <a
                  href="mailto:info@templetonresearch.com"
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step-0)',
                    fontWeight: 400,
                    color: '#245148',
                    textDecoration: 'none',
                    display: 'block',
                    lineHeight: 1.55
                  }}
                >
               
                </a>
                
              </div>

              {/* Image (only when a profile image exists) */}
              {selectedMember.profileImage && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '6 / 4.025',
                    overflow: 'hidden',
                    backgroundColor: '#e8e8e3',
                    marginBottom: '2rem'
                   
                  }}
                >
                  <Image
                    src={urlFor(selectedMember.profileImage).url()}
                    alt={selectedMember.profileImage.alt || selectedMember.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="50vw"
                  />
                </div>
              )}

              {/* Bio */}
              {selectedMember.bio && (
                <div
                  style={{
                    marginTop: '0',
                    maxWidth: '100%'
                  }}
                >
                  {selectedMember.bio.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                    <p
                      key={i}
                      style={{
                        color: '#245148',
                        fontFamily: 'var(--font-body), var(--font-fallback)',
                        fontSize: 'var(--step-0)',
                        fontWeight: 400,
                        lineHeight: 1.55,
                        marginTop: i === 0 ? '0' : '1rem',
                        marginBottom: '0'
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step--1)',
                    fontWeight: 600,
                    color: 'var(--color-red)',
                    textDecoration: 'none',
                    display: 'block',
                    lineHeight: 1.55
                  }}
                >
                  <br /> LinkedIn<Arrow />
                </a>
                
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style jsx>{`
        #careers .preheader-label {
          text-transform: none;
          font-family: var(--font-heading);
          font-size: var(--step-3);
          font-weight: 400;
          line-height: 1.2;
          color: var(--color-green);
          display: block !important;
          margin-bottom: 30px;
          width: 70%;
        }

        .team-modal-overlay::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1400px) {
          .team-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        @media (max-width: 1024px) {
          .team-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .team-header {
            max-width: 100% !important;
          }
          
          .team-header h2 {
            font-size: var(--step-4) !important;
          }
          
          .careers-content {
            max-width: 100% !important;
          }
          
          .careers-section {
            display: block !important;
            min-height: 0 !important;
          }

          .careers-image {
            position: relative !important;
            top: auto !important;
            bottom: auto !important;
            left: 0 !important;
            width: 100% !important;
            aspect-ratio: 4 / 3;
            margin-bottom: 2rem;
          }
          
          .team-modal-content {
            grid-template-columns: 1fr !important;
            padding: 2rem !important;
            gap: 2rem !important;
          }
          
          .team-modal {
            width: 75% !important;
          }
        }

        @media (max-width: 768px) {
          .team-grid {
            grid-template-columns: 1fr !important;
          }
          
          .team-section {
            padding: 1.5rem 1.25rem !important;
          }
          
          .team-header {
            max-width: 100% !important;
          }
          
          .team-header h2 {
            font-size: var(--step-3) !important;
          }
          
          .careers-content {
            max-width: 100% !important;
          }
          
          .team-modal-content {
            grid-template-columns: 1fr !important;
            padding: 1.5rem !important;
            gap: 1.5rem !important;
          }
          
          .team-modal {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  )
}