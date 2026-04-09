import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Film, Tv, SlidersHorizontal, LayoutGrid, List, Layers } from 'lucide-react'
import { tmdb, getRatingColor, formatRating } from '../services/tmdb'
import PageTransition from '../components/transitions/PageTransition'
import PosterMorph from '../components/transitions/PosterMorph'
import SmartImage from '../components/ui/SmartImage'
import SEO from '../components/SEO'
import styles from './Discover.module.css'

// ── Curated franchise collections ───────────────────────────────────────────
const CURATED_COLLECTIONS = [
  10,      // Star Wars
  119,     // Lord of the Rings
  1241,    // Harry Potter
  9485,    // Fast & Furious
  645,     // James Bond
  263,     // The Dark Knight
  87,      // Indiana Jones
  2980,    // Toy Story
  87359,   // Mission: Impossible
  748,     // The Godfather
  330,     // Jurassic Park
  131635,  // The Hobbit
  1733,    // The Hunger Games
  2344,    // Terminator
  2602,    // Pirates of the Caribbean
]

// ── Config constants ─────────────────────────────────────────────────────────
const PRESETS = [
  { key: 'trending',    label: 'Trending' },
  { key: 'top_rated',  label: 'Top Rated' },
  { key: 'popular',    label: 'Popular' },
  { key: 'new',        label: 'New Releases' },
  { key: 'collections',label: 'Collections' },
]

