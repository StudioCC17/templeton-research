// components/ScrollReveal.js
// One place for the site's scroll-in animations (GSAP + ScrollTrigger).
// Mark elements with data-reveal and they animate once as they come into view:
//   data-reveal="rise"    headings - lift into place (their letters already fade in)
//   data-reveal="fade"    a block fades up
//   data-reveal="stagger" the element's children fade up one after another
//                         (and any divider line on them draws across)
//   data-reveal="image"   image unmasks from the bottom and settles from a slight zoom
//   data-reveal="line"    a divider line draws in from the left
//   data-reveal="logo"    the footer logo's marks build in one by one
// The starting (hidden) states live in globals.css under .js-reveal, so nothing
// flashes before this runs. Reduced-motion users just see everything.

'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EASE, prefersReducedMotion } from '@/lib/motion'

const DONE = 'data-revealed'

function animate(el) {
  const type = el.getAttribute('data-reveal')
  el.setAttribute(DONE, '')

  switch (type) {
    case 'rise':
      gsap.fromTo(el, { y: 28 }, { y: 0, duration: 1.4, ease: EASE, clearProps: 'transform' })
      break
    case 'fade':
      gsap.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, ease: EASE, delay: 0.1, clearProps: 'transform,visibility' })
      break
    case 'stagger':
      gsap.fromTo(
        el.children,
        { autoAlpha: 0, y: 14, '--line': 0 },
        { autoAlpha: 1, y: 0, '--line': 1, duration: 1, ease: EASE, stagger: 0.08, clearProps: 'transform,visibility' }
      )
      break
    case 'image': {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: EASE, clearProps: 'clipPath' })
      const media = el.querySelector('img, video')
      if (media) gsap.fromTo(media, { scale: 1.06 }, { scale: 1, duration: 1.8, ease: EASE, clearProps: 'transform' })
      break
    }
    case 'line':
      gsap.fromTo(el, { '--line': 0 }, { '--line': 1, duration: 1.2, ease: EASE })
      break
    case 'logo':
      gsap.fromTo(
        el.querySelectorAll('g'),
        { autoAlpha: 0, x: -24, y: 24 },
        { autoAlpha: 1, x: 0, y: 0, duration: 1, ease: EASE, stagger: 0.07, clearProps: 'transform,visibility' }
      )
      break
  }
}

export default function ScrollReveal() {
  useEffect(() => {
    window.__revealReady = true
    const els = Array.from(document.querySelectorAll(`[data-reveal]:not([${DONE}])`))

    if (prefersReducedMotion()) {
      document.documentElement.classList.remove('js-reveal')
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    // Anything already on screen (or scrolled past, e.g. after a refresh) animates now
    const vh = window.innerHeight
    const later = els.filter((el) => {
      if (el.getBoundingClientRect().top < vh * 0.88) { animate(el); return false }
      return true
    })
    const triggers = later.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => animate(el),
      })
    )
    // Images/fonts can shift positions after load - recalc trigger points
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return null
}
