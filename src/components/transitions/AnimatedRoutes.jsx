import { useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from '../../pages/Home'
import TitleDetail from '../../pages/TitleDetail'
import Compare from '../../pages/Compare'
import Arena from '../../pages/Arena'
import WorldMap from '../../pages/WorldMap'
import Discover from '../../pages/Discover'
import CollectionDetail from '../../pages/CollectionDetail'
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
          <Route path="/compare" element={<Compare />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/world" element={<WorldMap />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/collection/:id" element={<CollectionDetail />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
