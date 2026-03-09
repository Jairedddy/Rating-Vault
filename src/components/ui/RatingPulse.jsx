import { useState, useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import { getRatingLabel, formatRating } from '../../services/tmdb'
import styles from './RatingPulse.module.css'

function getPulseSpeed(rating) {
  if (rating >= 9) return '0.8s'
  if (rating >= 8) return '1.0s'
  if (rating >= 7) return '1.5s'
  if (rating >= 5) return '2.5s'
  return null // flatline
}

function getRawColor(rating) {
  // Return raw hex for SVG stroke (CSS vars don't work in SVG inline styles)
  if (rating >= 8.5) return '#7ec8a0'
  if (rating >= 7.5) return '#a8c87e'
  if (rating >= 6.5) return '#c8b87e'
  if (rating >= 5.0) return '#c8a07e'
  return '#c87e7e'
}

export default function RatingPulse({ rating }) {
  const reduced = useReducedMotion()
  const finalVal = formatRating(rating)
  const [displayVal, setDisplayVal] = useState(finalVal)
  const rafRef = useRef(null)

  const pulseSpeed = getPulseSpeed(rating)
  const color = getRawColor(rating)
  const isFlatline = !pulseSpeed

  // Count-up animation replays on hover
  const startCountUp = useCallback(() => {
    if (reduced) return
    const target = parseFloat(finalVal) || 0
    const duration = 600
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayVal((eased * target).toFixed(1))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    setDisplayVal('0.0')
    rafRef.current = requestAnimationFrame(tick)
  }, [finalVal, reduced])

  const handleMouseEnter = () => {
    startCountUp()
  }

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setDisplayVal(finalVal)
  }

  useEffect(() => {
    setDisplayVal(finalVal)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [finalVal])

  const cx = 60
  const cy = 60
  const r = 48
  const strokeWidth = 2

  return (
    <div
      className={`${styles.wrap} ${isFlatline ? styles.flatline : ''}`}
      style={{ '--pulse-speed': pulseSpeed || '2s' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg className={styles.svg} viewBox="0 0 120 120" fill="none">
        {/* Sonar ping rings */}
        <circle
          className={`${styles.ping} ${styles.ping1}`}
          cx={cx} cy={cy} r={r}
          stroke={color} strokeWidth={strokeWidth}
        />
        <circle
          className={`${styles.ping} ${styles.ping2}`}
          cx={cx} cy={cy} r={r}
          stroke={color} strokeWidth={strokeWidth * 0.7}
        />
        <circle
          className={`${styles.ping} ${styles.ping3}`}
          cx={cx} cy={cy} r={r}
          stroke={color} strokeWidth={strokeWidth * 0.4}
        />

        {/* Main static ring */}
        <circle
          className={styles.ring}
          cx={cx} cy={cy} r={r}
          stroke={color} strokeWidth={strokeWidth}
          opacity={0.6}
        />
      </svg>

      {/* Score — always visible, count-up replays on hover */}
      <div className={styles.score}>
        <span className={styles.scoreNum} style={{ color }}>
          {displayVal}
        </span>
        <span className={styles.scoreLabel}>{getRatingLabel(rating)}</span>
      </div>
    </div>
  )
}
