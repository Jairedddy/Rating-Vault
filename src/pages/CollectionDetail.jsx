import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Dot,
} from 'recharts'
import { ChevronLeft, Film } from 'lucide-react'
import { tmdb, getRatingColor, formatRating } from '../services/tmdb'
import PageTransition from '../components/transitions/PageTransition'
import SmartImage from '../components/ui/SmartImage'
import SEO from '../components/SEO'
import styles from './CollectionDetail.module.css'

function RatingDot(props) {
  const { cx, cy, payload } = props
  const color = getRatingColor(payload.rating)
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="var(--bg-base)" strokeWidth={2} />
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipTitle}>{d.fullTitle}</span>
      <span className={styles.tooltipYear}>{d.year}</span>
      <span className={styles.tooltipRating} style={{ color: getRatingColor(d.rating) }}>
        ★ {d.rating.toFixed(1)}
      </span>
    </div>
  )
}

export default function CollectionDetail() {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setCollection(null)
    tmdb.collection(id)
      .then(setCollection)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState />
  if (!collection) return <ErrorState />

  // Sort all parts chronologically
  const allParts = [...(collection.parts || [])]
    .sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''))

  // Parts with valid ratings for stats + chart
  const ratedParts = allParts.filter(p => p.vote_average > 0 && p.vote_count > 20)

  // Stats
  const avgRating = ratedParts.length
    ? ratedParts.reduce((s, p) => s + p.vote_average, 0) / ratedParts.length
    : 0
  const best = ratedParts.reduce((b, p) => p.vote_average > (b?.vote_average || 0) ? p : b, null)
  const worst = ratedParts.reduce((w, p) => p.vote_average < (w?.vote_average || 10) ? p : w, null)

  // Chart data
  const chartData = ratedParts.map(p => ({
    year: p.release_date?.slice(0, 4) || '—',
    rating: parseFloat(p.vote_average.toFixed(1)),
    fullTitle: p.title,
  }))

  const avgColor = getRatingColor(avgRating)

  return (
    <PageTransition>
      <SEO
        title={collection.name}
        description={collection.overview?.slice(0, 160) || `All ${allParts.length} films in the ${collection.name}.`}
        image={collection.poster_path ? `https://image.tmdb.org/t/p/w500${collection.poster_path}` : undefined}
        url={`/collection/${id}`}
      />
      <div className={styles.page}>

        {/* Backdrop */}
        {collection.backdrop_path && (
          <div
            className={styles.backdrop}
            style={{ backgroundImage: `url(${tmdb.backdrop(collection.backdrop_path)})` }}
          />
        )}
        <div className={styles.backdropGradient} />

        <div className={styles.content}>

          {/* Back link */}
          <Link to="/discover?preset=collections" className={styles.backLink}>
            <ChevronLeft size={14} />
            Collections
          </Link>

          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerMeta}>
              <span className={styles.pill}>Franchise</span>
              <span className={styles.metaItem}>{allParts.length} films</span>
            </div>
            <h1 className={styles.title}>{collection.name}</h1>
            {collection.overview && (
              <p className={styles.overview}>{collection.overview}</p>
            )}
          </header>

          {/* Stats */}
          {ratedParts.length > 0 && (
            <section className={styles.statsSection}>
              <StatCard
                label="Franchise Avg"
                value={formatRating(avgRating)}
                unit="/10"
                color={avgColor}
              />
              {best && (
                <StatCard
                  label="Best Entry"
                  value={formatRating(best.vote_average)}
                  subtitle={best.title}
                  color={getRatingColor(best.vote_average)}
                />
              )}
              {worst && best?.id !== worst?.id && (
                <StatCard
                  label="Weakest Entry"
                  value={formatRating(worst.vote_average)}
                  subtitle={worst.title}
                  color={getRatingColor(worst.vote_average)}
                />
              )}
              <StatCard
                label="Total Films"
                value={String(allParts.length)}
                unit="films"
              />
            </section>
          )}

          {/* Rating evolution chart */}
          {chartData.length > 1 && (
            <section className={styles.chartSection}>
              <h2 className={styles.sectionTitle}>Rating Across the Franchise</h2>
              <p className={styles.sectionSubtitle}>How the quality evolved over time</p>
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                    />
                    <YAxis
                      domain={[
                        Math.max(0, Math.floor(Math.min(...chartData.map(d => d.rating)) - 0.5)),
                        Math.min(10, Math.ceil(Math.max(...chartData.map(d => d.rating)) + 0.5)),
                      ]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="rgba(200,169,110,0.4)"
                      strokeWidth={1.5}
                      dot={<RatingDot />}
                      activeDot={{ r: 7, fill: 'var(--accent)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Film list */}
          <section className={styles.filmSection}>
            <h2 className={styles.sectionTitle}>All Films</h2>
            <ol className={styles.filmList}>
              {allParts.map((part, i) => {
                const year = part.release_date?.slice(0, 4)
                const rated = part.vote_average > 0 && part.vote_count > 5
                const color = rated ? getRatingColor(part.vote_average) : 'var(--text-muted)'
                return (
                  <li key={part.id} className={styles.filmRow}>
                    <span className={styles.filmRank}>{String(i + 1).padStart(2, '0')}</span>
                    <Link to={`/title/movie/${part.id}`} className={styles.filmLink}>
                      <div className={styles.filmThumb}>
                        <SmartImage path={part.poster_path} alt="" className={styles.filmPoster} />
                      </div>
                      <div className={styles.filmInfo}>
                        <span className={styles.filmTitle}>{part.title}</span>
                        <div className={styles.filmMeta}>
                          {year && <span>{year}</span>}
                          {part.vote_count > 0 && (
                            <span>{part.vote_count.toLocaleString()} votes</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className={styles.filmRating}>
                      <span className={styles.filmRatingNum} style={{ color }}>
                        {rated ? formatRating(part.vote_average) : '—'}
                      </span>
                      {rated && (
                        <div className={styles.filmBar}>
                          <div
                            className={styles.filmBarFill}
                            style={{ width: `${(part.vote_average / 10) * 100}%`, background: color }}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

function StatCard({ label, value, unit, subtitle, color }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={color ? { color } : {}}>
        {value}
        {unit && <span className={styles.statUnit}> {unit}</span>}
      </span>
      {subtitle && <span className={styles.statSubtitle}>{subtitle}</span>}
    </div>
  )
}

function LoadingState() {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner} />
    </div>
  )
}

function ErrorState() {
  return (
    <div className={styles.loadingPage}>
      <Film size={32} style={{ color: 'rgba(200,169,110,0.3)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>Collection not found</p>
      <Link to="/discover?preset=collections" style={{ color: 'var(--accent)', fontSize: 13, marginTop: 8 }}>
        ← Back to collections
      </Link>
    </div>
  )
}
