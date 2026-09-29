// components/RandomImageGrid.js
// Updated: Static text content instead of toggles

'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function RandomImageGrid({ imageGridData, approachData }) {
  const sectionRef = useRef(null)
  const [showContent, setShowContent] = useState(false)

  // Use first image from data or default
  const defaultImage = {
    alt: 'Office interior',
    url: 'https://cdn.sanity.io/images/jzefrw3z/production/f46db0a703e6845b759c4d870270ceed223f048a-1500x842.jpg'
  }

  const image = imageGridData?.images?.[0] || defaultImage

  // Simple fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <section 
      id="approach"
      className="random-image-grid-section"
      style={{
        position: 'relative',
        backgroundColor: '#f5f5f0',
        overflow: 'hidden',
        borderTop: '0px solid #c4d2cf',
        borderBottom: '0px solid #c4d2cf',
        padding: '10rem'
      }}
    >
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}
      >

        {/* Text Block */}
        <div 
          className="approach-text-block"
          style={{
            position: 'relative',
            width: '50%',
            opacity: showContent ? 1 : 0,
            transition: 'opacity 0.6s ease-out'
          }}
        >
          {/* Preheader Label */}
          <span className="preheader-label">
            About us
          </span>
          
          <p style={{ fontFamily: 'var(--font-heading), serif', fontSize: '1.45rem', lineHeight: '1.35' }}>
            Enabling leaders in the investment, corporate, industrial, legal and non-profit sectors to make informed decisions about future investments and existing assets. Clients turn to us knowing that their critical and commercially sensitive matters will receive the full attention and care that they deserve. 
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
          
          .random-image-grid-section > div > div:first-child {
            padding-bottom: 2rem !important;
          }
          
          .random-image-grid-section > div > div:last-child {
            padding-right: 1.25rem !important;
          }
        }

        @media (max-width: 768px) {
          .random-image-grid-section {
            padding: 2rem 1.25rem !important;
          }
          
          .random-image-grid-section > div {
            gap: 2rem !important;
            min-height: auto !important;
          }
          
          .random-image-grid-section h2 {
            font-size: 1.8rem !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .random-image-grid-section > div > div {
            opacity: 1 !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}