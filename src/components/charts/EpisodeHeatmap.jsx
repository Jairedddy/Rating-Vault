import { useState } from 'react'
import { getRatingColor, formatRating } from '../../services/tmdb'
import styles from './EpisodeHeatmap.module.css'

export default function EpisodeHeatmap({ episodes }) {
  const [selected, setSelected] = useState(null)

  if (!episodes?.length) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {episodes.map((ep) => {
          const color = getRatingColor(ep.vote_average)
          const intensity = (ep.vote_average - 5) / 5 // 0–1
          return (
            <div
              key={ep.id}
              className={`${styles.cell} ${selected?.id === ep.id ? styles.cellActive : ''}`}
              onClick={() => setSelected(prev => prev?.id === ep.id ? null : ep)}
              style={{
                '--cell-color': color,
                '--cell-opacity': Math.max(0.15, intensity),
              }}
            >
              <span className={styles.cellEp}>E{ep.episode_number}</span>
              <span className={styles.cellRating}>{formatRating(ep.vote_average)}</span>
            </div>
          )
        })}
      </div>

      {selected && (
        <div className={styles.tooltip}>
          <span className={styles.tooltipEp}>Episode {selected.episode_number}</span>
          <span className={styles.tooltipName}>{selected.name}</span>
          <div className={styles.tooltipRating}>
            <span style={{ color: getRatingColor(selected.vote_average), fontFamily: 'var(--font-display)', fontSize: 24 }}>
              {formatRating(selected.vote_average)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              / 10 · {selected.vote_count?.toLocaleString()} votes
            </span>
          </div>
          {selected.overview && (
            <p className={styles.tooltipOverview}>
              {selected.overview.slice(0, 140)}{selected.overview.length > 140 ? '…' : ''}
            </p>
          )}
          {selected.air_date && (
            <span className={styles.tooltipDate}>{selected.air_date}</span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Lower</span>
        <div className={styles.legendBar}>
          {[4,5,6,7,8,9,10].map(v => (
            <div key={v} style={{ background: getRatingColor(v), flex: 1, height: '100%' }} />
          ))}
        </div>
        <span className={styles.legendLabel}>Higher</span>
      </div>
    </div>
  )
}
