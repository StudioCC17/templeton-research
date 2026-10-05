// components/OfficesStrip.js
// The firm's offices in a row under the footer,
// each with its live local time. Cities come from Footer Settings > Offices in
// Sanity, so the list stays in step with the footer.

'use client'

import { useEffect, useState } from 'react'

// City -> time zone. Add a line here if a new office city is added in Sanity.
const TIME_ZONES = {
  london: 'Europe/London',
  singapore: 'Asia/Singapore',
  'hong kong': 'Asia/Hong_Kong',
  'ho chi minh': 'Asia/Ho_Chi_Minh',
  'ho chi minh city': 'Asia/Ho_Chi_Minh',
  philadelphia: 'America/New_York',
  'new york': 'America/New_York',
  vancouver: 'America/Vancouver',
  tokyo: 'Asia/Tokyo',
}

// Hours + minutes in a time zone, as numbers (for the clock hands)
const partsIn = (zone, now) => {
  const p = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: zone }).formatToParts(now)
  const get = (t) => Number(p.find((x) => x.type === t)?.value || 0)
  return { h: get('hour') % 12, m: get('minute') }
}

// A tiny, minimal analogue clock: thin ring, two hands, no numerals
function Clock({ h, m }) {
  const minuteAngle = m * 6
  const hourAngle = h * 30 + m * 0.5
  return (
    <svg className="office-clock" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <line x1="12" y1="12" x2="12" y2="6.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="butt"
        style={{ transform: `rotate(${hourAngle}deg)`, transformOrigin: '12px 12px' }} />
      <line x1="12" y1="12" x2="12" y2="3.5" stroke="currentColor" strokeWidth="0.5" strokeLinecap="butt"
        style={{ transform: `rotate(${minuteAngle}deg)`, transformOrigin: '12px 12px' }} />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" />
    </svg>
  )
}

const timeIn = (zone, now) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zone }).format(now)

export default function OfficesStrip({ offices = [] }) {
  const cities = [...offices]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((o) => (o.city || '').trim())
    .filter(Boolean)

  // Times are filled in after load (and every 30s), so the server and browser
  // never disagree about the minute
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  if (!cities.length) return null

  return (
    <section className="offices-strip" aria-label="Our offices">
      <ul className="offices-list">
        {cities.map((city) => {
          const zone = TIME_ZONES[city.toLowerCase()]
          return (
            <li key={city} className="office">
              {/* Clock above the city, red, centred */}
              <span className="office-clock-wrap">{zone && now ? <Clock {...partsIn(zone, now)} /> : null}</span>
              <span className="office-city">{city}</span>
              <span className="office-time">{zone && now ? timeIn(zone, now) : ' '}</span>
            </li>
          )
        })}
      </ul>

      <style jsx>{`
        .offices-strip {
          background-color: var(--color-green);
          /* sits right under the green footer, so a faint line separates them */
          border-top: 1px solid rgba(245, 245, 240, 0.25);
          padding: 4.5rem 1.5% 4.5rem;
        }
        .offices-list {
          list-style: none;
          margin: 0;
          padding: 0;
          /* clocks grouped together in the middle, not spread edge to edge */
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2.5rem 7rem;
        }
        .office {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.15rem;
        }
        .office-clock-wrap {
          display: block;
          width: 6rem;
          height: 6rem;
          margin-bottom: 0.75rem;
          color: var(--color-red);
        }
        .office-city {
          font-family: var(--font-heading), serif;
          font-size: var(--step-2);
          line-height: 1.2;
          color: var(--color-cream);
        }
        .office-time {
          font-family: var(--font-body), var(--font-fallback);
          font-size: var(--step--1);
          line-height: 1.4;
          color: rgba(245, 245, 240, 0.6); /* faded cream on the green */
          font-variant-numeric: tabular-nums;
        }
        .office-clock-wrap :global(.office-clock) {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        @media (max-width: 1024px) {
          .offices-list {
            gap: 2rem 3rem;
          }
        }
        @media (max-width: 768px) {
          .offices-strip {
            padding: 3rem 1.25rem;
          }
          .offices-list {
            gap: 2rem 2rem;
          }
        }
      `}</style>
    </section>
  )
}
