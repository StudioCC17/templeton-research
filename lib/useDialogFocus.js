// lib/useDialogFocus.js
// Keyboard focus for modals and overlays: while `active`, focus moves into
// the panel, Tab / Shift+Tab stay inside it, and on close focus goes back to
// whatever opened it.

import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function useDialogFocus(ref, active) {
  useEffect(() => {
    if (!active) return
    const opener = document.activeElement
    let frame

    const focusables = () =>
      Array.from(ref.current?.querySelectorAll(FOCUSABLE) || []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )

    // Wait a frame so the panel is in the DOM and visible
    frame = requestAnimationFrame(() => {
      const panel = ref.current
      if (!panel || panel.contains(document.activeElement)) return
      const first = focusables()[0]
      if (first) first.focus({ preventScroll: true })
      else {
        panel.setAttribute('tabindex', '-1')
        panel.focus({ preventScroll: true })
      }
    })

    const onKeyDown = (e) => {
      if (e.key !== 'Tab' || !ref.current) return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (!ref.current.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
        opener.focus({ preventScroll: true })
      }
    }
  }, [ref, active])
}
