// components/HeroSection.js
// Updated with sequential animation: preheader first, then line-by-line headlines
// Zoom effect removed
// Text centered both horizontally and vertically

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function HeroSection({ 
  heroData, 
  defaultPreheader = '', 
  defaultHeadline = '',
  className = 'hero-section' 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreheader, setShowPreheader] = useState(false)
  const [showHeadlines, setShowHeadlines] = useState(false)
  const [headlineLines, setHeadlineLines] = useState([])
  const [scrollOpacity, setScrollOpacity] = useState(1)
  
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  
  const mediaType = heroData?.mediaType || 'image'
  const hasMedia = (mediaType === 'image' && heroData?.images?.length > 0) || 
                   (mediaType === 'video' && heroData?.videos?.length > 0)

  const headline = heroData?.headline || defaultHeadline
  const preheader = heroData?.preheader || defaultPreheader

  // Helper function to get video URL
  const getVideoUrl = (videoAsset) => {
    if (!videoAsset?.asset?._ref) return null
    
    try {
      const parts = videoAsset.asset._ref.split('-')
      if (parts.length >= 3) {
        const id = parts[1]
        const extension = parts[2]
        return `https://cdn.sanity.io/files/jzefrw3z/production/${id}.${extension}`
      }
    } catch (error) {
      console.error('Error generating video URL:', error)
    }
    return null
  }

  // Split headline into 2 lines
  useEffect(() => {
    if (!headline) return
    
    const words = headline.split(' ')
    const midPoint = Math.ceil(words.length / 2)
    
    // Try to split at a natural break point (like "when there is")
    let splitIndex = midPoint
    
    // Look for natural break points
    const breakWords = ['when', 'there', 'is', 'and', 'or', 'but', 'that', 'which', 'where']
    for (let i = Math.floor(words.length * 0.3); i <= Math.floor(words.length * 0.7); i++) {
      if (breakWords.includes(words[i]?.toLowerCase())) {
        splitIndex = i + 1
        break
      }
    }
    
    const firstLine = words.slice(0, splitIndex).join(' ')
    const secondLine = words.slice(splitIndex).join(' ')
    
    setHeadlineLines([firstLine, secondLine].filter(line => line.trim()))
  }, [headline])

  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [isVisible])

  // Scroll-based fade effect for hero text
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const sectionHeight = rect.height
        const scrollProgress = Math.max(0, -rect.top) / sectionHeight
        
        // Fade out the text much faster as user scrolls down
        // Text starts fading immediately and is fully transparent at 15%
        const fadeStart = 0
        const fadeEnd = 0.15
        
        let opacity = 1
        if (scrollProgress > fadeStart) {
          opacity = Math.max(0, 1 - (scrollProgress - fadeStart) / (fadeEnd - fadeStart))
        }
        
        setScrollOpacity(opacity)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Sequential animation timing
  useEffect(() => {
    if (isVisible) {
      // Start preheader animation immediately
      const preheaderTimer = setTimeout(() => {
        setShowPreheader(true)
      }, 100) // Small delay for smooth entry
      
      // Start headline animations much sooner - reduced to 250ms
      const headlineTimer = setTimeout(() => {
        setShowHeadlines(true)
      }, 250) // Much faster headline entry
      
      return () => {
        clearTimeout(preheaderTimer)
        clearTimeout(headlineTimer)
      }
    }
  }, [isVisible])

  // Reset animation states when heroData changes
  useEffect(() => {
    setIsVisible(false)
    setShowPreheader(false)
    setShowHeadlines(false)
  }, [heroData])

  return (
    <section ref={sectionRef} className={className}>
      {hasMedia && (
        <div className="hero-background">
          {mediaType === 'image' && heroData.images?.[0] && (
            <>
              <Image
                src={urlFor(heroData.images[0]).url()}
                alt={heroData.images[0].alt || 'Hero image'}
                fill
                className="hero-image"
                priority
              />
              <div className="hero-overlay" />
            </>
          )}
          
          {mediaType === 'video' && heroData.videos?.[0] && (
            <>
              <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                poster={heroData.videos[0].poster ? urlFor(heroData.videos[0].poster).url() : undefined}
                aria-label={heroData.videos[0].alt || 'Background video'}
              >
                <source 
                  src={getVideoUrl(heroData.videos[0])} 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
              <div className="hero-video-overlay" />
            </>
          )}
        </div>
      )}
      
      <div className="hero-content" style={{ 
        textAlign: 'center !important',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        paddingBottom: 0,
        opacity: scrollOpacity,
        transition: 'opacity 0.1s ease-out'
      }}>
        {/* Preheader with controlled fade-in animation (slower) */}
        <p 
          className={`hero-preheader hero-animate-up ${showPreheader ? 'hero-animate-visible' : ''}`}
          style={{ 
            transitionDuration: '0.4s', // Increased by 0.2s from 0.2s
            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            textAlign: 'center !important'
          }}
        >
          {preheader}
        </p>
        
        {/* Headline with line-by-line animation (first line starts immediately) */}
        <div ref={headlineRef} className="hero-headline-container" style={{ 
          textAlign: 'center !important',
          width: '100%'
        }}>
          {headlineLines.length > 0 ? (
            headlineLines.map((line, index) => (
              <h1 
                key={index}
                className={`hero-headline hero-headline-line ${showHeadlines ? 'animate-line' : ''}`}
                style={{ 
                  transitionDelay: index === 0 ? '0s' : `${index * 0.08}s`, // First line has no delay, subsequent lines stagger
                  transitionDuration: '0.425s',
                  marginBottom: index === headlineLines.length - 1 ? 0 : '0em',
                  textAlign: 'center !important'
                }}
              >
                {line}
              </h1>
            ))
          ) : (
            <h1 
              className={`hero-headline hero-animate-up ${showHeadlines ? 'hero-animate-visible' : ''}`}
              style={{ 
                transitionDuration: '0.425s',
                transitionDelay: '0s', // No delay for single headline
                textAlign: 'center !important'
              }}
            >
              {headline}
            </h1>
          )}
        </div>
      </div>
    </section>
  )
}