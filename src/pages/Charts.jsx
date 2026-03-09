import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tmdb, getRatingColor, formatRating } from '../services/tmdb'
import PageTransition from '../components/transitions/PageTransition'
import PosterMorph from '../components/transitions/PosterMorph'
import styles from './Charts.module.css'

const TABS = [
  { key: 'trending', label: 'Trending' },
  { key: 'top_movies', label: 'Top Films' },
  { key: 'top_tv', label: 'Top Series' },
  { key: 'popular_movies', label: 'Popular Films' },
  { key: 'popular_tv', label: 'Popular Series' },
]

const fetchers = {
  trending: () => tmdb.trending('all', 'week'),
  top_movies: () => tmdb.topRatedMovies(),
  top_tv: () => tmdb.topRatedTV(),
  popular_movies: () => tmdb.popularMovies(),
  popular_tv: () => tmdb.popularTV(),
}

const mediaTypeOf = (key, item) => {
  if (key === 'trending') return item.media_type
  if (key.includes('movies')) return 'movie'
  return 'tv'
}

export default function Charts() {
  const [activeTab, setActiveTab] = useState('trending')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data[activeTab]) return
    setLoading(true)
    const fetch = (retry = 1) => {
      fetchers[activeTab]()
        .then(d => setData(prev => ({ ...prev, [activeTab]: d.results || [] })))
        .catch(() => { if (retry > 0) return fetch(retry - 1) })
        .finally(() => setLoading(false))
    }
    fetch()
  }, [activeTab])

  const items = data[activeTab] || []

  return (
    <PageTransition>
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Charts</h1>
          <p className={styles.pageSubtitle}>Top rated & trending titles from TMDB</p>
        </header>

        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.listSkeleton}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : (
          <ol className={styles.list}>
            {items.filter(item => item.vote_average > 0).map((item, i) => {
              const mt = mediaTypeOf(activeTab, item)
              const color = getRatingColor(item.vote_average)
              return (
                <li key={item.id} className={styles.row} style={{ animationDelay: `${i * 25}ms` }}>
                  <span className={styles.rank}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <Link to={`/title/${mt}/${item.id}`} className={styles.rowLink}>
                    <PosterMorph layoutId={`poster-${mt}-${item.id}`}>
                      {item.poster_path
                        ? <img src={tmdb.poster(item.poster_path, 'w92')} alt="" className={styles.thumb} />
                        : <div className={styles.thumbBlank} />
                      }
                    </PosterMorph>
                    <div className={styles.rowInfo}>
                      <span className={styles.rowTitle}>{item.title || item.name}</span>
                      <div className={styles.rowMeta}>
                        <span className={styles.badge}>{mt === 'movie' ? 'Film' : 'Series'}</span>
                        <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                        <span>{item.vote_count?.toLocaleString()} votes</span>
                      </div>
                    </div>
                  </Link>

                  <div className={styles.rowRating}>
                    <span className={styles.rowRatingNum} style={{ color }}>{formatRating(item.vote_average)}</span>
                    <div className={styles.rowBar}>
                      <div
                        className={styles.rowBarFill}
                        style={{ width: `${(item.vote_average / 10) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
    </PageTransition>
  )
}
