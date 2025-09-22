// components/RandomImageGrid.js
// Evenly spaced image grid with uncropped images and line-by-line text animation
// Updated: Added subtle dashed connection lines between images

'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function RandomImageGrid({ imageGridData }) {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const imageRefs = useRef([])
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showLines, setShowLines] = useState(false)
  const [lineCoordinates, setLineCoordinates] = useState([])
  const [headlineLines, setHeadlineLines] = useState([])

  // Default images using only your existing Sanity images - 5 images only
  const defaultImages = [
    { alt: 'Office interior', url: 'https://cdn.sanity.io/images/jzefrw3z/production/f46db0a703e6845b759c4d870270ceed223f048a-1500x842.jpg' },
    { alt: 'Workspace details', url: 'https://cdn.sanity.io/images/jzefrw3z/production/ec20931912abd812bf639a58e9706b5dd022ea6a-1500x1124.jpg' },
    { alt: 'Team collaboration', url: 'https://cdn.sanity.io/images/jzefrw3z/production/e3c9b10b86242e2be2e95d1394ccdf1c4f8f597c-1500x1000.jpg' },
    { alt: 'Office interior alt', url: 'https://cdn.sanity.io/images/jzefrw3z/production/f46db0a703e6845b759c4d870270ceed223f048a-1500x842.jpg' },
    { alt: 'Workspace details alt', url: 'https://cdn.sanity.io/images/jzefrw3z/production/ec20931912abd812bf639a58e9706b5dd022ea6a-1500x1124.jpg' }
  ]

  const images = imageGridData?.images?.slice(0, 5) || defaultImages
  const headline = "Providing clarity when there is uncertainty"

  // Define positions for wider distribution - spread further from center text
  const positions = [
    { left: '8%', top: '25%' },   // Top left - moved further left
    { left: '78%', top: '20%' },  // Top right - pulled back from 85%
    { left: '5%', top: '85%' },   // Bottom left - moved further left and down
    { left: '82%', top: '80%' },  // Bottom right - pulled back from 88%
    { left: '50%', top: '95%' }   // Bottom center - kept centered but moved lower
  ]

  // Define connections between images (which ones connect to which)
  const connections = [
    { from: 0, to: 1 }, // Top left to top right
    { from: 0, to: 2 }, // Top left to bottom left
    { from: 1, to: 3 }, // Top right to bottom right
    { from: 2, to: 4 }, // Bottom left to bottom center
    { from: 3, to: 4 }, // Bottom right to bottom center
    { from: 0, to: 4 }, // Top left to bottom center (crossing line)
    { from: 1, to: 2 }, // Top right to bottom left (crossing line)
  ]

  // Split headline into lines
  useEffect(() => {
    const firstLine = "Providing clarity when"
    const secondLine = "there is uncertainty"
    setHeadlineLines([firstLine, secondLine])
  }, [])

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

  // Calculate line coordinates when component is visible
  useEffect(() => {
    if (isVisible && sectionRef.current) {
      const calculateCoordinates = () => {
        const container = sectionRef.current.querySelector('.random-image-grid')
        if (!container) return

        const rect = container.getBoundingClientRect()
        const containerWidth = rect.width
        const containerHeight = rect.height

        const coords = connections.map(connection => {
          const fromPos = positions[connection.from]
          const toPos = positions[connection.to]
          
          // Convert percentages to actual coordinates
          const x1 = (parseFloat(fromPos.left) / 100) * containerWidth + 98 // Center of image
          const y1 = (parseFloat(fromPos.top) / 100) * containerHeight + 73.5 // Center of image
          const x2 = (parseFloat(toPos.left) / 100) * containerWidth + 98
          const y2 = (parseFloat(toPos.top) / 100) * containerHeight + 73.5
          
          return { x1, y1, x2, y2 }
        })
        
        setLineCoordinates(coords)
      }

      // Calculate after images have animated
      const timer = setTimeout(calculateCoordinates, 1000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // Trigger text animation after images start
  useEffect(() => {
    if (isVisible && !showText) {
      const textTimer = setTimeout(() => {
        setShowText(true)
      }, 500) // Delay text animation to start after images
      
      // Show connection lines after text appears
      const linesTimer = setTimeout(() => {
        setShowLines(true)
      }, 1200) // Show lines after text is visible
      
      return () => {
        clearTimeout(textTimer)
        clearTimeout(linesTimer)
      }
    }
  }, [isVisible, showText])

  // GSAP animation - only animate forward once
  useEffect(() => {
    if (!window.gsap) return

    imageRefs.current.forEach((ref, index) => {
      if (ref && isVisible) {
        // Animate to final position - only once
        window.gsap.fromTo(ref, 
          {
            left: '50%',
            top: '50%', 
            scale: 0,
            opacity: 0
          },
          {
            left: positions[index].left,
            top: positions[index].top,
            scale: 1,
            opacity: 1,
            duration: 1,
            delay: index * 0.15,
            ease: "power2.out"
          }
        )
      }
    })
  }, [isVisible])

  // Calculate line coordinates based on image positions
  const getLineCoordinates = (fromIndex, toIndex) => {
    const fromPos = positions[fromIndex]
    const toPos = positions[toIndex]
    
    // Convert percentages to actual coordinates for a 1400px container
    // Account for image center (196px width/2 = 98px offset)
    const containerWidth = 1400
    const containerHeight = window.innerHeight * 0.7 // 70vh
    
    const x1 = (parseFloat(fromPos.left) / 100) * containerWidth + 98
    const y1 = (parseFloat(fromPos.top) / 100) * containerHeight + 73.5
    const x2 = (parseFloat(toPos.left) / 100) * containerWidth + 98
    const y2 = (parseFloat(toPos.top) / 100) * containerHeight + 73.5
    
    return { x1, y1, x2, y2 }
  }

  return (
    <section 
      ref={sectionRef}
      className="random-image-grid-section"
      style={{
        position: 'relative',
        padding: '0rem 2rem',
        backgroundColor: '#f5f5f0',
        overflow: 'hidden',
        minHeight: '100vh'
      }}
    >
      {/* Background Connection Lines */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1400px',
          height: '70vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        {lineCoordinates.map((coords, index) => (
          <line
            key={index}
            x1={coords.x1}
            y1={coords.y1}
            x2={coords.x2}
            y2={coords.y2}
            stroke="#245148"
            strokeWidth="1"
            strokeDasharray="8,12"
            opacity={showLines ? "0.2" : "0"}
            style={{
              transition: `opacity 1.5s ease ${index * 0.2}s`
            }}
          />
        ))}
      </svg>

      {/* Background Image Grid - Positioned absolutely for radiating effect */}
      <div 
        className="random-image-grid"
        style={{
          position: 'relative',
          width: '100%',
          height: '70vh',
          maxWidth: '1400px',
          margin: '0 auto',
          zIndex: 1
        }}
      >
        {images.map((image, index) => (
          <div 
            key={index}
            ref={el => imageRefs.current[index] = el}
            className="grid-image-item"
            style={{
              position: 'absolute',
              width: '15vw',
              height: '15vw',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              scale: 0,
              zIndex: 2
            }}
          >
            <Image
              src={image.asset ? urlFor(image).url() : image.url}
              alt={image.alt || `Grid image ${index + 1}`}
              fill
              style={{ 
                objectFit: 'contain'
              }}
              sizes="196px"
            />
          </div>
        ))}
      </div>

      {/* Overlaid Text - with line-by-line animation like hero */}
      <div 
        ref={textRef}
        className="grid-text-overlay"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          textAlign: 'center'
        }}
      >
        <div className="hero-headline-container" style={{ overflow: 'hidden' }}>
          {headlineLines.map((line, index) => (
            <h1 
              key={index}
              className={`hero-headline-line ${showText ? 'animate-line' : ''}`}
              style={{
                fontFamily: 'var(--font-heading), serif',
                
                fontWeight: 300,
                lineHeight: .95,
                letterSpacing: '-0.025em',
                color: '#245148',
                margin: 0,
                display: 'block',
                transform: showText ? 'translateY(0)' : 'translateY(100%)',
                opacity: showText ? 1 : 0,
                transition: `transform 0.425s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.08}s, opacity 0.425s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.08}s`,
                marginBottom: index === headlineLines.length - 1 ? '1.5rem' : '0em'
              }}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* Paragraph under headline */}
        <p 
          style={{

            margin: '0 auto',
            maxWidth: '600px',
            textAlign: 'center',
            transform: showText ? 'translateY(0)' : 'translateY(40px)',
            opacity: showText ? 1 : 0,
            transition: `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.3}s, opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.3}s`
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
        </p>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .grid-image-item {
            width: 147px !important;
            height: 111px !important;
          }
        }
        
        @media (max-width: 1024px) {
          .grid-image-item {
            width: 172px !important;
            height: 129px !important;
          }
        }

        /* Accessibility - Respect user preferences for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          svg line {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}