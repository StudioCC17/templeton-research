// components/HeroTextSection.js
// Single portrait image with centered H1 text overlay

'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function HeroTextSection({ heroTextData }) {
  // Default image if none provided
  const defaultImage = {
    alt: 'Portrait image',
    url: 'https://cdn.sanity.io/images/jzefrw3z/production/f46db0a703e6845b759c4d870270ceed223f048a-1500x842.jpg'
  }

  const image = heroTextData?.image || defaultImage
  const headline = heroTextData?.headline || 'Fact finders, analysts and problem solvers'

  return (
    <section 
      className="hero-text-section"
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#f5f5f0'
      }}
    >
      {/* Centered Image - 30% width */}
      <div 
        style={{
          position: 'relative',
          width: '30%',
          height: '80%',
          zIndex: 1
        }}
      >
        <Image
          src={image.asset ? urlFor(image).url() : image.url}
          alt={image.alt || 'Hero text background'}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      {/* Overlaid Text - Perfectly Centered */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          textAlign: 'center',
          color: '#f5f5f0',
          maxWidth: '800px',
          padding: '0 2rem'
        }}
      >
        <h1 
          style={{
            fontFamily: 'var(--font-heading), serif',
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            margin: 0,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {headline}
        </h1>
      </div>
    </section>
  )
}