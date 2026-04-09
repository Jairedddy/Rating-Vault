import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'RatingVault'
const DEFAULT_DESC = 'Explore movie and TV show ratings, episode charts, cast constellations, and world cinema on RatingVault.'
const DEFAULT_IMAGE = '/og-default.png'
const SITE_URL = 'https://ratingvault.app'

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}

// JSON-LD builders
export function movieJsonLd({ id, title, description, posterPath, year, rating, genres }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    description,
    image: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : undefined,
    datePublished: year,
    aggregateRating: rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      bestRating: '10',
      worstRating: '0',
    } : undefined,
    genre: genres,
    url: `${SITE_URL}/title/movie/${id}`,
  }
}

export function tvJsonLd({ id, title, description, posterPath, year, rating, genres, seasons }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    description,
    image: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : undefined,
    startDate: year,
    numberOfSeasons: seasons,
    aggregateRating: rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      bestRating: '10',
      worstRating: '0',
    } : undefined,
    genre: genres,
    url: `${SITE_URL}/title/tv/${id}`,
  }
}
