// components/OfficesStrip.js
// A quiet break between Careers and Insights: the firm's offices in a row,
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
      <span className="offices-label">Our offices</span>
      <ul className="offices-list">
        {cities.map((city) => {
          const zone = TIME_ZONES[city.toLowerCase()]
          return (
            <li key={city} className="office">
              <span className="office-city">{city}</span>
              <span className="office-time">{zone && now ? timeIn(zone, now) : ' '}</span>
            </li>
          )
        })}
      </ul>

      <style jsx>{`
        .offices-strip {
          background-color: var(--color-cream);
          padding: 4.5rem 1.5% 4.5rem;
        }
        .offices-label {
          display: block;
          font-family: var(--font-body), var(--font-fallback);
          font-size: var(--text-preheader-size);
          font-weight: var(--text-preheader-weight);
          letter-spacing: var(--tracking-bold);
          color: var(--color-red);
          margin-bottom: 1.25rem;
        }
        .offices-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(${cities.length}, 1fr);
          gap: 1.5rem;
        }
        .office {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .office-city {
          font-family: var(--font-heading), serif;
          font-size: var(--step-2);
          line-height: 1.2;
          color: var(--color-green);
        }
        .office-time {
          font-family: var(--font-body), var(--font-fallback);
          font-size: var(--step--1);
          line-height: 1.4;
          color: var(--color-text-secondary);
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 1024px) {
          .offices-list {
            grid-template-columns: repeat(3, 1fr);
            row-gap: 2rem;
          }
        }
        @media (max-width: 768px) {
          .offices-strip {
            padding: 3rem 1.25rem;
          }
          .offices-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  )
}
