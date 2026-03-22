import { useMemo, useEffect, useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { getRatingColor, formatRating } from '../../services/tmdb'
import styles from './RatingStory.module.css'

// ── Data analysis ──────────────────────────────────────

function analyzeShow(seasons, showName) {
  const allEps = seasons.flatMap((s, si) =>
    (s.episodes || [])
      .filter(ep => ep.vote_average > 0 && ep.episode_number > 0)
      .map(ep => ({
        ...ep,
        seasonNum: si + 1,
        label: `S${si + 1}E${ep.episode_number}`,
        globalIndex: 0, // set below
      }))
  )
  allEps.forEach((ep, i) => { ep.globalIndex = i })

  if (allEps.length < 3) return null

  const premiere = allEps[0]
  const finale = allEps[allEps.length - 1]
  const best = allEps.reduce((a, b) => b.vote_average > a.vote_average ? b : a)
  const worst = allEps.reduce((a, b) => b.vote_average < a.vote_average ? b : a)

  // Season averages
  const seasonAvgs = seasons.map((s, i) => {
    const rated = (s.episodes || []).filter(ep => ep.vote_average > 0)
    const avg = rated.length ? rated.reduce((sum, ep) => sum + ep.vote_average, 0) / rated.length : 0
    return { season: i + 1, avg }
  }).filter(s => s.avg > 0)

  // Biggest season-over-season swing
  let biggestSwing = null
  for (let i = 1; i < seasonAvgs.length; i++) {
    const diff = seasonAvgs[i].avg - seasonAvgs[i - 1].avg
    if (!biggestSwing || Math.abs(diff) > Math.abs(biggestSwing.diff)) {
      biggestSwing = { from: seasonAvgs[i - 1], to: seasonAvgs[i], diff }
    }
  }

  // Overall trend
  const firstHalf = allEps.slice(0, Math.floor(allEps.length / 2))
  const secondHalf = allEps.slice(Math.floor(allEps.length / 2))
  const firstAvg = firstHalf.reduce((s, e) => s + e.vote_average, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, e) => s + e.vote_average, 0) / secondHalf.length
  const trendDiff = secondAvg - firstAvg
  const trend = trendDiff > 0.3 ? 'improving' : trendDiff < -0.3 ? 'declining' : 'stable'

  const overallAvg = allEps.reduce((s, e) => s + e.vote_average, 0) / allEps.length

  // Build story beats
  const beats = []

  // 1. Premiere
  beats.push({
    id: 'premiere',
    title: 'The Premiere',
    narrative: `${showName} debuted with a ${formatRating(premiere.vote_average)} rating for its pilot, "${premiere.name}." ${premiere.vote_average >= 7.5 ? 'Audiences were immediately hooked — a strong start that set the tone for what was to come.' : premiere.vote_average >= 6 ? 'A modest beginning, with viewers cautiously optimistic about where the story might lead.' : 'A rocky start, but every great story has to begin somewhere.'}`,
    highlightEp: premiere,
    upToIndex: premiere.globalIndex,
    color: getRatingColor(premiere.vote_average),
  })

  // 2. Best episode
  if (best.globalIndex !== premiere.globalIndex) {
    beats.push({
      id: 'peak',
      title: 'The Peak',
      narrative: `The show reached its zenith with "${best.name}" (${best.label}), scoring an exceptional ${formatRating(best.vote_average)}. ${best.vote_average >= 9 ? 'A near-perfect episode that fans still talk about.' : best.vote_average >= 8 ? 'A standout moment that elevated the entire series.' : 'The highest-rated chapter in this show\'s journey.'}`,
      highlightEp: best,
      upToIndex: best.globalIndex,
      color: getRatingColor(best.vote_average),
    })
  }

  // 3. Worst episode
  if (worst.globalIndex !== premiere.globalIndex && worst.globalIndex !== best.globalIndex) {
    beats.push({
      id: 'valley',
      title: 'The Valley',
      narrative: `Every series has its low point. "${worst.name}" (${worst.label}) bottomed out at ${formatRating(worst.vote_average)}. ${worst.vote_average < 5 ? 'A divisive episode that tested even the most loyal viewers.' : worst.vote_average < 7 ? 'A dip that stands out against the show\'s otherwise steady run.' : 'Even the low point was respectable — a sign of consistent quality.'}`,
      highlightEp: worst,
      upToIndex: worst.globalIndex,
      color: getRatingColor(worst.vote_average),
    })
  }

  // 4. Biggest swing (if multiple seasons)
  if (biggestSwing && seasonAvgs.length > 1) {
    const dir = biggestSwing.diff > 0 ? 'rose' : 'dropped'
    const magnitude = Math.abs(biggestSwing.diff)
    beats.push({
      id: 'swing',
      title: 'The Turning Point',
      narrative: `Between Season ${biggestSwing.from.season} and Season ${biggestSwing.to.season}, the average rating ${dir} by ${magnitude.toFixed(1)} points — ${biggestSwing.diff > 0 ? 'a remarkable recovery that reinvigorated the fanbase.' : 'a shift that left audiences divided.'} Season ${biggestSwing.from.season} averaged ${biggestSwing.from.avg.toFixed(1)}, while Season ${biggestSwing.to.season} ${dir} to ${biggestSwing.to.avg.toFixed(1)}.`,
      highlightEp: null,
      upToIndex: allEps.findIndex(e => e.seasonNum === biggestSwing.to.season) + (seasons[biggestSwing.to.season - 1]?.episodes?.length || 1) - 1,
      color: biggestSwing.diff > 0 ? 'var(--rating-great)' : 'var(--rating-poor)',
    })
  }

  // 5. Finale & verdict
  beats.push({
    id: 'finale',
    title: 'The Verdict',
    narrative: `${showName} closed its run with "${finale.name}" (${finale.label}) at ${formatRating(finale.vote_average)}. Across ${allEps.length} episodes and ${seasonAvgs.length} season${seasonAvgs.length > 1 ? 's' : ''}, the series averaged ${overallAvg.toFixed(1)}/10. ${trend === 'improving' ? 'Remarkably, it got better with age — a rarity in television.' : trend === 'declining' ? 'While it didn\'t quite sustain its early momentum, its legacy endures.' : 'A remarkably consistent run from start to finish.'}`,
    highlightEp: finale,
    upToIndex: allEps.length - 1,
    color: getRatingColor(overallAvg),
  })

  // Sort beats by upToIndex for chronological flow
  beats.sort((a, b) => a.upToIndex - b.upToIndex)

  return { beats, allEps, overallAvg, trend }
}

