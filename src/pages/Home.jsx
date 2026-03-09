import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tmdb } from '../services/tmdb'
import styles from './Home.module.css'

export default function Home() {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState(null)

  useEffect(() => {
    tmdb.trending('all', 'week').then(data => {
      const items = (data.results || []).filter(r =>
        (r.media_type === 'movie' || r.media_type === 'tv') && r.backdrop_path
      )
      setHero(items[0] || null)
      setTrending(items.slice(1, 13))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      {/* Hero */}
      {hero && (
        <section className={styles.hero}>
          <div
            className={styles.heroBackdrop}
            style={{ backgroundImage: `url(${tmdb.backdrop(hero.backdrop_path)})` }}
          />
          <div className={styles.heroGradient} />
          <div className={styles.heroContent}>
            <span className={styles.heroPill}>
              {hero.media_type === 'movie' ? 'Film' : 'Series'} · Trending Now
            </span>
            <h1 className={styles.heroTitle}>{hero.title || hero.name}</h1>
            <p className={styles.heroOverview}>{hero.overview?.slice(0, 200)}…</p>
            <div className={styles.heroMeta}>
              <span className={styles.heroRating}>
                <span className={styles.heroRatingNum}>{hero.vote_average?.toFixed(1)}</span>
                <span className={styles.heroRatingLabel}>/ 10</span>
              </span>
              <span className={styles.heroDivider} />
              <span className={styles.heroVotes}>{hero.vote_count?.toLocaleString()} votes</span>
            </div>
            <Link
              to={`/title/${hero.media_type}/${hero.id}`}
              className={styles.heroBtn}
            >
              View Ratings Analysis →
            </Link>
          </div>
        </section>
      )}

      {/* Trending grid */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Trending This Week</h2>
          <Link to="/charts" className={styles.sectionLink}>See all charts →</Link>
        </header>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {trending.map((item, i) => (
              <TitleCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TitleCard({ item, index }) {
  return (
    <Link
      to={`/title/${item.media_type}/${item.id}`}
      className={styles.card}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={styles.cardPoster}>
        {item.poster_path
          ? <img src={tmdb.poster(item.poster_path)} alt={item.title || item.name} loading="lazy" />
          : <div className={styles.cardPosterBlank} />
        }
        <div className={styles.cardOverlay}>
          <span className={styles.cardRating}>{item.vote_average?.toFixed(1)}</span>
        </div>
        <span className={styles.cardType}>
          {item.media_type === 'movie' ? 'Film' : 'Series'}
        </span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title || item.name}</h3>
        <span className={styles.cardYear}>
          {(item.release_date || item.first_air_date || '').slice(0, 4)}
        </span>
      </div>
    </Link>
  )
}
