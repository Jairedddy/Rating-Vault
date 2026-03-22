import { useEffect, useRef, useState, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import { tmdb } from '../../services/tmdb'
import styles from './CastCarousel.module.css'

export default function CastCarousel({ cast }) {
  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const [centeredIndex, setCenteredIndex] = useState(0)
  const hasScrolled = useRef(false)
  const reduced = useReducedMotion()

  const members = cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 15)

  // Only start observing after user scrolls the track
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const onScroll = () => {
      if (hasScrolled.current) return
      hasScrolled.current = true

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCenteredIndex(Number(entry.target.dataset.index))
            }
          })
        },
        {
          root: track,
          rootMargin: '0px -40% 0px -40%',
          threshold: 0.5,
        }
      )

      cardRefs.current.forEach((card) => {
        if (card) observer.observe(card)
      })

      // Store for cleanup
      track._observer = observer
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      if (track._observer) track._observer.disconnect()
    }
  }, [members.length])

  const scrollToCard = useCallback((index) => {
    setCenteredIndex(index)
    hasScrolled.current = true

    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!track || !card) return

    const trackRect = track.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const scrollLeft = track.scrollLeft + (cardRect.left - trackRect.left) - (trackRect.width / 2) + (cardRect.width / 2)

    track.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }, [])

  const getCardStyle = useCallback((index) => {
    if (reduced) return {}
    const distance = Math.abs(index - centeredIndex)
    if (distance === 0) return { transform: 'scale(1.08)', filter: 'none', opacity: 1 }
    if (distance === 1) return { transform: 'scale(0.97)', filter: 'blur(0.5px)', opacity: 0.85 }
    return { transform: 'scale(0.93)', filter: 'blur(1px)', opacity: 0.7 }
  }, [centeredIndex, reduced])

  if (!members.length) return null

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Cast</h3>
      <div className={styles.track} ref={trackRef}>
        {members.map((member, i) => (
          <div
            key={member.id}
            className={styles.card}
            data-index={i}
            ref={(el) => { cardRefs.current[i] = el }}
            style={getCardStyle(i)}
            onClick={() => scrollToCard(i)}
          >
            <div className={styles.photoWrap}>
              {member.profile_path ? (
                <img
                  src={tmdb.profilePhoto(member.profile_path)}
                  alt={member.name}
                  className={styles.photo}
                  loading="lazy"
                />
              ) : (
                <div className={styles.fallback}>
                  <div className={styles.fallbackIcon} />
                </div>
              )}
            </div>
            <p className={styles.name}>{member.name}</p>
            <p className={styles.character}>{member.character}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
