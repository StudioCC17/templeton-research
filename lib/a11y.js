// lib/a11y.js
// Spread onto a clickable <div>/<p> so keyboard users can reach and use it
// too: focusable, announced as a button, Enter/Space trigger the same action.
export const pressable = (action) => ({
  role: 'button',
  tabIndex: 0,
  onClick: action,
  onKeyDown: (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action(e)
    }
  },
})
