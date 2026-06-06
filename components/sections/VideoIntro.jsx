'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { FaGithub, FaLinkedinIn, FaInstagram } from 'react-icons/fa'
import { FiChevronDown } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/VideoIntro.module.css'

const CinematicLayer = dynamic(() => import('@/components/three/CinematicLayer'), { ssr: false })

function scrollNext() {
  window.dispatchEvent(new CustomEvent('go-to-section', { detail: 1 }))
}

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
    },
  },
}

export default function VideoIntro() {
  const videoRef    = useRef(null)
  const greetRef    = useRef(null)
  const nameRef     = useRef(null)
  const roleRef     = useRef(null)
  const scrollRef   = useRef(null)
  const hintRef     = useRef(null)

  const [muted,    setMuted]    = useState(true)
  const [playing,  setPlaying]  = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    const handleResize = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Desktop Entrance animation
  useEffect(() => {
    if (window.innerWidth < 768) return
    const tl = gsap.timeline({ delay: 0.4 })
    tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(scrollRef.current, { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.1')
    return () => tl.kill()
  }, [])

  // Video fade-in
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    v.muted = true
    const t = gsap.fromTo(v, { opacity: 0 }, { opacity: isMobile ? 0.4 : 1, duration: 1.2, ease: 'power2.out' })
    return () => t.kill()
  }, [isMobile])

  // Unmute & Play when screen loader is dismissed (bypasses mobile autoplay block)
  useEffect(() => {
    function onLoaderDismissed() {
      const v = videoRef.current
      if (!v) return
      if (typeof v.play !== 'function') return
      v.muted = false
      setMuted(false)
      v.play().catch(() => {})
      dismissHint()
    }
    window.addEventListener('loader-dismissed', onLoaderDismissed)
    return () => window.removeEventListener('loader-dismissed', onLoaderDismissed)
  }, [])

  // Play video after shatter animation finishes
  useEffect(() => {
    function onAnimationDone() {
      const v = videoRef.current
      if (!v) return
      if (typeof v.play !== 'function') return
      v.play().catch(() => {})
    }
    window.addEventListener('loader-animation-done', onAnimationDone)
    return () => window.removeEventListener('loader-animation-done', onAnimationDone)
  }, [])

  // Auto-hide hint after 6 s
  useEffect(() => {
    if (!showHint) return
    const id = setTimeout(() => dismissHint(), 6000)
    return () => clearTimeout(id)
  }, [showHint])

  function dismissHint() {
    if (!hintRef.current) return
    gsap.to(hintRef.current, {
      opacity: 0, y: -8, duration: 0.35,
      onComplete: () => setShowHint(false),
    })
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    if (playing) { v.pause(); setPlaying(false) }
    else         { v.play();  setPlaying(true)  }
  }

  function toggleMute() {
    if (showHint) dismissHint()
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function handleEnded() {
    const main = document.querySelector('main')
    if (main && main.scrollTop < main.clientHeight * 0.4) scrollNext()
  }

  return (
    <section className={styles.section}>
      {/* 1 - Blurred ambient background */}
      <video
        key={isMobile ? 'mobile-bg' : 'desktop-bg'}
        src={isMobile ? "/assets/about_me_mobile.mp4" : "/assets/about_me.mp4"}
        autoPlay muted playsInline
        aria-hidden="true"
        className={styles.bgVideo}
      />

      {/* 2 - Main video */}
      <video
        key={isMobile ? 'mobile-main' : 'desktop-main'}
        ref={videoRef}
        data-testid="intro-video"
        src={isMobile ? "/assets/about_me_mobile.mp4" : "/assets/about_me.mp4"}
        muted playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        className={styles.mainVideo}
      />

      {/* 3 - Cinematic gradient overlay */}
      <div className={styles.overlay} />

      {/* 4 - Three.js cinematic bokeh layer (desktop only) */}
      {!isMobile && <CinematicLayer />}

      {/* 5 - DESKTOP ONLY Landing text */}
      {!isMobile && (
        <div className={styles.heroContent}>
          <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>
          <h1 ref={nameRef} className={styles.name}>
            {profile.name.first}<br />{profile.name.last}
          </h1>
          <p ref={roleRef} className={styles.role}>{profile.roles.detailed}</p>
        </div>
      )}

      {/* 6 - MOBILE ONLY Redesigned View */}
      {isMobile && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.mobileContent}
          style={{ justifyContent: 'flex-end', paddingBottom: '3.5rem' }}
        >
          {/* Scroll Cue */}
          <motion.div
            variants={fadeUpVariants}
            className={styles.mobileScrollHint}
            onClick={scrollNext}
          >
            <span className={styles.mobileScrollText}>Tap to explore</span>
            <FiChevronDown size={18} className={styles.mobileChevron} />
          </motion.div>
        </motion.div>
      )}

      {/* 7 - Paused overlay */}
      {!playing && (
        <button className={styles.playOverlay} onClick={togglePlay} aria-label="Play video">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="35" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <polygon points="29,20 56,36 29,52" fill="white" />
          </svg>
        </button>
      )}

      {/* 8 - Sound hint badge */}
      {showHint && (
        <div ref={hintRef} className={styles.soundHint} onClick={toggleMute} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
          <span className={styles.soundPulse} />
          <span>Tap for sound</span>
        </div>
      )}

      {/* 9 - DESKTOP ONLY Scroll cue */}
      {!isMobile && (
        <button
          ref={scrollRef}
          className={styles.scrollCue}
          onClick={scrollNext}
          aria-label="Next section"
        >
          <span className={styles.scrollLabel}>Next</span>
          <span className={styles.scrollLine} />
        </button>
      )}
    </section>
  )
}
