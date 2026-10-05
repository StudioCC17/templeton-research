// components/Arrow.js
// The one arrow used across the site (links, buttons, "next", etc.).
// Sized in em so it always matches the text it sits beside. It's a small arrow
// whose top lines up with the top of the capital letters (like a superscript),
// so it reads as a light marker rather than a full-size glyph.
// Directions: 'up-right' (default - opens / goes somewhere), 'right', 'left'.

const PATHS = {
  'up-right': ['M5.5 18.5L18.5 5.5', 'M8 5.5h10.5V16'],
  // Horizontal arrows have a longer tail (3 units past the usual box)
  right: ['M1.5 12h18', 'M13 5.5l6.5 6.5-6.5 6.5'],
  left: ['M22.5 12h-18', 'M11 5.5L4.5 12l6.5 6.5'],
}

// Two looks:
//  - 'up-right' (default): small, top-aligned to cap height, like a superscript.
//  - 'right' / 'left': full text size and vertically centred on the line,
//    like an en dash, for "next / previous / read more".
const LOOK = {
  small: { size: '0.45em', align: 'calc(0.23em + 2px)', stroke: 2.1, gap: '0.2em' }, // top at cap height, lifted 2px
  full: { size: '0.7em', align: '-0.05em', stroke: 1.4, gap: '0.3em' }, // centre sits ~0.3em above baseline
}

export default function Arrow({ direction = 'up-right', className = '', style = {} }) {
  const isLeft = direction === 'left'
  const look = direction === 'up-right' ? LOOK.small : LOOK.full
  const horizontal = direction === 'right' || direction === 'left'
  // Wider box for the longer tail; same height, so it still sits on the line
  const viewBox = direction === 'right' ? '1 4 19 16' : direction === 'left' ? '4 4 19 16' : '4 4 16 16'
  const width = horizontal ? `calc(${look.size} * 19 / 16)` : look.size
  return (
    <svg
      className={`arrow ${className}`.trim()}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={look.stroke} // ~0.06em: matches the stroke of regular-weight Acumin
      // Horizontal arrows: crisp, sharp ends and point; the small diagonal stays rounded
      strokeLinecap={horizontal ? 'butt' : 'round'}
      strokeLinejoin={horizontal ? 'miter' : 'round'}
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'inline-block',
        width,
        height: look.size,
        verticalAlign: look.align,
        flexShrink: 0,
        overflow: 'visible',
        [isLeft ? 'marginRight' : 'marginLeft']: look.gap,
        ...style,
      }}
    >
      {(PATHS[direction] || PATHS['up-right']).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
