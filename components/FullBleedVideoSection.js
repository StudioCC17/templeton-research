// components/FullBleedVideoSection.js
// SIMPLE VERSION - No performance optimizations, just basic video

'use client'

export default function FullBleedVideoSection({ heroData, videoIndex = 0, height = "80vh", minHeight = "500px" }) {
  
  // Helper function to get video URL from Sanity asset reference
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

  // Get the specific video based on the index
  const video = heroData?.videos?.[videoIndex]
  const videoUrl = getVideoUrl(video)

  return (
    <section 
      className="full-bleed-video-section"
      style={{
        position: 'relative',
        width: '100%',
        padding: '0',
        backgroundColor: 'var(--color-cream)'
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
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
            Video loading...
          </div>
        )}
      </div>
    </section>
  )
}