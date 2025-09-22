// components/Navigation.js
// Navigation with section-based nav item styling and smooth scroll
// Updated: Integrated with Lenis smooth scroll with GSAP fallback and Contact Modal

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import ContactModal from '@/components/ContactModal'

export default function Navigation({ globalSettings }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currentSection, setCurrentSection] = useState('hero')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Define nav items with their corresponding section names
  const navItems = [
    { label: 'About', href: '#approach', section: 'approach' },
    { label: 'Services', href: '#services', section: 'services' },
    { label: 'Case Studies', href: '#case-studies', section: 'case-studies' },
    { label: 'Team', href: '#team', section: 'team' }
  ]

  // Smooth scroll function using Lenis instead of GSAP
  const handleNavClick = (e, href, section) => {
    // Only handle anchor links, not full URLs
    if (!href.startsWith('#') || !section) return
    
    e.preventDefault()
    
    // More specific selectors to find the right sections
    let targetElement = null
    
    if (section === 'approach') {
      targetElement = document.querySelector('.approach-section') || document.querySelector('section.approach-section')
    } else if (section === 'services') {
      targetElement = document.querySelector('.services-section') || document.querySelector('section.services-section')
    } else if (section === 'case-studies') {
      targetElement = document.querySelector('.case-studies-table-section') || document.querySelector('section.case-studies-table-section')
    } else if (section === 'team') {
      targetElement = document.querySelector('.team-section') || document.querySelector('section.team-section')
    } else {
      targetElement = document.querySelector(`.${section}-section`)
    }
    
    if (!targetElement) {
      console.log(`Could not find target element for section: ${section}`)
      return
    }

    // Use Lenis scrollTo if available, fallback to GSAP
    if (window.lenisScrollTo) {
      window.lenisScrollTo(targetElement, {
        offset: 0,
        duration: 1.5
      })
    } else if (window.gsap) {
      // Fallback to GSAP method
      let targetPosition
      
      if (section === 'approach' || section === 'services') {
        const heroSection = document.querySelector('.hero-section')
        const imageGridSection = document.querySelector('.random-image-grid-section')
        
        if (section === 'approach' && heroSection) {
          targetPosition = heroSection.offsetTop + heroSection.offsetHeight
        } else if (section === 'services' && imageGridSection) {
          targetPosition = imageGridSection.offsetTop + imageGridSection.offsetHeight
        } else {
          targetPosition = targetElement.offsetTop
        }
      } else {
        targetPosition = targetElement.offsetTop
      }

      window.gsap.killTweensOf(window)
      window.gsap.to(window, {
        scrollTo: { y: targetPosition, autoKill: false },
        duration: 1.5,
        ease: "power3.out",
        overwrite: "auto"
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      // Check if approach section is getting close to top of viewport
      const approachSection = document.querySelector('.approach-section')
      if (approachSection) {
        const rect = approachSection.getBoundingClientRect()
        const approachTop = rect.top
        
        // Toggle scrolled class when approach section is 80px from top
        if (approachTop <= 80) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      } else {
        // Fallback to original behavior if approach section not found
        const scrollY = window.scrollY
        if (scrollY > 300) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      }

      // Section detection logic
      detectCurrentSection()
    }

    const detectCurrentSection = () => {
      const scrollPosition = window.scrollY + (window.innerHeight * 0.1) // Top 10% of viewport
      let activeSection = 'hero' // Default

      // Get all sections in order
      const heroSection = document.querySelector('.hero-section')
      const approachSection = document.querySelector('.approach-section')
      const imageGridSection = document.querySelector('.random-image-grid-section')
      const servicesSection = document.querySelector('.services-section')
      const caseStudiesSection = document.querySelector('.case-studies-table-section')
      const teamSection = document.querySelector('.team-section')

      const sections = [
        { name: 'hero', element: heroSection },
        { name: 'approach', element: approachSection },
        { name: 'image-grid', element: imageGridSection },
        { name: 'services', element: servicesSection },
        { name: 'case-studies', element: caseStudiesSection },
        { name: 'team', element: teamSection }
      ]

      // Find which section we're currently in - check from bottom to top for better detection
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (!section.element) continue

        const rect = section.element.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY
        
        // If we've scrolled past the start of this section, this is the active one
        if (scrollPosition >= elementTop) {
          activeSection = section.name
          break
        }
      }

      setCurrentSection(activeSection)
    }

    // Set initial state
    handleScroll()

    // Throttle scroll events for better performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll)
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])

  // Trigger slide-down animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaded(true)
    }, 100) // Small delay to ensure smooth animation

    return () => clearTimeout(timer)
  }, [])

  // Function to get nav item opacity based on current section
  const getNavItemOpacity = (navItem) => {
    // If we're on the hero section, all nav items are full opacity
    if (currentSection === 'hero') {
      return 1
    }
    
    // Special case: highlight "Our Approach" when on image-grid section too
    if (navItem.section === 'approach' && currentSection === 'image-grid') {
      return 1
    }
    
    // If nav item has no section mapping, it gets dimmed like others
    if (!navItem.section) {
      return 0.4
    }
    
    // If current section matches nav item section, full opacity, otherwise dimmed
    return currentSection === navItem.section ? 1 : 0.4
  }

  // Build navigation classes
  const navigationClasses = [
    'navigation',
    isScrolled ? 'navigation--scrolled' : '',
    hasLoaded ? 'navigation--loaded' : '',
    `navigation--${currentSection}`,
    `${currentSection}-section-scroll`
  ].filter(Boolean).join(' ')

  return (
    <>
      <nav className={navigationClasses}>
        <div className="nav-container">
          <div className="nav-left">
            {globalSettings?.navigation?.headerNav ? (
              globalSettings.navigation.headerNav.map((item, index) => (
                <Link 
                  key={index}
                  href={item.link || '#'} 
                  className="nav-link"
                  target={item.openInNewTab ? '_blank' : '_self'}
                  rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                  style={{
                    opacity: getNavItemOpacity({ section: null }), // Global nav items always visible
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                {navItems.map((navItem, index) => (
                  <Link 
                    key={index}
                    href={navItem.href} 
                    className="nav-link"
                    onClick={(e) => handleNavClick(e, navItem.href, navItem.section)}
                    style={{
                      opacity: getNavItemOpacity(navItem),
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {navItem.label}
                  </Link>
                ))}
              </>
            )}
          </div>
          
          <div className="nav-center">
            {/* Primary logo - always rendered */}
            {globalSettings?.logoSettings?.primaryLogo?.asset?._ref ? (
              <Link href="/" className="nav-logo-link nav-logo-primary">
                <Image
                  src={urlFor(globalSettings.logoSettings.primaryLogo).url()}
                  alt={globalSettings.logoSettings.primaryLogo.alt || 'Templeton Research'}
                  width={180}
                  height={60}
                  className="nav-logo-image"
                  priority
                />
              </Link>
            ) : (
              <div className="nav-logo nav-logo-primary">
                <span className="logo-text">TEMPLETON</span>
                <span className="logo-subtext">RESEARCH</span>
              </div>
            )}
            
            {/* Secondary logo - SVG version */}
            <div className="nav-logo nav-logo-secondary">
              <svg 
                viewBox="0 0 283.05 227.86" 
                className="nav-logo-svg"
                style={{
                  width: '60px',
                  height: '40px'
                }}
              >
                <g>
                  <path d="M128.1,227.61c-1.17,0-2.34-1.17-2.34-2.34V5.52H3.17C1.42,5.52.25,4.35.25,2.59.25,1.42,1.42.25,2.59.25h124.93c1.17,0,2.34,1.17,2.34,2.34v222.09c.58,1.76-.58,2.93-1.75,2.93" fill="currentColor"></path>
                  <path d="M128.11,227.86v-.5c.514,0,1.007-.257,1.319-.688.365-.505.434-1.185.194-1.914l-.013-.078V2.59c0-1.035-1.055-2.09-2.09-2.09H2.59C1.555.5.5,1.555.5,2.59c0,1.628,1.048,2.68,2.67,2.68h122.84v220c0,1.035,1.055,2.09,2.09,2.09v.5c-1.307,0-2.59-1.283-2.59-2.59V5.77H3.17c-1.896,0-3.17-1.278-3.17-3.18C0,1.283,1.283,0,2.59,0h124.93c1.307,0,2.59,1.283,2.59,2.59v222.051c.276.871.179,1.695-.276,2.324-.405.561-1.049.895-1.724.895Z" fill="currentColor"></path>
                </g>
                <g>
                  <path d="M100.08,227.61c-1.17,0-2.34-1.17-2.34-2.34V33.07H2.59c-1.17,0-2.34-1.17-2.34-2.34s1.17-2.34,2.34-2.34h96.91c1.17,0,2.34,1.17,2.34,2.34v193.96c.58,1.76-.58,2.93-1.75,2.93" fill="currentColor"></path>
                  <path d="M100.09,227.87v-.5c.514,0,1.007-.257,1.318-.688.366-.505.435-1.186.194-1.915l-.013-.078V30.73c0-1.035-1.055-2.09-2.09-2.09H2.59c-1.035,0-2.09,1.055-2.09,2.09s1.055,2.09,2.09,2.09h95.4v192.45c0,1.035,1.055,2.09,2.09,2.09v.5c-1.307,0-2.59-1.283-2.59-2.59V33.32H2.59c-1.307,0-2.59-1.283-2.59-2.59s1.283-2.59,2.59-2.59h96.91c1.307,0,2.59,1.283,2.59,2.59v193.92c.276.871.179,1.696-.276,2.325-.405.561-1.049.895-1.724.895Z" fill="currentColor"></path>
                </g>
                <g>
                  <path d="M72.06,227.61c-1.17,0-2.34-1.17-2.34-2.34V61.19H2.59c-1.17,0-2.34-1.17-2.34-2.34s1.17-2.34,2.34-2.34h69.47c1.17,0,2.34,1.17,2.34,2.34v166.42c0,1.17-1.17,2.34-2.34,2.34" fill="currentColor"></path>
                  <path d="M72.06,227.86c-1.307,0-2.59-1.283-2.59-2.59V61.44H2.59c-1.307,0-2.59-1.283-2.59-2.59s1.283-2.59,2.59-2.59h69.47c1.307,0,2.59,1.283,2.59,2.59v166.42c0,1.307-1.283,2.59-2.59,2.59ZM2.59,56.76c-1.035,0-2.09,1.055-2.09,2.09s1.055,2.09,2.09,2.09h67.38v164.33c0,1.035,1.055,2.09,2.09,2.09s2.09-1.055,2.09-2.09V58.85c0-1.035-1.055-2.09-2.09-2.09H2.59Z" fill="currentColor"></path>
                </g>
                <g>
                  <path d="M155.54,227.61c-1.17,0-2.34-1.17-2.34-2.34V2.59c0-1.17,1.17-2.34,2.34-2.34h124.93c1.17,0,2.34,1.17,2.34,2.34s-1.17,2.34-2.34,2.34h-122.6v219.74c0,1.76-1.17,2.93-2.34,2.93" fill="currentColor"></path>
                  <path d="M155.54,227.86c-1.307,0-2.59-1.283-2.59-2.59V2.59C152.95,1.283,154.233,0,155.54,0h124.93c1.307,0,2.59,1.283,2.59,2.59s-1.283,2.59-2.59,2.59h-122.35v219.49c0,1.959-1.337,3.173-2.58,3.18v.01ZM155.54.5c-1.035,0-2.09,1.055-2.09,2.09v222.68c0,1.032,1.048,2.083,2.08,2.09v-.01c1.005,0,2.09-1.024,2.09-2.68V4.68h122.85c1.035,0,2.09-1.055,2.09-2.09s-1.055-2.09-2.09-2.09h-124.93Z" fill="currentColor"></path>
                </g>
                <g>
                  <path d="M183.56,227.61c-1.17,0-2.34-1.17-2.34-2.34V30.72c0-1.17,1.17-2.34,2.34-2.34h96.91c1.17,0,2.34,1.17,2.34,2.34s-1.17,2.34-2.34,2.34h-94.57v191.62c0,1.76-1.17,2.93-2.34,2.93" fill="currentColor"></path>
                  <path d="M183.56,227.86c-1.307,0-2.59-1.283-2.59-2.59V30.72c0-1.307,1.283-2.59,2.59-2.59h96.91c1.307,0,2.59,1.283,2.59,2.59s-1.283,2.59-2.59,2.59h-94.319v191.37c0,1.964-1.345,3.18-2.591,3.18ZM183.56,28.63c-1.035,0-2.09,1.055-2.09,2.09v194.55c0,1.035,1.055,2.09,2.09,2.09,1.006,0,2.091-1.024,2.091-2.68V32.81h94.819c1.035,0,2.09-1.055,2.09-2.09s-1.055-2.09-2.09-2.09h-96.91Z" fill="currentColor"></path>
                </g>
                <g>
                  <path d="M211,227.61c-1.17,0-2.34-1.17-2.34-2.34V58.85c0-1.17,1.17-2.34,2.34-2.34h69.47c1.17,0,2.34,1.17,2.34,2.34s-1.17,2.34-2.34,2.34h-66.55v163.49c0,1.76-1.17,2.93-2.92,2.93" fill="currentColor"></path>
                  <path d="M211,227.86c-1.307,0-2.59-1.283-2.59-2.59V58.85c0-1.307,1.283-2.59,2.59-2.59h69.47c1.307,0,2.59,1.283,2.59,2.59s-1.283,2.59-2.59,2.59h-66.3v163.24c0,1.902-1.273,3.18-3.17,3.18ZM211,56.76c-1.035,0-2.09,1.055-2.09,2.09v166.42c0,1.035,1.055,2.09,2.09,2.09,1.622,0,2.67-1.052,2.67-2.68V60.94h66.8c1.035,0,2.09-1.055,2.09-2.09s-1.055-2.09-2.09-2.09h-69.47Z" fill="currentColor"></path>
                </g>
              </svg>
            </div>
          </div>

          <div className="nav-right">
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 1,
                transition: 'opacity 0.3s ease',
                marginRight: '2rem',
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: '1.1rem',
                fontWeight: '400',
                color: isScrolled ? '#245148' : '#f5f5f0',
                textDecoration: 'none'
              }}
            >
              Contact
            </button>
            <button 
              className="locale-button"
              style={{
                opacity: 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              <span style={{ opacity: 1 }}>EN</span>
              <span style={{ opacity: 0.4 }}> JP</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </>
  )
}