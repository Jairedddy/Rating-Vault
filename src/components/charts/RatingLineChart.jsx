import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine, Dot
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
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 4 }}>
        {d.label}
      </div>
      {d.name && (
        <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-body)' }}>
          {d.name}
        </div>
      )}
      <div style={{ color: getRatingColor(d.rating), fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 300 }}>
        {d.rating.toFixed(1)}
      </div>
    </div>
  )
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  const color = getRatingColor(payload.rating)
  return (
    <Dot
      cx={cx} cy={cy}
      r={3}
      fill={color}
      stroke="var(--bg-base)"
      strokeWidth={1.5}
    />
  )
}

export default function RatingLineChart({ data }) {
  if (!data?.length) return null

  const min = Math.max(0, Math.floor(Math.min(...data.map(d => d.rating)) - 0.5))
  const max = Math.min(10, Math.ceil(Math.max(...data.map(d => d.rating)) + 0.5))
  const avg = data.reduce((s, d) => s + d.rating, 0) / data.length

  // Show every Nth label to avoid crowding
  const step = Math.ceil(data.length / 20)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-subtle)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--border-subtle)' }}
          interval={step - 1}
        />
        <YAxis
          domain={[min, max]}
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          tickLine={false}
          axisLine={false}
          width={28}
          tickCount={5}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avg}
          stroke="var(--accent)"
          strokeDasharray="4 3"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
        <Line
          type="monotone"
          dataKey="rating"
          stroke="var(--accent)"
          strokeWidth={1.5}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--bg-base)', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
