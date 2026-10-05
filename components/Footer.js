// components/Footer.js
// Updated footer with email addresses under each office location
// "Email us" now opens the shared contact modal via a window event.

'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Arrow from '@/components/Arrow'

function FooterInner({ footerData }) {
  const defaultFooterData = {
    companyInfo: {
      companyName: 'TEMPLETON',
      tagline: 'Research',
      copyrightText: '© 2024 Templeton Research. All rights reserved.'
    },
    offices: [
      {
        city: 'London',
        address: {
          line1: '15 Upper Grosvenor Street,',
          line2: 'Mayfair, London, W1K 7PJ'
        },
        email: 'london@templetonresearch.com',
        order: 1
      },
      {
        city: 'New York',
        address: {
          line1: '125 Park Avenue,',
          line2: 'New York, NY 10017'
        },
        email: 'newyork@templetonresearch.com',
        order: 2
      },
      {
        city: 'Tokyo',
        address: {
          line1: '3-2-5 Kasumigaseki,',
          line2: 'Chiyoda-ku, Tokyo 100-6390'
        },
        email: 'tokyo@templetonresearch.com',
        order: 3
      }
    ]
  }

  const footer = footerData || defaultFooterData
  const sortedOffices = footer.offices?.sort((a, b) => (a.order || 0) - (b.order || 0)) || defaultFooterData.offices
  const hasLogo = footer.companyInfo?.logo?.asset || footer.companyInfo?.logo?.asset?.url

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const openLegal = (slug) => (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    params.set('legal', slug)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Open the contact modal that lives in Navigation. Navigation listens
  // for this event and sets its modal open state to true.
  const openContactModal = (e) => {
    e.preventDefault()
    window.dispatchEvent(new Event('open-contact-modal'))
  }

  return (
    <>
      {/* Main Footer */}
      <footer 
        className="footer-section"
        style={{
          backgroundColor: 'var(--color-green)',
          padding: '0rem',
          borderTop: '1px solid var(--color-border-on-dark)'
        }}
      >
        <div 
          className="footer-container"
          style={{
 
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            position: 'relative',
            minHeight: '400px',
            textAlign: 'left'
          }}
        >
          {/* Vertical Divider */}
          <div 
            className="footer-divider"
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: '1px',
              backgroundColor: 'var(--color-border-on-dark)',
              transform: 'translateX(-50%)',
              zIndex: 1
            }} 
          />

          {/* Left Side - Tagline and Links */}
          <div 
            className="footer-left"
            style={{
              paddingRight: '4rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              position: 'relative'
            }}
          >
            {/* Top Section - Tagline */}
            <div>
              {/* Tagline */}
              <h2 
                style={{
                  fontFamily: 'var(--font-heading), serif',
                  fontWeight: 300,
                  lineHeight: 1.2,
                  color: 'var(--color-cream)',
                  paddingRight: '45%'
                }}
              >
                Providing clarity when there is uncertainty
              </h2>
            </div>

            {/* Bottom row - lines up with the legal links on the right */}
            <div className="footer-bottom-left">
              <span>© {new Date().getFullYear()} Templeton Research</span>
            </div>

            {/* Logo positioned bottom right within left section */}
            <div 
              className="footer-micro-logo"
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1.25rem'
              }}
            >
              {/* Footer logo as strokes, so its lines draw in (same as the sticky header logo) -
                  triggered on scroll by ScrollReveal (data-reveal="logo") */}
              <svg 
                data-reveal="logo"
                viewBox="0 0 283.05 227.86" 
                fill="none"
                stroke="currentColor"
                strokeWidth="4.68"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  width: '60px',
                  height: '40px',
                  color: 'var(--color-cream)',
                  overflow: 'visible'
                }}
              >
                <path d="M127.8 225.27V2.59H2.59" />
                <path d="M155.54 225.27V2.59H280.47" />
                <path d="M99.79 225.27V30.73H2.59" />
                <path d="M183.56 225.27V30.73H280.47" />
                <path d="M72.06 225.27V58.85H2.59" />
                <path d="M211 225.27V58.85H280.47" />
              </svg>
            </div>
          </div>

          {/* Right Side - Office Locations */}
          <div 
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            {/* Two short columns: site links + contact details
               (office cities now live in the clocks strip under the footer) */}
            <div className="footer-cols">
              <div>
                <span className="footer-col-label">Explore</span>
                <ul className="footer-col-list">
                  {[
                    { label: 'About', action: () => window.dispatchEvent(new Event('open-about-modal')) },
                    { label: 'Services', target: 'services' },
                    { label: 'Team', target: 'team' },
                    { label: 'Careers', target: 'careers' },
                    { label: 'Insights', target: 'insights' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.target ? `#${item.target}` : '#'}
                        className="u-link footer-col-link"
                        onClick={(e) => {
                          e.preventDefault()
                          if (item.action) return item.action()
                          const el = document.getElementById(item.target)
                          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' })
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="footer-col-label">Contact</span>
                <ul className="footer-col-list">
                  <li>
                    <a href="#" onClick={openContactModal} className="footer-col-link">Send us a message<Arrow /></a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-col-link">LinkedIn<Arrow /></a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom - Legal links */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginTop: '3rem'
            }}>
              {[
                { label: 'Privacy Policy', slug: 'privacy-policy' },
                { label: 'Cookie Policy', slug: 'cookie-policy' },
                { label: 'Terms of Use', slug: 'terms-of-use' },
              ].map(({ label, slug }) => (
                <a
                  key={label}
                  className="u-link"
                  href={`?legal=${slug}`}
                  onClick={openLegal(slug)}
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: 'var(--step--1)',
                    fontWeight: 400,
                    color: 'var(--color-cream)',
                    textDecoration: 'none',
                    lineHeight: 1.425,
                  }}
                >
                  {label}
                </a>
              ))}
              {/* Back to top - pushed to the far right of the row */}
              <a
                href="#top"
                className="footer-col-link"
                style={{ marginLeft: 'auto' }}
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Back to top<Arrow direction="up" />
              </a>
            </div>
          </div>
        </div>

        {/* Responsive Styles */}
        <style jsx>{`
          .footer-bottom-left {
            display: flex;
            flex-wrap: wrap;
            gap: 1.25rem;
            margin-top: 3rem;
            font-family: var(--font-body), var(--font-fallback);
            font-size: var(--step--1);
            font-weight: 400;
            line-height: 1.425;
            color: var(--color-cream);
          }
          .footer-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            align-content: start;
          }
          .footer-col-label {
            display: block;
            font-family: var(--font-body), var(--font-fallback);
            font-size: var(--text-preheader-size);
            font-weight: var(--text-preheader-weight);
            letter-spacing: var(--tracking-bold);
            color: var(--color-red);
            margin-bottom: 0.75rem;
          }
          .footer-col-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0; /* stacked like the other small link lists on the site */
            /* the list itself at the small size, so each line is exactly one line of link text */
            font-size: var(--step--1);
            line-height: 1.425;
          }
          .footer-col-link {
            font-family: var(--font-body), var(--font-fallback);
            font-size: var(--step--1);
            font-weight: 400;
            line-height: 1.425; /* same as small paragraph text site-wide */
            color: var(--color-cream);
            text-decoration: none;
          }
          @media (max-width: 640px) {
            .footer-cols {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
          }

          @media (max-width: 1024px) {
            .footer-container {
              grid-template-columns: 1fr !important;
              gap: 4rem !important;
            }
            
            .footer-container > div:first-child {
              padding-right: 0 !important;
            }
            
            .footer-container > div:last-child {
              padding-left: 0 !important;
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }

          @media (max-width: 768px) {
            .footer-section {
              padding: 1.25rem !important;
            }
            
            .footer-container > div:first-child {
              padding: 0 !important;
            }
            
            .footer-left {
              padding: 0 !important;
            }
            
            .footer-divider {
              display: none !important;
            }
            
            .footer-micro-logo {
              display: none !important;
            }
          }
        `}</style>
      </footer>
    </>
  )
}

export default function Footer(props) {
  return (
    <Suspense fallback={null}>
      <FooterInner {...props} />
    </Suspense>
  )
}