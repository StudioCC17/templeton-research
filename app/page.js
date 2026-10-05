// app/page.js
// Includes the InsightOverlay mount point so ?article=slug opens an overlay.

import { Suspense } from 'react'
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
import InsightsSection from '@/components/InsightsSection'
import InsightOverlay from '@/components/InsightOverlay'
import InsightsIndexOverlay from '@/components/InsightsIndexOverlay'
import Footer from '@/components/Footer'
import OfficesStrip from '@/components/OfficesStrip'
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
            },
            _type == "textCard" => {
              _key,
              _type,
              title,
              body,
              expandableItems[]{
                _key,
                title,
                content
              }
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
        "teamMemberRefs": teamMembers[]._ref,
        "teamMembers": teamMembers[]->{
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
      },
      careersSection {
        headline,
        introduction,
        contactEmail,
        internshipInfo
      },
      insightsSection {
        enabled,
        headline,
        introduction,
        displayMode,
        articleCount,
        "featuredArticleRefs": featuredArticles[]._ref,
        "featuredArticles": featuredArticles[]->{
          _id,
          title,
          slug,
          publishDate,
          category,
          excerpt,
          featuredImage {
            asset,
            alt
          }
        },
        callToAction {
          text,
          link
        }
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
      },
      aboutSection {
    headline,
    copy,
    image { asset, alt },
    callToAction { text, link }
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

async function getLatestInsightArticles(count = 3) {
  const query = `*[_type == "insightArticle"] | order(featured desc, publishDate desc) [0...$count]{
    _id,
    title,
    slug,
    publishDate,
    category,
    excerpt,
    featuredImage {
      asset,
      alt
    }
  }`
  return await client.fetch(query, { count })
}

export default async function Home() {
  const { homepage, globalSettings, footerSettings } = await getHomepageData()

  if (homepage?.seniorTeamSection?.teamMemberRefs && homepage?.seniorTeamSection?.teamMembers) {
    const refs = homepage.seniorTeamSection.teamMemberRefs
    homepage.seniorTeamSection.teamMembers.sort((a, b) => {
      return refs.indexOf(a._id) - refs.indexOf(b._id)
    })
  }

  let insightArticles = []
  const insightsConfig = homepage?.insightsSection
  if (insightsConfig?.enabled !== false) {
    if (insightsConfig?.displayMode === 'manual') {
      const refs = insightsConfig.featuredArticleRefs || []
      const fetched = insightsConfig.featuredArticles || []
      insightArticles = refs
        .map((id) => fetched.find((a) => a._id === id))
        .filter(Boolean)
    } else {
      // Large screens show a row of 5 (smaller screens show the first 3 - see
      // InsightsSection.module.css), so fetch at least 5
      const count = Math.max(insightsConfig?.articleCount || 3, 5)
      insightArticles = await getLatestInsightArticles(count)
    }
  }

  if (!homepage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please add Homepage content in Sanity Studio</p>
      </div>
    )
  }

  return (
    <main className="homepage">
      <Navigation globalSettings={globalSettings} aboutData={globalSettings?.aboutSection} />

      <HeroSection
        heroData={homepage.heroSection}
        defaultPreheader="Fast finders, analysts and problem solvers"
        defaultHeadline="Providing clarity when there is uncertainty"
      />

      {homepage.servicesSection && (
        <ServicesSection servicesData={homepage.servicesSection} />
      )}

      {homepage.fullBleedImage2 && (
        <FullBleedImageSection
          imageData={homepage.fullBleedImage2.image}
          height={homepage.fullBleedImage2.height || "60vh"}
          minHeight={`${homepage.fullBleedImage2.minHeight || 450}px`}
        />
      )}

      {homepage.seniorTeamSection && (
        <TeamSection
          teamData={homepage.seniorTeamSection}
          careersData={homepage.careersSection}
        />
      )}

      {homepage.insightsSection && insightArticles.length > 0 && (
        <Suspense fallback={null}>
          <InsightsSection
            insightsData={homepage.insightsSection}
            articles={insightArticles}
          />
        </Suspense>
      )}

      {homepage.fullBleedImage3 && (
        <FullBleedImageSection
          imageData={homepage.fullBleedImage3.image}
          height={homepage.fullBleedImage3.height || "60vh"}
          minHeight={`${homepage.fullBleedImage3.minHeight || 400}px`}
        />
      )}

      <Footer footerData={footerSettings} />

      {/* Offices with live local times, under the footer */}
      <OfficesStrip offices={footerSettings?.offices || []} />

      {/* Scroll-in animations for anything marked data-reveal */}
      <ScrollReveal />

      {/*
        InsightOverlay watches the ?article=slug query param and renders
        a full-screen overlay when present. Wrapped in Suspense because it
        uses useSearchParams() which Next.js requires.
      */}
      <Suspense fallback={null}>
        <InsightsIndexOverlay />
      </Suspense>
      <Suspense fallback={null}>
        <InsightOverlay />
      </Suspense>
    </main>
  )
}
