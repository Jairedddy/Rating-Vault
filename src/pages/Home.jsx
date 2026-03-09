import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { tmdb } from '../services/tmdb'
import PageTransition from '../components/transitions/PageTransition'
import PosterMorph from '../components/transitions/PosterMorph'
import styles from './Home.module.css'

export default function Home() {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState(null)
  const backdropRef = useRef(null)
  const gradientRef = useRef(null)
  const reduced = useReducedMotion()

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

  // Parallax scroll effect on hero backdrop
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const t = `translateY(${scrollY * 0.3}px)`
    if (backdropRef.current) backdropRef.current.style.transform = `scale(1.02) ${t}`
    if (gradientRef.current) gradientRef.current.style.transform = `scale(1.02) ${t}`
  }, [])

  useEffect(() => {
    if (reduced) return
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [reduced, handleScroll])

  return (
    <PageTransition>
      <div className={styles.page}>
        {/* Hero */}
        {hero && (
          <section className={styles.hero}>
            <div
              ref={backdropRef}
              className={styles.heroBackdrop}
              style={{ backgroundImage: `url(${tmdb.backdrop(hero.backdrop_path)})` }}
            />
            <div ref={gradientRef} className={styles.heroGradient} />
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
    </PageTransition>
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
        <PosterMorph layoutId={`poster-${item.media_type}-${item.id}`}>
          {item.poster_path
            ? <img src={tmdb.poster(item.poster_path)} alt={item.title || item.name} loading="lazy" />
            : <div className={styles.cardPosterBlank} />
          }
        </PosterMorph>
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
