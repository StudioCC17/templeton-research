// components/Navigation.js
// Fixed: Two separate navs - primary scrolls, secondary slides down
// Added: Mobile hamburger menu
// Added: About us nav item opens a slide-up modal (AboutModal) instead of scrolling
// Added: listens for 'open-contact-modal' so the footer can open the contact modal
// iOS fix: Using top position instead of transform for better compatibility

'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import ContactModal from '@/components/ContactModal'
import AboutModal from '@/components/AboutModal'

export default function Navigation({ globalSettings, aboutData }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currentSection, setCurrentSection] = useState('hero')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactService, setContactService] = useState(null) // pre-fills the form when opened from a service
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showSecondaryNav, setShowSecondaryNav] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Let other components (e.g. the footer) open the contact modal.
  // ---------- Page-load intro (GSAP) ----------
  // Header items start hidden in CSS ([data-nav-intro] in globals.css) so there's
  // no flash before JS runs, then drift down and fade in: logo first, then the
  // links either side. Animates the wrappers, not the links, so it never fights
  // the links' own hover transitions.
  useLayoutEffect(() => {
    const q = (sel) => document.querySelector(`[data-nav-intro="${sel}"]`)
    const items = [q('nav-center'), q('nav-left'), q('nav-right'), document.querySelector('.nav-hamburger[data-nav-intro]')].filter(Boolean)
    if (!items.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { autoAlpha: 1 })
      return
    }
    const tween = gsap.fromTo(
      items,
      { autoAlpha: 0, y: -10 },
      { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.15, force3D: true, clearProps: 'transform' }
    )
    return () => tween.kill()
  }, [])

  useEffect(() => {
    const open = (e) => {
      setContactService(e?.detail?.service || null)
      setIsContactModalOpen(true)
    }
    window.addEventListener('open-contact-modal', open)
    return () => window.removeEventListener('open-contact-modal', open)
  }, [])

  // Define nav items
  const navItems = [
    { label: 'About us', href: '#approach', section: 'approach' },
    { label: 'Services', href: '#services', section: 'services' },
    { label: 'Team', href: '#team', section: 'team' }
  ]

  // Close mobile menu when clicking a nav item
  const handleMobileNavClick = (e, href, section) => {
    setIsMobileMenuOpen(false)
    handleNavClick(e, href, section)
  }

  // Smooth scroll function with debugging
  const handleNavClick = (e, href, section) => {
    // "About us" is an action (open modal), not a scroll target.
    if (section === 'approach') {
      e.preventDefault()
      setIsMobileMenuOpen(false)
      setIsAboutModalOpen(true)
      return
    }

    console.log('Nav clicked:', { href, section })
    
    if (!href.startsWith('#') || !section) {
      console.log('Invalid href or section')
      return
    }
    
    e.preventDefault()
    
    let targetElement = null
    
    // Try multiple selectors to find the target
    if (section === 'approach') {
      targetElement = document.querySelector('.random-image-grid-section')
      console.log('Looking for approach section:', targetElement)
    } else if (section === 'services') {
      targetElement = document.querySelector('.services-section')
      console.log('Looking for services section:', targetElement)
    } else if (section === 'team') {
      targetElement = document.querySelector('.team-section')
      console.log('Looking for team section:', targetElement)
    }
    
    if (!targetElement) {
      console.warn(`Target element not found for section: ${section}`)
      // Try a more generic approach
      targetElement = document.getElementById(section)
      console.log('Trying ID selector:', targetElement)
    }
    
    if (!targetElement) {
      console.error('No target element found at all')
      return
    }

    console.log('Found target element:', targetElement)
    
    // Calculate position with 38px offset
    const offset = 38
    const targetPosition = targetElement.offsetTop - offset
    
    console.log('Scrolling to position with 38px offset:', targetPosition)
    
    // Custom smooth scroll animation (slowed down by 10%)
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    const baseDuration = 800 // Base duration in milliseconds
    const duration = baseDuration * 1.1 // Slow down by 10% (multiply by 1.1)
    let startTime = null

    function smoothScrollAnimation(currentTime) {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      // Easing function for smooth animation (ease-out)
      const ease = 1 - Math.pow(1 - progress, 3)
      
      window.scrollTo(0, startPosition + (distance * ease))
      
      if (progress < 1) {
        requestAnimationFrame(smoothScrollAnimation)
      }
    }
    
    requestAnimationFrame(smoothScrollAnimation)
  }

  // Scroll to top function for logo click
  const handleLogoClick = (e) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    console.log('Logo clicked - scrolling to top')
    
    // Custom smooth scroll to top (same speed as navigation)
    const startPosition = window.pageYOffset
    const distance = -startPosition // Negative because we're going to 0
    const baseDuration = 800
    const duration = baseDuration * 1.1 // Same 10% slower speed
    let startTime = null

    function scrollToTopAnimation(currentTime) {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      // Easing function for smooth animation (ease-out)
      const ease = 1 - Math.pow(1 - progress, 3)
      
      window.scrollTo(0, startPosition + (distance * ease))
      
      if (progress < 1) {
        requestAnimationFrame(scrollToTopAnimation)
      }
    }
    
    requestAnimationFrame(scrollToTopAnimation)
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const viewportHeight = window.innerHeight
          const threshold = viewportHeight * 0.75 // 75vh
          
          // Determine scroll direction
          const scrollingDown = currentScrollY > lastScrollY
          const scrollingUp = currentScrollY < lastScrollY

          // At the very top (first 75vh)
          if (currentScrollY < threshold) {
            setIsHidden(false)
            setIsScrolled(false)
            setShowSecondaryNav(false)
          }
          // Past 75vh - switch to secondary header
          else if (currentScrollY >= threshold) {
            setIsHidden(false)
            setIsScrolled(true)
            setShowSecondaryNav(true)
          }

          setLastScrollY(currentScrollY)
          detectCurrentSection()
          ticking = false
        })
        ticking = true
      }
    }

    const detectCurrentSection = () => {
      const scrollPosition = window.scrollY + (window.innerHeight * 0.1)
      let activeSection = 'hero'

      const heroSection = document.querySelector('.hero-section')
      const approachSection = document.querySelector('.approach-section')
      const imageGridSection = document.querySelector('.random-image-grid-section')
      const servicesSection = document.querySelector('.services-section')
      const teamSection = document.querySelector('.team-section')

      const sections = [
        { name: 'hero', element: heroSection },
        { name: 'approach', element: approachSection },
        { name: 'image-grid', element: imageGridSection },
        { name: 'services', element: servicesSection },
        { name: 'team', element: teamSection }
      ]

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (!section.element) continue

        const rect = section.element.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY
        
        if (scrollPosition >= elementTop) {
          activeSection = section.name
          break
        }
      }

      setCurrentSection(activeSection)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  // Trigger slide-down animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const getNavItemStyles = (navItem) => {
    if (currentSection === 'hero') {
      return { opacity: 1, color: '#245148' }
    }
    
    if (navItem.section === 'approach' && currentSection === 'image-grid') {
      return { opacity: 1, color: '#245148' } // Brand color for active
    }
    
    if (!navItem.section) {
      return { opacity: 0.25, color: '#245148' }
    }
    
    const isActive = currentSection === navItem.section
    return { 
      opacity: isActive ? 1 : 0.25, 
      color: isActive ? '#245148' : '#245148' // Brand color for active, normal color for inactive
    }
  }

  return (
    <>
      {/* Hamburger Button - Fixed position, always on top, animates to X */}
      <button 
        data-nav-intro
        className={`nav-hamburger ${isMobileMenuOpen ? 'nav-hamburger--open' : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <span className="nav-hamburger-line"></span>
        <span className="nav-hamburger-line"></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`nav-mobile-menu ${isMobileMenuOpen ? 'nav-mobile-menu--open' : ''}`}>
        {navItems.map((navItem, index) => (
          <Link 
            key={index}
            href={navItem.href} 
            className="nav-link"
            onClick={(e) => handleMobileNavClick(e, navItem.href, navItem.section)}
          >
            {navItem.label}
          </Link>
        ))}
        <button 
          onClick={() => {
            setIsMobileMenuOpen(false)
            setIsContactModalOpen(true)
          }}
          className="nav-link"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Contact
        </button>
        <button 
          className="locale-button"
        >
          <span style={{ opacity: 1 }}>en</span>
          <span style={{ opacity: .25 }}> jp</span>
        </button>
      </div>

      {/* Primary Navigation - Scrolls with page */}
      <nav 
        className={`navigation ${hasLoaded ? 'navigation--loaded' : ''} navigation--${currentSection} ${currentSection}-section-scroll`}
        style={{
          backgroundColor: 'transparent',
          position: 'absolute',
          opacity: showSecondaryNav ? 0 : 1,
          visibility: showSecondaryNav ? 'hidden' : 'visible',
          pointerEvents: showSecondaryNav ? 'none' : 'auto',
          transition: 'all 0.2s ease, visibility 0.2s ease'
        }}
      >
        <div className="nav-container">
          <div className="nav-left" data-nav-intro="nav-left">
            {globalSettings?.navigation?.headerNav ? (
              globalSettings.navigation.headerNav.map((item, index) => (
                <Link 
                  key={index}
                  href={item.link || '#'} 
                  className="nav-link"
                  target={item.openInNewTab ? '_blank' : '_self'}
                  rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                  style={{
                    ...getNavItemStyles({ section: null }),
                    transition: 'all 0.3s ease'
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
                      ...getNavItemStyles(navItem),
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {navItem.label}
                  </Link>
                ))}
              </>
            )}
          </div>
          
          <div className="nav-center" data-nav-intro="nav-center">
            {globalSettings?.logoSettings?.primaryLogo?.asset?._ref ? (
              <button 
                onClick={handleLogoClick}
                className="nav-logo-link nav-logo-primary"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Image
                  src={urlFor(globalSettings.logoSettings.primaryLogo).url()}
                  alt={globalSettings.logoSettings.primaryLogo.alt || 'Templeton Research'}
                  width={180}
                  height={60}
                  className="nav-logo-image"
                  priority
                />
              </button>
            ) : (
              <button 
                onClick={handleLogoClick}
                className="nav-logo nav-logo-primary"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <span className="logo-text" style={{ color: '#245148' }}>TEMPLETON</span>
                <span className="logo-subtext" style={{ color: '#245148' }}>RESEARCH</span>
              </button>
            )}
          </div>

          <div className="nav-right" data-nav-intro="nav-right">
       
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 1,
                transition: 'all 0.3s ease',
                marginLeft: '1.5rem',
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: 'var(--step-1)',
                fontWeight: '400',
                color: '#245148',
                textDecoration: 'none'
              }}
            >
              Contact
            </button>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation - Fixed, slides down using top position for iOS compatibility */}
      <nav 
        className={`navigation navigation--scrolled navigation--${currentSection} ${currentSection}-section-scroll`}
        style={{
          backgroundColor: '#f5f5f0',
          position: 'fixed',
          top: showSecondaryNav ? 0 : -60,
          left: 0,
          right: 0,
          zIndex: 50,
          opacity: showSecondaryNav ? 1 : 0,
          transition: 'top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Hamburger for Secondary Nav */}
        <button 
          className={`nav-hamburger ${isMobileMenuOpen ? 'nav-hamburger--open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="nav-hamburger-line"></span>
          <span className="nav-hamburger-line"></span>
        </button>

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
                    ...getNavItemStyles({ section: null }),
                    transition: 'all 0.3s ease'
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
                      ...getNavItemStyles(navItem),
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {navItem.label}
                  </Link>
                ))}
              </>
            )}
          </div>
          
          <div className="nav-center">
            <button 
              onClick={handleLogoClick}
              className="nav-logo nav-logo-secondary"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
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
                  <path d="M100.09,227.87v-.5c.514,0,1.007-.257,1.318-.688.366-.505.435-1.186.194-1.915l-.013-.078V30.73c0-1.035-1.055-2.09-2.09-2.09H2.59c-1.035,0-2.09,1.055-2.09,2.09s1.055,2.09,2.09,2.09h95.4v192.45c0,1.035,1.055,2.09,2.09,2.09v.5c-1.307,0-2.59-1.283-2.59-2.59V33.32H2.59c-1.307,0-2.59-1.283-2.59-2.59s1.283-2.59,2.59-2.59h96.91c1.307,0,2.59,1.283,2.59,2.59v193.92c.276.871.179,1.695-.276,2.325-.405.561-1.049.895-1.724.895Z" fill="currentColor"></path>
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
            </button>
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
                transition: 'all 0.3s ease',
                marginLeft: '1.5rem',
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: 'var(--step-1)',
                fontWeight: '400',
                color: '#245148',
                textDecoration: 'none'
              }}
            >
              Contact
            </button>
            
          </div>
        </div>
      </nav>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => { setIsContactModalOpen(false); setContactService(null) }} 
        service={contactService}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        aboutData={aboutData}
      />
    </>
  )
}