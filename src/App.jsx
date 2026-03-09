import { LayoutGroup } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import AnimatedRoutes from './components/transitions/AnimatedRoutes'
import styles from './App.module.css'

export default function App() {
  return (
    <LayoutGroup>
      <div className={styles.app}>
        <Navbar />
        <main className={styles.main}>
          <AnimatedRoutes />
        </main>
      </div>
    </LayoutGroup>
  )
}
