import { useState, useEffect } from 'react'
import { tmdb, getRatingColor, formatRating } from '../services/tmdb'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts'
import PageTransition from '../components/transitions/PageTransition'
import styles from './Compare.module.css'

export default function Compare() {
  const [leftQuery, setLeftQuery] = useState('')
  const [rightQuery, setRightQuery] = useState('')
  const [leftResults, setLeftResults] = useState([])
  const [rightResults, setRightResults] = useState([])
  const [leftPick, setLeftPick] = useState(null)
  const [rightPick, setRightPick] = useState(null)
  const [leftData, setLeftData] = useState(null)
  const [rightData, setRightData] = useState(null)
  const [leftSeasons, setLeftSeasons] = useState([])
  const [rightSeasons, setRightSeasons] = useState([])
  const [loading, setLoading] = useState({ left: false, right: false })

  // Search debounce
  useEffect(() => {
    if (!leftQuery.trim()) { setLeftResults([]); return }
    const t = setTimeout(async () => {
      const d = await tmdb.search(leftQuery)
      setLeftResults((d.results || []).filter(r => r.media_type !== 'person').slice(0, 5))
    }, 350)
    return () => clearTimeout(t)
  }, [leftQuery])

  useEffect(() => {
    if (!rightQuery.trim()) { setRightResults([]); return }
    const t = setTimeout(async () => {
      const d = await tmdb.search(rightQuery)
      setRightResults((d.results || []).filter(r => r.media_type !== 'person').slice(0, 5))
    }, 350)
    return () => clearTimeout(t)
  }, [rightQuery])

  // Fetch full data when picked (auto-retry once on failure)
  const fetchFull = async (pick, side, retry = 1) => {
    setLoading(prev => ({ ...prev, [side]: true }))
    try {
      if (pick.media_type === 'movie') {
        const d = await tmdb.movie(pick.id)
        if (side === 'left') { setLeftData(d); setLeftSeasons([]) }
        else { setRightData(d); setRightSeasons([]) }
      } else {
        const d = await tmdb.tv(pick.id)
        const total = Math.min(d.number_of_seasons || 0, 8)
        const seasons = total > 0 ? await tmdb.tvSeasonRatings(pick.id, total) : []
        if (side === 'left') { setLeftData(d); setLeftSeasons(seasons) }
        else { setRightData(d); setRightSeasons(seasons) }
      }
    } catch (e) {
      if (retry > 0) return fetchFull(pick, side, retry - 1)
    } finally {
      setLoading(prev => ({ ...prev, [side]: false }))
    }
  }

  const pickLeft = (item) => {
    setLeftPick(item)
    setLeftResults([])
    setLeftQuery(item.title || item.name)
    fetchFull(item, 'left')
  }

  const pickRight = (item) => {
    setRightPick(item)
    setRightResults([])
    setRightQuery(item.title || item.name)
    fetchFull(item, 'right')
  }

  // Build comparison chart data
  const buildEpisodeChart = () => {
    const leftEps = leftSeasons.flatMap((s, si) =>
      (s.episodes || []).filter(ep => ep.vote_average > 0 && ep.episode_number > 0)
        .map((ep, ei) => ({ idx: si * 100 + ei, label: `S${si+1}E${ep.episode_number}`, left: ep.vote_average }))
    )
    const rightEps = rightSeasons.flatMap((s, si) =>
      (s.episodes || []).filter(ep => ep.vote_average > 0 && ep.episode_number > 0)
        .map((ep, ei) => ({ idx: si * 100 + ei, right: ep.vote_average }))
    )
    const maxLen = Math.max(leftEps.length, rightEps.length)
    return Array.from({ length: maxLen }, (_, i) => ({
      ...leftEps[i],
      right: rightEps[i]?.right,
      label: leftEps[i]?.label || rightEps[i]?.label || `E${i+1}`,
    }))
  }

  const chartData = buildEpisodeChart()
  const bothTV = leftPick?.media_type === 'tv' && rightPick?.media_type === 'tv'
  const step = Math.ceil(chartData.length / 20)

  return (
    <PageTransition>
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Compare</h1>
          <p className={styles.pageSubtitle}>Head-to-head rating analysis</p>
        </header>

        <div className={styles.searchRow}>
          <SearchPanel
            label="Title A"
            query={leftQuery}
            setQuery={setLeftQuery}
            results={leftResults}
            onPick={pickLeft}
            loading={loading.left}
            data={leftData}
            accentColor="#c8a96e"
          />
          <div className={styles.vsLabel}>vs</div>
          <SearchPanel
            label="Title B"
            query={rightQuery}
            setQuery={setRightQuery}
            results={rightResults}
            onPick={pickRight}
            loading={loading.right}
            data={rightData}
            accentColor="#7ec8a0"
          />
        </div>

        {/* Comparison stats */}
        {leftData && rightData && (
          <div className={styles.comparisonSection}>
            <div className={styles.statsRow}>
              <CompareCard data={leftData} color="#c8a96e" side="left" />
              <div className={styles.statsDivider} />
              <CompareCard data={rightData} color="#7ec8a0" side="right" />
            </div>

            {/* Chart */}
            {bothTV && chartData.length > 0 && (
              <div className={styles.chartSection}>
                <h3 className={styles.chartLabel}>Episode-by-episode comparison</h3>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        tickLine={false}
                        axisLine={{ stroke: 'var(--border-subtle)' }}
                        interval={step - 1}
                      />
                      <YAxis
                        domain={[5, 10]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-mid)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                        }}
                      />
                      <Legend
                        formatter={(val) => val === 'left'
                          ? (leftData.title || leftData.name)
                          : (rightData.title || rightData.name)
                        }
                        wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                      />
                      <Line type="monotone" dataKey="left" stroke="#c8a96e" strokeWidth={1.5} dot={false} connectNulls />
                      <Line type="monotone" dataKey="right" stroke="#7ec8a0" strokeWidth={1.5} dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  )
}

function SearchPanel({ label, query, setQuery, results, onPick, loading: isLoading, data, accentColor }) {
  return (
    <div className={styles.panel}>
      <span className={styles.panelLabel} style={{ color: accentColor }}>{label}</span>
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Search movies & shows…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ '--accent-color': accentColor }}
        />
        {results.length > 0 && (
          <ul className={styles.dropdown}>
            {results.map(r => (
              <li key={r.id}>
                <button className={styles.dropdownItem} onClick={() => onPick(r)}>
                  {r.poster_path && (
                    <img src={tmdb.poster(r.poster_path, 'w92')} alt="" className={styles.dropThumb} />
                  )}
                  <span>
                    <span className={styles.dropTitle}>{r.title || r.name}</span>
                    <span className={styles.dropMeta}>
                      {r.media_type === 'movie' ? 'Film' : 'Series'}
                      {(r.release_date || r.first_air_date || '').slice(0, 4) && ` · ${(r.release_date || r.first_air_date).slice(0, 4)}`}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isLoading && <div className={styles.spinner} style={{ borderTopColor: accentColor }} />}
      {data && !isLoading && (
        <div className={styles.selectedCard}>
          {data.poster_path && (
            <img src={tmdb.poster(data.poster_path, 'w342')} alt="" className={styles.selectedPoster} />
          )}
          <div className={styles.selectedTitle}>{data.title || data.name}</div>
          <div className={styles.selectedRating} style={{ color: accentColor }}>
            {formatRating(data.vote_average)}
          </div>
        </div>
      )}
    </div>
  )
}

function CompareCard({ data, color }) {
  const rating = data.vote_average
  const ratingColor = getRatingColor(rating)
  return (
    <div className={styles.compareCard}>
      <div className={styles.compareRating} style={{ color: ratingColor }}>
        {formatRating(rating)}
        <span className={styles.compareRatingOf}>/10</span>
      </div>
      <div className={styles.compareName}>{data.title || data.name}</div>
      <div className={styles.compareVotes}>{data.vote_count?.toLocaleString()} votes</div>
      <div className={styles.compareBar}>
        <div
          className={styles.compareBarFill}
          style={{ width: `${(rating / 10) * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}
