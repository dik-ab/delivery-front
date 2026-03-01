import './MatchCard.css'

function MatchCard({ match, onApprove, onReject, onComplete, showActions = true }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      completed: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: '待機中',
      approved: '承認済み',
      rejected: '拒否',
      completed: '完了'
    }
    return labels[status] || status
  }

  return (
    <div className="match-card">
      <div className="match-card-header">
        <div className="match-title">
          <h3>{match.trip?.origin} → {match.trip?.destination}</h3>
          <span
            className="match-status"
            style={{ backgroundColor: getStatusColor(match.status) }}
          >
            {getStatusLabel(match.status)}
          </span>
        </div>
      </div>

      <div className="match-card-body">
        <div className="match-row">
          <span className="match-label">便ID:</span>
          <span className="match-value">#{match.trip?.id}</span>
        </div>

        <div className="match-row">
          <span className="match-label">出発日時:</span>
          <span className="match-value">
            {match.trip?.departure_time && new Date(match.trip.departure_time).toLocaleString('ja-JP')}
          </span>
        </div>

        <div className="match-grid">
          <div className="match-item">
            <span className="match-label">積載予定重量</span>
            <span className="match-value">{match.cargo_weight}kg</span>
          </div>
          <div className="match-item">
            <span className="match-label">マッチング料金</span>
            <span className="match-value">¥{match.matched_price?.toLocaleString()}</span>
          </div>
        </div>

        {match.shipper && (
          <div className="match-party-info">
            <span className="party-label">荷主:</span>
            <span className="party-name">{match.shipper.name}</span>
            {match.shipper.company && (
              <span className="party-company">({match.shipper.company})</span>
            )}
          </div>
        )}

        {match.driver && (
          <div className="match-party-info">
            <span className="party-label">ドライバー:</span>
            <span className="party-name">{match.driver.name}</span>
            {match.driver.company && (
              <span className="party-company">({match.driver.company})</span>
            )}
          </div>
        )}

        {match.cargo_description && (
          <div className="match-description">
            <p><strong>荷物説明:</strong> {match.cargo_description}</p>
          </div>
        )}

        {match.message && (
          <div className="match-message">
            <p><strong>メッセージ:</strong> {match.message}</p>
          </div>
        )}

        {showActions && match.status === 'pending' && (
          <div className="match-actions">
            {onApprove && (
              <button className="btn-approve" onClick={onApprove}>
                承認
              </button>
            )}
            {onReject && (
              <button className="btn-reject" onClick={onReject}>
                拒否
              </button>
            )}
          </div>
        )}

        {showActions && match.status === 'approved' && onComplete && (
          <div className="match-actions">
            <button className="btn-complete" onClick={onComplete}>
              完了
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchCard
