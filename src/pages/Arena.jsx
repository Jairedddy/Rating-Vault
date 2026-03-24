import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tmdb, formatRating } from '../services/tmdb'
import PageTransition from '../components/transitions/PageTransition'
import styles from './Arena.module.css'

// ── Scoring ──
function compositeScore(title) {
  const rating = title.vote_average || 0
  const votes = title.vote_count || 1
  const pop = title.popularity || 0
  // Normalize popularity to 0-10 range (TMDB popularity typically 0-1000+)
  const popNorm = Math.min(pop / 100, 10)
  return rating * 0.5 + Math.log10(Math.max(votes, 1)) * 0.3 + popNorm * 0.2
}

// ── Bracket helpers ──
function nextPowerOf2(n) {
  let p = 1
  while (p < n) p *= 2
  return p
}

function generateBracket(roster) {
  // Pad to next power of 2; top seeds get byes (null opponents)
  const actual = roster.length
  const size = nextPowerOf2(actual)
  const rounds = Math.log2(size)
  const bracket = []

  // Build padded roster: fill remaining slots with null (byes)
  const padded = [...roster]
  while (padded.length < size) padded.push(null)

  // First round matchups: seed 1 vs seed N, seed 2 vs seed N-1, etc.
  const firstRound = []
  for (let i = 0; i < size / 2; i++) {
    const a = padded[i]
    const b = padded[size - 1 - i]
    // If one side is a bye, auto-advance the other
    const isBye = !a || !b
    firstRound.push({
      a,
      b,
      winner: isBye ? (a || b) : null,
    })
  }
  bracket.push(firstRound)

  // Subsequent empty rounds
  for (let r = 1; r < rounds; r++) {
    const prevLen = bracket[r - 1].length
    const round = []
    for (let i = 0; i < prevLen / 2; i++) {
      round.push({ a: null, b: null, winner: null })
    }
    bracket.push(round)
  }

  // Propagate bye winners into the second round
  if (bracket.length > 1) {
    for (let i = 0; i < firstRound.length; i++) {
      if (firstRound[i].winner) {
        const nextMatchIdx = Math.floor(i / 2)
        const slot = i % 2 === 0 ? 'a' : 'b'
        bracket[1][nextMatchIdx][slot] = firstRound[i].winner
      }
    }
  }

  return bracket
}

function getRoundName(roundIdx, totalRounds) {
  const remaining = totalRounds - roundIdx
  if (remaining === 1) return 'Final'
  if (remaining === 2) return 'Semifinals'
  if (remaining === 3) return 'Quarterfinals'
  return `Round ${roundIdx + 1}`
}

// ── Confetti ──
const CONFETTI_COLORS = ['#c8a96e', '#7ec8a0', '#a8c87e', '#c87e7e', '#7ea8c8', '#c8b87e', '#c87ec8', '#f0ece4']

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: `${360 + Math.random() * 720}deg`,
      duration: `${2 + Math.random() * 2}s`,
      delay: `${Math.random() * 1.5}s`,
      width: `${6 + Math.random() * 6}px`,
      height: `${10 + Math.random() * 14}px`,
    }))
  , [])

  return (
    <div className={styles.confettiContainer}>
      {pieces.map(p => (
        <div
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: p.left,
            background: p.color,
            width: p.width,
            height: p.height,
            borderRadius: '2px',
            '--rotation': p.rotation,
            '--fall-duration': p.duration,
            '--fall-delay': p.delay,
          }}
        />
      ))}
    </div>
  )
}

