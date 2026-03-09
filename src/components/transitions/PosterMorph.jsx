import { motion } from 'framer-motion'

export default function PosterMorph({ layoutId, children, className, style }) {
  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      style={style}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}
