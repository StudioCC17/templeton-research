// components/Footer.js
// Footer component with Sanity CMS integration
// Updated to use dynamic footer settings from Sanity including logo

import React from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function Footer({ footerData }) {
  // Debug: Log the footer data to see what we're receiving
  console.log('Footer footerData:', footerData)
  console.log('Logo data:', footerData?.companyInfo?.logo)

  // Fallback data if Sanity data isn't available
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
        order: 1
      },
      {
        city: 'New York',
        address: {
          line1: '125 Park Avenue,',
          line2: 'New York, NY 10017'
        },
        order: 2
      },
      {
        city: 'Tokyo',
        address: {
          line1: '3-2-5 Kasumigaseki,',
          line2: 'Chiyoda-ku, Tokyo 100-6390'
        },
        order: 3
      }
    ]
  }

  const footer = footerData || defaultFooterData
  const sortedOffices = footer.offices?.sort((a, b) => (a.order || 0) - (b.order || 0)) || defaultFooterData.offices

  // Check if we have a valid logo
  const hasLogo = footer.companyInfo?.logo?.asset || footer.companyInfo?.logo?.asset?.url
  console.log('Has logo:', hasLogo)
  console.log('Logo asset:', footer.companyInfo?.logo?.asset)

  return (
    <footer 
      className="footer-section"
      style={{
        backgroundColor: '#245148',
        padding: '2rem 2rem 2rem 2rem',
        borderTop: '0px solid #245148'
      }}
    >
      <div 
        className="footer-container"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        {/* Logo/Company name */}
        <div 
          className="footer-logo"
          style={{
            marginBottom: '7rem'
          }}
        >
          {hasLogo ? (
            // Show logo if available
            <div className="footer-logo-container">
              {/* Try multiple ways to get the image URL */}
              {(() => {
                let imageUrl;
                let imageWidth = footer.companyInfo.logo.width || 200;
                let imageHeight = footer.companyInfo.logo.height || 60;
                let altText = footer.companyInfo.logo.alt || 'Company Logo';

                // Try different ways to get the URL
                if (footer.companyInfo.logo.asset?.url) {
                  imageUrl = footer.companyInfo.logo.asset.url;
                } else if (footer.companyInfo.logo.asset) {
                  imageUrl = urlFor(footer.companyInfo.logo).url();
                } else {
                  imageUrl = urlFor(footer.companyInfo.logo).url();
                }

                console.log('Image URL:', imageUrl);

                return (
                  <Image
                    src={imageUrl}
                    alt={altText}
                    width={imageWidth}
                    height={imageHeight}
                    style={{
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                );
              })()}

            </div>
          ) : (
            // Fallback to text if no logo
            <>
              <h1 
                className="footer-company-name"
                style={{
                  fontFamily: 'var(--font-heading), serif',
                  fontSize: 'clamp(2rem, 4vw, 2rem)',
                  fontWeight: '300',
                  letterSpacing: '0.1em',
                  color: '#f5f5f0',
                  margin: '0'
                }}
              >
                {footer.companyInfo?.companyName || defaultFooterData.companyInfo.companyName}
              </h1>
              <div 
                className="footer-tagline"
                style={{
                  fontFamily: 'var(--font-heading), serif',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  letterSpacing: '0.05em',
                  color: '#f5f5f0',
                  marginTop: '0.5rem',
                  textTransform: 'uppercase'
                }}
              >
                {footer.companyInfo?.tagline || defaultFooterData.companyInfo.tagline}
              </div>
            </>
          )}
        </div>

        {/* Office locations - dynamic grid based on number of offices */}
        <div 
          className="footer-offices"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(sortedOffices.length, 4)}, 1fr)`,
            gap: '4rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {sortedOffices.map((office, index) => (
            <div key={office.city || index} className="footer-office">
              <h3 
                className="footer-office-city"
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  color: '#f5f5f0',
                  marginBottom: '1rem',
                  textTransform: 'uppercase'
                }}
              >
                {office.city}
              </h3>
              <div 
                className="footer-office-address"
                style={{
                  fontFamily: 'var(--font-body), var(--font-fallback)',
                  fontSize: '1rem',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  color: '#f5f5f0'
                }}
              >
                <div>{office.address?.line1}</div>
                <div>{office.address?.line2}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional Footer Navigation */}
        {footer.footerNavigation?.enabled && footer.footerNavigation.navigationSections && (
          <div 
            className="footer-navigation"
            style={{
              marginTop: '4rem',
              paddingTop: '3rem',
              borderTop: '1px solid #245148'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(footer.footerNavigation.navigationSections.length, 4)}, 1fr)`,
                gap: '2rem',
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              {footer.footerNavigation.navigationSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="footer-nav-section">
                  <h4 
                    style={{
                      fontFamily: 'var(--font-body), var(--font-fallback)',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#245148',
                      marginBottom: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {section.sectionTitle}
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {section.links?.map((link, linkIndex) => (
                      <li key={linkIndex} style={{ marginBottom: '0.5rem' }}>
                        <a 
                          href={link.url}
                          target={link.openInNewTab ? '_blank' : '_self'}
                          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                          style={{
                            fontFamily: 'var(--font-body), var(--font-fallback)',
                            fontSize: '1.1rem',
                            color: '#245148',
                            textDecoration: 'none',
                            transition: 'opacity 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.opacity = '0.7'}
                          onMouseOut={(e) => e.target.style.opacity = '1'}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Social Media Links */}
        {footer.socialMedia?.enabled && footer.socialMedia.links && (
          <div 
            className="footer-social"
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: footer.footerNavigation?.enabled ? 'none' : '1px solid #245148'
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                flexWrap: 'wrap'
              }}
            >
              {footer.socialMedia.links.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-body), var(--font-fallback)',
                    fontSize: '0.9rem',
                    color: '#BB7860',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '500',
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '0.7'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </footer>
  )
}