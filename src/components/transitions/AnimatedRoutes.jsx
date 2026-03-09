import { useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from '../../pages/Home'
import TitleDetail from '../../pages/TitleDetail'
import Charts from '../../pages/Charts'
import Compare from '../../pages/Compare'
import InkBleed from './InkBleed'

export default function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
      <InkBleed />
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/title/:type/:id" element={<TitleDetail />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
