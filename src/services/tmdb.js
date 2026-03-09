// TMDB API Service
// Get your free API key at: https://www.themoviedb.org/settings/api
// Set VITE_TMDB_API_KEY in your .env file

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const get = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export const tmdb = {
  // Images
  image: (path, size = 'w500') => path ? `${IMAGE_BASE}/${size}${path}` : null,
  backdrop: (path) => path ? `${IMAGE_BASE}/w1280${path}` : null,
  poster: (path, size = 'w342') => path ? `${IMAGE_BASE}/${size}${path}` : null,

  // Search
  search: (query, page = 1) =>
    get('/search/multi', { query, page, include_adult: false }),

  searchMovies: (query) =>
    get('/search/movie', { query, include_adult: false }),

  searchTV: (query) =>
    get('/search/tv', { query, include_adult: false }),

  // Movies
  movie: (id) => get(`/movie/${id}`, { append_to_response: 'credits,videos' }),

  movieRatings: async (id) => {
    // Movies don't have episode ratings — return aggregate + reviews
    const [details, releases] = await Promise.all([
      get(`/movie/${id}`),
      get(`/movie/${id}/release_dates`),
    ])
    return { details, releases }
  },

  // TV Shows
  tv: (id) => get(`/tv/${id}`, { append_to_response: 'credits,videos' }),

  tvSeason: (id, seasonNumber) =>
    get(`/tv/${id}/season/${seasonNumber}`),

  tvSeasonRatings: async (showId, totalSeasons) => {
    const seasons = await Promise.all(
      Array.from({ length: totalSeasons }, (_, i) =>
        get(`/tv/${showId}/season/${i + 1}`)
      )
    )
    return seasons
  },

  // Charts / Trending / Top
  trending: (mediaType = 'all', timeWindow = 'week') =>
    get(`/trending/${mediaType}/${timeWindow}`),

  topRatedMovies: (page = 1) =>
    get('/movie/top_rated', { page }),

  topRatedTV: (page = 1) =>
    get('/tv/top_rated', { page }),

  popularMovies: (page = 1) =>
    get('/movie/popular', { page }),

  popularTV: (page = 1) =>
    get('/tv/popular', { page }),

  nowPlaying: () => get('/movie/now_playing'),
  onAir: () => get('/tv/on_the_air'),
}

// Helpers
export const getRatingColor = (rating) => {
  if (rating >= 8.5) return 'var(--rating-great)'
  if (rating >= 7.5) return 'var(--rating-good)'
  if (rating >= 6.5) return 'var(--rating-mid)'
  if (rating >= 5.0) return 'var(--rating-poor)'
  return 'var(--rating-bad)'
}

export const getRatingLabel = (rating) => {
  if (rating >= 8.5) return 'Exceptional'
  if (rating >= 7.5) return 'Great'
  if (rating >= 6.5) return 'Good'
  if (rating >= 5.0) return 'Mixed'
  return 'Poor'
}

export const formatRating = (r) =>
  r ? Number(r).toFixed(1) : '—'
