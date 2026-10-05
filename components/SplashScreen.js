// components/SplashScreen.js
// Opening splash: the Templeton mark draws itself in (cream on the brand green),
// holds for a moment, then the whole splash fades away to reveal the homepage.
// About 2.5s in total. Shown once per browser session (layout.js adds
// .splash-seen before the page paints on later visits, so there's no flash).
// If JavaScript fails, a CSS fallback fades it out after 4s regardless.

'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const SEEN_KEY = 'tr-splash'

export default function SplashScreen() {
  const splashRef = useRef(null)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    const el = splashRef.current
    if (!el) return
    const html = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (html.classList.contains('splash-seen') || reduce) {
      window.__splashDone = true
      setGone(true)
      return
    }
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch (e) {}

    // Hold the page still while the splash plays
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const paths = Array.from(el.querySelectorAll('path'))
    paths.forEach((p) => {
      const len = Math.ceil(p.getTotalLength()) + 2
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    })

    let finished = false
    const announce = () => {
      if (window.__splashDone) return
      window.__splashDone = true
      window.dispatchEvent(new Event('splash-done'))
    }
    const finish = () => {
      if (finished) return
      finished = true
      announce()
      document.body.style.overflow = prevOverflow
      setGone(true)
    }
    // Safety net: if animation frames are paused (e.g. the page loaded in a
    // background tab), don't leave the splash or the hidden intros hanging
    const safety = setTimeout(finish, 3200)

    const tl = gsap.timeline({ onComplete: finish })
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 0.9,
      ease: 'power3.inOut',
      // centre pair, then middle, then outer
      stagger: (i) => Math.floor(i / 2) * 0.12,
    }, 0.25)
      .to(el, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, 2.0) // fade to the homepage
      // the header + hero intros start as the fade begins (see lib/splash.js)
      .call(announce, null, 2.0)

    return () => {
      tl.kill()
      clearTimeout(safety)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  if (gone) return null

  return (
    <div ref={splashRef} className="splash" aria-hidden="true">
      <svg
        viewBox="0 0 283.05 227.86"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.68"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="splash-logo"
      >
        {/* same strokes as the header/footer logo; start hidden (dash offset) */}
        <path d="M127.8 225.27V2.59H2.59" style={{ strokeDasharray: 400, strokeDashoffset: 400 }} />
        <path d="M155.54 225.27V2.59H280.47" style={{ strokeDasharray: 400, strokeDashoffset: 400 }} />
        <path d="M99.79 225.27V30.73H2.59" style={{ strokeDasharray: 400, strokeDashoffset: 400 }} />
        <path d="M183.56 225.27V30.73H280.47" style={{ strokeDasharray: 400, strokeDashoffset: 400 }} />
        <path d="M72.06 225.27V58.85H2.59" style={{ strokeDasharray: 400, strokeDashoffset: 400 }} />
        <path d="M211 225.27V58.85H280.47" style={{ strokeDasharray: 400, strokeDashoffset: 400 }} />
      </svg>
    </div>
  )
}
