// components/StaticImageSection.js
// Fullbleed static image component - distinct from existing video components

'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function StaticImageSection({ 
  imageData, 
  height = '60vh', 
  minHeight = '500px',
  defaultImageUrl = "https://cdn.sanity.io/images/jzefrw3z/production/f46db0a703e6845b759c4d870270ceed223f048a-1500x842.jpg"
}) {
  // Use the specific image you requested
  const imageUrl = "https://cdn.sanity.io/images/jzefrw3z/production/ec20931912abd812bf639a58e9706b5dd022ea6a-1500x1124.jpg"
  const alt = imageData?.alt || 'Full width image'

  return (
    <section 
      className="static-image-section"
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        minHeight: minHeight,
        overflow: 'hidden',
        backgroundColor: 'var(--color-cream)',
        borderTop: '1px solid var(--color-border)'
      }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
        sizes="100vw"
        priority={false}
      />
    </section>
  )
}