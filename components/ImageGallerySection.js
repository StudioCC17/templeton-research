// components/RandomImageGrid.js
// Updated: Single large image on left (full bleed), text block on right
// Text uses h2 styles but with body font
// Restored borders and vertical divider

'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function RandomImageGrid({ imageGridData }) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Use first image from data or default
  const defaultImage = {
    alt: 'Office interior',
    url: 'https://cdn.sanity.io/images/jzefrw3z/production/f46db0a703e6845b759c4d870270ceed223f048a-1500x842.jpg'
  }

  const image = imageGridData?.images?.[0] || defaultImage

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
      ref={sectionRef}
      className="random-image-grid-section"
      style={{
        position: 'relative',
        padding: '0', // Remove all padding for full bleed
        backgroundColor: 'var(--color-cream)',
        overflow: 'hidden',
        minHeight: '600px',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0', // No gap for full bleed effect
          alignItems: 'stretch',
          height: '600px',
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
            src={image.asset ? urlFor(image).url() : image.url}
            alt={image.alt || 'Featured image'}
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
              fontFamily: 'var(--font-body), var(--font-fallback)',
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
            Clear intelligence addressing the issues that matter most
          </h2>
          
          {/* Small paragraph - bottom left positioned */}
          <p
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '1.5rem',
              fontFamily: 'var(--font-body), var(--font-fallback)',
              fontSize: '0.9rem',
              fontWeight: 400,
              lineHeight: 1.4,
              color: 'var(--color-green)',
              margin: 0,
              maxWidth: '250px'
            }}
          >
            Fostering collaboration between all those involved in a project contributes to its efficiency and success.
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .random-image-grid-section > div {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }

          .random-image-grid-section h2 {
            font-size: 2.5rem !important;
          }
        }

        @media (max-width: 768px) {
          .random-image-grid-section {
            padding: 2rem 1.5rem !important;
          }

          .random-image-grid-section > div {
            gap: 2rem !important;
          }

          .random-image-grid-section h2 {
            font-size: 1.8rem !important;
          }

          .random-image-grid-section > div > div:first-child {
            height: 50vh !important;
            min-height: 300px !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .random-image-grid-section > div > div {
            transform: none !important;
            opacity: 1 !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}