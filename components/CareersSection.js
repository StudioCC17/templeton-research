// components/CareersSection.js
// Careers section component with similar styling to other text sections

import { PortableText } from '@portabletext/react'

export default function CareersSection({ careersData }) {
  if (!careersData) {
    return null
  }

  return (
    <section 
      className="careers-section text-section"
      style={{
        backgroundColor: '#f5f5f0',
        padding: '1rem 2rem 5rem 2rem'
      }}
    >
      <div 
        className="careers-container text-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(11, 1fr)',
          maxWidth: '1800px',
          margin: '0 auto'
        }}
      >
        {/* Left side - Headline */}
        <div 
          className="careers-left text-left"
          style={{
            gridColumn: '1 / 5'
          }}
        >
          {careersData.headline && (
            <h2 
              className="careers-headline section-headline"
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontSize: 'clamp(2.3rem, 4.4vw, 2.3rem)',
                fontWeight: '300',
                lineHeight: '1.2',
                letterSpacing: '-0.01em',
                color: '#245148',
                marginBottom: '0'
              }}
            >
              {careersData.headline}
            </h2>
          )}
        </div>

        {/* Right side - Content */}
        <div 
          className="careers-right text-right"
          style={{
            gridColumn: '7 / 13',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingRight: '50px'
          }}
        >
          {/* Career description */}
          {careersData.copy && (
            <div 
              className="careers-content section-content"
              style={{
                marginBottom: '1.5rem'
              }}
            >
              <PortableText 
                value={careersData.copy}
                components={{
                  block: {
                    normal: ({children}) => (
                      <p 
                        style={{
                          fontFamily: 'var(--font-body), var(--font-fallback)',
                          fontSize: '1.1rem',
                          fontWeight: '400',
                          lineHeight: '1.5',
                          color: '#245148',
                          margin: '0 0 1rem 0',
                          textAlign: 'left'
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
                          fontWeight: '300',
                          color: '#245148',
                          marginBottom: '1rem',
                          marginTop: '2rem',
                          textAlign: 'left'
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
                          fontWeight: '300',
                          color: '#245148',
                          marginBottom: '0.75rem',
                          marginTop: '1.5rem',
                          textAlign: 'left'
                        }}
                      >
                        {children}
                      </h3>
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
                          color: '#BB7860',
                          textDecoration: 'underline'
                        }}
                      >
                        {children}
                      </a>
                    ),
                  },
                }}
              />
            </div>
          )}

        </div>
      </div>


    </section>
  )
}