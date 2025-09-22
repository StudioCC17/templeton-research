// components/ServicesSection.js
// FIXED: Removed services header, moved nav list up, removed inline font styles from h2
// Updated with new arrow SVG

'use client'

import { useState, useRef, useEffect } from 'react'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function ServicesSection({ servicesData }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevActiveIndex, setPrevActiveIndex] = useState(0)
  const [sectionHeights, setSectionHeights] = useState([])
  const [cumulativeHeights, setCumulativeHeights] = useState([])
  const sectionRef = useRef(null)
  const contentContainerRef = useRef(null)
  const contentSectionRefs = useRef([])
  const scrollTriggerInstance = useRef(null)
  const activeIndexRef = useRef(0) // Track active index with ref to avoid stale closures

  // Navigation animations like ApproachSection
  useEffect(() => {
    const services = servicesData?.services || []
    if (!window.gsap || services.length === 0) return
    
    // Animate the new active title IN
    const newActiveTitleElement = document.querySelector(`.service-title-${activeIndex}`)
    const newActiveArrowElement = document.querySelector(`.service-arrow-${activeIndex}`)
    
    if (newActiveTitleElement) {
      window.gsap.to(newActiveTitleElement, {
        opacity: 1,
        paddingLeft: '1.5rem',
        duration: 0.4,
        ease: "power2.out"
      })
    }
    if (newActiveArrowElement) {
      window.gsap.to(newActiveArrowElement, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      })
    }
    
    // Animate the previous active title OUT
    if (prevActiveIndex !== activeIndex) {
      const prevActiveTitleElement = document.querySelector(`.service-title-${prevActiveIndex}`)
      const prevActiveArrowElement = document.querySelector(`.service-arrow-${prevActiveIndex}`)
      
      if (prevActiveTitleElement) {
        window.gsap.to(prevActiveTitleElement, {
          opacity: 0.4,
          paddingLeft: '0',
          duration: 0.4,
          ease: "power2.out"
        })
      }
      if (prevActiveArrowElement) {
        window.gsap.to(prevActiveArrowElement, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        })
      }
    }
    
    setPrevActiveIndex(activeIndex)
    
  }, [activeIndex, servicesData, prevActiveIndex])

  // Height measurement system
  useEffect(() => {
    console.log('Height measurement useEffect called')
    
    const measureOnce = () => {
      console.log('measureOnce called, current sectionHeights.length:', sectionHeights.length)
      
      if (sectionHeights.length > 0) {
        console.log('Heights already measured, returning')
        return
      }
      
      console.log('contentSectionRefs.current:', contentSectionRefs.current.length)
      
      const heights = []
      const cumulative = [0]
      
      contentSectionRefs.current.forEach((ref, index) => {
        if (ref) {
          ref.style.height = 'auto'
          const naturalHeight = ref.scrollHeight
          console.log(`Section ${index} height:`, naturalHeight)
          heights.push(naturalHeight)
          
          if (index > 0) {
            cumulative.push(cumulative[index - 1] + heights[index - 1])
          }
        } else {
          console.log(`Section ${index} ref is null`)
        }
      })
      
      console.log('Final heights:', heights)
      console.log('Final cumulative:', cumulative)
      
      if (heights.length > 0) {
        setSectionHeights(heights)
        setCumulativeHeights(cumulative)
      }
    }

    const timer = setTimeout(measureOnce, 500)
    
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setTimeout(measureOnce, 200)
      })
    }

    return () => clearTimeout(timer)
  }, [servicesData])

  // ScrollTrigger with improved activeIndex calculation + viewport offset
  useEffect(() => {
    console.log('ScrollTrigger useEffect called:', {
      hasGsap: !!window.gsap,
      hasScrollTrigger: !!window.ScrollTrigger,
      sectionHeightsLength: sectionHeights.length,
      servicesLength: servicesData?.services?.length || 0
    })
    
    if (!window.gsap || !window.ScrollTrigger || sectionHeights.length === 0) {
      console.log('ScrollTrigger useEffect early return:', {
        hasGsap: !!window.gsap,
        hasScrollTrigger: !!window.ScrollTrigger,
        sectionHeightsLength: sectionHeights.length
      })
      return
    }
    
    if (scrollTriggerInstance.current) {
      console.log('Killing existing ScrollTrigger')
      scrollTriggerInstance.current.kill()
      scrollTriggerInstance.current = null
    }

    const services = servicesData?.services || []
    if (services.length === 0) {
      console.log('No services found, returning')
      return
    }

    window.gsap.registerPlugin(window.ScrollTrigger)

    const totalContentHeight = sectionHeights.reduce((sum, height) => sum + height, 0)
    const viewportHeight = window.innerHeight
    const extraScrollDistance = viewportHeight * 0.6
    const scrollDistance = Math.max(totalContentHeight - viewportHeight + extraScrollDistance, services.length * viewportHeight)

    console.log('Pre-ScrollTrigger calculations:', {
      totalContentHeight,
      viewportHeight, 
      extraScrollDistance,
      scrollDistance,
      sectionRef: sectionRef.current
    })

    try {
      scrollTriggerInstance.current = window.ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${scrollDistance}px`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        pinSpacing: true,
        refreshPriority: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress
          
          // FIXED: Improved activeIndex calculation with ref tracking + viewport offset
          if (contentContainerRef.current && sectionHeights.length > 0) {
            const currentScrollPos = progress * totalContentHeight
            
            // IMPROVEMENT: Add viewport offset so sections activate when halfway visible
            const viewportHeight = window.innerHeight
            const viewportOffset = viewportHeight * 0.5 // 50% of viewport height
            const adjustedScrollPos = currentScrollPos + viewportOffset
            
            // Calculate which section should be active
            let newActiveIndex = 0
            
            // Simple approach: find the section that contains the adjusted scroll position
            for (let i = services.length - 1; i >= 0; i--) {
              const sectionStart = cumulativeHeights[i] || 0
              
              if (adjustedScrollPos >= sectionStart) {
                newActiveIndex = i
                break
              }
            }
            
            console.log(`ScrollPos: ${currentScrollPos.toFixed(2)}, adjustedPos: ${adjustedScrollPos.toFixed(2)}, calculated index: ${newActiveIndex}, current activeIndexRef: ${activeIndexRef.current}`)
            
            // Only update when there's an actual change AND avoid rapid updates
            if (newActiveIndex !== activeIndexRef.current) {
              console.log(`ActiveIndex changing: ${activeIndexRef.current} -> ${newActiveIndex}`)
              activeIndexRef.current = newActiveIndex
              setActiveIndex(newActiveIndex)
            }

            // Smooth content scrolling (unchanged - uses original scroll position)
            const translateY = -currentScrollPos
            window.gsap.set(contentContainerRef.current, {
              y: `${translateY}px`
            })
          }
        }
      })

    } catch (error) {
      console.error('Services ScrollTrigger creation failed:', error)
    }

    return () => {
      if (scrollTriggerInstance.current) {
        scrollTriggerInstance.current.kill()
        scrollTriggerInstance.current = null
      }
    }
  }, [sectionHeights, cumulativeHeights, servicesData])

  if (!servicesData?.services || servicesData.services.length === 0) {
    return null
  }

  return (
    <section 
      ref={sectionRef}
      className="services-section"
      style={{ 
        backgroundColor: '#f5f5f0',
        minHeight: '100vh'
      }}
    >
      <div 
        className="services-container"
        style={{ 
         
          margin: '0 auto', 
         
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          alignItems: 'start',
          position: 'relative'
        }}
      >
        <div 
          className="services-divider"
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: '#245148',
            transform: 'translateX(-50%)',
            zIndex: 1
          }} 
        />
        
        {/* FIXED: Removed services header, moved nav list up to replace it */}
        <div 
          className="services-navigation"
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            padding: '4rem 0',
            height: '100vh',
            justifyContent: 'flex-start'
          }}
        >
          <div 
            className="services-nav-list"
            style={{ 
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {servicesData.services.map((service, index) => (
              <div
                key={service._key || index}
                className="service-nav-item"
                style={{
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (scrollTriggerInstance.current && sectionHeights.length > 0) {
                    const scrollTrigger = scrollTriggerInstance.current
                    const triggerStart = scrollTrigger.start
                    const triggerEnd = scrollTrigger.end
                    const scrollDistance = triggerEnd - triggerStart
                    const totalContentHeight = sectionHeights.reduce((sum, height) => sum + height, 0)
                    
                    // Calculate the exact start position using cumulativeHeights
                    const targetScrollPos = cumulativeHeights[index] || 0
                    const targetProgress = targetScrollPos / totalContentHeight
                    let targetPageScroll = triggerStart + (targetProgress * scrollDistance)
                    
                    // Clamp to valid scroll range
                    targetPageScroll = Math.max(triggerStart, Math.min(targetPageScroll, triggerEnd - window.innerHeight))
                    
                    window.scrollTo({
                      top: targetPageScroll,
                      behavior: 'smooth'
                    })
                  }
                }}
              >
                <span 
                  className={`service-nav-arrow service-arrow-${index} ${index === activeIndex ? 'service-nav-arrow--active' : ''}`}
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#245148',
                    opacity: index === activeIndex ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                    paddingRight: '10px',
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    width: '41.4px',
                    height: '36.23px'
                  }}
                >
                  <svg 
                    width="72" 
                    height="72" 
                    viewBox="24 0 72 96"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      display: 'block'
                    }}
                  >
                    <g transform="translate(24, 60)">
                      <path d="M3.36-11.04Q2.69-11.38 2.69-12 2.69-12.62 3.36-12.96L3.36-12.96 40.08-12.96Q36.67-15.5 34.8-19.1L34.8-19.1Q33.6-21.41 33.22-23.66L33.22-23.66Q33.22-23.76 33.19-23.86 33.17-23.95 33.17-24L33.17-24Q33.17-24.53 34.13-24.53L34.13-24.53Q34.7-24.53 34.87-24.41 35.04-24.29 35.14-23.86L35.14-23.86Q35.28-22.9 35.66-21.89L35.66-21.89Q36.72-18.67 39.17-16.15 41.62-13.63 44.88-12.53L44.88-12.53Q45.31-12.38 45.31-12 45.31-11.62 44.88-11.47L44.88-11.47Q41.62-10.37 39.17-7.85 36.72-5.33 35.66-2.11L35.66-2.11Q35.33-1.1 35.14-0.19L35.14-0.19Q35.04 0.29 34.87 0.41 34.7 0.53 34.13 0.53L34.13 0.53Q33.12 0.53 33.12 0L33.12 0Q33.12-0.14 33.41-1.2L33.41-1.2Q34.9-7.2 40.08-11.04L40.08-11.04 3.36-11.04Z" fill="#245148" stroke="#245148" strokeWidth="0.75"/>
                    </g>
                  </svg>
                </span>
                
                {/* FIXED: Removed scaling effects and other unwanted animations */}
                <h2
                  className={`service-nav-title service-title-${index} section-headline ${index === activeIndex ? 'service-nav-title--active' : ''}`}
                  style={{
                    opacity: index === activeIndex ? 1 : 0.4,
                    margin: '0',
                    paddingLeft: index === activeIndex ? '1.5rem' : '0',
                    transition: 'all 0.4s ease'
                  }}
                >
                  {service.title}
                </h2>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="services-content"
          style={{ 
            padding: '4rem 0',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            ref={contentContainerRef}
            className="services-content-container"
            style={{
              position: 'relative',
              height: sectionHeights.length > 0 ? `${sectionHeights.reduce((sum, height) => sum + height, 0) + (sectionHeights.length * 48)}px` : 'auto',
              willChange: 'transform'
            }}
          >
            {servicesData.services.map((service, index) => (
              <div 
                key={service._key || index}
                ref={el => {
                  contentSectionRefs.current[index] = el
                }}
                className="service-content-section"
                style={{
                  position: 'absolute',
                  top: cumulativeHeights[index] ? `${cumulativeHeights[index]}px` : `${index * 400}px`,
                  left: 0,
                  right: 0,
                  padding: '1rem 0',
                  paddingBottom: index === servicesData.services.length - 1 ? '8rem' : '2rem',
                  marginBottom: '3rem',
                  opacity: index === activeIndex ? 1 : 0.4,
                  transition: 'opacity 0.4s ease'
                }}
              >
                {service.description && (
                  <div 
                    className="service-description"
                    style={{ marginBottom: '2rem', flex: 1 }}
                  >
                    <PortableText 
                      value={service.description}
                      components={{
                        block: {
                          normal: ({children}) => (
                            <p className="service-paragraph">{children}</p>
                          ),
                          h3: ({children}) => (
                            <h3 
                              className="service-subheading"
                              style={{
                                fontFamily: 'var(--font-heading), serif',
                                fontSize: '1.5rem',
                                fontWeight: '300',
                                color: '#245148',
                                margin: '1.5rem 0 1rem 0'
                              }}
                            >{children}</h3>
                          ),
                          h4: ({children}) => (
                            <h4 
                              className="service-small-heading"
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                color: '#245148',
                                margin: '1.25rem 0 0.75rem 0'
                              }}
                            >{children}</h4>
                          ),
                        },
                        list: {
                          bullet: ({children}) => (
                            <ul 
                              className="service-list"
                              style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}
                            >{children}</ul>
                          ),
                          number: ({children}) => (
                            <ol 
                              className="service-list service-list--numbered"
                              style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}
                            >{children}</ol>
                          ),
                        },
                        listItem: {
                          bullet: ({children}) => (
                            <li 
                              className="service-list-item"
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1.1rem',
                                color: '#245148',
                                marginBottom: '0.5rem',
                                lineHeight: '1.6'
                              }}
                            >{children}</li>
                          ),
                          number: ({children}) => (
                            <li 
                              className="service-list-item"
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1.1rem',
                                color: '#245148',
                                marginBottom: '0.5rem',
                                lineHeight: '1.6'
                              }}
                            >{children}</li>
                          ),
                        },
                      }}
                    />
                  </div>
                )}

                {service.image && (
                  <div 
                    className="service-image-container"
                    style={{ marginTop: 'auto' }}
                  >
                    <Image
                      src={urlFor(service.image).url()}
                      alt={service.image.alt || service.title}
                      width={500}
                      height={300}
                      className="service-image"
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    {service.imageCaption && (
                      <p 
                        className="service-image-caption"
                        style={{
                          fontFamily: 'var(--font-body), var(--font-fallback)',
                          fontSize: '0.875rem',
                          color: '#666',
                          marginTop: '0.5rem',
                          fontStyle: 'italic'
                        }}
                      >
                        {service.imageCaption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}