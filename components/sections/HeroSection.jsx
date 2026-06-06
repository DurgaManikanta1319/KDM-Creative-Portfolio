'use client'

import { useEffect, useRef, Fragment, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { FaGithub, FaLinkedinIn, FaInstagram } from 'react-icons/fa'
import { FiArrowUpRight, FiChevronDown } from 'react-icons/fi'
import { gsap } from '@/lib/gsap'
import { motion } from 'framer-motion'

import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/HeroSection.module.css'

const HeroBackground = dynamic(() => import('@/components/three/HeroBackground'), { ssr: false })

const SOCIAL_ICON_MAP = { GitHub: FaGithub, LinkedIn: FaLinkedinIn, Instagram: FaInstagram }
const SIDEBAR_LABELS  = ['Instagram', 'GitHub', 'LinkedIn']

function splitTagline(text, highlight) {
  if (!highlight) return [text]
  const parts = text.split(highlight)
  return parts.reduce((acc, part, i) => {
    acc.push(part)
    if (i < parts.length - 1) {
      acc.push(<span key={i} className={styles.taglineAccent}>{highlight}</span>)
    }
    return acc
  }, [])
}

const rolesList = ['Creative Designer', 'Video Editor', 'Web Developer']

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

export default function HeroSection() {
  const sectionRef     = useRef(null)
  const greetRef       = useRef(null)
  const roleRef        = useRef(null)
  const firstName      = useRef(null)
  const lastName       = useRef(null)
  const photoRef       = useRef(null)
  const pillsRef       = useRef(null)
  const ctaBtnRef      = useRef(null)
  const statsRef       = useRef(null)
  const taglineCardRef = useRef(null)
  const availCardRef   = useRef(null)
  const socialRef      = useRef(null)

  // Mobile typewriter state
  const [roleText, setRoleText] = useState('')
  const [roleIdx, setRoleIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!isMobile) return

    let timer
    const currentFullText = rolesList[roleIdx]

    const type = () => {
      setRoleText(prev => {
        if (isDeleting) {
          return currentFullText.substring(0, prev.length - 1)
        } else {
          return currentFullText.substring(0, prev.length + 1)
        }
      })

      if (!isDeleting && roleText === currentFullText) {
        timer = setTimeout(() => setIsDeleting(true), 1600)
      } else if (isDeleting && roleText === '') {
        setIsDeleting(false)
        setRoleIdx(prev => (prev + 1) % rolesList.length)
      } else {
        timer = setTimeout(type, isDeleting ? 30 : 60)
      }
    }

    timer = setTimeout(type, isDeleting ? 30 : 60)
    return () => clearTimeout(timer)
  }, [roleText, isDeleting, roleIdx, isMobile])

  function handleViewProjects() {
    window.dispatchEvent(new CustomEvent('go-to-section', { detail: 3 }))
  }

  // Desktop animations
  useEffect(() => {
    if (window.innerWidth < 768) return

    const section = sectionRef.current
    if (!section) return

    const fadeY = [
      greetRef.current, roleRef.current,
      firstName.current, lastName.current,
      pillsRef.current, ctaBtnRef.current, statsRef.current,
    ].filter(Boolean)

    const fadeX = [taglineCardRef.current, availCardRef.current].filter(Boolean)

    gsap.set(fadeY, { opacity: 0, y: 30 })
    gsap.set(fadeX, { opacity: 0, x: 20 })
    if (photoRef.current)  gsap.set(photoRef.current,  { opacity: 0, x: 80 })
    if (socialRef.current) gsap.set(socialRef.current, { opacity: 0, x: -20 })

    const tl = gsap.timeline({ paused: true })
    tl.to(greetRef.current,       { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      .to(roleRef.current,        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '-=0.15')
      .to(firstName.current,      { opacity: 1, y: 0, duration: 0.3,  ease: 'power2.out' }, '-=0.1')
      .to(lastName.current,       { opacity: 1, y: 0, duration: 0.3,  ease: 'power2.out' }, '-=0.2')
      .to(photoRef.current,       { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, '-=0.25')
      .to(pillsRef.current,       { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '-=0.15')
      .to(ctaBtnRef.current,      { opacity: 1, y: 0, duration: 0.2,  ease: 'power2.out' }, '-=0.1')
      .to(statsRef.current,       { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '-=0.1')
      .to(taglineCardRef.current, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, '-=0.25')
      .to(availCardRef.current,   { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, '-=0.15')
      .to(socialRef.current,      { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, '-=0.2')

    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { tl.play(); observer.disconnect() } },
      { threshold: 0.3 },
    )
    observer.observe(section)
    return () => { observer.disconnect(); tl.kill() }
  }, [])

  const sidebarSocials = SIDEBAR_LABELS
    .map(label => profile.socials.find(s => s.label === label))
    .filter(Boolean)

  return (
    <section ref={sectionRef} className={styles.section}>
      <HeroBackground />

      {/* ─── DESKTOP ONLY VIEW ─── */}
      <div ref={photoRef} className={styles.photo}>
        <Image
          src="/assets/durga-hero-v3.jpg" alt={profile.name.full}
          fill priority quality={100}
          sizes="(min-width: 768px) 55vw, 100vw"
          className={styles.photoImg}
        />
      </div>

      <div ref={socialRef} className={styles.socialSidebar}>
        {sidebarSocials.map(social => {
          const Icon = SOCIAL_ICON_MAP[social.label]
          if (!Icon) return null
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialLink} ${styles[social.label.toLowerCase()]}`}
              aria-label={social.label}
            >
              <Icon size={15} />
              <span className={styles.socialLabel}>{social.label}</span>
            </a>
          )
        })}
        <div
          className={styles.scrollIndicator}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('go-to-section', { detail: 2 }))
          }}
        >
          <span className={styles.scrollText}>Next page</span>
          <FiChevronDown size={14} className={styles.arrowIcon} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.greeting}>
          <p ref={greetRef} className={styles.greetText}>{"Hi, I'm"}</p>
          <p ref={roleRef}  className={styles.roleText}>{profile.roles.short}</p>
        </div>

        <div className={styles.nameBlock}>
          <p ref={firstName} className={styles.name}>{profile.name.first}</p>
          <p ref={lastName}  className={styles.name}>{profile.name.last}</p>
        </div>

        <div ref={pillsRef} className={styles.pills}>
          {content.hero.pills.map((tag, i) => (
            <Fragment key={tag}>
              <span className={styles.pill}>{tag}</span>
              {i < content.hero.pills.length - 1 && (
                <span className={styles.pillDot} aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>

        <button ref={ctaBtnRef} type="button" className={styles.viewBtn} onClick={handleViewProjects}>
           View Work <FiArrowUpRight />
        </button>

        <div ref={statsRef} className={styles.stats}>
          {[...profile.stats.slice(0, 2), content.hero.specialistStat].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.cardsCol}>
        <div ref={taglineCardRef} className={styles.taglineCard}>
          <p className={styles.taglineText}>
            {splitTagline(profile.tagline, content.hero.taglineHighlight)}
          </p>
          <p className={styles.freelanceNote}>{content.hero.freelanceNote}</p>
        </div>

        {profile.available && (
          <div ref={availCardRef} className={styles.availCard}>
            <div className={styles.availHeader}>
              <span className={styles.availDot} />
              <span className={styles.availStatus}>{content.hero.availableLabel}</span>
            </div>
            <p className={styles.locationLine}>Based in {profile.location.based}</p>
            <p className={styles.locationLine}>Available {profile.location.availability}</p>
          </div>
        )}
      </div>

      {/* ─── MOBILE ONLY REDESIGNED VIEW (Availability + Stats) ─── */}
      {isMobile && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.mobileContainer}
        >
          {/* Background image at 40% opacity */}
          <div className={styles.mobileBgWrap}>
            <Image
              src="/assets/durga-hero-v3.jpg"
              alt="Durga Manikanta portrait"
              fill
              className={styles.mobileBgImage}
              priority
              quality={100}
            />
            <div className={styles.mobileBgOverlay} />
          </div>

          {/* Badge */}
          <motion.div variants={fadeUpVariants} className={styles.mobileBadge}>
            <span className={styles.orangeDot}>●</span>
            <span>{profile.roles.short.toUpperCase()}</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={fadeUpVariants} className={styles.mobileName}>
            {profile.name.first}
            <br />
            <span className={styles.ghostText}>{profile.name.last}</span>
          </motion.h1>

          {/* Description */}
          <motion.p variants={fadeUpVariants} className={styles.mobileDesc}>
            {profile.description}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUpVariants} className={styles.mobileCtaWrap}>
            <a href={`mailto:${profile.email}`} className={styles.mobileCtaBtn}>
              LET&apos;S TALK &rarr;
            </a>
          </motion.div>

          {/* Socials Row */}
          <motion.div variants={fadeUpVariants} className={styles.mobileSocials}>
            {profile.socials.map((social) => {
              const Icon = { GitHub: FaGithub, LinkedIn: FaLinkedinIn, Instagram: FaInstagram }[social.label]
              if (!Icon) return null
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileSocialCircle}
                  aria-label={social.label}
                >
                  <Icon size={18} />
                </a>
              )
            })}
          </motion.div>

          <div style={{ height: '40px' }} />

          {/* Centered Glass Card */}
          <motion.div variants={fadeUpVariants} className={styles.mobileAvailCard}>
            <span className={styles.mobileAvailLabel}>AVAILABILITY</span>
            <h3 className={styles.mobileAvailVal}>REMOTE / HYBRID</h3>
            
            <div className={styles.mobileDivider} />
            
            <span className={styles.mobileAvailLabel}>BASED IN</span>
            <h3 className={styles.mobileAvailVal}>RAVULAPALEM, INDIA</h3>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={fadeUpVariants} className={styles.mobileStatsGrid}>
            <motion.div whileTap={{ scale: 0.95 }} className={styles.mobileStatCard}>
              <span className={styles.mobileStatVal}>4+</span>
              <span className={styles.mobileStatLbl}>Years in Media</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className={styles.mobileStatCard}>
              <span className={styles.mobileStatVal}>3+</span>
              <span className={styles.mobileStatLbl}>Creative Projects</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className={styles.mobileStatCard}>
              <span className={styles.mobileStatVal}>4+</span>
              <span className={styles.mobileStatLbl}>Active Roles</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className={styles.mobileStatCard}>
              <span className={styles.mobileStatVal}>100%</span>
              <span className={styles.mobileStatLbl}>Client Focus</span>
            </motion.div>
          </motion.div>

          {/* Chevron Scroll Cue */}
          <motion.div
            variants={fadeUpVariants}
            className={styles.mobileScrollHint}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('go-to-section', { detail: 2 }))
            }}
          >
            <span className={styles.mobileScrollText}>Swipe up to continue</span>
            <FiChevronDown size={18} className={styles.mobileChevron} />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
