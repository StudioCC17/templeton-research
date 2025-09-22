'use client'

import React, { useState, useRef, useEffect } from 'react';
import { urlFor } from '@/lib/sanity';

const InteractiveCaseStudyMap = ({ caseStudies = [], mapImage }) => {
  const [expandedStudyId, setExpandedStudyId] = useState(null);
  const contentRefs = useRef([]);
  const accordionRef = useRef(null);
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const lineRef = useRef(null);

  const expandedStudy = caseStudies.find(study => study._id === expandedStudyId);

  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        const study = caseStudies[index];
        if (expandedStudyId === study?._id) {
          if (window.gsap) {
            window.gsap.to(ref, {
              maxHeight: ref.scrollHeight,
              duration: 0.6,
              ease: "power2.out"
            });
          } else {
            ref.style.maxHeight = ref.scrollHeight + 'px';
          }
        } else {
          if (window.gsap) {
            window.gsap.to(ref, {
              maxHeight: 0,
              duration: 0.4,
              ease: "power2.inOut"
            });
          } else {
            ref.style.maxHeight = '0px';
          }
        }
      }
    });
  }, [expandedStudyId, caseStudies]);

  const handleStudyClick = (study) => {
    if (expandedStudyId === study._id) {
      setExpandedStudyId(null);
    } else {
      if (expandedStudyId && lineRef.current && window.gsap) {
        window.gsap.set(lineRef.current, {
          strokeDashoffset: 1000
        });
      }
      
      setExpandedStudyId(study._id);
      
      setTimeout(() => {
        if (lineRef.current && window.gsap) {
          window.gsap.set(lineRef.current, {
            strokeDashoffset: 1000
          });
          
          window.gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            duration: 0.8,
            delay: 0.5,
            ease: "power2.out"
          });
        }
      }, 100);
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    setExpandedStudyId(null);
  };

  const getStraightLineCoordinates = () => {
    if (!expandedStudy || !expandedStudy.coordinates || !mapRef.current || !containerRef.current) {
      return null;
    }

    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      const mapRect = mapRef.current.getBoundingClientRect();
      
      const x = ((expandedStudy.coordinates.lng + 180) / 360) * 100;
      const y = ((90 - expandedStudy.coordinates.lat) / 180) * 100;
      const markerX = (mapRect.width * x / 100) + (mapRect.left - containerRect.left);
      const markerY = (mapRect.height * y / 100) + (mapRect.top - containerRect.top);
      
      const accordionLeft = mapRect.width + 48;
      const targetX = accordionLeft - 5;
      const targetY = (mapRect.top - containerRect.top) + 76;
      
      return {
        startX: targetX,
        startY: targetY,
        endX: markerX,
        endY: markerY
      };
    } catch (error) {
      return null;
    }
  };

  const lineCoords = expandedStudy ? getStraightLineCoordinates() : null;

  const getMapImageSrc = () => {
    if (mapImage?.asset?._ref) {
      return urlFor(mapImage).url();
    }
    return "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg";
  };

  const getMapImageAlt = () => {
    return mapImage?.alt || "World map showing case study locations";
  };

  const expandedIndex = caseStudies.findIndex(s => s._id === expandedStudyId);
  
  return (
    <div className="text-section" style={{ backgroundColor: '#f5f5f0', height: '100vh', position: 'relative' }}>
      
      {/* Header Text - Simple centered at top */}
      <div style={{ textAlign: 'center'}}>
        <div className="section-label">GLOBAL REACH</div>
        <h2 className="section-headline">Case Studies</h2>
        <p className="section-paragraph" style={{ textAlign: 'center' }}>
          Click on any location to explore our work around the world.
        </p>
      </div>
      
      {/* Map and Accordion - Absolutely positioned and centered */}
      <div style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '1400px',
        padding: '0 2rem'
      }}>
        <div 
          ref={containerRef}
          style={{ 
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '3rem',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          
          <div 
            ref={mapRef}
            style={{ 
              position: 'relative',
              backgroundColor: '#f5f5f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <img 
              src={getMapImageSrc()}
              alt={getMapImageAlt()}
              style={{ 
                width: '100%',
                height: 'auto',
                display: 'block',
                filter: 'sepia(100%) saturate(50%) hue-rotate(120deg) brightness(0.8)'
              }}
            />
            
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(245, 245, 240, 0.3)'
            }}></div>

            {caseStudies.map((study, index) => {
              if (!study.coordinates) return null;
              
              const x = ((study.coordinates.lng + 180) / 360) * 100;
              const y = ((90 - study.coordinates.lat) / 180) * 100;
              
              const isExpanded = expandedStudyId === study._id;
              
              return (
                <button
                  key={study._id}
                  onClick={() => handleStudyClick(study)}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '17px',
                    height: '17px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: isExpanded ? '#BB7860' : '#245148',
                    cursor: 'pointer',
                    transition: isExpanded ? 'background-color 0.3s ease 0.8s' : 'background-color 0.2s ease',
                    zIndex: isExpanded ? 20 : 10
                  }}
                  onMouseOver={(e) => {
                    if (!isExpanded) {
                      e.target.style.backgroundColor = '#BB7860';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isExpanded) {
                      e.target.style.backgroundColor = '#245148';
                    }
                  }}
                  title={`${study.title} - ${study.location}`}
                >
                  <span style={{ 
                    color: 'white', 
                    fontSize: '9px', 
                    fontWeight: 'bold',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}>
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div style={{
            backgroundColor: '#f5f5f0',
            padding: '2rem',
            borderRadius: '8px',
            minHeight: '400px',
            position: 'relative'
          }}>
            
            <div ref={accordionRef} className="case-studies-accordion" style={{ position: 'relative' }}>
              
              {caseStudies.map((study, index) => {
                const isExpanded = expandedStudyId === study._id;
                
                let moveDistance = 0;
                if (expandedIndex !== -1) {
                  if (index === expandedIndex) {
                    moveDistance = -(expandedIndex * 80);
                  } else if (index > expandedIndex) {
                    moveDistance = -(expandedIndex * 80);
                  }
                }
                
                return (
                  <div 
                    key={study._id} 
                    className={`case-study-item ${isExpanded ? 'case-study-item--active' : ''}`}
                    style={{
                      position: 'relative',
                      zIndex: isExpanded ? 10 : 1,
                      transform: `translateY(${moveDistance}px)`,
                      willChange: 'transform',
                      boxShadow: isExpanded ? '0 12px 40px rgba(0, 0, 0, 0.15)' : 'none',
                      border: '0px solid transparent',
                      borderRadius: '6px',
                   
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => handleStudyClick(study)}
                        className="case-study-toggle"
                      >
                        <div className="case-study-location" style={{ color: '#BB7860' }}>
                          {study.location}
                        </div>
                        <div className="case-study-title section-paragraph">
                          {study.title}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <button
                          onClick={handleCloseClick}
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid #BB7860',
                            backgroundColor: 'white',
                            color: '#BB7860',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            zIndex: 11
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#BB7860';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#BB7860';
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="Close"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    <div 
                      ref={el => contentRefs.current[index] = el}
                      style={{ maxHeight: 0, overflow: 'hidden' }}
                    >
                      <div className="case-study-content-inner">
                        {study.type && (
                          <span className="case-study-type">
                            {study.type}
                          </span>
                        )}
                        
                        <div className="case-study-description">
                          {study.copy && study.copy.length > 0 ? (
                            study.copy.map((block, blockIndex) => {
                              if (block._type === 'block' && block.children) {
                                const text = block.children.map(child => child.text).join('');
                                return (
                                  <p 
                                    key={blockIndex}
                                    className="case-study-paragraph"
                                  >
                                    {text}
                                  </p>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <p className="case-study-paragraph case-study-placeholder">
                              Case study details coming soon...
                            </p>
                          )}
                        </div>
                        
                        {study.callToAction && study.callToAction.text && (
                          <a 
                            href={study.callToAction.link || '#'}
                            className="case-study-cta"
                          >
                            {study.callToAction.text}
                            <span className="cta-arrow">→</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {caseStudies.length === 0 && (
              <p style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '1rem',
                color: '#666',
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: '2rem'
              }}>
                No case studies available yet.
              </p>
            )}
          </div>

          {expandedStudy && lineCoords && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5
              }}
            >
              <line
                ref={lineRef}
                x1={lineCoords.startX}
                y1={lineCoords.startY}
                x2={lineCoords.endX}
                y2={lineCoords.endY}
                stroke="white"
                strokeWidth="1"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveCaseStudyMap;