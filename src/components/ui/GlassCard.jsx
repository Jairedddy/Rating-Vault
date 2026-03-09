import { useRef, useCallback } from 'react'
import styles from './GlassCard.module.css'

const MAX_TILT = 8

export default function GlassCard({ children, pulse = false, className = '' }) {
  const cardRef = useRef(null)
  const holoRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Normalize -1 to 1
    const nx = (x - centerX) / centerX
    const ny = (y - centerY) / centerY

    // Tilt (inverted Y for natural feel)
    const rotateX = -ny * MAX_TILT
    const rotateY = nx * MAX_TILT

    // Dynamic shadow based on tilt
    const shadowX = -nx * 8
    const shadowY = -ny * 8

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    card.style.boxShadow = `${shadowX}px ${shadowY}px 24px rgba(0,0,0,0.3), 0 0 1px rgba(200,169,110,0.1)`

    // Holographic gradient follows mouse
    if (holoRef.current) {
      const pctX = (x / rect.width) * 100
      const pctY = (y / rect.height) * 100
      holoRef.current.style.background = `radial-gradient(
        circle at ${pctX}% ${pctY}%,
        rgba(200, 169, 110, 0.08) 0%,
        rgba(180, 140, 255, 0.05) 30%,
        rgba(100, 200, 255, 0.04) 60%,
        transparent 80%
      )`
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = ''
    card.style.boxShadow = ''
  }, [])

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${pulse ? styles.pulse : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={holoRef} className={styles.holoOverlay} />
      {children}
    </div>
  )
}
