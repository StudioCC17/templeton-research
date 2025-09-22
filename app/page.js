// app/page.js
// Updated with footer query and CaseStudiesSection replacing StatsTable

import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ApproachSection from '@/components/ApproachSection'
import ServicesSection from '@/components/ServicesSection'
import TeamSection from '@/components/TeamSection'
import InteractiveCaseStudyMap from '@/components/InteractiveCaseStudyMap'
import HeroSection from '@/components/HeroSection'
import RandomImageGrid from '@/components/RandomImageGrid'
import CaseStudiesSection from '@/components/CaseStudiesSection'
import HeroTextSection from '@/components/HeroTextSection'
import CareersSection from '@/components/CareersSection'
import Footer from '@/components/Footer'
import SmoothScroll from '@/components/SmoothScroll'

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
          description,
          image {
            asset,
            alt
          },
          imageCaption
        }
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
        teamMembers[]->{
          _id,
          profileImage {
            asset,
            alt
          },
          name,
          jobTitle,
          location,
          bio
        } | order(order asc, name asc)
      },
      careersSection {
        headline,
        copy,
        callToAction {
          text,
          link
        }
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
    },
    "caseStudies": *[_type == "caseStudy"] | order(featured desc, date desc) {
      _id,
      title,
      slug,
      date,
      location,
      type,
      copy,
      image {
        asset,
        alt
      },
      callToAction {
        text,
        link,
        style
      },
      coordinates {
        lat,
        lng
      },
      featured,
      order
    }
  }`
  
  const data = await client.fetch(query)
  return data
}

export default async function Home() {
  const { homepage, globalSettings, footerSettings, caseStudies } = await getHomepageData()

  console.log('Team members data:', homepage.seniorTeamSection?.teamMembers)
  console.log('Footer data:', footerSettings)
  
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

      {/* Our Approach Section - Uses real Sanity data */}
      {homepage.approachSection && (
        <ApproachSection approachData={homepage.approachSection} />
      )}

      {/* Random Image Grid Section - Between Approach and Services */}
      <RandomImageGrid 
        imageGridData={homepage.imageGridSection}
      />

      {/* Services Section */}
      {homepage.servicesSection && (
        <ServicesSection servicesData={homepage.servicesSection} />
      )}

      {/* Case Studies Section - Replacing Stats Table */}
      <CaseStudiesSection caseStudies={caseStudies} />

      {/* Hero Text Section - Portrait Image with Text */}
      {/* Commented out - uncomment if needed
      {homepage.heroTextSection && (
        <HeroTextSection heroTextData={homepage.heroTextSection} />
      )}
      */}

      {/* Team Section */}
      {homepage.seniorTeamSection && (
        <TeamSection teamData={homepage.seniorTeamSection} />
      )}

      {/* Careers Section */}
      {homepage.careersSection && (
        <CareersSection careersData={homepage.careersSection} />
      )}

      {/* Footer */}
      <Footer footerData={footerSettings} />
    </main>
  )
}