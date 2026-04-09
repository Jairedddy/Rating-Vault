import { useState, useEffect, useRef } from 'react'
import { Film } from 'lucide-react'
import { tmdb, posterSrcSet, backdropSrcSet, profileSrcSet } from '../../services/tmdb'
import styles from './SmartImage.module.css'

const ASPECT = { poster: '2 / 3', backdrop: '16 / 9', profile: '2 / 3' }

const getSrcSet = (path, type) => {
  if (type === 'backdrop') return backdropSrcSet(path)
  if (type === 'profile') return profileSrcSet(path)
  return posterSrcSet(path)
}

const getSizes = (type) => {
  if (type === 'backdrop') return '(max-width: 768px) 100vw, 1280px'
  if (type === 'profile') return '185px'
  return '(max-width: 600px) 154px, (max-width: 900px) 342px, 500px'
}

const getLqip = (path, type) => {
  if (!path) return null
  if (type === 'backdrop') return tmdb.image(path, 'w300')
  return tmdb.image(path, 'w92')
}

export default function SmartImage({
  path,
  alt = '',
  type = 'poster',
  priority = false,
  className,
  imgClassName,
  style,
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const imgRef = useRef(null)

  const src = type === 'backdrop'
    ? tmdb.image(path, 'w780')
    : type === 'profile'
    ? tmdb.image(path, 'w185')
    : tmdb.image(path, 'w342')

  const srcSet = path ? getSrcSet(path, type) : undefined
  const sizes = getSizes(type)
  const lqip = getLqip(path, type)
  const aspect = ASPECT[type] || 'auto'

  // Preload for priority (LCP) images
  useEffect(() => {
    if (!priority || !path) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    if (srcSet) link.imageSrcset = srcSet
    if (sizes) link.imageSizes = sizes
    document.head.appendChild(link)
    return () => { if (document.head.contains(link)) document.head.removeChild(link) }
  }, [priority, path, src, srcSet, sizes])

  // Handle already-cached images (complete before React paint)
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  if (!path || errored) {
    return (
      <div
        className={`${styles.wrap} ${className || ''}`}
        style={{ '--si-aspect': aspect, ...style }}
      >
        <div className={styles.fallback}>
          <Film size={24} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.wrap} ${className || ''}`}
      style={{ '--si-aspect': aspect, ...style }}
    >
      {/* LQIP blurred background */}
      {lqip && !loaded && (
        <div
          className={styles.lqip}
          style={{ backgroundImage: `url(${lqip})` }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`${styles.img} ${loaded ? styles.imgIn : ''} ${imgClassName || ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  )
}
