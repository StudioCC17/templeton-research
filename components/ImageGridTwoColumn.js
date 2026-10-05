// components/ImageGridTwoColumn.js
// Updated: Header section from original + RandomImageGrid replica below

'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

export default function ImageGridTwoColumn() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Use a different default image for this section
  const defaultImage = {
    alt: 'Team workspace',
    url: 'https://cdn.sanity.io/images/jzefrw3z/production/e3c9b10b86242e2be2e95d1394ccdf1c4f8f597c-1500x1000.jpg'
  }

  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true)
            setHasAnimated(true)
            // Disconnect observer after first trigger
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3, rootMargin: '-10% 0px' }
    )

    if (sectionRef.current && !hasAnimated) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [hasAnimated])

  // Trigger content animation
  useEffect(() => {
    if (isVisible && !showContent) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 300) // Delay content animation slightly
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, showContent])

  return (
    <section 
      style={{
        backgroundColor: 'var(--color-cream)',
        position: 'relative',
        borderBottom: '1px solid var(--color-border)',
        padding: '1.5rem'
      }}
    >
      {/* Header block - EXACT copy from original ImageGridTwoColumn */}
      <div
        style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '60vh',
          marginLeft: '-1.5rem',
          marginRight: '-1.5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Large header top left */}
        <h2
          style={{
            fontFamily: 'var(--font-heading), serif',
            fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--color-green)',
            margin: 0,
            maxWidth: '800px'
          }}
        >
          Let's explore the possibilities together.
        </h2>

        {/* Credits bottom left */}
        <div
          style={{
            fontFamily: 'var(--font-body), var(--font-fallback)',
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.52,
            color: 'var(--color-green)'
          }}
        >
          <p style={{ margin: 0 }}>- Sylvain Lavoie</p>
          <p style={{ margin: 0 }}>Partner Buildings - Cima+</p>
        </div>
      </div>

      {/* RandomImageGrid replica content below */}
      <div 
        ref={sectionRef}
        style={{
          marginTop: '1.5rem'
        }}
      >
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            alignItems: 'stretch',
            height: '550px',
            position: 'relative'
          }}
        >
          {/* Vertical divider line */}
          <div 
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: '1px',
              backgroundColor: 'var(--color-border)',
              transform: 'translateX(-50%)',
              zIndex: 10
            }} 
          />

          {/* Left Side - Large Image (Full Bleed) */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transform: showContent ? 'translateX(0)' : 'translateX(-50px)',
              opacity: showContent ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            <Image
              src={defaultImage.url}
              alt={defaultImage.alt}
              width={500}
              height={300}
              style={{ 
                position: 'absolute',
                height: 'auto',
                width: '41%',
                left: '1.5rem',
                top: 'unset',
                right: 0,
                bottom: '1.5rem',
                objectFit: 'cover',
                color: 'transparent'
              }}
              sizes="50vw"
            />
          </div>

          {/* Right Side - Text Block */}
          <div 
            style={{
              padding: '1.5rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              transform: showContent ? 'translateY(0)' : 'translateY(30px)',
              opacity: showContent ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s',
              position: 'relative'
            }}
          >
            <h2 
              style={{
                fontFamily: 'var(--font-heading), var(--font-fallback)',
                fontSize: '2.4vw',
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: 'var(--color-green)',
                margin: 0,
                textAlign: 'left',
                paddingRight: '15%'
              }}
            >
              Collaborative solutions for complex challenges
            </h2>
            
            {/* Small paragraph - bottom left positioned */}
            <p
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: 'calc(.95rem * 0.94)',
                fontWeight: 400,
                lineHeight: 1.377,
                color: 'var(--color-text-secondary)',
                margin: 0,
                paddingRight: '40%'
              }}
            >
              Building partnerships that drive innovation and deliver meaningful results across diverse sectors.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          section > div:last-child > div {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }

          section h2 {
            font-size: 2.5rem !important;
          }
        }

        @media (max-width: 768px) {
          section {
            padding: 2rem 1.5rem !important;
          }

          section > div:last-child > div {
            gap: 2rem !important;
          }

          section h2 {
            font-size: 1.8rem !important;
          }

          section > div:last-child > div > div:first-child {
            height: 50vh !important;
            min-height: 300px !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          section > div > div > div {
            transform: none !important;
            opacity: 1 !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}