// components/ApproachSection.js
// Fixed: Using your original working structure with smooth text animations

'use client'

import { useState, useRef, useEffect } from 'react'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function ApproachSection({ approachData }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevActiveIndex, setPrevActiveIndex] = useState(0)
  const sectionRef = useRef(null)
  const contentSectionRefs = useRef([])
  const scrollTriggerInstance = useRef(null)

  // Navigation animations
  useEffect(() => {
    const approaches = approachData?.approaches || []
    if (!window.gsap || approaches.length === 0) return
    
    const newActiveTitleElement = document.querySelector(`.approach-title-${activeIndex}`)
    const newActiveArrowElement = document.querySelector(`.approach-arrow-${activeIndex}`)
    
    if (newActiveTitleElement) {
      window.gsap.to(newActiveTitleElement, {
        opacity: 1,
        paddingLeft: '2rem',
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
    
    if (prevActiveIndex !== activeIndex) {
      const prevActiveTitleElement = document.querySelector(`.approach-title-${prevActiveIndex}`)
      const prevActiveArrowElement = document.querySelector(`.approach-arrow-${prevActiveIndex}`)
      
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
  }, [activeIndex, approachData, prevActiveIndex])

  // ScrollTrigger with discrete section changes
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return

    const approaches = approachData?.approaches || []
    if (approaches.length === 0) return

    window.gsap.registerPlugin(window.ScrollTrigger)

    if (scrollTriggerInstance.current) {
      scrollTriggerInstance.current.kill()
      scrollTriggerInstance.current = null
    }

    const baseScrollDistance = approaches.length * window.innerHeight * 0.8

    try {
      scrollTriggerInstance.current = window.ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${baseScrollDistance}px`,
        pin: true,
        anticipatePin: 1,
        pinSpacing: true,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress
          
          // Create discrete sections with buffer zones
          const totalSections = approaches.length
          const sectionSize = 1 / totalSections
          let newActiveIndex = 0
          
          // Find which section we're in with 20% buffer zones
          for (let i = 0; i < totalSections; i++) {
            const sectionStart = i * sectionSize
            const sectionEnd = (i + 1) * sectionSize
            const bufferSize = sectionSize * 0.2 // 20% buffer
            
            if (progress >= sectionStart + bufferSize && progress < sectionEnd - bufferSize) {
              newActiveIndex = i
              break
            } else if (progress >= sectionEnd - bufferSize) {
              newActiveIndex = Math.min(i + 1, totalSections - 1)
            }
          }
          
          // Only trigger change when section actually changes
          if (newActiveIndex !== activeIndex) {
            console.log(`Section changing from ${activeIndex} to ${newActiveIndex}`)
            setActiveIndex(newActiveIndex)
            
            // Animate to new section
            animateToSection(newActiveIndex, totalSections)
          }
        }
      })

      // Initialize first section - do this only once
      if (activeIndex === 0) {
        setTimeout(() => {
          console.log('INITIALIZATION: Showing first section')
          animateToSection(0, approaches.length)
        }, 100)
      }

    } catch (error) {
      console.error('Approach ScrollTrigger failed:', error)
    }

    return () => {
      if (scrollTriggerInstance.current) {
        scrollTriggerInstance.current.kill()
        scrollTriggerInstance.current = null
      }
    }
  }, [approachData, activeIndex])

  // Animate to specific section - Clean, conflict-free animation
  const animateToSection = (targetIndex, totalSections) => {
    console.log(`=== ANIMATING TO SECTION ${targetIndex} of ${totalSections} ===`)
    
    const allImageContainers = document.querySelectorAll('.approach-stacking-image')
    const allTextContainers = document.querySelectorAll('.approach-text-container')
    
    // STEP 1: Kill ALL existing animations to prevent conflicts
    allTextContainers.forEach(container => {
      window.gsap.killTweensOf(container)
      // Clear any CSS transitions that might interfere
      container.style.transition = 'none'
    })
    allImageContainers.forEach(img => {
      window.gsap.killTweensOf(img)
    })
    
    // STEP 2: Fade out all images except target
    allImageContainers.forEach((img, index) => {
      if (index !== targetIndex && img.style.opacity !== '0') {
        window.gsap.to(img, {
          opacity: 0,
          y: 30,
          duration: 0.2,
          ease: "power1.out",
          onComplete: () => {
            img.style.visibility = 'hidden'
          }
        })
      } else if (index !== targetIndex) {
        // Hide non-visible images immediately
        window.gsap.set(img, { 
          opacity: 0, 
          y: 30,
          visibility: 'hidden'
        })
      }
    })
    
    // STEP 3: Handle text transitions
    const targetContainer = contentSectionRefs.current[targetIndex]
    
    // Fade out all text containers except target
    allTextContainers.forEach((container, index) => {
      if (index !== targetIndex && container.style.visibility === 'visible') {
        window.gsap.to(container, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.out",
          onComplete: () => {
            container.style.visibility = 'hidden'
          }
        })
      } else if (index !== targetIndex) {
        // Immediately hide non-visible containers
        container.style.visibility = 'hidden'
        container.style.opacity = '0'
      }
    })
    
    // STEP 4: Show target text after fade out
    if (targetContainer) {
      // Set initial state
      window.gsap.set(targetContainer, { 
        visibility: 'visible', 
        zIndex: 200,
        opacity: 0
      })
      
      // Fade in target text
      window.gsap.to(targetContainer, {
        opacity: 1,
        duration: 0.2,
        ease: "power1.out",
        delay: 0.25 // Slightly longer than fade out to ensure smooth crossfade
      })
      
      console.log(`✅ SHOWING text container ${targetIndex}`)
    }
    
    // STEP 5: Show target image with improved timing
    const targetImage = allImageContainers[targetIndex]
    if (targetImage) {
      window.gsap.set(targetImage, { visibility: 'visible' })
      window.gsap.to(targetImage, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.3 // Slightly longer delay to allow image fade-out
      })
      console.log(`✅ SHOWING image ${targetIndex}`)
    }
  }

  if (!approachData?.approaches || approachData.approaches.length === 0) {
    return null
  }

  return (
    <>
      <section 
        ref={sectionRef}
        className="approach-section"
        style={{ 
          backgroundColor: '#f5f5f0',
          minHeight: '100vh'
        }}
      >
        <div 
          style={{ 
      
            margin: '0 auto', 
            padding: '0 25px',
            height: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            alignItems: 'start',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              left: '50%',
              top: '60px',
              bottom: '23px',
              width: '1px',
              backgroundColor: '#245148',
              transform: 'translateX(-50%)',
              zIndex: 1
            }} 
          />
          
          <div 
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              padding: '4rem 0',
              height: '100vh',
              justifyContent: 'space-between'
            }}
          >
            <div 
              className="approach-nav-list"
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}
            >
              {approachData.approaches.map((approach, index) => (
                <div
                  key={`${approach._key || index}-${activeIndex}`}
                  className="approach-nav-item"
                  style={{
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <span 
                    className={`approach-nav-arrow approach-arrow-${index} ${index === activeIndex ? 'approach-nav-arrow--active' : ''}`}
                    style={{
                      position: 'absolute',
                      left: '0',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#245148',
                      fontSize: '1.5rem',
                      fontWeight: '300',
                      pointerEvents: 'none',
                      paddingRight: '10px',
                      fontFamily: 'var(--font-body), var(--font-fallback)',
                      width: '55.2px',
                      height: '48.3px'
                    }}
                  >
                    <svg 
                      width="96" 
                      height="96" 
                      viewBox="24 0 72 96"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        display: 'block'
                      }}
                    >
                      <g transform="translate(24, 60)">
                        <path d="M3.36-11.04Q2.69-11.38 2.69-12 2.69-12.62 3.36-12.96L3.36-12.96 40.08-12.96Q36.67-15.5 34.8-19.1L34.8-19.1Q33.6-21.41 33.22-23.66L33.22-23.66Q33.22-23.76 33.19-23.86 33.17-23.95 33.17-24L33.17-24Q33.17-24.53 34.13-24.53L34.13-24.53Q34.7-24.53 34.87-24.41 35.04-24.29 35.14-23.86L35.14-23.86Q35.28-22.9 35.66-21.89L35.66-21.89Q36.72-18.67 39.17-16.15 41.62-13.63 44.88-12.53L44.88-12.53Q45.31-12.38 45.31-12 45.31-11.62 44.88-11.47L44.88-11.47Q41.62-10.37 39.17-7.85 36.72-5.33 35.66-2.11L35.66-2.11Q35.33-1.1 35.14-0.19L35.14-0.19Q35.04 0.29 34.87 0.41 34.7 0.53 34.13 0.53L34.13 0.53Q33.12 0.53 33.12 0L33.12 0Q33.12-0.14 33.41-1.2L33.41-1.2Q34.9-7.2 40.08-11.04L40.08-11.04 3.36-11.04Z" fill="#245148" stroke="#245148" strokeWidth="0.5"/>
                      </g>
                    </svg>
                  </span>
                  
                  <h2
                    className={`approach-nav-title approach-title-${index}`}
                    style={{
                      fontFamily: 'var(--font-heading), serif',
                      fontSize: '3.5rem',
                      fontWeight: '300',
                      lineHeight: '1',
                      letterSpacing: '-0.01em',
                      color: '#245148',
                      margin: '0'
                    }}
                  >
                    {approach.title}
                  </h2>
                </div>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div 
            style={{ 
              padding: '4rem 0',
              height: '100vh',
              position: 'relative',
              paddingBottom: '0rem'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                bottom: '4rem',
                left: '25px',
                right: '10px',
                height: '60vh',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}
            >
              {/* Images container */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-40vh',
                  left: 0,
                  right: 0,
                  height: '40vh'
                }}
              >
                {approachData.approaches.map((approach, index) => (
                  approach.image && (
                    <div 
                      key={`image-${approach._key || index}`}
                      className={`approach-stacking-image approach-stacking-image-${index}`}
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        opacity: 0,
                        transform: 'translateY(30px)',
                        maxWidth: '60%'
                      }}
                    >
                      <Image
                        src={urlFor(approach.image).url()}
                        alt={approach.image.alt || approach.title}
                        width={500}
                        height={300}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
                  )
                ))}
              </div>

              {/* Text container */}
              {approachData.approaches.map((approach, index) => (
                <div 
                  key={approach._key || index}
                  ref={el => contentSectionRefs.current[index] = el}
                  className="approach-text-container"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    opacity: 0,
                    visibility: 'hidden'
                  }}
                >
                  {approach.description && (
                    <PortableText 
                      value={approach.description}
                      components={{
                        block: {
                          normal: ({children}) => (
                            <p 
                              className="approach-stacking-paragraph"
                              style={{
                                fontFamily: 'var(--font-body), var(--font-fallback)',
                                fontSize: '1.1rem',
                                fontWeight: '400',
                                lineHeight: '1.5',
                                color: '#245148',
                                margin: '0 0 0rem 0',
                                position: 'relative',
                                pointerEvents: 'auto'
                              }}
                            >{children}</p>
                          ),
                        },
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .approach-nav-title {
          opacity: 0.4;
          padding-left: 0;
        }
        
        .approach-nav-title[data-active="true"] {
          opacity: 1;
          padding-left: 2rem;
        }
        
        .approach-nav-arrow {
          opacity: 0;
        }
        
        .approach-nav-arrow--active {
          opacity: 1;
        }

        .approach-text-container {
          transition: opacity 0.3s ease;
        }
      `}</style>
    </>
  )
}