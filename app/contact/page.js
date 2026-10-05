// app/page.js
// Updated to include inline expandableItems in services query

import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ApproachSection from '@/components/ApproachSection'
import ServicesSection from '@/components/ServicesSection'
import ImageGridTwoColumn from '@/components/ImageGridTwoColumn'
import TeamSection from '@/components/TeamSection'
import HeroSection from '@/components/HeroSection'
import RandomImageGrid from '@/components/RandomImageGrid'
import FullBleedVideoSection from '@/components/FullBleedVideoSection'
import FullBleedImageSection from '@/components/FullBleedImageSection'
import HeroTextSection from '@/components/HeroTextSection'
import QuoteSection from '@/components/QuoteSection'
import Footer from '@/components/Footer'
import SmoothScroll from '@/components/SmoothScroll'
import ScrollReveal from '@/components/ScrollReveal'



async function getHomepageData() {
  const query = `{
    "homepage": *[_type == "landingPage"][0]{
      heroSection {
        mediaType,
        images[]{
          asset,
          alt
        },
        videos[]{
          asset,
          alt,
          poster {
            asset,
            alt
          }
        },
        headline,
        preheader
      },
      approachSection {
        headline,
        approaches[]{
          _key,
          title,
          description,
          image {
            asset,
            alt
          },
          imageCaption
        }
      },
      ourApproach {
        headline,
        copy,
        callToAction {
          text,
          link
        }
      },
      imageGridSection {
        images[]{
          asset,
          alt
        }
      },
      fullBleedImage1 {
        image {
          asset,
          alt
        },
        height,
        minHeight
      },
      heroTextSection {
        image {
          asset,
          alt
        },
        headline
      },
      servicesSection {
        headline,
        introduction,
        services[]{
          _key,
          title,
          description[]{
            ...,
            _type == "expandableItem" => {
              _key,
              _type,
              title,
              content
            }
          },
          image {
            asset,
            alt
          },
          imageCaption
        }
      },
      fullBleedImage2 {
        image {
          asset,
          alt
        },
        height,
        minHeight
      },
      hero3Section {
        mediaType,
        images[]{
          asset,
          alt
        },
        videos[]{
          asset,
          alt,
          poster {
            asset,
            alt
          }
        },
        headline,
        preheader
      },
      seniorTeamSection {
        headline,
        introduction,
        callToAction {
          text,
          link
        },
        "teamMembers": teamMembers[]{
          "member": @-> {
            _id,
            profileImage {
              asset,
              alt
            },
            name,
            jobTitle,
            location,
            linkedin,
            bio
          }
        }[].member
      },
      careersSection {
        headline,
        introduction,
        contactEmail,
        internshipInfo
      },
      fullBleedImage3 {
        image {
          asset,
          alt
        },
        height,
        minHeight
      }
    },
    "globalSettings": *[_type == "globalSettings"][0]{
      logoSettings {
        primaryLogo {
          asset,
          alt
        },
        secondaryLogo {
          asset,
          alt
        }
      },
      mapSettings {
        mapImage {
          asset,
          alt
        }
      },
      navigation {
        headerNav[]{
          label,
          link,
          openInNewTab
        }
      }
    },
    "footerSettings": *[_type == "footerSettings"][0]{
      companyInfo {
        logo {
          asset->{
            _id,
            url
          },
          alt,
          width,
          height
        },
        companyName,
        tagline,
        copyrightText
      },
      offices[] {
        city,
        address {
          line1,
          line2
        },
        order
      } | order(order asc),
      footerNavigation {
        enabled,
        navigationSections[] {
          sectionTitle,
          links[] {
            label,
            url,
            openInNewTab
          }
        }
      },
      socialMedia {
        enabled,
        links[] {
          platform,
          url
        }
      }
    }
  }`
  
  const data = await client.fetch(query)
  return data
}

export default async function Home() {
  const { homepage, globalSettings, footerSettings } = await getHomepageData()

  if (!homepage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please add Homepage content in Sanity Studio</p>
      </div>
    )
  }

  return (
    <main className="homepage">
      {/* Navigation */}
      <Navigation globalSettings={globalSettings} />

      {/* Hero Section 1 */}
      <HeroSection 
        heroData={homepage.heroSection}
        defaultPreheader="Fast finders, analysts and problem solvers"
        defaultHeadline="Providing clarity when there is uncertainty"
      />

      {/* Random Image Grid with Approach Toggles */}
      <RandomImageGrid 
        imageGridData={homepage.imageGridSection}
        approachData={homepage.approachSection}
      />

      {/* Full Bleed Image Section 1 */}
      {homepage.fullBleedImage1 && (
        <FullBleedImageSection 
          imageData={homepage.fullBleedImage1.image}
          height={homepage.fullBleedImage1.height || "60vh"}
          minHeight={`${homepage.fullBleedImage1.minHeight || 500}px`}
        />
      )}

      {/* Services Section */}
      {homepage.servicesSection && (
        <ServicesSection servicesData={homepage.servicesSection} />
      )}

      {/* Full Bleed Image Section 2 */}
      {homepage.fullBleedImage2 && (
        <FullBleedImageSection 
          imageData={homepage.fullBleedImage2.image}
          height={homepage.fullBleedImage2.height || "60vh"}
          minHeight={`${homepage.fullBleedImage2.minHeight || 450}px`}
        />
      )}

      {/* Team Section */}
      {homepage.seniorTeamSection && (
        <TeamSection 
          teamData={homepage.seniorTeamSection} 
          careersData={homepage.careersSection}
        />
      )}

      {/* Full Bleed Image Section 3 */}
      {homepage.fullBleedImage3 && (
        <FullBleedImageSection 
          imageData={homepage.fullBleedImage3.image}
          height={homepage.fullBleedImage3.height || "60vh"}
          minHeight={`${homepage.fullBleedImage3.minHeight || 500}px`}
        />
      )}

      {/* Footer */}
      <Footer footerData={footerSettings} />
      <ScrollReveal />


    </main>
  )
}