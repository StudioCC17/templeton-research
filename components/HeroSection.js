// components/HeroSection.js
// Layout: Text section on cream background, then full-height video below
// Hero text animates in line by line using GSAP SplitText

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function HeroSection({ 
  heroData, 
  defaultPreheader = '', 
  defaultHeadline = '',
  className = '' 
}) {
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef(null)
  const sectionRef = useRef(null)
  const heroTextRef = useRef(null)
  
  const mediaType = heroData?.mediaType || 'image'

  useEffect(() => {
    setMounted(true)
  }, [])

  // GSAP SplitText animation - letter by letter opacity fade
  useEffect(() => {
    if (!mounted || !heroTextRef.current) return

    let splitInstance = null

    const initAnimation = async () => {
      try {
        const gsapModule = await import('gsap')
        const splitTextModule = await import('gsap/SplitText')
        
        const gsap = gsapModule.default
        const SplitText = splitTextModule.SplitText
        
        gsap.registerPlugin(SplitText)

        // Fade whole block from 0 to 0.5 first
        gsap.fromTo(heroTextRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'power2.out' }
        )

        // Split the hero text into individual characters
        splitInstance = new SplitText(heroTextRef.current, {
          type: 'chars',
          charsClass: 'hero-split-char',
          tag: 'span'
        })

        // Set initial state - all chars at 0.5 opacity
        gsap.set(splitInstance.chars, {
          opacity: 0.2
        })

        // Animate each char from 0.5 to 1 opacity, staggered left to right (3x faster)
        gsap.to(splitInstance.chars, {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.01,
          delay: 0
        })
      } catch (error) {
        console.error('GSAP animation error:', error)
        if (heroTextRef.current) {
          heroTextRef.current.style.opacity = '1'
        }
      }
    }

    initAnimation()

    return () => {
      if (splitInstance) {
        splitInstance.revert()
      }
    }
  }, [mounted])

  // GSAP video fade-in on canplaythrough
  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== 'video') return

    let hasAnimated = false

    const fadeIn = async () => {
      if (hasAnimated) return
      hasAnimated = true
      
      const gsap = (await import('gsap')).default
      gsap.to(video, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      })
    }

    if (video.readyState >= 4) {
      fadeIn()
    } else {
      video.addEventListener('canplaythrough', fadeIn, { once: true })
    }

    return () => video.removeEventListener('canplaythrough', fadeIn)
  }, [mediaType, mounted])

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const scrollProgress = -rect.top / window.innerHeight
        const translateY = scrollProgress * 50
        videoRef.current.style.transform = `translateY(${translateY}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Select random video on mount
  const selectedVideo = useMemo(() => {
    if (!mounted || !heroData?.videos?.length) return null
    const randomIndex = Math.floor(Math.random() * heroData.videos.length)
    return heroData.videos[randomIndex]
  }, [mounted, heroData?.videos])

  const hasMedia = (mediaType === 'image' && heroData?.images?.length > 0) || 
                   (mediaType === 'video' && selectedVideo)

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

  return (
    <>
      {/* Text Section */}
      <section 
        className="hero-text-section"
        style={{
          backgroundColor: '#f5f5f0',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '250px 1.5% 2rem 1.5%'
        }}
      >
        <div 
          style={{

            width: '100%'
          }}
        >
          <h1 
            ref={heroTextRef}
            className="hero-text"
            style={{
              color: '#245148',
              margin: 0,
              maxWidth: '100%',
              paddingRight: '16%',
              opacity: 0,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            We are an investigative research firm supporting decision-makers operating in complex environments, often where information is scarce or overabundant.
          </h1>
        </div>
      </section>

      {/* Video/Image Section */}
      {hasMedia && (
        <section 
          ref={sectionRef}
          style={{
            position: 'relative',
            height: '72vh', // was 85vh - 15% shorter
            minHeight: '425px', // was 500px
            overflow: 'hidden'
          }}
        >
          {mediaType === 'image' && heroData.images?.[0] && (
            <>
              <Image
                src={urlFor(heroData.images[0]).url()}
                alt={heroData.images[0].alt || 'Hero image'}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                priority
              />
              <div className="hero-overlay" />
            </>
          )}
          
          {mediaType === 'video' && selectedVideo && (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={selectedVideo.poster ? urlFor(selectedVideo.poster).url() : undefined}
                style={{
                  position: 'absolute',
                  top: '-10%',
                  left: 0,
                  width: '100%',
                  height: '140%',
                  objectFit: 'cover',
                  willChange: 'transform',
                  opacity: 0
                }}
              >
                <source src={getVideoUrl(selectedVideo)} type="video/mp4" />
              </video>
              <div className="hero-video-overlay" />


            </>
          )}
        </section>
      )}

      <style jsx>{`
        :global(.hero-text div),
        :global(.hero-text span) {
          display: inline;
        }
        
        @media (prefers-reduced-motion: reduce) {
          :global(.hero-split-char) {
            opacity: 1 !important;
          }
        }
      `}</style>
    </>
  )
}