const PRESET_FILTERS = {
  top_rated: () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 200 }),
  popular:   () => ({ sort_by: 'popularity.desc' }),
  new:       (mt) => ({ sort_by: mt === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc' }),
}

const SORT_OPTIONS = [
  { value: 'popularity.desc',           label: 'Most Popular' },
  { value: 'vote_average.desc',         label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'vote_count.desc',           label: 'Most Voted' },
]

const SORT_OPTIONS_TV = [
  { value: 'popularity.desc',       label: 'Most Popular' },
  { value: 'vote_average.desc',     label: 'Highest Rated' },
  { value: 'first_air_date.desc',   label: 'Newest First' },
  { value: 'vote_count.desc',       label: 'Most Voted' },
]

const CURRENT_YEAR = new Date().getFullYear()

function readParams(sp) {
  return {
    preset:    sp.get('preset') || 'trending',
    mediaType: sp.get('type') || 'movie',
    genreId:   sp.get('genre') || '',
    yearMin:   sp.get('yearMin') || '',
    yearMax:   sp.get('yearMax') || '',
    ratingMin: sp.get('ratingMin') || '0',
    sort:      sp.get('sort') || 'popularity.desc',
    view:      sp.get('view') || 'grid',
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = readParams(searchParams)

  const [movieGenres, setMovieGenres] = useState([])
  const [tvGenres, setTvGenres] = useState([])
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Collections state
  const [collectionsData, setCollectionsData] = useState([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)

  const sentinelRef = useRef(null)
  const activeKey = useRef('')

  useEffect(() => {
    tmdb.movieGenres().then(d => setMovieGenres(d.genres || []))
    tmdb.tvGenres().then(d => setTvGenres(d.genres || []))
  }, [])

  // Fetch curated collections once (and only once)
  useEffect(() => {
    if (state.preset !== 'collections') return
    if (collectionsData.length > 0) return
    setCollectionsLoading(true)
    Promise.all(
      CURATED_COLLECTIONS.map(id => tmdb.collection(id).catch(() => null))
    ).then(results => {
      setCollectionsData(results.filter(Boolean))
    }).finally(() => setCollectionsLoading(false))
  }, [state.preset, collectionsData.length])

  const buildApiFilters = useCallback((s) => {
    if (PRESET_FILTERS[s.preset]) return PRESET_FILTERS[s.preset](s.mediaType)
    const params = { sort_by: s.sort, 'vote_count.gte': 10 }
    if (s.genreId) params.with_genres = s.genreId
    if (s.ratingMin && s.ratingMin !== '0') params['vote_average.gte'] = s.ratingMin
    if (s.yearMin) params[s.mediaType === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte'] = `${s.yearMin}-01-01`
    if (s.yearMax) params[s.mediaType === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte'] = `${s.yearMax}-12-31`
    return params
  }, [])

  const callApi = useCallback((s, p) => {
    if (s.preset === 'trending') return tmdb.trending(s.mediaType, 'week', p)
    const f = buildApiFilters(s)
    return s.mediaType === 'tv' ? tmdb.discoverTV(f, p) : tmdb.discoverMovies(f, p)
  }, [buildApiFilters])

  // First page on filter change (skip for collections)
  useEffect(() => {
    if (state.preset === 'collections') return
    const key = searchParams.toString()
    activeKey.current = key
    setLoading(true)
    setResults([])
    setPage(1)
    callApi(state, 1)
      .then(d => {
        if (activeKey.current !== key) return
        setResults(d.results || [])
        setTotalPages(Math.min(d.total_pages || 1, 500))
      })
      .catch(() => {})
      .finally(() => { if (activeKey.current === key) setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Infinite scroll
  const fetchMore = useCallback(async () => {
    if (loadingMore || loading) return
    const nextPage = page + 1
    if (nextPage > totalPages) return
    const key = searchParams.toString()
    setLoadingMore(true)
    try {
      const d = await callApi(state, nextPage)
      if (activeKey.current !== key) return
      setResults(prev => [...prev, ...(d.results || [])])
      setPage(nextPage)
    } catch {}
    finally { setLoadingMore(false) }
  }, [page, totalPages, loading, loadingMore, searchParams, state, callApi])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchMore])

  // ── Param setters ──────────────────────────────────────────────────────────
  const setParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (!value) next.delete(key)
      else next.set(key, value)
      return next
    }, { replace: true })
  }

  const setPreset = (preset) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('preset', preset)
      next.delete('genre')
      next.delete('yearMin')
      next.delete('yearMax')
      next.delete('ratingMin')
      next.delete('sort')
      return next
    }, { replace: true })
  }

  const handleMediaType = (mt) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('type', mt)
      next.delete('genre')
      return next
    }, { replace: true })
  }

  const isCollections = state.preset === 'collections'
  const isTrending = state.preset === 'trending'
  const isCustom = state.preset === 'custom'
  const showFilters = !isTrending && !isCollections
  const genres = state.mediaType === 'tv' ? tvGenres : movieGenres
  const sortOptions = state.mediaType === 'tv' ? SORT_OPTIONS_TV : SORT_OPTIONS

  return (
    <PageTransition>
      <SEO
        title="Discover"
        description="Browse and filter movies and TV shows by genre, year, rating, and more. Explore franchise collections."
        url="/discover"
      />
      <div className={styles.page}>

        {/* ── Filter bar ── */}
        <div className={styles.filterBar}>
          <div className={styles.filterBarInner}>

            {/* Preset chips */}
            <div className={styles.presets}>
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  className={`${styles.preset} ${state.preset === p.key ? styles.presetActive : ''}`}
                  onClick={() => setPreset(p.key)}
                >
                  {p.key === 'collections' && <Layers size={11} style={{ marginRight: 4 }} />}
                  {p.label}
                </button>
              ))}
            </div>

            {/* Media type toggle — hidden for collections */}
            {!isCollections && (
              <>
                <div className={styles.filterDivider} />
                <div className={styles.toggle}>
                  <button
                    className={`${styles.toggleBtn} ${state.mediaType === 'movie' ? styles.toggleActive : ''}`}
                    onClick={() => handleMediaType('movie')}
                  >
                    <Film size={12} /> Films
                  </button>
                  <button
                    className={`${styles.toggleBtn} ${state.mediaType === 'tv' ? styles.toggleActive : ''}`}
                    onClick={() => handleMediaType('tv')}
                  >
                    <Tv size={12} /> Series
                  </button>
                </div>
              </>
            )}

            {/* Contextual filters */}
            {showFilters && (
              <>
                <div className={styles.filterDivider} />
                <select
                  className={styles.select}
                  value={state.genreId}
                  onChange={e => setParam('genre', e.target.value)}
                >
                  <option value="">All Genres</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>

                {isCustom && (
                  <select
                    className={styles.select}
                    value={state.sort}
                    onChange={e => setParam('sort', e.target.value)}
                  >
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}

                <div className={styles.filterDivider} />

                <div className={styles.yearRange}>
                  <input
                    type="number"
                    className={styles.yearInput}
                    placeholder="From"
                    min="1900"
                    max={CURRENT_YEAR}
                    value={state.yearMin}
                    onChange={e => setParam('yearMin', e.target.value)}
                  />
                  <span className={styles.yearSep}>–</span>
                  <input
                    type="number"
                    className={styles.yearInput}
                    placeholder="To"
                    min="1900"
                    max={CURRENT_YEAR}
                    value={state.yearMax}
                    onChange={e => setParam('yearMax', e.target.value)}
                  />
                </div>

                <div className={styles.filterDivider} />

                <div className={styles.ratingSliderWrap}>
                  <span className={styles.ratingSliderLabel}>
                    ★ {Number(state.ratingMin).toFixed(1)}+
                  </span>
                  <input
                    type="range"
                    className={styles.ratingSlider}
                    min="0"
                    max="9"
                    step="0.5"
                    value={state.ratingMin}
                    onChange={e => setParam('ratingMin', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className={styles.spacer} />

            {/* Custom filter shortcut */}
            {!isCustom && !isCollections && (
              <button
                className={styles.customBtn}
                onClick={() => setParam('preset', 'custom')}
                title="Custom filters"
              >
                <SlidersHorizontal size={13} />
              </button>
            )}

            {/* View toggle — hidden for collections */}
            {!isCollections && (
              <>
                <div className={styles.filterDivider} />
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${state.view === 'grid' ? styles.viewActive : ''}`}
                    onClick={() => setParam('view', 'grid')}
                    title="Grid view"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    className={`${styles.viewBtn} ${state.view === 'list' ? styles.viewActive : ''}`}
                    onClick={() => setParam('view', 'list')}
                    title="List view"
                  >
                    <List size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className={styles.content}>

          {/* Collections grid */}
          {isCollections ? (
            collectionsLoading ? (
              <div className={styles.collectionsGrid}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={styles.collectionSkeleton} />
                ))}
              </div>
            ) : (
              <div className={styles.collectionsGrid}>
                {collectionsData.map((col, i) => (
                  <CollectionCard key={col.id} collection={col} index={i} />
                ))}
              </div>
            )
          ) : loading ? (
            state.view === 'list' ? <ListSkeleton /> : <GridSkeleton />
          ) : results.length === 0 ? (
            <div className={styles.empty}>
              <Film size={36} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No titles match your criteria</p>
              <p className={styles.emptyHint}>Try adjusting your filters</p>
            </div>
          ) : state.view === 'list' ? (
            <ol className={styles.list}>
              {results.map((item, i) => (
                <DiscoverRow
                  key={`${item.id}-${i}`}
                  item={item}
                  rank={i + 1}
                  mediaType={item.media_type || state.mediaType}
                  index={i}
                />
              ))}
            </ol>
          ) : (
            <div className={styles.grid}>
              {results.map((item, i) => (
                <DiscoverCard
                  key={`${item.id}-${i}`}
                  item={item}
                  index={i}
                  mediaType={item.media_type || state.mediaType}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {!isCollections && !loading && results.length > 0 && page < totalPages && (
            <div ref={sentinelRef} className={styles.sentinel}>
              {loadingMore && <div className={styles.loadingMore}><div className={styles.spinner} /></div>}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

// ── Collection card ──────────────────────────────────────────────────────────
function CollectionCard({ collection, index }) {
  const parts = collection.parts?.length || 0
  const backdrop = collection.backdrop_path
    ? tmdb.backdrop(collection.backdrop_path)
    : collection.poster_path
    ? tmdb.image(collection.poster_path, 'w780')
    : null

  return (
    <Link
      to={`/collection/${collection.id}`}
      className={styles.collectionCard}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {backdrop && (
        <div
          className={styles.collectionBackdrop}
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      <div className={styles.collectionOverlay} />
      <div className={styles.collectionInfo}>
        <h3 className={styles.collectionName}>{collection.name}</h3>
        <span className={styles.collectionCount}>{parts} {parts === 1 ? 'film' : 'films'}</span>
      </div>
    </Link>
  )
}

// ── Grid card ────────────────────────────────────────────────────────────────
function DiscoverCard({ item, index, mediaType }) {
  const rating = item.vote_average
  const ratingColor = getRatingColor(rating)
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)

  return (
    <Link
      to={`/title/${mediaType}/${item.id}`}
      className={styles.card}
      style={{ animationDelay: `${(index % 20) * 40}ms` }}
    >
      <div className={styles.cardPoster}>
        <PosterMorph layoutId={`poster-${mediaType}-${item.id}`}>
          <SmartImage path={item.poster_path} alt={item.title || item.name} priority={index < 4} />
        </PosterMorph>
        <div className={styles.cardOverlay}>
          <span className={styles.cardRating} style={{ color: ratingColor }}>
            {rating?.toFixed(1)}
          </span>
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title || item.name}</h3>
        <span className={styles.cardYear}>{year}</span>
      </div>
    </Link>
  )
}

// ── List row ─────────────────────────────────────────────────────────────────
function DiscoverRow({ item, rank, mediaType, index }) {
  const rating = item.vote_average
  const ratingColor = getRatingColor(rating)
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)

  return (
    <li className={styles.row} style={{ animationDelay: `${(index % 20) * 25}ms` }}>
      <span className={styles.rank}>{String(rank).padStart(2, '0')}</span>
      <Link to={`/title/${mediaType}/${item.id}`} className={styles.rowLink}>
        <PosterMorph layoutId={`poster-${mediaType}-${item.id}`}>
          <SmartImage path={item.poster_path} alt="" className={styles.thumb} />
        </PosterMorph>
        <div className={styles.rowInfo}>
          <span className={styles.rowTitle}>{item.title || item.name}</span>
          <div className={styles.rowMeta}>
            <span className={styles.badge}>{mediaType === 'movie' ? 'Film' : 'Series'}</span>
            {year && <span>{year}</span>}
            {item.vote_count > 0 && <span>{item.vote_count.toLocaleString()} votes</span>}
          </div>
        </div>
      </Link>
      <div className={styles.rowRating}>
        <span className={styles.rowRatingNum} style={{ color: ratingColor }}>
          {formatRating(rating)}
        </span>
        <div className={styles.rowBar}>
          <div
            className={styles.rowBarFill}
            style={{ width: `${(rating / 10) * 100}%`, background: ratingColor }}
          />
        </div>
      </div>
    </li>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 20 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className={styles.listSkeleton}>
      {Array.from({ length: 12 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)}
    </div>
  )
}