// ── Mini chart (SVG line) ──────────────────────────────

function StoryChart({ allEps, upToIndex, highlightEp, inView }) {
  const reduced = useReducedMotion()
  const total = allEps.length
  const width = 500
  const height = 200
  const padX = 30
  const padY = 20
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const ratings = allEps.map(e => e.vote_average)
  const min = Math.max(0, Math.floor(Math.min(...ratings) - 0.5))
  const max = Math.min(10, Math.ceil(Math.max(...ratings) + 0.5))

  const toX = (i) => padX + (i / (total - 1)) * chartW
  const toY = (r) => padY + ((max - r) / (max - min)) * chartH

  // Full path
  const fullPath = allEps.map((ep, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(ep.vote_average).toFixed(1)}`).join(' ')

  // Revealed path (up to upToIndex)
  const revealedPath = allEps.slice(0, upToIndex + 1).map((ep, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(ep.vote_average).toFixed(1)}`).join(' ')

  // Highlight point
  const hlX = highlightEp ? toX(highlightEp.globalIndex) : 0
  const hlY = highlightEp ? toY(highlightEp.vote_average) : 0

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart}>
      {/* Grid lines */}
      {[min, (min + max) / 2, max].map(v => (
        <g key={v}>
          <line x1={padX} y1={toY(v)} x2={width - padX} y2={toY(v)} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <text x={padX - 6} y={toY(v) + 3} textAnchor="end" className={styles.chartLabel}>{v.toFixed(0)}</text>
        </g>
      ))}

      {/* Ghost line (full series, dim) */}
      <path d={fullPath} fill="none" stroke="var(--border-mid)" strokeWidth="1" opacity="0.3" />

      {/* Revealed line */}
      <motion.path
        d={revealedPath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Highlight dot */}
      {highlightEp && (
        <motion.g
          initial={reduced ? false : { opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ delay: 1.2, duration: 0.4, type: 'spring', stiffness: 300 }}
          style={{ transformOrigin: `${hlX}px ${hlY}px` }}
        >
          <circle cx={hlX} cy={hlY} r="16" fill={getRatingColor(highlightEp.vote_average)} opacity="0.15" />
          <circle cx={hlX} cy={hlY} r="5" fill={getRatingColor(highlightEp.vote_average)} stroke="var(--bg-base)" strokeWidth="2" />
          <text x={hlX} y={hlY - 12} textAnchor="middle" className={styles.chartHighlightLabel}>
            {formatRating(highlightEp.vote_average)}
          </text>
        </motion.g>
      )}
    </svg>
  )
}

