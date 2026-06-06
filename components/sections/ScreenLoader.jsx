'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ScreenLoader.module.css'

export default function ScreenLoader({ onDismiss }) {
  const overlayRef = useRef(null)
  const progressValRef = useRef(null)
  const progressBarRef = useRef(null)
  const startBtnWrapRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading progress from 0 to 100%
    const ctx = gsap.context(() => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: 100,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: () => {
          const rounded = Math.floor(obj.val)
          if (progressValRef.current) {
            progressValRef.current.textContent = `${rounded}%`
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${rounded}%`
          }
        },
        onComplete: () => {
          setLoaded(true)
          // Allow state to register, then trigger entrance animation
          setTimeout(() => {
            if (startBtnWrapRef.current) {
              gsap.fromTo(startBtnWrapRef.current,
                { opacity: 0, y: 15, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
              )
            }
          }, 50)
        }
      })
    })
    return () => ctx.revert()
  }, [])

  function handleStart() {
    window.dispatchEvent(
      new CustomEvent('loader-dismissed')
    )

    const overlay = overlayRef.current
    if (!overlay) return

    overlay.style.pointerEvents = 'none'

    // Create split layers
    const top = document.createElement('div')
    top.className = styles.splitTop

    const bottom = document.createElement('div')
    bottom.className = styles.splitBottom

    // Center line
    const line = document.createElement('div')
    line.className = styles.centerLine

    document.body.appendChild(top)
    document.body.appendChild(bottom)
    document.body.appendChild(line)

    // Hide original overlay fast
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
    })

    // Animate line
    gsap.fromTo(
      line,
      {
        scaleX: 0,
        opacity: 0,
      },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      }
    )

    // Split animation
    gsap.to(top, {
      y: '-100%',
      duration: 1,
      ease: 'expo.inOut',
      force3D: true,
    })

    gsap.to(bottom, {
      y: '100%',
      duration: 1,
      ease: 'expo.inOut',
      force3D: true,
    })

    // Fade line away
    gsap.to(line, {
      opacity: 0,
      duration: 0.3,
      delay: 0.2,
    })

    setTimeout(() => {
      top.remove()
      bottom.remove()
      line.remove()

      window.dispatchEvent(
        new CustomEvent('loader-animation-done')
      )

      onDismiss()
    }, 1000)
  }

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div className={styles.liquidBg} aria-hidden />

      <div className={styles.monogramContainer}>
        <h1 className={styles.monogram}>
          {profile.name.full.toUpperCase()}
        </h1>
        <p className={styles.subtitle}>{profile.roles.short.toUpperCase()}</p>
      </div>

      {!loaded ? (
        <div className={styles.loaderContainer}>
          <div className={styles.progressBarWrapper}>
            <div ref={progressBarRef} className={styles.progressBar} />
          </div>
          <span ref={progressValRef} className={styles.progressValue}>0%</span>
        </div>
      ) : (
        <div ref={startBtnWrapRef} style={{ opacity: 0 }}>
          <button
            className={styles.startBtn}
            onClick={handleStart}
          >
            Enter Experience
          </button>
        </div>
      )}
    </div>
  )
}
