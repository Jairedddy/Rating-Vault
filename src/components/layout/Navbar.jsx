import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, X, Film, Tv, BarChart2, GitCompare } from 'lucide-react'
import { tmdb } from '../../services/tmdb'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setQuery('')
    setResults([])
  }, [location.pathname])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await tmdb.search(query)
        setResults((data.results || []).filter(r =>
          (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path
        ).slice(0, 6))
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>RV</span>
          <span className={styles.logoText}>RatingVault</span>
        </Link>

        <div className={styles.links}>
          <Link to="/charts" className={`${styles.link} ${isActive('/charts') ? styles.active : ''}`}>
            <BarChart2 size={14} />
            Charts
          </Link>
          <Link to="/compare" className={`${styles.link} ${isActive('/compare') ? styles.active : ''}`}>
            <GitCompare size={14} />
            Compare
          </Link>
        </div>

        <button
          className={styles.searchBtn}
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <Search size={16} />
          <span>Search titles…</span>
        </button>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className={styles.overlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchModal} onClick={e => e.stopPropagation()}>
            <div className={styles.searchInputWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                autoFocus
                className={styles.searchInput}
                placeholder="Search movies & shows…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {searching && <div className={styles.spinner} />}
              <button className={styles.closeBtn} onClick={() => setSearchOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {results.length > 0 && (
              <ul className={styles.results}>
                {results.map(r => (
                  <li key={r.id}>
                    <Link
                      to={`/title/${r.media_type}/${r.id}`}
                      className={styles.resultItem}
                    >
                      {r.poster_path
                        ? <img src={tmdb.poster(r.poster_path, 'w92')} alt="" className={styles.resultPoster} />
                        : <div className={styles.resultPosterBlank}>{r.media_type === 'movie' ? <Film size={16}/> : <Tv size={16}/>}</div>
                      }
                      <div className={styles.resultInfo}>
                        <span className={styles.resultTitle}>{r.title || r.name}</span>
                        <span className={styles.resultMeta}>
                          <span className={styles.badge}>{r.media_type === 'movie' ? 'Film' : 'Series'}</span>
                          {(r.release_date || r.first_air_date || '').slice(0, 4)}
                          {r.vote_average > 0 && <> · ★ {r.vote_average.toFixed(1)}</>}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {query && !searching && results.length === 0 && (
              <p className={styles.empty}>No results for "{query}"</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
