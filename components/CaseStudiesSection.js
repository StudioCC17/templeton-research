// components/CaseStudiesSection.js
// Case studies section with expandable rows maintaining stats table styling
// Uses Intersection Observer with CSS transitions for smooth animations
// Updated: Added header content section above case studies list and custom down arrow SVG

'use client'

import { useRef, useEffect, useState } from 'react'
import { PortableText } from '@portabletext/react'

export default function CaseStudiesSection({ caseStudies = [], headerData }) {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)
  const [expandedStudy, setExpandedStudy] = useState(null)
  const contentRefs = useRef([])

  // Default header content if none provided
  const defaultHeaderData = {
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
  }

  const header = headerData || defaultHeaderData

  // Intersection observer for header animation
  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsHeaderVisible(true)
          }
        })
      },
      { 
        threshold: 0.3,
        rootMargin: '-50px 0px'
      }
    )

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  // Intersection observer for case studies animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { 
        threshold: 0.2,
        rootMargin: '-50px 0px'
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Handle expand/collapse of case studies
  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        const study = caseStudies[index];
        if (expandedStudy === study?._id) {
          if (window.gsap) {
            window.gsap.to(ref, {
              maxHeight: ref.scrollHeight,
              duration: 0.6,
              ease: "power2.out"
            });
          } else {
            ref.style.maxHeight = ref.scrollHeight + 'px';
          }
        } else {
          if (window.gsap) {
            window.gsap.to(ref, {
              maxHeight: 0,
              duration: 0.4,
              ease: "power2.inOut"
            });
          } else {
            ref.style.maxHeight = '0px';
          }
        }
      }
    });
  }, [expandedStudy, caseStudies])

  const handleStudyClick = (study) => {
    if (expandedStudy === study._id) {
      setExpandedStudy(null);
    } else {
      setExpandedStudy(study._id);
    }
  };

  const handleCloseClick = (e, study) => {
    e.stopPropagation();
    setExpandedStudy(null);
  };

  return (
    <section 
      className="case-studies-table-section"
      style={{
        backgroundColor: '#BB7860',
        padding: '0rem 2rem'
      }}
    >
      {/* Header Content Section */}
      <div 
        ref={headerRef}
        className="case-studies-header"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '6rem 0 2rem 0',
          textAlign: 'center'
        }}
      >
        {/* Preheader - Removed */}

        {/* Description */}
        {header.description && (
          <div 
            className={`case-studies-header-description ${isHeaderVisible ? 'case-studies-header-description--visible' : ''}`}
            style={{
              fontFamily: 'var(--font-body), var(--font-fallback)',
              fontSize: '1.2rem',
              fontWeight: '400',
              lineHeight: '1.6',
              color: 'rgba(245, 245, 240, 0.9)',
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
              opacity: 0,
              transform: 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s'
            }}
          >
            {typeof header.description === 'string' ? (
                                    <p style={{ margin: 0, color: 'rgba(245, 245, 240, 0.9)' }}>{header.description}</p>
            ) : (
              <PortableText 
                value={header.description}
                components={{
                  block: {
                    normal: ({children}) => (
                      <p style={{
                        fontFamily: 'var(--font-body), var(--font-fallback)',
                        fontSize: '1.2rem',
                        fontWeight: '400',
                        lineHeight: '1.6',
                        color: 'rgba(245, 245, 240, 0.9)',
                        margin: '0 0 1rem 0'
                      }}>
                        {children}
                      </p>
                    ),
                  },
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Case Studies Table */}
      {caseStudies && caseStudies.length > 0 && (
        <div 
          ref={sectionRef}
          className="case-studies-table-container"
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            paddingBottom: '4rem'
          }}
        >
          <div 
            className="case-studies-table"
            style={{
              width: '100%'
            }}
          >
            {caseStudies.map((study, index) => {
              const isExpanded = expandedStudy === study._id;
              
              return (
                <div 
                  key={study._id}
                  className={`case-study-row ${isVisible ? 'case-study-row--visible' : ''}`}
                  style={{
                    borderBottom: index < caseStudies.length - 1 ? '1px solid #f5f5f0' : 'none',
                    width: '100%',
                    transform: 'translateY(40px)',
                    opacity: 0,
                    transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.15}s`,
                    ...(isVisible && {
                      transform: 'translateY(0)',
                      opacity: 1
                    })
                  }}
                >
                  {/* Clickable header row */}
                  <div 
                    className="case-study-header"
                    onClick={() => handleStudyClick(study)}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '2rem 0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}

                  >
                    {/* Centered case study title */}
                    <div 
                      className="case-study-title"
                      style={{
                        fontFamily: 'var(--font-heading), serif',
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: 300,
                        lineHeight: 1,
                        color: '#f5f5f0',
                        letterSpacing: '-0.02em',
                        textAlign: 'center'
                      }}
                    >
                      {study.title}
                    </div>

                    {/* Expand/collapse indicator */}
                    <div 
                      className="case-study-toggle-icon"
                      style={{
                        position: 'absolute',
                        right: '0',
                        color: '#f5f5f0',
                        fontSize: '1.5rem',
                        transition: 'transform 0.3s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        minWidth: '74.52px',
                        height: '65.21px',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg 
                        width="96" 
                        height="96" 
                        viewBox="24 0 48 96"
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          display: 'block'
                        }}
                      >
                        <g transform="translate(36, 59.99454545454546)">
                          <path d="M22.7-4.13L22.7-4.13Q23.18-4.13 23.18-3.22L23.18-3.22Q23.18-3.02 23.18-2.9 23.18-2.78 23.16-2.69 23.14-2.59 23.09-2.52 23.04-2.45 23.04-2.4 23.04-2.35 22.92-2.3 22.8-2.26 22.75-2.26 22.7-2.26 22.54-2.21 22.37-2.16 22.27-2.11L22.27-2.11Q18.67-1.2 16.08 1.56 13.49 4.32 12.67 8.06L12.67 8.06Q12.67 8.16 12.62 8.33 12.58 8.5 12.55 8.64 12.53 8.78 12.53 8.83L12.53 8.83Q12.38 9.55 11.76 9.22L11.76 9.22Q11.47 9.17 11.42 8.54L11.42 8.54Q10.8 4.66 8.11 1.75 5.42-1.15 1.73-2.11L1.73-2.11Q1.63-2.16 1.46-2.21 1.3-2.26 1.25-2.26 1.2-2.26 1.08-2.3 0.96-2.35 0.96-2.4 0.96-2.45 0.91-2.52 0.86-2.59 0.84-2.69 0.82-2.78 0.82-2.9 0.82-3.02 0.82-3.22L0.82-3.22Q0.82-4.18 1.3-4.18L1.3-4.18Q1.58-4.18 2.02-4.03L2.02-4.03Q7.58-2.5 10.7 2.16L10.7 2.16 11.04 2.64 11.04-14.98Q11.04-32.59 11.14-32.78L11.14-32.78Q11.42-33.31 12.05-33.31L12.05-33.31Q12.62-33.26 12.96-32.59L12.96-32.59 12.96 2.64 13.3 2.16Q15.5-1.2 19.3-3.02L19.3-3.02Q21.6-4.13 22.7-4.13Z" fill="#f5f5f0" stroke="#f5f5f0" strokeWidth="0.5"/>
                        </g>
                      </svg>
                    </div>

                 
                  </div>

                  {/* Expandable content */}
                  <div 
                    ref={el => contentRefs.current[index] = el}
                    className="case-study-content"
                    style={{ 
                      maxHeight: 0, 
                      overflow: 'hidden',
                      transition: 'max-height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }}
                  >
                    <div 
                      className="case-study-content-inner"
                      style={{
                        padding: '0 0 2rem 0',
                        marginTop: '0rem'
                      }}
                    >
                      {/* Case study meta information */}
                      <div 
                        className="case-study-meta-info"
                        style={{
                          display: 'flex',
                          gap: '.5rem',
                          alignItems: 'center',
                          marginBottom: '1.25rem',
                          flexWrap: 'wrap',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Location */}
                        <div 
                          className="case-study-location-expanded"
                          style={{
                            fontFamily: 'var(--font-body), var(--font-fallback)',
                            fontSize: '1rem',
                            fontWeight: 400,
                            color: '#f5f5f0',
                            opacity: 0.9,
                            textTransform: 'capitalize',
                            backgroundColor: 'rgba(245, 245, 240, 0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '30px'
                          }}
                        >
                         {study.location}
                        </div>

                        {/* Type */}
                        {study.type && (
                          <div 
                            className="case-study-type-expanded"
                            style={{
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: '1rem',
                              fontWeight: 400,
                              color: '#f5f5f0',
                              opacity: 0.9,
                              textTransform: 'capitalize',
                              backgroundColor: 'rgba(245, 245, 240, 0.1)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '30px'
                            }}
                          >
                            {study.type}
                          </div>
                        )}

                        {/* Date */}
                        {study.date && (
                          <div 
                            className="case-study-date-expanded"
                            style={{
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: '1rem',
                              fontWeight: 400,
                              color: '#f5f5f0',
                              opacity: 0.9,
                              textTransform: 'capitalize',
                              backgroundColor: 'rgba(245, 245, 240, 0.1)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '30px'
                            }}
                          >
                            {new Date(study.date).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </div>
                        )}
                      </div>

                      {/* Case study content */}
                      <div 
                        className="case-study-description"
                        style={{
                          marginBottom: '2rem',
                          maxWidth: '800px',
                          margin: '0 auto 2rem auto'
                        }}
                      >
                        {study.copy && study.copy.length > 0 ? (
                          <PortableText 
                            value={study.copy}
                            components={{
                              block: {
                                normal: ({children}) => (
                                  <p 
                                    style={{
                                      fontFamily: 'var(--font-body), var(--font-fallback)',
                                      fontSize: '1.1rem',
                                      fontWeight: 400,
                                      lineHeight: '1.6',
                                      color: '#f5f5f0',
                                      marginBottom: '1.5rem'
                                    }}
                                  >
                                    {children}
                                  </p>
                                ),
                                h2: ({children}) => (
                                  <h2 
                                    style={{
                                      fontFamily: 'var(--font-heading), serif',
                                      fontSize: '1.8rem',
                                      fontWeight: 300,
                                      color: '#f5f5f0',
                                      marginBottom: '1rem',
                                      marginTop: '2rem'
                                    }}
                                  >
                                    {children}
                                  </h2>
                                ),
                                h3: ({children}) => (
                                  <h3 
                                    style={{
                                      fontFamily: 'var(--font-heading), serif',
                                      fontSize: '1.4rem',
                                      fontWeight: 300,
                                      color: '#f5f5f0',
                                      marginBottom: '0.75rem',
                                      marginTop: '1.5rem'
                                    }}
                                  >
                                    {children}
                                  </h3>
                                ),
                              },
                              list: {
                                bullet: ({children}) => (
                                  <ul 
                                    style={{ 
                                      marginLeft: '1.5rem', 
                                      marginBottom: '1.5rem',
                                      color: '#f5f5f0'
                                    }}
                                  >
                                    {children}
                                  </ul>
                                ),
                                number: ({children}) => (
                                  <ol 
                                    style={{ 
                                      marginLeft: '1.5rem', 
                                      marginBottom: '1.5rem',
                                      color: '#f5f5f0'
                                    }}
                                  >
                                    {children}
                                  </ol>
                                ),
                              },
                              listItem: {
                                bullet: ({children}) => (
                                  <li 
                                    style={{
                                      fontFamily: 'var(--font-body), var(--font-fallback)',
                                      fontSize: '1.1rem',
                                      color: '#f5f5f0',
                                      marginBottom: '0.5rem',
                                      lineHeight: '1.6'
                                    }}
                                  >
                                    {children}
                                  </li>
                                ),
                                number: ({children}) => (
                                  <li 
                                    style={{
                                      fontFamily: 'var(--font-body), var(--font-fallback)',
                                      fontSize: '1.1rem',
                                      color: '#f5f5f0',
                                      marginBottom: '0.5rem',
                                      lineHeight: '1.6'
                                    }}
                                  >
                                    {children}
                                  </li>
                                ),
                              },
                              marks: {
                                strong: ({children}) => (
                                  <strong style={{ fontWeight: 600 }}>{children}</strong>
                                ),
                                em: ({children}) => (
                                  <em style={{ fontStyle: 'italic' }}>{children}</em>
                                ),
                                link: ({value, children}) => (
                                  <a 
                                    href={value.href}
                                    target={value.blank ? '_blank' : '_self'}
                                    rel={value.blank ? 'noopener noreferrer' : undefined}
                                    style={{
                                      color: '#f5f5f0',
                                      textDecoration: 'underline',
                                      textUnderlineOffset: '2px'
                                    }}
                                  >
                                    {children}
                                  </a>
                                ),
                              },
                            }}
                          />
                        ) : (
                          <p 
                            style={{
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: '1.1rem',
                              color: '#f5f5f0',
                              fontStyle: 'italic',
                              opacity: 0.8
                            }}
                          >
                            Case study details coming soon...
                          </p>
                        )}
                      </div>

                      {/* Call to action button */}
                      <div style={{ textAlign: 'center' }}>
                        {study.callToAction && study.callToAction.text && (
                          <a 
                            href={study.callToAction.link || '#'}
                            className="case-study-cta"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              backgroundColor: '#f5f5f0',
                              color: '#BB7860',
                              padding: '0.675rem 1.35rem',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontFamily: 'var(--font-body), var(--font-fallback)',
                              fontSize: '1rem',
                              fontWeight: 400,
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = 'rgba(245, 245, 240, 0.9)';
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = '#f5f5f0';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            {study.callToAction.text}
                            <span 
                              style={{
                                fontSize: '1.2rem',
                                transition: 'transform 0.3s ease'
                              }}
                            >
                              →
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS-based animations and responsive styles */}
      <style jsx>{`
        .case-study-row--visible {
          transform: translateY(0) !important;
          opacity: 1 !important;
        }

        .case-studies-preheader--visible,
        .case-studies-main-headline--visible,
        .case-studies-header-image--visible,
        .case-studies-header-description--visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .case-study-cta:hover span {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .case-studies-table-section {
            padding: 3rem 1.5rem !important;
          }
          
          .case-studies-header {
            padding: 4rem 0 3rem 0 !important;
          }
          
          .case-studies-main-headline {
            font-size: clamp(2rem, 8vw, 3rem) !important;
            margin-bottom: 2rem !important;
          }
          
          .case-studies-header-image {
            max-width: 300px !important;
            margin-bottom: 2rem !important;
          }
          
          .case-studies-header-description {
            font-size: 1.1rem !important;
          }
          
          .case-study-header {
            padding: 1.5rem 0 !important;
          }
          
          .case-study-title {
            font-size: clamp(1.8rem, 8vw, 2.5rem) !important;
          }

          .case-study-toggle-icon {
            right: 0 !important;
          }

          .case-study-meta-info {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .case-study-row,
          .case-studies-preheader,
          .case-studies-main-headline,
          .case-studies-header-image,
          .case-studies-header-description {
            transform: none !important;
            opacity: 1 !important;
            transition: none !important;
          }
          
          .case-study-content {
            transition: none !important;
          }
          
          .case-study-toggle-icon {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}