import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dices, X, RefreshCw } from 'lucide-react'
import { tmdb, getRatingColor } from '../../services/tmdb'
import styles from './SurpriseMe.module.css'

// ── Audio helpers ───────────────────────────────────────────────────────────
let _audioCtx = null
const getCtx = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return _audioCtx
}

const playTick = () => {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.value = 480 + Math.random() * 240
    gain.gain.setValueAtTime(0.055, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.028)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.028)
  } catch {}
}

const playReveal = () => {
  try {
    const ctx = getCtx()
    ;[523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.11, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.start(t)
      osc.stop(t + 0.28)
    })
  } catch {}
}

// ── Reel component ──────────────────────────────────────────────────────────
function Reel({ poster, stopped, winner }) {
  const src = poster?.poster_path ? tmdb.poster(poster.poster_path, 'w185') : null
  return (
    <div className={`${styles.reel} ${stopped ? styles.reelStopped : ''} ${stopped && winner ? styles.reelWinner : ''}`}>
      {src && (
        <img
          key={src}
          src={src}
          alt=""
          className={styles.reelImg}
          draggable={false}
        />
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SurpriseMe() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | loading | spinning | revealed
  const [pool, setPool] = useState([])
  const [winner, setWinner] = useState(null)
  const [reelIdxs, setReelIdxs] = useState([0, 5, 10])
  const [stopped, setStopped] = useState([false, false, false])

  const navigate = useNavigate()
  const timers = useRef([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(id => { clearInterval(id); clearTimeout(id) })
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const spin = useCallback(async () => {
    clearTimers()
    setStopped([false, false, false])
    setPhase('loading')

    try {
      const data = await tmdb.discoverRandom()
      if (!data?.pool?.length) { setPhase('idle'); return }

      const { winner: w, pool: p } = data
      setPool(p)
      setWinner(w)
      setPhase('spinning')

      let idxs = [0, Math.floor(p.length / 3), Math.floor(p.length * 2 / 3)]

      // Phase 1 — fast (0–1200ms, 80ms interval)
      const fast = setInterval(() => {
        idxs = idxs.map(i => (i + 1) % p.length)
        setReelIdxs([...idxs])
        playTick()
      }, 80)
      timers.current.push(fast)

      const t1 = setTimeout(() => {
        clearInterval(fast)

        // Phase 2 — slow (1200–1900ms, 200ms interval)
        const slow = setInterval(() => {
          idxs = idxs.map(i => (i + 1) % p.length)
          setReelIdxs([...idxs])
        }, 200)
        timers.current.push(slow)

        const t2 = setTimeout(() => {
          clearInterval(slow)
          // Sequential stop: left → middle (winner) → right
          setStopped([true, false, false])
          const t3 = setTimeout(() => {
            setStopped([true, true, false])
            const t4 = setTimeout(() => {
              setStopped([true, true, true])
              setPhase('revealed')
              playReveal()
            }, 180)
            timers.current.push(t4)
          }, 180)
          timers.current.push(t3)
        }, 700)
        timers.current.push(t2)
      }, 1200)
      timers.current.push(t1)

    } catch {
      setPhase('idle')
    }
  }, [clearTimers])

  const handleOpen = () => {
    setOpen(true)
    spin()
  }

  const handleClose = useCallback(() => {
    clearTimers()
    setOpen(false)
    setPhase('idle')
    setWinner(null)
    setPool([])
    setStopped([false, false, false])
  }, [clearTimers])

  const handleViewDetails = () => {
    if (!winner) return
    handleClose()
    navigate(`/title/${winner.media_type}/${winner.id}`)
  }

  const ratingColor = winner ? getRatingColor(winner.vote_average) : 'var(--accent)'
  const year = winner ? (winner.release_date || winner.first_air_date || '').slice(0, 4) : ''

  // Reel posters
  const reelPosters = pool.length > 0 ? [
    pool[reelIdxs[0] % pool.length],
    stopped[1] ? winner : pool[reelIdxs[1] % pool.length],
    pool[reelIdxs[2] % pool.length],
  ] : [null, null, null]

  return (
    <>
      <button className={styles.fab} onClick={handleOpen} aria-label="Surprise me">
        <Dices size={22} />
      </button>

      {open && (
        <div className={styles.overlay} onClick={phase === 'revealed' ? undefined : undefined}>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>

          {/* Loading */}
          {phase === 'loading' && (
            <div className={styles.centerState}>
              <div className={styles.spinner} />
              <p className={styles.stateLabel}>Searching the vault…</p>
            </div>
          )}

          {/* Spinning */}
          {phase === 'spinning' && (
            <div className={styles.spinState}>
              <p className={styles.spinLabel}>Finding your next obsession…</p>
              <div className={styles.reels}>
                <Reel poster={reelPosters[0]} stopped={stopped[0]} winner={false} />
                <Reel poster={reelPosters[1]} stopped={stopped[1]} winner={stopped[1]} />
                <Reel poster={reelPosters[2]} stopped={stopped[2]} winner={false} />
              </div>
            </div>
          )}

          {/* Revealed */}
          {phase === 'revealed' && winner && (
            <div className={styles.revealState}>
              {winner.backdrop_path && (
                <div
                  className={styles.revealBackdrop}
                  style={{ backgroundImage: `url(${tmdb.backdrop(winner.backdrop_path)})` }}
                />
              )}
              <div className={styles.revealOverlay} />

              <div className={styles.revealContent}>
                <div className={styles.revealPosterWrap}>
                  <img
                    src={tmdb.poster(winner.poster_path, 'w342')}
                    alt={winner.title || winner.name}
                    className={styles.revealPoster}
                    style={{
                      boxShadow: `0 0 0 2px ${ratingColor}, 0 0 48px ${ratingColor}55, 0 24px 64px rgba(0,0,0,0.7)`
                    }}
                  />
                </div>

                <div className={styles.revealInfo}>
                  <div className={styles.revealMeta}>
                    <span className={styles.revealType}>
                      {winner.media_type === 'movie' ? 'Film' : 'Series'}
                    </span>
                    {year && <span className={styles.revealYear}>{year}</span>}
                  </div>
                  <h2 className={styles.revealTitle}>{winner.title || winner.name}</h2>
                  <div className={styles.revealRatingRow}>
                    <span className={styles.revealRating} style={{ color: ratingColor }}>
                      ★ {winner.vote_average?.toFixed(1)}
                    </span>
                    <span className={styles.revealVotes}>
                      {winner.vote_count?.toLocaleString()} votes
                    </span>
                  </div>
                  {winner.overview && (
                    <p className={styles.revealOverview}>
                      {winner.overview.slice(0, 140)}{winner.overview.length > 140 ? '…' : ''}
                    </p>
                  )}
                  <div className={styles.revealActions}>
                    <button className={styles.viewBtn} onClick={handleViewDetails}>
                      View Details →
                    </button>
                    <button className={styles.tryAgainBtn} onClick={spin}>
                      <RefreshCw size={13} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
