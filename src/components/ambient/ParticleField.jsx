import { useEffect, useRef } from 'react'
import styles from './ParticleField.module.css'

const PARTICLE_COUNT = 60
const REPULSE_RADIUS = 120
const SCATTER_RADIUS = 160
const FPS_CAP = 30
const FRAME_TIME = 1000 / FPS_CAP

const COLOR = { r: 200, g: 169, b: 110 }

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    baseX: 0, // set after position
    baseY: 0,
    vx: 0,
    vy: 0,
    radius: 0.5 + Math.random() * 1.5,
    opacity: 0.04 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    driftSpeed: 0.2 + Math.random() * 0.4,
    wobbleAmp: 20 + Math.random() * 40,
    wobbleFreq: 0.0005 + Math.random() * 0.001,
  }
}

export default function ParticleField() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const clickRef = useRef(null)
  const rafRef = useRef(null)
  const lastFrameRef = useRef(0)

  // Check reduced motion
  const reducedMotion = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.current = mq.matches
    const handler = (e) => { reducedMotion.current = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    // Init particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const p = createParticle(canvas.width, canvas.height)
      p.baseX = p.x
      p.baseY = p.y
      return p
    })

    const handleResize = () => {
      const oldW = canvas.width
      const oldH = canvas.height
      resize()
      // Rescale particle positions
      particlesRef.current.forEach(p => {
        p.x = (p.x / oldW) * canvas.width
        p.y = (p.y / oldH) * canvas.height
        p.baseX = (p.baseX / oldW) * canvas.width
        p.baseY = (p.baseY / oldH) * canvas.height
      })
    }

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleClick = (e) => {
      clickRef.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    const animate = (now) => {
      rafRef.current = requestAnimationFrame(animate)

      if (reducedMotion.current) return

      // FPS cap
      const delta = now - lastFrameRef.current
      if (delta < FRAME_TIME) return
      lastFrameRef.current = now - (delta % FRAME_TIME)

      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)

      const color = COLOR
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Click scatter decay
      let clickForce = null
      if (clickRef.current) {
        const age = now - clickRef.current.time
        if (age < 800) {
          clickForce = {
            x: clickRef.current.x,
            y: clickRef.current.y,
            strength: 1 - age / 800,
          }
        } else {
          clickRef.current = null
        }
      }

      particlesRef.current.forEach(p => {
        // Sine-wave drift
        const sineX = Math.sin(now * p.wobbleFreq + p.phase) * p.wobbleAmp
        const sineY = Math.cos(now * p.wobbleFreq * 0.7 + p.phase) * p.wobbleAmp * 0.5

        // Target position (drifting down slowly)
        p.baseY += p.driftSpeed * (delta / 16)
        if (p.baseY > h + 20) {
          p.baseY = -20
          p.baseX = Math.random() * w
        }

        let targetX = p.baseX + sineX
        let targetY = p.baseY + sineY

        // Mouse repulsion
        const dx = targetX - mx
        const dy = targetY - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPULSE_RADIUS && dist > 0) {
          const force = (1 - dist / REPULSE_RADIUS) * 30
          targetX += (dx / dist) * force
          targetY += (dy / dist) * force
        }

        // Click scatter
        if (clickForce) {
          const cdx = p.x - clickForce.x
          const cdy = p.y - clickForce.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cdist < SCATTER_RADIUS && cdist > 0) {
            const sFrc = clickForce.strength * (1 - cdist / SCATTER_RADIUS) * 80
            p.vx += (cdx / cdist) * sFrc
            p.vy += (cdy / cdist) * sFrc
          }
        }

        // Velocity damping + approach target
        p.vx += (targetX - p.x) * 0.02
        p.vy += (targetY - p.y) * 0.02
        p.vx *= 0.92
        p.vy *= 0.92

        p.x += p.vx
        p.y += p.vy

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.opacity})`
        ctx.fill()
      })
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
