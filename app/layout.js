// app/layout.js
// Updated layout.js file with GSAP and ScrollTrigger for text animations and parallax
// Added ScrollTo plugin for smooth navigation scrolling

import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Templeton Research',
  description: 'Providing clarity when there is uncertainty',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Adobe Fonts (Typekit) */}
        <link rel="stylesheet" href="https://use.typekit.net/bfr8lmv.css" />
        {/* GSAP for text animations and parallax */}
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        />
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"
        />
        {/* GSAP ScrollTo plugin for smooth navigation scrolling */}
       {/* GSAP ScrollTo plugin for smooth navigation scrolling */}
       <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js"
        />
        {/* Lenis Smooth Scroll */}
        <script 
          src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.39/dist/lenis.min.js"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}