// components/FormSuccess.js
// Thank-you state for the forms: a small red tick draws itself, then the
// message rises in underneath (GSAP, house ease).

'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { EASE, prefersReducedMotion, staggerIn } from '@/lib/motion'

export default function FormSuccess({ children }) {
  const wrapRef = useRef(null)
  const tickRef = useRef(null)

  useEffect(() => {
    if (!wrapRef.current) return
    staggerIn(wrapRef.current.children, { y: 12, stagger: 0.12, duration: 0.9 })
    if (tickRef.current && !prefersReducedMotion()) {
      gsap.fromTo(tickRef.current, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: EASE, delay: 0.1 })
    }
  }, [])

  return (
    <div ref={wrapRef} style={{ paddingTop: '1rem' }}>
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="var(--color-red)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ display: 'block', marginBottom: '1rem' }}
      >
        <path ref={tickRef} d="M4.5 12.5l5 5 10-11" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 0 }} />
      </svg>
      {children}
    </div>
  )
}
