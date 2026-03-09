import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import TitleDetail from './pages/TitleDetail'
import Charts from './pages/Charts'
import Compare from './pages/Compare'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/title/:type/:id" element={<TitleDetail />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
    </div>
  )
}
