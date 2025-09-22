// components/TeamSection.js
// Team members grid component

import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'

export default function TeamSection({ teamData }) {
  if (!teamData?.teamMembers || teamData.teamMembers.length === 0) {
    return null
  }

  // Create unique keys by combining _id with index to handle duplicate IDs
  const getUniqueKey = (member, index) => {
    if (member._id) {
      return `${member._id}-${index}` // Combine _id with index for guaranteed uniqueness
    }
    if (member.name && member.jobTitle) {
      return `${member.name}-${member.jobTitle}-${index}`
    }
    if (member.name) {
      return `${member.name}-${index}`
    }
    return `team-member-${index}` // Final fallback
  }

  return (
    <section className="team-section">
      <div className="team-container">
        {/* Section Header */}
        <div className="team-header">
          <div className="team-header-left">
        
            {teamData.headline && (
              <h2 className="team-headline">{teamData.headline}</h2>
            )}
          </div>
          
          <div className="team-header-right">
            {teamData.introduction && (
              <div className="team-introduction">
                {typeof teamData.introduction === 'string' ? (
                  <p>{teamData.introduction}</p>
                ) : (
                  <PortableText 
                    value={teamData.introduction}
                    components={{
                      block: {
                        normal: ({children}) => <p>{children}</p>,
                      },
                    }}
                  />
                )}
              </div>
            )}
            {teamData.callToAction?.text && (
              <a 
                href={teamData.callToAction.link || '#'}
                className="team-cta"
              >
                {teamData.callToAction.text}
                <span className="cta-arrow">→</span>
              </a>
            )}
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="team-grid">
          {teamData.teamMembers.map((member, index) => (
            <div key={getUniqueKey(member, index)} className="team-member">
              {/* Profile Image */}
              {member.profileImage && (
                <div className="team-member-image-wrapper">
                  <Image
                    src={urlFor(member.profileImage).url()}
                    alt={member.profileImage.alt || member.name}
                    width={400}
                    height={400}
                    className="team-member-image"
                  />
                </div>
              )}
              
              {/* Member Info */}
              <div className="team-member-info">
                <h3 className="team-member-name">{member.name}</h3>
                {member.jobTitle && (
                  <p className="team-member-title">{member.jobTitle}</p>
                )}
                {member.location && (
                  <p className="team-member-location">{member.location}</p>
                )}
                {member.bio && (
                  <p className="team-member-bio">{member.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}