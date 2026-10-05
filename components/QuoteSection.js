// components/QuoteSection.js
// Quote component with vertical line at 20% from left, quote on right side - animations removed

'use client'

export default function QuoteSection({ 
  quote = "Clients turn to us knowing that their critical and commercially sensitive matters will receive the full attention and care that they deserve.",
  author = "Denis Meunier",
  title = "Partner Buildings - Cima+"
}) {
  return (
    <section 
      className="quote-section"
      style={{
        backgroundColor: 'var(--color-cream)',
        padding: '0',
        borderTop: '1px solid var(--color-border)',
        position: 'relative'
      }}
    >
      <div 
        style={{
          maxWidth: '1800px',
          margin: '0 auto',
          padding: '4rem 1.25rem',
          position: 'relative',
          minHeight: '550px'
        }}
      >
        {/* Vertical line at 20% from left */}
        <div 
          style={{
            position: 'absolute',
            left: '20%',
            top: '0',
            bottom: '0',
            width: '1px',
            backgroundColor: 'var(--color-border)'
          }} 
        />

        {/* Content area - starts after the 20% line */}
        <div 
          style={{
            position: 'absolute',
            left: '22%',
            width: '78%',
            top: '0',
            bottom: '0'
          }}
        >
          {/* Quote content - top aligned */}
          <div 
            style={{
              position: 'absolute',
              top: '2.75rem',
              left: '0',
              width: '78%'
            }}
          >
            {/* Opening quote mark */}
            <div 
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                fontWeight: 300,
                color: 'var(--color-green)',
                lineHeight: 0.5,
                marginBottom: '0',
                opacity: 0.3
              }}
            >
              "
            </div>

            {/* Quote text */}
            <blockquote 
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--color-green)',
                margin: '0',
                textAlign: 'left'
              }}
            >
              {quote}
            </blockquote>
          </div>

          {/* Attribution - bottom aligned */}
          <div 
            style={{
              position: 'absolute',
              bottom: '1.75rem',
              left: '0'
            }}
          >
            {/* Author name */}
            <p 
              style={{
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: '1.1rem',
                fontWeight: 400,
                color: 'var(--color-green)',
                margin: '0 0 0.25rem 0',
                lineHeight: 1.3
              }}
            >
              {author}
            </p>

            {/* Author title */}
            <p 
              style={{
                fontFamily: 'var(--font-body), var(--font-fallback)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-red)',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1.3
              }}
            >
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .quote-section > div > div:first-child {
            left: 15% !important;
          }
          
          .quote-section > div > div:nth-child(2) {
            margin-left: 20% !important;
          }

          .quote-section blockquote {
            font-size: clamp(1.8rem, 4vw, 2.5rem) !important;
          }
        }

        @media (max-width: 768px) {
          .quote-section > div {
            padding: 3rem 1.5rem !important;
            min-height: 400px !important;
          }

          .quote-section > div > div:first-child {
            display: none !important;
          }
          
          .quote-section > div > div:nth-child(2) {
            margin-left: 0 !important;
            padding-top: 0 !important;
          }

          .quote-section blockquote {
            font-size: 1.6rem !important;
          }

          .quote-section > div > div:nth-child(2) > div:first-child {
            font-size: 80px !important;
          }
        }
      `}</style>
    </section>
  )
}