import './StatsCard.css'

function StatsCard({ icon, label, value, color = 'blue' }) {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <p className="stats-label">{label}</p>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  )
}

export default StatsCard
