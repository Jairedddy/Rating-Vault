import { LayoutGroup } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import AnimatedRoutes from './components/transitions/AnimatedRoutes'
import ParticleField from './components/ambient/ParticleField'
import SpotlightCursor from './components/ui/SpotlightCursor'
import ScrollFilmStrip from './components/ui/ScrollFilmStrip'
import styles from './App.module.css'

export default function App() {
  return (
    <LayoutGroup>
      <div className={styles.app}>
        <ScrollFilmStrip visible />
        <SpotlightCursor />
        <ParticleField />
        <Navbar />
        <main className={styles.main}>
          <AnimatedRoutes />
        </main>
      </div>
    </LayoutGroup>
  )
}
