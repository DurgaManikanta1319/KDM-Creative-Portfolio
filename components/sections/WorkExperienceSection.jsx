'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { motion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'

const EXPS = profile.experience

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export default function WorkExperienceSection() {
  const sectionRef        = useRef(null)
  const lineRef           = useRef(null)
  const dotRefs           = useRef([])
  const cardRefs          = useRef([])
  const tlRef             = useRef(null)
  const bulletListRefs    = useRef([])
  const collapsedHeights  = useRef([])
  const hoverTlsRef       = useRef([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Capture each bullet list's natural collapsed height after first paint
  useEffect(() => {
    if (isMobile) return
    const id = requestAnimationFrame(() => {
      bulletListRefs.current.forEach((ul, i) => {
        if (ul) collapsedHeights.current[i] = ul.clientHeight
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isMobile])

  function handleCardEnter(i) {
    if (isMobile) return
    const ul  = bulletListRefs.current[i]
    const dot = dotRefs.current[i]
    if (!ul) return
    hoverTlsRef.current[i]?.kill()
    const tl = gsap.timeline()
    hoverTlsRef.current[i] = tl
    tl.to(ul,  { maxHeight: ul.scrollHeight, duration: 0.5, ease: 'power2.out' }, 0)
      .to(ul,  { borderLeftColor: 'rgba(247,147,30,0.6)', duration: 0.3 }, 0)
      .to(dot, { scale: 1.1, boxShadow: '0 0 0 8px rgba(247,147,30,0.12), 0 0 28px rgba(247,147,30,0.22)', duration: 0.3, ease: 'back.out(2)' }, 0)
  }

  function handleCardLeave(i) {
    if (isMobile) return
    const ul  = bulletListRefs.current[i]
    const dot = dotRefs.current[i]
    if (!ul) return
    hoverTlsRef.current[i]?.kill()
    const collapsed = collapsedHeights.current[i] ?? 80
    const tl = gsap.timeline()
    hoverTlsRef.current[i] = tl
    tl.to(ul,  { maxHeight: collapsed, duration: 0.35, ease: 'power2.in' }, 0)
      .to(ul,  { borderLeftColor: 'rgba(247,147,30,0.2)', duration: 0.25 }, 0)
      .to(dot, { scale: 1, boxShadow: '0 0 0 6px rgba(247,147,30,0.05), 0 0 22px rgba(247,147,30,0.1)', duration: 0.25, ease: 'power2.in' }, 0)
  }

  useEffect(() => {
    if (isMobile) return
    const section = sectionRef.current
    if (!section || !lineRef.current) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let animated = false

    // Initial setup (hidden)
    gsap.set(lineRef.current,      { scaleX: 0, transformOrigin: 'left center' })
    dotRefs.current.forEach(el  => el && gsap.set(el,  { scale: 0, opacity: 0 }))
    cardRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 20 }))

    function playAnim() {
      if (animated) return
      animated = true
      
      const n  = EXPS.length
      const tl = gsap.timeline()
      tlRef.current = tl
      tl.to(lineRef.current, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0)
      EXPS.forEach((_, i) => {
        const t = i === 0 ? 0.04 : 0.04 + (i / (n - 1)) * 0.6
        tl.to(dotRefs.current[i],  { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' }, t)
        tl.to(cardRefs.current[i], { opacity: 1, y: 0,    duration: 0.35, ease: 'power2.out'  }, t + 0.08)
      })
    }

    // Scroll trigger (play once)
    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < scroller.clientHeight * 0.6
      if (inRange) {
        playAnim()
        scroller.removeEventListener('scroll', onScroll)
      }
    }

    // Check immediately in case we start on this section
    onScroll()

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [isMobile])

  return (
    <div
      style={{
        height: isMobile ? '100svh' : '100vh',
      }}
    >
      <section ref={sectionRef} className={styles.section}>

        {/* ─── DESKTOP ONLY VIEW ─── */}
        {!isMobile && (
          <>
            <div className={styles.bgImg} aria-hidden>
              <Image
                src="/assets/work-experience-v2.jpg"
                alt=""
                fill
                quality={100}
                sizes="100vw"
                className={styles.bgImgEl}
              />
            </div>

            <div className={styles.header}>
              <span className={styles.label}>Work Experience</span>
              <span className={styles.labelRight}>0{EXPS.length} Companies</span>
            </div>

            <div className={styles.timeline}>
              <div className={styles.timelineBody}>
                {/* Snake connector */}
                <div ref={lineRef} className={styles.snakeLine} />

                {/* Entry columns */}
                <div className={styles.entries}>
                  {EXPS.map((exp, i) => (
                    <div
                      key={exp.id}
                      className={styles.entry}
                      onMouseEnter={() => handleCardEnter(i)}
                      onMouseLeave={() => handleCardLeave(i)}
                    >
                      <div
                        ref={el => { dotRefs.current[i] = el }}
                        className={styles.dot}
                      >
                        <span className={styles.dotNum}>0{i + 1}</span>
                      </div>

                      <div
                        ref={el => { cardRefs.current[i] = el }}
                        className={styles.card}
                      >
                        <div className={styles.cardHead}>
                          <span className={styles.period}>{exp.period} - {exp.periodEnd}</span>
                          <span className={styles.typeTag}>{exp.type}</span>
                          {exp.location && <span className={styles.location}>{exp.location}</span>}
                        </div>
                        <h2 className={styles.company}>{exp.company}</h2>
                        <p  className={styles.role}>{exp.role}</p>
                        <ul
                          ref={el => { bulletListRefs.current[i] = el }}
                          className={styles.bullets}
                        >
                          {exp.bullets.map((b, bi) => (
                            <li key={bi} className={styles.bullet}>{b}</li>
                          ))}
                        </ul>
                        <div className={styles.stack}>
                          {exp.tech.map(t => (
                            <span key={t} className={styles.tag}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── MOBILE ONLY REDESIGNED VIEW ─── */}
        {isMobile && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className={styles.mobileContainer}
          >
            <motion.span variants={fadeUpVariants} className={styles.mobileLabel}>
              WORK EXPERIENCE
            </motion.span>
            <motion.h2 variants={fadeUpVariants} className={styles.mobileHeading}>
              Professional<br />Journey &amp; Roles
            </motion.h2>

            <div className={styles.mobileCardsStack}>
              {EXPS.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  variants={fadeUpVariants}
                  whileTap={{ scale: 0.98 }}
                  className={styles.mobileCard}
                >
                  <span className={styles.mobileCardNum}>0{i + 1}</span>
                  <div className={styles.mobileCardHeader}>
                    <h3 className={styles.mobileCardCompany}>{exp.company}</h3>
                    <span className={styles.mobileCardPeriod}>{exp.period} - {exp.periodEnd}</span>
                  </div>
                  <h4 className={styles.mobileCardRole}>{exp.role}</h4>
                  
                  <ul className={styles.mobileCardBullets}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className={styles.mobileCardBullet}>{b}</li>
                    ))}
                  </ul>

                  <div className={styles.mobileCardTech}>
                    {exp.tech.map(t => (
                      <span key={t} className={styles.mobileCardTag}>{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUpVariants}
              className={styles.mobileScrollHint}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('go-to-section', { detail: 5 }))
              }}
            >
              <span className={styles.mobileScrollText}>Swipe up to contact</span>
              <FiChevronDown size={18} className={styles.mobileChevron} />
            </motion.div>
          </motion.div>
        )}

      </section>
    </div>
  )
}
