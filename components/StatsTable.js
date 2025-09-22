// components/StatsTable.js
// Stats table with simple CSS-based scroll animations to avoid GSAP conflicts
// Uses Intersection Observer with CSS transitions for smooth animations

'use client'

import { useRef, useEffect, useState } from 'react'

export default function StatsTable() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // Stats data with % and £ symbols
  const statsData = [
    { number: '£11M', description: 'Total Investments' },
    { number: '47%', description: 'Research Success Rate' },
    { number: '£2.3M', description: 'Average Project Value' },
    { number: '95%', description: 'Client Satisfaction' }
  ]

  // Intersection observer for animation trigger
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
        rootMargin: '-50px 0px' // Trigger slightly after entering viewport
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

  return (
    <section 
      ref={sectionRef}
      className="stats-table-section"
      style={{
        backgroundColor: '#BB7860',
        padding: '0rem 2rem'
      }}
    >
      <div 
        className="stats-table-container"
        style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        <div 
          className="stats-table"
          style={{
            width: '100%'
          }}
        >
          {statsData.map((stat, index) => (
            <div 
              key={index}
              className={`stats-row ${isVisible ? 'stats-row--visible' : ''}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '2rem 0',
                borderBottom: index < statsData.length - 1 ? '1px solid #f5f5f0' : 'none',
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
              {/* Large number on the left */}
              <div 
                className="stats-number"
                style={{
                  fontFamily: 'var(--font-heading), serif',
                  fontSize: 'clamp(6rem, 15vw, 8rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  color: '#f5f5f0',
                  letterSpacing: '-0.02em'
                }}
              >
                {stat.number}
              </div>
              
              {/* Description text on the right */}
              <div 
                className="stats-description"
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#f5f5f0',
                  textAlign: 'right'
                }}
              >
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS-based animations and responsive styles */}
      <style jsx>{`
        .stats-row--visible {
          transform: translateY(0) !important;
          opacity: 1 !important;
        }

        @media (max-width: 768px) {
          .stats-table-section {
            padding: 3rem 1.5rem !important;
          }
          
          .stats-row {
            padding: 1.5rem 0 !important;
          }
          
          .stats-number {
            font-size: clamp(3rem, 12vw, 5rem) !important;
          }
          
          .stats-description {
            font-size: 0.9rem !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stats-row {
            transform: none !important;
            opacity: 1 !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}