// ── Story beat section ─────────────────────────────────

function StoryBeat({ beat, allEps, index }) {
  const reduced = useReducedMotion()
  const [chartInView, setChartInView] = useState(false)
  const chartRef = useRef(null)

  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setChartInView(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.section
      className={styles.beat}
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.beatInner}>
        <motion.div
          className={styles.beatText}
          initial={reduced ? false : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className={styles.beatNumber}>{String(index + 1).padStart(2, '0')}</span>
          <h2 className={styles.beatTitle} style={{ color: beat.color }}>{beat.title}</h2>
          <p className={styles.beatNarrative}>{beat.narrative}</p>
          {beat.highlightEp && (
            <div className={styles.beatMeta}>
              <span className={styles.beatMetaLabel}>{beat.highlightEp.label}</span>
              <span className={styles.beatMetaName}>{beat.highlightEp.name}</span>
            </div>
          )}
        </motion.div>

        <motion.div
          className={styles.beatChart}
          ref={chartRef}
          initial={reduced ? false : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StoryChart allEps={allEps} upToIndex={beat.upToIndex} highlightEp={beat.highlightEp} inView={chartInView} />
        </motion.div>
      </div>
    </motion.section>
  )
}

// ── Main overlay ───────────────────────────────────────

export default function RatingStory({ seasons, showName, onClose }) {
  const reduced = useReducedMotion()
  const analysis = useMemo(() => analyzeShow(seasons, showName), [seasons, showName])
  const scrollRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Lock body scroll and signal story mode is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.dataset.storyOpen = 'true'
    return () => {
      document.body.style.overflow = ''
      delete document.documentElement.dataset.storyOpen
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Track scroll progress inside the overlay
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const scrollTop = el.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (!analysis) return null

  const { beats, allEps, overallAvg, trend } = analysis

  return (
    <motion.div
      className={styles.overlay}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Progress bar — film strip style */}
      <div className={styles.progressBar} style={{ transform: `scaleX(${scrollProgress / 100})` }} />

      {/* Header bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={styles.storyLabel}>Story Mode</span>
          <span className={styles.storyShowName}>{showName}</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className={styles.scrollContainer} ref={scrollRef}>
        {/* Hero intro */}
        <section className={styles.hero}>
          <motion.h1
            className={styles.heroTitle}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The Rating Journey
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {allEps.length} episodes · {trend === 'improving' ? 'An ascending arc' : trend === 'declining' ? 'A fading flame' : 'A steady course'} · {overallAvg.toFixed(1)} avg
          </motion.p>
          <motion.div
            className={styles.scrollHint}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Scroll to explore ↓
          </motion.div>
        </section>

        {/* Story beats */}
        {beats.map((beat, i) => (
          <StoryBeat key={beat.id} beat={beat} allEps={allEps} index={i} />
        ))}

        {/* End */}
        <section className={styles.ending}>
          <motion.p
            className={styles.endingText}
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            End of story.
          </motion.p>
          <button className={styles.endCloseBtn} onClick={onClose}>
            Back to Details
          </button>
        </section>
      </div>
    </motion.div>
  )
}
