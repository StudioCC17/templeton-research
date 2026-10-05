// components/FullBleedImageSection.js
// Full bleed image section component

'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function FullBleedImageSection({ imageData, height = "60vh", minHeight = "300px" }) {
  
  // Default fallback image
  const defaultImage = {
    alt: 'Office interior',
    url: 'https://cdn.sanity.io/images/jzefrw3z/production/ec20931912abd812bf639a58e9706b5dd022ea6a-1500x1124.jpg'
  }

  // Use provided image or fallback
  const image = imageData || defaultImage
  const imageUrl = image.asset ? urlFor(image).url() : image.url
  const imageAlt = image.alt || 'Full bleed image'

  return (
    <section 
      className="full-bleed-image-section"
      style={{
        position: 'relative',
        width: '100%',
        padding: '0',
        backgroundColor: 'var(--color-cream)',
        borderTop: '0px solid var(--color-border)',
        borderBottom: '0px solid var(--color-border)'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height,
          minHeight,
          overflow: 'hidden'
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            style={{
              objectFit: 'cover'
            }}
            sizes="100vw"
            priority={false}
          />
        ) : (
          <div 
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-cream-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)'
            }}
          >
            Image loading...
          </div>
        )}
      </div>
    </section>
  )
}