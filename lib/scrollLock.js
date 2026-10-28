// lib/scrollLock.js
// One shared page scroll lock for the splash, menus, modals and overlays.
// Each caller locks under its own name; the page only unlocks once every
// name has been released. Before this, each component set body overflow
// directly, so closing one layer (or the splash finishing) could unlock the
// page under another that was still open, or leave it stuck locked.

const holders = new Set()

const apply = () => {
  if (typeof document === 'undefined') return
  const body = document.body
  if (holders.size > 0) {
    if (body.style.overflow !== 'hidden') {
      // Pad by the scrollbar width so the page doesn't jump sideways
      const scrollbar = window.innerWidth - document.documentElement.clientWidth
      body.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : ''
      body.style.overflow = 'hidden'
    }
  } else {
    body.style.overflow = ''
    body.style.paddingRight = ''
  }
}

export const lockScroll = (name) => {
  holders.add(name)
  apply()
}

export const unlockScroll = (name) => {
  holders.delete(name)
  apply()
}
