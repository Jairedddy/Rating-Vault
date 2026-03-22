import { useEffect, useRef, useState } from 'react'
import styles from './SpotlightCursor.module.css'

export default function SpotlightCursor() {
  const ref = useRef(null)
  const [flash, setFlash] = useState(false)
  const mouse = useRef({ x: -200, y: -200 })
  const pos = useRef({ x: -200, y: -200 })
  const raf = useRef(null)

  useEffect(() => {
    // Hide on touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const onClick = () => {
      setFlash(true)
      setTimeout(() => setFlash(false), 150)
    }

    const lerp = (a, b, t) => a + (b - a) * t

    const animate = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.15)
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.15)
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.current.x - 100}px, ${pos.current.y - 100}px)`
      }
      raf.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.spotlight} ${flash ? styles.flash : ''}`}
    />
  )
}
