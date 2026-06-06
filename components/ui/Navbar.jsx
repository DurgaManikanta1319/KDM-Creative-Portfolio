'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'

const PROJECT_SLIDES = profile.projects.length

function getIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar() {
  const [time,    setTime]    = useState('')   // '' on SSR - avoids hydration mismatch
  const [onIntro, setOnIntro] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const headerRef   = useRef(null)
  const lastY       = useRef(0)
  const hidden      = useRef(false)
  const stopTimer   = useRef(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Live clock - set immediately on mount, then every second
  useEffect(() => {
    setTime(getIST())
    const id = setInterval(() => setTime(getIST()), 1000)
    return () => clearInterval(id)
  }, [])

  const navItems = isMobile
    ? [
        { label: 'Home',       idx: 0 },
        { label: 'About',      idx: 2 },
        { label: 'Work',       idx: 3 },
        { label: 'Experience', idx: 4 },
        { label: 'Contact',    idx: 5 },
      ]
    : [
        { label: 'Home',       idx: 0 },
        { label: 'About',      idx: 2 },
        { label: 'Work',       idx: 3 },
        { label: 'Experience', idx: 3 + PROJECT_SLIDES },
        { label: 'Impact',     idx: 3 + PROJECT_SLIDES + 1 },
        { label: 'Contact',    idx: 3 + PROJECT_SLIDES + 3 },
      ]

  // Auto-hide on scroll-down, reveal on scroll-up or scroll-stop
  useEffect(() => {
    const scroller = document.querySelector('main') ?? window
    const vh = window.innerHeight

    function showNavbar() {
      const currentY = scroller.scrollTop ?? window.scrollY
      if (currentY < vh * 0.8) return // don't show during video intro
      
      if (!hidden.current) return
      gsap.to(headerRef.current, { y: '0%', opacity: 1, duration: 0.35, ease: 'power2.out' })
      hidden.current = false
    }

    const onScroll = () => {
      const currentY = scroller.scrollTop ?? window.scrollY
      const delta    = currentY - lastY.current

      setOnIntro(currentY < vh * 0.8)

      if (currentY < vh * 0.8) {
        gsap.to(headerRef.current, { y: '-120%', opacity: 0, duration: 0.35, ease: 'power2.inOut' })
        hidden.current = true
      } else if (delta > 8 && !hidden.current) {
        gsap.to(headerRef.current, { y: '-120%', opacity: 0, duration: 0.35, ease: 'power2.inOut' })
        hidden.current = true
      } else if (delta < -6) {
        showNavbar()
      }

      lastY.current = currentY

      // Show navbar 400 ms after scrolling stops
      clearTimeout(stopTimer.current)
      stopTimer.current = setTimeout(showNavbar, 400)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      clearTimeout(stopTimer.current)
    }
  }, [])

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${onIntro ? styles.introMode : ''}`}>
        <a
          onClick={() => {
            window.dispatchEvent(new CustomEvent('go-to-section', { detail: 0 }))
          }}
          className={styles.logo}
        >
          {profile.name.signature}
        </a>

        <span className={styles.time}>INDIA TIME - {time}</span>

         <NavigationMenu className={styles.navMenu}>
          <NavigationMenuList className="flex gap-6">
            {navItems.map(({ label, idx }) => (
              <NavigationMenuItem key={label}>
                <NavigationMenuLink
                  className={styles.navLink}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('go-to-section', { detail: idx }))
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <a
          href={`mailto:${profile.email}`}
          className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
        >
          Email me
        </a>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map(({ label, idx }) => (
            <button
              key={label}
              className={styles.mobileNavLink}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('go-to-section', { detail: idx }))
                setMenuOpen(false)
              }}
            >
              {label}
            </button>
          ))}
          <a
            href={`mailto:${profile.email}`}
            className={styles.mobileMailLink}
            onClick={() => setMenuOpen(false)}
          >
            {profile.email}
          </a>
        </div>
      )}
    </>
  )
}
