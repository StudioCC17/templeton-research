// components/LegalOverlayMount.js
// Client boundary wrapper for LegalOverlay.
//
// LegalOverlay reads the ?legal= query param with useSearchParams(). Mounting
// it here — inside an explicit 'use client' component with its own Suspense
// boundary — guarantees it re-renders on query-string changes (which a server
// component like app/page.js does NOT do). Mount this once in the root layout.

'use client'

import { Suspense } from 'react'
import LegalOverlay from './LegalOverlay'

export default function LegalOverlayMount() {
  return (
    <Suspense fallback={null}>
      <LegalOverlay />
    </Suspense>
  )
}
