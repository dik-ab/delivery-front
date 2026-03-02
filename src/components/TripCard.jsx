import { Link } from 'react-router-dom'
import './TripCard.css'

function TripCard({ trip, onClick = null, onMapClick = null, isSelected = false }) {
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

  const originAddr = trip.origin_address || trip.origin
  const destAddr = trip.destination_address || trip.destination
  const departureTime = trip.departure_at || trip.departure_time

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  const handleMapClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onMapClick) onMapClick()
  }

  return (
    <Link
      to={`/trips/${trip.id}`}
      className={`trip-card ${isSelected ? 'trip-card-selected' : ''}`}
      onClick={handleClick}
    >
      <div className="trip-card-header">
        <div className="trip-info-top">
          <h3 className="trip-destination">
            {originAddr} → {destAddr}
          </h3>
          <div className="trip-header-actions">
            {onMapClick && (
              <button
                className="btn-map-preview"
                onClick={handleMapClick}
                title="ルートを地図で見る"
              >
                🗺️
              </button>
            )}
            <span
              className="trip-status"
              style={{ backgroundColor: getStatusColor(trip.status) }}
            >
              {getStatusLabel(trip.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="trip-card-body">
        <div className="trip-row">
          <span className="trip-label">出発地:</span>
          <span className="trip-value">{originAddr}</span>
        </div>
        <div className="trip-row">
          <span className="trip-label">到着地:</span>
          <span className="trip-value">{destAddr}</span>
        </div>

        <div className="trip-grid">
          <div className="trip-item">
            <span className="trip-label">出発日時</span>
            <span className="trip-value">{departureTime ? new Date(departureTime).toLocaleString('ja-JP') : '-'}</span>
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
