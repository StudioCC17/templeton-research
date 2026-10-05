// components/Navigation.js
// Fixed: Two separate navs - primary scrolls, secondary slides down
// Added: Mobile hamburger menu
// Added: About us nav item opens a slide-up modal (AboutModal) instead of scrolling
// Added: listens for 'open-contact-modal' so the footer can open the contact modal
// iOS fix: Using top position instead of transform for better compatibility

'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import ContactModal from '@/components/ContactModal'
import AboutModal from '@/components/AboutModal'
import Arrow from '@/components/Arrow'

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
  // A service is open in the Services section: show the sticky header in green with cream text
  const [servicesOpen, setServicesOpen] = useState(false)
  useEffect(() => {
    const onServices = (e) => setServicesOpen(!!e.detail?.open)
    window.addEventListener('services-detail', onServices)
    return () => window.removeEventListener('services-detail', onServices)
  }, [])
  // Only go green while the header is actually over the Services section -
  // scroll away (with a service still open) and it fades back to cream
  const [overServices, setOverServices] = useState(false)
  useEffect(() => {
    if (!servicesOpen) { setOverServices(false); return }
    const check = () => {
      const el = document.getElementById('services')
      if (!el) return
      const r = el.getBoundingClientRect()
      const line = 60 // roughly the sticky header's height
      setOverServices(r.top <= line && r.bottom > line)
    }
    // On open the page is gliding up to the section, so go green straight away
    // (in step with the scroll) and only start checking once it has arrived
    setOverServices(true)
    const start = setTimeout(() => {
      check()
      window.addEventListener('scroll', check, { passive: true })
      window.addEventListener('resize', check)
    }, 900)
    return () => {
      clearTimeout(start)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [servicesOpen])
  const headerInverse = servicesOpen && overServices
  const showSticky = showSecondaryNav || headerInverse

  // Each time the sticky header slides in, its logo lines draw themselves in from
  // the centre outwards: the inner pair first, then the middle, then the outer pair.
  // Resets when the header goes away, so it replays next time.
  const stickyLogoRef = useRef(null)
  useEffect(() => {
    const svg = stickyLogoRef.current
    if (!svg) return
    const paths = Array.from(svg.querySelectorAll('path'))
    // Dash each line by its real length, so it can draw from its start to its end
    paths.forEach((p) => {
      const len = Math.ceil(p.getTotalLength()) + 2
      p.style.strokeDasharray = `${len}`
      p.dataset.len = len
    })
    gsap.killTweensOf(paths)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paths.forEach((p) => { p.style.strokeDashoffset = '0' })
      return
    }
    if (!showSticky) {
      paths.forEach((p) => { p.style.strokeDashoffset = p.dataset.len }) // hidden, ready to draw
      return
    }
    paths.forEach((p) => { p.style.strokeDashoffset = p.dataset.len })
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 0.75,
      ease: 'power3.inOut',
      delay: 0.05, // starts almost as soon as the header arrives
      // pairs: (0,1) centre, (2,3) middle, (4,5) outer
      stagger: (i) => Math.floor(i / 2) * 0.1,
    })
  }, [showSticky])


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

  // Footer "About" link opens the About modal
  useEffect(() => {
    const openAbout = () => setIsAboutModalOpen(true)
    window.addEventListener('open-about-modal', openAbout)
    return () => window.removeEventListener('open-about-modal', openAbout)
  }, [])

  // Define nav items
  const navItems = [
    { label: 'About', href: '#approach', section: 'approach' },
    { label: 'Services', href: '#services', section: 'services' },
    { label: 'Team', href: '#team', section: 'team' },
    { label: 'Insights', href: '#insights', section: 'insights' }
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
    } else if (section === 'insights' || section === 'careers') {
      targetElement = document.getElementById(section)
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
    // Page position (works for sections nested inside others, e.g. Careers inside Team)
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset
    
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
        { name: 'team', element: teamSection },
        { name: 'careers', element: document.getElementById('careers') },
        { name: 'insights', element: document.getElementById('insights') }
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
      return { opacity: 1, color: 'var(--color-green)' }
    }
    
    if (navItem.section === 'approach' && currentSection === 'image-grid') {
      return { opacity: 1, color: 'var(--color-green)' } // Brand color for active
    }
    
    if (!navItem.section) {
      return { opacity: 0.25, color: 'var(--color-green)' }
    }
    
    const isActive = currentSection === navItem.section
    return { 
      opacity: isActive ? 1 : 0.25, 
      color: isActive ? 'var(--color-green)' : 'var(--color-green)' // Brand color for active, normal color for inactive
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
          Contact Us
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
          opacity: showSticky ? 0 : 1,
          visibility: showSticky ? 'hidden' : 'visible',
          pointerEvents: showSticky ? 'none' : 'auto',
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
                <span className="logo-text" style={{ color: 'var(--color-green)' }}>TEMPLETON</span>
                <span className="logo-subtext" style={{ color: 'var(--color-green)' }}>RESEARCH</span>
              </button>
            )}
          </div>

          <div className="nav-right" data-nav-intro="nav-right">
       
            {/* Contact: outlined red button with arrow - styled in globals.css (.nav-contact) */}
            <button 
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="nav-contact"
            >
              Contact Us
<Arrow className="nav-contact-arrow" />
            </button>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation - Fixed, slides down using top position for iOS compatibility */}
      <nav 
        className={`navigation navigation--scrolled navigation--${currentSection} ${currentSection}-section-scroll${headerInverse ? ' navigation--inverse' : ''}`}
        style={{
          backgroundColor: headerInverse ? 'var(--color-green)' : 'var(--color-cream)',
          position: 'fixed',
          top: showSticky ? 0 : -60,
          left: 0,
          right: 0,
          zIndex: 100, // above section content (e.g. the open service panel); below full-screen overlays
          opacity: showSticky ? 1 : 0,
          transition: 'top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), ' + (headerInverse ? 'background-color 0.5s cubic-bezier(0.65, 0, 0.35, 1), border-color 0.5s cubic-bezier(0.65, 0, 0.35, 1)' : 'background-color 0.4s ease, border-color 0.4s ease'), // opening in step with the services scroll; closing quick
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
              {/* Sticky-header logo drawn as strokes (same shape as the filled logo) so the
                  lines can draw themselves in - see the effect near the top */}
              <svg 
                ref={stickyLogoRef}
                viewBox="0 0 283.05 227.86" 
                className="nav-logo-svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.68"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  width: '60px',
                  height: '30px', // breathing room above and below in the header
                  overflow: 'visible'
                }}
              >
                {/* inner pair first in the DOM: drawn centre-out, each from its foot up then outwards */}
                <path d="M127.8 225.27V2.59H2.59" />
                <path d="M155.54 225.27V2.59H280.47" />
                <path d="M99.79 225.27V30.73H2.59" />
                <path d="M183.56 225.27V30.73H280.47" />
                <path d="M72.06 225.27V58.85H2.59" />
                <path d="M211 225.27V58.85H280.47" />
              </svg>
            </button>
          </div>

          <div className="nav-right">
    
            {/* Contact: outlined red button with arrow - styled in globals.css (.nav-contact) */}
            <button 
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="nav-contact"
            >
              Contact Us
<Arrow className="nav-contact-arrow" />
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