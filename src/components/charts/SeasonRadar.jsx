import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell
} from 'recharts'
import { getRatingColor } from '../../services/tmdb'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-mid)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 4 }}>{d.season}</div>
      <div style={{ color: getRatingColor(d.avg), fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300 }}>
        {d.avg.toFixed(2)}
      </div>
    </div>
  )
}

export default function SeasonRadar({ data }) {
  if (!data?.length) return null

  const min = Math.max(0, Math.floor(Math.min(...data.map(d => d.avg)) - 1))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey="season"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--border-subtle)' }}
        />
        <YAxis
          domain={[min, 10]}
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          tickLine={false}
          axisLine={false}
          width={28}
          tickCount={5}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getRatingColor(entry.avg)} fillOpacity={0.75} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
