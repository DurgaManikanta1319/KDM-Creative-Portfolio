'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { FaGithub, FaLinkedinIn, FaMedium, FaInstagram, FaYoutube } from 'react-icons/fa'
import { FiChevronDown } from 'react-icons/fi'
import { motion } from 'framer-motion'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/AboutSection.module.css'

const BIO      = profile.bio
const WHO_ITEMS = profile.skills

const ICON_MAP = { GitHub: FaGithub, LinkedIn: FaLinkedinIn, Medium: FaMedium, Instagram: FaInstagram, YouTube: FaYoutube }

const SOCIALS = profile.socials.map(s => ({ Icon: ICON_MAP[s.label], href: s.href, label: s.label }))

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
    },
  },
}

export default function AboutSection() {
  const sectionRef  = useRef(null)
  const photoRef    = useRef(null)
  const contentRef  = useRef(null)
  const socialsRef  = useRef(null)

  const [isMobile, setIsMobile] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 768) return

    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let animated = false

    // Initial setup (hidden)
    const socialIcons = socialsRef.current?.querySelectorAll('a') ?? []
    gsap.set(photoRef.current,   { opacity: 0, x: -30 })
    gsap.set(contentRef.current, { opacity: 0, y: 25 })
    gsap.set(socialIcons, { opacity: 0, y: 15 })

    function playAnim() {
      if (animated) return
      animated = true
      gsap.to(photoRef.current,   { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' })
      gsap.to(contentRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 })
      gsap.to(socialIcons, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05, delay: 0.25 })
    }

    // Scroll trigger (play once)
    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < scroller.clientHeight * 0.6
      if (inRange) {
        playAnim()
        scroller.removeEventListener('scroll', onScroll)
      }
    }

    onScroll()

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* ─── DESKTOP ONLY VIEW ─── */}
      {!isMobile && (
        <>
          <div ref={photoRef} className={styles.photoCol}>
            <div className={styles.photoWrap}>
              <div className={styles.photoFrame} data-about-photo>
                <Image
                  src="/assets/durga-about-v4.jpg"
                  alt={profile.name.full}
                  fill
                  quality={100}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className={styles.photoImg}
                />
              </div>
            </div>

            <div ref={socialsRef} className={styles.socials}>
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`${styles.socialLink} ${styles[label.toLowerCase()]}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div ref={contentRef} className={styles.content}>
            <p className={styles.whoLabel}>Who I Am</p>
            <div className={styles.marqueeWrap}>
              <div className={styles.marqueeTrack}>
                {[...WHO_ITEMS, ...WHO_ITEMS].map((item, i) => (
                  <span key={i} className={styles.marqueeItem}>
                    {item}
                    <span className={styles.marqueeDot}>·</span>
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.bioWrap}>
              <p className={styles.bio}>
                {BIO}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ─── MOBILE ONLY REDESIGNED VIEW (Framer Motion Stagger) ─── */}
      {isMobile && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className={styles.mobileContainer}
        >
          {/* Section Label */}
          <motion.p variants={fadeUpVariants} className={styles.mobileLabel}>
            ABOUT ME
          </motion.p>

          {/* Section Heading */}
          <motion.h2 variants={fadeUpVariants} className={styles.mobileHeading}>
            Turning Ideas Into<br />Digital Experiences
          </motion.h2>

          {/* Image & Description Column */}
          <motion.div variants={fadeUpVariants} className={styles.mobilePhotoFrame}>
            <div className={styles.orangeGlow} />
            <Image
              src="/assets/durga-about-v4.jpg"
              alt={profile.name.full}
              fill
              quality={100}
              className={styles.mobilePhoto}
              sizes="100vw"
            />
          </motion.div>

          {/* Professional Summary (Truncated with Read More) */}
          <motion.div variants={fadeUpVariants} className={styles.mobileBioBlock}>
            <p className={`${styles.mobileBio} ${isExpanded ? styles.expanded : ''}`}>
              {BIO}
            </p>
            <button
              className={styles.mobileReadMoreBtn}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          </motion.div>

          {/* Skills Header */}
          <motion.h3 variants={fadeUpVariants} className={styles.mobileSectionSub}>
            MY SKILLS
          </motion.h3>

          {/* Skills Grid */}
          <motion.div variants={fadeUpVariants} className={styles.mobileSkillsGrid}>
            {WHO_ITEMS.map(skill => (
              <div key={skill} className={styles.mobileSkillCard}>
                <span className={styles.mobileSkillDot} />
                <span className={styles.mobileSkillName}>{skill}</span>
              </div>
            ))}
          </motion.div>

          {/* Socials Heading */}
          <motion.h3 variants={fadeUpVariants} className={styles.mobileSectionSubCentered}>
            LET&apos;S CONNECT
          </motion.h3>

          {/* Centered Glass Socials Row */}
          <motion.div variants={fadeUpVariants} className={styles.mobileSocialsRow}>
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={styles.mobileSocialCircle}
              >
                <Icon size={18} />
              </a>
            ))}
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            variants={fadeUpVariants}
            className={styles.mobileScrollHint}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('go-to-section', { detail: 3 }))
            }}
          >
            <span className={styles.mobileScrollText}>Swipe up for projects</span>
            <FiChevronDown size={18} className={styles.mobileChevron} />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
