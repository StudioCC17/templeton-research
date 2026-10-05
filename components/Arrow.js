// components/Arrow.js
// The one arrow used across the site (links, buttons, "next", etc.).
// Sized in em so it always matches the text it sits beside: it's as tall as a
// capital letter and sits on the text baseline, so it lines up perfectly inline.
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'inline-block',
        width: '0.68em', // roughly cap height
        height: '0.68em',
        verticalAlign: 'baseline', // sits on the baseline like a letter
        flexShrink: 0,
        overflow: 'visible',
        [isLeft ? 'marginRight' : 'marginLeft']: '0.3em',
        ...style,
      }}
    >
      {(PATHS[direction] || PATHS['up-right']).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
