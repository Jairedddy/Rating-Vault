import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { tmdb, getRatingColor, getRatingLabel, formatRating } from '../services/tmdb'
import RatingLineChart from '../components/charts/RatingLineChart'
import EpisodeHeatmap from '../components/charts/EpisodeHeatmap'
import SeasonRadar from '../components/charts/SeasonRadar'
import styles from './TitleDetail.module.css'

export default function TitleDetail() {
  const { type, id } = useParams()
  const [data, setData] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setData(null)
    setSeasons([])

    const fetchData = async () => {
      try {
        if (type === 'movie') {
          const movie = await tmdb.movie(id)
          setData(movie)
        } else {
          const show = await tmdb.tv(id)
          setData(show)
          // Fetch all seasons (limit to 10 for perf)
          const totalSeasons = Math.min(show.number_of_seasons || 0, 10)
          if (totalSeasons > 0) {
            const seasonData = await tmdb.tvSeasonRatings(id, totalSeasons)
            setSeasons(seasonData)
          }
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type, id])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data) return null

  const rating = data.vote_average
  const ratingColor = getRatingColor(rating)
  const ratingLabel = getRatingLabel(rating)
  const year = (data.release_date || data.first_air_date || '').slice(0, 4)
  const runtime = type === 'movie'
    ? data.runtime ? `${data.runtime}m` : null
    : data.episode_run_time?.[0] ? `${data.episode_run_time[0]}m / ep` : null

  const currentSeasonData = seasons[selectedSeason - 1]
  const episodes = currentSeasonData?.episodes?.filter(ep => ep.vote_count > 0) || []

  // Build chart data across all seasons
  const allEpisodesChart = seasons.flatMap((s, si) =>
    (s.episodes || [])
      .filter(ep => ep.vote_average > 0 && ep.episode_number > 0)
      .map(ep => ({
        label: `S${si+1}E${ep.episode_number}`,
        rating: ep.vote_average,
        season: si + 1,
        episode: ep.episode_number,
        name: ep.name,
      }))
  )

  const seasonAverages = seasons.map((s, i) => ({
    season: `S${i + 1}`,
    avg: s.episodes
      ? (s.episodes.filter(ep => ep.vote_average > 0).reduce((sum, ep) => sum + ep.vote_average, 0) /
         (s.episodes.filter(ep => ep.vote_average > 0).length || 1))
      : 0
  })).filter(s => s.avg > 0)

  return (
    <div className={styles.page}>
      {/* Backdrop */}
      {data.backdrop_path && (
        <div
          className={styles.backdrop}
          style={{ backgroundImage: `url(${tmdb.backdrop(data.backdrop_path)})` }}
        />
      )}
      <div className={styles.backdropGradient} />

      <div className={styles.content}>
        {/* Header */}
        <section className={styles.header}>
          <div className={styles.posterWrap}>
            {data.poster_path
              ? <img src={tmdb.poster(data.poster_path, 'w342')} alt={data.title || data.name} className={styles.poster} />
              : <div className={styles.posterBlank} />
            }
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.headerMeta}>
              <span className={styles.pill}>{type === 'movie' ? 'Film' : 'Series'}</span>
              {year && <span className={styles.metaItem}>{year}</span>}
              {runtime && <span className={styles.metaItem}>{runtime}</span>}
              {type === 'tv' && data.number_of_seasons && (
                <span className={styles.metaItem}>{data.number_of_seasons} seasons</span>
              )}
            </div>

            <h1 className={styles.title}>{data.title || data.name}</h1>

            {data.tagline && <p className={styles.tagline}>"{data.tagline}"</p>}

            <p className={styles.overview}>{data.overview}</p>

            {/* Genres */}
            {data.genres?.length > 0 && (
              <div className={styles.genres}>
                {data.genres.map(g => (
                  <span key={g.id} className={styles.genre}>{g.name}</span>
                ))}
              </div>
            )}

            {/* Rating hero */}
            <div className={styles.ratingHero}>
              <div className={styles.ratingMain}>
                <span className={styles.ratingNum} style={{ color: ratingColor }}>
                  {formatRating(rating)}
                </span>
                <span className={styles.ratingOf}>/10</span>
              </div>
              <div className={styles.ratingDetails}>
                <span className={styles.ratingLabel} style={{ color: ratingColor }}>{ratingLabel}</span>
                <span className={styles.voteCount}>{data.vote_count?.toLocaleString()} votes</span>
              </div>
              {/* Rating bar */}
              <div className={styles.ratingBarWrap}>
                <div
                  className={styles.ratingBar}
                  style={{
                    width: `${(rating / 10) * 100}%`,
                    background: ratingColor
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TV Show Charts */}
        {type === 'tv' && seasons.length > 0 && (
          <>
            {/* All episodes line chart */}
            {allEpisodesChart.length > 0 && (
              <section className={styles.chartSection}>
                <h2 className={styles.chartTitle}>Episode Ratings — Full Series Arc</h2>
                <p className={styles.chartSubtitle}>Every episode across all seasons</p>
                <div className={styles.chartWrap}>
                  <RatingLineChart data={allEpisodesChart} />
                </div>
              </section>
            )}

            {/* Season averages */}
            {seasonAverages.length > 1 && (
              <section className={styles.chartSection}>
                <h2 className={styles.chartTitle}>Season Averages</h2>
                <p className={styles.chartSubtitle}>How each season stacks up</p>
                <div className={styles.chartWrap} style={{ height: 280 }}>
                  <SeasonRadar data={seasonAverages} />
                </div>
              </section>
            )}

            {/* Heatmap per season */}
            <section className={styles.chartSection}>
              <div className={styles.chartTitleRow}>
                <div>
                  <h2 className={styles.chartTitle}>Episode Heatmap</h2>
                  <p className={styles.chartSubtitle}>Rating intensity by episode</p>
                </div>
                <div className={styles.seasonTabs}>
                  {seasons.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.seasonTab} ${selectedSeason === i + 1 ? styles.seasonTabActive : ''}`}
                      onClick={() => setSelectedSeason(i + 1)}
                    >
                      S{i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {episodes.length > 0
                ? <EpisodeHeatmap episodes={episodes} />
                : <p className={styles.noData}>No rating data for this season yet.</p>
              }
            </section>
          </>
        )}

        {/* Movie — score breakdown */}
        {type === 'movie' && (
          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Score Overview</h2>
            <div className={styles.movieStats}>
              <StatBlock label="TMDB Score" value={formatRating(data.vote_average)} unit="/10" color={ratingColor} />
              <StatBlock label="Vote Count" value={data.vote_count?.toLocaleString()} unit="votes" />
              <StatBlock label="Popularity" value={Math.round(data.popularity)} unit="pts" />
              {data.budget > 0 && (
                <StatBlock label="Budget" value={`$${(data.budget / 1e6).toFixed(0)}M`} />
              )}
              {data.revenue > 0 && (
                <StatBlock label="Revenue" value={`$${(data.revenue / 1e6).toFixed(0)}M`} />
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function StatBlock({ label, value, unit, color }) {
  return (
    <div className={styles.statBlock}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={color ? { color } : {}}>
        {value}
        {unit && <span className={styles.statUnit}> {unit}</span>}
      </span>
    </div>
  )
}

function LoadingState() {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner} />
      <span className={styles.loadingText}>Loading…</span>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className={styles.loadingPage}>
      <p className={styles.errorText}>Failed to load: {message}</p>
      <Link to="/" className={styles.errorBack}>← Back to home</Link>
    </div>
  )
}
