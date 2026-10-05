// lib/splash.js
// Run something once the opening splash has finished (or straight away if
// there's no splash this visit) - so the header and hero intros play as the
// splash fades away, not hidden behind it.
export function afterSplash(cb) {
  if (typeof window === 'undefined') return () => {}
  const active =
    document.querySelector('.splash') &&
    !window.__splashDone &&
    !document.documentElement.classList.contains('splash-seen')
  if (!active) {
    cb()
    return () => {}
  }
  const run = () => cb()
  window.addEventListener('splash-done', run, { once: true })
  return () => window.removeEventListener('splash-done', run)
}
