// app/layout.js
// Fixed layout.js with async scripts for Vercel deployment
import LegalOverlayMount from '@/components/LegalOverlayMount'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://www.templetonresearch.com'),
  title: 'Templeton Research',
  description: 'Providing clarity when there is uncertainty',
  openGraph: {
    title: 'Templeton Research',
    description: 'Providing clarity when there is uncertainty',
    siteName: 'Templeton Research',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Templeton Research',
    description: 'Providing clarity when there is uncertainty',
  },
}

export const viewport = {
  themeColor: '#245148',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Turns on the scroll-reveal starting states (see ScrollReveal.js). Falls
            back to showing everything if the animations haven't started in 4s. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js-reveal');setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.remove('js-reveal')},4000)",
          }}
        />
        {/* Adobe Fonts (Typekit) */}
        <link rel="stylesheet" href="https://use.typekit.net/bfr8lmv.css" />
        {/* GSAP for text animations and parallax */}
        <script 
          async
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        />
        <script 
          async
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"
        />
        {/* GSAP ScrollTo plugin for smooth navigation scrolling */}
        <script 
          async
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js"
        />
        {/* Lenis Smooth Scroll */}
        <script 
          async
          src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.39/dist/lenis.min.js"
        />
      </head>
      <body className={inter.className}>
        {children}
        <LegalOverlayMount />
      </body>

    </html>
  )
}