// components/SmoothScroll.js
// Lenis smooth scroll integration with GSAP ScrollTrigger
// Following official Lenis documentation for GSAP integration

'use client'

import { useEffect, useRef } from 'react'

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis only on client side
    if (typeof window === 'undefined' || !window.Lenis) return

    // Create Lenis instance following official documentation
    lenisRef.current = new window.Lenis({
      // Core settings for smooth scroll
      lerp: 0.1, // Linear interpolation intensity (0-1)
      duration: 1.2, // Duration of programmatic scroll
      orientation: 'vertical', // Scroll direction
      gestureOrientation: 'vertical', // Gesture direction
      smoothWheel: true, // Smooth wheel events
      smoothTouch: false, // Disable on touch devices for better performance
      wheelMultiplier: 1, // Mouse wheel sensitivity
      touchMultiplier: 2, // Touch sensitivity
      normalizeWheel: true, // Normalize wheel across browsers
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
    })

    // Wait for GSAP to be available before setting up integration
    const setupGSAPIntegration = () => {
      if (!window.gsap || !window.ScrollTrigger) {
        setTimeout(setupGSAPIntegration, 50)
        return
      }

      // Official GSAP + Lenis integration pattern from documentation
      // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
      lenisRef.current.on('scroll', window.ScrollTrigger.update)

      // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
      // This ensures Lenis's smooth scroll animation updates on each GSAP tick
      window.gsap.ticker.add((time) => {
        lenisRef.current.raf(time * 1000) // Convert time from seconds to milliseconds
      })

      // Disable lag smoothing in GSAP to prevent any delay in scroll animations
      window.gsap.ticker.lagSmoothing(0)
    }

    setupGSAPIntegration()

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      // Remove from GSAP ticker if it exists
      if (window.gsap && window.gsap.ticker) {
        window.gsap.ticker.remove((time) => {
          if (lenisRef.current) {
            lenisRef.current.raf(time * 1000)
          }
        })
      }
    }
  }, [])

  // Expose Lenis methods globally for navigation
  useEffect(() => {
    // Expose the Lenis instance and methods globally
    window.lenis = lenisRef.current
    
    window.lenisScrollTo = (target, options = {}) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options.offset || 0,
          duration: options.duration || 1.2,
          easing: options.easing,
          ...options
        })
      }
    }

    return () => {
      delete window.lenis
      delete window.lenisScrollTo
    }
  }, [])

  return (
    <>
      {children}
      
      {/* Required Lenis CSS - from official documentation */}
      <style jsx global>{`
        html.lenis, html.lenis body {
          height: auto;
        }

        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }

        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }

        .lenis.lenis-stopped {
          overflow: hidden;
        }

        .lenis.lenis-smooth iframe {
          pointer-events: none;
        }
        
        /* Additional optimizations */
        html {
          scroll-behavior: auto !important;
        }
        
        body {
          overflow-x: hidden;
        }
        
        /* Improve rendering performance */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  )
}