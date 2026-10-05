// lib/motion.js
// Shared GSAP helpers so every small animation on the site uses the same
// timing and easing (expo.out - the house ease) and respects reduced motion.

import gsap from 'gsap'

export const EASE = 'expo.out'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fade + rise a list of elements in one after another.
export function staggerIn(elements, { delay = 0, y = 14, stagger = 0.05, duration = 0.9 } = {}) {
  const els = Array.from(elements || []).filter(Boolean)
  if (!els.length) return null
  if (prefersReducedMotion()) {
    gsap.set(els, { autoAlpha: 1, clearProps: 'transform' })
    return null
  }
  return gsap.fromTo(
    els,
    { autoAlpha: 0, y },
    { autoAlpha: 1, y: 0, duration, ease: EASE, stagger, delay, overwrite: true, clearProps: 'transform,visibility' }
  )
}

// Quick fade out (e.g. a form before its thank-you message). Resolves when done.
export function fadeOut(el) {
  return new Promise((resolve) => {
    if (!el || prefersReducedMotion()) return resolve()
    gsap.to(el, { autoAlpha: 0, y: -8, duration: 0.3, ease: 'power2.in', onComplete: resolve })
  })
}
