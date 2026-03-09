import { useState } from 'react'
import { getRatingColor, formatRating } from '../../services/tmdb'
import styles from './EpisodeHeatmap.module.css'

export default function EpisodeHeatmap({ episodes }) {
  const [hovered, setHovered] = useState(null)

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
              className={`${styles.cell} ${hovered?.id === ep.id ? styles.cellHovered : ''}`}
              onMouseEnter={() => setHovered(ep)}
              onMouseLeave={() => setHovered(null)}
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

      {hovered && (
        <div className={styles.tooltip}>
          <span className={styles.tooltipEp}>Episode {hovered.episode_number}</span>
          <span className={styles.tooltipName}>{hovered.name}</span>
          <div className={styles.tooltipRating}>
            <span style={{ color: getRatingColor(hovered.vote_average), fontFamily: 'var(--font-display)', fontSize: 24 }}>
              {formatRating(hovered.vote_average)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              / 10 · {hovered.vote_count?.toLocaleString()} votes
            </span>
          </div>
          {hovered.overview && (
            <p className={styles.tooltipOverview}>
              {hovered.overview.slice(0, 140)}{hovered.overview.length > 140 ? '…' : ''}
            </p>
          )}
          {hovered.air_date && (
            <span className={styles.tooltipDate}>{hovered.air_date}</span>
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
