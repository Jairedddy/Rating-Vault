import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import styles from './InkBleed.module.css'

export default function InkBleed() {
  const reduced = useReducedMotion()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname
      if (!reduced) {
        setShow(true)
        const timer = setTimeout(() => setShow(false), 500)
        return () => clearTimeout(timer)
      }
    }
  }, [location.pathname, reduced])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.inkBleed}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  )
}
