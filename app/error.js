'use client'

// app/error.js - shown instead of Next's default page if the homepage fails
// to render (e.g. Sanity is unreachable)

export default function Error({ reset }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-cream)',
        color: 'var(--color-green)',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-heading), serif', fontSize: 'var(--step-4)', fontWeight: 400, margin: 0 }}>
        Something went wrong
      </h1>
      <p style={{ fontFamily: 'var(--font-body), var(--font-fallback)', fontSize: 'var(--step-0)', margin: 0 }}>
        Please try again in a moment.
      </p>
      <button type="button" className="btn-primary" onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}
