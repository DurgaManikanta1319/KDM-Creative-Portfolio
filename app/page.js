'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import ProjectsSection       from '@/components/sections/ProjectsSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection'
import ScreenLoader from '@/components/sections/ScreenLoader'
import profile               from '@/data/profile.json'

const PROJECT_SLIDES = profile.projects.length
const TOTAL          = 7 + PROJECT_SLIDES

export default function Home() {
  const mainRef        = useRef(null)
  const idxRef         = useRef(0)
  const busyRef        = useRef(false)
  const tweenRef       = useRef(null)
  const loopOverlayRef = useRef(null)
  const followerRef    = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  // Glow cursor follower effect
  useEffect(() => {
    const el = followerRef.current
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power2.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power2.out' })

    const onMouseMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    const isMobile = window.innerWidth < 768
    const total = isMobile ? 6 : TOTAL
    let lastScrollTime = 0

    // Fade to black → instant scrollTop jump → fade in
    // Used whenever we loop footer → first section
    function fadeLoop(targetScrollTop, targetIdx) {
      busyRef.current = true
      tweenRef.current?.kill()
      gsap.to(loopOverlayRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.in',
        onComplete: () => {
          el.scrollTop    = targetScrollTop
          idxRef.current  = targetIdx
          gsap.to(loopOverlayRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              setTimeout(() => { busyRef.current = false }, 150)
            },
          })
        },
      })
    }

    function goTo(idx, force = false) {
      // Wrap-around
      if (idx >= total) idx = 0
      if (idx < 0)      idx = total - 1

      const now = Date.now()
      if (!force) {
        if (idx === idxRef.current || busyRef.current || now - lastScrollTime < 1000) return
      }

      lastScrollTime = now

      const clientHeight = el.clientHeight

      // Footer → top: fade-cut instead of scrolling back through all sections
      if (idxRef.current === total - 1 && idx === 0) {
        fadeLoop(0, 0)
        return
      }

      // Top → footer: fade-cut instead of scrolling forward through all sections
      if (idxRef.current === 0 && idx === total - 1) {
        fadeLoop((total - 1) * clientHeight, total - 1)
        return
      }

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        scrollTop: idx * clientHeight,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => { setTimeout(() => { busyRef.current = false }, 150) },
      })
    }

    function onScroll() {
      idxRef.current = Math.round(el.scrollTop / el.clientHeight)
    }

    // Check if swipe target is inside a scrollable container and has room to scroll
    const isInsideScrollable = (target, isSwipeUp) => {
      let current = target
      while (current && current !== el) {
        const style = window.getComputedStyle(current)
        const overflowY = style.overflowY
        if (overflowY === 'auto' || overflowY === 'scroll') {
          const scrollHeight = current.scrollHeight
          const clientHeight = current.clientHeight
          if (scrollHeight > clientHeight) {
            const scrollTop = current.scrollTop
            if (isSwipeUp) {
              // Swiping up (trying to scroll down)
              if (scrollTop + clientHeight < scrollHeight - 8) return true
            } else {
              // Swiping down (trying to scroll up)
              if (scrollTop > 8) return true
            }
          }
        }
        current = current.parentElement
      }
      return false
    }

    let touchStartY = 0
    let touchStartX = 0

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return
      touchStartY = e.touches[0].clientY
      touchStartX = e.touches[0].clientX
    }

    const onTouchEnd = (e) => {
      if (e.changedTouches.length !== 1) return
      const deltaY = e.changedTouches[0].clientY - touchStartY
      const deltaX = e.changedTouches[0].clientX - touchStartX
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absY > 40 && absY > absX) {
        const isSwipeUp = deltaY < 0
        if (isInsideScrollable(e.target, isSwipeUp)) return

        if (isSwipeUp) {
          goTo(idxRef.current + 1, false)
        } else {
          goTo(idxRef.current - 1, false)
        }
      }
    }

    // Footer video ends → same fade-cut loop back to top
    function onFooterLoop() {
      if (busyRef.current) return
      fadeLoop(0, 0)
    }

    const onClick = (e) => {
      const target = e.target
      const interactiveSelector = 'button, a, input, select, textarea, [role="button"], iframe, canvas, video, audio, [data-interactive="true"]'
      const hasInteractiveAncestor = target.closest(interactiveSelector)
      const isPointer = window.getComputedStyle(target).cursor === 'pointer' || 
                        (target.parentElement && window.getComputedStyle(target.parentElement).cursor === 'pointer')

      if (hasInteractiveAncestor || isPointer) return
      if (e.button !== 0) return

      const selection = window.getSelection().toString()
      if (selection) return

      goTo(idxRef.current + 1, false)
    }

    const handleGoTo = (e) => {
      if (typeof e.detail === 'number') {
        goTo(e.detail, true)
      } else if (e.detail && typeof e.detail.idx === 'number') {
        goTo(e.detail.idx, e.detail.force ?? true)
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('click', onClick)
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('footer-loop-back', onFooterLoop)
    window.addEventListener('go-to-section', handleGoTo)

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('click', onClick)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('footer-loop-back', onFooterLoop)
      window.removeEventListener('go-to-section', handleGoTo)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      {/* Full-screen fade overlay for seamless footer → top loop */}
      <div
        ref={loopOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Mouse tracker ambient lighting */}
      <div ref={followerRef} className="cursorFollower" aria-hidden />

      <Navbar />
      <main ref={mainRef} style={{ height: '100vh', overflowY: 'hidden', overscrollBehavior: 'none' }}>
        <div>
          <VideoIntro />
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <WorkExperienceSection />
          <PublicationsFooterSection />
        </div>
      </main>
    </>
  )
}
