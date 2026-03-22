import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import styles from './BehindTheNumbers.module.css'

function useAnimatedNumber(target, duration = 1200, active = false) {
  const [value, setValue] = useState(0)
  const reduced = useReducedMotion()
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return
    if (reduced) { setValue(target); return }

    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * target)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    setValue(0)
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, active, reduced])

  return value
}

function getPopularityPercentile(popularity) {
  if (popularity >= 200) return 99
  if (popularity >= 100) return 95
  if (popularity >= 50) return 85
  if (popularity >= 20) return 70
  if (popularity >= 10) return 50
  if (popularity >= 5) return 30
  return 15
}

export default function BehindTheNumbers({ voteCount, voteAverage, popularity }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const panelRef = useRef(null)
  const inView = useInView(panelRef, { once: true, amount: 0.3 })
  const active = open && inView

  const animatedVotes = useAnimatedNumber(voteCount || 0, 1200, active)
  const percentile = getPopularityPercentile(popularity || 0)
  const animatedPercentile = useAnimatedNumber(percentile, 1000, active)

  // Donut SVG math
  const cx = 40, cy = 40, r = 34
  const circumference = 2 * Math.PI * r
  const donutOffset = active
    ? circumference - (circumference * percentile) / 100
    : circumference

  // Vote bar — normalize to a reasonable max (50k looks "full")
  const voteBarWidth = active ? Math.min((voteCount || 0) / 50000 * 100, 100) : 0

  // Genre baseline
  const genreBaseline = 6.5

  return (
    <section className={styles.section} ref={panelRef}>
      <div className={styles.header}>
        <h3 className={styles.title}>Behind the Numbers</h3>
        <button className={styles.toggleBtn} onClick={() => setOpen(prev => !prev)}>
          {open ? 'Collapse' : 'Explore'}
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▼</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduced
              ? { duration: 0 }
              : { type: 'spring', damping: 25, stiffness: 200 }
            }
          >
            <div className={styles.grid}>
              {/* Vote Count Bar */}
              <div className={styles.block}>
                <span className={styles.blockLabel}>Vote Count</span>
                <span className={styles.blockValue}>
                  {Math.round(animatedVotes).toLocaleString()}
                </span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${voteBarWidth}%` }}
                  />
                </div>
              </div>

              {/* Rating vs Genre Average */}
              <div className={styles.block}>
                <span className={styles.blockLabel}>Rating vs Genre Average</span>
                <div className={styles.ruler}>
                  <div
                    className={`${styles.rulerDot} ${styles.rulerDotBaseline}`}
                    style={{ left: `${(genreBaseline / 10) * 100}%` }}
                  />
                  <div
                    className={`${styles.rulerDot} ${styles.rulerDotMain}`}
                    style={{ left: active ? `${(voteAverage / 10) * 100}%` : '0%' }}
                  />
                </div>
                <div className={styles.rulerLabels}>
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
                <div className={styles.rulerLegend}>
                  <span><span className={styles.legendDot} style={{ background: 'var(--accent)' }} />This title</span>
                  <span><span className={styles.legendDot} style={{ background: 'var(--text-muted)', opacity: 0.4 }} />Genre avg (≈6.5)</span>
                </div>
              </div>

              {/* Popularity Percentile */}
              <div className={styles.block}>
                <span className={styles.blockLabel}>Popularity Percentile</span>
                <div className={styles.donutWrap}>
                  <svg className={styles.donut} viewBox="0 0 80 80">
                    <circle className={styles.donutTrack} cx={cx} cy={cy} r={r} />
                    <circle
                      className={styles.donutFill}
                      cx={cx} cy={cy} r={r}
                      strokeDasharray={circumference}
                      strokeDashoffset={donutOffset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                    />
                    <text
                      className={styles.donutLabel}
                      x={cx} y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {Math.round(animatedPercentile)}%
                    </text>
                  </svg>
                  <div className={styles.donutMeta}>
                    <span className={styles.donutMetaValue}>{Math.round(popularity || 0)} pts</span>
                    <span className={styles.donutMetaLabel}>TMDB Popularity</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
