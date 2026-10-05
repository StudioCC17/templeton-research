// components/ApproachSection.js
// Updated: Toggle functionality with + rotating to cross, clean borders

'use client'

import { useRef, useState, useEffect } from 'react'
import { PortableText } from '@portabletext/react'

export default function ApproachSection({ approachData }) {
  const sectionRef = useRef(null)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const contentRefs = useRef([])

  // Handle expand/collapse with smooth animation
  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        if (expandedItems.has(index)) {
          // Expanding
          ref.style.maxHeight = ref.scrollHeight + 'px'
        } else {
          // Collapsing
          ref.style.maxHeight = '0px'
        }
      }
    })
  }, [expandedItems, approachData])

  const handleItemClick = (index) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  if (!approachData?.approaches || approachData.approaches.length === 0) {
    return null
  }

  return (
    <section 
      ref={sectionRef}
      className="approach-section"
      style={{ 
        backgroundColor: 'var(--color-cream)',
        minHeight: 'auto',
        position: 'relative',
        zIndex: 2
      }}
    >
      <div 
        style={{ 
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          alignItems: 'start',
          position: 'relative'
        }}
      >
        {/* Vertical divider */}
        <div 
          style={{
            position: 'absolute',
            left: '50%',
            top: '0',
            bottom: '0',
            width: '1px',
            backgroundColor: 'var(--color-border)',
            transform: 'translateX(-50%)',
            zIndex: 1
          }} 
        />

        {/* Left Column - Main Header (Sticky) */}
        <div 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingRight: '30%',
            paddingLeft: '1.25rem',
            position: 'sticky',
            top: '35px',
            zIndex: 2
          }}
        >
          
          
          <h2 
            style={{
              fontFamily: 'var(--font-heading), var(--font-fallback)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--color-green)',
              margin: 0,
              textAlign: 'left',
              paddingRight: '15%',
              paddingTop: '1.25rem'
            }}
          >
            An investigative research firm
          </h2>
        </div>

        {/* Right Column - Toggle Items */}
        <div 
          style={{
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Approach Items with Toggle */}
          {approachData.approaches.map((approach, index) => {
            const isLastItem = index === approachData.approaches.length - 1
            
            return (
            <div 
              key={approach._key || index}
              style={{
                borderBottom: isLastItem ? 'none' : '1px solid var(--color-border)'
              }}
            >
              {/* Toggle Header - Clickable */}
              <div 
                onClick={() => handleItemClick(index)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Title */}
                <h3 
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontWeight: 300,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    color: 'var(--color-green)',
                    margin: 0,
                    flex: 1
                  }}
                >
                  {approach.title}
                </h3>

                {/* Plus Icon with Rotation - Float Right */}
                <div 
                  style={{
                    width: '1.875rem',
                    height: '1.875rem',
                    minWidth: '1.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '1rem',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: expandedItems.has(index) ? 'rotate(45deg)' : 'rotate(0deg)',
                    flexShrink: 0
                  }}
                >
                  <svg 
                    width="30" 
                    height="30" 
                    viewBox="0 0 24 24"
                    style={{
                      display: 'block'
                    }}
                  >
                    <line 
                      x1="12" 
                      y1="6" 
                      x2="12" 
                      y2="18" 
                      stroke="#245148" 
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    <line 
                      x1="6" 
                      y1="12" 
                      x2="18" 
                      y2="12" 
                      stroke="#245148" 
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Expandable Content */}
              <div 
                ref={el => contentRefs.current[index] = el}
                style={{
                  maxHeight: 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
              >
                <div 
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    padding: '1.25rem',
                    paddingRight: '15%'
                  }}
                >
                  {/* Description */}
                  {approach.description && (
                    <PortableText 
                      value={approach.description}
                      components={{
                        block: {
                          normal: ({children}) => (
                            <p 
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1rem',
                                fontWeight: 400,
                                lineHeight: 1.55,
                                color: 'rgb(108 119 117)',
                                margin: 0
                              }}
                            >
                              {children}
                            </p>
                          ),
                          h3: ({children}) => (
                            <h4 
                              style={{
                                fontFamily: 'var(--font-heading), serif',
                                fontSize: '1.4rem',
                                fontWeight: 300,
                                color: 'var(--color-green)',
                                margin: '2rem 0 1rem 0'
                              }}
                            >
                              {children}
                            </h4>
                          ),
                          h4: ({children}) => (
                            <h5 
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                color: 'var(--color-green)',
                                margin: '1.25rem 0 0.75rem 0'
                              }}
                            >
                              {children}
                            </h5>
                          ),
                        },
                        list: {
                          bullet: ({children}) => (
                            <ul 
                              style={{ 
                                marginLeft: '1.25rem', 
                                marginBottom: '1.25rem',
                                color: 'var(--color-green)'
                              }}
                            >
                              {children}
                            </ul>
                          ),
                          number: ({children}) => (
                            <ol 
                              style={{ 
                                marginLeft: '1.25rem', 
                                marginBottom: '1.25rem',
                                color: 'var(--color-green)'
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
                                fontSize: '1rem',
                                color: 'var(--color-green)',
                                marginBottom: '0.5rem',
                                lineHeight: 1.6
                              }}
                            >
                              {children}
                            </li>
                          ),
                          number: ({children}) => (
                            <li 
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1rem',
                                color: 'var(--color-green)',
                                marginBottom: '0.5rem',
                                lineHeight: 1.6
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
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          
          section > div > div:first-child {
            position: relative !important;
            top: auto !important;
            padding-right: 0 !important;
            margin-bottom: 2rem;
          }
          
          section > div > div:first-child h2 {
            font-size: 2.5rem !important;
          }
        }

        @media (max-width: 768px) {
          section {
            padding: 3rem 1.25rem !important;
          }
          
          section > div {
            gap: 2rem !important;
          }
          
          section > div > div:first-child h2 {
            font-size: 1.8rem !important;
          }
          
          h3 {
            font-size: 1.3rem !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}