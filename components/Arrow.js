// components/Arrow.js
// The one arrow used across the site (links, buttons, "next", etc.).
// Sized in em so it always matches the text it sits beside. It's a small arrow
// whose top lines up with the top of the capital letters (like a superscript),
// so it reads as a light marker rather than a full-size glyph.
// Directions: 'up-right' (default - opens / goes somewhere), 'right', 'left'.

const PATHS = {
  'up-right': ['M5.5 18.5L18.5 5.5', 'M8 5.5h10.5V16'],
  right: ['M4.5 12h15', 'M13 5.5l6.5 6.5-6.5 6.5'],
  left: ['M19.5 12h-15', 'M11 5.5L4.5 12l6.5 6.5'],
}

export default function Arrow({ direction = 'up-right', className = '', style = {} }) {
  const isLeft = direction === 'left'
  return (
    <svg
      className={`arrow ${className}`.trim()}
      viewBox="4 4 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1" // ~0.06em at this size: matches the stroke of regular-weight Acumin
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'inline-block',
        width: '0.45em',
        height: '0.45em',
        // Lift it so its top meets cap height (~0.68em): 0.68 - 0.45 = 0.23em
        verticalAlign: '0.23em',
        flexShrink: 0,
        overflow: 'visible',
        [isLeft ? 'marginRight' : 'marginLeft']: '0.2em',
        ...style,
      }}
    >
      {(PATHS[direction] || PATHS['up-right']).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
