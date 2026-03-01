import { Link } from 'react-router-dom'
import './TripCard.css'

function TripCard({ trip, onClick = null }) {
  const getStatusColor = (status) => {
    const colors = {
      open: '#3b82f6',
      matched: '#eab308',
      in_transit: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusLabel = (status) => {
    const labels = {
      open: '募集中',
      matched: 'マッチ済み',
      in_transit: '輸送中',
      completed: '完了',
      cancelled: 'キャンセル'
    }
    return labels[status] || status
  }

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="trip-card"
      onClick={handleClick}
    >
      <div className="trip-card-header">
        <div className="trip-info-top">
          <h3 className="trip-destination">
            {trip.origin} → {trip.destination}
          </h3>
          <span
            className="trip-status"
            style={{ backgroundColor: getStatusColor(trip.status) }}
          >
            {getStatusLabel(trip.status)}
          </span>
        </div>
      </div>

      <div className="trip-card-body">
        <div className="trip-row">
          <span className="trip-label">出発地:</span>
          <span className="trip-value">{trip.origin}</span>
        </div>
        <div className="trip-row">
          <span className="trip-label">到着地:</span>
          <span className="trip-value">{trip.destination}</span>
        </div>

        <div className="trip-grid">
          <div className="trip-item">
            <span className="trip-label">出発日時</span>
            <span className="trip-value">{new Date(trip.departure_time).toLocaleString('ja-JP')}</span>
          </div>
          <div className="trip-item">
            <span className="trip-label">積載量</span>
            <span className="trip-value">{trip.available_weight}kg</span>
          </div>
          <div className="trip-item">
            <span className="trip-label">車両タイプ</span>
            <span className="trip-value">{trip.vehicle_type}</span>
          </div>
          <div className="trip-item">
            <span className="trip-label">料金</span>
            <span className="trip-value">¥{trip.price?.toLocaleString()}</span>
          </div>
        </div>

        {trip.driver && (
          <div className="trip-driver-info">
            <span className="driver-label">ドライバー:</span>
            <span className="driver-name">{trip.driver.name}</span>
            {trip.driver.company && (
              <span className="driver-company">({trip.driver.company})</span>
            )}
          </div>
        )}

        {trip.note && (
          <div className="trip-note">
            <p>{trip.note}</p>
          </div>
        )}
      </div>
    </Link>
  )
}

export default TripCard
