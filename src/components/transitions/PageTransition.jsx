import { motion, useReducedMotion } from 'framer-motion'

export default function PageTransition({ children }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced
        ? { duration: 0 }
        : { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
      }
    >
      {children}
    </motion.div>
  )
}
