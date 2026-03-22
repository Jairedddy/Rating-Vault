import { useEffect, useState } from 'react'
import styles from './ScrollFilmStrip.module.css'

export default function ScrollFilmStrip({ visible = false }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) return

    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [visible])

  return (
    <div
      className={`${styles.bar} ${visible ? styles.visible : ''}`}
      style={{ width: `${progress}%` }}
    />
  )
}
