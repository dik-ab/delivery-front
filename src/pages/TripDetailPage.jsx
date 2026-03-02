import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { useMatches } from '../hooks/useMatches'
import { useAuth } from '../hooks/useAuth'
import MatchCard from '../components/MatchCard'
import TripRouteMap from '../components/TripRouteMap'
import './TripDetailPage.css'

function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trips } = useTrips()
  const { createMatch, approveMatch, rejectMatch } = useMatches()
  const { user } = useAuth()

  const trip = trips.find((t) => t.id === id)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [matchFormData, setMatchFormData] = useState({
    cargo_weight: '',
    cargo_description: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!trip) {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-container">
          <p className="not-found">便が見つかりません</p>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    )
  }

  const isDriver = trip.driver_id === user?.id
  const isShipper = user?.role === 'shipper'
  const tripMatches = trip.matches || []

  const handleMatchFormChange = (e) => {
    const { name, value } = e.target
    setMatchFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRequestMatch = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createMatch({
        trip_id: trip.id,
        shipper_id: user.id,
        cargo_weight: parseInt(matchFormData.cargo_weight),
        cargo_description: matchFormData.cargo_description,
        message: matchFormData.message,
        matched_price: trip.price
      })

      setShowMatchForm(false)
      setMatchFormData({
        cargo_weight: '',
        cargo_description: '',
        message: ''
      })
      alert('マッチングリクエストを送信しました')
    } catch (err) {
      setError(err.message || 'リクエストの送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveMatch = async (matchId) => {
    try {
      await approveMatch(matchId)
      alert('マッチングを承認しました')
    } catch (err) {
      alert(err.message || 'エラーが発生しました')
    }
  }

  const handleRejectMatch = async (matchId) => {
    try {
      await rejectMatch(matchId)
      alert('マッチングを拒否しました')
    } catch (err) {
      alert(err.message || 'エラーが発生しました')
    }
  }

  return (
    <div className="trip-detail-page">
      <div className="trip-detail-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← 戻る
        </button>

        <div className="trip-detail-header">
          <h1>{trip.origin_address || trip.origin} → {trip.destination_address || trip.destination}</h1>
          <span
            className="trip-detail-status"
            style={{
              backgroundColor: getStatusColor(trip.status)
            }}
          >
            {getStatusLabel(trip.status)}
          </span>
        </div>

        <div className="trip-detail-grid">
          {/* Main Information */}
          <div className="trip-detail-main">
            <section className="detail-section">
              <h2>ルート情報</h2>
              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">出発地</span>
                  <span className="info-value">{trip.origin_address || trip.origin}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">到着地</span>
                  <span className="info-value">{trip.destination_address || trip.destination}</span>
                </div>
              </div>

              {/* ルートマップ */}
              {trip.origin_lat && trip.destination_lat && (
                <TripRouteMap
                  origin={{ lat: trip.origin_lat, lng: trip.origin_lng }}
                  destination={{ lat: trip.destination_lat, lng: trip.destination_lng }}
                  originLabel={trip.origin_address || trip.origin}
                  destinationLabel={trip.destination_address || trip.destination}
                />
              )}
            </section>

            <section className="detail-section">
              <h2>日時・価格</h2>
              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">出発日時</span>
                  <span className="info-value">
                    {new Date(trip.departure_at || trip.departure_time).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">料金</span>
                  <span className="info-value">¥{trip.price?.toLocaleString()}</span>
                </div>
                {trip.delay_minutes && (
                  <div className="info-row">
                    <span className="info-label">想定遅延</span>
                    <span className="info-value">{trip.delay_minutes}分</span>
                  </div>
                )}
              </div>
            </section>

            <section className="detail-section">
              <h2>車両・積載</h2>
              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">車両タイプ</span>
                  <span className="info-value">{trip.vehicle_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">利用可能重量</span>
                  <span className="info-value">{trip.available_weight}kg</span>
                </div>
              </div>
            </section>

            {trip.note && (
              <section className="detail-section">
                <h2>備考</h2>
                <p className="trip-note">{trip.note}</p>
              </section>
            )}

            {/* Driver Information */}
            {trip.driver && (
              <section className="detail-section">
                <h2>ドライバー情報</h2>
                <div className="driver-card">
                  <div className="driver-name">{trip.driver.name}</div>
                  {trip.driver.company && (
                    <div className="driver-company">{trip.driver.company}</div>
                  )}
                  {trip.driver.phone && (
                    <div className="driver-phone">{trip.driver.phone}</div>
                  )}
                </div>
              </section>
            )}

            {/* Matches Section for Driver */}
            {isDriver && tripMatches.length > 0 && (
              <section className="detail-section">
                <h2>マッチングリクエスト ({tripMatches.length})</h2>
                <div className="matches-list">
                  {tripMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onApprove={() => handleApproveMatch(match.id)}
                      onReject={() => handleRejectMatch(match.id)}
                      showActions={match.status === 'pending'}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar for Shipper */}
          {isShipper && (
            <div className="trip-detail-sidebar">
              {!showMatchForm ? (
                <button
                  className="btn-match-request"
                  onClick={() => setShowMatchForm(true)}
                >
                  マッチングリクエスト
                </button>
              ) : (
                <form className="match-form" onSubmit={handleRequestMatch}>
                  <h3>マッチングリクエスト</h3>

                  {error && <div className="form-error">{error}</div>}

                  <div className="form-group">
                    <label htmlFor="cargo_weight">荷物の重量 (kg) *</label>
                    <input
                      id="cargo_weight"
                      type="number"
                      name="cargo_weight"
                      value={matchFormData.cargo_weight}
                      onChange={handleMatchFormChange}
                      placeholder="500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cargo_description">荷物の説明 (任意)</label>
                    <textarea
                      id="cargo_description"
                      name="cargo_description"
                      value={matchFormData.cargo_description}
                      onChange={handleMatchFormChange}
                      placeholder="荷物の内容を説明してください"
                      rows="3"
                      disabled={loading}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">メッセージ (任意)</label>
                    <textarea
                      id="message"
                      name="message"
                      value={matchFormData.message}
                      onChange={handleMatchFormChange}
                      placeholder="ドライバーへのメッセージ"
                      rows="3"
                      disabled={loading}
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowMatchForm(false)}
                      disabled={loading}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? '送信中...' : 'リクエストを送信'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status) {
  const colors = {
    open: '#3b82f6',
    matched: '#eab308',
    in_transit: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444'
  }
  return colors[status] || '#6b7280'
}

function getStatusLabel(status) {
  const labels = {
    open: '募集中',
    matched: 'マッチ済み',
    in_transit: '輸送中',
    completed: '完了',
    cancelled: 'キャンセル'
  }
  return labels[status] || status
}

export default TripDetailPage