// ── Battle Overlay ──
function BattleOverlay({ matchup, onComplete }) {
  const [phase, setPhase] = useState('intro') // intro → reveal → exit
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    const scoreA = compositeScore(matchup.a)
    const scoreB = compositeScore(matchup.b)
    const w = scoreA >= scoreB ? matchup.a : matchup.b

    const revealTimer = setTimeout(() => {
      setWinner(w)
      setPhase('reveal')
    }, 2000)

    const exitTimer = setTimeout(() => {
      setPhase('exit')
      onComplete(w)
    }, 3500)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(exitTimer)
    }
  }, [matchup, onComplete])

  const scoreA = compositeScore(matchup.a)
  const scoreB = compositeScore(matchup.b)

  return (
    <motion.div
      className={styles.battleOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.battleSplit}>
        {/* Left */}
        <motion.div
          className={styles.battleSide}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={winner && winner.id !== matchup.a.id ? { opacity: 0.3, filter: 'grayscale(0.5)', transform: 'scale(0.9)' } : {}}
        >
          {matchup.a.poster_path && (
            <motion.img
              src={tmdb.poster(matchup.a.poster_path, 'w342')}
              alt=""
              className={styles.battlePoster}
              animate={winner?.id === matchup.a.id ? {
                boxShadow: '0 0 40px rgba(200,169,110,0.5)',
                borderColor: 'var(--accent)',
              } : {}}
            />
          )}
          <div className={styles.battleTitle}>{matchup.a.title || matchup.a.name}</div>
          <div className={styles.battleScore}>
            COMPOSITE SCORE
            <div className={styles.battleScoreValue} style={winner?.id === matchup.a.id ? { color: 'var(--accent)' } : {}}>
              {phase === 'reveal' || phase === 'exit' ? scoreA.toFixed(2) : '??.??'}
            </div>
          </div>
        </motion.div>

        {/* VS Divider */}
        <div className={styles.vsDivider}>
          <div className={styles.vsLine} />
          <motion.div
            className={styles.vsText}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            VS
          </motion.div>
          <div className={styles.vsLine} />
        </div>

        {/* Right */}
        <motion.div
          className={styles.battleSide}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={winner && winner.id !== matchup.b.id ? { opacity: 0.3, filter: 'grayscale(0.5)', transform: 'scale(0.9)' } : {}}
        >
          {matchup.b.poster_path && (
            <motion.img
              src={tmdb.poster(matchup.b.poster_path, 'w342')}
              alt=""
              className={styles.battlePoster}
              animate={winner?.id === matchup.b.id ? {
                boxShadow: '0 0 40px rgba(200,169,110,0.5)',
                borderColor: 'var(--accent)',
              } : {}}
            />
          )}
          <div className={styles.battleTitle}>{matchup.b.title || matchup.b.name}</div>
          <div className={styles.battleScore}>
            COMPOSITE SCORE
            <div className={styles.battleScoreValue} style={winner?.id === matchup.b.id ? { color: 'var(--accent)' } : {}}>
              {phase === 'reveal' || phase === 'exit' ? scoreB.toFixed(2) : '??.??'}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Champion Overlay ──
function ChampionOverlay({ champion, onReset, onDismiss }) {
  return (
    <motion.div
      className={styles.championOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Confetti />
      <motion.div
        className={styles.crown}
        initial={{ y: -40, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
      >
        &#x1F451;
      </motion.div>
      <motion.div
        className={styles.championLabel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Tournament Champion
      </motion.div>
      {champion.poster_path && (
        <motion.img
          src={tmdb.poster(champion.poster_path, 'w500')}
          alt=""
          className={styles.championPoster}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        />
      )}
      <motion.div
        className={styles.championTitle}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {champion.title || champion.name}
      </motion.div>
      <motion.div
        className={styles.championScore}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Score: {compositeScore(champion).toFixed(2)} &middot; Rating: {formatRating(champion.vote_average)} &middot; {champion.vote_count?.toLocaleString()} votes
      </motion.div>
      <motion.div
        className={styles.championActions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button className={styles.startBtn} onClick={onDismiss}>
          View Bracket
        </button>
        <button className={styles.resetBtn} onClick={onReset}>
          New Tournament
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Main Arena Page ──
export default function Arena() {
  // Phase: 'selection' | 'bracket' | 'champion'
  const [phase, setPhase] = useState('selection')
  const [bracketSize, setBracketSize] = useState(8)
  const [roster, setRoster] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  // Bracket state
  const [bracket, setBracket] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0)
  const [battling, setBattling] = useState(null) // current matchup being animated
  const [champion, setChampion] = useState(null)
  const [showChampion, setShowChampion] = useState(false)

  // Search debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const data = await tmdb.search(query)
        setResults(
          (data.results || [])
            .filter(r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path)
            .filter(r => !roster.some(item => item.id === r.id))
            .slice(0, 6)
        )
      } catch { setResults([]) }
    }, 350)
    return () => clearTimeout(t)
  }, [query, roster])

  const addToRoster = (item) => {
    if (roster.length >= bracketSize) return
    if (roster.some(r => r.id === item.id)) return
    setRoster(prev => [...prev, item])
    setQuery('')
    setResults([])
  }

  const removeFromRoster = (id) => {
    setRoster(prev => prev.filter(r => r.id !== id))
  }

  const startTournament = () => {
    if (roster.length !== bracketSize) return
    const b = generateBracket(roster)
    setBracket(b)
    setPhase('bracket')

    // Find first matchup that needs battling (skip byes)
    for (let r = 0; r < b.length; r++) {
      for (let m = 0; m < b[r].length; m++) {
        if (!b[r][m].winner && b[r][m].a && b[r][m].b) {
          setCurrentRound(r)
          setCurrentMatchIdx(m)
          setBattling(b[r][m])
          return
        }
      }
    }
  }

  const handleBattleComplete = useCallback((winner) => {
    setBattling(null)

    setBracket(prev => {
      const next = prev.map(round => round.map(m => ({ ...m })))

      // Mark winner in current matchup
      next[currentRound][currentMatchIdx].winner = winner

      // Advance winner to next round
      if (currentRound < next.length - 1) {
        const nextMatchIdx = Math.floor(currentMatchIdx / 2)
        const slot = currentMatchIdx % 2 === 0 ? 'a' : 'b'
        next[currentRound + 1][nextMatchIdx][slot] = winner
      }

      return next
    })

    // Schedule next matchup — skip byes
    setTimeout(() => {
      setBracket(prev => {
        // Find next unresolved matchup with both sides filled
        const findNext = (startRound, startMatch) => {
          for (let r = startRound; r < prev.length; r++) {
            const mStart = r === startRound ? startMatch : 0
            for (let m = mStart; m < prev[r].length; m++) {
              if (!prev[r][m].winner && prev[r][m].a && prev[r][m].b) {
                return { round: r, match: m }
              }
            }
          }
          return null
        }

        const next = findNext(currentRound, currentMatchIdx + 1)
        if (next) {
          setCurrentRound(next.round)
          setCurrentMatchIdx(next.match)
          setBattling(prev[next.round][next.match])
        } else {
          // Tournament over — stay on bracket, show champion overlay on top
          setChampion(winner)
          setShowChampion(true)
        }
        return prev
      })
    }, 500)
  }, [currentRound, currentMatchIdx])

  const resetTournament = () => {
    setPhase('selection')
    setRoster([])
    setBracket([])
    setCurrentRound(0)
    setCurrentMatchIdx(0)
    setBattling(null)
    setChampion(null)
    setShowChampion(false)
    setQuery('')
    setResults([])
  }

  const totalRounds = bracket.length

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Arena</h1>
            <p className={styles.pageSubtitle}>Tournament bracket — titles battle to be crowned champion</p>
          </header>

          {/* ── Selection Phase ── */}
          {phase === 'selection' && (
            <div className={styles.selectionPhase}>
              <div className={styles.rosterHeader}>
                <span className={styles.rosterCount}>
                  {roster.length} / {bracketSize} titles selected
                </span>
                <div className={styles.sizeToggle}>
                  {[4, 8, 12, 16].map(n => (
                    <button
                      key={n}
                      className={`${styles.sizeBtn} ${bracketSize === n ? styles.sizeBtnActive : ''}`}
                      onClick={() => { setBracketSize(n); setRoster(r => r.slice(0, n)) }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.searchWrap}>
                <input
                  className={styles.searchInput}
                  placeholder="Search movies & shows to add…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {results.length > 0 && (
                  <ul className={styles.dropdown}>
                    {results.map(r => (
                      <li key={r.id}>
                        <button className={styles.dropdownItem} onClick={() => addToRoster(r)}>
                          {r.poster_path && (
                            <img src={tmdb.poster(r.poster_path, 'w92')} alt="" className={styles.dropThumb} />
                          )}
                          <span>
                            <span className={styles.dropTitle}>{r.title || r.name}</span>
                            <span className={styles.dropMeta}>
                              {r.media_type === 'movie' ? 'Film' : 'Series'}
                              {(r.release_date || r.first_air_date || '').slice(0, 4) &&
                                ` · ${(r.release_date || r.first_air_date).slice(0, 4)}`}
                              {r.vote_average > 0 && ` · ★ ${r.vote_average.toFixed(1)}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {roster.length > 0 && (
                <div className={styles.roster}>
                  {roster.map((item, i) => (
                    <motion.div
                      key={item.id}
                      className={styles.rosterCard}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <span className={styles.rosterSeed}>{i + 1}</span>
                      <button className={styles.removeBtn} onClick={() => removeFromRoster(item.id)}>×</button>
                      {item.poster_path ? (
                        <img src={tmdb.poster(item.poster_path, 'w185')} alt="" className={styles.rosterPoster} />
                      ) : (
                        <div className={styles.rosterPosterBlank}>?</div>
                      )}
                      <span className={styles.rosterName}>{item.title || item.name}</span>
                    </motion.div>
                  ))}
                  {Array.from({ length: bracketSize - roster.length }, (_, i) => (
                    <div key={`empty-${i}`} className={styles.emptySlot}>
                      #{roster.length + i + 1}
                    </div>
                  ))}
                </div>
              )}

              <button
                className={styles.startBtn}
                disabled={roster.length !== bracketSize}
                onClick={startTournament}
              >
                {roster.length === bracketSize ? 'Start Tournament' : `Add ${bracketSize - roster.length} more`}
              </button>
            </div>
          )}

          {/* ── Bracket Phase ── */}
          {phase === 'bracket' && (
            <div className={styles.bracketPhase}>
              <div className={styles.bracketControls}>
                <div>
                  {champion ? (
                    <>
                      <span className={styles.roundLabel}>Tournament Complete</span>
                      <span className={styles.roundSublabel}>
                        Champion: {champion.title || champion.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.roundLabel}>
                        {getRoundName(currentRound, totalRounds)}
                      </span>
                      <span className={styles.roundSublabel}>
                        Match {currentMatchIdx + 1} of {bracket[currentRound]?.length}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  {champion && (
                    <button className={styles.resetBtn} onClick={() => setShowChampion(true)}>
                      Show Champion
                    </button>
                  )}
                  <button className={styles.resetBtn} onClick={resetTournament}>
                    New Tournament
                  </button>
                </div>
              </div>

              {/* Bracket Visualization */}
              <div className={styles.bracketLayout}>
                {bracket.map((round, ri) => (
                  <div key={ri} className={styles.bracketRound}>
                    <div className={styles.roundTitle}>{getRoundName(ri, totalRounds)}</div>
                    {round.map((matchup, mi) => {
                      const hasBye = matchup.winner && (!matchup.a || !matchup.b)
                      return (
                        <div key={mi} className={styles.matchup}>
                          <MatchupSlot
                            title={matchup.a}
                            isWinner={matchup.winner && matchup.a && matchup.winner.id === matchup.a.id}
                            isLoser={matchup.winner && matchup.a && matchup.winner.id !== matchup.a.id}
                            isBye={hasBye && !matchup.a}
                          />
                          <MatchupSlot
                            title={matchup.b}
                            isWinner={matchup.winner && matchup.b && matchup.winner.id === matchup.b.id}
                            isLoser={matchup.winner && matchup.b && matchup.winner.id !== matchup.b.id}
                            isBye={hasBye && !matchup.b}
                          />
                          {ri < bracket.length - 1 && <div className={styles.connector} />}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battle overlay */}
      <AnimatePresence>
        {battling && battling.a && battling.b && (
          <BattleOverlay
            key={`${battling.a.id}-${battling.b.id}`}
            matchup={battling}
            onComplete={handleBattleComplete}
          />
        )}
      </AnimatePresence>

      {/* Champion overlay — shown on top of bracket */}
      <AnimatePresence>
        {champion && showChampion && (
          <ChampionOverlay
            champion={champion}
            onReset={resetTournament}
            onDismiss={() => setShowChampion(false)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

function MatchupSlot({ title, isWinner, isLoser, isBye }) {
  if (!title) {
    return (
      <div className={`${styles.matchupSlot} ${isBye ? styles.slotLoser : ''}`}>
        <span className={styles.slotEmpty}>{isBye ? 'BYE' : 'TBD'}</span>
      </div>
    )
  }

  return (
    <motion.div
      className={`${styles.matchupSlot} ${isWinner ? styles.slotWinner : ''} ${isLoser ? styles.slotLoser : ''}`}
      initial={false}
      animate={isWinner ? { borderColor: 'var(--accent)' } : {}}
    >
      {title.poster_path && (
        <img src={tmdb.poster(title.poster_path, 'w92')} alt="" className={styles.slotPoster} />
      )}
      <span className={styles.slotName}>{title.title || title.name}</span>
      <span className={styles.slotScore}>{formatRating(title.vote_average)}</span>
    </motion.div>
  )
}
