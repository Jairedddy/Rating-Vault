import { useRef, useEffect, useState, useCallback } from 'react'
import Globe from 'globe.gl'
import { Search, X, Film, Star, Globe2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { tmdb } from '../services/tmdb'
import styles from './WorldMap.module.css'

// Cinema output levels (0–1) by ISO 3166-1 alpha-2 code
const CINEMA_NATIONS = {
  US: { name: 'United States', output: 1.00, lat: 37.09, lng: -95.71 },
  IN: { name: 'India',         output: 0.95, lat: 20.59, lng:  78.96 },
  GB: { name: 'United Kingdom',output: 0.85, lat: 55.38, lng:  -3.44 },
  KR: { name: 'South Korea',   output: 0.80, lat: 35.90, lng: 127.77 },
  JP: { name: 'Japan',         output: 0.75, lat: 36.20, lng: 138.25 },
  FR: { name: 'France',        output: 0.70, lat: 46.23, lng:   2.21 },
  CN: { name: 'China',         output: 0.65, lat: 35.86, lng: 104.19 },
  IT: { name: 'Italy',         output: 0.60, lat: 41.87, lng:  12.56 },
  DE: { name: 'Germany',       output: 0.55, lat: 51.17, lng:  10.45 },
  ES: { name: 'Spain',         output: 0.50, lat: 40.46, lng:  -3.75 },
  CA: { name: 'Canada',        output: 0.50, lat: 56.13, lng:-106.35 },
  AU: { name: 'Australia',     output: 0.45, lat:-25.27, lng: 133.77 },
  MX: { name: 'Mexico',        output: 0.45, lat: 23.63, lng:-102.55 },
  BR: { name: 'Brazil',        output: 0.40, lat:-14.24, lng: -51.93 },
  SE: { name: 'Sweden',        output: 0.38, lat: 60.13, lng:  18.64 },
  DK: { name: 'Denmark',       output: 0.35, lat: 56.26, lng:   9.50 },
  BE: { name: 'Belgium',       output: 0.32, lat: 50.50, lng:   4.47 },
  NL: { name: 'Netherlands',   output: 0.30, lat: 52.13, lng:   5.29 },
  PL: { name: 'Poland',        output: 0.30, lat: 51.92, lng:  19.15 },
  RU: { name: 'Russia',        output: 0.30, lat: 61.52, lng: 105.32 },
  AR: { name: 'Argentina',     output: 0.28, lat:-38.42, lng: -63.62 },
  IR: { name: 'Iran',          output: 0.28, lat: 32.43, lng:  53.69 },
  TR: { name: 'Turkey',        output: 0.25, lat: 38.96, lng:  35.24 },
  TH: { name: 'Thailand',      output: 0.25, lat: 15.87, lng: 100.99 },
  NG: { name: 'Nigeria',       output: 0.25, lat:  9.08, lng:   8.68 },
  EG: { name: 'Egypt',         output: 0.20, lat: 26.82, lng:  30.80 },
  ZA: { name: 'South Africa',  output: 0.20, lat:-30.56, lng:  22.94 },
  TW: { name: 'Taiwan',        output: 0.18, lat: 23.69, lng: 120.96 },
  PT: { name: 'Portugal',      output: 0.18, lat: 39.40, lng:  -8.22 },
  GR: { name: 'Greece',        output: 0.15, lat: 39.07, lng:  21.82 },
  NO: { name: 'Norway',        output: 0.15, lat: 60.47, lng:   8.47 },
  FI: { name: 'Finland',       output: 0.15, lat: 61.92, lng:  25.75 },
  CZ: { name: 'Czech Republic',output: 0.15, lat: 49.82, lng:  15.47 },
  HU: { name: 'Hungary',       output: 0.12, lat: 47.16, lng:  19.50 },
  RO: { name: 'Romania',       output: 0.12, lat: 45.94, lng:  24.97 },
  ID: { name: 'Indonesia',     output: 0.12, lat: -0.79, lng: 113.92 },
  PH: { name: 'Philippines',   output: 0.12, lat: 12.88, lng: 121.77 },
  IL: { name: 'Israel',        output: 0.12, lat: 31.05, lng:  34.85 },
  MA: { name: 'Morocco',       output: 0.10, lat: 31.79, lng:  -7.09 },
}

const CO_PROD_ARCS = [
  { startLat: 37.09, startLng: -95.71, endLat:  55.38, endLng:  -3.44 },
  { startLat: 37.09, startLng: -95.71, endLat:  56.13, endLng:-106.35 },
  { startLat: 37.09, startLng: -95.71, endLat:  20.59, endLng:  78.96 },
  { startLat: 37.09, startLng: -95.71, endLat:  35.86, endLng: 104.19 },
  { startLat: 37.09, startLng: -95.71, endLat:  36.20, endLng: 138.25 },
  { startLat: 37.09, startLng: -95.71, endLat:  35.90, endLng: 127.77 },
  { startLat: 37.09, startLng: -95.71, endLat: -25.27, endLng: 133.77 },
  { startLat: 37.09, startLng: -95.71, endLat: -14.24, endLng: -51.93 },
  { startLat: 46.23, startLng:   2.21, endLat:  55.38, endLng:  -3.44 },
  { startLat: 46.23, startLng:   2.21, endLat:  50.50, endLng:   4.47 },
  { startLat: 46.23, startLng:   2.21, endLat:  41.87, endLng:  12.56 },
  { startLat: 51.17, startLng:  10.45, endLat:  55.38, endLng:  -3.44 },
  { startLat: 55.38, startLng:  -3.44, endLat:  20.59, endLng:  78.96 },
  { startLat: 55.38, startLng:  -3.44, endLat: -25.27, endLng: 133.77 },
  { startLat: 35.86, startLng: 104.19, endLat:  36.20, endLng: 138.25 },
  { startLat: 35.86, startLng: 104.19, endLat:  35.90, endLng: 127.77 },
]

function getCapColor(feature) {
  const iso = feature.properties?.ISO_A2
  const nation = CINEMA_NATIONS[iso]
  if (!nation) return 'rgba(20, 17, 14, 0.88)'
  const { output } = nation
  if (output >= 0.80) return 'rgba(200, 169, 110, 0.90)'
  if (output >= 0.60) return 'rgba(183, 138, 72, 0.78)'
  if (output >= 0.40) return 'rgba(158, 110, 50, 0.68)'
  if (output >= 0.20) return 'rgba(128,  85, 35, 0.58)'
  return                      'rgba( 95,  60, 22, 0.48)'
}

function getAltitude(feature) {
  const iso = feature.properties?.ISO_A2
  const nation = CINEMA_NATIONS[iso]
  if (!nation) return 0.003
  const { output } = nation
  if (output >= 0.80) return 0.026
  if (output >= 0.60) return 0.020
  if (output >= 0.40) return 0.014
  if (output >= 0.20) return 0.009
  return 0.006
}

function makeLabel(feature) {
  const name   = feature.properties?.ADMIN || feature.properties?.NAME || 'Unknown'
  const iso    = feature.properties?.ISO_A2
  const nation = CINEMA_NATIONS[iso]
  return `
    <div style="background:rgba(10,9,7,0.92);border:1px solid rgba(200,169,110,0.35);
                padding:6px 10px;border-radius:6px;font-family:system-ui,sans-serif;
                font-size:12px;color:#c8a96e;pointer-events:none;">
      <b>${name}</b>
      ${nation
        ? `<br/><span style="color:#8a7050;font-size:11px;">Cinema output: ${Math.round(nation.output * 100)}%</span>`
        : '<br/><span style="color:#4a4030;font-size:11px;">Limited data</span>'}
    </div>`
}

export default function WorldMap() {
  const containerRef    = useRef()
  const globeRef        = useRef()
  const clickHandlerRef = useRef()   // always-current click handler (avoids stale closure)

  const [geoData,      setGeoData]      = useState(null)
  const [geoError,     setGeoError]     = useState(false)
  const [webglOk,      setWebglOk]      = useState(true)
  const [selected,     setSelected]     = useState(null)
  const [panelTitles,  setPanelTitles]  = useState([])
  const [panelLoading, setPanelLoading] = useState(false)
  const [search,       setSearch]       = useState('')
  const [suggestions,  setSuggestions]  = useState([])

  // ── WebGL check ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setWebglOk(false)
    } catch { setWebglOk(false) }
  }, [])

  // ── Fetch GeoJSON ────────────────────────────────────────────────
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(r => r.json())
      .then(d => setGeoData(d.features))
      .catch(() => setGeoError(true))
  }, [])

  // ── Country panel logic ──────────────────────────────────────────
  const openCountry = useCallback(async (iso, nation) => {
    setSelected({ iso, ...nation })
    setPanelLoading(true)
    setPanelTitles([])

    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false
      globeRef.current.pointOfView({ lat: nation.lat, lng: nation.lng, altitude: 1.8 }, 1200)
    }

    try {
      const data = await tmdb.discoverByRegion(iso)
      setPanelTitles((data.results || []).slice(0, 10))
    } catch {
      setPanelTitles([])
    } finally {
      setPanelLoading(false)
    }
  }, [])

  const handlePolygonClick = useCallback(polygon => {
    const iso    = polygon.properties?.ISO_A2
    const nation = CINEMA_NATIONS[iso]
    if (!nation) return
    openCountry(iso, nation)
  }, [openCountry])

  // Always keep the ref in sync so the globe's static listener calls the latest handler
  clickHandlerRef.current = handlePolygonClick

  const closePanel = useCallback(() => {
    setSelected(null)
    setPanelTitles([])
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)
    }
  }, [])

  // ── Imperative Globe init (run once on mount) ────────────────────
  useEffect(() => {
    if (!containerRef.current || globeRef.current) return

    const g = Globe()(containerRef.current)
    globeRef.current = g

    g
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .atmosphereColor('rgba(195, 135, 55, 0.55)')
      .atmosphereAltitude(0.14)
      .width(window.innerWidth)
      .height(window.innerHeight - 64)
      // Arcs (co-production corridors)
      .arcsData(CO_PROD_ARCS)
      .arcStartLat(d => d.startLat)
      .arcStartLng(d => d.startLng)
      .arcEndLat(d => d.endLat)
      .arcEndLng(d => d.endLng)
      .arcColor(() => ['rgba(200,169,110,0.0)', 'rgba(200,169,110,0.85)', 'rgba(200,169,110,0.0)'])
      .arcDashLength(0.08)
      .arcDashGap(0.92)
      .arcDashAnimateTime(2800)
      .arcStroke(1.4)
      .arcAltitude(0.28)
      .arcsTransitionDuration(0)
      // Polygon style (data applied separately when geoData loads)
      .polygonSideColor(  () => 'rgba(200, 169, 110, 0.04)')
      .polygonStrokeColor(() => 'rgba(200, 169, 110, 0.25)')
      .polygonsTransitionDuration(350)
      // Delegate to the always-current ref so closure is never stale
      .onPolygonClick(polygon => clickHandlerRef.current(polygon))

    const ctrl = g.controls()
    ctrl.autoRotate      = true
    ctrl.autoRotateSpeed = 0.35
    ctrl.enableZoom      = true
    ctrl.minDistance     = 150
    ctrl.maxDistance     = 600

    g.pointOfView({ lat: 20, lng: 0, altitude: 2.5 })

    const onResize = () => g.width(window.innerWidth).height(window.innerHeight - 64)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      // Dispose WebGL context and clear the mount div so Strict Mode re-mount starts clean
      try { g.renderer()?.dispose() } catch {}
      if (containerRef.current) containerRef.current.innerHTML = ''
      globeRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply polygon data once GeoJSON arrives ──────────────────────
  useEffect(() => {
    if (!globeRef.current || !geoData) return
    globeRef.current
      .polygonsData(geoData)
      .polygonAltitude(getAltitude)
      .polygonCapColor(getCapColor)
      .polygonLabel(makeLabel)
  }, [geoData])

  // ── Search suggestions ───────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setSuggestions([]); return }
    const q = search.toLowerCase()
    setSuggestions(
      Object.entries(CINEMA_NATIONS)
        .filter(([iso, n]) => n.name.toLowerCase().includes(q) || iso.toLowerCase().includes(q))
        .slice(0, 6)
    )
  }, [search])

  const jumpTo = useCallback(([iso, nation]) => {
    setSearch('')
    setSuggestions([])
    openCountry(iso, nation)
  }, [openCountry])

  // ── WebGL fallback ───────────────────────────────────────────────
  if (!webglOk) {
    return (
      <div className={styles.noWebgl}>
        <Globe2 size={52} />
        <h2>WebGL Required</h2>
        <p>Your browser doesn&apos;t support WebGL, which is needed to render the 3D globe. Try a modern browser such as Chrome, Firefox, or Edge.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* ── Search bar ───────────────────────────────────────────── */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Jump to a country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setSearch(''); setSuggestions([]) } }}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => { setSearch(''); setSuggestions([]) }}>
              <X size={13} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              className={styles.suggestions}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {suggestions.map(entry => (
                <li key={entry[0]} className={styles.suggestion} onClick={() => jumpTo(entry)}>
                  <span className={styles.suggestIso}>{entry[0]}</span>
                  {entry[1].name}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* ── Globe container ───────────────────────────────────────── */}
      <div className={styles.globeContainer}>
        {/* globe.gl exclusively owns this div — React NEVER renders children here */}
        <div ref={containerRef} className={styles.globeMount} />

        {/* Overlays are siblings, not children of the globe mount */}
        {geoError && (
          <div className={styles.overlay}>
            <Globe2 size={40} />
            <p>Could not load map data. Check your internet connection.</p>
          </div>
        )}
        {!geoData && !geoError && (
          <div className={styles.overlay}>
            <div className={styles.spinner} />
            <span>Loading world map…</span>
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────── */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Cinema Output</span>
        <div className={styles.legendScale}>
          <span className={styles.legendLow}>Low</span>
          <div className={styles.legendGradient} />
          <span className={styles.legendHigh}>High</span>
        </div>
        <div className={styles.legendArc}>
          <span className={styles.legendArcLine} />
          <span className={styles.legendArcText}>Co-production corridors</span>
        </div>
      </div>

      {/* ── Country detail panel ─────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            className={styles.panel}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelHeading}>
                <span className={styles.panelIso}>{selected.iso}</span>
                <h2 className={styles.panelCountry}>{selected.name}</h2>
              </div>
              <button className={styles.panelClose} onClick={closePanel} aria-label="Close panel">
                <X size={17} />
              </button>
            </div>

            <div className={styles.outputRow}>
              <span className={styles.outputLabel}>Cinema output</span>
              <div className={styles.outputTrack}>
                <motion.div
                  className={styles.outputFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.output * 100}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>
              <span className={styles.outputPct}>{Math.round(selected.output * 100)}%</span>
            </div>

            <h3 className={styles.sectionTitle}>Top Rated Films</h3>

            {panelLoading ? (
              <div className={styles.skeletons}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            ) : panelTitles.length === 0 ? (
              <p className={styles.empty}>No titles found for this region.</p>
            ) : (
              <ul className={styles.titleList}>
                {panelTitles.map((t, i) => (
                  <li key={t.id} className={styles.titleItem}>
                    <span className={styles.rank}>{i + 1}</span>
                    {t.poster_path
                      ? <img src={tmdb.poster(t.poster_path, 'w92')} alt="" className={styles.poster} loading="lazy" />
                      : <div className={styles.posterBlank}><Film size={13} /></div>
                    }
                    <div className={styles.titleInfo}>
                      <span className={styles.titleName}>{t.title || t.name}</span>
                      <span className={styles.titleMeta}>
                        {(t.release_date || '').slice(0, 4)}
                        {t.vote_average > 0 && (
                          <span className={styles.rating}>
                            <Star size={9} fill="currentColor" />
                            {t.vote_average.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
